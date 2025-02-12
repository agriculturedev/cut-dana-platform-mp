/**
 * User type definition
 * @typedef {Object} TiltViewState
 * @property {String} tiltDownIcon Icon of the tilt down button.
 * @property {String} tiltUpIcon Icon of the tilt up button.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 */
const state = {
    tiltDownIcon: "bi-caret-down-square",
    tiltUpIcon: "bi-caret-up-square",
    supportedDevices: ["Desktop"],
    supportedMapModes: ["3D"]
};

export default state;
