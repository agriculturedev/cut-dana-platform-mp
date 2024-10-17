import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";

import mapMarker from "../js/mapMarker";

/**
 * Place and remove map markers as point or polygon.
 */
export default {
    /**
     * Change the styleId for the marker with the given markerId.
     * @param {Object} context the context Vue instance
     * @param {String} markerId The map marker id.
     * @param {String} styleId The style id.
     * @returns {void}
     */
    changeMarkerStyle (context, {markerId, styleId}) {
        mapMarker.getMapmarkerLayerById(markerId)?.set("styleId", styleId || "defaultMapMarkerPoint");
    },

    /**
     * With this function the coordinate, which has to be marked by the mapMarker, is written to the MapMarker state.
     * @param {Object} param.dispatch the dispatch
     * @param {String[]|Object} position The array with the markable coordinate pair or an Object wird coordinates and rotation.
     * @param {String[]} [position.coordinates] The array with the coordinates.
     * @param {Number} [position.rotation] The rotation in degree.
     * @returns {void}
     */
    placingPointMarker ({commit, dispatch, rootGetters}, position) {
        const coordinates = Array.isArray(position) ? position : position?.coordinates;

        dispatch("removePointMarker");

        if (coordinates) {
            const layerId = "marker_point_layer",
                feature = new Feature({
                    geometry: new Point(coordinates)
                });

            if (rootGetters["Menu/currentComponent"]("mainMenu").type !== "searchbar" && rootGetters["Modules/SearchBar/searchInput"] !== "") {
                commit("Modules/SearchBar/setSearchInput", "", {root: true});
                commit("Modules/SearchBar/setCurrentSearchInputValue", "", {root: true});
            }

            mapMarker.addFeatureToMapMarkerLayer(layerId, feature);

            if (position.rotation) {
                dispatch("rotatePointMarker", {feature, position});
            }
        }
    },

    /**
     * Removes the features from the point map marker.
     * @returns {void}
     */
    removePointMarker () {
        mapMarker.removeMapMarker("marker_point_layer");
    },

    /**
     * Adds a polygon feature to the the polygon map marker layer.
     * @param {Object} param.dispatch the dispatch
     * @param {ol/Feature | ol/geom/SimpleGeometry} placeableObj The ol feature or geometry that is added to the map.
     * @returns {void}
     */
    placingPolygonMarker ({dispatch}, placeableObj) {
        let feature;

        if (placeableObj instanceof Feature) {
            feature = placeableObj;
        }
        else {
            feature = new Feature({
                geometry: placeableObj
            });
        }
        const layerId = "marker_polygon_layer";

        dispatch("removePolygonMarker");
        mapMarker.addFeatureToMapMarkerLayer(layerId, feature);
    },

    /**
     * Removes the features from the polygon map marker.
     * @returns {void}
     */
    removePolygonMarker () {
        mapMarker.removeMapMarker("marker_polygon_layer");
    },

    /**
     * Rotates the point marker in 2D.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @param {ol/Feature} feature The map marker feature.
     * @param {Object} position The Object wird coordinates and rotation.
     * @param {String[]} position.coordinates The array with the coordinates.
     * @param {Number} position.rotation The rotation in degree.
     * @returns {void}
     */
    rotatePointMarker ({dispatch, state}, {feature, position}) {
        feature.getStyle()?.getImage()?.setRotation(position.rotation * Math.PI / 180);

        if (state.mode === "3D") {
            dispatch("rotatePointMarkerIn3D", position);
        }
    },

    /**
     * Rotates the point marker in 3D.
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} position The Object wird coordinates and rotation.
     * @param {String[]} position.coordinates The array with the coordinates.
     * @param {Number} position.rotation The rotation in degree.
     * @returns {void}
     */
    rotatePointMarkerIn3D ({rootGetters}, position) {
        const clickPixel = rootGetters["Maps/clickPixel"],
            angle = position.rotation;
        let pixelOffset;

        if (clickPixel) {
            mapCollection.getMap("3D").getCesiumScene().drillPick({x: clickPixel[0], y: clickPixel[1]}, 100, 200, 200).forEach(primitiveObject => {
                if (primitiveObject?.primitive?.olLayer?.get("id") === "marker_point_layer") {
                    switch (angle) {
                        case 0: {
                            pixelOffset = {
                                x: ((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.width - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0]) * primitiveObject.primitive.scale))) / 2,
                                y: -((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.height - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1]) * primitiveObject.primitive.scale))) / 2
                            };
                            break;
                        }
                        case 90: {
                            pixelOffset = {
                                x: ((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.height - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1]) * primitiveObject.primitive.scale))) / 2,
                                y: ((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.width - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0]) * primitiveObject.primitive.scale))) / 2
                            };
                            break;
                        }
                        case 180: {
                            pixelOffset = {
                                x: ((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.width - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0]) * primitiveObject.primitive.scale))) / 2,
                                y: ((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.height - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1]) * primitiveObject.primitive.scale))) / 2
                            };
                            break;
                        }
                        case 270: {
                            pixelOffset = {
                                x: -((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.height - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[1]) * primitiveObject.primitive.scale))) / 2,
                                y: ((primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0] * primitiveObject.primitive.scale) - (((primitiveObject.primitive.width - primitiveObject.primitive.olFeature.getStyle().getImage().getAnchor()[0]) * primitiveObject.primitive.scale))) / 2
                            };
                            break;
                        }
                        default: {
                            break;
                        }
                    }

                    primitiveObject.primitive.pixelOffset = pixelOffset;
                    primitiveObject.primitive.rotation = -angle * Math.PI / 180;
                }
            });
        }
    }
};
