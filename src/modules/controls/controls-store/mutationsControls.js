import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import changeCase from "../../../shared/js/utils/changeCase";
import stateControls from "./stateControls";

export default {
    ...generateSimpleMutations(stateControls),

    /**
     * Adds a new control element to state.addonControls.
     * @param {Object} state current state
     * @param {String} name name of control in config.json
     * @param {Object} control the control to register
     * @returns {void}
     */
    registerControl (state, {name, control}) {
        state.addonControls[changeCase.upperFirst(name)] = control;
    }
};
