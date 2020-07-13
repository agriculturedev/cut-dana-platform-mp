import Backbone from "backbone";
import ModelList from "../modelList/list";
import {getLayerList} from "masterportalAPI/src/rawLayerList";

const Parser = Backbone.Model.extend(/** @lends Parser.prototype */{
    defaults: {
        itemList: [],
        overlayer: [],
        baselayer: [],
        portalConfig: {},
        treeType: "",
        categories: ["Opendata", "Inspire", "Behörde"],
        category: "Opendata",
        selectionIDX: -1,
        onlyDesktopTools: [
            "measure",
            "print",
            "kmlimport",
            "draw",
            "featureLister",
            "animation",
            "addWMS",
            "shadow"
        ]
    },

    /**
     * @class Parser
     * @description Parse the configured models from config datas
     * Models can be of type folder, layer, staticlink, tool, viewpoint, ...
     * @extends Backbone.Model
     * @memberof Core.ConfigLoader
     * @constructs
     * @property {Array} itemList=[] lightModels
     * @property {Array} overlayer=[] Themenconfig.Fachdaten
     * @property {Array} baselayer=[] Themenconfig.Hintergrundkarten
     * @property {Object} portalConfig={} Portalconfig
     * @property {String} treeType="" the attribute Baumtyp
     * @property {String[]} categories=["Opendata", "Inspire", "Behörde"] categories for Fachdaten in DefaultTree
     * @property {String} category="Opendata" selected category for Fachdaten in DefaultTree
     * @property {Number} selectionIDX=-1 Index of the last inserted layers. Required for sorting/moving (only for the treeType lightTree)
     * @property {String[]} onlyDesktopTools=["measure", "print", "kmlimport", "draw", "featureLister", "animation", "addWMS"]
     * @listens Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @listens Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @listens Core.ConfigLoader#RadioRequestParserGetTreeType
     * @listens Core.ConfigLoader#RadioRequestParserGetCategory
     * @listens Core.ConfigLoader#RadioRequestParserGetCategories
     * @listens Core.ConfigLoader#RadioRequestParserGetPortalConfig
     * @listens Core.ConfigLoader#RadioRequestParserGetItemsByMetaID
     * @listens Core.ConfigLoader#RadioRequestParserGetSnippetInfos
     * @listens Core.ConfigLoader#RadioRequestParserGetInitVisibBaselayer
     * @listens Core.ConfigLoader#RadioTriggerParsersetCategory
     * @listens Core.ConfigLoader#RadioTriggerParserAddItem
     * @listens Core.ConfigLoader#RadioTriggerParserAddItemAtTop
     * @listens Core.ConfigLoader#RadioTriggerParserAddItems
     * @listens Core.ConfigLoader#RadioTriggerParserAddFolder
     * @listens Core.ConfigLoader#RadioTriggerParserAddLayer
     * @listens Core.ConfigLoader#RadioTriggerParserAddGDILayer
     * @listens Core.ConfigLoader#RadioTriggerParserAddGeoJSONLayer
     * @listens Core.ConfigLoader#RadioTriggerParserRemoveItem
     * @listens Core.ConfigLoader#ChangeCategory
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsByParentId
     * @fires Core.ModelList#RadioTriggerModelListRenderTree
     * @fires Core.ModelList#RadioTriggerModelListSetModelAttributesById
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsById
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @fires Core.ModelList#RadioTriggerModelListShowModelInTree
     * @fires Core.ModelList#RadioTriggerModelListRefreshLightTree
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     */
    initialize: function () {
        const channel = Radio.channel("Parser");

        channel.reply({
            "getItemByAttributes": this.getItemByAttributes,
            "getItemsByAttributes": this.getItemsByAttributes,
            "getTreeType": function () {
                return this.get("treeType");
            },
            "getCategory": function () {
                return this.get("category");
            },
            "getCategories": function () {
                return this.get("categories");
            },
            "getPortalConfig": function () {
                return this.get("portalConfig");
            },
            "getItemsByMetaID": this.getItemsByMetaID,
            "getSnippetInfos": function () {
                return this.get("snippetInfos");
            },
            "getInitVisibBaselayer": this.getInitVisibBaselayer
        }, this);

        channel.on({
            "setCategory": this.setCategory,
            "addItem": this.addItem,
            "addItemAtTop": this.addItemAtTop,
            "addItems": this.addItems,
            "addFolder": this.addFolder,
            "addLayer": this.addLayer,
            "addGdiLayer": this.addGdiLayer,
            "addGeoJSONLayer": this.addGeoJSONLayer,
            "removeItem": this.removeItem
        }, this);

        this.listenTo(this, {
            "change:category": function () {
                const modelList = Radio.request("ModelList", "getCollection"),
                    modelListToRemove = modelList.filter(function (model) {
                        // Alle Fachdaten Layer
                        return model.get("type") === "layer" && model.get("parentId") !== "Baselayer";
                    });

                modelListToRemove.forEach(model => {
                    model.setIsSelected(false);
                });
                modelList.remove(modelListToRemove);
                this.setItemList([]);
                this.addTreeMenuItems();
                this.parseTree(getLayerList());
                Radio.trigger("ModelList", "removeModelsByParentId", "tree");
                Radio.trigger("ModelList", "renderTree");
                Radio.trigger("ModelList", "setModelAttributesById", "Overlayer", {isExpanded: true});
            }
        });

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": function (isViewMobile) {
                this.addOrRemove3DFolder(this.get("treeType"), isViewMobile, this.get("overlayer_3d"));
            }
        });

        this.parseMenu(this.get("portalConfig").menu, "root");
        this.parseControls(this.get("portalConfig").controls);
        this.parseSearchBar(this.get("portalConfig").searchBar);

        this.addItem({
            type: "featureViaURL",
            attr: this.get("portalConfig").featureViaURL
        });

        if (this.get("treeType") === "light") {
            this.parseTree(this.get("overlayer"), "tree", 0);
            this.parseTree(this.get("baselayer"), "tree", 0);
        }
        else if (this.get("treeType") === "custom") {
            this.addTreeMenuItems("custom", this.get("overlayer_3d"));
            this.parseTree(this.get("baselayer"), "Baselayer", 0);
            this.parseTree(this.get("overlayer"), "Overlayer", 0);
            this.parseTree(this.get("overlayer_3d"), "3d_daten", 0);
        }
        else {
            this.addTreeMenuItems(this.get("treeType"));
            this.parseTree(getLayerList(), this.get("overlayer_3d") ? this.get("overlayer_3d") : null);
        }
        this.createModelList();
    },

    /**
     * Parsed the menu entries (everything except the contents of the tree)
     * @param {Object} [items={}] Single levels of the menu bar, e.g. contact, legend, tools and tree
     * @param {String} parentId indicates to whom the items will be added
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     * @return {void}
     */
    parseMenu: function (items = {}, parentId) {
        Object.entries(items).forEach(itemX => {
            const value = itemX[1],
                key = itemX[0];
            let item,
                toolitem,
                ansicht,
                downloadItem;

            if (value.hasOwnProperty("children") || key === "tree") {
                item = {
                    type: "folder",
                    parentId: parentId,
                    id: key,
                    treeType: this.get("treeType"),
                    quickHelp: Radio.request("QuickHelp", "isSet")
                };

                // Attribute aus der config.json werden von item geerbt
                Object.assign(item, value);
                this.addItem(item);
                this.parseMenu(value.children, key);
            }
            else if (key.search("staticlinks") !== -1) {
                value.forEach(staticlink => {
                    toolitem = Object.assign(staticlink, {type: "staticlink", parentId: parentId, id: Radio.request("Util", "uniqueId", key + "_")});

                    this.addItem(toolitem);
                });
            }
            else if (value.hasOwnProperty("type") && value.type === "viewpoint") {
                ansicht = Object.assign(value, {parentId: parentId, id: Radio.request("Util", "uniqueId", key + "_")});
                this.addItem(ansicht);
            }
            else {
                toolitem = Object.assign(value, {type: "tool", parentId: parentId, id: key});

                // wenn tool noch kein "onlyDesktop" aus der Config bekommen hat
                if (!toolitem.hasOwnProperty("onlyDesktop")) {
                    // wenn tool in onlyDesktopTools enthalten ist, setze onlyDesktop auf true
                    if (this.get("onlyDesktopTools").indexOf(toolitem.id) !== -1) {
                        toolitem = Object.assign(toolitem, {onlyDesktop: true});
                    }
                }

                // special case because the download tool is only used in Drawtool
                if (toolitem.id === "draw") {
                    downloadItem = {
                        parentId: parentId,
                        type: "tool",
                        id: "download",
                        isVisibleInMenu: false
                    };

                    this.addItem(downloadItem);
                }
                this.addItem(toolitem);
            }
        }, this);
    },

    /**
     * todo
     * @param  {Object} searchbarConfig - todo
     * @return {void}
     */
    parseSearchBar: function (searchbarConfig) {
        this.addItem({
            type: "searchBar",
            attr: searchbarConfig
        });
    },

    /**
     * todo
     * @param  {object} [items={}] - todo
     * @return {void}
     */
    parseControls: function (items = {}) {
        Object.entries(items).forEach(item => {
            const value = item[1],
                key = item[0];

            this.addItem({
                type: "control",
                id: key,
                attr: value
            });
        });
    },

    /**
     * Adds an item(layer, folder, ...) to the end of the attribute "itemList".
     * @param {Object} obj - Item
     * @return {void}
     */
    addItem: function (obj) {
        if (obj.visibility !== undefined) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").push(obj);
    },

    /**
     * Adds an item(layer, folder, ...) to the attribute "itemList" at the specified position.
     * @param {Object} obj - Item
     * @param {Number} position - position in ItemList
     * @return {void}
     */
    addItemByPosition: function (obj, position) {
        if (obj.visibility !== undefined) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").splice(position, 0, obj);
    },

    /**
     *  Allows to create an array of objects that all have attr in common
     *  @param {array} objs Array of related objects, e.g. categories in Themenbaum
     *  @param {object} attr Layerobject
     *  @return {void}
     */
    addItems: function (objs, attr) {
        objs.forEach(obj => {
            this.addItem(Object.assign(obj, attr));
        });
    },

    /**
     * Creates a new folder and adds it.
     * @param {String} name - name of the folder
     * @param {String} id - id of the layer
     * @param {String} parentId - id of the parent
     * @param {Number} level - level of the folder
     * @param {Boolean} isExpanded - if true, folder will be expanded
     * @param {String} i18nKey - key for the name to translate
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     * @returns {void}
     */
    addFolder: function (name, id, parentId, level, isExpanded, i18nKey) {
        const folder = {
            type: "folder",
            name: i18nKey ? i18next.t(i18nKey) : name,
            i18nextTranslate: i18nKey ? function (setter) {
                if (typeof setter === "function" && i18next.exists(i18nKey)) {
                    setter("name", i18next.t(i18nKey));
                }
            } : null,
            glyphicon: "glyphicon-plus-sign",
            id: id,
            parentId: parentId,
            isExpanded: isExpanded ? isExpanded : false,
            level: level,
            quickHelp: Radio.request("QuickHelp", "isSet")
        };

        this.addItem(folder);
    },

    /**
     * todo
     * @param {*} name - todo
     * @param {*} id - todo
     * @param {*} parentId - todo
     * @param {*} level - todo
     * @param {*} layers - todo
     * @param {*} url - todo
     * @param {*} version - todo
     * @returns {void}
     */
    addLayer: function (name, id, parentId, level, layers, url, version) {
        const layer = {
            cache: false,
            datasets: [],
            featureCount: 3,
            format: "image/png",
            gfiAttributes: "showAll",
            gutter: "0",
            id: id,
            isBaseLayer: false,
            layerAttribution: "nicht vorhanden",
            layers: layers,
            legendURL: "",
            level: level,
            maxScale: "2500000",
            minScale: "0",
            name: name,
            parentId: parentId,
            singleTile: false,
            supported: ["2D", "3D"],
            tilesize: "512",
            transparent: true,
            typ: "WMS",
            type: "layer",
            url: url,
            urlIsVsible: true,
            version: version
        };

        this.addItem(layer);
    },

    /**
     * todo
     * @param {*} name - todo
     * @param {*} id - todo
     * @param {*} geojson - todo
     * @param {String} styleId Id for the styling of the features.
     * @returns {void}
     */
    addGeoJSONLayer: function (name, id, geojson, styleId) {
        const layer = {
            type: "layer",
            name: name,
            id: id,
            typ: "GeoJSON",
            geojson: geojson,
            transparent: true,
            minScale: "0",
            maxScale: "350000",
            gfiAttributes: "showAll",
            layerAttribution: "nicht vorhanden",
            legendURL: "",
            isBaseLayer: false,
            isSelected: true,
            isVisibleInTree: true,
            cache: false,
            datasets: [],
            urlIsVsible: true,
            styleId: styleId
        };

        this.addItem(layer);
    },


    /**
     * Adds found layer to layer tree
     * @param {Object} hit layer to be added
     * @fires Core.ModelList#RadioTriggerModelListRenderTree
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @fires Core.ModelList#RadioTriggerModelListShowModelInTree
     * @fires Core.ModelList#RadioTriggerModelListRefreshLightTree
     * @returns {void}
     */
    addGdiLayer: function (hit) {
        const treeType = this.get("treeType");
        let level = 0,
            layerTreeId,
            parentId = "tree",
            gdiLayer = {
                cache: false,
                featureCount: "3",
                format: "image/png",
                gutter: "0",
                isChildLayer: false,
                isSelected: true,
                isVisibleInTree: true,
                layerAttribution: "nicht vorhanden",
                legendURL: "",
                maxScale: "2500000",
                minScale: "0",
                singleTile: false,
                tilesize: "512",
                transparency: 0,
                transparent: true,
                typ: "WMS",
                type: "layer",
                urlIsVsible: true
            };

        if (hit.source) {
            // check if layer is already in layer tree
            layerTreeId = this.getItemByAttributes({id: hit.source.id});
            if (!layerTreeId) {

                if (treeType === "custom") {
                    // create folder and add it as "Externe Fachdaten"
                    parentId = "extthema";
                    level = 2;
                    if (!this.getItemByAttributes({id: "ExternalLayer"})) {
                        this.addFolder("Externe Fachdaten", "ExternalLayer", "tree", 0, false, "common:tree.externalTechnicalData");
                        Radio.trigger("ModelList", "renderTree");
                        $("#Overlayer").parent().after($("#ExternalLayer").parent());
                    }
                    if (!this.getItemByAttributes({id: parentId})) {
                        this.addFolder("Fachthema", parentId, "ExternalLayer", 1, true, "common:tree.subjectData");
                    }
                }
                gdiLayer = Object.assign(gdiLayer, {
                    name: hit.source.name,
                    id: hit.source.id,
                    parentId: parentId,
                    level: level,
                    layers: hit.source.layers,
                    url: hit.source.url,
                    version: hit.source.version,
                    gfiAttributes: hit.source.gfiAttributes ? hit.source.gfiAttributes : "showAll",
                    datasets: hit.source.datasets,
                    isJustAdded: true
                });
                this.addItemAtTop(gdiLayer);
                Radio.trigger("ModelList", "addModelsByAttributes", {id: hit.source.id});
            }

            Radio.trigger("ModelList", "showModelInTree", hit.source.id);
            if (treeType === "light") {
                Radio.trigger("ModelList", "refreshLightTree");
            }
        }
        else {
            console.error("Es konnte kein Eintrag für Layer " + hit.source.id + " in ElasticSearch gefunden werden.");
        }
    },

    /**
     * Adds an item(layer, folder, ...) at the beginning to the attribute "itemList
     * @param {Object} obj - Item
     * @return {void}
     */
    addItemAtTop: function (obj) {
        if (obj.visibility !== undefined) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").unshift(obj);
    },

    /**
     * get an item from itemList by a given value
     * @param  {Object} value - todo
     * @return {Object} item
     */
    getItemByAttributes: function (value) {
        return this.get("itemList").find(item => Object.keys(value).every(key => item[key] === value[key]));
    },

    /**
     * get one ore more item from itemList by a given value
     * @param  {Object} value - t odo
     * @return {Array} Items
     */
    getItemsByAttributes: function (value) {
        return this.get("itemList").filter(item => Object.keys(value).every(key => item[key] === value[key]));
    },

    /**
     * removes an item from itemList by a given id
     * @param {String} id - id from item that be removed
     * @returns {void}
     */
    removeItem: function (id) {
        const itemList = this.get("itemList").filter(function (item) {
            return item.id !== id;
        });

        this.setItemList(itemList);
    },

    /**
     * todo
     * @return {ModelList} todo
     */
    createModelList: function () {
        new ModelList(this.get("itemList").filter(function (model) {
            return model.parentId === "root" ||
                model.parentId === "tools" ||
                model.parentId === "info" ||
                model.parentId === "bezirke" ||
                model.parentId === "3d_daten" ||
                model.parentId === "simulation" ||
                model.parentId === "utilities" ||
                model.parentId === "ansichten";
        }));
    },

    /**
     * regulates the folder structure of the theme tree taking into account the map mode
     * @param {String} treeType - type of topic tree
     * @fires Core#RadioRequestUtilIsViewMobile
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     * @returns {void}
     */
    addTreeMenuItems: function (treeType) {
        const menu = this.get("portalConfig").hasOwnProperty("menu") ? this.get("portalConfig").menu : undefined,
            tree = menu !== undefined && menu.hasOwnProperty("tree") ? menu.tree : undefined,
            isAlwaysExpandedList = tree !== undefined && tree.hasOwnProperty("isAlwaysExpanded") ? tree.isAlwaysExpanded : [],
            isMobile = Radio.request("Util", "isViewMobile"),
            baseLayers = this.get("baselayer"),
            overLayers = this.get("overlayer"),
            overLayers3d = this.get("overlayer_3d"),
            baseLayersName = baseLayers && baseLayers.hasOwnProperty("name") ? baseLayers.name : null,
            overLayersName = overLayers && overLayers.hasOwnProperty("name") ? overLayers.name : null,
            overLayers3DName = overLayers3d && overLayers3d.hasOwnProperty("name") ? overLayers3d.name : null,
            isQuickHelpSet = Radio.request("QuickHelp", "isSet"),
            baseLayersDefaultKey = "common:tree.backgroundMaps",
            overLayersDefaultKey = "common:tree.subjectData";
        let baseLayerI18nextTranslate = null,
            overLayerI18nextTranslate = null;

        if (!baseLayersName && !baseLayers.i18nextTranslate) {
            // no name and no translation-function found: provide translation of default key
            baseLayerI18nextTranslate = function (setter) {
                if (typeof setter === "function" && i18next.exists(baseLayersDefaultKey)) {
                    setter("name", i18next.t(baseLayersDefaultKey));
                }
            };
        }
        if (!overLayersName && !overLayers.i18nextTranslate) {
            // no name and no translation-function found: provide translation of default key
            overLayerI18nextTranslate = function (setter) {
                if (typeof setter === "function" && i18next.exists(overLayersDefaultKey)) {
                    setter("name", i18next.t(overLayersDefaultKey));
                }
            };
        }
        this.addItem({
            type: "folder",
            name: baseLayersName ? baseLayersName : i18next.t(baseLayersDefaultKey),
            i18nextTranslate: baseLayers.i18nextTranslate ? baseLayers.i18nextTranslate : baseLayerI18nextTranslate,
            glyphicon: "glyphicon-plus-sign",
            id: "Baselayer",
            parentId: "tree",
            isInThemen: true,
            isInitiallyExpanded: false,
            isAlwaysExpanded: isAlwaysExpandedList.includes("Baselayer"),
            level: 0,
            quickHelp: isQuickHelpSet
        });

        this.addOrRemove3DFolder(treeType, isMobile, overLayers3d, overLayers3DName);

        this.addItem({
            type: "folder",
            name: overLayersName ? overLayersName : i18next.t(overLayersDefaultKey),
            i18nextTranslate: overLayers.i18nextTranslate ? overLayers.i18nextTranslate : overLayerI18nextTranslate,
            glyphicon: "glyphicon-plus-sign",
            id: "Overlayer",
            parentId: "tree",
            isInThemen: true,
            isInitiallyExpanded: false,
            isAlwaysExpanded: isAlwaysExpandedList.includes("Overlayer"),
            level: 0,
            quickHelp: isQuickHelpSet
        });
        this.addItem({
            type: "folder",
            name: i18next.t("common:tree.selectedTopics"),
            i18nextTranslate: function (setter) {
                if (typeof setter === "function" && i18next.exists("common:tree.selectedTopics")) {
                    setter("name", i18next.t("common:tree.selectedTopics"));
                }
            },
            glyphicon: "glyphicon-plus-sign",
            id: "SelectedLayer",
            parentId: "tree",
            isLeafFolder: true,
            isInThemen: true,
            isInitiallyExpanded: true,
            isAlwaysExpanded: isAlwaysExpandedList.includes("SelectedLayer"),
            level: 0,
            quickHelp: isQuickHelpSet
        });
    },

    /**
     * adds or removes a folder for 3d data to topic tree considering the map mode
     * @param {String} treeType type of tree
     * @param {boolean} isMobile vsible map mode from portal
     * @param {object} overLayer3d contains layer fro 3d mode
     * @param {String} overLayers3DName name of the layer
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsById
     * @returns {void}
     */
    addOrRemove3DFolder: function (treeType, isMobile, overLayer3d, overLayers3DName) {
        const id3d = "3d_daten";

        if (!isMobile && (treeType === "default" || overLayer3d !== undefined)) {
            const defaultKey = "common:tree.subjectData3D";
            let i18nextTranslate = null;

            if (!overLayers3DName && !overLayer3d.i18nextTranslate) {
                // no name and no translation-function found: provide translation of default key
                i18nextTranslate = function (setter) {
                    if (typeof setter === "function" && i18next.exists(defaultKey)) {
                        setter("name", i18next.t(defaultKey));
                    }
                };
            }
            this.addItemByPosition({
                type: "folder",
                name: overLayers3DName ? overLayers3DName : i18next.t(defaultKey),
                i18nextTranslate: overLayer3d.i18nextTranslate ? overLayer3d.i18nextTranslate : i18nextTranslate,
                id: id3d,
                parentId: "tree",
                isInThemen: true,
                isInitiallyExpanded: false,
                level: 0,
                quickHelp: Radio.request("QuickHelp", "isSet")
            }, this.postionFor3DFolder(this.get("itemList")));
        }
        else {
            this.removeItem(id3d);
            Radio.trigger("ModelList", "removeModelsById", id3d);
        }
    },

    /**
     * get the position where the 3d folder has to be inserted in the itemlist
     * @param {array} itemList - contains the items
     * @returns {number} postion for 3d folder
     */
    postionFor3DFolder: function (itemList) {
        let position = itemList.length + 1;

        itemList.forEach((item, index) => {
            if (item.name === "Hintergrundkarten") {
                position = index + 1;
            }
        });

        return position;
    },

    /**
     * Groups objects from the layerlist that match the IDs in the passed list.
     * @param  {string[]} [ids=[]] - Array of ids whose objects are grouped together
     * @param  {Object[]} [layerlist=[]] - Objects from the services.json
     * @return {Object[]} layerlist - Objects from the services.json
     */
    mergeObjectsByIds: function (ids = [], layerlist = []) {
        const objectsByIds = [],
            maxScales = [],
            minScales = [];
        let newObject = {};

        // Objekte die gruppiert werden
        ids.forEach(id => {
            const lay = layerlist.find(layer => layer.id === id);

            if (lay) {
                objectsByIds.push(lay);
            }
        });

        // Wenn nicht alle LayerIDs des Arrays gefunden werden
        if (objectsByIds.length !== ids.length) {
            return null;
        }
        // Das erste Objekt wird kopiert
        newObject = {...objectsByIds[0]};
        // Das Attribut layers wird gruppiert und am kopierten Objekt gesetzt
        newObject.layers = objectsByIds.map(value => value.layers).toString();
        // Das Attribut maxScale wird gruppiert
        // Am kopierten Objekt wird der höchste Wert gesetzt
        objectsByIds.forEach(object => maxScales.push(parseInt(object.maxScale, 10)));
        newObject.maxScale = Math.max(...maxScales);

        // Das Attribut minScale wird gruppiert
        // Am kopierten Objekt wird der niedrigste Wert gesetzt
        objectsByIds.forEach(object => minScales.push(parseInt(object.minScale, 10)));
        newObject.minScale = Math.min(...minScales);

        return newObject;
    },

    /**
     * Generates a Uniq ID with prefix
     * Before that, all spaces are removed from the prefix.
     * @param  {String} value - Prefix for Uniq-Id
     * @return {String} value - Uniq-Id
     */
    createUniqId: function (value) {
        const trimmedValue = value.replace(/[^a-zA-Z0-9]/g, "");

        return Radio.request("Util", "uniqueId", trimmedValue);
    },

    /**
     * todo
     * @param {*} metaID - todo
     * @returns {*} todo
     */
    getItemsByMetaID: function (metaID) {
        const layers = this.get("itemList").filter(function (item) {
            if (item.type === "layer") {
                if (item.datasets.length > 0) {
                    return item.datasets[0].md_id === metaID;
                }
            }
            return false;
        }, this);

        return layers;
    },

    /**
     * Returns the initial visible baselayer from config.json.
     * for array several id only the first one is passed
     * @return {String} layer initial visible baselayer
     */
    getInitVisibBaselayer: function () {
        const layer = this.get("baselayer").Layer.find(singleLayer => singleLayer.visibility === true);

        if (layer === undefined) {
            return undefined;
        }

        if (Array.isArray(layer.id)) {
            layer.id = layer.id[0];
        }
        return layer;
    },

    /**
     * Setter for attribute "itemList"
     * @param {*} value - todo
     * @returns {void}
     */
    setItemList: function (value) {
        this.set("itemList", value);
    },

    /**
     * Setter for attribute "itemList"
     * @param {*} value - todo
     * @returns {void}
     */
    setBaselayer: function (value) {
        this.set("baselayer", value);
    },

    /**
     * Setter for attribute "overlayer"
     * @param {*} value - todo
     * @returns {void}
     */
    setOverlayer: function (value) {
        this.set("overlayer", value);
    },

    /**
     * Setter for attribute "treeType"
     * @param {*} value - todo
     * @returns {void}
     */
    setTreeType: function (value) {
        this.set("treeType", value);
    },

    /**
     * Setter for attribute "category"
     * @param {*} value - todo
     * @returns {void}
     */
    setCategory: function (value) {
        this.set("category", value);
    }
});

export default Parser;
