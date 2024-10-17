import getters from "./gettersFilter";
import mutations from "./mutationsFilter";
import actions from "./actionsFilter";
import state from "./stateFilter";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
