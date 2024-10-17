/**
 * User type definition
 * @typedef {Object} StartModuleState
 * @property {String[]} mainMenu The modules configs for the main menu.
 * @property {String[]} secondaryMenu The modules configs for the secondary menu.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {Object} configuredModuleStates The states of the confiigured modules.
 */
const state = {
    mainMenu: [],
    secondaryMenu: [],
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],

    configuredModuleStates: []
};

export default state;
