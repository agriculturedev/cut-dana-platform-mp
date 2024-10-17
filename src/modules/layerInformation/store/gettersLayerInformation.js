import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import {isUrl} from "../../../shared/js/utils/urlHelper";
import stateLayerInformation from "./stateLayerInformation";

/**
 * The getters for the layerInformation.
 * @module modules/layerInformation/store/gettersLayerInformation
 */
export default {
    ...generateSimpleGetters(stateLayerInformation),

    /**
     * Provides state for urlParams.
     * @param {Object} state state of the app-store.
     * @returns {Object} state for urlParams
     */
    urlParams: state => {
        const layerInfoCopy = {...state.layerInfo},
            layerInfoEncoded = {};

        Object.entries(layerInfoCopy).forEach(([key, value]) => {
            let encoded = value;

            if (isUrl(value)) {
                encoded = encodeURIComponent(value);
            }
            layerInfoEncoded[key] = encoded;
        });

        return {
            layerInfo: layerInfoEncoded
        };
    }
};
