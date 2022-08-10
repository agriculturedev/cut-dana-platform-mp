import axios from "axios";
import {getLayerWhere, initializeLayerList} from "@masterportal/masterportalapi/src/rawLayerList";

export default {
    /**
     * Commit the loaded config.js to the state.
     * @param {Object} configJs The config.js
     * @returns {void}
     */
    loadConfigJs ({commit}, configJs) {
        commit("setConfigJs", configJs);
    },

    /**
     * Load the config.json and commit it to the state.
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
                commit("setPortalConfig", response.data?.Portalconfig);
                commit("setLayerConfig", response.data?.Themenconfig);
                commit("setLoadedConfigs", "configJson");
            })
            .catch(error => {
                console.error(`Error occured during loading config.json specified by config.js (${targetPath}).`, error);
            });
    },

    /**
     * Prepares all visible layers in state's layerConfig.
     * @returns {void}
     */
    prepareVisibleLayers ({dispatch, state}) {
        dispatch("enrichVisibleLayer", state.layerConfig?.Hintergrundkarten?.Layer);
        dispatch("enrichVisibleLayer", state.layerConfig?.Fachdaten?.Layer);
    },

    /**
     * Enriches all visible layers of config.json with the attributes of the layer in services.json.
     * Replaces the enriched layer in state.layerConf.
     * @param {Array} layerConfig an array of configured layers like in the config.json
     * @returns {void}
     */
    enrichVisibleLayer ({commit, state}, layerConfig) {
        layerConfig?.forEach(layerConf => {
            if (layerConf.visibility) {
                const rawLayer = getLayerWhere({id: layerConf.id});

                if (rawLayer) {
                    commit("replaceByIdInLayerConfig", Object.assign(rawLayer, layerConf));
                }
                else {
                    console.warn("Configured visible layer with id ", layerConf.id, " was not found in ", state.configJs?.layerConf);
                }
            }
        });
    },

    /**
     * Load the rest-services.json and commit it to the state.
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
     * @returns {void}
     */
    loadServicesJson ({state, commit}) {
        initializeLayerList(state.configJs?.layerConf, () => {
            commit("setLoadedConfigs", "servicesJson");
        });
    }
};
