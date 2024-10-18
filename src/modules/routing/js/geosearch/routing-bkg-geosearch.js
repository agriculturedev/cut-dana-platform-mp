import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "./../../store/stateRouting";
import store from "../../../../../app-store";

/**
 * Requests POIs from text from BKG
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingBkgGeosearch (search) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearch.serviceId).url,
        checkConfiguredBboxValue = await checkConfiguredBbox(),
        bBoxValue = await checkConfiguredBboxValue !== false ? `&bbox=${checkConfiguredBboxValue}` : "",
        url = `${serviceUrl}?count=${state.geosearch.limit}&properties=text`,
        parameter = `&query=${encodeURIComponent(search)}${bBoxValue}`,
        response = await axios.get(url + parameter);

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
 * @param {[Number, Number]} coordinates to search at
 * @returns {String} the url
 */
function getRoutingBkgGeosearchReverseUrl (coordinates) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearchReverse.serviceId).url,
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
 * @param {[Number, Number]} coordinates to search at
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
 * @param {[Number, Number]} [geosearchResult.geometry.coordinates] geosearchResult geometry coordinates
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

export {checkConfiguredBbox, fetchRoutingBkgGeosearch, fetchRoutingBkgGeosearchReverse, getRoutingBkgGeosearchReverseUrl};
