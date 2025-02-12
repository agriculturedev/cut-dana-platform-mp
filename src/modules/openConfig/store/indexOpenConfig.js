import actions from "./actionsOpenConfig";
import mutations from "./mutationsOpenConfig";
import getters from "./gettersOpenConfig";
import state from "./stateOpenConfig";


export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
