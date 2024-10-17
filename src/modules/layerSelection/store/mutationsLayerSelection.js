import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateLayerSelection from "./stateLayerSelection";

const mutations = {
    ...generateSimpleMutations(stateLayerSelection),
    /**
     * Clears layerSelection.
     * @param {Object} state vuex state
     * @returns {void}
     */
    clearLayerSelection (state) {
        state.lastFolderNames = [];
        state.lastSubjectDataLayerConfs = [];
        state.lastBaselayerConfs = [];
    },

    /**
     * Reduces state to previus navigation state.
     * @param {Object} state vuex state
     * @returns {void}
     */
    reduceToPreviousLayerSelection (state) {
        state.lastFolderNames.pop();
        state.lastSubjectDataLayerConfs.pop();
        state.lastBaselayerConfs.pop();
    },
    /**
     * Adds payload to navigation state.
     * @param {Object} state vuex state
     * @param {Object} payload the payload
     * @param {String} payload.lastFolderName name of the previous folder configuration name
     * @param {Array} payload.subjectDataLayerConfs subject data layer configurations to show in layerSelection
     * @param {Array} payload.baselayerConfs baselayer configurations to show in layerSelection
     * @returns {void}
     */
    addToLayerSelection (state, {lastFolderName, subjectDataLayerConfs, baselayerConfs}) {
        if (lastFolderName !== "") {
            state.lastFolderNames.push(lastFolderName);
        }
        state.lastSubjectDataLayerConfs.push(subjectDataLayerConfs);
        state.lastBaselayerConfs.push(baselayerConfs);
    }
};

export default mutations;
