import I18NextVue from "i18next-vue";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";


/**
 * Initialization. Wrapped in a function to avoid calling it initially
 * in a mochapack run.
 * @param {Object} app Vue-app
 * @returns {void}
 */
export function initiateVueI18Next (app) {
    app.use(I18NextVue, {i18next});
}

/**
* initialization of the language with i18next
* @pre i18next is not initialized
* @post i18next is initialized
* @param {Object} portalLanguageConfig the configuration red from config.js
* @param {Boolean} config.enabled activates the GUI for language switching
* @param {Boolean} config.debug if true i18next show debugging for developing
* @param {Object} config.languages the languages to be used as {krz: full} where krz is "en" and full is "english"
* @param {String} config.fallbackLanguage the language to use on startup
* @param {Array} config.changeLanguageOnStartWhen the incidents that changes the language on startup as Array where the order is important
* @returns {void}
*/
export function initLanguage (portalLanguageConfig) {
    // default language configuration
    const portalLanguage = Object.assign({
        "enabled": false,
        "debug": false,
        "languages": {
            "de": "deutsch",
            "en": "english"
        },
        "fallbackLanguage": "de",
        "changeLanguageOnStartWhen": ["querystring", "localStorage", "navigator", "htmlTag"],
        "loadPath": "/locales/{{lng}}/{{ns}}.json"
    }, portalLanguageConfig);

    // init i18next
    if (Config.portalLanguage !== undefined && Config.portalLanguage.enabled) {
        i18next.use(LanguageDetector);
    }

    i18next.on("initialized", () => {
        if (!portalLanguage.enabled) {
            i18next.changeLanguage("de");
        }
    });

    return i18next
        .use(Backend)
        .init({
            globalInjection: true,
            debug: portalLanguage.debug,

            // lng overrides language detection - so shall not be set (!)
            // lng: portalLanguage.fallbackLanguage,
            fallbackLng: portalLanguage.fallbackLanguage,
            supportedLngs: Object.keys(portalLanguage.languages),

            // to allow en-US when only en is on the supportedLngs - nonExplicitSupportedLngs must be set to true
            nonExplicitSupportedLngs: true,
            // to not look into a folder like /locals/en-US/... when en-US is detected, use load: "languageOnly" to avoid using Country-Code in path
            load: "languageOnly",
            // allow an empty value to count as invalid (by default is true)
            returnEmptyString: false,

            /**
            * getter for configured languages
            * @returns {Object}  an object {krz: full} with krz the language shortform and full the language longform
            */
            getLanguages: function () {
                return portalLanguage.languages;
            },

            /**
            * check wheather portalLanguage switcher is enabled or not
            * @returns {Boolean}  true if switcher has to be shown
            */
            isEnabled: function () {
                return portalLanguage.enabled;
            },

            ns: ["common"],
            defaultNS: "common",

            backend: {
                loadPath: portalLanguage.loadPath,
                crossDomain: false
            },

            detection: {
                // order and from where user language should be detected
                order: portalLanguage.changeLanguageOnStartWhen,

                // keys or params to lookup language from
                lookupQuerystring: "lng",
                lookupCookie: "i18next",
                lookupLocalStorage: "i18nextLng",
                lookupFromPathIndex: 0,
                lookupFromSubdomainIndex: 0,

                // cache user language on
                caches: ["localStorage"],
                excludeCacheFor: ["cimode"], // languages to not persist (cookie, localStorage)

                // optional expire and domain for set cookie
                // cookieMinutes: 10,
                // cookieDomain: "myDomain",

                // only detect languages that are in the whitelist
                checkWhitelist: true
            },
            interpolation: {
                skipOnVariables: false
            },
            appendNamespaceToMissingKey: true,
            /**
             * Custom handler for missing keys. Strips prefixes and corrects time format.
             * Removes unnecessary prefixes from translation keys and adjusts time formats
             * to use colons (`:`) where appropriate (e.g., replacing "HH.MM" with "HH:MM").
             * @param {String} key - The missing key string to process.
             * @returns {String} The cleaned key with time formats corrected if applicable.
             */
            parseMissingKeyHandler: (key) => {
                return key
                    .replace(/^(common:|additional:)/, "")
                    .replace(/(?<=\s|^)([01]?[0-9]|2[0-3])\.([0-5][0-9])(?=\s|$)/g, "$1:$2");
            }
        });
}
