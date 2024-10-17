import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import routingState from "./stateRouting";
import * as constantsRouting from "./constantsRouting";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     * @param {Object} state state to generate getters for
     * @returns {object.<string, function>} object of getters
     */
    ...generateSimpleGetters(routingState),

    /**
     * Returns the configured tabs to be displayed.
     * @param {Object} state routing
     * @param {String[]} [state.routingToolOptions] routingToolOptions in state
     * @returns {String[]} routing tool options
     */
    filteredRoutingToolOptions ({routingToolOptions}) {
        let options = routingToolOptions;

        if (options.length === 0) {
            options = ["DIRECTIONS", "ISOCHRONES"];
        }

        return constantsRouting.routingToolOptions.filter(option => options.includes(option.id));
    },

    /**
     * Returns url params for routing.
     * @param {Object} state routing store state
     * @returns {String} The url params for routing-
     */
    urlParams: state => {
        const params = {
            activeRoutingToolOption: state.activeRoutingToolOption,
            directionsSettings: {
                speedProfile: state.directionsSettings.speedProfile,
                preference: state.directionsSettings.preference
            },
            isochronesSettings: {
                speedProfile: state.isochronesSettings.speedProfile,
                isochronesMethodOption: state.isochronesSettings.isochronesMethodOption,
                distanceValue: state.isochronesSettings.distanceValue,
                intervalValue: state.isochronesSettings.intervalValue,
                timeValue: state.isochronesSettings.timeValue
            },
            Directions: {
                mapInteractionMode: state.Directions.mapInteractionMode,
                routingAvoidFeaturesOptions: state.Directions.routingAvoidFeaturesOptions
            },
            Isochrones: {
                routingAvoidFeaturesOptions: state.Isochrones.routingAvoidFeaturesOptions
            }
        };

        return JSON.stringify(params);
    }
};

export default getters;
