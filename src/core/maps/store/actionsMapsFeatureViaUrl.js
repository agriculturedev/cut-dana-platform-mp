import crs from "@masterportal/masterportalapi/src/crs";

import {treeSubjectsKey} from "../../../shared/js/utils/constants";

const gfiAttributes = {
    featureLabel: "",
    coordLabel: "",
    typeLabel: ""
};

/**
 * Creates a basic GeoJSON structure and adds the features given by the user from the URL to it.
 * If another projection than "EPSG:4326" is configured, the coordinates get transformed according
 * to this projection, otherwise the features will not get displayed correctly.
 * @param {Object[]} features The features given by the user to be added to the map.
 * @param {String} geometryType Geometry type of the given features.
 * @param {Number} [epsg=4326] The EPSG-Code in which the features are coded.
 * @returns {Object} GeoJSON containing the features.
 */
export function createGeoJSON (features, geometryType, epsg = 4326) {
    const geoJSON = {
        type: "FeatureCollection",
        crs: {
            type: "link",
            properties: {
                href: "http://spatialreference.org/ref/epsg/" + epsg + "/proj4/",
                type: "proj4"
            }
        },
        features: []
    };
    let coordinates,
        featureJSON,
        flag = false;

    features.forEach(feature => {
        coordinates = epsg === 4326 ? feature.coordinates : crs.transform("EPSG:" + epsg, "EPSG:4326", feature.coordinates);
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0 || !feature.label) {
            flag = true;
            return;
        }

        featureJSON = {
            type: "Feature",
            geometry: {
                type: geometryType,
                coordinates: coordinates
            },
            properties: {
                featureLabel: feature.label,
                coordLabel: coordinates,
                typeLabel: geometryType
            }
        };
        geoJSON.features.push(featureJSON);
    });

    if (flag) {
        console.warn(i18next.t("common:core.maps.featureViaURL.messages.featureParsing"));
    }

    return geoJSON;
}

/**
 * Gets the layer for the given layerId and extracts the Ids of the features.
 *
 * @param {String} layerId Unique Id of the layer in which the features reside.
 * @returns {String[]} Array of FeatureIds.
 */
export function getFeatureIds (layerId) {
    const featureArray = [],
        layer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === layerId);

    if (typeof layer === "undefined") {
        console.warn(i18next.t("common:core.maps.featureViaURL.messages.layerNotFound"));
        return featureArray;
    }
    layer.getSource().getFeatures().forEach(feature => {
        featureArray.push(feature.getId());
    });
    return featureArray;
}

/**
 * Create features with url param.
 */
export default {
    /**
     * Creates a basic GeoJSON structure and adds the features given by the user from the URL to it.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object[]} urlLayers The layer attributes from url.
     * @returns {void}
     */
    featureViaUrl ({dispatch, rootGetters}, urlLayers) {
        const {layers, epsg, zoomTo} = rootGetters.featureViaURL;
        let geoJSON,
            geometryType;

        if (layers) {
            urlLayers.forEach(layer => {
                const layerId = layer.layerId,
                    features = layer.features,
                    pos = layers?.findIndex(element => element.id === layerId);

                if (pos === -1) {
                    console.error(i18next.t("common:core.maps.featureViaURL.messages.layerNotFound", {layerId}));
                    return;
                }
                if (!layers[pos].name) {
                    console.error(i18next.t("common:core.maps.featureViaURL.messages.noNameDefined", {layerId}));
                    return;
                }
                geometryType = layer.type !== undefined ? layer.type : layers[pos].geometryType;
                if (geometryType !== "LineString" && geometryType !== "Point" && geometryType !== "Polygon" && geometryType !== "MultiPoint" && geometryType !== "MultiLineString" && geometryType !== "MultiPolygon") {
                    console.error(i18next.t("common:core.maps.featureViaURL.messages.geometryNotSupported"), {layerId, geometryType});
                    return;
                }
                if (!features || !Array.isArray(features) || features.length === 0) {
                    dispatch("Alerting/addSingleAlert", {content: i18next.t("common:core.maps.featureViaURL.messages.featureParsingAll"), "multipleAlert": true}, {root: true});
                    return;
                }
                geoJSON = createGeoJSON(features, geometryType, epsg);
                if (geoJSON.features.length === 0) {
                    dispatch("Alerting/addSingleAlert", {content: i18next.t("common:core.maps.featureViaURL.messages.featureParsingNoneAdded"), "multipleAlert": true}, {root: true});
                }

                dispatch("createVectorLayer", {layers, pos, geoJSON});

                if (typeof zoomTo !== "undefined" && (zoomTo === layerId || zoomTo.indexOf(layerId) !== -1)) {
                    dispatch("zoomToFilteredFeatures", {ids: getFeatureIds(layerId), layerId: layerId});
                }
            });
        }

    },

    /**
     * Creates a vector layer.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object[]} layers The layer attributes.
     * @param {Number} pos The position of the layer in layers.
     * @param {Object} geoJSON The geoJSON with features.
     * @returns {void}
    */
    createVectorLayer ({dispatch}, {layers, pos, geoJSON}) {
        dispatch("addLayerToLayerConfig", {
            layerConfig: {
                gfiAttributes: layers[pos].gfiAttributes || gfiAttributes,
                geojson: geoJSON,
                id: layers[pos].id,
                name: layers[pos].name,
                showInLayerTree: true,
                styleId: layers[pos].styleId,
                typ: "GEOJSON",
                type: "layer",
                visibility: true
            },
            parentKey: treeSubjectsKey
        }, {root: true});
    }
};
