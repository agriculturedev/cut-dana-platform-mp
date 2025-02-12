/**
 * WfsTransaction tool state definition.
 * @typedef {Object} WfsTransactionState
 * @type {Object}
 * @property {Boolean} type the type of the module.
 * @property {String} name Displayed as the title. (config-param)
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} icon Icon next to the title. (config-param)
 * @property {Boolean} hasMouseMapInteractions If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {(ButtonConfig[]|Boolean)} update Whether it should be possible to update features of the WFS-T layers.
 * @property {(ButtonConfig[]|Boolean)} delete Whether it should be possible to delete features of the WFS-T layers.
 * @property {String[]} layerIds Ids of the configured WFS-T layers.
 * @property {String} layerSelectLabel Label used for the layer select
 * @property {(ButtonConfig[]|Boolean)} lineButton Configuration of the different layers whether they should display the button to add lines.
 * @property {(ButtonConfig[]|Boolean)} pointButton Configuration of the different layers whether they should display the button to add points.
 * @property {(ButtonConfig[]|Boolean)} polygonButton Configuration of the different layers whether they should display the button to add polygons.
 * @property {Boolean} transactionProcessing Flag if a process like delete, update is currently active with axios post,get.
 * @property {Boolean} showConfirmModal Flag if the modal dialog should be shown.
 * @property {Boolean} toggleLayer Whether the already added features should be displayed while inserting new features.
 * @property {Number} currentLayerIndex Index of the currently selected layer.
 * @property {FeatureProperty[]} featureProperties Possible properties to be set on a feature for the current layer.
 * @property {TransactionLayer[]} layerInformation Information about the different WFS-T layers configured for the tool.
 * @property {("LineString"|"Point"|"Polygon"|"delete"|"updated"|"selectedUpdate"|null)} selectedInteraction Which selection is currently active, if any.
 */
const state = {
    // General configuration
    type: "wfst",
    description: "common:modules.wfst.description",
    name: "common:modules.wfst.name",
    icon: "bi-globe",
    hasMouseMapInteractions: true,
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D"],
    // Module specific configuration
    update: false,
    delete: false,
    layerIds: [],
    layerSelectLabel: "common:modules.wfst.layerSelectLabel",
    lineButton: [],
    pointButton: [],
    polygonButton: [],
    transactionProcessing: false,
    showConfirmModal: false,
    toggleLayer: false,
    // Actual state
    currentLayerIndex: -1,
    featureProperties: [],
    layerInformation: [],
    selectedInteraction: null
};

export default state;
