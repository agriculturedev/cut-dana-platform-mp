import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "../../store/stateRouting";
import store from "../../../../../app-store";

/**
 * Requests POIs from text from LocationFinder
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingLocationFinderGeosearch (search) {
    const url = getRoutingLocationFinderGeosearchUrl(search),
        response = await axios.get(url);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }

    return response.data.locs.map(d => {
        d.epsg = response.data.sref;
        return parseRoutingLocationFinderGeosearchResult(d);
    });
}

/**
 * Creates the url with the given params.
 * @param {String} search the string to search for
 * @returns {String} the url
 */
function getRoutingLocationFinderGeosearchUrl (search) {
    let serviceUrl = store.getters.getRestServiceById(state.geosearch.serviceId).url,
        url = null;

    if (serviceUrl.endsWith("/")) {
        serviceUrl += "Lookup";
    }
    else {
        serviceUrl += "/Lookup";
    }
    url = new URL(serviceUrl);
    url.searchParams.set("limit", state.geosearch.limit);
    url.searchParams.set("properties", "text");
    url.searchParams.set("query", encodeURIComponent(search));
    return url;
}

/**
 * Parses Response from LocationFinder to RoutingGeosearchResult
 * @param {Object} geosearchResult from LocationFinder
 * @param {Number} [geosearchResult.cx] geosearchResult x coordinate
 * @param {Number} [geosearchResult.cy] geosearchResult y coordinate
 * @param {String} [geosearchResult.name] geosearchResult name
 * @param {String} [geosearchResult.epsg] geosearchResult epsg
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingLocationFinderGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        [Number(geosearchResult.cx), Number(geosearchResult.cy)],
        geosearchResult.name,
        geosearchResult.epsg.toString()
    );
}

export {fetchRoutingLocationFinderGeosearch, getRoutingLocationFinderGeosearchUrl};
