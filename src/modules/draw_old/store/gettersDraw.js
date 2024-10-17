import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import initialState from "./stateDraw";
import main from "../js/main";

const getters = {
    ...generateSimpleGetters(initialState),
    /**
     * Returns a clone of the current drawTypeSettings
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} The cloned current drawTypeSettings
     */
    styleSettings (state) {
        const stateKey = state.drawType.id + "Settings";

        return JSON.parse(JSON.stringify(state[stateKey]));
    },
    /**
     * Returns the Layer from globalProperties
     *
     * @returns {Object} The layer
     */
    layer () {
        return main.getApp().config.globalProperties.$layer;
    },
    /**
     * If no features are present or the filename or the format is not set, the download is disabled.
     *
     * @param {Object} state state Current state object of the store.
     * @returns {Boolean} Whether to activate or deactivate the Download Button.
     */
    disableFileDownload (state) {
        const {features, fileName, selectedFormat} = state.download;

        return features.length === 0 || fileName === "" || selectedFormat === "" || selectedFormat === "none";
    },
    /**
     * Provides state for urlParams, returns only type, name and icon.
     * @param {Object} state state of the app-store.
     * @returns {Object} state for urlParams
     */
    urlParams: state => {
        return {
            type: state.type,
            name: state.name,
            icon: state.icon
        };
    }
};

export default getters;
