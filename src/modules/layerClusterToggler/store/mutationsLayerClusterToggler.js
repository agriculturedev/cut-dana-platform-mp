import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateLayerClusterToggler from "./stateLayerClusterToggler";

const mutations = {
    ...generateSimpleMutations(stateLayerClusterToggler)
};

export default mutations;
