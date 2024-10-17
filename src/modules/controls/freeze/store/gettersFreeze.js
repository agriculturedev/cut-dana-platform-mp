import {generateSimpleGetters} from "../../../../shared/js/utils/generators";
import stateFreeze from "./stateFreeze";

export default {
    ...generateSimpleGetters(stateFreeze)
};
