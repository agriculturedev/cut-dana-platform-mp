import stateStyleVT from "./stateStyleVT";

const initialState = Object.assign({}, stateStyleVT),
    actions = {
        /**
         * Updates the list of vector tile layers to only include the currently visible layers.
         * Also clears the current set layer of the layerModel if it is not inside the updated list; the layer is no longer visible.
         * @param {Object} param.state the state
         * @param {Object} param.commit the commit
         * @param {Object} param.rootGetters the rootGetters
         * @returns {void}
         */
        refreshVectorTileLayerList ({state, commit, rootGetters}) {
            const {layerModel} = state,
                layerConfigs = rootGetters.visibleLayerConfigs || [],
                vectorTileLayerList = [];

            layerConfigs.forEach(layerConfig => {
                if (layerConfig.typ === "VectorTile") {
                    vectorTileLayerList.push(
                        {
                            id: layerConfig.id,
                            name: layerConfig.name
                        }
                    );
                }
            });

            commit("setVectorTileLayerList", vectorTileLayerList);

            if (layerModel !== null && layerModel !== undefined) {
                const result = vectorTileLayerList.find(
                    vectorTileLayer => vectorTileLayer.id === layerModel.id
                );

                if (result === undefined) {
                    commit("setLayerModel", null);
                }
            }
        },

        /**
         * Resets the state to its initial configuration.
         * @param {Object} param.commit the commit
         * @returns {void}
         */
        resetModule ({commit}) {
            commit("setLayerModel", initialState.layerModel);
            commit("setVectorTileLayerList", initialState.vectorTileLayerList);
        },

        /**
         * If the module is activated, a layerModel to be set is given and committed to the state.
         * Else, the module is reset.
         * @param {Object} param.commit the commit
         * @param {Object} param.dispatch the dispatch
         * @param {?VTLayer} layerModel The layer selected to be initially selected.
         * @returns {void}
         */
        startLayerProcess ({commit, dispatch}, layerModel) {
            commit("setLayerModel", layerModel);
            dispatch("refreshVectorTileLayerList");
        },

        /**
         * Changes the style of the selected layer to the one of the one with the selected styleId.
         * @param {Object} param.state the state
         * @param {String} styleId Id of the style to be set on the layer.
         * @returns {void}
         */
        updateStyle ({state}, styleId) {
            state.layerModel.setStyleById(styleId);
        }
    };

export default actions;
