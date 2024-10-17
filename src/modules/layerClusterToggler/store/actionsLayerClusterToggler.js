const actions = {
    /**
     * Toggles the visibility of the layers with the ids from layer id list.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the commit
     * @param {Progressevent} event Event contains the loaded file.
     * @returns {void}
     */
    toggleLayerVisibility ({commit, dispatch, state}) {
        state.layerIdList.forEach(layerId => {
            dispatch("replaceByIdInLayerConfig", {
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        visibility: state.isToggled
                    }
                }]
            }, {root: true});

        });

        commit("setIsToggled", !state.isToggled);
    }
};

export default actions;
