import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateBufferAnalysis from "./stateBufferAnalysis";

const getters = {
    ...generateSimpleGetters(stateBufferAnalysis),
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
