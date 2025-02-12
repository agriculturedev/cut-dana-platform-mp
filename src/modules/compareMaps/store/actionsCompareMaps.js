import layerCollection from "../../../core/layers/js/layerCollection";

/**
 * The actions for the CompareMaps.
 * @module modules/compareMaps/store/actionsCompareMaps
 */
export default {
    /**
     * Initializes the CompareMaps module by setting the layer names.
     * @param {Object} context - The Vuex context object.
     * @param {Function} context.commit - The Vuex commit function.
     * @param {Object} context.rootGetters - The Vuex root getters.
     * @returns {void}
     */
    initialize ({commit, rootGetters}) {
        const initialBaseLayer = rootGetters.allLayerConfigs
            .filter(layerConfig => layerConfig.visibility === true && layerConfig.typ === "WMS")
            .map(layerConfig => ({name: layerConfig.name, id: layerConfig.id}));

        if (initialBaseLayer.length > 0) {
            commit("setInitialBaseLayer", initialBaseLayer[0]);
        }
    },
    /**
     * Activates the layer swiper for comparing maps.
     * @param {Object} context - The Vuex context object.
     * @param {Object} context.state - The Vuex state object.
     * @param {Function} context.commit - The Vuex commit function.
     * @returns {void}
     */
    activateSwiper ({state, commit}) {
        const firstLayer = layerCollection.getLayers().find(layer => layer.get("id") === state.selectedLayer1Id),
            secondLayer = layerCollection.getLayers().find(layer => layer.get("id") === state.selectedLayer2Id),
            appendix = "_secondLayer";

        if (!secondLayer.getLayer().values_.id.endsWith(appendix)) {
            secondLayer.getLayer().values_.id = secondLayer.getLayer().values_.id + appendix;
        }

        commit("Modules/LayerSwiper/setActive", true, {root: true});
        commit("Modules/LayerSwiper/setLayerSwiperSourceLayer", firstLayer, {root: true});
        commit("Modules/LayerSwiper/setLayerSwiperTargetLayer", secondLayer, {root: true});
    }
};
