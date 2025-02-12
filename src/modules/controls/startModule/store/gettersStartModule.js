import {generateSimpleGetters} from "../../../../shared/js/utils/generators";
import stateStartModule from "./stateStartModule";

export default {
    ...generateSimpleGetters(stateStartModule)
};
