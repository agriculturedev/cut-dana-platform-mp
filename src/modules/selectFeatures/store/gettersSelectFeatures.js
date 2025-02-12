
import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import state from "./stateSelectFeatures";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
