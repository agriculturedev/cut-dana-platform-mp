import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import state from "./stateLanguage";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
