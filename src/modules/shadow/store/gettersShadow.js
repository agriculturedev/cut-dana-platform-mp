import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateShadow from "./stateShadow";

const getters = {
    ...generateSimpleGetters(stateShadow)
};

export default getters;
