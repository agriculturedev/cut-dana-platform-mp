import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import OverviewMapState from "./stateOverviewMap.js";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => tate[key] = payload}
     * will be returned.
     */
    ...generateSimpleMutations(OverviewMapState)
};

export default mutations;
