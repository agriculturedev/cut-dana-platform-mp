/**
 * StyleVT
 * @typedef {Object} StyleVTState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} icon Icon used in the header of the window.
 * @property {?VTLayer} layerModel Currently selected model of a Vector Tile Layer to style.
 * @property {String} name Title displayed at the top of the window of the Tool; can be configured through the config.json.
 * @property {String} type The type of the module.
 * @property {VTLayer[]} vectorTileLayerList Array of visible Vector Tile Layers selectable to style.
 */
const state = {
    description: "common:modules.styleVT.description",
    icon: "bi-paint-bucket",
    layerModel: null,
    name: "common:modules.styleVT.name",
    type: "styleVT",
    vectorTileLayerList: []
};

export default state;
