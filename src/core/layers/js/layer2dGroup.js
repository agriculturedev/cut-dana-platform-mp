import {Group as LayerGroup} from "ol/layer.js";
import Layer2d from "./layer2d";
import layerFactory from "./layerFactory";

/**
 * Creates a 2d layer group.
 * @name Layer2dGroup
 * @abstract
 * @constructs
 * @extends Layer2d
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dGroup (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    if (!Array.isArray(attributes.children)) {
        console.warn("Wrong configuration for Grouplayer: children are missing.", attributes);
    }
    else {
        Layer2d.call(this, this.attributes);
    }
}

Layer2dGroup.prototype = Object.create(Layer2d.prototype);

/**
 * Creates a layer of type GROUP.
 * Sets all needed attributes at the layer and the layer source.
 * Grouped layers are stored in layerSource
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dGroup.prototype.createLayer = function (attributes) {
    const olLayers = [],
        sourceLayers = [];
    let groupLayer = null;

    attributes.children.forEach(rawLayer => {
        const layer = layerFactory.createLayer(rawLayer, "2D");

        olLayers.push(layer.getLayer());
        sourceLayers.push(layer);
    });
    groupLayer = new LayerGroup({layers: olLayers});
    groupLayer.getSource = () => {
        return sourceLayers;
    };

    this.setLayer(groupLayer);
};

/**
 * Setter for ol layer source. Sets this grouped layers as layerSource.
 * @returns {void}
 */
Layer2dGroup.prototype.setLayerSource = function () {
    this.layerSource = this.getLayer().getSource();
};
/**
 * Getter for ol layer source. Returns an array with the grouped layers.
 * @returns {Array} an array with the grouped layers.
 */
Layer2dGroup.prototype.getLayerSource = function () {
    return this.layerSource;
};
/**
 * Calls super.addErrorListener for each grouped layer.
 * Adds listener on 'featuresloaderror', 'tileloaderror' and 'imageloaderror' at layer source.
 * @returns {void}
 */
Layer2dGroup.prototype.addErrorListener = function () {
    this.layerSource.forEach(sourceLayer => {
        Layer2d.prototype.addErrorListener.call(sourceLayer.getLayerSource());
    });
};

