import store from "../../../app-store";

/**
 * Process the functions of url params.
 * @param {Object} [params={}] The params to process.
 * @param {Object} [legacyParams={}] The legacy params to process.
 * @returns {void}
 */
export default function processUrlParams (params = {}, legacyParams = {}) {
    const foundParams = {};

    [params, legacyParams].forEach(urlParams => {
        Object.keys(urlParams).forEach(param => {
            const value = store.getters.getUrlParamValue(param);

            if (typeof value !== "undefined") {
                foundParams[param] = value;

                if (typeof urlParams[param] === "function") {
                    urlParams[param](foundParams);
                }
            }
        });
    });
}
