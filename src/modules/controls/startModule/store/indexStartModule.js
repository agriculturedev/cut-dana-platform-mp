import actions from "./actionsStartModule";
import state from "./stateStartModule";
import getters from "./gettersStartModule";
import mutations from "./mutationsStartModule";

export default {
    namespaced: true,
    actions,
    state: {...state},
    getters,
    mutations
};
