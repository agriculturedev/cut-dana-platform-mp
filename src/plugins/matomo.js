import VueMatomo from "vue-matomo";

/**
 * Initialization.
 * @param {Object} app Vue-app
 * @returns {void}
 */
export function initiateMatomo (app) {
    app.use(VueMatomo, Config.matomo);

    // track Page Views
    window._paq.push(["trackPageView"]);
}

/**
 * Tracking Call
 * @param {String} category Category of the matomo Event.
 * @param {String} action Description of action of the matomo Event.
 * @param {String} name Value or name of the matomo Event.
 * @returns {void}
 */
export function trackMatomo (category, action, name) {
    if (typeof Matomo !== "undefined") {
        window._paq.push(["trackEvent", category, action, name]);
    }
}
