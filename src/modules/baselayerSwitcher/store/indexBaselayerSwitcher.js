import state from "./stateBaselayerSwitcher";
import mutations from "./mutationsBaselayerSwitcher";
import getters from "./gettersBaselayerSwitcher";
import actions from "./actionsBaselayerSwitcher";

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};
