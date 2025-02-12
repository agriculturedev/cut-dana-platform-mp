import actions from "./actionsDraw";
import mutations from "./mutationsDraw";
import getters from "./gettersDraw";
import state from "./stateDraw";


export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
