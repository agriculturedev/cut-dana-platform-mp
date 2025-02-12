import {generateSimpleGetters} from "../shared/js/utils/generators";
import getNestedValues from "../shared/js/utils/getNestedValues";
import searchInTree from "../shared/js/utils/searchInTree";
import {sortObjects} from "../shared/js/utils/sortObjects";
import stateAppStore from "./state";
import {treeBaselayersKey, treeSubjectsKey} from "../shared/js/utils/constants";

/**
 * The root getters.
 * @module app-store/getters
 */
export default {
    ...generateSimpleGetters(stateAppStore),

    /**
     * Returns the active category configured in config.json unter 'tree'.
     * @param {Object} state state of the app-store.
     * @returns {Object|null} The active category or the first one or null if not found
     */
    activeOrFirstCategory: state => {
        const categories = state.portalConfig?.tree?.categories;

        if (Array.isArray(categories) && categories.length > 0) {
            const activeCategory = categories.filter(category => category.active === true);

            if (activeCategory) {
                return activeCategory[0];
            }
            return categories[0];
        }
        return null;
    },

    /**
     * Returns all categories defined in config.json.
     * @param {Object} state state of the app-store.
     * @returns {Array} all categories defined in config.json
     */
    allCategories: state => {
        return state.portalConfig?.tree?.categories;
    },

    /**
     * Returns the configured value for singleBaselayer.
     * @param {Object} state state of the app-store.
     * @returns {Array} value for singleBaselayer
     */
    singleBaselayer: state => {
        return state.portalConfig?.tree?.singleBaselayer;
    },


    /**
     * Returns whether all configs were loaded.
     * @param {Object} state state of the app-store.
     * @returns {Boolean} True, if all configs are loaded.
     */
    allConfigsLoaded: state => {
        return Object.values(state.loadedConfigs).every(value => value === true);
    },

    /**
     * Returns all layers of layerConfig.
     * @param {Object} state state of the app-store.
     * @returns {Object[]} The layers.
     */
    allLayerConfigs: state => {
        return getNestedValues(state.layerConfig, "elements", true).flat(Infinity);
    },

    /**
     * Returns all folders in the layerConfig.
     * @param {Object} state state of the app-store.
     * @returns {Array} all folders in the layerConfig
     */
    allFolders: state => {
        return searchInTree(state.layerConfig[treeSubjectsKey], "elements", "type", "folder");
    },

    /**
     * Returns a folder by id.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object} a folder by id
     */
    folderById: (state, getters) => (id) => {
        const folders = getters.allFolders;

        return folders.find(folder => folder.id === id);
    },

    /**
     * Returns all layers configs under the given parent-key.
     * @param {Object} state state of the app-store.
     * @param {String} parentKey the parentKey
     * @returns {Object[]} all layers configs under the given parent-key.
     */
    allLayerConfigsByParentKey: state => (parentKey) => {
        return getNestedValues(state.layerConfig[parentKey], "elements", true).flat(Infinity);
    },

    /**
     * Returns all layer-configs structured with children. If key of first level is given, only the layer-configs under this key are returned.
     * @param {Object} state state of the app-store.
     * @param {String|null} key of first level to get the configs for. If null all configs are returned.
     * @returns {Array} layer-configs structured with children
     */
    allLayerConfigsStructured: (state) => (key = null) =>{
        const configs = [];

        Object.keys(state.layerConfig).forEach(layerConfigKey => {
            if (!key || layerConfigKey === key) {
                Object.keys(state.layerConfig[layerConfigKey]).forEach(subKey => {
                    if (Array.isArray(state.layerConfig[layerConfigKey][subKey])) {
                        state.layerConfig[layerConfigKey][subKey].forEach(conf => {
                            configs.push(conf);
                        });
                    }
                });
            }
        });
        return configs;
    },

    /**
     * Returns all subject data layers of layerConfig.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object[]} The layers.
     */
    allSubjectDataLayerConfigs: (state, getters) => {
        return getters.allLayerConfigsByParentKey(treeSubjectsKey);
    },
    /**
     * Returns all baselayers of layerConfig.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object[]} The layers.
     */
    allBaselayerConfigs: (state, getters) => {
        return getters.allLayerConfigsByParentKey(treeBaselayersKey);
    },

    /**
     * Returns path to the cesium library.
     * @param {Object} state state of the app-store.
     * @returns {String} The cesium library path.
     */
    cesiumLibrary: state => {
        return state.configJs?.cesiumLibrary || "https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/Cesium.js";
    },

    /**
     * Returns the configured value for twoFingerPan.
     * @param {Object} state state of the app-store.
     * @returns {Boolean} value for twoFingerPan
     */
    twoFingerPan: state => {
        return state.portalConfig?.map?.mapView?.mapInteractions?.interactionModes?.twoFingerPan;
    },

    /**
     * Returns the controls configuration of portalConfig.
     * @param {Object} state state of the app-store.
     * @returns {Object} The controls config.
     */
    controlsConfig: state => {
        return state.portalConfig?.map?.controls || {};
    },

    /**
     * Returns the content of all menu sections and of controls startModule menu entries.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Array} configs of all modules in sections and controls
     */
    configuredModules: (state, getters) => {
        let content = [];

        getters.menuFromConfig("mainMenu").sections?.forEach(subSections => {
            content = content.concat(subSections);
        });
        getters.menuFromConfig("secondaryMenu").sections?.forEach(subSections => {
            content = content.concat(subSections);
        });
        if (getters.controlsConfig.startModule?.mainMenu) {
            content = content.concat(getters.controlsConfig.startModule.mainMenu);
        }
        if (getters.controlsConfig.startModule?.secondaryMenu) {
            content = content.concat(getters.controlsConfig.startModule.secondaryMenu);
        }
        return content;
    },

    /**
     * Returns the max zIndex of layer configs by parentKey.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @param {String} parentKey key of the parent
     * @returns {Number} the max zIndex
     */
    maxZIndexOfLayerConfigsByParentKey: (state, getters) => (parentKey) => {
        let maxZIndex = -1;
        const layerConfigs = getters.allLayerConfigsByParentKey(parentKey).filter(config => Object.prototype.hasOwnProperty.call(config, "zIndex") && typeof config.zIndex === "number");

        if (layerConfigs.length > 0) {
            maxZIndex = Math.max(...layerConfigs.map(conf => conf.zIndex));
        }
        return maxZIndex;
    },

    /**
     * Returns the zIndex for the given layerConfig. If zIndex already exists at layerConfig, it is returned.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @param {String} id id of the layer
     * @returns {Number|null} the zIndex for the given layerConfig or null if layerConfig is not available
     */
    determineZIndex: (state, getters) => (id) => {
        const layerConf = getters.layerConfigById(id);

        if (layerConf) {
            if (Object.prototype.hasOwnProperty.call(layerConf, "zIndex") && typeof layerConf.zIndex === "number") {
                return layerConf.zIndex;
            }
            let maxZIndex = -1;
            const isBaselayer = Object.prototype.hasOwnProperty.call(layerConf, "baselayer") && layerConf.baselayer,
                parentKey = isBaselayer ? treeBaselayersKey : treeSubjectsKey;

            maxZIndex = getters.maxZIndexOfLayerConfigsByParentKey(parentKey);
            if (maxZIndex === -1) {
                if (isBaselayer) {
                    maxZIndex = getters.maxZIndexOfLayerConfigsByParentKey(treeSubjectsKey);
                }
                else {
                    maxZIndex = getters.maxZIndexOfLayerConfigsByParentKey(treeBaselayersKey);
                }
            }

            return maxZIndex + 1;
        }
        return null;
    },

    /**
     * Return the featureViaURL configuartion in config.json.
     * @param {Object} state state of the app-store.
     * @returns {Object} The featureViaURL configuartion in config.json
     */
    featureViaURL: state => {
        return state?.portalConfig?.map?.featureViaURL || {};
    },

    /**
     * Gets the value to an url parameter.
     * @param {Object} state state of the app-store.
     * @param {String} param The url parameter.
     * @returns {String} The value to the given url parameter.
     */
    getUrlParamValue: state => param => {
        return state.urlParams[param.toUpperCase()];
    },

    /**
     * Returns the ignored keys configuration of config.js.
     * @param {Object} state state of the app-store.
     * @returns {String[]} The ignored keys config.
     */
    ignoredKeys: state => {
        return state.configJs?.ignoredKeys || [];
    },

    /**
     * Returns all not visible baselayer configurations.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object[]} The layers.
     */
    invisibleBaselayerConfigs: (state, getters) => {
        const layerContainer = getters.allBaselayerConfigs;

        return layerContainer.filter(layerConf => layerConf.visibility !== true);
    },

    /**
     * Returns the layer is a baselayer or not
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Boolean} Is baselayer.
     */
    isBaselayer: (state, getters) => layerId => {
        const layerConfig = getters.allLayerConfigs.find(layerConf => layerConf.id === layerId);

        return Boolean(layerConfig.baselayer);
    },

    /**
     * Returns if mobile device is used.
     * @param {Object} state state of the app-store.
     * @returns {Boolean} Mobile is used.
     */
    isMobile: state => {
        return state.deviceMode === "Mobile";
    },

    /**
     * Returns true, if moduleName is available in a menu.
     * @param {Object} state state of the app-store.
     * @param {String} moduleType type of the module
     * @returns {Boolean} true, if moduleName is configured in a menu.
     */
    isModuleAvailable: state => moduleType => {
        return JSON.stringify(state.portalConfig).includes("\"type\":\"" + moduleType + "\"");
    },

    /**
     * Filters the layer configs by the given attributes.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Array} filtered layer configs by the given attributes
     */
    layerConfigsByAttributes: (state, getters) => (attributes = {}) =>{
        const layerContainer = getters.allLayerConfigs;

        return layerContainer.filter(layerConf => {
            return Object.entries(attributes).every(([key, value]) => {
                // @todo implementieren
                if (typeof value === "object") {
                    throw Error("Not implemented for objects values", value);
                }
                else if (Array.isArray(value)) {
                    throw Error("Not implemented for array values", value);
                }
                return layerConf[key] === value;
            });
        });
    },

    /**
     * Returns the layer configuration with the given id.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @param {String} id id of the layer
     * @returns {Object|null}} the layer configuration with the given id
     */
    layerConfigById: (state, getters) => (id) => {
        const layerContainer = getters.allLayerConfigs;

        return layerContainer.find(layerConf => layerConf.id === id);
    },

    /**
     * Returns the layer configs for url params.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object[]} The layerConfigs for url params.
     */
    layerUrlParams: (state, getters) => {
        const layers = getters.layerConfigsByAttributes({showInLayerTree: true}),
            layerParams = [];

        sortObjects(layers, "zIndex");
        layers.forEach(layer => {
            const param = {
                id: layer.id
            };

            if (layer.visibility !== undefined) {
                param.visibility = layer.visibility;
            }
            else {
                param.visibility = false;
            }

            if (layer.transparency) {
                param.transparency = layer.transparency;
            }

            layerParams.push(param);
        });

        return layerParams || [];
    },

    /**
     * Returns the map3d parameter settings configuration of portalConfig.
     * @param {Object} state state of the app-store.
     * @returns {Object} The map3d parameter config.
     */
    map3dParameter: state => {
        return state.portalConfig?.map.map3dParameter || {};
    },

    /**
     * Returns the map marker configuration of portalConfig.
     * @param {Object} state state of the app-store.
     * @returns {Object} The map marker config.
     */
    mapMarker: state => {
        return state.portalConfig?.map.mapMarker || {};
    },

    /**
     * Returns the mapView settings configuration of portalConfig.
     * @param {Object} state state of the app-store.
     * @returns {Object} The map view settings.
     */
    mapViewSettings: state => {
        return state.portalConfig?.map.mapView || {};
    },

    /**
     * Returns the menu of portalConfig by side.
     * @param {Object} state state of the app-store.
     * @returns {Object} Main menu.
     */
    menuFromConfig: state => side => {
        return state.portalConfig[side] || {};
    },

    /**
     * Returns the named projections from config.js.
     * @param {Object} state state of the app-store.
     * @returns {Array}  the named projections from config.js
     */
    namedProjections: state => state?.configJs.namedProjections || null,

    /**
     * Returns proxyHost if given.
     * @param {Object} state state of the app-store.
     * @returns {String} proxhost if given or empty proxyHost
     */
    proxyHost: state => state?.configJs?.proxyHost || "",

    /**
     * Returns a rest service from restConf by ID
     * @param {Object} state the store state
     * @param {String} id The id for rest service
     * @returns {Object} the rest service config object
     */
    restServiceById: state => id => {
        return state?.restConfig?.find(service => service.id === id);
    },

    /**
     * Return the highlighted features.
     * @param {Object} state state of the app-store.
     * @returns {Object|Boolean} The highlighted features.
     */
    treeHighlightedFeatures: state => {
        return state?.portalConfig?.tree?.highlightedFeatures || false;
    },

    /**
     * Return the tree configuartion in config.json.
     * @param {Object} state state of the app-store.
     * @returns {Object|Boolean} the tree configuartion in config.json
     */
    treeConfig: state => {
        return state?.portalConfig?.tree;
    },

    /**
     * Returns the configured value for showFolderPath, default is true.
     * @param {Object} state state of the app-store.
     * @returns {Boolean} value for showFolderPath
     */
    showFolderPath: state => {
        return typeof state.portalConfig?.tree?.showFolderPath === "boolean" ? state.portalConfig?.tree?.showFolderPath : false;
    },

    /**
     * Returns tree.addLayerButton.active or true, if tree.type is "auto".
     * @param {Object} state state of the app-store.
     * @returns {Boolean} true, if a button to add layers is configured
     */
    showLayerAddButton: state => {
        return typeof state?.portalConfig?.tree?.addLayerButton === "object" ? state.portalConfig.tree.addLayerButton.active : state?.portalConfig?.tree?.type === "auto";
    },

    /**
     * Returns the starting map mode configuration of portalConfig.
     * @param {Object} state state of the app-store.
     * @returns {String} The map mode.
     */
    startingMapMode: state => {
        return state.portalConfig?.map.startingMapMode || "2D";
    },

    /**
     * Returns the ui style of configJs.
     * @param {Object} state state of the app-store.
     * @returns {Object} The ui style.
     */
    uiStyle: state => {
        return state.configJs?.uiStyle?.toUpperCase() || "DEFAULT";
    },

    /**
     * Returns all visible layer configurations.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object[]} Containing all layer configurations with property 'visibility' is true.
     */
    visibleLayerConfigs: (state, getters) => {
        const layerContainer = getters.allLayerConfigs;

        return layerContainer.filter(layerConf => layerConf.visibility === true);
    },

    /**
     * Returns all visible subject data layer configurations.
      * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object[]} Containing all layer configurations with property 'visibility' is true.
     */
    visibleSubjectDataLayerConfigs: (state, getters)=> {
        const layerContainer = getters.allSubjectDataLayerConfigs;

        return layerContainer.filter(layerConf => layerConf.visibility === true);
    },

    /**
     * Returns all visible baselayer configurations.
     * @param {Object} state state of the app-store.
     * @param {Object} getters getters of the app-store.
     * @returns {Object[]} The layers with property 'visibility' is not true.
     */
    visibleBaselayerConfigs: (state, getters) => {
        const layerContainer = getters.allBaselayerConfigs;

        return layerContainer.filter(layerConf => layerConf.visibility === true);
    },

    /**
     * Return the zoomTo configuartion in config.json.
     * @param {Object} state state of the app-store.
     * @returns {Object} The zoomTo configuartion in config.json
     */
    zoomTo: state => {
        return state?.portalConfig?.map?.zoomTo;
    }
};

