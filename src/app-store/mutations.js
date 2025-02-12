import {generateSimpleMutations} from "../shared/js/utils/generators";
import stateAppStore from "./state";

/**
 * The root mutations.
 * @module app-store/mutations
 */
export default {
    ...generateSimpleMutations(stateAppStore),

    /**
     * Sets the object to states layerConfig under the given parentKey.
     * @param {Object} state store state
     * @param {Object} payload the payload
     * @param {Object[]} payload.layerConfigs object to set to the parentKey
     * @param {String} payload.parentKey the key of the parent object
     * @returns {void}
     */
    setLayerConfigByParentKey (state, {layerConfigs, parentKey}) {
        state.layerConfig[parentKey] = layerConfigs;
    },

    /**
     * Sets the loaded config to true.
     * @param {Object} state store state
     * @param {String} config The config that is loaded
     * @returns {void}
     */
    setLoadedConfigs (state, config) {
        state.loadedConfigs[config] = true;
    }
};
