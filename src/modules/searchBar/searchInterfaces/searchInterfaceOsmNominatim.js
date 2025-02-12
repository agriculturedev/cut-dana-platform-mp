import crs from "@masterportal/masterportalapi/src/crs";
import dayjs from "dayjs";

import SearchInterface from "./searchInterface";
import store from "../../../app-store";
import {uniqueId} from "../../../shared/js/utils/uniqueId";

/**
 * The search interface to the osm nominatim geocoder.
 * @module modules/searchBar/searchInterfaces/SearchInterfaceOsmNominatim
 * @name SearchInterfaceOsmNominatim
 * @constructs
 * @extends SearchInterface
 * @see {@link https://operations.osmfoundation.org/policies/nominatim/}
 * @param {String} serviceId OSM search service id. Resolved using the rest-services.json file.
 *
 * @param {String} [classes = "place,highway,building,shop,historic,leisure,city,county"] May contain the classes to search for.
 * @param {String[]} [countryCodes=["de"]] Countries to search in.
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {Number} [limit = 5] Maximum amount of requested unfiltered results.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToResult"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="osmNominatim"] The id of the service interface.
 * @param {String} [states=""] May contain federal state names with arbitrary separators.
 * @returns {void}
 */
export default function SearchInterfaceOsmNominatim ({serviceId, classes, countryCodes, hitTemplate, limit, resultEvents, searchInterfaceId, states} = {}) {
    const resultEventsDefault = {
            onClick: ["setMarker", "zoomToResult"],
            onHover: ["setMarker"],
            buttons: ["startRouting"]
        },
        resultEventsSupported = ["setMarker", "zoomToResult", "startRouting"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "osmNominatim",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.serviceId = serviceId;

    this.classes = classes || "place,highway,building,shop,historic,leisure,city,county";
    this.countryCodes = countryCodes || ["de"];
    this.limit = limit || 50;
    this.states = states || "";

    this.timeStamp = dayjs();
}

SearchInterfaceOsmNominatim.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in osm nominatim search interface.
 * Note: Absolute maximum is one request per second.
 * @override
 * @see {@link https://operations.osmfoundation.org/policies/nominatim/} See for further details.
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceOsmNominatim.prototype.search = async function (searchInput) {
    const timeStampNow = dayjs();

    if (timeStampNow.diff(this.timeStamp) > 1000) {
        this.timeStamp = timeStampNow;

        const resultData = await this.requestSearch(this.createSearchUrl(searchInput), "GET");

        this.pushHitsToSearchResults(this.normalizeResults(resultData));
    }
    else {
        await new Promise(resolve => {
            setTimeout(async () => {
                if (searchInput === store.getters["SearchBar/searchInput"]) {
                    resolve(await this.search(searchInput));
                }
            }, 1000);
        });
    }

    return this.searchResults;
};

/**
 * Creates the search url with GET parameters.
 * @param {String} searchInput The search Input
 * @returns {String} The search url.
 */
SearchInterfaceOsmNominatim.prototype.createSearchUrl = function (searchInput) {
    const searchUrl = store?.getters?.restServiceById(this.serviceId)?.url,
        extendedSearchUrl = `${searchUrl}countrycodes=${this.countryCodes}&format=json&polygon=0&addressdetails=1&extratags=1&limit=${this.limit}&q=${encodeURIComponent(searchInput)}`;

    return extendedSearchUrl;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * Note: Only search results of the configured classes are processed.
 * @param {Object[]} searchResults The search results of osm nominatim.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceOsmNominatim.prototype.normalizeResults = function (searchResults) {
    const classes = this.classes.split(","),
        states = this.states !== "" ? this.states.split(",") : [],
        normalizedResults = [];

    searchResults.forEach(searchResult => {
        const state = searchResult.address.state,
            city = searchResult.address.city;

        if (classes.includes(searchResult.class) && (states.length === 0 || states.includes(state || city))) {
            normalizedResults.push(this.normalizeResult(searchResult));
        }
    });

    return normalizedResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResult The search result of osm nominatim.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceOsmNominatim.prototype.normalizeResult = function (searchResult) {
    const displayName = this.createDisplayName(searchResult);

    return {
        events: this.normalizeResultEvents(this.resultEvents, searchResult),
        category: "OpenStreetMap",
        icon: "bi-signpost-2",
        id: uniqueId("OSMNominatim"),
        name: displayName,
        toolTip: this.createToolTipName(searchResult, displayName)
    };
};

/**
 * Create the display name for the search result.
 * @param {Object} searchResult The search result of osm nominatim.
 * @returns {String} The display name.
 */
SearchInterfaceOsmNominatim.prototype.createDisplayName = function (searchResult) {
    const address = searchResult.address;
    let displayName = address.city || address.city_district || address.town || address.village || address.suburb || address.county || "";

    if (address.road || address.pedestrian) {
        displayName = `${displayName}, ${address.road || address.pedestrian}`;

        if (address.house_number) {
            displayName = `${displayName} ${address.house_number}`;
        }
    }

    return displayName;
};

/**
 * Create the tool tip name for the search result.
 * @param {Object} searchResult The search result of osm nominatim.
 * @param {String} displayName The display name.
 * @returns {String} The tool tip name.
 */
SearchInterfaceOsmNominatim.prototype.createToolTipName = function (searchResult, displayName) {
    const address = searchResult.address;
    let toolTipName = displayName;

    if (typeof address.postcode !== "undefined" && typeof (address.state || address.city) !== "undefined") {
        toolTipName = toolTipName + ", " + address.postcode + " " + (address.state || address.city);

        if (typeof address.suburb !== "undefined") {
            toolTipName = toolTipName + " (" + address.suburb + ")";
        }
    }

    return toolTipName;
};

/**
 * Creates the possible actions and fills them.
 * @override
 * @param {Object} searchResult The search result of osm nominatim.
 * @returns {Object} The possible actions.
 */
SearchInterfaceOsmNominatim.prototype.createPossibleActions = function (searchResult) {
    const coordinates = this.processCoordinatesForActions(searchResult);

    return {
        setMarker: {
            coordinates: coordinates
        },
        zoomToResult: {
            coordinates: coordinates
        },
        startRouting: {
            coordinates: coordinates,
            name: searchResult.display_name
        }
    };
};

/**
 * Processes the coordinates of search result to use in actions.
 * @param {Object} searchResult The search result of osm nominatim.
 * @returns {Object} The coordinates for actions.
 */
SearchInterfaceOsmNominatim.prototype.processCoordinatesForActions = function (searchResult) {
    let lat,
        lon;

    if (searchResult.lat && searchResult.lon) {
        lat = parseFloat(searchResult.lat);
        lon = parseFloat(searchResult.lon);
    }
    else {
        const bbox = searchResult.boundingbox;

        lat = (parseFloat(bbox[0]) + parseFloat(bbox[1])) / 2.0;
        lon = (parseFloat(bbox[2]) + parseFloat(bbox[3])) / 2.0;
    }

    return crs.transformToMapProjection(mapCollection.getMap("2D"), "EPSG:4326", [lon, lat]);
};
