import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import initialState from "./stateContact";

const mutations = {
    ...generateSimpleMutations(initialState),
    togglePrivacyPolicyAccepted: state => {
        state.privacyPolicyAccepted = !state.privacyPolicyAccepted;
    }
};

export default mutations;
