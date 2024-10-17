import processUrlParams from "../../../shared/js/utils/processUrlParams";

/**
 * Examples:
 * - https://localhost:9001/portal/master/?configjson=../basic/config.json
 * - https://localhost:9001/portal/master/?lng=en&STYLE=simple
 */

const globalUrlParams = {
        CONFIGJSON: setConfigJsonPath,
        LNG: setLanguage,
        UISTYLE: setUiStyle
    },
    legacyGlobalUrlParams = {
        CONFIG: setConfigJsonPath,
        STYLE: setUiStyle
    };

/**
 * Process the menu url params.
 * @returns {void}
 */
function processGlobalUrlParams () {
    processUrlParams(globalUrlParams, legacyGlobalUrlParams);
}

/**
 * Sets the config.json path to the config.js.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setConfigJsonPath (params) {
    Config.portalConf = params.CONFIGJSON || params.CONFIG;
}

/**
 * Sets the langugage to the config.js.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setLanguage (params) {
    i18next.changeLanguage(params.LNG);
}

/**
 * Sets the ui style to the config.js.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setUiStyle (params) {
    Config.uiStyle = params.UISTYLE || params.STYLE;
}

export default {
    processGlobalUrlParams
};
