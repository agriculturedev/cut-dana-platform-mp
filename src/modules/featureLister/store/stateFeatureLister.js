/**
 * featureLister tool state definition.
 * @typedef {Object} FeatureListerState
 * @property {Boolean} hasMouseMapInteractions If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} type type of the FeatureLister component
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {String} description The description that should be shown
 * @property {Number} maxFeatures default value for maxFeatures that can be overwritten in config
 * @property {Array} layerlist array of layers in the format {id, name, features}
 * @property {Object} layer layer object of the selected layer
 * @property {Boolean} layerListView if true list of visibile vector layers gets displayed
 * @property {String} currentTab id of the currently displayed tab
 * @property {Array} gfiFeaturesOfLayer array of the gfiFeatures of the selected layer
 * @property {String} featureCount number of total features of the selected layer
 * @property {String} shownFeatures currently count of features displayed in featureListView table
 * @property {Boolean} featureListView if true the list of features from selected layer gets displayed
 * @property {Boolean} nestedFeatures some features have features themself, if true they get recognized
 * @property {Boolean} featureDetailView if true the detail page of the selected feature gets displayed
 * @property {Array} headers list of headings in list
 * @property {Number} selectedFeatureIndex index of the selected feature in list of gfiFeatures
 * @property {Object} highlightVectorRulesPolygon default style for highlighting polygons
 * @property {Object} highlightVectorRulesPointLine default style for highlighting lines and points
 */
const state = {
    // defaults for config.json parameters
    hasMouseMapInteractions: true,
    type: "featureLister",
    description: "common:modules.featureLister.description",
    name: "common:modules.featureLister.name",
    icon: "bi-list",
    maxFeatures: 20,
    // featureLister state
    layerlist: [],
    layer: null,
    layerListView: true,
    gfiFeaturesOfLayer: [],
    featureCount: "",
    shownFeatures: "",
    featureListView: false,
    nestedFeatures: false,
    featureDetailView: false,
    headers: [],
    selectedFeatureIndex: null,
    highlightVectorRulesPolygon: {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        },
        "zoomLevel": 7
    },
    highlightVectorRulesPointLine: {
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        },
        "zoomLevel": 7
    },
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
