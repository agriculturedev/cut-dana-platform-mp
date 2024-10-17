import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import initialState from "./stateLogin";

/**
 * The mutations for the Login.
 * @module modules/login/store/mutationsLogin
 */
const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
