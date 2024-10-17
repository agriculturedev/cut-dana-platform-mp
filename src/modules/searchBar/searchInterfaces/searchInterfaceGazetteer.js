import SearchInterface from "./searchInterface";
import store from "../../../app-store";
import {search, setGazetteerUrl, setShowGeographicIdentifier} from "@masterportal/masterportalapi/src/searchAddress";

/**
 * The search interface to the gazetteer.
 * @module modules/searchBar/searchInterfaces/SearchInterfaceGazetteer
 * @name SearchInterfaceGazetteer
 * @constructs
 * @extends SearchInterface
 * @param {String} serviceId Search service id. Resolved using the rest-services.json file.
 *
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToResult"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {Boolean} [searchAddress=false] Defines whether address search is active.
 * @param {Boolean} [searchDistricts=false] Defines whether district search is active.
 * @param {String} [searchInterfaceId="gazetteer"] The id of the service interface.
 * @param {Boolean} [searchHouseNumbers=false] Defines whether house numbers should be searched for.
 * @param {Boolean} [searchParcels=false] Defines whether parcels search is active.
 * @param {Boolean} [searchStreetKey=false] Defines whether streets should be searched for by key.
 * @param {Boolean} [searchStreets=false] Defines whether street search is active.
 * @param {Boolean} [showGeographicIdentifier=false] Defines whether GeographicIdentifier should be displayed in the search result.
 * @returns {void}
 */
export default function SearchInterfaceGazetteer ({serviceId, hitTemplate, resultEvents, searchAddress, searchDistricts, searchInterfaceId, searchHouseNumbers, searchParcels, searchStreetKey, searchStreets, showGeographicIdentifier} = {}) {
    const resultEventsDefault = {
            onClick: ["setMarker", "zoomToResult"],
            onHover: ["setMarker"],
            buttons: ["startRouting"]
        },
        resultEventsSupported = ["setMarker", "zoomToResult", "startRouting"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "gazetteer",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.serviceId = serviceId;

    this.showGeographicIdentifier = showGeographicIdentifier || false;
    this.searchAddress = searchAddress || false;
    this.searchDistricts = searchDistricts || false;
    this.searchHouseNumbers = searchHouseNumbers || false;
    this.searchParcels = searchParcels || false;
    this.searchStreetKey = searchStreetKey || false;
    this.searchStreets = searchStreets || false;

    setGazetteerUrl(store?.getters?.restServiceById(this.serviceId)?.url);
    setShowGeographicIdentifier(this.showGeographicIdentifier);
}

SearchInterfaceGazetteer.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in gazetteer search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceGazetteer.prototype.search = async function (searchInput) {
    const searchResults = await this.startSearch(searchInput),
        normalizedResults = this.normalizeResults(searchResults);

    this.pushHitsToSearchResults(normalizedResults);

    return this.searchResults;
};

/**
 * Starts the search via the MasterportalAPI.
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceGazetteer.prototype.startSearch = async function (searchInput) {
    let searchResults = [];

    try {
        this.searchState = "running";
        searchResults = search(searchInput, {
            map: mapCollection.getMap("2D"),
            searchAddress: this.searchAddress,
            searchStreets: this.searchStreets,
            searchDistricts: this.searchDistricts,
            searchParcels: this.searchParcels,
            searchStreetKey: this.searchStreetKey,
            searchHouseNumbers: this.searchHouseNumbers
        }, true);

        await searchResults;
        this.searchState = "finished";
    }
    catch (error) {
        this.searchState = "aborted";
        if (String(error) !== "AbortError: The user aborted a request." && error.name !== "AbortError") {
            this.searchState = "failed";
            console.error(error);
        }
    }

    return searchResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of gazetter.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceGazetteer.prototype.normalizeResults = function (searchResults) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        const translatedType = this.getTranslationByType(searchResult.type);

        if (!normalizedResults.some(e => e.id === searchResult.name.replace(/ /g, "") + translatedType)) {
            normalizedResults.push({
                events: this.normalizeResultEvents(this.resultEvents, searchResult),
                category: translatedType,
                id: searchResult.name.replace(/ /g, "") + translatedType,
                icon: "bi-signpost-split",
                name: searchResult.name
            });
        }
    });

    return normalizedResults;
};

/**
 * Returns the translation key to a search result type.
 * @param {String} type The search result type.
 * @returns {String} The translation key.
 */
SearchInterfaceGazetteer.prototype.getTranslationByType = function (type) {
    const keys = {
        addressAffixed: "common:modules.searchBar.type.address",
        addressUnaffixed: "common:modules.searchBar.type.address",
        district: "common:modules.searchBar.type.district",
        houseNumbersForStreet: "common:modules.searchBar.type.address",
        parcel: "common:modules.searchBar.type.parcel",
        street: "common:modules.searchBar.type.street"
    };

    return i18next.t(keys[type]);
};

/**
 * Creates the possible actions and fills them.
 * @override
 * @param {Object} searchResult The search result of gazetter.
 * @returns {Object} The possible actions.
 */
SearchInterfaceGazetteer.prototype.createPossibleActions = function (searchResult) {
    const coords = [parseFloat(searchResult.geometry.coordinates[0]), parseFloat(searchResult.geometry.coordinates[1])];

    return {
        setMarker: {
            coordinates: coords
        },
        zoomToResult: {
            coordinates: coords
        },
        startRouting: {
            coordinates: coords,
            name: searchResult.name
        }
    };
};
