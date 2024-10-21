import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "./../../store/stateRouting";
import store from "../../../../app-store";
/**
 * Requests POIs from text from BKG
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingBkgGeosearch (search) {
    const url = await getRoutingBkgGeosearchUrl(search),
        response = await axios.get(url, window.location.href);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return response.data.features.map(d => parseRoutingBkgGeosearchResult(d));
}

/**
 * Creates the url with the given params.
 * @param {String} search to search for
 * @returns {String} the url
 */
async function getRoutingBkgGeosearchUrl (search) {
    const serviceUrl = store.getters.restServiceById(state.geosearch.serviceId).url,
        checkConfiguredBboxValue = await checkConfiguredBbox(),
        bBoxValue = await checkConfiguredBboxValue !== false ? checkConfiguredBboxValue : false;
    let url;

    if (serviceUrl.startsWith("/")) {
        url = new URL(serviceUrl, window.location.origin);
    }
    else {
        url = new URL(serviceUrl);
    }
    url.searchParams.set("count", state.geosearch.limit);
    url.searchParams.set("properties", "text");
    url.searchParams.set("query", encodeURIComponent(search));
    if (bBoxValue) {
        url.searchParams.set("bbox", bBoxValue);
    }

    return url;
}

/**
 * Creates the url with the given params.
 * @param {Array<{Number, Number}>} coordinates to search at
 * @returns {String} the url
 */
function getRoutingBkgGeosearchReverseUrl (coordinates) {
    const serviceUrl = store.getters.restServiceById(state.geosearchReverse.serviceId).url,
        url = new URL(serviceUrl);

    url.searchParams.set("lon", coordinates[0]);
    url.searchParams.set("lat", coordinates[1]);
    url.searchParams.set("count", "1");
    url.searchParams.set("properties", "text");
    url.searchParams.set("distance", state.geosearchReverse.distance);
    url.searchParams.set("filter", state.geosearchReverse.filter ? state.geosearchReverse.filter : "typ:ort");
    return url;
}

/**
 * Requests POI at coordinate from BKG
 * @param {Array<{Number, Number}>} coordinates to search at
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
async function fetchRoutingBkgGeosearchReverse (coordinates) {
    const response = await axios.get(getRoutingBkgGeosearchReverseUrl(coordinates));

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return parseRoutingBkgGeosearchResult(response.data.features[0]);
}

/**
 * Parses Response from Bkg to RoutingGeosearchResult
 * @param {Object} geosearchResult from BKG
 * @param {Object} [geosearchResult.geometry] geosearchResult geometry
 * @param {Array<{Number, Number}>} [geosearchResult.geometry.coordinates] geosearchResult geometry coordinates
 * @param {Object} [geosearchResult.properties] geosearchResult properties
 * @param {String} [geosearchResult.properties.text] geosearchResult properties text
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingBkgGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        [Number(geosearchResult.geometry.coordinates[0]), Number(geosearchResult.geometry.coordinates[1])],
        geosearchResult.properties.text
    );
}

/**
 * Checks if a bbox is configured with the current speed profile
 * @returns {Boolean|String} false or current speed profile
 */
function checkConfiguredBbox () {
    const currentSpeedProfile = state.directionsSettings.speedProfile;

    if (state.geosearch.bbox !== "" && state.geosearch.bbox[currentSpeedProfile]) {
        return state.geosearch.bbox[currentSpeedProfile];
    }

    return false;
}

export {checkConfiguredBbox, fetchRoutingBkgGeosearch, fetchRoutingBkgGeosearchReverse, getRoutingBkgGeosearchReverseUrl, getRoutingBkgGeosearchUrl};
