import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import AddWMSState from "./stateAddWMS";

const getters = {
    ...generateSimpleGetters(AddWMSState)
};

export default getters;
