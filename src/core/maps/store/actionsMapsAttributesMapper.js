import {markRaw} from "vue";
import api from "@masterportal/masterportalapi/src/maps/api";
import {transform, get} from "ol/proj.js";
import findWhereJs from "../../../shared/js/utils/findWhereJs";

/**
 * Registers on events of the map and view to keep the attributes up to date.
 */
export default {
    /**
     * Sets the map to the store. As a side-effect, map-related functions are registered
     * to fire changes when required. Each time a new map is registered, all old listeners
     * are discarded and new ones are registered.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    setMapAttributes ({dispatch}) {
        dispatch("registerMapListener");
        dispatch("initTwoFingerPan");
        dispatch("registerMapViewListener");
        dispatch("setInitialAttributes");
        dispatch("updateAttributesByMoveend");
        dispatch("updateAttributesByChangeResolution");
    },

    /**
     * If 'twoFingerPan' is configured event linstener are added to map.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootState the rootState
     * @returns {void}
     */
    initTwoFingerPan ({dispatch, rootGetters}) {
        if (rootGetters.twoFingerPan) {
            const mapDiv = document.getElementById("map");

            mapDiv.addEventListener("touchmove", (event) => dispatch("oneFingerDragMessage", event));
            mapDiv.addEventListener("touchend", (event) => dispatch("oneFingerDragMessageEnd", event));
        }
    },

    /**
     * Register map listener.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    registerMapListener ({dispatch}) {
        dispatch("registerListener", {
            type: "change:size",
            listener: "updateAttributesByChangeSize",
            listenerType: "dispatch"
        });

        dispatch("registerListener", {
            type: "click",
            listener: "updateAttributesByClick",
            listenerType: "dispatch"
        });

        dispatch("registerListener", {
            type: "moveend",
            listener: "updateAttributesByMoveend",
            listenerType: "dispatch"
        });

        dispatch("registerListener", {
            type: "pointermove",
            listener: "updateAttributesByPointer",
            listenerType: "dispatch"
        });
    },

    /**
     * Unregister map listener.
     * Note: Necessary for perfomance in 3D mode.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    unregisterMapListener ({dispatch}) {
        dispatch("unregisterListener", {
            type: "click",
            listener: "updateAttributesByClick",
            listenerType: "dispatch"
        });

        dispatch("unregisterListener", {
            type: "pointermove",
            listener: "updateAttributesByPointer",
            listenerType: "dispatch"
        });
    },

    /**
     * Register map view listener.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    registerMapViewListener ({dispatch}) {
        const mapView = mapCollection.getMapView("2D");

        mapView.on("change:resolution", () => {
            dispatch("updateAttributesByChangeResolution");
        });
    },

    /**
     * Register cesium (map 3D) listener.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @returns {void}
     */
    registerCesiumListener ({dispatch, rootGetters}) {
        const map3d = mapCollection.getMap("3D"),
            scene3d = map3d.getCesiumScene(),
            eventHandler = new Cesium.ScreenSpaceEventHandler(scene3d.canvas);

        if (rootGetters["Modules/GetFeatureInfo/coloredHighlighting3D"] && rootGetters["Modules/GetFeatureInfo/coloredHighlighting3D"]?.enabled !== false) {
            dispatch("Modules/GetFeatureInfo/highlight3DTile", "", {root: true});
        }

        api.map.olcsMap.handle3DEvents({
            scene: scene3d,
            map3D: map3d,
            callback: (clickObject) => dispatch("updateAttributesByClick", markRaw(clickObject))
        });

        eventHandler.setInputAction((evt) => dispatch("updateAttributesByPointer", evt), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    /**
     * Sets initial map and view attributes.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    setInitialAttributes ({commit}) {
        const map = mapCollection.getMap("2D"),
            mapView = mapCollection.getMapView("2D");

        commit("setInitialCenter", mapView.getCenter());
        commit("setInitialRotation", mapView.getRotation());
        commit("setInitialZoom", mapView.getZoom());
        commit("setMode", map.mode);
        commit("setProjection", mapView.getProjection());
        commit("setResolutions", mapView.getResolutions());
        commit("setScales", mapView.get("options").map(option => option.scale));
        commit("setSize", map.getSize());
    },

    /**
     * Updates map attributes by change size.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    updateAttributesByChangeSize ({commit}) {
        const map = mapCollection.getMap("2D");

        commit("setSize", map.getSize());
    },

    /**
     * Updates the click coordinate and the related pixel depending on the map mode.
     * If Gfi Tool is active, the features of this coordinate/pixel are set.
     * @param {Object} param store context
     * @param {Object} param.getters the getters
     * @param {Object} param.commit the commit
     * @param {MapBrowserEvent} evt - Click event in 2D, fake click event in 3D
     * @returns {void}
     */
    updateAttributesByClick ({getters, commit}, evt) {
        if (getters.mode === "2D") {
            commit("setClickCoordinate", evt.coordinate);
            commit("setClickPixel", evt.pixel);
        }
        else if (getters.mode === "3D" && evt) {
            if (evt.pickedPosition) {
                commit("setClickCoordinate", evt.pickedPosition);
            }
            if (evt.position?.x && evt.position?.y) {
                commit("setClickPixel", [evt.position.x, evt.position.y]);
            }
        }
    },

    /**
     * Updates map attributes by moveend.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @returns {Function} update function for state parts to update onmoveend
     */
    updateAttributesByMoveend ({commit}) {
        const map = mapCollection.getMap("2D"),
            mapView = mapCollection.getMapView("2D");

        commit("setCenter", mapView.getCenter());
        commit("setExtent", mapView.calculateExtent(map.getSize()));
    },

    /**
     * Updates the mouse coordinates.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.getters the getters
     * @param {Object} event update event
     * @returns {Function} update function for mouse coordinate
     */
    updateAttributesByPointer ({commit, getters}, event) {
        if (getters.mode === "2D") {
            commit("setMouseCoordinate", event.coordinate);
        }
        else if (getters.mode === "3D") {
            try {
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    pickedPositionCartesian = scene.pickPosition(event.endPosition),
                    cartographicPickedPosition = scene.globe.ellipsoid.cartesianToCartographic(pickedPositionCartesian),
                    transformedPickedPosition = transform([Cesium.Math.toDegrees(cartographicPickedPosition.longitude), Cesium.Math.toDegrees(cartographicPickedPosition.latitude)], get("EPSG:4326"), getters.projection);

                transformedPickedPosition.push(cartographicPickedPosition.height);
                commit("setMouseCoordinate", transformedPickedPosition);
            }
            catch (e) {
                // An error is thrown if the scene is not rendered yet.
            }
        }
    },

    /**
     * Updates map attributes by change resolution.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    updateAttributesByChangeResolution ({commit}) {
        const mapView = mapCollection.getMapView("2D"),
            options = findWhereJs(mapView.get("options"), {
                resolution: mapView.getConstrainedResolution(mapView.getResolution())
            });

        commit("setMaxZoom", mapView.getMaxZoom());
        commit("setMinZoom", mapView.getMinZoom());
        commit("setResolution", mapView.getResolution());
        commit("setScale", options?.scale);
        commit("setZoom", mapView.getZoom());
    },

    /**
     * Opens an alert Window to inform the user to use two fingers for panning.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Event} event touchstart
     * @returns {void}
    */
    oneFingerDragMessage ({commit, dispatch, getters}, event) {
        if (!event) {
            return;
        }
        if (event && event.targetTouches.length === 1 && !getters.twoFingerPanStart) {
            dispatch("Alerting/addSingleAlert", i18next.t("common:core.maps.mapRegion.twoFingerPanAlert"), {root: true});
        }
        else if (event.targetTouches.length === 2) {
            commit("setTwoFingerPanStart", true);
        }
    },
    /**
     * Removes the touchmove and touchend event listeners added for the two finger pan alert message.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Event} event touchend
     * @returns {void}
     */
    oneFingerDragMessageEnd ({commit, dispatch}, event) {
        if (!event) {
            return;
        }
        if (event.targetTouches?.length === 0) {
            commit("setTwoFingerPanStart", false);
        }
        const mapDiv = document.getElementById("map");

        mapDiv.removeEventListener("touchmove", dispatch("oneFingerDragMessage"));
        mapDiv.removeEventListener("touchend", dispatch("oneFingerDragMessageEnd"));
    }
};
