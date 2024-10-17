import {createStore} from "vuex";

import getters from "./getters";
import mutations from "./mutations";
import state from "./state";
import actions from "./actions";

import Alerting from "../modules/alerting/store/indexAlerting";
import Controls from "../modules/controls/controls-store/indexControls";
import Maps from "../core/maps/store/indexMaps";
import Menu from "../modules/menu/menu-store/indexMenu";
import Modules from "../modules/modules-store/indexModules";

const store = createStore({
    state,
    getters,
    mutations,
    actions,
    modules: {
        Alerting,
        Controls,
        Maps,
        Menu,
        Modules
    }
});

export default store;
