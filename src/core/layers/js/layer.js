import {markRaw} from "vue";

/**
 * Creates a layer.
 * @name Layer
 * @abstract
 * @constructs
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    this.createLayer(this.attributes);
}

/**
 * To be overwritten, does nothing.
 * @abstract
 * @returns {void}
 */
Layer.prototype.createLayer = function () {
    // do in children
    console.warn("Function Layer: 'createLayer' must be overwritten in extended layers!");
};

/**
 * To be overwritten, does nothing.
 * @abstract
 * @returns {void}
*/
Layer.prototype.createLegend = function () {
    console.warn("Function Layer: 'createLegend' must be overwritten in extended layers!");
};

/**
 * To be overwritten, does nothing.
 * @abstract
 * @returns {void}
 */
Layer.prototype.updateLayerValues = function () {
    // do in children
    console.warn("Function Layer: 'updateLayerValues' must be overwritten in extended layers!");
};

/**
 * To be overwritten, does nothing.
 * @abstract
 * @returns {void}
 */
Layer.prototype.visibilityChanged = function () {
    // do in children
};

/**
 * Getter for attribute values.
 * @param {String} key The attribute key.
 * @returns {*} The attribute value
 */
Layer.prototype.get = function (key) {
    return this.attributes[key];
};

/**
 * Getter for layer.
 * @returns {ol/layer/Layer~Layer|Object} The ol layer
 */
Layer.prototype.getLayer = function () {
    return this.layer;
};

/**
 * Setter for attribute values.
 * @param {String} key The attribute key.
 * @param {*} value The attribute value
 * @returns {void}
 */
Layer.prototype.set = function (key, value) {
    this.attributes[key] = value;
};

/**
 * Setter for layer.
 * @param {ol/layer/Layer~Layer|Object} value The ol layer
 * @returns {void}
 */
Layer.prototype.setLayer = function (value) {
    this.layer = value ? markRaw(value) : value;
};

/**
 * Inspects the 'legendUrl': if not set, legend is returned.
 * If set to 'ignore', false is returned. If empty, true is returned
 * else the content is returned.
 * @returns {String|Boolean} depending on content of 'legendUrl'
 */
Layer.prototype.inspectLegendUrl = function () {
    let legend = typeof this.get("legend") !== "undefined" ? this.get("legend") : true;

    if (typeof this.get("legendURL") !== "undefined") {
        if (this.get("legendURL") === "") {
            legend = true;
        }
        else if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }

    return legend;
};

