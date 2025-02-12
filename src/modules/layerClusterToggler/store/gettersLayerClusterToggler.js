import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateLayerClusterToggler from "./stateLayerClusterToggler";

const simpleGetters = {
    ...generateSimpleGetters(stateLayerClusterToggler),

    /**
     * Returns the layernames of the layer id list.
     * @param {Object} state context object.
     * @param {Object} getters layerClusterToggler store getters
     * @param {Object} rootState root state
     * @param {Object} rootGetters root getters
     * @returns {String[]} The layer names of the layer id list.
     */
    layerNames: (state, getters, rootState, rootGetters) => {
        const layerNames = [];

        state.layerIdList.forEach(layerId => {
            layerNames.push(rootGetters.layerConfigById(layerId)?.name);
        });

        return layerNames;
    }
};

export default simpleGetters;
