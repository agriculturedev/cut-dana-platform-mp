import layerCollection from "../../../core/layers/js/layerCollection";
import {treeTopicConfigKey} from "../../../shared/js/utils/constants";

const actions = {

    /**
     * Processes the config.json on file load.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Progressevent} event Event contains the loaded file.
     * @returns {void}
     */
    processConfigJsonOnload ({commit, dispatch}, event) {
        const configJson = JSON.parse(event.target.result);

        layerCollection.clear();
        commit("setPortalConfig", configJson.portalConfig, {root: true});
        Object.keys(configJson[treeTopicConfigKey]).forEach(topic => {
            commit("setLayerConfigByParentKey", {layerConfigs: configJson[treeTopicConfigKey][topic], parentKey: topic}, {root: true});
        });
        dispatch("extendLayers", null, {root: true});
    }
};

export default actions;
