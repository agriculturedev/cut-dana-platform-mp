import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import routingState from "./stateRouting";
import * as constantsRouting from "./constantsRouting";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     * @param {object} state state to generate getters for
     * @returns {object.<string, function>} object of getters
     */
    ...generateSimpleGetters(routingState),
    filteredRoutingToolOptions ({routingToolOptions}) {
        let options = routingToolOptions;

        if (options.length === 0) {
            options = ["DIRECTIONS", "ISOCHRONES"];
        }
        return constantsRouting.routingToolOptions.filter(option => options.includes(option.id));
    }
};

export default getters;
