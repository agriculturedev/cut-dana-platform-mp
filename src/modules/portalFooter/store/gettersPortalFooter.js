import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import statePortalFooter from "./statePortalFooter";

const getters = {
    ...generateSimpleGetters(statePortalFooter)
};

export default getters;
