/**
 * User type definition
 * @typedef {Object} Button3dState
 * @property {String} icon2d Icon of the 2D button.
 * @property {String} icon3d Icon of the 3D button.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 */
const state = {
    icon2d: "https://geodienste.hamburg.de/lgv-config/img/badge-2d.svg",
    icon3d: "badge-3d",
    supportedDevices: ["Desktop", "Mobile"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
