import crs from "@masterportal/masterportalapi/src/crs";

import SearchInterface from "./searchInterface";
import store from "../../../app-store";

/**
 * The search interface to the elasticSearch.
 * @module modules/searchBar/searchInterfaces/SearchInterfaceElasticSearch
 * @name SearchInterfaceElasticSearch
 * @param {Object} hitMap Object mapping result object attributes to keys.
 * @param {String} hitMap.coordinate Attribute value will be mapped to the attribute key.
 * @param {String} hitMap.id Attribute value will be mapped to the attribute key.
 * @param {String} hitMap.layerId Attribute value will be mapped to the attribute key.
 * @param {String} hitMap.name Attribute value will be mapped to the attribute key.
 * @param {String} hitMap.toolTip Attribute value will be mapped to the attribute key.
 * @param {String} serviceId Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.
 *
 * @param {String} [epsg="EPSG:25832"] The epsg code from the result coordinates.
 * @param {String} [hitIcon="bi-list-ul"] CSS icon class of search results, shown before the result name.
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {Object} [hitType="common:modules.searchBar.type.subject"] Search result type shown in the result list after the result name.
 * @param {Object} [payload={}] Matches the customObject description.
 * @param {String} [responseEntryPath=""] Response JSON attribute path to found features.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["addLayerToTopicTree"]] Actions that are fired when clicking on a result list item.
 * @param {String} [searchInterfaceId="elasticSearch"] The id of the service interface.
 * @param {String} [searchStringAttribute="searchString"] Search string attribute name for `payload` object.
 * @param {String} [requestType="POST"] Request type.
 * @constructs
 * @extends SearchInterface
 * @returns {void}
 */
export default function SearchInterfaceElasticSearch ({hitMap, serviceId, epsg, hitIcon, hitTemplate, hitType, payload, responseEntryPath, resultEvents, searchInterfaceId, searchStringAttribute, requestType} = {}) {
    const resultEventsDefault = {
            onClick: ["addLayerToTopicTree"],
            buttons: ["showInTree", "showLayerInfo"]
        },
        resultEventsSupported = ["addLayerToTopicTree", "setMarker", "showInTree", "showLayerInfo", "startRouting", "zoomToResult"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);
    SearchInterface.call(this,
        "request",
        searchInterfaceId || "elasticSearch",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.hitMap = hitMap;
    this.serviceId = serviceId;
    this.epsg = epsg || "EPSG:25832";
    this.hitIcon = hitIcon || "bi-list-ul";
    this.hitType = hitType || "common:modules.searchBar.type.subject";
    this.payload = payload || {};
    this.responseEntryPath = responseEntryPath || "";
    this.searchStringAttribute = searchStringAttribute || "searchString";
    this.requestType = requestType || "POST";
}

SearchInterfaceElasticSearch.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in elasticSearch search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceElasticSearch.prototype.search = async function (searchInput) {
    const searchStringAttribute = this.searchStringAttribute,
        payload = this.appendSearchStringToPayload(this.payload, searchStringAttribute, searchInput),
        payloadWithIgnoreIds = this.addIgnoreIdsToPayload(payload, store.getters.treeConfig),
        requestConfig = {
            serviceId: this.serviceId,
            requestType: this.requestType,
            payload: payloadWithIgnoreIds,
            responseEntryPath: this.responseEntryPath
        },
        result = await this.initializeSearch(requestConfig),
        normalizedResults = this.normalizeResults(result.hits);

    this.pushHitsToSearchResults(normalizedResults);

    return this.searchResults;
};

/**
 * Recursively searches for the searchStringAttribute key and sets the searchString.
 * Adds the search string to the payload using the given key
 * @param {Object} payload Payload as Object
 * @param {String} searchStringAttribute Attribute key to be added to the payload object.
 * @param {String} searchString Search string to be added using the searchStringAttribute.
 * @returns {Object} The payload with the search string.
 */
SearchInterfaceElasticSearch.prototype.appendSearchStringToPayload = function (payload, searchStringAttribute, searchString) {
    Object.keys(payload).forEach(key => {
        if (typeof payload[key] === "object") {
            payload[key] = this.appendSearchStringToPayload(payload[key], searchStringAttribute, searchString);
        }
        else if (key === searchStringAttribute) {
            payload[searchStringAttribute] = searchString;
        }
    });

    return payload;
};

/**
 * Blacklist of layerIds and metdataids.
 * Adds layerids and metadataids to the payload that should not appear in the response.
 * @param {Object} payload Payload as Object.
 * @param {Object} configTree Tree configuration from config.js.
 * @returns {Object} Payload with ignore ids.
 */
SearchInterfaceElasticSearch.prototype.addIgnoreIdsToPayload = function (payload, configTree) {
    if (configTree?.layerIDsToIgnore?.length > 0) {
        payload.params.id = configTree.layerIDsToIgnore;
    }
    if (configTree?.metaIDsToIgnore?.length > 0) {
        payload.params["datasets.md_id"] = configTree.metaIDsToIgnore;
    }

    return payload;
};

/**
 * Main function to start the search using the requestConfig.
 * @param {Object} requestConfig The configuration of the axios request.
 * @param {String} requestConfig.serviceId Id of the rest-service to be used. If serviceId is given, the url from the rest-service is taken.
 * @param {String} requestConfig.url If no serviceId is given, alternatively an url can be passed.
 * @param {String} requestConfig.type Type of request. "POST" or "GET".
 * @param {Object} requestConfig.payload Payload used to "POST" to url or be appended to url if type is "GET".
 * @param {String} requestConfig.responseEntryPath="" The path of the hits in the response JSON. The different levels of the response JSON are marked with "."
 * @returns {Object} The result object of the request.
 */
SearchInterfaceElasticSearch.prototype.initializeSearch = async function (requestConfig) {
    const restService = store?.getters?.restServiceById(this.serviceId),
        url = restService ? restService.url : requestConfig.url;
    let result = {
        status: "success",
        message: "",
        hits: []
    };

    if (url) {
        result = await this.sendRequest(url, requestConfig, result);
    }
    else {
        result.status = "error";
        result.message = `Cannot retrieve url by rest-service with id: ${this.serviceId} ! Please check the configuration for rest-services!`;
        result.hits = [];
    }
    return result;
};

/**
 * Sends the request.
 * @param {String} url url to send request.
 * @param {Object} requestConfig Config with all necccessary params for request.
 * @param {Object} result Result object.
 * @param {String} result.status Status of request "success" or "error".
 * @param {String} result.message Message of request.
 * @param {Object[]} result.hits Array of result hits.
 * @returns {Object} Parsed result of request.
 */
SearchInterfaceElasticSearch.prototype.sendRequest = async function (url, requestConfig, result) {
    const requestType = requestConfig.requestType || "POST",
        payload = requestConfig.payload || undefined,
        urlWithPayload = requestType === "GET" ? `${url}?source_content_type=application/json&source=${
            JSON.stringify(payload)
        }` : url;
    let resultData = result;

    if (requestType === "GET") {
        resultData = await this.requestSearch(urlWithPayload, "GET");
    }
    else if (requestType === "POST") {
        resultData = await this.requestSearch(url, "POST", payload);
    }

    return resultData.hits;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of gazetter.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceElasticSearch.prototype.normalizeResults = function (searchResults) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        const id = this.getResultByPath(searchResult, this.hitMap?.id);

        normalizedResults.push({
            events: this.normalizeResultEvents(this.resultEvents, searchResult),
            category: this.hitType.startsWith("common:") ? i18next.t(this.hitType) : i18next.t(this.getTranslationByType(this.getResultByPath(searchResult, this.hitType))),
            icon: this.hitIcon,
            id: typeof id === "number" ? String(id) : id,
            name: this.getResultByPath(searchResult, this.hitMap?.name),
            toolTip: this.getResultByPath(searchResult, this.hitMap?.toolTip)
        });
    });

    return normalizedResults;
};

/**
 * Returns the translation key to a search result type.
 * @param {String} type The search result type.
 * @returns {String} The translation key.
 */
SearchInterfaceElasticSearch.prototype.getTranslationByType = function (type) {
    const keys = {
        District: "common:modules.searchBar.type.district",
        Address: "common:modules.searchBar.type.address",
        parcel: "common:modules.searchBar.type.parcel",
        Street: "common:modules.searchBar.type.street",
        County: "common:modules.searchBar.type.county"
    };

    return i18next.t(keys[type]);
};

/**
 * Creates the possible actions and fills them.
 * @override
 * @param {Object} searchResult The search result of elastic search.
 * @returns {Object} The possible actions.
 */
SearchInterfaceElasticSearch.prototype.createPossibleActions = function (searchResult) {
    let coordinates = this.getResultByPath(searchResult, this.hitMap?.coordinate),
        layerId = this.getResultByPath(searchResult, this.hitMap?.layerId);

    if (coordinates) {
        coordinates = crs.transformToMapProjection(mapCollection.getMap("2D"), this.epsg, [parseFloat(coordinates[0]), parseFloat(coordinates[1])]);
    }
    if (typeof layerId === "number") {
        layerId = String(layerId);
    }

    return {
        addLayerToTopicTree: {
            layerId,
            source: this.getResultByPath(searchResult, this.hitMap?.source)
        },
        setMarker: {
            coordinates: coordinates
        },
        zoomToResult: {
            coordinates: coordinates
        },
        startRouting: {
            coordinates: coordinates,
            name: this.getResultByPath(searchResult, this.hitMap?.name)
        },
        showInTree: {
            layerId,
            source: this.getResultByPath(searchResult, this.hitMap?.source)
        },
        showLayerInfo: {
            layerId,
            source: this.getResultByPath(searchResult, this.hitMap?.source)
        }
    };
};

/**
 * Returns the found result in searchResult by path of mapping attribute.
 * @param {Object} searchResult The search result of elastic search.
 * @param {String|String[]} mappingAttribute The mapping attribute.
 * @returns {String} The found result.
 */
SearchInterfaceElasticSearch.prototype.getResultByPath = function (searchResult, mappingAttribute) {
    if (typeof mappingAttribute !== "undefined") {
        let result = searchResult;

        if (Array.isArray(mappingAttribute)) {
            result = this.getResultByPathArray(searchResult, mappingAttribute);
        }
        else {
            const splittedAttribute = mappingAttribute?.split(".") || [];

            splittedAttribute.forEach(attribute => {
                if (typeof result[attribute] !== "undefined") {
                    result = result[attribute];
                }
            });
        }

        return result;
    }

    return "";
};

/**
 * Returns the found result in searchResult by path of mapping attributes.
 * @param {Object} searchResult The search result of elastic search.
 * @param {String[]} mappingAttributes The mapping attributes.
 * @returns {String} The found result.
 */
SearchInterfaceElasticSearch.prototype.getResultByPathArray = function (searchResult, mappingAttributes) {
    let result;

    mappingAttributes.forEach(singleAttribute => {
        const splittedAttribute = singleAttribute?.split(".") || [];
        let singleResult = searchResult;

        splittedAttribute.forEach(attribute => {
            singleResult = Array.isArray(singleResult[attribute]) ? singleResult[attribute][0] : singleResult[attribute];
        });

        result = typeof result !== "undefined" ? result + " - " + singleResult : singleResult;
    });

    return result;
};
