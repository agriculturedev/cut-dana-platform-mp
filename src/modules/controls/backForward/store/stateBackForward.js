/**
 * User type definition
 * @typedef {Object} BackForwardState
 * @property {String} iconBack Icon of the backward button.
 * @property {String} iconForward Icon of the forward button.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {Object[]} memory The memories.
 * @property {Number} position The counter of memories.
 */
const state = {
    iconBack: "skip-start-fill",
    iconForward: "skip-end-fill",
    supportedDevices: ["Desktop"],
    supportedMapModes: ["2D"],

    memory: [],
    position: null
};

export default state;
