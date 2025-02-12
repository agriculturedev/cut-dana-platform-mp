import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateGetFeatureInfo from "./stateGetFeatureInfo";

/**
 * The mutations for the getFeatureInfo.
 * @module modules/getFeatureInfo/store/mutationsGetFeatureInfo
 */
export default {
    ...generateSimpleMutations(stateGetFeatureInfo),
    removeGfiFeatureByLayerId (state, layerId) {
        state.gfiFeatures.splice(state.gfiFeatures.findIndex(gfiFeature => gfiFeature.getLayerId() === layerId), 1);
    }
};
