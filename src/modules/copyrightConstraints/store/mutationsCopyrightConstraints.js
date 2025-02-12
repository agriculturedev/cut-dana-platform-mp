import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import state from "./stateCopyrightConstraints";

const mutations = {
    ...generateSimpleMutations(state)
};

export default mutations;
