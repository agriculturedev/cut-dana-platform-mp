import crs from "@masterportal/masterportalapi/src/crs";

import SearchInterface from "./searchInterface";
import store from "../../../app-store";
import {uniqueId} from "../../../shared/js/utils/uniqueId";

/**
 * The search interface to the bkg geocoder.
 * @module modules/searchBar/searchInterfaces/searchInterfaceBkg
 * @name SearchInterfaceBkg
 * @constructs
 * @extends SearchInterface
 * @see {@link https://sg.geodatenzentrum.de/web_public/gdz/dokumentation/deu/geokodierungsdienst.pdf}
 * @param {String} geoSearchServiceId Search service id. Resolved using the rest-services.json file.
 *
 * @param {String} [epsg="EPSG:25832"] EPSG code of the coordinate reference system to use. By default, the value in `portalConfig.map.mapView.epsg` is used.
 * @param {Number[]} [extent=[454591, 5809000, 700000, 6075769]] Coordinate extent in which search algorithms should return.
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {Number} [minscore=0.6] Minimum score value that the results must have.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToResult"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="bkg"] The id of the service interface.
 * @param {Number} [resultCount=20] Result amount.
 * @returns {void}
 */
export default function SearchInterfaceBkg ({geoSearchServiceId, epsg, extent, hitTemplate, minScore, resultEvents, searchInterfaceId, resultCount} = {}) {
    const resultEventsDefault = {
            onClick: ["setMarker", "zoomToResult"],
            onHover: ["setMarker"],
            buttons: ["startRouting"]
        },
        resultEventsSupported = ["setMarker", "zoomToResult", "startRouting"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);

    SearchInterface.call(this,
        "request",
        searchInterfaceId || "bkg",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.geoSearchServiceId = geoSearchServiceId;

    this.epsg = epsg || "EPSG:25832";
    this.extent = extent || [454591, 5809000, 700000, 6075769];
    this.minScore = minScore || 0.6;
    this.resultCount = resultCount || 20;
}

SearchInterfaceBkg.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in bkg search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceBkg.prototype.search = async function (searchInput) {
    const resultData = await this.requestSearch(this.createSearchUrl(searchInput), "GET");

    this.pushHitsToSearchResults(this.normalizeResults(resultData.features));

    return this.searchResults;
};

/**
 * Creates the search url with GET parameters.
 * @param {String} searchInput The search Input
 * @returns {String} The search url.
 */
SearchInterfaceBkg.prototype.createSearchUrl = function (searchInput) {
    const searchUrl = store?.getters?.restServiceById(this.geoSearchServiceId)?.url,
        extendedSearchUrl = `${searchUrl}?bbox=${this.extent}&outputformat=json&srsName=${this.epsg}&count=${this.resultCount}&query=${encodeURIComponent(searchInput)}`;

    return extendedSearchUrl;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of bkg geo search.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceBkg.prototype.normalizeResults = function (searchResults) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        if (searchResult.properties.score > this.minScore) {
            normalizedResults.push(this.normalizeResult(searchResult));
        }
    });

    return normalizedResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResult The search result of bkg geo search.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceBkg.prototype.normalizeResult = function (searchResult) {
    return {
        events: this.normalizeResultEvents(this.resultEvents, searchResult),
        category: searchResult.properties.typ,
        id: uniqueId("BkgGeoSearch"),
        icon: "bi-signpost-2",
        name: searchResult.properties.text,
        toolTip: searchResult.properties.text
    };
};


/**
 * Creates the possible actions and fills them.
 * @override
 * @param {Object} searchResult The search result of bkg geo search.
 * @returns {Object} The possible actions.
 */
SearchInterfaceBkg.prototype.createPossibleActions = function (searchResult) {
    let coordinates = searchResult.geometry.coordinates;

    if (store.getters["Maps/projectionCode"] !== this.epsg) {
        coordinates = crs.transformToMapProjection(mapCollection.getMap("2D"), this.epsg, [parseFloat(coordinates[0]), parseFloat(coordinates[1])]);
    }

    return {
        setMarker: {
            coordinates: coordinates
        },
        zoomToResult: {
            coordinates: coordinates
        },
        startRouting: {
            coordinates: coordinates,
            name: searchResult.properties?.text
        }
    };
};
