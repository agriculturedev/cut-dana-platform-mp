import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateBaselayerSwitcher from "./stateBaselayerSwitcher";

const mutations = {
    ...generateSimpleMutations(stateBaselayerSwitcher)
};

export default mutations;
