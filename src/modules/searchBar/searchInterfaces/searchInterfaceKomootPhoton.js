import crs from "@masterportal/masterportalapi/src/crs";

import SearchInterface from "./searchInterface";
import store from "../../../app-store";
import {uniqueId} from "../../../shared/js/utils/uniqueId";

/**
 * The search interface to the koomot photon geocoder.
 * @module modules/searchBar/searchInterfaces/SearchInterfaceKomootPhoton
 * @name SearchInterfaceKomootPhoton
 * @constructs
 * @extends SearchInterface
 * @see {@link https://photon.komoot.io/}
 * @param {String} serviceId Search service id. Resolved using the rest-services.json file.
 *
 * @param {String} [bbox] Boundingbox of the search.
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {String} [lang="de"] Language of the Komoot Search. Effects language specific locationnames (e.g. Countrynames) aus.
 * @param {Number} [lat] Latitude of the center for the search.
 * @param {Number} [limit] Maximum amount of requested unfiltered results.
 * @param {Number} [lon] Longtitude of the center for the search.
 * @param {String} [osmTag] Filtering of OSM Tags.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToResult"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="komootPhoton"] The id of the service interface.
 * @returns {void}
 */
export default function SearchInterfaceKomootPhoton ({serviceId, bbox, hitTemplate, limit, lang, lat, lon, osmTag, resultEvents, searchInterfaceId} = {}) {
    const resultEventsDefault = {
            onClick: ["setMarker", "zoomToResult"],
            onHover: ["setMarker"],
            buttons: ["startRouting"]
        },
        resultEventsSupported = ["setMarker", "zoomToResult", "startRouting"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "komootPhoton",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.serviceId = serviceId;

    this.bbox = bbox;
    this.lang = lang || "de";
    this.lat = lat;
    this.limit = limit;
    this.lon = lon;
    this.osmTag = osmTag;
}

SearchInterfaceKomootPhoton.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in komoot photon search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceKomootPhoton.prototype.search = async function (searchInput) {
    const resultData = await this.requestSearch(this.createSearchUrl(searchInput), "GET");

    this.pushHitsToSearchResults(this.normalizeResults(resultData.features));

    return this.searchResults;
};

/**
 * Creates the search url with GET parameters.
 * @param {String} searchInput The search Input
 * @returns {String} The search url.
 */
SearchInterfaceKomootPhoton.prototype.createSearchUrl = function (searchInput) {
    const searchUrl = store?.getters?.restServiceById(this.serviceId)?.url,
        params = {
            bbox: this.bbox,
            lat: this.lat,
            limit: this.limit,
            lon: this.lon,
            osm_tag: this.osm_tag
        };
    let extendedSearchUrl = `${searchUrl}lang=${this.lang}&q=${encodeURIComponent(searchInput)}`;

    for (const [key, value] of Object.entries(params)) {
        if (typeof value !== "undefined") {
            extendedSearchUrl = `${extendedSearchUrl}&${key}=${value}`;
        }
    }

    return extendedSearchUrl;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of komoot photon.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceKomootPhoton.prototype.normalizeResults = function (searchResults) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        normalizedResults.push(this.normalizeResult(searchResult));
    });

    return normalizedResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResult The search result of komoot photon.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceKomootPhoton.prototype.normalizeResult = function (searchResult) {
    const displayName = this.createDisplayName(searchResult);

    return {
        events: this.normalizeResultEvents(this.resultEvents, searchResult),
        category: "Komoot",
        id: uniqueId("KomootPhoton"),
        icon: "bi-signpost-2",
        name: displayName,
        toolTip: this.createToolTipName(searchResult, displayName)
    };
};

/**
 * Create the display name for the search result.
 * @param {Object} searchResult The search result of komoot photon.
 * @returns {String} The display name.
 */
SearchInterfaceKomootPhoton.prototype.createDisplayName = function (searchResult) {
    const properties = searchResult.properties,
        displayAttributes = {
            name: "",
            street: ", ",
            housenumber: " ",
            postcode: ", ",
            city: " ",
            district: " - "
        };
    let displayName = "";

    for (const [key, value] of Object.entries(displayAttributes)) {
        if (key === "street" && typeof properties.name === "undefined") {
            displayName = displayName + properties[key];
        }
        else if (typeof properties[key] !== "undefined") {
            displayName = displayName + value + properties[key];
        }
        else if (key === "city" && typeof properties.county !== "undefined") {
            displayName = displayName + value + properties.county;
        }
    }

    return displayName;
};

/**
 * Create the tool tip name for the search result.
 * @param {Object} searchResult The search result of komoot photon.
 * @param {String} displayName The display name.
 * @returns {String} The display name.
 */
SearchInterfaceKomootPhoton.prototype.createToolTipName = function (searchResult, displayName) {
    const properties = searchResult.properties;
    let toolTipName = displayName;

    if (typeof properties.state !== "undefined") {
        toolTipName = toolTipName + ", " + properties.state;
    }
    if (typeof properties.country !== "undefined") {
        toolTipName = toolTipName + " " + properties.country;
    }
    if (typeof properties.suburb !== "undefined") {
        toolTipName = toolTipName + " (" + properties.suburb + ")";
    }

    return toolTipName;
};

/**
 * Creates the possible actions and fills them.
 * @override
 * @param {Object} searchResult The search result of komoot photon.
 * @returns {Object} The possible actions.
 */
SearchInterfaceKomootPhoton.prototype.createPossibleActions = function (searchResult) {
    const resultCoordinates = searchResult.geometry.coordinates,
        coordinates = crs.transformToMapProjection(mapCollection.getMap("2D"), "EPSG:4326", [parseFloat(resultCoordinates[0]), parseFloat(resultCoordinates[1])]);

    return {
        setMarker: {
            coordinates: coordinates
        },
        zoomToResult: {
            coordinates: coordinates
        },
        startRouting: {
            coordinates: coordinates,
            name: searchResult.properties?.name
        }
    };
};
