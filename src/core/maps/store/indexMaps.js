import actions from "./actionsMaps";
import getters from "./gettersMaps";
import mutations from "./mutationsMaps";
import state from "./stateMaps";

export default {
    namespaced: true,
    actions,
    getters,
    mutations,
    state: {...state}
};
