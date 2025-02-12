import actions from "./actionsMenu";
import getters from "./gettersMenu";
import mutations from "./mutationsMenu";
import state from "./stateMenu";

export default {
    namespaced: true,
    actions,
    getters,
    mutations,
    state: {...state}
};
