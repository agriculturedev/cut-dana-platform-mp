/**
 * The actions for the LayerTree.
 * @module modules/layerTree/store/actionsLayerTree
 */
export default {
    /**
     * Sets showInLayerTree and visibility of the given layer to false, updates all zIndexes.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} layerConf The layer config.
     * @returns {void}
     */
    removeLayer ({dispatch}, layerConf) {
        const layerConfCopy = {...layerConf, ...{
            showInLayerTree: false,
            visibility: false,
            zIndex: null
        }};

        dispatch("replaceByIdInLayerConfig", layerConfCopy);
        dispatch("updateAllZIndexes", null, {root: true});
    },

    /**
     * Sets the given transparency to the layer.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} layerConf The layer config.
     * @returns {void}
     */
    updateTransparency ({dispatch}, {layerConf, transparency}) {
        const layerConfCopy = {...layerConf, ...{
            transparency: transparency
        }};

        dispatch("replaceByIdInLayerConfig", layerConfCopy);
    },

    /**
     * Commits the layerconf to the app-store.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} layerConf The layer config.
     * @returns {void}
     */
    replaceByIdInLayerConfig ({dispatch}, layerConf) {
        dispatch("replaceByIdInLayerConfig", {
            layerConfigs: [
                {
                    layer: layerConf,
                    id: layerConf.id
                }
            ]
        }, {root: true});
    }
};
