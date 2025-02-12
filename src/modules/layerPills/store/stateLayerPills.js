/**
 * User type definition
 * @property {String[]} configPaths Path array of possible config locations. First one found will be used
 * @property {String[]} supportedDevices devices on which the module is displayed.
 * @property {String[]} supportedMapModes map mode in which this module can be used.
 * @property {Object} visibleSubjectDataLayer contains all visible subjectdata layers.
 * @property {Boolean} active status of layerpills, as configured in config.json.
 * @property {Number} amount number of visible layerpills, as configured in config.json.
 * @property {String} type The type of the layerPills component.
 */

const state = {
    configPaths: ["portalConfig.map.layerPills"],
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    visibleSubjectDataLayers: [],
    active: false,
    mobileOnly: false,
    type: "layerPills"
};

export default state;
