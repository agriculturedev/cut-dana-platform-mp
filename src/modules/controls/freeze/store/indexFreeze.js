import state from "./stateFreeze";
import getters from "./gettersFreeze";
import mutations from "./mutationsFreeze";

export default {
    namespaced: true,
    state: {...state},
    getters,
    mutations
};
