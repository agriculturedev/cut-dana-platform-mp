/**
 * User type definition
 * @typedef {Object} OpenConfigState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} icon Icon next to title (config-param)
 * @property {String} name Displayed as title (config-param)
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {String} type The type of the module.
 */
const state = {
    description: "common:modules.openConfig.description",
    icon: "bi-upload",
    name: "common:modules.openConfig.name",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "openConfig"
};

export default state;
