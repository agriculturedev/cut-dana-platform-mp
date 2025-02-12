import getters from "./gettersBackForward";
import mutations from "./mutationsBackForward";
import state from "./stateBackForward";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
