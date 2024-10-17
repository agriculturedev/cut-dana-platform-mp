import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Layer2dVector from "./layer2dVector";

/**
 * Creates a 2d vector vectorbase layer.
 * @name Layer2dVectorVectorbase
 * @constructs
 * @extends Layer2dVector
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVectorVectorbase (attributes) {
    const defaultAttributes = {
    };

    this.sourceUpdated = false;
    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2dVector.call(this, this.attributes);
    this.prepareFeaturesFor3D(this.layer?.getSource().getFeatures());
}

Layer2dVectorVectorbase.prototype = Object.create(Layer2dVector.prototype);

/**
 * Creates the vectorbase layer.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dVectorVectorbase.prototype.createLayer = function (attributes) {
    this.layer = this.createVectorLayer(attributes);
    this.features = attributes.features;
};

/**
 * Creates an vector Base
 * @param {Object} attrs  attributes of the layer
 * @returns {Object} layer
 */
Layer2dVectorVectorbase.prototype.createVectorLayer = function (attrs) {
    const source = new VectorSource({
        features: attrs.features
    });

    return new VectorLayer({
        source: source,
        name: attrs.name,
        typ: attrs.typ,
        gfiAttributes: attrs.gfiAttributes,
        id: attrs.id,
        alwaysOnTop: attrs.alwaysOnTop
    });
};

Layer2dVectorVectorbase.prototype.updateSource = function () {
    if (this.sourceUpdated === false) {
        this.sourceUpdated = true;
        this.layer.getSource().refresh();
    }
};
