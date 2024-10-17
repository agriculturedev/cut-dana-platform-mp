import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import initialState from "./stateWfst";

const mutations = {
    ...generateSimpleMutations(initialState),
    /**
     * Gets select interaction status
     * @param {Object} Payload Mutation payload
     * @param {Object} Payload.featureProperties Property  of the features
     * @param {String} Payload.key key name
     * @param {(String|Number|Object)} Payload.value value
     * @returns {O} Interaction Button status
     */
    setFeatureProperty ({featureProperties}, {key, value}) {
        featureProperties.find(property => property.key === key).value = value;
    }
};

export default mutations;
