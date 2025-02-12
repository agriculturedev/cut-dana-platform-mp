import {terrain} from "@masterportal/masterportalapi/src";
import Layer3d from "./layer3d";

/**
 * Creates a 3d layer terrain.
 * @name Layer3dTerrain
 * @abstract
 * @constructs
 * @extends Layer
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer3dTerrain (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer3d.call(this, this.attributes);
}

Layer3dTerrain.prototype = Object.create(Layer3d.prototype);

/**
 * Creates a layer of type terrain by using terrain-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer3dTerrain.prototype.createLayer = function (attributes) {
    this.setLayer(terrain.createLayer(attributes));
    this.setVisible(attributes.visibility, mapCollection.getMap("3D"), attributes);
};
