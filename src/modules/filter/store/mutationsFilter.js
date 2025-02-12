import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import filterState from "./stateFilter";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(filterState),
    addSpotForRule (state, payload) {
        state.rulesOfFilters[payload.filterId] = [];
    },
    updateRules (state, payload) {
        state.rulesOfFilters[payload.filterId] = payload.rules;
    },
    deleteFilter (state, payload) {
        state.rulesOfFilters[payload.filterId] = [];
    },
    setAdditionalGeometries (state, payload) {
        state.geometrySelectorOptions.additionalGeometries = payload.additionalGeometries;
    },
    updateFilterHits (state, payload) {
        state.filtersHits[payload.filterId] = payload.hits;
    },
    setSerializedString (state, payload) {
        state.serializedString = payload.serializiedString;
    },
    setRulesOfFilters (state, payload) {
        state.rulesOfFilters = payload.rulesOfFilters;
    }
};

export default mutations;
