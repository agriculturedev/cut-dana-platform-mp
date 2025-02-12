import Overlay from "ol/Overlay.js";
/**
 * User type definition
 * @typedef {Object} MouseHoverStates
 * @property {String[]} configPaths Path array of possible config locations. First one found will be used
 * @property {Object} overlay =new Overlay({}) mouseHover overlay (tooltip) - paramaters get set during initialization.
 * @property {Number} numFeaturesToShow The number of features that will be shown in the popup.
 * @property {String} infoText The text that will be shown in the popup.
 * @property {Array} layersFromConfig Array with layers from the config.
 * @property {Array} layersFromConfig Array with layers from the config.
 * @property {Array} mouseHoverLayers Array with layers from the config that have mouseHoverInfos.
 * @property {Array} mouseHoverInfos Array of the attributes each layer and its features should display.
 * @property {Array} infoBox Array with the Infos from the currently hovered feature/s.
 * @property {Array} hoverPosition Array with coordinates of the currently hovered feature/s.
 * @property {Boolean} pleaseZoom True if more features are being hovered than the configured max in numFeaturesToShow.
 * @property {String} type The type of the mouseHover component.
 */
export default {
    configPaths: ["portalConfig.map.mouseHover"],
    overlay: new Overlay({
        id: "mousehover-overlay",
        element: document.createElement("DIV"),
        offset: [1, -2],
        positioning: "bottom-left"
    }),
    numFeaturesToShow: 2,
    infoText: "common:modules.mouseHover.infoText",
    layersFromConfig: [],
    mouseHoverLayers: [],
    mouseHoverInfos: [],
    infoBox: null,
    hoverPosition: null,
    pleaseZoom: false,
    isActive: true,
    type: "mouseHover"
};
