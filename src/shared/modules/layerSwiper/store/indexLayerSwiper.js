import getters from "./gettersLayerSwiper";
import mutations from "./mutationsLayerSwiper";
import actions from "./actionsLayerSwiper";
import state from "./stateLayerSwiper";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
