import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import Layer from "./layer";

/**
 * Creates a 3d layer.
 * @name Layer3d
 * @abstract
 * @constructs
 * @extends Layer
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer3d (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer.call(this, this.attributes);
}

Layer3d.prototype = Object.create(Layer.prototype);

/**
 * Calls masterportalAPI's layer to set this layer visible.
 * @param {Boolean} visibility visibility of the layer
 * @param {Cesium} map The 3d map.
 * @param {Object} [attributes={}] The attributes of the layer configuration.
 * @returns {void}
 */
Layer3d.prototype.setVisible = function (visibility, map, attributes = {}) {
    this.getLayer()?.setVisible(visibility, attributes, map);
};

/**
 * Sets values to the cesium layer.
 * @param {Object} attributes The new attributes.
 * @returns {void}
 */
Layer3d.prototype.updateLayerValues = function (attributes) {
    if (this.get("visibility") !== attributes.visibility) {
        this.setVisible(attributes.visibility, mapCollection.getMap("3D"), attributes);
    }
};

/**
 * Creates the legend.
 * @returns {void}
 */
Layer3d.prototype.createLegend = async function () {
    const styleObject = styleList.returnStyleObject(this.get("styleId"));
    let legend = this.inspectLegendUrl();

    if (!Array.isArray(legend)) {
        if (styleObject && legend === true) {
            const legendInfos = await createStyle.returnLegendByStyleId(styleObject.styleId),
                type = this.layer?.getSource().getFeatures()[0].getGeometry().getType(),
                typeSpecificLegends = [];

            if (type === "MultiLineString") {
                typeSpecificLegends.push(legendInfos.legendInformation.find(element => element.geometryType === "LineString"));
                legend = typeSpecificLegends;
            }
            else {
                typeSpecificLegends.push(legendInfos.legendInformation.find(element => element.geometryType === type));
                legend = typeSpecificLegends;
            }

            legend = legendInfos.legendInformation;
        }
        else if (typeof legend === "string") {
            legend = [legend];
        }
    }

    return legend;
};
