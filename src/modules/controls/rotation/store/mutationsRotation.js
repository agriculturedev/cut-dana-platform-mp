import {generateSimpleMutations} from "../../../../shared/js/utils/generators";
import stateRotation from "./stateRotation";

/**
 * The mutations for the control rotation.
 * @module modules/controls/rotation/store/mutationsRotation
 */
export default {
    ...generateSimpleMutations(stateRotation)
};
