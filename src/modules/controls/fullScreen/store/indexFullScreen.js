import state from "./stateFullScreen";
import getters from "./gettersFullScreen";
import mutations from "./mutationsFullScreen";

export default {
    namespaced: true,
    state: {...state},
    getters,
    mutations
};
