import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import coordState from "./stateCompareMaps";

/**
 * The mutations for compareMaps.
 * @module modules/compareMaps/store/mutationsCompareMaps
 */
export default {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(coordState)
};
