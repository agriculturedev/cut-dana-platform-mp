/**
 * User type definition
 * @typedef {Object} languageState
 * @property {String} currentLocale - the current language code
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} type type of the module
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {String} icon icon of the module
 * @property {String} name name of the module
 *
 */
const state = {
    currentLocale: "",
    description: "common:modules.language.description",
    type: "language",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    icon: "bi-flag",
    name: "common:modules.language.name"
};

export default state;
