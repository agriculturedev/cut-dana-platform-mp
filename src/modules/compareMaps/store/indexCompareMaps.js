import getters from "./gettersCompareMaps";
import mutations from "./mutationsCompareMaps";
import actions from "./actionsCompareMaps";
import state from "./stateCompareMaps";

export default {
    namespaced: true,
    state: state,
    mutations,
    actions,
    getters
};
