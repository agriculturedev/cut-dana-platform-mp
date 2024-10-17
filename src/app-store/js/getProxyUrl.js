import getters from "../getters";
/**
 * Rewrites the URL by replacing the dots with underlined
 * If a proxyHost is configured, it is prepended to the URL.
 * This prevents CORS errors.
 * Attention: A reverse proxy must be set up on the server side.
 * @module app-store/js/getProxyUrl
 * @param {String} url The URL to rewrite.
 * @param {String} [proxyHost=configJs.proxyHost] Specifies whether points should be replaced by underscores in URLs.
 * @returns {String} The rewritten URL with underlined instead of dots.
 */
export function getProxyUrl (url, proxyHost = getters.proxyHost()) {

    const parser = document.createElement("a");
    let protocol = "",
        result = url,
        hostname = "",
        resultHostname = parser.hostname,
        port = "";

    parser.href = url;
    protocol = parser.protocol;

    if (protocol.indexOf("//") === -1) {
        protocol += "//";
    }

    port = parser.port;

    if (!parser.hostname) {
        parser.hostname = window.location.hostname;
    }

    if (parser.hostname === "localhost" || !parser.hostname) {
        return url;
    }

    if (port) {
        result = url.replace(":" + port, "");
    }

    result = url.replace(protocol, "");
    resultHostname = result.includes("/") ? result.substring(0, result.indexOf("/")) : result;
    hostname = resultHostname;
    hostname = hostname.replaceAll(".", "_");
    console.warn(`Please set up a CORS header for the service with the URL: ${url}`
    + " This is recommended by the GDI-DE"
    + " (https://www.gdi-de.org/download/AK_Geodienste_Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf)"
    + " in chapter 4.7.1.!");

    return proxyHost + "/" + result.replace(resultHostname, hostname);
}

/**
 * Updates url to proxy url within nested object if useProxy is set to true.
 * @param {Object} obj Object where url should be updated tp proxy url.
 * @param {String} proxyHost Specifies whether points should be replaced by underscores in URLs.
 * @returns {Object} The object with updated url values.
 */
export function updateProxyUrl (obj, proxyHost) {
    for (const key in obj) {
        const value = obj[key];

        if (value && typeof value === "object") {
            updateProxyUrl(value, proxyHost);
        }
        if (value && Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                if (typeof value[i] === "object" && value[i].useProxy === true && value[i].url) {
                    updateProxyUrl(value, proxyHost);
                }
            }
        }
    }
    if (obj?.useProxy === true && obj?.url) {
        obj.url = getProxyUrl(obj.url, proxyHost);
    }
    return obj;
}

