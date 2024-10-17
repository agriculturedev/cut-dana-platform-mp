import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import compareMapsState from "./stateCompareMaps";

/**
 * The getters for compareMaps.
 * @module modules/compareMaps/store/gettersCompareMaps
 */
export default {
    ...generateSimpleGetters(compareMapsState)
};
