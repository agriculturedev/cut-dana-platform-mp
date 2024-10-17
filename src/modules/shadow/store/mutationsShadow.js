import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateShadow from "./stateShadow";

const mutations = {
    ...generateSimpleMutations(stateShadow)
};

export default mutations;
