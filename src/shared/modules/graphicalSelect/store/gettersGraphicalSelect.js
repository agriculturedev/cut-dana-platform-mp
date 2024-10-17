import {generateSimpleGetters} from "../../../js/utils/generators";
import gsState from "./stateGraphicalSelect";

const getters = {
    /**
     * Creates from every state-key a getter.
     */
    ...generateSimpleGetters(gsState)
};

export default getters;
