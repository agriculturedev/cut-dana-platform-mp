import state from "./stateTotalView";
import getters from "./gettersTotalView";
import mutations from "./mutationsTotalView";

export default {
    namespaced: true,
    state: {...state},
    getters,
    mutations
};
