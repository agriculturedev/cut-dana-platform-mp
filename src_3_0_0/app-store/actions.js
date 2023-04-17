import axios from "axios";
import {rawLayerList} from "@masterportal/masterportalapi/src";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import {portalConfigKey, treeTopicConfigKey} from "../shared/js/utils/constants";
import actionsLayerConfig from "./actionsLayerConfig";

export default {
    ...actionsLayerConfig,

    /**
     * Commit the loaded config.js to the state.
     * @param {Object} param.commit the commit
     * @param {Object} configJs The config.js
     * @returns {void}
     */
    loadConfigJs ({commit}, configJs) {
        commit("setConfigJs", configJs);
    },

    /**
     * Load the config.json and commit it to the state.
     * @param {Object} param.commit the commit
     * @param {Object} param.state the state
     * @returns {void}
     */
    loadConfigJson ({commit, state}) {
        const format = ".json";
        let targetPath = "config.json";

        if (state.configJs?.portalConf?.slice(-5) === format) {
            targetPath = state.configJs.portalConf;
        }

        axios.get(targetPath)
            .then(response => {
                commit("setPortalConfig", response.data ? response.data[portalConfigKey] : null);
                commit("setLayerConfig", response.data ? response.data[treeTopicConfigKey] : null);
                commit("setLoadedConfigs", "configJson");
            })
            .catch(error => {
                console.error(`Error occured during loading config.json specified by config.js (${targetPath}).`, error);
            });
    },

    /**
     * Load the rest-services.json and commit it to the state.
     * @param {Object} param.commit the commit
     * @param {Object} param.state the state
     * @returns {void}
     */
    loadRestServicesJson ({commit, state}) {
        axios.get(state.configJs?.restConf)
            .then(response => {
                commit("setRestConfig", response.data);
                commit("setLoadedConfigs", "restServicesJson");
            })
            .catch(error => {
                console.error(`Error occured during loading rest-services.json specified by config.js (${state.configJs?.restConf}).`, error);
            });
    },

    /**
     * Load the services.json via masterportalapi.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
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
     * Initializes the style list of vector styling.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @returns {void}
     */
    initializeVectorStyle ({state, dispatch, getters}) {
        const styleGetters = {
                mapMarkerPointStyleId: getters.configJs?.mapMarker?.pointStyleId,
                mapMarkerPolygonStyleId: getters.configJs?.mapMarker?.polygonStyleId,
                highlightFeaturesPointStyleId: getters["Modules/HighlightFeatures/pointStyleId"],
                highlightFeaturesPolygonStyleId: getters["Modules/HighlightFeatures/polygonStyleId"],
                highlightFeaturesLineStyleId: getters["Modules/HighlightFeatures/lineStyleId"],
                zoomToFeatureId: getters.configJs.zoomTo?.find(entry => entry.id === "zoomToFeatureId")?.styleId
            },
            layerConfigs = getters.allLayerConfigs,
            // todo bei Implementierung von https://www.jira.geoportal-hamburg.de/browse/BG-3825 beachten:
            // hier stand vorher: //Radio.request("Parser", "getItemsByAttributes", {type: "tool"})
            // bin nicht sicher, ob das mit dem sectionsContent so richtig ist. Wenn ja dann brauchen wir dafür einen getter. Was ist mit "tools", die in foldern sind?
            secondaryMenuSections = getters.menuFromConfig("secondaryMenu").sections ? getters.menuFromConfig("secondaryMenu").sections[0] : [],
            sectionsContent = getters.menuFromConfig("mainMenu").sections[0].concat(secondaryMenuSections);

        styleList.initializeStyleList(styleGetters, state.configJs, layerConfigs, sectionsContent,
            (initializedStyleList, error) => {
                if (error) {
                    dispatch("Alerting/addSingleAlert", {
                        category: "warning",
                        content: i18next.t("common:app-store.loadStylev3JsonFailed", {style_v3: state.configJs?.styleConf ? state.configJs?.styleConf : "style_v3.json"})
                    }, {root: true});
                }
                return initializedStyleList;
            });
    },

    /**
     * Rewrites the URL by replacing the dots with underlined
     * If a proxyHost is configured, it is prepended to the URL.
     * This prevents CORS errors.
     * Attention: A reverse proxy must be set up on the server side.
     * @param {String} url The URL to rewrite.
     * @param {String} [proxyHost=configJs.proxyHost] Specifies whether points should be replaced by underscores in URLs.
     * @returns {String} The rewritten URL with underlined instead of dots.
     *///proxyHost = getters.proxyHost()
    getProxyUrl ({getters}, {url, proxyHost}) {
        const parser = document.createElement("a");
        let protocol = "",
            result = url,
            hostname = "",
            port = "";

        parser.href = url;
        protocol = parser.protocol;

        if (protocol.indexOf("//") === -1) {
            protocol += "//";
        }

        port = parser.port;

        if (!parser.hostname) {
            parser.hostname = window.location.hostname;
        }

        if (parser.hostname === "localhost" || !parser.hostname) {
            return url;
        }

        if (port) {
            result = url.replace(":" + port, "");
        }

        result = url.replace(protocol, "");
        // www und www2 usw. raus
        // hostname = result.replace(/www\d?\./, "");
        hostname = parser.hostname.split(".").join("_");

        console.warn(`The parameter 'useProxy' is deprecated. Please set up a CORS header for the service with the URL: ${url}`
        + " This is recommended by the GDI-DE"
        + " (https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile)"
        + " in chapter 4.7.1.!");

        return proxyHost + "/" + result.replace(parser.hostname, hostname);
    }
};
