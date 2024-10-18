import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "./../../store/stateRouting";
import store from "../../../../../app-store";

/**
 * Requests POIs from text from Nominatim
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingNominatimGeosearch (search) {
    const url = getRoutingNominatimGeosearchUrl(search),
        response = await axios.get(url);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return response.data.map(d => parseRoutingNominatimGeosearchResult(d));
}

/**
 * Creates the url with the given params.
 * @param {String} search to search for
 * @returns {String} the url
 */
function getRoutingNominatimGeosearchUrl (search) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearch.serviceId).url,
        url = new URL(serviceUrl);

    url.searchParams.set("countrycodes", "de");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", state.geosearch.limit);
    url.searchParams.set("bounded", "1");
    url.searchParams.set("q", encodeURIComponent(search));
    return url;
}

/**
 * Requests POI at coordinate from Nominatim
 * @param {[Number, Number]} coordinates to search at
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
async function fetchRoutingNominatimGeosearchReverse (coordinates) {
    const url = getRoutingNominatimGeosearchReverseUrl(coordinates),
        response = await axios.get(url);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return parseRoutingNominatimGeosearchResult(response.data);
}

/**
 * Creates the url with the given params.
 * @param {Array} coordinates to add as params
 * @returns {String} the url
 */
function getRoutingNominatimGeosearchReverseUrl (coordinates) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearchReverse.serviceId).url,
        url = new URL(serviceUrl);

    url.searchParams.set("lon", coordinates[0]);
    url.searchParams.set("lat", coordinates[1]);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "0");
    return url;
}

/**
 * Parses Response from Nominatim to RoutingGeosearchResult
 * @param {Object} geosearchResult from Nominatim
 * @param {Number} [geosearchResult.lat] geosearchResult latitude
 * @param {Number} [geosearchResult.lon] geosearchResult longitude
 * @param {String} [geosearchResult.properties.display_name] geosearchResult display_name
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingNominatimGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        [Number(geosearchResult.lat), Number(geosearchResult.lon)],
        geosearchResult.display_name
    );
}

export {fetchRoutingNominatimGeosearch, fetchRoutingNominatimGeosearchReverse, getRoutingNominatimGeosearchUrl, getRoutingNominatimGeosearchReverseUrl};
