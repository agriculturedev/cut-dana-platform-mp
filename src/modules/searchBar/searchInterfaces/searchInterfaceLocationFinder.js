import crs from "@masterportal/masterportalapi/src/crs";

import SearchInterface from "./searchInterface";
import store from "../../../app-store";

/**
 * The search interface to the location finder.
 * @module modules/searchBar/searchInterfaces/SearchInterfaceLocationFinder
 * @name SearchInterfaceLocationFinder
 * @constructs
 * @extends SearchInterface
 * @param {String} serviceId Service id. Resolved using the rest-services.json file.
 *
 * @param {String[]} [classes] May contain classes (with properties) to use in searches.
 * @param {String} [epsg] Coordinate reference system to use for requests. By default, the value in `portalConfig.map.mapView.epsg` is used.
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToResult"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="locationFinder"] The id of the service interface.
 * @returns {void}
 */
export default function SearchInterfaceLocationFinder ({serviceId, classes, epsg, hitTemplate, resultEvents, searchInterfaceId} = {}) {
    const resultEventsDefault = {
            onClick: ["setMarker", "zoomToResult"],
            onHover: ["setMarker"],
            buttons: ["startRouting"]
        },
        resultEventsSupported = ["setMarker", "zoomToResult", "startRouting"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "locationFinder",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.serviceId = serviceId;

    this.classes = classes || [];
    this.epsg = epsg || store.getters["Maps/projectionCode"];
}

SearchInterfaceLocationFinder.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in location finder search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceLocationFinder.prototype.search = async function (searchInput) {
    const searchUrl = `${store?.getters?.restServiceById(this.serviceId)?.url}/Lookup?query=${searchInput}&sref=${this.epsg}`,
        extendedSearchUrl = this.classes.length > 0 ? `${searchUrl}&filter=type:${this.classes.map(item => item.name).join(",")}` : searchUrl,
        resultData = await this.requestSearch(extendedSearchUrl, "GET"),
        epsgCode = "EPSG:" + resultData.sref;

    if (!resultData?.ok) {
        this.handleServerError(resultData);
    }
    else if (!crs.getProjection(epsgCode)) {
        this.showError({
            statusText: i18next.t("common:modules.searchBar.locationFinder.unknownProjection") + " (" + epsgCode + ")"
        });
    }
    else if (Array.isArray(resultData.locs)) {
        this.pushHitsToSearchResults(this.normalizeResults(resultData.locs, epsgCode));
    }

    return this.searchResults;
};

/**
 * Handle error for location finder is not ok.
 * @param {Object} resultData The result data.
 * @returns {void}
 */
SearchInterfaceLocationFinder.prototype.handleServerError = function (resultData) {
    let statusText = i18next.t("common:modules.searchBar.locationFinder.serverError");

    if (resultData.info) {
        statusText = `${statusText}: ${resultData.info}`;
    }

    this.showError({
        statusText: statusText
    });
};

/**
 * Prints a console error message.
 * @param {Object} err Error object from request.
 * @returns {void}
 */
SearchInterfaceLocationFinder.prototype.showError = function (err) {
    let msg = err.msg && err.msg !== "" ? err.msg : i18next.t("common:modules.searchBar.locationFinder.errorMsg");

    if (err.statusText && err.statusText !== "") {
        msg += ": " + err.statusText;
    }

    console.error(msg);
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of location finder.
 * @param {String} epsgCode The EPSG-code of the coordinate reference system.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceLocationFinder.prototype.normalizeResults = function (searchResults, epsgCode) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        const classDefinition = this.classes.find(item => item.name === searchResult.type) || {};

        normalizedResults.push(this.normalizeResult(searchResult, {classDefinition, epsgCode}));
    });

    return normalizedResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResult The search result of location finder.
 * @param {Object} extendedData Extended data for searchInterface location finder.
 * @param {Object} extendedData.classDefinition Contains class definitions to use for search result.
 * @param {Number} extendedData.epsgCode The EPSG-code of the coordinate reference system.
 * @param {String} epsgCode The EPSG-code of the coordinate reference system.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceLocationFinder.prototype.normalizeResult = function (searchResult, extendedData) {
    return {
        events: this.normalizeResultEvents(this.resultEvents, searchResult, extendedData),
        category: searchResult.type,
        id: "locationFinder_" + searchResult.id,
        icon: extendedData?.classDefinition?.icon || "bi-signpost-2",
        name: searchResult.name
    };
};

/**
 * Creates the possible actions and fills them.
 * @override
 * @param {Object} searchResult The search result of locationFinder.
 * @param {Object} extendedData Extended data for searchInterface location finder.
 * @param {Object} extendedData.classDefinition Contains class definitions to use for search result.
 * @param {Number} extendedData.epsgCode The EPSG-code of the coordinate reference system.
 * @returns {Object} The possible actions.
 */
SearchInterfaceLocationFinder.prototype.createPossibleActions = function (searchResult, extendedData) {
    const coordinates = this.processCoordinatesForActions(searchResult, extendedData);

    return {
        setMarker: {
            coordinates: coordinates
        },
        zoomToResult: {
            coordinates: coordinates
        },
        startRouting: {
            coordinates: coordinates,
            name: searchResult.name
        }
    };
};

/**
 * Processes the coordinates of search result to use in actions.
 * @param {Object} searchResult The search result of locationFinder.
 * @param {Object} extendedData Extended data for searchInterface location finder.
 * @param {Object} extendedData.classDefinition Contains class definitions to use for search result.
 * @param {Number} extendedData.epsgCode The EPSG-code of the coordinate reference system.
 * @returns {Object} The coordinates for actions.
 */
SearchInterfaceLocationFinder.prototype.processCoordinatesForActions = function (searchResult, extendedData) {
    const map = mapCollection.getMap("2D"),
        epsgCode = extendedData.epsgCode;
    let coordinates = crs.transformFromMapProjection(map, epsgCode, [parseFloat(searchResult.cx), parseFloat(searchResult.cy)]);

    if (extendedData.classDefinition?.zoom === "bbox") {
        const min = crs.transformFromMapProjection(map, epsgCode, [parseFloat(searchResult.xmin), parseFloat(searchResult.ymin)]),
            max = crs.transformFromMapProjection(map, epsgCode, [parseFloat(searchResult.xmax), parseFloat(searchResult.ymax)]);

        coordinates = [min[0], min[1], max[0], min[1], max[0], max[1], min[0], max[1], min[0], min[1]];
    }

    return coordinates;
};
