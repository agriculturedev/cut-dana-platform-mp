
import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateLayerSlider from "./stateLayerSlider";

const getters = {
    ...generateSimpleGetters(stateLayerSlider)
};

export default getters;
