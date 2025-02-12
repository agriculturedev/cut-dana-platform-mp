/* eslint-disable no-undef */
import store from "../app-store";
import main from "../main";
import {defineComponent} from "vue";

const allAddons = typeof VUE_ADDONS !== "undefined" ? VUE_ADDONS : {};

export default {
/**
 * Adds all addons based on config.js and addonsConf.json to the Vue Instance and store
 * @param {String[]} config The array of addonKeys specified in config.js
 * @returns {void}
 */
    loadAddons: async function (config) {
        main.getApp().config.globalProperties.$gfiThemeAddons = [];
        main.getApp().config.globalProperties.$searchInterfaceAddons = [];

        if (config) {
            const addons = config.map(async addonKey => {
                try {
                    const addonConf = allAddons[addonKey];

                    if (addonConf && Object.prototype.hasOwnProperty.call(addonConf, "type")) {
                        if (addonConf.type === "control") {
                            await this.loadControls(addonKey);
                        }
                        else if (addonConf.type === "gfiTheme") {
                            await this.loadGfiThemes(addonKey);
                        }
                        else if (addonConf.type === "searchInterface") {
                            await this.loadSearchInterfaces(addonKey);
                        }
                        else if (addonConf.type === "tool") {
                            await this.loadToolAddons(addonKey);
                        }
                        else if (addonConf.type === "javascript") {
                            await this.loadJavascriptAddons(addonKey);
                        }
                    }
                }
                catch (e) {
                    console.warn(e);
                    console.warn(`The module ${addonKey} does not include a Vue-component and/or vuex-store-module. Please make sure the folder contains a ${addonKey}.vue and ${addonKey}.js file.`, e);
                }
            });

            await Promise.all(addons);
        }
    },

    /**
     * Load javascript addons and register store when it exists.
     * @param {String} addonKey specified in config.js
     * @returns {void}
     */
    loadJavascriptAddons: async function (addonKey) {
        const addon = await this.loadAddon(addonKey);

        if (addon.store) {
            store.registerModule([upperFirst(addonKey)], addon.store);
        }
    },
    /**
 * Loads the control and creates the Vue component and adds it to Vue instance globally
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
    loadControls: async function (addonKey) {
        const addon = await this.loadAddon(addonKey),
            name = addon.component.name.charAt(0).toLowerCase() + addon.component.name.slice(1);

        defineComponent(addon.component.name, addon.component);
        if (addon.store) {
            store.registerModule(["Controls", addon.component.name], addon.store);
        }
        store.commit("Controls/registerControl", {name: name, control: addon.component});
    },

    /**
 * Loads the gfi themes and creates the Vue component and adds it to Vue instance globally
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
    loadGfiThemes: async function (addonKey) {
        const addon = await this.loadAddon(addonKey),
            addonName = addon.component.name.charAt(0).toLowerCase() + addon.component.name.slice(1);

        main.getApp().component(addon.component.name, addon.component);
        main.getApp().config.globalProperties.$gfiThemeAddons.push(addon.component.name);
        if (addon.store) {
            store.registerModule(["Modules", addon.component.name], addon.store);
            moduleCollection[addonName] = addon.component;
        }
    },

    /**
 * Load searchInterface and register store when it exists.
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
    loadSearchInterfaces: async function (addonKey) {
        const addon = await this.loadAddon(addonKey);

        main.getApp().config.globalProperties.$searchInterfaceAddons.push(addon);
    },

    /**
 * Creates the Vue component and adds it to Vue instance globally.
 * Registers the store at "Modules" and adds the local-files.
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
    loadToolAddons: async function (addonKey) {
        const addon = await this.loadAddon(addonKey),
            addonName = addon.component.name.charAt(0).toLowerCase() + addon.component.name.slice(1);

        store.registerModule(["Modules", addon.component.name], addon.store);
        moduleCollection[addonName] = addon.component;
    },

    /**
 * Loads the addon with locales.
 * @param {String} addonKey specified in config.js
 * @returns {Object} The addon.
 */
    loadAddon: async function (addonKey) {
        const addonModule = await import(
                /* webpackChunkName: "[request]" */
                /* webpackInclude: /addons[\\\/].*[\\\/]index.js$/ */
                /* webpackExclude: /(node_modules)|(.+unittests.)|(.+test.)+/ */
                `../../addons/${allAddons[addonKey].entry}`
            ),
            addon = addonModule.default;

        for (const localeKey in addon.locales) {
            i18next.addResourceBundle(localeKey, "additional", addon.locales[localeKey], true);
        }
        return addon;
    }
};

