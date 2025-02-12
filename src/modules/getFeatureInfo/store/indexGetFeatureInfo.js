import state from "./stateGetFeatureInfo";
import getters from "./gettersGetFeatureInfo";
import mutations from "./mutationsGetFeatureInfo";
import actions from "./actionsGetFeatureInfo";

export default {
    namespaced: true,
    state: {...state},
    getters,
    mutations,
    actions
};
