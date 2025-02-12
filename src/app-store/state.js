/**
 * The root state.
 * @module app-store/state
 * @typedef {Object} app-store state
 * @property {Object} [configJs=null] The config.js data.
 * @property {String} [deviceMode="Desktop"] The current deviceMode.
 * @property {Object[]} [layerConfig=[]] The layer configuration.
 * @property {Object} [loadedConfigs= { configJson: false, restServicesJson: false, servicesJson: false }] The loaded configs.
 * @property {Boolean} [styleListLoaded=false} true, id list of vectorstyles is loaded.
 * @property {Object} [portalConfig=null] The portal configuration.
 * @property {Object} [restConf=null] The rest-services.json data.
 * @property {Object} [urlParams=[]] The url params.
 */
const state = {
    configJs: null,
    deviceMode: "Desktop",
    layerConfig: [],
    loadedConfigs: {
        configJson: false,
        restServicesJson: false,
        servicesJson: false
    },
    styleListLoaded: false,
    portalConfig: null,
    restConfig: null,
    urlParams: {}
};

export default state;
