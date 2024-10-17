import SearchInterface from "./searchInterface";
import store from "../../../app-store";
import layerFactory from "../../../core/layers/js/layerFactory";

/**
 * The search interface to the topic tree.
 * @module modules/searchBar/searchInterfaces/SearchInterfaceTopicTree
 * @name SearchInterfaceTopicTree
 * @constructs
 * @extends SearchInterface
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["activateLayerInTopicTree"]] Actions that are fired when clicking on a result list item.
 * @param {String} [searchInterfaceId="topicTree"] The id of the service interface.
 * @param {String} [searchType=""] Decides whether the metadata or the name of a layer should be searched. Possible value: "metadata". If empty, name will be searched.
 * @returns {void}
 */
export default function SearchInterfaceTopicTree ({hitTemplate, resultEvents, searchInterfaceId, searchType} = {}) {
    const resultEventsDefault = {
            onClick: ["activateLayerInTopicTree"],
            buttons: ["showInTree", "showLayerInfo"]
        },
        resultEventsSupported = ["activateLayerInTopicTree", "showInTree", "showLayerInfo"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);

    SearchInterface.call(this,
        "client",
        searchInterfaceId || "topicTree",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.searchType = searchType || "";
}

SearchInterfaceTopicTree.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in topic tree search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceTopicTree.prototype.search = async function (searchInput) {
    this.searchState = "running";
    const searchInputRegExp = this.createRegExp(searchInput),
        foundLayers = this.searchInLayers(store.getters.allLayerConfigs, searchInputRegExp),
        foundFolders = this.searchInFolders(store.getters.layerConfig, searchInputRegExp);

    this.pushHitsToSearchResults(foundLayers.concat(foundFolders));

    this.searchState = "finished";
    return this.searchResults;
};

/**
 * Creates a regular Expression to handle special Characters like "(".
 * @param {String} searchInput The search input.
 * @return {String} The search input as regExp String.
 */
SearchInterfaceTopicTree.prototype.createRegExp = function (searchInput) {
    const string = searchInput.replace(/ /g, ""),
        searchInputRegExp = new RegExp(string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");

    return searchInputRegExp;
};

/**
 * Executes the search in the layer variable with search string and finds in the layer name and dataset name.
 * Note: 3D layers will not be found in 2D map mode.
 * @param {Object[]} layerConfigs The layerConfigs from topic tree.
 * @param {String} searchInputRegExp The search input as regExp String.
 * @returns {Object[]} The found layers.
 */
SearchInterfaceTopicTree.prototype.searchInLayers = function (layerConfigs, searchInputRegExp) {
    const foundLayers = [];

    layerConfigs.forEach(layer => {

        if (store.getters["Maps/mode"] === "3D" || !layerFactory.getLayerTypes3d().includes(layer?.typ?.toUpperCase())) {
            const datasets = layer.datasets;
            let searchString = "",
                datasetsExist = false;

            if (this.searchType === "metadata" && Array.isArray(datasets) && datasets.length > 0 && typeof datasets[0].md_name === "string") {
                searchString = layer.datasets[0].md_name.replace(/ /g, "");
            }
            else if (typeof layer.name === "string") {
                searchString = layer.name.replace(/ /g, "");
            }
            if (Array.isArray(datasets) && datasets.length > 0 && typeof datasets[0].md_name === "string") {
                datasetsExist = true;
            }

            if (searchString.search(searchInputRegExp) !== -1) {
                foundLayers.push(this.normalizeLayerResult(layer, datasetsExist));
            }
        }
    });

    return foundLayers;
};

/**
 * Normalizes the layer search results to display them in a SearchResult.
 * @param {Object} layer The search results layer.
 * @param {Boolean} datasetsExist Is true, if layer has datasets.
 * @returns {Object} The normalized layer search result.
 */
SearchInterfaceTopicTree.prototype.normalizeLayerResult = function (layer, datasetsExist) {
    return {
        events: this.normalizeResultEvents(this.resultEvents, layer),
        category: i18next.t("common:modules.searchBar.type.topic"),
        icon: "bi-stack",
        id: layer.id,
        name: layer.name,
        toolTip: datasetsExist ? layer.datasets[0].md_name : ""
    };
};

/**
 * Executes the search in the folders.
 * @param {Object} layerConfig The layerConfig from topic tree.
 * @param {String} searchInputRegExp The search input as regExp String.
 * @returns {Object[]} The found folders.
 */
SearchInterfaceTopicTree.prototype.searchInFolders = function (layerConfig, searchInputRegExp) {
    const folders = [],
        foundFolders = [];

    Object.keys(layerConfig).forEach(parentKeys => {
        this.searchInFolder(layerConfig[parentKeys], folders);
    });

    folders.forEach(folder => {
        if (folder.name.search(searchInputRegExp) !== -1) {
            foundFolders.push(this.normalizeFolderResult(folder));
        }
    });

    return foundFolders;
};

/**
 * Search recursively in folders for elements of type folder.
 * @param {Object} folder The folder from topic tree.
 * @param {Object[]} folders The folders from topic tree.
 * @returns {void}
 */
SearchInterfaceTopicTree.prototype.searchInFolder = function (folder, folders) {
    folder?.elements?.forEach(element => {
        if (element?.type === "folder") {
            this.searchInFolder(element, folders);
            folders.push(element);
        }
    });
};

/**
 * Normalizes the folder search results to display them in a SearchResult.
 * @param {Object} folder The search results folder.
 * @returns {Object} The normalized folder search result.
 */
SearchInterfaceTopicTree.prototype.normalizeFolderResult = function (folder) {
    return {
        events: this.normalizeResultEvents({...this.resultEvents}, folder),
        category: i18next.t("common:modules.searchBar.type.folder"),
        icon: "bi-folder",
        id: folder.id,
        name: folder.name
    };
};

/**
 * Creates the possible actions and fills them.
 * @override
 * Note: Folders do not have activateLayerInTopicTree action.
 * @param {Object} searchResult The search result of topic tree.
 * @returns {Object} The possible actions.
 */
SearchInterfaceTopicTree.prototype.createPossibleActions = function (searchResult) {
    const possibleActions = {};

    if (searchResult.type !== "folder") {
        Object.assign(possibleActions, {
            activateLayerInTopicTree: {
                layerId: searchResult.id
            },
            showInTree: {
                layerId: searchResult.id
            },
            showLayerInfo: {
                layerId: searchResult.id
            }
        });
    }

    return possibleActions;
};
