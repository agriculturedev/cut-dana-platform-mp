import actions from "./actionsAbout";
import mutations from "./mutationsAbout";
import getters from "./gettersAbout";
import state from "./stateAbout";


export default {
    namespaced: true,
    state: {...state},
    getters,
    actions,
    mutations
};
