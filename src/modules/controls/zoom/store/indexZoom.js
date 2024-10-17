import state from "./stateZoom";
import getters from "./gettersZoom";
import mutations from "./mutationsZoom";

export default {
    namespaced: true,
    state: {...state},
    getters,
    mutations
};
