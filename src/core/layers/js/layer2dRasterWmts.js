import {wmts} from "@masterportal/masterportalapi";
import getNestedValues from "../../../shared/js/utils/getNestedValues";
import Layer2dRaster from "./layer2dRaster";

/**
 * Creates a 2d raster wmts (Web Map Tile Service) layer.
 * @name Layer2dRasterWmts
 * @constructs
 * @extends Layer2dRaster
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dRasterWmts (attributes) {
    const defaultAttributes = {
        optionsFromCapabilities: false
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2dRaster.call(this, this.attributes);
}

Layer2dRasterWmts.prototype = Object.create(Layer2dRaster.prototype);

/**
 * Creates a layer of type WMTS by using wmts-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dRasterWmts.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes),
        layerParams = this.getLayerParams(attributes);

    this.setLayer(wmts.createLayer(rawLayerAttributes, layerParams));
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dRasterWmts.prototype.getRawLayerAttributes = function (attributes) {
    return attributes;
};

/**
 * Gets additional layer params.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Obeject} The layer params.
 */
Layer2dRasterWmts.prototype.getLayerParams = function (attributes) {
    return {
        opacity: (100 - attributes.transparency) / 100,
        zIndex: attributes.zIndex
    };
};

/**
 * If no legendURL is set a warning is written on the console.
 * For the OptionsFromCapabilities way:
 * If legend is empty, WMTS-Capabilities will be searched for a legendURL (OGC Standard)
 * If a legend is found, legend will be rebuild.
 *
 * @returns {void}
 */
Layer2dRasterWmts.prototype.createLegend = async function () {
    let legend = this.inspectLegendUrl();

    if ((this.get("optionsFromCapabilities") === undefined) && (legend === true)) {
        console.error("WMTS: No legendURL is specified for the layer!");
    }
    else if (this.get("optionsFromCapabilities") && !this.get("legendURL") && (!legend || legend === true)) {
        try {
            const capabilitiesUrl = this.get("capabilitiesUrl"),
                result = await wmts.getWMTSCapabilities(capabilitiesUrl);

            result.Contents.Layer.forEach((layer) => {
                if (layer.Identifier === this.get("layers")) {
                    const getLegend = getNestedValues(layer, "LegendURL", true);

                    if (getLegend !== null && getLegend !== undefined) {
                        legend = getLegend[0]?.[0]?.href;
                        if (legend) {
                            legend = [legend];
                        }
                    }
                    else {
                        legend = null;
                        console.warn("no legend url found for layer " + this.get("layers"));
                    }

                }
            });
        }
        catch (error) {
            wmts.showErrorMessage(error, this.get("name"));
        }
    }

    return legend;
};


