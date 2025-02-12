import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import routingState from "./stateRouting";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(routingState),

    /**
     * Join the url params to state.
     * @param {Object} state Context object.
     * @param {Object} params The url params.
     * @returns {void}
     */
    updateStateFromUrlParams: (state, params) => {
        const attributes = [
            "directionsSettings",
            "isochronesSettings",
            "Directions",
            "Isochrones"
        ];

        attributes.forEach(settings => {
            Object.assign(state[settings], params[settings]);
        });

        state.activeRoutingToolOption = params.activeRoutingToolOption || state.activeRoutingToolOption;
    }
};

export default mutations;
