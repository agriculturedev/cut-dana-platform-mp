import {generateSimpleGetters} from "../../../../shared/js/utils/generators";
import stateZoom from "./stateZoom";

export default {
    ...generateSimpleGetters(stateZoom)
};
