import {geojson} from "@masterportal/masterportalapi";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import Layer2dVector from "./layer2dVector";

/**
 * Creates a 2d vector geojson layer.
 * @name Layer2dVectorGeojson
 * @constructs
 * @extends Layer2dVector
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVectorGeojson (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2dVector.call(this, this.attributes);
}

Layer2dVectorGeojson.prototype = Object.create(Layer2dVector.prototype);

/**
 * Creates a layer of type Geojson by using geojson-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dVectorGeojson.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes),
        layerParams = this.getLayerParams(attributes),
        options = this.getOptions(attributes);

    this.setLayer(geojson.createLayer(rawLayerAttributes, {layerParams, options}));
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dVectorGeojson.prototype.getRawLayerAttributes = function (attributes) {
    return {
        clusterDistance: attributes.clusterDistance,
        features: attributes.geojson,
        id: attributes.id,
        url: attributes.url
    };
};

/**
 * Gets additional options.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The options.
 */
Layer2dVectorGeojson.prototype.getOptions = function (attributes) {
    const options = {
        afterLoading: (features) => this.afterLoading(attributes, features),
        clusterGeometryFunction: this.clusterGeometryFunction,
        featuresFilter: (features) => this.featuresFilter(attributes, features),
        map: mapCollection.getMap("2D"),
        onLoadingError: this.onLoadingError,
        layerStyle: this.getStyleFunction(attributes)
    };

    return options;
};

/**
 * Prepare feature ids after loading of geojson.
 * @param {Object} attributes The attributes of the layer configuration.
 * @param {module:ol/Feature~Feature[]} features The ol features.
 * @returns {void}
 */
Layer2dVectorGeojson.prototype.afterLoading = function (attributes, features) {
    if (Array.isArray(features)) {
        features.forEach((feature, idx) => {
            if (typeof feature?.getId === "function" && typeof feature.getId() === "undefined") {
                feature.setId("geojson-" + attributes.id + "-feature-id-" + idx);
            }
        });
        this.prepareFeaturesFor3D(this.layer?.getSource().getFeatures());
    }
};

/**
 * Creates the legend.
 * @returns {void}
 */
Layer2dVectorGeojson.prototype.createLegend = async function () {
    const styleObject = styleList.returnStyleObject(this.get("styleId"));
    let legend = this.inspectLegendUrl();

    if (!Array.isArray(legend)) {
        if (styleObject && legend === true) {
            const legendInfos = await createStyle.returnLegendByStyleId(styleObject.styleId);

            legend = legendInfos.legendInformation;

        }
        else if (typeof legend === "string") {
            legend = [legend];
        }
    }

    return legend;
};

/**
 * Load the features manually.
 * @param {Object} attributes The new attributes.
 * @returns {void}
 */
Layer2dVectorGeojson.prototype.loadFeaturesManually = function (attributes) {
    geojson.loadFeaturesManually(this.getRawLayerAttributes(attributes), this.layer.getSource());
};

