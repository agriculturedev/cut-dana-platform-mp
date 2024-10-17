import {entities} from "@masterportal/masterportalapi/src";
import Layer3d from "./layer3d";

/**
 * Creates a 3d layer entities.
 * @name Layer3dEntities
 * @abstract
 * @constructs
 * @extends Layer
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer3dEntities (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer3d.call(this, this.attributes);
}

Layer3dEntities.prototype = Object.create(Layer3d.prototype);

/**
 * Creates a layer of type entities by using entities-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer3dEntities.prototype.createLayer = function (attributes) {
    const map3d = mapCollection.getMap("3D");

    attributes?.entities?.forEach(entity => {
        entity.show = attributes.visibility;
    });

    this.setLayer(entities.createLayer(attributes, map3d));
};
