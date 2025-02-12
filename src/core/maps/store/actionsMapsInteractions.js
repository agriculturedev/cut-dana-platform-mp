
import api from "@masterportal/masterportalapi/src/maps/api";
import {unByKey as unlistenByKey} from "ol/Observable.js";
import {toRaw} from "vue";

import actionsMapsInteractionsZoom from "./actionsMapsInteractionsZoom";

/**
 * Interactions with the Map, MapView and Scene (3D).
 */

const registeredActions = {};

export default {
    ...actionsMapsInteractionsZoom,

    /**
     * Adds an interaction to the map.
     * @param {Object} context store context
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be added to map.
     * @returns {void}
     */
    addInteraction (context, interaction) {
        const map = mapCollection.getMap("2D");

        map.addInteraction(toRaw(interaction));
    },

    /**
     * Registered listener for certain events on the map.
     * @see https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} payload parameter object
     * @param {String} payload.type The event type or array of event types.
     * @param {Function} payload.listener The listener function.
     * @param {String | Function} payload.listenerType Type of the listener. Possible are: "function", "commit" and "dispatch".
     * @param {Boolean} payload.root listener is dispatched or commited with root:true, if listenerType is 'dispatch' or 'commit' and root is true
     * @returns {void}
     */
    registerListener ({commit, dispatch}, {type, listener, listenerType = "function", root = false}) {
        registeredActions[type] = registeredActions[type] || {};
        registeredActions[type][listenerType] = registeredActions[type][listenerType] || {};
        registeredActions[type][listenerType][String(listener)] = evt => {
            if (listenerType === "function") {
                listener(evt);
            }
            else if (listenerType === "dispatch") {
                dispatch(listener, evt, {root: root});
            }
            else if (listenerType === "commit") {
                commit(listener, evt, {root: root});
            }
        };

        mapCollection.getMap("2D").on(type, registeredActions[type][listenerType][listener]);
    },


    /**
     * Removes an interaction from the map.
     * @param {Object} context store context
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be removed from map.
     * @returns {void}
     */
    removeInteraction (context, interaction) {
        const map = mapCollection.getMap("2D");

        if (interaction && map.removeInteraction(interaction) === undefined) {
            const interactions = map.getInteractions().getArray(),
                index = interactions.findIndex((anInteraction) => {
                    return anInteraction.ol_uid === interaction.ol_uid;
                });

            if (index > -1) {
                map.getInteractions().removeAt(index);
            }
            else if (typeof interactions === Array) {
                console.warn("interaction cannot be removed from map:", interaction);
            }
        }
    },

    /**
     * Sets map view to initial properties.
     * @param {Object} param store context
     * @param {Object} param.state the state
     * @returns {void}
     */
    resetView ({state}) {
        const view = mapCollection.getMapView("2D");

        view.setCenter(state.initialCenter);
        view.setRotation(state.initialRotation);
        view.setZoom(state.initialZoom);
    },

    /**
     * Sets the camera parameter
     * @param {Object} param store context
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} cameraParams The camera params.
     * @param {Object} cameraParams.altitude The camera altitude param.
     * @param {Object} cameraParams.heading The camera heading param.
     * @param {Object} cameraParams.tilt The camera tilt param.
     * @returns {void}
     */
    setCamera ({rootGetters}, cameraParams) {
        const map3d = mapCollection.getMap("3D");

        if (map3d) {
            api.map.olcsMap.setCameraParameter(cameraParams, mapCollection.getMap("3D"), Cesium);
        }
        else {
            if (!rootGetters.map3dParameter) {
                rootGetters.map3dParameter = {};
            }
            rootGetters.map3dParameter.camera = cameraParams;
        }
    },

    /**
     * Sets the center of the current view.
     * @param {Object} param store context
     * @param {Object} param.getters the getters
     * @param {Object} param.commit the commit
     * @param {Number[]} coords An array of numbers representing a xy-coordinate
     * @returns {void}
     */
    setCenter ({commit}, coords) {
        const view = mapCollection.getMapView("2D");
        let first2Coords = [coords[0], coords[1]];

        if (first2Coords.some(coord => typeof coord !== "number")) {
            first2Coords = first2Coords.map(singleCoord => parseInt(singleCoord, 10));
        }
        if (Array.isArray(first2Coords) && first2Coords.length === 2) {
            commit("setCenter", coords);
            view.setCenter(coords);
        }
        else {
            console.warn("Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers.");
        }
    },

    /**
     * Unsubscribes listener to certain events.
     * @param {Object} context store context
     * @param {Object} payload parameter object
     * @param {String} payload.type The event type or array of event types.
     * @param {Function} payload.listener The listener function.
     * @param {String | Function} payload.listenerType Type of the listener. Possible are: "function", "commit" and "dispatch".
     * @returns {void}
     */
    unregisterListener (context, {type, listener, listenerType = "function"}) {
        if (typeof type === "string") {
            if (registeredActions[type] && registeredActions[type][listenerType] && registeredActions[type][listenerType][String(listener)]) {
                mapCollection.getMap("2D").un(type, registeredActions[type][listenerType][String(listener)]);
                registeredActions[type][listenerType][String(listener)] = null;
            }
        }
        else {
            unlistenByKey(type);
        }
    },

    /**
     * Activates the selected view point with calling the zoomToCoordinates function and in case of 3D mode additionally it calls setCamera function.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.getters the getters
     * @param {Number} payload.altitude altitude of the view
     * @param {Number} payload.heading heading of the view
     * @param {Number} payload.tilt tilt of the view
     * @param {Number[]} payload.center center of the view
     * @param {Number} payload.zoom zoom of the view
     */
    activateViewpoint ({dispatch, getters}, {altitude, heading, tilt, center, zoom}) {
        dispatch("Maps/zoomToCoordinates", {center, zoom}, {root: true});
        if (getters.mode === "3D") {
            dispatch("setCamera", {
                altitude, heading, tilt
            });
        }
    }
};
