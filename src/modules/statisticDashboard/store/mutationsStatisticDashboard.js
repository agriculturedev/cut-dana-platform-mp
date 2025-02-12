import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import initialState from "./stateStatisticDashboard";

const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
