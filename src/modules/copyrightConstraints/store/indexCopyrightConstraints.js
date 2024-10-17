import state from "./stateCopyrightConstraints";
import getters from "./gettersCopyrightConstraints";
import mutations from "./mutationsCopyrightConstraints";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
