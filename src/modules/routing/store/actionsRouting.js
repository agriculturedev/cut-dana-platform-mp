import {
    fetchRoutingNominatimGeosearch,
    fetchRoutingNominatimGeosearchReverse
} from "../js/geosearch/routing-nominatim-geosearch";
import crs from "@masterportal/masterportalapi/src/crs";
import {fetchRoutingBkgGeosearch, fetchRoutingBkgGeosearchReverse} from "../js/geosearch/routing-bkg-geosearch";
import {fetchRoutingLocationFinderGeosearch} from "../js/geosearch/routing-locationFinder-geosearch";
import {fetchRoutingKomootGeosearch, fetchRoutingKomootGeosearchReverse} from "../js/geosearch/routing-komoot-geosearch";
import {fetchRoutingElasticGeosearch} from "../js/geosearch/routing-elastic-geosearch";
import {fetchRoutingSpecialWfsGeosearch} from "../js/geosearch/routing-specialWfs-geosearch";
import {fetchRoutingGazetteerGeosearch} from "../js/geosearch/routing-gazetteer-geosearch";
import * as constantsRouting from "./constantsRouting";

/**
 * @const {String} configPath an array of possible config locations. First one found will be used
 */

export default {
    /**
     * Called when the routing module is created.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    async initRouting ({dispatch}) {
        await dispatch("checkNonOptionalConfigFields");
    },

    /**
     * Resets all directions and sets the first waypoint.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} payload the vuex context
     * @param {String} payload.displayName name to show at start routing input field
     * @param {Array} payload.coordinates coordinates of the routing start waypoint
     * @returns {void}
     */
    setFirstWayPoint ({dispatch}, {displayName, coordinates}) {
        dispatch("Directions/reset");
        dispatch("Directions/addWaypoint", {index: 0, displayName, coordinates, fromExtern: true});
    },

    /**
     * Checks all non optional config fileds in the config.json.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    checkNonOptionalConfigFields ({state}) {
        const checkPaths = constantsRouting.nonOptionalConfigFields.map(field => field.split(".")),
            missing = checkPaths.filter(path => {
                const val = path.reduce((partObj, partPath) => {
                    return partObj?.[partPath];
                }, state);

                return val === undefined || val === null;
            });

        if (missing.length > 0) {
            throw new Error("Routing module is not configured correctly. The following required fields are missing: " + missing.map(m => m.join(".")).join(", "));
        }
        if (state.geosearch.type === "ELASTIC" && !state.geosearch.searchField) {
            throw new Error("Routing module is not configured correctly. The following required fields for elastic search are missing: searchField");
        }
        if (state.geosearch.type === "SPECIALWFS") {
            if (!state.geosearch.typeName || !state.geosearch.propertyNames || !state.geosearch.geometryName) {
                throw new Error("Routing module is not configured correctly. One of the following required fields for specialWfs search are missing: typeName, propertyNames or geometryName");
            }
        }
    },
    /**
     * Async fetch Coordinates by text.
     * @param {Object} context actions context object.
     * @param {String} search searching text.
     * @returns {RoutingGeosearchResult[]} Returns parsed Array of RoutingGeosearchResults.
     */
    async fetchCoordinatesByText ({state, dispatch}, {search}) {
        let geosearchResults = [];

        if (search.length < state.geosearch.minChars) {
            return geosearchResults;
        }
        if (search.length > 0) {
            try {
                // Possible to change Geosearch by changing function depending on config
                if (state.geosearch.type === "NOMINATIM") {
                    geosearchResults = await fetchRoutingNominatimGeosearch(search);
                }
                else if (state.geosearch.type === "BKG") {
                    geosearchResults = await fetchRoutingBkgGeosearch(search);
                }
                else if (state.geosearch.type === "LOCATIONFINDER") {
                    geosearchResults = await fetchRoutingLocationFinderGeosearch(search);
                }
                else if (state.geosearch.type === "KOMOOT") {
                    geosearchResults = await fetchRoutingKomootGeosearch(search);
                }
                else if (state.geosearch.type === "ELASTIC") {
                    geosearchResults = await fetchRoutingElasticGeosearch(search);
                }
                else if (state.geosearch.type === "SPECIALWFS") {
                    geosearchResults = await fetchRoutingSpecialWfsGeosearch(search);
                }
                else if (state.geosearch.type === "GAZETTEER") {
                    geosearchResults = await fetchRoutingGazetteerGeosearch(search);
                }
                else {
                    throw new Error("Geosearch is not configured correctly.");
                }

                // Transform Coordinates to Local Projection
                geosearchResults.forEach(async geosearchResult => {
                    if (!geosearchResult.getEpsg()) {
                        geosearchResult.setEpsg(state.geosearch.epsg);
                    }
                    const coordinatesLocal = await dispatch(
                        "Modules/Routing/transformCoordinatesToLocalProjection",
                        {coordinates: geosearchResult.getCoordinates(),
                            epsg: geosearchResult.getEpsg()},
                        {root: true}
                    );

                    geosearchResult.setCoordinates(coordinatesLocal);
                });
            }
            catch (err) {
                dispatch("Alerting/addSingleAlert", {
                    category: "error",
                    title: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.routing.errors.fetchingCoordinates")
                }, {root: true});
            }
        }
        return geosearchResults;
    },

    /**
     * Async fetch Text by Coordinates.
     * @param {Object} context actions context object.
     * @param {Array<{Number, Number}>} coordinates LonLat Coordinates.
     * @returns {RoutingGeosearchResult} Returns parsed Array of RoutingGeosearchResults.
     */
    async fetchTextByCoordinates ({state, dispatch}, {coordinates}) {
        let geosearchResults = null;

        try {
            // Possible to change Geosearch by changing function depending on config
            if (state.geosearch.type === "NOMINATIM") {
                geosearchResults = await fetchRoutingNominatimGeosearchReverse(coordinates);
            }
            else if (state.geosearch.type === "BKG") {
                geosearchResults = await fetchRoutingBkgGeosearchReverse(coordinates);
            }
            else if (state.geosearch.type === "LOCATIONFINDER") {
                geosearchResults = null;
            }
            else if (state.geosearch.type === "KOMOOT") {
                geosearchResults = await fetchRoutingKomootGeosearchReverse(coordinates);
            }
            else if (state.geosearch.type === "ELASTIC") {
                geosearchResults = null;
            }
            else if (state.geosearch.type === "SPECIALWFS") {
                geosearchResults = null;
            }
            else if (state.geosearch.type === "GAZETTEER") {
                geosearchResults = null;
            }
            else {
                throw new Error("Geosearch is not configured correctly.");
            }

            // Transform WGS84 Coordinates to Local Projection
            geosearchResults.forEach(async geosearchResult => {
                if (!geosearchResult.getEpsg()) {
                    geosearchResult.setEpsg("4326");
                }
                const coordinatesLocal = await dispatch(
                    "Modules/Routing/transformCoordinatesToLocalProjection",
                    {coordinates: geosearchResult.getCoordinates(),
                        epsg: geosearchResult.getEpsg()},
                    {root: true}
                );

                geosearchResult.setCoordinates(coordinatesLocal);
            });
        }
        catch (err) {
            // fail silently, comment needed for linter
        }
        return geosearchResults;
    },

    /**
     * Transforms the given coordinates from the local projection to the wgs84 projections
     * @param {Object} context actions context object.
     * @param {Array<{Number, Number}>} coordinates to project
     * @returns {Array<{Number, Number}>} projected wgs84 coordinates
     */
    transformCoordinatesLocalToWgs84Projection ({rootState}, coordinates) {
        return crs.transform(
            crs.getMapProjection(mapCollection.getMap(rootState.Maps.mode)),
            "EPSG:4326",
            coordinates
        );
    },
    /**
     * Transforms the given coordinates from the wgs84 projection to the local projections
     * @param {Object} context actions context object.
     * @param {Array<{Number, Number}>} coordinates to project
     * @returns {Array<{Number, Number}>} projected local coordinates
     */
    transformCoordinatesWgs84ToLocalProjection ({rootState}, coordinates) {
        return crs.transform(
            "EPSG:4326",
            crs.getMapProjection(mapCollection.getMap(rootState.Maps.mode)),
            coordinates
        );
    },
    /**
     * Transforms the given coordinates from the wgs84 projection to the local projections
     * @param {Object} context actions context object.
     * @param {Object} payload parameter object.
     * @param {Array} payload.coordinates the coordinates to transform.
     * @param {String} payload.epsg coordinate system.
     * @returns {Array} projected local coordinates
     */
    transformCoordinatesToLocalProjection ({rootState}, {coordinates, epsg}) {
        return crs.transform(
            `EPSG:${epsg}`,
            crs.getMapProjection(mapCollection.getMap(rootState.Maps.mode)),
            coordinates
        );
    },

    /**
     * Set attributes to state from url params.
     * @param {Object} commit the commit
     * @param {Object} params The url params
     * @returns {void}
     */
    urlParams ({commit}, params) {
        commit("updateStateFromUrlParams", params);
    }
};
