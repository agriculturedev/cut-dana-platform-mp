import {generateSimpleGetters} from "../../../../shared/js/utils/generators";
import stateFullScreen from "./stateFullScreen";

export default {
    ...generateSimpleGetters(stateFullScreen)
};
