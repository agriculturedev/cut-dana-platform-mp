/**
 * User type definition
 * @typedef {Object} FreezeState
 * @property {String} icon Icon of the freeze button.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 */
const state = {
    icon: "bi-lock",
    supportedDevices: ["Desktop"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
