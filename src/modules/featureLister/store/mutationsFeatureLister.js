import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateFeatureLister from "./stateFeatureLister";
import getGfiFeatureModule from "../../../shared/js/utils/getGfiFeaturesByTileFeature";
import layerCollection from "../../../core/layers/js/layerCollection";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateFeatureLister),
    /**
     * Sets the compare List.
     * @param {Object} state context object.
     * @returns {void}
     */
    setGfiFeaturesOfLayer: (state) => {
        const layer = layerCollection.getLayerById(state.layer.id),
            features = layer.getLayerSource().getFeatures();

        if (features) {
            const gfiFeatures = [],
                olLayer = layer.getLayer();

            features.forEach(feature => {
                if (feature.values_ && Object.prototype.hasOwnProperty.call(feature.values_, "features")) {
                    feature.values_.features.forEach(nestedFeature => {
                        const gfiFeature = getGfiFeatureModule.getGfiFeature(olLayer.values_, nestedFeature.values_);

                        gfiFeature.id = nestedFeature.getId();
                        gfiFeatures.push(gfiFeature);
                    });
                    state.nestedFeatures = true;
                }
                else {
                    const gfiFeature = getGfiFeatureModule.getGfiFeature(olLayer.values_, feature.values_);

                    gfiFeature.id = feature.getId();
                    gfiFeatures.push(gfiFeature);
                    state.nestedFeatures = false;
                }
            });
            state.gfiFeaturesOfLayer = gfiFeatures;
        }
    },
    /**
     * Resets the featureLister to the themeChooser tab by setting the
     * selected layer and feature to null, making their respective tabs
     * disabled.
     * @param {Object} state context object.
     * @returns {void}
     */
    resetToThemeChooser: (state) => {
        state.selectedFeatureIndex = null;
        state.layer = null;
        state.layerListView = true;
        state.featureListView = false;
        state.featureDetailView = false;
    }
};

export default mutations;
