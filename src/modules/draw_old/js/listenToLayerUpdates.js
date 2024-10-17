/**
 * Listener for changes in tree.
 * @param {Store} store the store
 * @param {Function} handler the handler to call after changes as function(layerConfigs)
 * @returns {void}
 */
function listenToUpdatedVisibleLayerList (store, handler) {
    store.watch((state, getters) => getters.visibleLayerConfigs, layerConfig => {
        if (typeof handler === "function") {
            handler(layerConfig);
        }
    }, {deep: true});
}

export {
    listenToUpdatedVisibleLayerList
};
