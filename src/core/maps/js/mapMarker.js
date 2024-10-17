import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import store from "../../../app-store";

/**
 * Create the map markers and add them to the map.
 * @param {Object} mapMarker The mapMarker config of config.json file.
 * @returns {void}
 */
function initializeMapMarkers (mapMarker) {
    store.dispatch("Maps/addLayer", createMapMarker("POINT", mapMarker?.pointStyleId));
    store.dispatch("Maps/addLayer", createMapMarker("POLYGON", mapMarker?.polygonStyleId));
}

/**
 * Create the map marker vector layers.
 * The geometries POINT and POLYGON are available.
 * @param {String} geometryType The geometry type of the map marker.
 * @param {String} styleId The style id for the map marker style.
 * @returns {ol/layer/Vector} The vector layer for the map marker.
 */
function createMapMarker (geometryType, styleId) {
    const mapMarker = getCreateFunctionByType(geometryType)(styleId);

    return mapMarker;
}

/**
 * Returns the create function for the given geometry type.
 * @param {String} geometryType The geometry type of the map marker.
 * @returns {Function} The create function for the given geometry type.
 */
function getCreateFunctionByType (geometryType) {
    const markerTypes = {
        POINT: createPointMarker,
        POLYGON: createPolygonMarker
    };

    return markerTypes[geometryType];
}

/**
 * Creates a vector layer for the point map marker.
 * @param {String} [styleId="defaultMapMarkerPoint"] The style id for the point map marker style.
 * @returns {ol/layer/Vector} The vector layer for the point map marker.
 */
function createPointMarker (styleId = "defaultMapMarkerPoint") {
    return new VectorLayer({
        altitudeMode: "absolute",
        alwaysOnTop: true,
        id: "marker_point_layer",
        name: "markerPoint",
        source: new VectorSource(),
        styleId: styleId,
        visible: true
    });
}


/**
 * Creates a vector layer for the polygon map marker.
 * @param {String} [styleId="defaultMapMarkerPolygon"] The style id for the polygon map marker style.
 * @returns {ol/layer/Vector} The vector layer for the polygon map marker.
 */
function createPolygonMarker (styleId = "defaultMapMarkerPolygon") {
    return new VectorLayer({
        altitudeMode: "relativeToGround",
        alwaysOnTop: true,
        id: "marker_polygon_layer",
        name: "markerPolygon",
        source: new VectorSource(),
        styleId: styleId,
        visible: true
    });
}

/**
 * Adds a feature to the map marker by layer id.
 * @param {String} layerId The layer id of the map marker.
 * @param {ol/Feature} feature The ol feature that is added to the map.
 * @returns {void}
 */
function addFeatureToMapMarkerLayer (layerId, feature) {
    const markerLayer = getMapmarkerLayerById(layerId),
        styleId = markerLayer.get("styleId"),
        styleObject = styleList.returnStyleObject(styleId),
        featureStyle = createStyle.createStyle(styleObject, feature, false, Config.wfsImgPath);

    feature.setStyle(featureStyle);
    markerLayer.getSource().addFeature(feature);
}

/**
 * Removes the features from the map marker by id from the map.
 * @param {String} layerId The layer id of the map marker.
 * @returns {void}
 */
function removeMapMarker (layerId) {
    const markerLayer = getMapmarkerLayerById(layerId),
        markerLayerSource = markerLayer.getSource(),
        features = markerLayerSource.getFeatures();

    features.forEach((feature) => {
        // unset the style otherwise the feature will remain on the map
        feature.setStyle();
    });

    markerLayer.getSource().clear();
}

/**
 * Returns the map marker layer by id.
 * @param {String} layerId The layer id of the map marker.
 * @returns {ol/layer/Vector} The map marker layer.
 */
function getMapmarkerLayerById (layerId) {
    return mapCollection.getMap("2D")?.getLayers().getArray()?.find(layer => layer.get("id") === layerId);
}


export default {
    initializeMapMarkers,
    createMapMarker,
    addFeatureToMapMarkerLayer,
    removeMapMarker,
    getMapmarkerLayerById
};
