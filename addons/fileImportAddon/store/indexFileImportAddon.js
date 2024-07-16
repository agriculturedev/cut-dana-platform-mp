import state from "./stateFileImportAddon";
import actions from "./actionsFileImportAddon";
import getters from "./gettersFileImportAddon";
import mutations from "./mutationsFileImportAddon";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
