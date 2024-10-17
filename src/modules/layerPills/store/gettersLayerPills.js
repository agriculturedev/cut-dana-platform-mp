import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateLayerPills from "./stateLayerPills";

const getters = {
    ...generateSimpleGetters(stateLayerPills)
};

export default getters;
