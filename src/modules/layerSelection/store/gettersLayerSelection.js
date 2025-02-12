import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import state from "./stateLayerSelection";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
