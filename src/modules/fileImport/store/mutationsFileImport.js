import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import fileImportState from "./stateFileImport";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(fileImportState),

    /**
     * Sets the GFIAttributes of an added file.
     * @param {Object} state Context object.
     * @param {Object} payload The gfiAttributes to be set for the uploaded file.
     * @returns {void}
     */
    setGFIAttribute: (state, payload) => {
        state.gfiAttributes[payload.key] = payload.key;
    },
    /**
     * Sets the GFIAttributes of an added file.
     * @param {Object} state Context object.
     * @param {Object} payload The custom styles to be set for the uploaded file.
     * @returns {void}
     */
    setCustomAttributeStyles: (state, payload) => {
        state.customAttributeStyles[payload.filename] = payload.customAttributeStyles;
    },
    /**
     * Increments the Feature ID for a GeoJson feature.
     * @param {Object} state Context object.
     * @returns {void}
     */
    setGeojsonFeatureId: (state) => {
        state.geojsonFeatureId += 1;
    }
};

export default mutations;
