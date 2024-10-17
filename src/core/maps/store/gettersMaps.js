import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateMaps from "./stateMaps";

const getters = {
    ...generateSimpleGetters(stateMaps),

    /**
    * Returns a layer by a given layer id.
    * @param  {String} layerId Id of the Layer.
    * @return {module:ol/layer/Base~BaseLayer} The layer found by id.
    */
    getLayerById: () => (layerId) => {
        return mapCollection.getMap("2D").getLayers().getArray().find(layer => layer.get("id") === layerId);
    },

    /**
    * Returns a layer by a given layer name.
    * @param  {String} layerName Name of the Layer.
    * @return {module:ol/layer/Base~BaseLayer} The layer found by name.
    */
    getLayerByName: () => (layerName) => {
        return mapCollection.getMap("2D").getLayers().getArray().find(layer => layer.get("name") === layerName);
    },

    /**
     * Returns the corresponding resolution for the scale.
     * @param {Object} state the state
     * @param {String|Number} scale the scale
     * @param {String} scaleType min or max
     * @return {Number} resolution
     */
    getResolutionByScale: (state) => (scale, scaleType) => {
        const scales = state.scales;

        let index = "",
            unionScales = scales.concat([parseInt(scale, 10)].filter(item => scales.indexOf(item) < 0));

        unionScales = unionScales.sort((a, b) => b - a);

        index = unionScales.indexOf(parseInt(scale, 10));
        if (unionScales.length === scales.length || scaleType === "max") {
            return state.resolutions[index];
        }
        else if (scaleType === "min") {
            return state.resolutions[index - 1];
        }
        return null;
    },

    /**
     * Indicates if the maximum zoom level is displayed.
     * @param {Object} state the state
     * @returns {Boolean} whether current zoom level is the maximum zoom level
     */
    isMaxZoomDisplayed: (state) => {
        return state.zoom >= state.maxZoom;
    },

    /**
     * Indicates if the minimum zoom level is displayed.
     * @param {Object} state the state
     * @returns {Boolean} whether current zoom level is the minimal zoom level
     */
    isMinZoomDisplayed: (state) => {
        return state.zoom <= state.minZoom;
    },

    /**
     * Returns the maps projection code.
     * @param {*} state the state
     * @param {*} getter the getter
     * @returns {String} the projection code
     */
    projectionCode: state => state.projection?.getCode(),

    urlParams: state => {
        const params = {
            center: state.center,
            mode: state.mode,
            zoom: state.zoom
        };

        if (params.mode === "3D") {

            const camera = mapCollection.getMap("3D")?.getCesiumScene()?.camera;

            params.heading = camera.heading;
            params.tilt = camera.pitch;
            params.altitude = Cesium.Cartographic.fromCartesian(camera.position).height;
        }

        return `MAPS=${JSON.stringify(params)}`;
    }
};

export default getters;
