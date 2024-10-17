
import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import modeler3DState from "./stateModeler3D";
import {convertSexagesimalFromDecimal, convertSexagesimalToDecimal} from "../../../shared/js/utils/convertSexagesimalCoordinates";
/**
 * The getters for the modeler3D module.
 * @module modules/modeler3D/store/gettersModeler3D
 */
export default {
    ...generateSimpleGetters(modeler3DState),

    // NOTE overwrite getters here if you need a special behaviour in a getter
    /**
     * Returns the Model name of the corresponding id.
     * @param {Object} state state of this tool
     * @param {String} id of the model
     * @returns {String} the model name of the entity.
     */
    getModelNameById: state => (id) => {
        const allModels = state.importedModels.concat(state.drawnModels),
            model = allModels.find(x => x.id === id);

        return model.name;
    },
    /**
     * Returns the projection to the given id.
     * @param {Object} state state of this tool
     * @param {String} id of the projection, is like the name and in case of decimal "-DG" is appended to name
     * @returns {Object} projection
     */
    getProjectionById: state => (id) => {
        return state.projections.find(projection => projection.id === id);
    },
    /**
     * Returns the label name depending on the selected coordinate system.
     * @param {Object} state state of this tool
     * @param {String} key in the language files
     * @returns {String} the name of the label
     */
    getLabel: (state) => (key) => {
        const type = state.currentProjection?.projName !== "longlat" ? "cartesian" : "hdms";

        return "modules.modeler3D.entity.projections." + type + "." + key;
    },
    /**
     * Returns the value to increment the current coordinate with depending on the selected coordinate system.
     * @param {Object} state state of this tool
     * @param {Object} coordOptions the options to calculate the value
     * @returns {Number} the value to increment with
     */
    coordAdjusted: (state) => ({shift, coordType}) => {
        if (state.currentProjection.epsg !== "EPSG:4326" || coordType === "height") {
            return shift ? 1 : 0.1;
        }
        return shift ? 0.00001 : 0.000001;
    },
    /**
     * Returns the coordinate without postfixes
     * @param {Object} state state of this tool
     * @param {String} coord the coord string
     * @returns {String} formatted coord
     */
    formatCoord: (state) => (coord) => {
        if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
            return parseFloat(coord.split(/[\s°]+/)[0]);
        }
        else if (state.currentProjection.projName === "longlat") {
            return convertSexagesimalToDecimal([coord.split(/[\s°′″'"´`]+/), "0"])[1];
        }
        return parseFloat(coord);
    },
    /**
     * Returns the formatted coordinate with postfixes
     * @param {Object} state state of this tool
     * @param {Number} coord the coord string
     * @returns {String} formatted coord
     */
    prettyCoord: (state) => (coord) => {
        if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
            return coord.toFixed(6) + "°";
        }
        else if (state.currentProjection.projName === "longlat") {
            return convertSexagesimalFromDecimal(coord);
        }
        return coord.toFixed(2);
    },
    /**
     * Returns the center cartesian position of a given polygon
     * @param {Cesium.Entity} polygon the polygon
     * @returns {Cesium.Cartesian3} the Cartesian center position
     */
    getCenterFromGeometry: () => (geometry) => {
        if (!geometry) {
            return undefined;
        }
        let positions;

        if (geometry.polygon) {
            positions = geometry.polygon.hierarchy.getValue().positions;
        }
        else if (geometry.polyline) {
            positions = geometry.polyline.positions.getValue();
        }
        else {
            return undefined;
        }

        const center = positions.reduce(
            (sum, position) => {
                Cesium.Cartesian3.add(sum, position, sum);
                return sum;
            },
            {x: 0, y: 0, z: 0}
        );

        Cesium.Cartesian3.divideByScalar(center, positions.length, center);

        return center;
    },
    wasDrawn (state) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

        return entities?.getById(state.currentModelId)?.wasDrawn;
    },
    getEntityType: () => (entity) => {
        if (entity.polygon) {
            return "polygon";
        }
        if (entity.polyline) {
            return "line";
        }
        if (entity.model) {
            return "model";
        }
        return undefined;
    },
    drawnEntities () {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            drawnEntitiesCollection = [],
            jsonGlob = {
                type: "FeatureCollection",
                features: []
            },
            features = [];

        entities.values.forEach(entity => {
            if (!entity.model && !entity.cylinder && !entity.outline && !entity.label) {
                drawnEntitiesCollection.push(entity);
            }
        });

        drawnEntitiesCollection.forEach(entity => {
            const geometry = entity.polygon ? entity.polygon : entity.polyline,
                positions = entity.polygon ? entity.polygon.hierarchy.getValue().positions : entity.polyline.positions.getValue(),
                color = geometry.material.color.getValue(),
                outlineColor = geometry.outlineColor?.getValue(),
                feature = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: entity.polygon ? "Polygon" : "Polyline",
                        coordinates: [[]]
                    }};

            positions.forEach(position => {
                const cartographic = Cesium.Cartographic.fromCartesian(position),
                    longitude = Cesium.Math.toDegrees(cartographic.longitude),
                    latitude = Cesium.Math.toDegrees(cartographic.latitude),
                    altitude = entity.polygon ? geometry.height.getValue() : cartographic.height,
                    coordXY = [Number(longitude), Number(latitude), Number(altitude)];

                feature.geometry.coordinates[0].push(coordXY);
            });

            feature.properties.name = entity.name;
            feature.properties.clampToGround = entity.clampToGround;
            feature.properties.color = color;

            if (entity.polygon) {
                feature.properties.rectangle = entity.polygon?.rectangle;
                feature.properties.outlineColor = outlineColor;
                feature.properties.extrudedHeight = geometry.extrudedHeight.getValue();
            }
            else if (entity.polyline) {
                feature.properties.width = geometry.width.getValue();
            }

            features.push(feature);
        });

        jsonGlob.features = features;

        return jsonGlob;
    }
};
