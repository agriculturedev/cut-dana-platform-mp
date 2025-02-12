import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateAbout from "./stateAbout";

const getters = {
    ...generateSimpleGetters(stateAbout)
};

export default getters;
