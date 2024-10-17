import state from "./stateShadow";
import getters from "./gettersShadow";
import mutations from "./mutationsShadow";

export default {
    namespaced: true,
    state: {...state},
    getters,
    mutations
};
