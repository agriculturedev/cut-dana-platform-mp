import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import featureListerState from "./stateFeatureLister";
import layerCollection from "../../../core/layers/js/layerCollection";

const simpleGetters = {
    ...generateSimpleGetters(featureListerState),

    /**
     * Returns the feature to the given index in the list of gfiFeatures.
     * Clustering is respected.
     * @param {Object} state state of this module
     * @param {Number} featureIndex index of the feature in the list of gfiFeatures
     * @returns {ol.feature} the feature to the given index
     */
    selectedFeature: state => featureIndex => {
        const layer = layerCollection.getLayerById(state.layer.id),
            featureId = state.gfiFeaturesOfLayer[featureIndex]?.id;

        return layer.getLayerSource().getFeatureById(featureId)
    || layer.getLayerSource().getFeatures().find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
    },
    /**
     * Builds and returns a two-dimensional array that contains value lists per feature based on the header
     * @param {Object} state state of this module
     * @returns {Array} [[a1, b1], [a2, b2], ...] array for each line containing array for each property of the header
     */
    featureProperties: state => {
        return state.gfiFeaturesOfLayer
            .map(feature => feature.getProperties())
            .map(properties => state.headers.map(({key}) => properties[key] ?? ""));
    },
    /**
     * The v-for calls this function for every property of the selected feature and returns pairs of header and
     * value as an array
     * @param {Object} state state of this module
     * @param {Object} getters getters of this module
     * @param {Object} rootState root state
     * @param {Object} rootGetters root getters
     * @returns {Array} [header, value] for each property of the selected feature
     */
    featureDetails: (state, getters, rootState, rootGetters) => {
        const gfiFeature = state.gfiFeaturesOfLayer[state.selectedFeatureIndex],
            attributesToShow = gfiFeature.getAttributesToShow(),
            featureProperties = gfiFeature.getProperties();

        return attributesToShow === "showAll"
            ? Object.entries(featureProperties)
                .filter(([key, value]) => value && !rootGetters.ignoredKeys.includes(key.toUpperCase()))
            : Object.entries(attributesToShow)
                .filter(([key]) => featureProperties[key])
                .map(([key, value]) => [value, featureProperties[key]]);
    },
    /**
     * Gets a list of all property keys to show in a table header.
     * @param {Object} state state of this module
     * @param {Object} getters getters of this module
     * @param {Object} rootState root state
     * @param {Object} rootGetters root getters
     * @returns {Array} [key, value] for each property
     */
    headers: (state, getters, rootState, rootGetters) => {
        const headers = Object.entries(state.gfiFeaturesOfLayer
            .reduce((acc, it) => {
                let keys = it.getAttributesToShow();

                keys = keys === "showAll"
                    ? Object.keys(it.getProperties()).map(prop => [prop, prop])
                    : Object.entries(keys);
                keys.forEach(([key, value]) => {
                    if (!rootGetters.ignoredKeys.includes(key.toUpperCase())) {
                        if (typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "name")) {
                            acc[key] = value.name;
                        }
                        else {
                            acc[key] = value;
                        }
                    }
                });
                return acc;
            }, {})).map(([key, value]) => ({key, value}));

        state.headers = headers;
        return headers;
    },
    /**
     * Returns the geometry type of the layer.
     * @param {Object} state state of this module
     * @returns {String} the geometry type of the layer.
     */
    getGeometryType: state => {
        if (state.layer.geometryType) {
            return state.layer.geometryType;
        }
        const layer = layerCollection.getLayerById(state.layer.id),
            features = layer.getLayerSource().getFeatures();

        if (features.length > 0) {
            return features[0].getGeometry().getType();
        }
        console.warn("Fails to highlighting feature: no geometry type for layer ", state.layer.id);
        return null;
    }
};

export default simpleGetters;
