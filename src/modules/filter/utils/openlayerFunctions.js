import store from "../../../app-store";
import {intersects} from "ol/extent.js";
import LayerGroup from "ol/layer/Group";
import isObject from "../../../shared/js/utils/isObject";
import layerCollection from "../../../core/layers/js/layerCollection";
import Cluster from "ol/source/Cluster";

/**
 * Returns the map projection.
 * @returns {String} the projection
 */
function getMapProjection () {
    return store.getters["Maps/projection"].getCode();
}

/**
 * Returns all features of a layer specified with the given layerId.
 * @param {String} layerId the id of the layer
 * @returns {ol/Feature[]} the features
 */
function getFeaturesByLayerId (layerId) {
    let layer = layerCollection.getLayerById(layerId);

    if (!layer || !layer.getLayer()) {
        return [];
    }

    /**
     * @todo should be default
     * accessing a stable features list on the layer model is more sensible
     * avoids styling and clustering issues
     */
    if (layer.features) {
        return layer.features;
    }
    if (layer.getLayer().getSource() instanceof Cluster) {
        return layer.getLayer().getSource().getSource().getFeatures();
    }
    // not sure how to handle those just yet
    if (layer.getLayer() instanceof LayerGroup) {
        const layerSource = layer.getLayerSource();

        layerSource.forEach(childLayer => {
            if (childLayer.id === layerId) {
                layer = childLayer;
            }
        });
        // could also work through hosting the features on the layer model
        return layer.getLayer().getSource().getFeatures();
    }

    return layer.getLayer().getSource().getFeatures();
}
/**
 * Gets the features of a vector tile layer by layer id and the collection.
 * @param {Number} layerId The layerId to get the model by.
 * @returns {ol/render/Feature[]} The features of the layer in current extent.
 */
function getVectorTileFeaturesByLayerId (layerId) {
    if (typeof layerId === "undefined") {
        return [];
    }
    const layerModel = layerCollection.getLayerById(layerId);

    return layerModel.layerSource.getFeaturesInExtent(store.getters["Maps/extent"]);
}

/**
 * Returns the current browser extent.
 * @returns {ol/Extent} The current browser extent.
 */
function getCurrentExtent () {
    return store.getters["Maps/extent"];
}

/**
 * Checks if the given feature is in the current map extent of the browser.
 * @param {ol/Feature} feature the feature to check
 * @returns {Boolean} true if the feature is in the current map extent of the browser
 */
function isFeatureInMapExtent (feature) {
    const mapExtent = getCurrentExtent();

    return intersects(mapExtent, feature.getGeometry().getExtent());
}

/**
 * Checks if the given geometry intersects with the extent of the given feature.
 * @param {ol/Feature} feature the feature to check
 * @param {ol/Geometry} geometry the geometry to intersect with
 * @returns {Boolean} true if the feature intersects the geometry
 */
function isFeatureInGeometry (feature, geometry) {
    if (typeof geometry?.intersectsExtent !== "function" || !isObject(feature)) {
        return false;
    }
    return geometry.intersectsExtent(feature.getGeometry().getExtent());
}

/**
 * Returns the layer for the given layerId.
 * @param {String} layerId the id of the layer
 * @returns {ol/Layer} the layer
 */
function getLayerByLayerId (layerId) {
    return store.getters.layerConfigById(layerId);
}

/**
 * Shows the features with the given ids on the given layer
 * @param {String} layerId the id of the layer
 * @param {String[]} ids a list of feature ids
 * @returns {void}
 */
function showFeaturesByIds (layerId, ids) {
    const layer = layerCollection.getLayerById(layerId);

    layer.showFeaturesByIds(ids);
}

/**
 * Zooms to an extent of a feature considering the min scale.
 * @param {Number} minScale the minimum scale
 * @param {String[]} featureIds the filtered feature Ids
 * @param {String} layerId the layer Id
 * @param {Function} callback the callback to call when zoom has finished
 * @returns {void}
 */
function zoomToFilteredFeatures (minScale, featureIds, layerId, callback) {
    const minResolution = store.getters["Maps/getResolutionByScale"](minScale);

    store.dispatch("Maps/zoomToFilteredFeatures", {ids: featureIds, layerId: layerId, zoomOptions: {
        minResolution,
        callback
    }});
}

/**
 * Zooms to an extent of a feature considering the min scale.
 * @param {ol/Extent} extent The extent to zoom to.
 * @param {Number} minScale the minimum scale
 * @param {Function} callback the callback to call when zoom has finished
 * @returns {void}
 */
function zoomToExtent (extent, minScale, callback) {
    const minResolution = store.getters["Maps/getResolutionByScale"](minScale);

    store.dispatch("Maps/zoomToExtent", {extent, options: {
        minResolution,
        callback
    }});
}

/**
 * changes visibility of the layer to true so its shown in the map.
 * @param {String} layerId the layer Id
 * @returns {void}
 */
function changeLayerVisibility (layerId) {
    const layer = store.getters.layerConfigById(layerId);

    store.dispatch("replaceByIdInLayerConfig", {
        layerConfigs: [{
            id: layer.id,
            layer: {
                id: layer.id,
                visibility: true
            }
        }]
    });
}

/**
 * Sets the given value at the key position of the layer configuration.
 * This affects only the parser and not the layer if it already exists.
 * Use this function to manipulate the layer config before layer creation.
 * @param {String} layerId the layer Id
 * @param {String} key the config key to change
 * @param {*} value the value to change the old value to
 * @returns {void}
 */
function setParserAttributeByLayerId (layerId, key, value) {
    const lightModels = store.getters.layerConfigById(layerId);

    if (!isObject(lightModels)) {
        return;
    }
    lightModels[key] = value;
    store.dispatch("replaceByIdInLayerConfig", {
        layerConfigs: [{
            id: layerId,
            layer: lightModels
        }]
    });
}

/**
 * Returns all current layers.
 * @returns {ol/Layer[]} a list of layers
 */
function getLayers () {
    return store.getters.allLayerConfigs;
}

export default {
    getMapProjection,
    getFeaturesByLayerId,
    getVectorTileFeaturesByLayerId,
    getLayerByLayerId,
    getCurrentExtent,
    isFeatureInMapExtent,
    isFeatureInGeometry,
    zoomToFilteredFeatures,
    zoomToExtent,
    showFeaturesByIds,
    changeLayerVisibility,
    setParserAttributeByLayerId,
    getLayers
};
