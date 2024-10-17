/**
 * The state of the searchBar.
 * @module modules/searchBar/store/stateSearchBar
 *
 * @property {String[]} configPaths Path array of possible config locations. First one found will be used
 * @property {String} [currentSide="mainMenu"] Current side of the searchBar.
 * @property {String} [minCharacters=3] Minimum amount of characters required to start a search.
 * @property {String} [placeholder="common:modules.searchBar.placeholder.address"] Input text field placeholder shown when no input has been given yet.
 * @property {Object} [searchInterfaces={}] The configurations of the search interfaces
 * @property {Number} [suggestionListLength=5] Maximum amount of entries in the suggestion list.
 * @property {Number} [timeout=5000] Timeout for request to a search interface.
 * @property {String} [type="searchBar"] Id of the SearchBar component.
 * @property {Number} [zoomLevel=7] Defines the zoom level to use on zooming to a result.
 *
 * @property {String} [currentAvailableCategories=""] The current available categories.
 * @property {String} [currentActionEvent=""] Name of the last activated action event e.g. "showLayerInfo".
 * @property {String} [currentSearchInputValue=""] Current value of the search.
 * @property {String} [currentComponentName=""] Current component name.
 * @property {String} [searchInput=""] The search input.
 * @property {Object[]} [searchInterfaceInstances=[]] The configured searchInterfaces.
 * @property {Object[]} [searchSuggestions=[]] The suggestions of the configured searchInterfaces.
 * @property {Object[]} [searchResults=[]] The results of the configured searchInterfaces.
 * @property {Object[]} [selectedSearchResults=[]] The selected single results by the user in the "show all" view.
 * @property {Boolean} [showAllResults=false] Flag if all results should be shown.
 * @property {String} [showAllResultsSearchInterfaceInstance=""] Deprecated - Search interface instance while all results are shown (relevant for layerSelection search).
 * @property {String} [showAllResultsSearchCategory=""] Deprecated - Search interface category while all results are shown (relevant for layerSelection search).
 * @property {Array} [showAllResultsSearchInterfaceInstances=["elasticSearch", "topicTree"] Search interface instance while all results are shown (relevant for layerSelection search).
 * @property {Boolean} [showInTree=false] Flag to display the layer selection in the layer tree.
 * @property {Boolean} [searchResultsActive=true] Flag if the search results are active.
 * @property {Object} [iconsByActions= { addLayerToTopicTree: "bi-plus-circle", activateLayerInTopicTree: "bi-eye", highlightFeature: "bi-lightbulb", openGetFeatureInfo: "bi-info-circle", setMarker: "bi-geo-alt-fill", zoomToResult: "bi-zoom-in", startRouting: "bi-signpost-2" }] - contains the icons by action names to display on button
 */
const state = {
    configPaths: ["portalConfig.mainMenu.searchBar", "portalConfig.secondaryMenu.searchBar"],
    currentSide: "mainMenu",
    minCharacters: 3,
    placeholder: "common:modules.searchBar.placeholder.address",
    searchInterfaces: [],
    suggestionListLength: 5,
    timeout: 5000,
    type: "searchBar",
    zoomLevel: 7,

    currentAvailableCategories: "",
    currentActionEvent: "",
    currentSearchInputValue: "",
    currentComponentName: "",
    searchInput: "",
    searchInterfaceInstances: [],
    searchSuggestions: [],
    searchResults: [],
    selectedSearchResults: [],
    showAllResults: false,
    /**
     * @deprecated in the next major-release!
     * showAllResultsSearchInterfaceInstance
     */
    showAllResultsSearchInterfaceInstance: "elasticSearch_0",
    /**
     * @deprecated in the next major-release!
     * showAllResultsSearchCategory
     */
    showAllResultsSearchCategory: "Thema",
    showAllResultsSearchInterfaceInstances: ["elasticSearch", "topicTree"],
    showInTree: false,
    searchResultsActive: true,
    addLayerButtonSearchActive: true,
    iconsByActions: {
        addLayerToTopicTree: "bi-plus-circle",
        activateLayerInTopicTree: "bi-eye",
        showInTree: "bi-folder2-open",
        showLayerInfo: "bi-info-circle",
        highlightFeature: "bi-lightbulb",
        openGetFeatureInfo: "bi-info-circle",
        setMarker: "bi-geo-alt-fill",
        zoomToResult: "bi-zoom-in",
        startRouting: "bi-signpost-2"
    }
};

export default state;
