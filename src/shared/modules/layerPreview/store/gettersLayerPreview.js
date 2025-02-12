import {generateSimpleGetters} from "../../../js/utils/generators";
import stateLayerPreview from "./stateLayerPreview";

const getters = {
    /**
     * Creates from every state-key a getter.
     */
    ...generateSimpleGetters(stateLayerPreview),

    /**
     * Returns the center coordinates of the layer preview.
     * @param {stateLayerPreview} state Local vuex state.
     * @returns {Array} the center coordinates
     */
    previewCenter: state => id => {
        return state.center[id];
    },

    /**
     * Returns the zoom-level of the layer preview.
     * @param {stateLayerPreview} state Local vuex state.
     * @returns {Number} the zoom-level
     */
    previewZoomLevel: state => id =>{
        return state.zoomLevel[id];
    }
};

export default getters;
