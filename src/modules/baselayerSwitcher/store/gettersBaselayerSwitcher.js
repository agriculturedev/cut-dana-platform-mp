import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateBaselayerSwitcher from "./stateBaselayerSwitcher";

const getters = {
    ...generateSimpleGetters(stateBaselayerSwitcher)
};

export default getters;
