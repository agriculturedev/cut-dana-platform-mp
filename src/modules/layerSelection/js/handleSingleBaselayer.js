/**
 * If singleBaselayer is true, all visible layer configs are added to list of layer configs and the visibility is set to false.
 * @param {Boolean} singleBaselayer config.json value for 'tree.singleBaselayer'
 * @param {Array} visibleBaselayerConfigs all visible baselayers
 * @param {Array} layerConfigs to add visible baselayers to
 * @returns {void}
 */
function checkAndAdd (singleBaselayer, visibleBaselayerConfigs, layerConfigs) {
    if (singleBaselayer && visibleBaselayerConfigs.length >= 1) {
        visibleBaselayerConfigs.forEach(baselayerConf => {
            layerConfigs.push({
                id: baselayerConf.id,
                layer: {
                    id: baselayerConf.id,
                    visibility: false
                }
            });
        });
    }
}

export default {
    checkAndAdd
};
