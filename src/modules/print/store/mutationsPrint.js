import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import statePrint from "./statePrint";

const mutations = {
    ...generateSimpleMutations(statePrint),

    /**
     * Adds a download file to the fileDownloads collection.
     * @param {Object} state Context object.
     * @param {Object} fileDownload The download file.
     * @returns {void}
     */
    addFileDownload: (state, fileDownload) => {
        state.fileDownloads.push(fileDownload);
    },

    /**
     * Join a download file with an existing download file by index..
     * @param {Object} state Context object.
     * @param {Object} fileDownload The download file.
     * @param {Number} fileDownload.index The print index.
     * @returns {void}
     */
    updateFileDownload: (state, fileDownload) => {
        const index = fileDownload.index;

        state.fileDownloads[index] = Object.assign(state.fileDownloads[index], fileDownload);
    },

    /**
     * Sets the state values for displaying an auto adjusted scale.
     * @param {Object} state Context object.
     * @param {Boolean} checkValue Value of the checkbox.
     * @returns {void}
     */
    setAutoAdjustScale: (state, checkValue) => {
        state.autoAdjustScale = checkValue;
        state.isScaleSelectedManually = false;
    },

    /**
     * Sets an additional Print-Layer to active, to be added to the print
     * @param {Object} state Context object.
     * @param {String} layerId the layer to activate.
     * @returns {void}
     */
    setAdditionalLayerActive (state, layerId) {
        state.additionalLayers.find(layer => layer.id === layerId).active = true;
    },

    /**
     * Sets an additional Print-Layer to inactive, so it is not be added to the print
     * @param {Object} state Context object.
     * @param {String} layerId the layer to deactivate.
     * @returns {void}
     */
    setAdditionalLayerInactive (state, layerId) {
        state.additionalLayers.find(layer => layer.id === layerId).active = false;
    }
};

export default mutations;
