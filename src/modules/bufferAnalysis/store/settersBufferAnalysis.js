/**
 * Selects given layer by object or ID
 * Also unselects all previous selected layers and
 * shows buffers if a buffer radius was provided previously
 *
 * @param {Object|String} selectedSourceLayer - layer object or ID string to select corresponding layer
 *
 * @throws Error
 * @return {void}
 */
function applySelectedSourceLayer ({getters, commit, dispatch}, selectedSourceLayer) {
    // unselect target layer if it is already selected
    if (getters.selectedTargetLayer) {
        getters.selectedTargetLayer.visibility = false;
        commit("setSelectedTargetLayer", null);
    }

    // find the layer in select options if selected layer is provided by id
    const selectedLayer = typeof selectedSourceLayer === "string"
        ? getters.selectOptions.find(item => item.id === selectedSourceLayer)
        : selectedSourceLayer;

    // select only the new source layer and deselect all previous selected layers
    if (selectedLayer) {
        getters.selectOptions.forEach(layerOption => {
            if (selectedLayer.id === layerOption.id) {
                dispatch("replaceByIdInLayerConfig", {
                    layerConfigs: [{
                        id: layerOption.id,
                        layer: {
                            id: layerOption.id,
                            visibility: true,
                            opacity: 1
                        }
                    }]
                }, {root: true});
            }
            else {
                dispatch("replaceByIdInLayerConfig", {
                    layerConfigs: [{
                        id: layerOption.id,
                        layer: {
                            id: layerOption.id,
                            visibility: false
                        }
                    }]
                }, {root: true});
            }
        });
    }
    // throw error if no selected layer is provided and it is not a valid null value
    // Value selected layer will be set to null on reset, so this tests for an undefined layer
    else if (selectedLayer !== null) {
        throw new Error(i18next.t("common:modules.bufferAnalysis.sourceLayerNotFound", {layerId: selectedSourceLayer}));
    }
    commit("setSelectedSourceLayer", selectedLayer);
    // remove previously generated layers and show buffer
    if (getters.bufferRadius && selectedLayer) {
        dispatch("Maps/areLayerFeaturesLoaded", selectedLayer.id, {root: true}).then(() => {
            dispatch("removeGeneratedLayers");
            dispatch("showBuffer");
        });
    }
}

/**
 * Selects given layer by object or ID
 * triggers also the intersection check action
 *
 * @param {Object|String} selectedTargetLayer - layer object or ID string to select corresponding layer
 *
 * @throws Error
 * @return {void}
 */
function applySelectedTargetLayer ({commit, getters, dispatch}, selectedTargetLayer) {
    // find the layer in select options if selected layer is provided by id
    const selectedLayer = typeof selectedTargetLayer === "string" ?
        getters.selectOptions.find(item => item.id === selectedTargetLayer) :
        selectedTargetLayer;

    commit("setSelectedTargetLayer", selectedLayer);
    // select the new target layer and check for intersections
    if (selectedLayer) {
        dispatch("replaceByIdInLayerConfig", {
            layerConfigs: [{
                id: selectedLayer.id,
                layer: {
                    id: selectedLayer.id,
                    visibility: true
                }
            }]
        }, {root: true});
        dispatch("checkIntersection");
    }
    // throw error if no selected layer is provided and it is not a valid null value
    // Value selected layer will be set to null on reset, so this tests for an undefined layer
    else if (selectedLayer !== null) {
        throw new Error(i18next.t("common:modules.bufferAnalysis.targetLayerNotFound", {layerId: selectedTargetLayer}));
    }
}
/**
 * Applies the input buffer radius which triggers the show buffer action, removes previous generated layers and shows buffer only when a truthy value for buffer radius is provided
 *
 * @param {Number} selectedBufferRadius - layer object or ID string to select corresponding layer
 *
 * @return {void}
 */
function applyBufferRadius ({commit, dispatch}, selectedBufferRadius) {
    commit("setBufferRadius", selectedBufferRadius);

    if (selectedBufferRadius) {
        dispatch("removeGeneratedLayers");
        dispatch("showBuffer");
    }
}

export {
    applySelectedSourceLayer,
    applySelectedTargetLayer,
    applyBufferRadius
};
