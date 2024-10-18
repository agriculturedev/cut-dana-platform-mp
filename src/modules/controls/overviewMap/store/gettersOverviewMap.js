import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import OverviewMapState from "./stateOverviewMap";

const getters = {
    ...generateSimpleGetters(OverviewMapState)
};

export default getters;
