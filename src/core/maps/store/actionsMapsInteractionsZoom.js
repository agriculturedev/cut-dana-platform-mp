import calculateExtent from "../../../shared/js/utils/calculateExtent";
import Cluster from "ol/source/Cluster.js";
import crs from "@masterportal/masterportalapi/src/crs";

/**
 * Interactions with the Map and MapView that are exclusively about zooming.
 */
export default {
    /**
     * Reduces the zoom level by one.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    decreaseZoom ({dispatch}) {
        dispatch("setZoom", mapCollection.getMapView("2D").getZoom() - 1);
    },

    /**
     * Increases the zoom level by one.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    increaseZoom ({dispatch}) {
        dispatch("setZoom", mapCollection.getMapView("2D").getZoom() + 1);
    },

    /**
     * Sets zoom level to the map view.
     * Note: State is updated by listener.
     * @param {Object} context store context
     * @param {Number} zoom The zoomLevel to zoom to.
     * @returns {void}
     */
    setZoom (context, zoom) {
        const view = mapCollection.getMapView("2D");

        if (zoom <= view.getMaxZoom() && zoom >= view.getMinZoom()) {
            view.setZoom(zoom);
        }
    },


    /**
     * Zooms to the given coordinates and rotates view if rotation is given.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object} payload parameter object
     * @param {Number[]} payload.center center of the view
     * @param {Number} payload.zoom zoom of the view
     * @param {Number} payload.rotation rotation of the view
     * @returns {void}
     */
    zoomToCoordinates ({dispatch}, {center, zoom, rotation}) {
        if (Array.isArray(center)) {
            dispatch("setCenter", center);
        }
        if (rotation !== undefined) {
            mapCollection.getMapView("2D").setRotation(rotation);
        }
        if (zoom !== undefined) {
            dispatch("setZoom", zoom);
        }
    },

    /**
     * Zoom to a given extent
     * @param {Object} context The Vuex action context.
     * @param {Object} payload parameter object.
     * @param {String[]} payload.extent The extent to zoom.
     * @param {Object} payload.options Options for zoom.
     * @param {Number} [payload.options.duration=800] The duration of the animation in milliseconds.
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit} for more options.
     * @returns {void}
     */
    zoomToExtent (context, {extent, options}) {
        mapCollection.getMapView("2D").fit(extent, {
            size: mapCollection.getMap("2D").getSize(),
            ...Object.assign({duration: 800}, options)
        });
    },

    /**
     * Zoom to features that are filtered by the ids.
     * @param {Object} param store context.
     * @param {Object} param.getters the getters.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} payload parameter object.
     * @param {String[]} payload.ids The feature ids.
     * @param {String} payload.layerId The layer id.
     * @param {Object} payload.zoomOptions The options for zoom to extent.
     * @param {Object} [payload.map] The parameter to get the map from the map collection.
     * @param {String} [payload.map.mapMode="2D"] The map mode.
     * @returns {void}
     */
    zoomToFilteredFeatures ({getters, dispatch}, {ids, layerId, zoomOptions}) {
        const layer = getters.getLayerById(layerId),
            layerSource = layer?.getSource();

        if (layer?.getSource()) {
            const source = layerSource instanceof Cluster ? layerSource.getSource() : layerSource;
            let filteredFeatures = source.getFeatures().filter(feature => ids.indexOf(feature.getId()) > -1),
                calculatedExtent = calculateExtent(filteredFeatures);

            if (filteredFeatures.length > 0) {
                dispatch("zoomToExtent", {extent: calculatedExtent, options: zoomOptions});
            }
            else {
                layerSource.once("featuresloadend", () => {
                    filteredFeatures = source.getFeatures().filter(feature => {
                        return ids.indexOf(feature.getId()) > -1;
                    });
                    if (filteredFeatures.length > 0) {
                        calculatedExtent = calculateExtent(filteredFeatures);
                        dispatch("zoomToExtent", {extent: calculatedExtent, options: zoomOptions});
                    }
                });
            }
        }
    },

    /**
     * Zoom to a given extent, this function allows to give projection of extent
     * Note: Used in remoteInterface.
     * @param {Object} param store context.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} param.getters the getters.
     * @param {Object} zoomParams parameter object.
     * @param {String[]} zoomParams.extent The extent to zoom.
     * @param {Object} zoomParams.options Options for zoom.
     * @param {String} zoomParams.projection The projection from RUL parameter.
     * @returns {void}
     */
    zoomToProjExtent ({dispatch, getters}, zoomParams) {
        if (Object.values(zoomParams).every(val => val !== undefined)) {
            const projection = zoomParams.projection;
            let extent = zoomParams.extent.map(coord => parseFloat(coord));

            if (projection !== getters["Maps/projectionCode"]) {
                const map2d = mapCollection.getMap("2D"),
                    leftBottom = extent.slice(0, 2),
                    topRight = extent.slice(2, 4),
                    transformedLeftBottom = crs.transformToMapProjection(map2d, zoomParams.projection, leftBottom),
                    transformedTopRight = crs.transformToMapProjection(map2d, zoomParams.projection, topRight);

                extent = transformedLeftBottom.concat(transformedTopRight);
            }

            dispatch("zoomToExtent", {extent: extent, options: zoomParams.options});
        }
    }
};
