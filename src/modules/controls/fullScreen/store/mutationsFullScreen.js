import {generateSimpleMutations} from "../../../../shared/js/utils/generators";
import stateFullScreen from "./stateFullScreen";

export default {
    ...generateSimpleMutations(stateFullScreen)
};
