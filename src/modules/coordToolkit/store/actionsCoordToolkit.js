import {toStringHDMS} from "ol/coordinate.js";
import proj4 from "proj4";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {convertSexagesimalFromString, convertSexagesimalToDecimal, convertSexagesimalFromDecimal} from "../../../shared/js/utils/convertSexagesimalCoordinates";
import {requestGfi} from "../../../shared/js/api/wmsGetFeatureInfo";
import layerFactory from "../../../core/layers/js/layerFactory";

/**
 * The actions for the CoordToolkit.
 * @module modules/coordToolkit/store/actionsCoordToolkit
 */
export default {
    /**
     * Remembers the projection and shows mapmarker at the given position.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.state the state
     * @param {Object} context.rootGetters the rootGetters
     * @returns {void}
     */
    positionClicked: function ({commit, dispatch, state, rootGetters}) {
        const updatePosition = rootGetters.mobile ? true : state.updatePosition,
            mapMode = rootGetters["Maps/mode"],
            position = rootGetters["Maps/clickCoordinate"];

        if (position) {
            commit("setPositionMapProjection", position);
            dispatch("changedPosition");
            commit("setUpdatePosition", !updatePosition);

            if (mapMode === "2D") {
                dispatch("Maps/placingPointMarker", position, {root: true});

                if (state.heightLayer) {
                    if (updatePosition) {
                        dispatch("getHeight", position);
                    }
                    else {
                        commit("setHeight", "");
                    }
                }
            }
            else if (mapMode === "3D" && position.length === 3) {
                dispatch("Maps/placingPointMarker", position, {root: true});
                commit("setHeight", position[2].toFixed(1));
            }
        }
    },
    /**
     * Creates a new WMSLayer to get the height from with id stored in state.heightLayerId and sets the layer to state.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Object} context.rootGetters the rootGetters
     * @returns {void}
     */
    initHeightLayer ({commit, state, rootGetters}) {
        const rawLayer = rawLayerList.getLayerWhere({id: state.heightLayerId});
        let layerConfig = null;

        if (rawLayer) {
            layerConfig = rootGetters.layerConfigById(state.heightLayerId);

            if (layerConfig) {
                commit("setHeightLayer", layerFactory.createLayer(layerConfig));
            }
        }
        if (!layerConfig) {
            console.warn("CoordToolkit: the layer with id " + state.heightLayerId + " to retrieve height from is not available. Check the Id in config.json with path 'portalConfig.mainMenu.sections.coordToolkit.heightLayerId'!");
        }
    },
    /**
     * Requests the layer with id state.heightLayerId and parses the xml-response for the height.
     * Sets the height to the state.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.rootGetters the rootGetters
     * @param {Object} context.state the state
     * @param {Number[]} position position in the map
     * @returns {void}
     */
    getHeight ({dispatch, rootGetters, state}, position) {
        const projection = rootGetters["Maps/projection"],
            resolution = rootGetters["Maps/resolution"],
            gfiParams = {INFO_FORMAT: state.heightInfoFormat, FEATURE_COUNT: 1},
            url = state.heightLayer.getLayerSource().getFeatureInfoUrl(position, resolution, projection, gfiParams);

        requestGfi("text/xml", url, state.heightLayer).then(features => {
            dispatch("retrieveHeightFromGfiResponse", features);
        });
    },
    /**
     * Reads the height value from feature and sets it to state.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Array} features to get the height value from
     * @returns {void}
     */
    retrieveHeightFromGfiResponse ({commit, state}, features) {
        let height = "";

        if (features.length >= 1) {
            height = features[0].get(state.heightElementName);
            if (height === state.heightValueWater) {
                height = "common:modules.coordToolkit.noHeightWater";
            }
            else if (height === state.heightValueBuilding) {
                height = "common:modules.coordToolkit.noHeightBuilding";
            }
            else {
                const heightParsed = Number.parseFloat(height);

                if (!isNaN(heightParsed)) {
                    height = heightParsed.toFixed(1);
                }
            }
        }
        commit("setHeight", height);
    },
    /**
     * Reacts on new selected projection. Sets the current projection and its name to state,
     * changes position if mode is 'supply' and sets transformed coordinates to input fields.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Object} context.getters the getters
     * @param {String} value id of the new selected projection
     * @returns {void}
     */
    newProjectionSelected ({dispatch, commit, state, getters}, value) {
        const targetProjection = getters.getProjectionById(value);

        dispatch("formatInput", [state.coordinatesEasting, state.coordinatesNorthing]);
        dispatch("transformCoordinatesFromTo", targetProjection);
        commit("setCurrentProjection", targetProjection);
        dispatch("changedPosition");
        commit("setExample");
    },
    /**
     * Delegates the calculation and transformation of the position according to the projection.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.state the state
     * @param {Object} context.getters the getters
     * @returns {void}
     */
    changedPosition ({dispatch, state, getters}) {
        if (state.mode === "supply") {
            const targetProjectionName = state.currentProjection?.epsg,
                position = getters.getTransformedPosition(mapCollection.getMap("2D"), targetProjectionName);

            if (position) {
                dispatch("adjustPosition", {position: position, targetProjection: state.currentProjection});
            }
        }
    },
    /**
     * Sets the position to map's center, if coordinates are  not set.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Object} context.rootState the rootState
     * @param {Object} context.getters the getters
     * @returns {void}
     */
    setFirstSearchPosition ({dispatch, commit, state, rootState, getters}) {
        if (state.mode === "search") {
            const targetProjectionName = state.currentProjection?.epsg,
                position = getters.getTransformedPosition(mapCollection.getMap("2D"), targetProjectionName);

            if (position && position[0] === 0 && position[1] === 0 && rootState.Maps.center) {
                commit("setCoordinatesEasting", {id: "easting", value: String(rootState.Maps.center[0]).substring(0, 9)});
                commit("setCoordinatesNorthing", {id: "northing", value: String(rootState.Maps.center[1]).substring(0, 9)});
                dispatch("moveToCoordinates", rootState.Maps.center);
            }
        }
    },

    /**
     * Calculates the clicked position and writes the coordinate-values into the textfields.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.rootGetters the rootGetters
     * @param {Object} payload the payload
     * @param {Number[]} payload.position transformed coordinates
     * @param {Object} payload.targetProjection selected projection
     * @returns {void}
     */
    adjustPosition ({commit, rootGetters}, {position, targetProjection}) {
        let coord, easting, northing;

        if (targetProjection && Array.isArray(position) && position.length >= 2) {
            // geographical coordinates
            if (targetProjection.projName === "longlat") {
                let converted;

                coord = toStringHDMS(position.slice(0, 2));
                if (targetProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
                    converted = convertSexagesimalToDecimal(coord);
                }
                else {
                    converted = convertSexagesimalFromString(coord);
                }
                easting = converted.easting;
                northing = converted.northing;
            }
            else if (targetProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3") {
                rootGetters.namedProjections.find((el) => {
                    if (el[1].includes("ETRS89_3GK3")) {
                        const searchString = "x_0=",
                            x0 = parseInt(el[1].substring(el[1].lastIndexOf(searchString) + searchString.length, el[1].indexOf(" +y_0=")), 10);

                        easting = (position[0] + x0 - targetProjection.x0).toFixed(2);
                        northing = position[1].toFixed(2);
                        return true;
                    }
                    return false;
                });
            }
            // cartesian coordinates
            else {
                easting = position[0].toFixed(2);
                northing = position[1].toFixed(2);
            }
            commit("setCoordinatesEasting", {id: "easting", value: String(easting)});
            commit("setCoordinatesNorthing", {id: "northing", value: String(northing)});
        }
    },
    /**
     * Checks the position for update and shows the marker at updated position.
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.commit the commit
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.rootGetters the rootGetters
     * @returns {void}
     */
    checkPosition ({state, commit, dispatch, rootGetters}) {
        const position = rootGetters["Maps/mouseCoordinate"],
            mapMode = rootGetters["Maps/mode"];

        if (state.updatePosition) {
            if (mapMode === "2D") {
                dispatch("Maps/placingPointMarker", position, {root: true});
            }
            if (mapMode === "3D" && position.length === 3) {
                commit("setHeight", position[2].toFixed(1));
            }
            commit("setPositionMapProjection", position);
            dispatch("changedPosition");
        }
    },
    /**
     * Resets the error messages, calls the validation function with the entered coordinates
     * and calls the transformCoordinates function.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {String} context.state.coordinatesEasting the coordinates user entered
     * @param {String} context.state.coordinatesNorthing the coordinates user entered
     * @returns {void}
     */
    searchCoordinate ({dispatch, commit, state}) {
        const coords = [state.coordinatesEasting, state.coordinatesNorthing];

        commit("resetErrorMessages", "all");
        dispatch("formatInput", coords);
        dispatch("transformCoordinates");
    },
    /**
     * Removes the marker from selected position.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @returns {void}
     */
    removeMarker: function ({dispatch}) {
        dispatch("Maps/removePointMarker", null, {root: true});
    },
    /**
     * Shows mapmarker at the given position.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Array} coordinates - the position
     * @returns {void}
     */
    setMarker: function ({dispatch}, coordinates) {
        dispatch("Maps/placingPointMarker", [parseFloat(coordinates[0]), parseFloat(coordinates[1])], {root: true});
    },
    /**
     * Validates the user-input depending on the selected projection and sets the error messages.
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.commit the commit
     * @param {Object} coord the coordinate the user entered
     * @returns {void}
     */
    validateInput ({state, commit}, coord) {
        const validETRS89UTM = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validETRS89_UTM32 = /^[0-9]{7,8}[.,]{0,1}[0-9]{0,3}\s*$/,
            validETRS89 = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validETRS893GK3 = /^[0-9]{7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validWGS84 = /^\d[0-9]{0,2}[°]{1}\s*[0-9]{0,2}['`´′]{0,1}\s*[0-9]{0,2}['`´′]{0,2}["″]{0,2}[\sNS]*\s*$/,
            validWGS84_dez = /[0-9]{1,3}[.,][0-9]{0,20}[\s]{0,10}°?\s*$/,
            {currentProjection} = state,
            validators = {
                "http://www.opengis.net/gml/srs/epsg.xml#25832": validETRS89UTM,
                "http://www.opengis.net/gml/srs/epsg.xml#25833": validETRS89UTM,
                "http://www.opengis.net/gml/srs/epsg.xml#4647": validETRS89_UTM32,
                "http://www.opengis.net/gml/srs/epsg.xml#31467": validETRS89,
                "http://www.opengis.net/gml/srs/epsg.xml#8395": validETRS89,
                "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3": validETRS893GK3,
                "http://www.opengis.net/gml/srs/epsg.xml#4326": validWGS84,
                "http://www.opengis.net/gml/srs/epsg.xml#4326-DG": validWGS84_dez

            };

        if (coord.id === "easting") {
            commit("resetErrorMessages", coord.id);
            if (coord.value === "") {
                commit("setEastingNoCoord", true);
            }
            else if (!String(coord.value).match(validators[currentProjection.id])) {
                commit("setEastingNoMatch", true);
            }
        }
        else if (coord.id === "northing") {
            commit("resetErrorMessages", coord.id);
            if (coord.value === "") {
                commit("setNorthingNoCoord", true);
            }
            else if (!String(coord.value).match(validators[currentProjection.id])) {
                commit("setNorthingNoMatch", true);
            }
        }
    },
    /**
     * Pushes the formatted coordinates in the selectedCoordinates String[].
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.commit the commit
     * @param {Object} context.getters the getters
     * @param {String[]} coords the coordinates the user entered
     * @returns {void}
     */
    formatInput ({state, commit, getters}, coords) {
        const {currentProjection} = state;

        commit("setSelectedCoordinates", []);
        for (const coord of coords) {
            if (!getters.getEastingError && !getters.getNorthingError) {
                let formatter;

                if (currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
                    formatter = coordinate=>coordinate.value.split(/[\s°]+/);
                }
                else if (currentProjection.projName === "longlat") {
                    formatter = coordinate=>coordinate.value.split(/[\s°′″'"´`]+/);
                }
                else {
                    formatter = coordinate=>coordinate.value;
                }

                commit("resetErrorMessages", "all");
                commit("pushCoordinates", formatter(coord));
            }
        }
    },
    /**
     * Transforms the selected coordinates from the current projection to the target projection and sets them to state.
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.commit the commit
     * @param {Object} targetProjection the target projection
     * @returns {void}
     */
    transformCoordinatesFromTo ({state, commit}, targetProjection) {
        let transformedCoordinates, coordinates;

        if (state.selectedCoordinates.length === 2) {
            if (state.currentProjection.projName === "longlat") {
                coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);
            }
            else {
                coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];
            }
            if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3") {
                if (coordinates[0].toString().length === 7) {
                    coordinates[0] = coordinates[0] - 3000000;
                }
            }
            transformedCoordinates = proj4(state.currentProjection, targetProjection, coordinates);
            if (targetProjection.projName === "longlat" && targetProjection.id !== "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
                transformedCoordinates = [convertSexagesimalFromDecimal(transformedCoordinates[1]), convertSexagesimalFromDecimal(transformedCoordinates[0])];
            }
            else if (targetProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
                transformedCoordinates = [transformedCoordinates[1].toFixed(4) + "°", transformedCoordinates[0].toFixed(4) + "°"];
            }
            else if (targetProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3") {
                if (transformedCoordinates[0].toFixed(2).length === 9) {
                    transformedCoordinates[0] = transformedCoordinates[0] + 3000000;
                }
                transformedCoordinates = [transformedCoordinates[0].toFixed(2), transformedCoordinates[1].toFixed(2)];
            }
            else {
                transformedCoordinates = [transformedCoordinates[0].toFixed(2), transformedCoordinates[1].toFixed(2)];
            }
            commit("setCoordinatesEasting", {id: "easting", value: transformedCoordinates[0]});
            commit("setCoordinatesNorthing", {id: "northing", value: transformedCoordinates[1]});
        }
    },

    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.dispatch the dispatch
     * @returns {void}
     */
    transformCoordinates ({state, dispatch}) {
        const mapProjection = mapCollection.getMapView("2D").getProjection().getCode();

        if (state.selectedCoordinates.length === 2) {
            dispatch("setZoom", state.zoomLevel);

            if (state.currentProjection.id.indexOf("4326") > -1) {
                const coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);

                state.transformedCoordinates = proj4(proj4("EPSG:4326"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.id.indexOf("31467") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:31467"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.id.indexOf("8395") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:8395"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.id.indexOf("ETRS893GK3") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]) - 3000000, Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:8395"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.id.indexOf("4647") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:4647"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.epsg !== mapProjection) {
                let coordinates;

                if (state.currentProjection.projName === "longlat") {
                    coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);
                }
                else {
                    coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];
                }

                state.transformedCoordinates = proj4(proj4(state.currentProjection.id), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else {
                dispatch("moveToCoordinates", state.selectedCoordinates);
            }
        }
    },
    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {String[]} coordinates from the validated coordinates
     * @returns {void}
     */
    moveToCoordinates ({dispatch}, coordinates) {
        dispatch("setMarker", coordinates);
        dispatch("setCenter", coordinates);
    },
    /**
     * Sets the zoom level to the map.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Number} zoomLevel - Zoomlevel to zoom to
     * @returns {void}
     */
    setZoom: function ({dispatch}, zoomLevel) {
        dispatch("Maps/setZoom", zoomLevel, {root: true});
    },
    /**
     * Takes the selected coordinates and centers the map to the new position.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {String[]} coordinates - coordinates for new center position
     * @returns {void}
     */
    setCenter: function ({dispatch}, coordinates) {
        // coordinates come as string and have to be changed to numbers for setCenter from mutations to work.
        const newCoords = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];

        dispatch("Maps/setCenter", newCoords, {root: true});
    }
};
