import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "../../store/stateRouting";
import store from "../../../../../app-store";

/**
 * Requests POIs from text from Elastic
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingElasticGeosearch (search) {
    const payload = {
            sort: state.geosearch.sortField ? [
                {[state.geosearch.sortField]: {order: "asc"}}
            ] : [],
            query: {
                bool: {
                    should: [
                        {
                            fuzzy: {
                                [state.geosearch.searchField]: {
                                    value: "",
                                    fuzziness: "AUTO",
                                    max_expansions: 50,
                                    prefix_length: 0,
                                    transpositions: true,
                                    rewrite: "constant_score"
                                }
                            }
                        },
                        {
                            match_phrase_prefix: {
                                [state.geosearch.searchField]: search
                            }
                        }
                    ]
                }
            },
            size: state.geosearch.limit
        },
        requestUrl = getRoutingElasticUrl(payload),
        response = await axios.get(requestUrl);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return response.data.hits.hits.map(d => {
        d.epsg = state.geosearch.epsg.toString();
        return parseRoutingElasticGeosearchResult(d);
    });
}

/**
 * Creates the url with the given params.
 * @param {Object} payload the payload
 * @returns {String} the url
 */
function getRoutingElasticUrl (payload) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearch.serviceId).url,
        url = new URL(serviceUrl);

    url.searchParams.set("source_content_type", "application/json");
    url.searchParams.set("source", JSON.stringify(payload));
    return url;
}

/**
 * Parses Response from Elastic to RoutingGeosearchResult
 * @param {Object} geosearchResult from Elastic
 * @param {Object} [geosearchResult._source.geometry] geosearchResult geometry
 * @param {[Number, Number]} [geosearchResult._source.geometry.coordinates] geosearchResult geometry coordinates
 * @param {Object} [geosearchResult._source.properties] geosearchResult properties
 * @param {String} [geosearchResult._source.properties.searchField] geosearchResult properties searchField
 * @param {String} [geosearchResult.epsg] geosearchResult epsg
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingElasticGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        [Number(geosearchResult._source.geometry.coordinates[0]), Number(geosearchResult._source.geometry.coordinates[1])],
        geosearchResult._source.properties.searchField,
        geosearchResult.epsg
    );
}

export {fetchRoutingElasticGeosearch, getRoutingElasticUrl};
