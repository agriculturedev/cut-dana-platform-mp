import {generateSimpleGetters} from "../../../../shared/js/utils/generators";
import OrientationState from "./stateOrientation";

const getters = {
    ...generateSimpleGetters(OrientationState)
};

export default getters;
