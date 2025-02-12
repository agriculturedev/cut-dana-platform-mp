import {generateSimpleMutations} from "../../../../shared/js/utils/generators";
import stateStartModule from "./stateStartModule";

export default {
    ...generateSimpleMutations(stateStartModule),

    /**
     * Adds a model to configuredModuleStates.
     * @param {Object} state the state of startModule
     * @param {Object} module The module to add.
     * @returns {void}
     */
    addConfiguredModel: (state, module) => {
        state.configuredModuleStates.push(module);
    }
};
