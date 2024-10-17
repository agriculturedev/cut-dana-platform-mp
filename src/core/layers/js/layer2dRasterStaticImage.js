import ImageLayer from "ol/layer/Image";
import StaticImageSource from "ol/source/ImageStatic";

import Layer2dRaster from "./layer2dRaster";

/**
 * Creates a 2d raster static image layer.
 * @name Layer2dRasterStaticImage
 * @constructs
 * @extends Layer2dRaster
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dRasterStaticImage (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2dRaster.call(this, this.attributes);
}

Layer2dRasterStaticImage.prototype = Object.create(Layer2dRaster.prototype);

/**
 * Creates a layer of type static image.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dRasterStaticImage.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes);

    this.setLayer(this.createStaticImageLayer(rawLayerAttributes));
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dRasterStaticImage.prototype.getRawLayerAttributes = function (attributes) {
    const rawLayerAttributes = {
        crs: attributes.crs,
        imageExtent: attributes.extent,
        name: attributes.name,
        url: attributes.url,
        zIndex: attributes.zIndex
    };

    return rawLayerAttributes;
};

/**
 * Does nothing.
 * @returns {void}
*/
Layer2dRasterStaticImage.prototype.createLegend = function () {
    // does nothing
};

/**
 * Creates a complete ol/Layer from rawLayer.
 * @param {Object} rawLayer layer specification as in services.json
 * @returns {ol/Layer} layer that can be added to map
 */
Layer2dRasterStaticImage.prototype.createStaticImageLayer = function (rawLayer = {}) {
    const source = new StaticImageSource({
            imageExtent: rawLayer.imageExtent,
            url: rawLayer.url,
            projection: rawLayer.crs
        }),
        layer = new ImageLayer({
            name: rawLayer.name,
            source: source,
            typ: "StaticImage",
            zIndex: rawLayer.zIndex
        });

    return layer;
};
