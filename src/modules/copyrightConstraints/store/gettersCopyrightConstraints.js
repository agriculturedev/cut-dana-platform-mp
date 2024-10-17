import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import copyrightConstraintsState from "./stateCopyrightConstraints";

const getters = {
    ...generateSimpleGetters(copyrightConstraintsState)
};

export default getters;
