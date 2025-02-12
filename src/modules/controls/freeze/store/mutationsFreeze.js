import {generateSimpleMutations} from "../../../../shared/js/utils/generators";
import stateFreeze from "./stateFreeze";

export default {
    ...generateSimpleMutations(stateFreeze)
};
