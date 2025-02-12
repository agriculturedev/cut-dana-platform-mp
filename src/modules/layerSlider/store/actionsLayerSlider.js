export default {
    /**
     * Adds an index to the layer ids.
     * @param {Object} param.commit the commit
     * @param {Object[]} layerIds The configuration of the layers from config.json.
     * @returns {void}
     */
    addIndexToLayerIds: ({commit}, layerIds) => {
        const layerIdsWithIndex = layerIds.map((layerId, index) => {
            layerId.index = index;

            return layerId;
        });

        commit("setLayerIds", layerIdsWithIndex);
    },

    /**
     * Checks if all layers that the layerSlider should use are also defined.
     * Non-existing layers are removed.
     * @param {Object} param.commit the commit
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object[]} layerIds The configuration of the layers from config.json.
     * @returns {void}
     */
    checkIfAllLayersAvailable: ({commit, rootGetters}, layerIds) => {
        const validLayerIds = layerIds.filter(layer => {
            const layerId = layer.layerId;

            if (rootGetters.allLayerConfigs.some(layerConfig => layerConfig.id.includes(layerId))) {
                return true;
            }

            console.warn(`The configuration of the module layerSlider is invalid. The layer with the id: "${layerId}" must be configured in the "layerConfig".`);
            return false;
        });

        commit("setLayerIds", validLayerIds);
    },

    /**
     * Sends the new visibility to layer configs.
     * @param {Object} param.dispatch the dispatch
     * @param {String} layerId The layerId
     * @param {Boolean} visibility Visibility true / false
     * @param {Number} transparency Transparency of layer.
     * @returns {void}
     */
    sendModification: ({dispatch}, {layerId, visibility, transparency}) => {
        dispatch("replaceByIdInLayerConfig", {
            layerConfigs: [{
                id: layerId,
                layer: {
                    visibility: visibility,
                    transparency: transparency || 0
                }
            }]
        }, {root: true});
    },

    /**
     * Finds the activeLayerId based on the index and initiates storage.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @param {Number} index Index in layerIds.
     * @returns {void}
     */
    setActiveIndex: ({commit, dispatch, state}, index) => {
        commit("setActiveLayer", state.layerIds[index]);
        dispatch("toggleLayerVisibility", state.activeLayer.layerId);
    },

    /**
     * Determines the visibility of the layerIds
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @param {String} activeLayerId Id des activeLayer.
     * @returns {void}
     */
    toggleLayerVisibility: ({dispatch, state}, activeLayerId) => {
        state.layerIds.forEach(layer => {
            dispatch("sendModification", {
                layerId: layer.layerId,
                visibility: layer.layerId === activeLayerId
            });
        });
    }
};
