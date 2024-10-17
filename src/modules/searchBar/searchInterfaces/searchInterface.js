import SearchResult from "../searchResults/searchResult";
import axios from "axios";

/**
 * Search interface is used as a parent element for concrete search interfaces.
 * @module modules/searchBar/searchInterfaces/searchInterface
 * @name SearchInterface
 * @abstract
 * @constructs
 * @param {String} paging Shows if all search hits are already in the store or if new requests have to be sent for further search hits. Possible values are "client" or "request.
 * @param {String} searchInterfaceId The id of the service interface.
 * @param {Object} [resultEvents={}] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover] Actions that are fired when hovering on a result list item.
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @returns {void}
 */
export default function SearchInterface (paging, searchInterfaceId, resultEvents = [], hitTemplate = "default") {
    this.paging = paging;
    this.searchInterfaceId = searchInterfaceId;
    this.resultEvents = resultEvents;
    this.hitTemplate = hitTemplate;

    /**
     * The current abor controller.
     * @type {String}
    */
    this.currentController = null;

    /**
    * List with results of the search.
    * @type {Object[]}
    */
    this.searchResults = [];

    /**
     * The search state. Can have the values: "aborted", "failed", "finished", "instantiated", "running".
     *  @type {String}
     */
    this.searchState = "instantiated";

    /**
     * Timeout for request to a search interface.
     * @type {Number}
     */
    this.timeout = this.timeout ?? 5000;

    /**
     * Total number of hits.
     * @type {Number}
     */
    this.totalHits = 0;
}

/**
 * Creates the possible actions and fills them.
 * This function must be overridden by each sub search interface.
 * @abstract
 * @returns {void}
 */
SearchInterface.prototype.createPossibleActions = function () {
    throw new Error("This function must be overridden by the sub search interface!");
};

/**
 * Search function that is triggered by the search bar.
 * This function must be overridden by each sub search interface.
 * @abstract
 * @returns {void}
 */
SearchInterface.prototype.search = function () {
    throw new Error("This function must be overridden by the sub search interface!");
};

/**
 * Aborts the previous request, if it is still running.
 * @returns {void}
 */
SearchInterface.prototype.abortRequest = function () {
    if (this.currentController instanceof AbortController) {
        this.searchState = "aborted";
        this.currentController.abort();
        this.currentController = null;
    }
};

/**
 * Sets the search results to empty collection.
 * @returns {void}
 */
SearchInterface.prototype.clearSearchResults = function () {
    this.searchResults = [];
};

/**
 * Normalizes and fills the result events to use them in the search result.
 * @param {Object} resultEvents The configured result events.
 * @param {Object} searchResult The search result of gazetter.
 * @param {Object} extendedData Extended data for searchInterface.
 * @returns {Object} The normalized actions for SearchResult.
 */
SearchInterface.prototype.normalizeResultEvents = function (resultEvents, searchResult, extendedData) {
    const resultEventsAsObject = this.resultEventsToObject(resultEvents),
        possibleActions = this.createPossibleActions(searchResult, extendedData);

    Object.keys(resultEventsAsObject).forEach(event => {
        Object.keys(resultEventsAsObject[event]).forEach(action => {
            if (possibleActions[action]) {
                resultEventsAsObject[event][action] = possibleActions[action];
            }
            else {
                delete resultEventsAsObject[event][action];
            }
        });
    });

    return resultEventsAsObject;
};

/**
 * Adds all search hits to the search result or suggestions.
 * @param {Object[]} [searchHits=[]] The search hits of an search interface.
 * @returns {void}
 */
SearchInterface.prototype.pushHitsToSearchResults = function (searchHits = []) {
    this.totalHits = searchHits.length;
    searchHits.forEach((searchHit, index) => {
        const extendedSearchResult = Object.assign(searchHit, {
            index: index,
            searchInterfaceId: this.searchInterfaceId
        });

        this.pushHitToSearchResults(extendedSearchResult);
    });
};

/**
 * Adds a search result to the search results.
 * @param {Object} [searchResult={}] One search result of an search interface.
 * @returns {void}
 */
SearchInterface.prototype.pushHitToSearchResults = function (searchResult = {}) {
    this.searchResults.push(new SearchResult(searchResult));
};

/**
 * Sends a request to a search interface.
 * If the same URL is requested again, the previous request is aborted.
 * @param {String} searchUrl The search URL.
 * @param {String} type The search type: GET or POST.
 * @param {Object} [payload] The payload for POST request.
 * @param {String} contentType The content type for POST request defaulting to json.
 * @returns {Object[]} Parsed result with hits of request.
 */
SearchInterface.prototype.requestSearch = async function (searchUrl, type, payload, contentType = "application/json;charset=UTF-8") {
    let response = {},
        resultData = {};

    this.searchState = "running";
    this.abortRequest();
    this.currentController = new AbortController();

    if (type === "GET") {
        response = await this.sendGetRequest(searchUrl, contentType);
    }
    else if (type === "POST") {
        response = await this.sendPostRequest(searchUrl, payload, contentType);
    }

    if (response.status === 200) {
        this.searchState = "finished";
        resultData = response.data;
    }
    else {
        this.searchState = "failed";
        resultData.status = "error";
        resultData.message = "error occured in xhr Request!" + response.statusText;
    }

    return resultData;
};

/**
 * Sends the GET request.
 * @param {String} searchUrl url to send request.
 * @param {String} contentType The content type for the request, defaulting to json.
 * @returns {Promise} Result of GET request.
 */
SearchInterface.prototype.sendGetRequest = function (searchUrl, contentType = "application/json;charset=UTF-8") {
    return axios.get(searchUrl, {
        headers: {
            "Content-Type": contentType
        },
        signal: this.currentController.signal,
        timeout: this.timeout
    });
};

/**
 * Sends the POST request.
 * @param {String} searchUrl url to send request.
 * @param {Object} payload The request payload.
 * @param {String} contentType The content type for the request, defaulting to json.
 * @returns {Promise} Result of POST request.
 */
SearchInterface.prototype.sendPostRequest = function (searchUrl, payload, contentType = "application/json;charset=UTF-8") {
    return axios.post(searchUrl, payload, {
        headers: {
            "Content-Type": contentType
        },
        signal: this.currentController.signal,
        timeout: this.timeout
    });
};

/**
 * Create an Object of resultEvents.
 * @param {Object} resultEvents The result events.
 * @returns {Object} The result events as object.
 */
SearchInterface.prototype.resultEventsToObject = function (resultEvents) {
    const resultEventsAsObject = {};

    Object.entries(resultEvents).forEach(([key, values]) => {
        resultEventsAsObject[key] = {};

        values.forEach(value => {
            resultEventsAsObject[key][value] = {};
        });
    });

    return resultEventsAsObject;
};
/**
 * Checks the configured resultEvents.
 * @param {Object} resultEvents configured resultEvents
 * @param {*} resultEventsSupported supported resultEvents
 * @param {*} searchInterfaceId id of the searchinterface
 * @returns {void}
 */
SearchInterface.prototype.checkConfig = async function (resultEvents, resultEventsSupported, searchInterfaceId) {
    if (resultEvents) {
        const appendix = "' . Wrong configuration of searchinterface " + searchInterfaceId + " in config.json. Supported actions:" + resultEventsSupported.join(",");

        resultEvents.onClick?.forEach(action => {
            if (!resultEventsSupported.includes(action)) {
                console.warn("unknown resultEvents.onClick-action '", action, appendix);
            }
        });
        resultEvents.onHover?.forEach(action => {
            if (!resultEventsSupported.includes(action)) {
                console.warn("unknown resultEvents.onHover-action '", action, appendix);
            }
        });
        resultEvents.buttons?.forEach(action => {
            if (!resultEventsSupported.includes(action)) {
                console.warn("unknown resultEvents.button-action '", action, appendix);
            }
        });
    }
};

