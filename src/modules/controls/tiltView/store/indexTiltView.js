import state from "./stateTiltView";
import getters from "./gettersTiltView";
import mutations from "./mutationsTiltView";

export default {
    namespaced: true,
    state: {...state},
    getters,
    mutations
};
