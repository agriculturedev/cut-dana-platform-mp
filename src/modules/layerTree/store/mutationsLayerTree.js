import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import state from "./stateLayerTree";

/**
 * The mutations for the LayerTree.
 * @module modules/layerTree/store/mutationsLayerTree
 */
export default {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(state)
};
