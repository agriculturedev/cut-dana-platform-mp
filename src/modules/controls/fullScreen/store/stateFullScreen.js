/**
 * User type definition
 * @typedef {Object} FullScreenState
 * @property {String} iconArrow Icon of the fullscreen arrow button.
 * @property {String} iconExit Icon of the fullscreen exit button.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 */
const state = {
    iconArrow: "arrows-fullscreen",
    iconExit: "fullscreen-exit",
    supportedDevices: ["Desktop"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
