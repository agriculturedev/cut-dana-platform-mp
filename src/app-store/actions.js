import axios from "axios";
import {rawLayerList} from "@masterportal/masterportalapi/src";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";

import actionsLayerConfig from "./actionsLayerConfig";
import {fetchFirstModuleConfig} from "../shared/js/utils/fetchFirstModuleConfig";
import {portalConfigKey, treeTopicConfigKey} from "../shared/js/utils/constants";
import {updateProxyUrl} from "./js/getProxyUrl";
import {upperFirst} from "../shared/js/utils/changeCase";

/**
 * The root actions.
 * @module app-store/actions
 */
export default {
    ...actionsLayerConfig,

    /**
     * Check/adapt for proxy configs and commit the loaded config.js to the state.
     * @param {Object} context the vue context
     * @param {Object} context.commit the commit
     * @param {Object} configJs The config.js
     * @returns {void}
     */
    loadConfigJs ({commit}, configJs) {
        const proxyHost = configJs.proxyHost ? configJs.proxyHost : "";

        updateProxyUrl(configJs, proxyHost);
        commit("setConfigJs", configJs);
    },

    /**
     * Load the config.json, check/adapt for proxy configs.
     * @param {Object} context the vue context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @returns {void}
     */
    loadConfigJson ({commit, state, dispatch, getters}) {
        const format = ".json";
        let targetPath = "config.json";

        if (state.configJs?.portalConf?.slice(-5) === format) {
            targetPath = state.configJs.portalConf;
        }

        axios.get(targetPath)
            .then(response => {
                updateProxyUrl(response.data);
                commit("setPortalConfig", response.data ? response.data[portalConfigKey] : null);
                if (getters.isMobile) {
                    dispatch("moveStartModuleControls", "mainMenu");
                    dispatch("moveStartModuleControls", "secondaryMenu");
                }
                commit("setLayerConfig", response.data ? response.data[treeTopicConfigKey] : null);
                commit("setLoadedConfigs", "configJson");
            })
            .catch(error => {
                console.error(`Error occured during loading config.json specified by config.js (${targetPath}).`, error);
            });
    },

    /**
     * Moves modules from controls startModule to main- or secondary-menu.
     * @param {Object} context the vue context
     * @param {Object} context.getters the getters
     * @param {Object} context.state the state
     * @param {String} side side of menu
     * @returns {void}
     */
    moveStartModuleControls ({getters, state}, side) {
        if (getters.controlsConfig?.startModule) {
            const modules = [].concat(getters.controlsConfig.startModule[side]);

            modules.forEach(module => {
                if (module) {
                    state.portalConfig[side].sections[0].push(module);
                }
            });
            state.portalConfig.map.controls.startModule[side] = [];
        }

    },

    /**
     * Load the rest-services.json, check/adapt for proxy configs and commit it to the state.
     * @param {Object} context the vue context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @returns {void}
     */
    loadRestServicesJson ({commit, state}) {
        axios.get(state.configJs?.restConf)
            .then(response => {
                updateProxyUrl(response.data);
                commit("setRestConfig", response.data);
                commit("setLoadedConfigs", "restServicesJson");
            })
            .catch(error => {
                console.error(`Error occured during loading rest-services.json specified by config.js (${state.configJs?.restConf}).`, error);
            });
    },

    /**
     * Load the services.json via masterportalapi.
     * @param {Object} context the vue context
     * @param {Object} context.state the state
     * @param {Object} context.commit the commit
     * @param {Object} context.dispatch the dispatch
     * @returns {void}
     */
    loadServicesJson ({state, commit, dispatch}) {
        rawLayerList.initializeLayerList(state.configJs?.layerConf, (_, error) => {
            if (error) {
                dispatch("Alerting/addSingleAlert", {
                    category: "error",
                    content: i18next.t("common:app-store.loadServicesJsonFailed", {layerConf: state.configJs?.layerConf})
                }, {root: true});
            }
            else {
                commit("setLoadedConfigs", "servicesJson");
            }
        });
    },

    /**
     * Sets the config-params of a module into state.
     * @param {Object} context the context Vue instance
     * @param {Object} payload The payload.
     * @param {String[]} payload.configPaths The path to configuration of the module in the config file.
     * @param {String} payload.type The type of the module.
     * @returns {void}
     */
    initializeModule: (context, {configPaths, type}) => {
        return fetchFirstModuleConfig(context, configPaths, upperFirst(type));
    },

    /**
     * Initializes other actions.
     * @param {Object} context the vue context
     * @param {Object} context.dispatch the dispatch
     * @returns {void}
     */
    initializeOther ({dispatch}) {
        dispatch("Modules/WmsTime/watchVisibleLayerConfig", null, {root: true});
    },

    /**
     * Initializes the style list of vector styling. Sets state variable 'StyleListLoaded' to true, if successful loaded.
     * @param {Object} context the vue context
     * @param {Object} context.state the state
     * @param {Object} context.commit the commit
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.getters the getters
     * @returns {void}
     */
    initializeVectorStyle ({state, commit, dispatch, getters}) {
        const styleGetters = {
            mapMarkerPointStyleId: getters.mapMarker?.pointStyleId,
            mapMarkerPolygonStyleId: getters.mapMarker?.polygonStyleId,
            highlightFeaturesPointStyleId: getters["Modules/HighlightFeatures/pointStyleId"],
            highlightFeaturesPolygonStyleId: getters["Modules/HighlightFeatures/polygonStyleId"],
            highlightFeaturesLineStyleId: getters["Modules/HighlightFeatures/lineStyleId"],
            zoomToFeatureId: getters.zoomTo?.find(entry => entry.id === "zoomToFeatureId")?.styleId
        };

        styleList.initializeStyleList(styleGetters, state.configJs, getters.allLayerConfigs, getters.configuredModules,
            (initializedStyleList, error) => {
                if (error) {
                    dispatch("Alerting/addSingleAlert", {
                        category: "warning",
                        content: i18next.t("common:app-store.loadStylev3JsonFailed", {style_v3: state.configJs?.styleConf ? state.configJs?.styleConf : "style_v3.json"})
                    }, {root: true});
                }
                return initializedStyleList;
            }).then(() => {
            commit("setStyleListLoaded", true);
        }).catch(error => console.error(error));
    }
};
