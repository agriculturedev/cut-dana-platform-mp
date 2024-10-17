import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateNewsView from "./stateNewsView";

const getters = {
    ...generateSimpleGetters(stateNewsView)
};

export default getters;
