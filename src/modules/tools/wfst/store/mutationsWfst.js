import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateWfst";

const mutations = {
    ...generateSimpleMutations(initialState),

    setFeatureProperty ({featureProperties}, {key, value, valid, required}) {
        featureProperties.find(property => property.key === key).value = value;
        featureProperties.find(property => property.key === key).valid = valid;
        featureProperties.find(property => property.key === key).required = required;
    }
};

export default mutations;
