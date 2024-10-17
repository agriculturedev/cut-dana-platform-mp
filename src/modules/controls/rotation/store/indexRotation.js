import actions from "./actionsRotation";
import state from "./stateRotation";
import getters from "./gettersRotation";
import mutations from "./mutationsRotation";
export default {
    namespaced: true,
    state: {...state},
    actions,
    getters,
    mutations
};
