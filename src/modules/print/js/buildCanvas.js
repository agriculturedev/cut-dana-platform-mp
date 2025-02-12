import {Image, Tile, Vector, VectorTile} from "ol/layer.js";

import store from "../../../app-store";

const CanvasModel = {
    /**
     * Getting the canvas layer for the print mask
     * @param {ol.layer.Layer[]} layerList All visible layers on the map.
     * @returns {Object} - LayerObject for print mask.
     */
    getCanvasLayer: function (layerList) {
        const currentResolution = store.getters["Maps/resolution"],
            canvasLayerList = [];
        let canvasLayer = {};

        layerList.forEach(layer => {
            canvasLayerList.push(this.buildCanvasLayerType(layer, currentResolution));
        });

        for (const layer of canvasLayerList) {
            if (typeof layer !== "undefined") {
                canvasLayer = layer;
            }
        }

        return canvasLayer;
    },

    /**
     * returns canvas layer by layer type
     * @param  {ol.layer} layer ol.Layer with deatures
     * @param {Number} currentResolution Current map resolution
     * @returns {Object} - LayerObject for print mask.
     */
    buildCanvasLayerType: function (layer, currentResolution) {
        const extent = store.getters["Maps/extent"],
            layerMinRes = layer.getMinResolution(),
            layerMaxRes = layer.getMaxResolution(),
            isInScaleRange = this.isInScaleRange(layerMinRes, layerMaxRes, currentResolution);
        let features = [],
            returnLayer;

        if (isInScaleRange) {
            if (layer instanceof Image || layer instanceof Tile || layer instanceof VectorTile) {
                returnLayer = layer;
            }
            else if (layer instanceof Vector) {
                features = layer.getSource().getFeaturesInExtent(extent);

                if (features.length > 0) {
                    returnLayer = layer;
                }
            }
        }
        return returnLayer;
    },

    /**
     * Checks if layer is in the visible resolution range.
     * @param {Number} layerMinRes Maximum resolution of layer.
     * @param {Number} layerMaxRes Minimum resolution of layer.
     * @param {Number} currentResolution Current map resolution.
     * @returns {Boolean} - Flag if layer is in visible resolution.
     */
    isInScaleRange: function (layerMinRes, layerMaxRes, currentResolution) {
        let isInScale = false;

        if (layerMinRes <= currentResolution && layerMaxRes >= currentResolution) {
            isInScale = true;
        }

        return isInScale;
    }
};

export default CanvasModel;
