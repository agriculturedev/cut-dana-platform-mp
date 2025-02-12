import {generateSimpleMutations} from "../../../../shared/js/utils/generators";
import OrientationState from "./stateOrientation";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => tate[key] = payload}
     * will be returned.
     */
    ...generateSimpleMutations(OrientationState),

    /**
     * Set the status if poi mode is current position
     * @param {Object} state - the orientation state
     * @param {String} enabled - the status if current position enabled
     * @returns {void}
     */
    setCurrentPositionEnabled (state, enabled) {
        state.poiModeCurrentPositionEnabled = enabled;
    }
};

export default mutations;
