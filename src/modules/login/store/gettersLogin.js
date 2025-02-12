import stateLogin from "./stateLogin";
import {generateSimpleGetters} from "../../../shared/js/utils/generators";

/**
 * The getters for the Login.
 * @module modules/login/store/gettersLogin
 */
const gettersMap = {
    ...generateSimpleGetters(stateLogin)
};

export default gettersMap;
