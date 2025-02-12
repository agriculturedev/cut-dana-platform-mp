import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateAbout from "./stateAbout";

const mutations = {
    ...generateSimpleMutations(stateAbout)

};

export default mutations;
