/**
 * LayerSelection state definition.
 * @typedef {Object} LayerSelectionState
 * @property {Boolean} [visible=false] visible if true, LayerSelection will rendered
 * @property {String} [type="layerSelection"] type of LayerSelection
 * @property {String} [menuSide="mainMenu"] side of menu to show LayerSelection in
 * @property {String} [name="common:modules.layerSelection.addSubject"] name of LayerSelection
 * @property {Array} [subjectDataLayerConfs=[]] subject data layer configurations to show in layerSelection
 * @property {Array} [baselayerConfs=[]] baselayer configurations to show in layerSelection
 * @property {Array} [lastFolderNames=[]] names of the previous folder configurations names
 * @property {Array} [lastSubjectDataLayerConfs=[]] previous subject data layer configurations
 * @property {Array} [lastBaselayerConfs=[]] previous baselayer configurations
 * @property {Boolean} [layerInfoVisible=false] if true, layerInformation is visible
 * @property {String} [highlightLayerId=null] id of the layer to highlight
 * @property {Array} encompassingBoundingBox contains the common bounding box for several layers
 */
export default {
    visible: false,
    type: "layerSelection",
    menuSide: "mainMenu",
    name: "common:modules.layerSelection.addSubject",

    subjectDataLayerConfs: [],
    baselayerConfs: [],
    lastFolderNames: [],
    lastSubjectDataLayerConfs: [],
    lastBaselayerConfs: [],
    layerInfoVisible: false,
    highlightLayerId: null,
    encompassingBoundingBox: [Infinity, Infinity, -Infinity, -Infinity]
};
