import state from "./stateLayerTree";
import actions from "./actionsLayerTree";
import getters from "./gettersLayerTree";
import mutations from "./mutationsLayerTree";

export default {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};
