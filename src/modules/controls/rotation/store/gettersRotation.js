import {generateSimpleGetters} from "../../../../shared/js/utils/generators";
import stateRotation from "./stateRotation";

/**
 * The getters for the control rotation.
 * @module modules/controls/rotation/store/gettersRotation
 */
export default {
    ...generateSimpleGetters(stateRotation)
};
