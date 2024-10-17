import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateMouseHover from "./stateMouseHover";

const mutations = {
    ...generateSimpleMutations(stateMouseHover),

    /**
     * Sets the mouseHoverInfos of each layer to the state
     * @param {Object} state Context state object.
     * @returns {void}
     */
    setMouseHoverInfos: (state) => {
        state.mouseHoverInfos = state.mouseHoverLayers.map(layer => {
            return {id: layer.id, mouseHoverField: layer.mouseHoverField};
        });
    }
};

export default mutations;
