import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "./../../store/stateRouting";

/**
 * Requests POIs from text from Nominatim
 * @param {string} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingNominatimGeosearch (search) {
    const serviceUrl = Radio.request("RestReader", "getServiceById", state.geosearch.serviceId).get("url"),
        url = `${serviceUrl}&countrycodes=de&format=json&limit=${state.geosearch.limit}&bounded=1`,
        parameter = `&q=${encodeURIComponent(search)}`,
        response = await axios.get(url + parameter);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return response.data.map(d => parseRoutingNominatimGeosearchResult(d));
}

/**
 * Requests POI at coordinate from Nominatim
 * @param {[number, number]} coordinates to search at
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
async function fetchRoutingNominatimGeosearchReverse (coordinates) {
    const serviceUrl = Radio.request("RestReader", "getServiceById", state.geosearchReverse.serviceId).get("url"),
        url = `${serviceUrl}&lon=${coordinates[0]}&lat=${coordinates[1]}&format=json&addressdetails=0`,
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
 * Parses Response from Nominatim to RoutingGeosearchResult
 * @param {Object} geosearchResult from Nominatim
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingNominatimGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        Number(geosearchResult.lat),
        Number(geosearchResult.lon),
        geosearchResult.display_name
    );
}

export {fetchRoutingNominatimGeosearch, fetchRoutingNominatimGeosearchReverse};
