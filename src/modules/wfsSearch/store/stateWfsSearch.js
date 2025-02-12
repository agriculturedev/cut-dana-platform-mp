/**
 * WfsSearch tool state definition.
 * @typedef {Object} WfsSearchState
 * @type {Object}
 * @property {Boolean} type the type of the module.
 * @property {String} name Displayed as the title. (config-param)
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} icon Icon next to the title. (config-param)
 * @property {Object[]} instances Array of search configurations. Each object contains the parameters literals, requestConfig and title and may also contain the parameters selectSource and userHelp. More information in the documentation.
 * @property {Number} currentInstanceIndex Position of the current search instance in the instances array.
 * @property {?JSON} parsedSource The requested and parsed selectSource.
 * @property {?object} requiredValues The key value pairs for the required fields.
 * @property {String} userHelp IInformation text regarding the search formular to be displayed to the user.
 * @property {ol.Feature[]} results Current results of the search query.
 * @property {Boolean} searched Whether the search button has been clicked.
 * @property {Object} selectedOptions The values of options which the user has entered / selected a value. The options here present are only the fields which had the parameter "options" as a String. The values inserted, have its "options" parameter as the key and the input as the value.
 * @property {?object} service An object containing information about the WFS service, which will later be filtered.
 * @property {Boolean} showResultList Whether the table containing the results should be shown.
 * @property {Boolean} valuesReset If the values are reset, no values should be set on a select element.
 * @property {Number} zoomLevel zoom level to switch to on focusing a result
 * @property {Number} resultsPerPage used for pagination
 * @property {Boolean} multiSelect whether multiple result list entries may be selected
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 */
const state = {
    type: "wfsSearch",
    // defaults for config.json tool parameters
    description: "common:modules.wfsSearch.description",
    name: "common:modules.wfsSearch.name",
    icon: "bi-search",
    instances: [],
    // state parameters
    currentInstanceIndex: 0,
    parsedSource: null,
    requiredValues: null,
    userHelp: "",
    results: [],
    searched: false,
    selectedOptions: {},
    service: null,
    showResultList: false,
    valuesReset: false,
    zoomLevel: 5,
    resultsPerPage: 0,
    multiSelect: false,
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
