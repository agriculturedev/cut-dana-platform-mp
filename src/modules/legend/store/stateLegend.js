/**
 * User type definition
 * @typedef {Object}    LegendState
 * @property {String}   type - The type of the module.
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String}   icon - icon next to title
 * @property {String}   name - Displayed as title (config-param)
 * @property {Boolean}  hasMouseMapInteractions If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes - Map mode in which this module can be used.
 * @property {String} sldVersion - The Verson of Style Layer Descriptor for the GetLegendGraphic request.
 * @property {Array}    legends - Contains infos about each legend.
 * @property {Object}   layerInfoLegend - to show in layer information.
 * @property {Object}   preparedLegend - the prepared legend.
 *
 */

export default {
    type: "legend",
    icon: "bi-lightbulb",
    hasMouseMapInteractions: false,
    description: "common:modules.legend.description",
    name: "common:modules.legend.name",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    sldVersion: "",

    legends: [],
    layerInfoLegend: {},
    preparedLegend: null
};
