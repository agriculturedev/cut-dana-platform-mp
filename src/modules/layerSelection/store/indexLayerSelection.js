import state from "./stateLayerSelection";
import mutations from "./mutationsLayerSelection";
import getters from "./gettersLayerSelection";
import actions from "./actionsLayerSelection";

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};
