import state from "./stateFileImport";
import actions from "./actionsFileImport";
import getters from "./gettersFileImport";
import mutations from "./mutationsFileImport";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
