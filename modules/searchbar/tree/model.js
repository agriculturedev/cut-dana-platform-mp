import store from "../../../src/app-store/index";

const TreeModel = Backbone.Model.extend(/** @lends TreeModel.prototype */{
    defaults: {
        inUse: false,
        minChars: 3,
        searchType: "",
        layers: [],
        nodes: []
    },
    /**
     * @class TreeModel
     * @extends Backbone.Model
     * @memberOf Searchbar.Tree
     * @constructs
     * @param {object} config - Config parameters from config.json for searching in layer tree.
     * @property {boolean} inUse=false todo
     * @property {number} minChars=3 Minimum number of characters to start the search.
     * @property {String} searchType="" Decides whether the metadata or the name of a layer should be searched. Possible values: "metadata" and "name" or not defined
     * @property {object[]} layers=[] todo
     * @property {object[]} nodes=[] todo
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Core#RadioRequestParametricURLGetInitString
     * @listens Searchbar#RadioTriggerSearchbarSearch
     * @listens Core#RadioTriggerObliqueMapIsActivated
     */
    initialize: function (config) {
        if (config.minChars) {
            this.set("minChars", config.minChars);
        }


        if (config.searchType) {
            this.set("searchType", config.searchType);
        }

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.resetLayers
        });

        this.listenTo(Radio.channel("ObliqueMap"), {
            "isActivated": this.controlListeningToSearchbar
        });

        if (store.state.urlParams && store.state.urlParams["Search/query"]) {
            // Carry out the initial search because a search parameter has been passed.
            this.search(store.state.urlParams && store.state.urlParams["Search/query"]);
        }

        this.resetLayers();
    },

    /**
     * reset layers - reset the layer to empty arry
     * @returns {void} -
     */
    resetLayers: function () {
        this.setLayers([]);
    },

    /**
     * Deactivates the topic search if the obliqueMap is activated.
     * Enables topic search when obliqueMap is disabled.
     * @param {boolean} value - includes whether the obliqueMap is active
     * @return {void}
     */
    controlListeningToSearchbar: function (value) {
        if (value) {
            this.stopListening(Radio.channel("Searchbar"), "search");
        }
        else {
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search
            });
        }
    },

    /**
     * Searches for hits for the search string in layer models.
     * @param {string} searchString - The input in the search bar.
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    search: function (searchString) {
        let searchStringRegExp = "",
            layersForSearch = [],
            uniqueLayerModels = [],
            folderModels = [],
            nodesForSearch = [];

        if (this.get("layers").length === 0) {
            uniqueLayerModels = this.getUniqeLayermodels(Radio.request("Parser", "getItemsByAttributes", {type: "layer"}));
            folderModels = Radio.request("Parser", "getOverlayer");
            uniqueLayerModels = this.removeLayerInCaseOfMissingConfig(uniqueLayerModels, store.getters.controlsConfig);
            layersForSearch = this.getLayerForSearch(uniqueLayerModels);
            nodesForSearch = this.getNodeForSearch(folderModels);
            this.setLayers(layersForSearch);
            this.setNodes(nodesForSearch);
        }
        if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
            this.set("inUse", true);
            try {
                searchStringRegExp = this.createRegExp(searchString);
            }
            catch (e) {
                console.warn(e);
                this.set("inUse", false);
            }
            this.searchInLayers(searchStringRegExp);
            this.searchInNodes(searchStringRegExp);
            Radio.trigger("Searchbar", "createRecommendedList", "tree");
            this.set("inUse", false);
        }
    },

    /**
     * Creates a regular Expression to handle special Characters like '('
     * @param {String} searchString - search string
     * @return {String} regExp String
     */
    createRegExp: function (searchString) {
        const string = searchString.replace(/ /g, ""),
            regExp = new RegExp(string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");

        return regExp;
    },

    /**
     * Executes the search in the node variable.
     * @param {string} searchStringRegExp - Suchstring as RegExp.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @returns {void}
     */
    searchInNodes: function (searchStringRegExp) {
        const nodes = this.get("nodes");

        nodes.forEach(node => {
            const nodeName = node.name.replace(/ /g, "");

            if (nodeName.search(searchStringRegExp) !== -1) {
                Radio.trigger("Searchbar", "pushHits", "hitList", node);
            }
        });
    },

    /**
     * Executes the search in the layer variable with search string and finds in the layer name and dataset name.
     * @param {string} searchStringRegExp - Suchstring as RegExp.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @returns {void}
     */
    searchInLayers: function (searchStringRegExp) {
        const searchType = this.get("searchType");

        this.get("layers").forEach(layer => {
            let searchString = "";

            if (searchType === "name" && layer.name !== undefined) {
                searchString = layer.name.replace(/ /g, "");
            }
            else if (searchType === "metadata" && layer.metaName !== undefined) {
                searchString = layer.metaName.replace(/ /g, "");
            }
            else if (layer.metaName !== undefined) {
                searchString = layer.metaName.replace(/ /g, "");
            }
            else if (layer.name !== undefined) {
                searchString = layer.name.replace(/ /g, "");
            }

            if (searchString.search(searchStringRegExp) !== -1) {
                Radio.trigger("Searchbar", "pushHits", "hitList", layer);
            }
        });
    },

    /**
     * Duplicate layers are removed so that each layer appears only once in the search,
     * even if it is contained in several categories
     * and several times if it exists several times with different records.
     * By name and id of layer model.
     * @param {object[]} [layerModels=[]] - LightModels of the itemList from Parser.
     * @param {string} layerModels[].name - The name of a layer model.
     * @param {string} layerModels[].id - The id of a layer model.
     * @returns {object[]} uniqueModels - Unique LightModels of the itemList from Parser.
     */
    getUniqeLayermodels: function (layerModels = []) {
        return layerModels.filter((model, index) => {
            const firstLayermodel = layerModels.find(element => element.id === model.id && element.name === model.name);

            return layerModels.indexOf(firstLayermodel) === index;
        });
    },

    /**
     * Removes oblique and 3D layers if the corresponding controls are not configured.
     * @param {Object[]} layerModels The layer models to search.
     * @param {Object} controlsConfig The config data of the controls.
     * @returns {Object[]} The filtered layer models, if necessary without 3D and Oblique layer.
     */
    removeLayerInCaseOfMissingConfig: function (layerModels, controlsConfig) {
        let filteredLayerModel = layerModels;

        if (!controlsConfig?.startTool?.tools || !controlsConfig?.startTool?.tools?.includes("vcOblique")) {
            filteredLayerModel = filteredLayerModel.filter(layerModel => layerModel?.typ?.toUpperCase() !== "OBLIQUE");
        }
        if (!controlsConfig?.button3d) {
            filteredLayerModel = filteredLayerModel.filter(layerModel => layerModel?.typ?.toUpperCase() !== "TILESET3D");
            filteredLayerModel = filteredLayerModel.filter(layerModel => layerModel?.typ?.toUpperCase() !== "TERRAIN3D");
        }

        return filteredLayerModel;
    },

    /**
     * Duplicate nodes are removed so that each node appears only once in the search,
     * by name of node.
     * @param {object[]} [nodes=[]] - Nodes.
     * @param {string} nodes[].name - The name of a node.
     * @returns {object[]} uniqueModels - Unique LightModels of the itemList from Parser.
     */
    getUniqeNodes: function (nodes = []) {
        return nodes.filter((model, index) => {
            const firstLayermodel = nodes.find(element => element.name === model.name);

            return nodes.indexOf(firstLayermodel) === index;
        });
    },

    /**
     * Creates new models for the search from the layerModels.
     * @param {object[]} [layerModelsUniqe=[]] - Unique LightModels of the itemList from Parser.
     * @param {string} layerModels[].name - The name of a layer model.
     * @param {string} layerModels[].id - The id of a layer model.
     * @returns {object[]} Layers for search.
     */
    getLayerForSearch: function (layerModelsUniqe = []) {
        const layersForsearch = [];

        layerModelsUniqe.forEach(model => {
            const treeType = Radio.request("Parser", "getTreeType"),
                parentId = model.parentId,
                // add path to each model
                path = this.getModelPath(model);
            let metaName,
                fachdatenName = treeType === "custom" ? store.state?.configJson?.Themenconfig?.Fachdaten?.name : undefined, // Use folder name from configuration, if available
                displayName = fachdatenName ? "Thema (" + fachdatenName + ")" : i18next.t("common:modules.searchbar.type.topic");

            // different type text for Baselayer
            if (treeType === "custom" && path === "" && parentId === "Baselayer") {
                // Use folder name from configuration, if available
                fachdatenName = treeType === "custom" ? store.state?.configJson?.Themenconfig?.Hintergrundkarten?.name : undefined;
                displayName = fachdatenName ? "Thema (" + fachdatenName + ")" : i18next.t("common:modules.searchbar.type.topicBaselayer");
            }

            if (path !== "" && this.get("searchType") !== "") {
                metaName = path;
            }
            else if (Array.isArray(model.datasets) && model.datasets.length > 0 && typeof model.datasets[0].md_name === "string") {
                metaName = model.name + " (" + model.datasets[0].md_name + ")";
            }
            else {
                metaName = model.name;
            }

            layersForsearch.push({
                name: model.name,
                metaName: metaName,
                type: displayName,
                icon: "bi-stack",
                id: model.id
            });
        });

        return layersForsearch;
    },

    /**
     * creates the path in the layertree of the given model
     * @param {Object} model - given model (layer or leaf folder)
     * @return {String} path - the path in the layertree
     */
    getModelPath: function (model) {
        const treeType = Radio.request("Parser", "getTreeType");
        let path = "";

        if (treeType === "custom") {
            const parentModelId = model?.parentId,
                itemList = Radio.request("Parser", "getItems"),
                topFolderNames = [],
                // all top folders in the overlayer section (currently BASISDATEN & FACHDATEN)
                overlayerFolders = itemList.filter(item => {
                    return item.parentId === "Overlayer" && item.type === "folder";
                }),
                // all top folders in the Baselayer section (currently none)
                baseLayerFolders = itemList.filter(item => {
                    return item.parentId === "Baselayer" && item.type === "folder";
                });

            // add the top overlayer folders to the topFolders
            overlayerFolders.forEach(folder => {
                topFolderNames.push({
                    id: folder.id,
                    name: folder.name
                });
            });
            // add the top baselayer folders to the topFolders
            baseLayerFolders.forEach(folder => {
                topFolderNames.push({
                    id: folder.id,
                    name: folder.name
                });
            });
            // Only add path for folders that are not the top folders in Overlayer or Baselayer section
            if (parentModelId && parentModelId !== "root" && parentModelId !== "Baselayer" && parentModelId !== "Overlayer") {
                const isParentTopFolderChild = topFolderNames.find(folder => {
                    return folder.id === parentModelId;
                });

                // is the parent model one of the top folders
                if (isParentTopFolderChild) {
                    // parse the name of the top folder
                    const topFolderName = isParentTopFolderChild?.name.toLowerCase(),
                        parsedTopFolderName = topFolderName.charAt(0).toUpperCase() + topFolderName.slice(1);

                    path = parsedTopFolderName;
                }
                else {
                    // get the parent model
                    const parentModel = itemList.find(item => {
                        return item.id === parentModelId;
                    });

                    // recursive call with the parent model and adding the parent model name to the path
                    path = this.getModelPath(parentModel) + "/" + parentModel?.name;
                }
            }
        }
        return path;
    },

    /**
     * Creates new models for the search for topictree folders
     * @param {object[]} nodeModels - Overlayer Models from Parser
     * @returns {object[]} Folders for search
     */
    getNodeForSearch: function (nodeModels = []) {
        const nodesForSearch = [],
            folders = [],
            allFolder = nodeModels?.Ordner ? nodeModels.Ordner : [],
            treeType = Radio.request("Parser", "getTreeType"),
            fachdatenName = treeType === "custom" ? store.state?.configJson?.Themenconfig?.Fachdaten?.name : undefined, // Use folder name from configuration, if available
            displayName = fachdatenName ? "Ordner (" + fachdatenName + ")" : i18next.t("common:modules.searchbar.type.folder"),
            nodeModelTitel = nodeModels.Titel,
            basePath = nodeModels.tooltip !== undefined ? nodeModels.tooltip + "/" + nodeModelTitel : ""; // if nodeModels already has a tooltip, set it as base path

        allFolder.forEach(node => {
            if (node.Ordner !== undefined && node.Ordner.length > 0) {
                node.Ordner.forEach(subfolder => {
                    let rekursionFolderForSearch = [],
                        nodePath = "";

                    if (treeType === "custom") {
                        // check if the subfolder already has a tooltip
                        if (subfolder.tooltip === undefined) {
                            // parse title of node
                            const nodeTitel = node?.Titel?.toLowerCase(),
                                nodeTitelParsed = nodeTitel.charAt(0).toUpperCase() + nodeTitel.slice(1);

                            // create the path for the node and add it to the subolder tooltip
                            nodePath = basePath !== "" ? basePath + "/" + nodeTitelParsed : nodeTitelParsed;
                            subfolder.tooltip = nodePath;
                        }
                        else {
                            nodePath = subfolder.tooltip;
                        }
                    }
                    folders.push(subfolder);
                    if (subfolder?.Ordner !== undefined) {
                        rekursionFolderForSearch = this.getNodeForSearch(subfolder);
                    }
                    rekursionFolderForSearch.forEach(model => {
                        nodesForSearch.push(model);
                    });
                });
                if (node.tooltip === undefined && treeType === "custom") {
                    node.tooltip = basePath;
                }
            }
            // add tooltip for node if current node has no subfolders
            else if (node.tooltip === undefined) {
                node.tooltip = basePath;
            }
            folders.push(node);
        });

        folders.forEach(model => {
            nodesForSearch.push({
                name: model.Titel,
                metaName: model?.tooltip,
                type: displayName,
                icon: "bi-folder-fill",
                id: model.id
            });
        });

        return nodesForSearch;
    },

    /**
     * Setter for layers.
     * @param {object[]} layers - Layers for search.
     * @returns {void}
     */
    setLayers: function (layers) {
        this.set("layers", layers);
    },

    /**
     * Setter for nodes.
     * @param {object[]} nodes - Nodes / folders for search.
     * @returns {void}
     */
    setNodes: function (nodes) {
        this.set("nodes", nodes);
    }
});

export default TreeModel;
