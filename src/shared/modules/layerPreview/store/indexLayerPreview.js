import getters from "./gettersLayerPreview";
import mutations from "./mutationsLayerPreview";
import actions from "./actionsLayerPreview";
import state from "./stateLayerPreview";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
