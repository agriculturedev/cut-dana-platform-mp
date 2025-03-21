import axios from "axios";

/**
 * Adds interceptors to the different HTTP Get methods of javascript
 *
 * @param {string} token Bearer token to be added to the headers
 * @param {string} interceptorUrlRegex regex to match the urls that shall be eqipped with the bearer token
 * @return {void}
 */
function addInterceptor (token, interceptorUrlRegex) {
    axios.interceptors.request.use(
        config => {
            const configUrl = typeof config.url === "object" ? config.url.origin : config.url;

            if (!configUrl?.startsWith("http") || (interceptorUrlRegex && configUrl?.match(interceptorUrlRegex))) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    (function (open) {
        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            const opened = open.call(this, method, url, ...rest);

            if (interceptorUrlRegex && this.responseURL?.match(interceptorUrlRegex)) {
                this.setRequestHeader("Authorization", `Bearer ${token}`);
            }
            return opened;
        };
    })(XMLHttpRequest.prototype.open);

    const {fetch: originalFetch} = window;

    window.fetch = async (resource, options = null) => {
        let newOptions = options || {};

        if (interceptorUrlRegex && resource?.match(interceptorUrlRegex)) {
            newOptions = {
                ...newOptions,
                credentials: "include"
            };
        }

        return originalFetch(resource, newOptions);
    };

}

export default {
    addInterceptor
};
