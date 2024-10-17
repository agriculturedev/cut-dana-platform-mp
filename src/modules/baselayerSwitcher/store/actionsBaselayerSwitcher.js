import baselayerHandler from "../../layerSelection/js/handleSingleBaselayer";

const actions = {
    /**
     * Updates the layerTree with all configs added to state.layersToAdd.
     * Sets 'visibility' and 'showInLayerTree' to true at each layer.
     * Clears state.layersToAdd and redirects to main menu.
     * Note: Baselayer will be set on top of the baselayer with the highest zIndex.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} layerId id of the layer to add
     * @returns {void}
     */
    updateLayerVisibilityAndZIndex ({dispatch, rootGetters}, layerId) {
        const layerConfigs = [],
            maxBaselayerZIndex = Math.max(...rootGetters.layerConfigsByAttributes({
                baselayer: true,
                showInLayerTree: true
            }).map(layer => layer.zIndex));
        let baselayerZIndex = maxBaselayerZIndex + 1,
            zIndex = rootGetters.determineZIndex(layerId);


        if (rootGetters.isBaselayer(layerId)) {
            dispatch("updateLayerConfigZIndex", {
                layerContainer: rootGetters.layerConfigsByAttributes({showInLayerTree: true}),
                maxZIndex: maxBaselayerZIndex
            }, {root: true});
            zIndex = baselayerZIndex++;
            baselayerHandler.checkAndAdd(rootGetters.singleBaselayer, rootGetters.visibleBaselayerConfigs, layerConfigs);
        }

        layerConfigs.push({
            id: layerId,
            layer: {
                id: layerId,
                visibility: true,
                showInLayerTree: true,
                zIndex: zIndex
            }
        });

        dispatch("replaceByIdInLayerConfig", {layerConfigs}, {root: true});
    }
};

export default actions;
