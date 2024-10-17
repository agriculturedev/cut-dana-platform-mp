/**
 * User type definition
 * @typedef {Object} TotalViewState
 * @property {String} icon Icon of the TotalView button.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 */
const state = {
    icon: "skip-backward-fill",
    supportedDevices: ["Desktop"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
