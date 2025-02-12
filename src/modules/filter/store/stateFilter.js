/**
 * User type definition
 * @typedef {Object} filter
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   type - type of the module
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String}   name - Module name
 * @property {String} menuSide Specifies in which menu the GFI should be rendered
 * @property {Boolean} resetLayer - if true it will change the reset button to a button which resets the whole layer and ignores the prechecked values
 * @property {Boolean} layerSelectorVisible - to display a selector for the layers
 * @property {Boolean} multiLayerSelector - if layerSelectorVisible true, wether one can open multiple sections of the selector at the same time
 * @property {Boolean} liveZoomToFeatures - defines whether the filter immediately zooms to filter results
 * @property {Boolean} geometrySelectorOptions - options for an additional tool for filtering within a self-drawn area. If you use this tool in conjunction with external filtering
 * @property {Number} minScale - minimum zoom level the filter zooms in when displaying filter results
 * @property {String} saveTo - parameters to write changes to the filter in the url
 * @property {Array}  layers - the layer configuration for filter
 * @property {Array} layerGroups - configuration of the related layers to be filtered
 * @property {Array} rulesOfFilters - contains rules for each filter
 * @property {String} serializedString -contains the serialized state (includes rules, filterHits, selectedAccordions)
 * @property {Array} selectedAccordions - contains the selected accordions
 * @property {Array} selectedGroups - contains the selected groups
 * @property {Array} filtersHits - contains the filter hits
 * @property {Object/Boolean} filterGeometry - contains geometry/area to filter in
 * @property {Boolean} geometryFeature - the geometry feature
 * @property {Number} jumpToId - contains the filterId to jump
 * @property {Boolean} hasMouseMapInteractions If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {Array} neededUrlParams - contains the required URL params
 * @property {String} urlParams - current filter
 * @property {String} linkText - link text of the url link to current filter state or empty string if no such link should be rendered
 * @property {Boolean} closeGfi - If it is true, the open gfi window will be closed after new filtering.
 * @property {Boolean} preventAdjust - If it is true, the snippet will not be adjusted.
 */

const state = {
    icon: "bi-funnel-fill",
    id: "filter",
    type: "filter",
    description: "common:modules.filter.description",
    name: "common:modules.filter.name",
    menuSide: "mainMenu",
    resetLayer: false,
    layerSelectorVisible: true,
    multiLayerSelector: true,
    liveZoomToFeatures: true,
    geometrySelectorOptions: false,
    minScale: 5000,
    saveTo: "void",
    layers: [],
    layerGroups: [],
    rulesOfFilters: [],
    serializedString: "",
    selectedAccordions: [],
    selectedGroups: [],
    filtersHits: [],
    filterGeometry: false,
    geometryFeature: undefined,
    jumpToId: undefined,
    hasMouseMapInteractions: false,
    neededUrlParams: ["rulesOfFilters", "selectedAccordions", "selectedGroups"],
    urlParams: "",
    closeGfi: false,
    preventAdjust: false,
    linkText: "",
    initialStartupReset: false
};

export default state;
