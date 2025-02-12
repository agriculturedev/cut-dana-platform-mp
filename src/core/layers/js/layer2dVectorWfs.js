import {bbox, all} from "ol/loadingstrategy.js";
import {wfs} from "@masterportal/masterportalapi";
import Layer2dVector from "./layer2dVector";

/**
 * Creates a 2d vector wfs (Web Feature Service) layer.
 * @name Layer2dVectorWfs
 * @constructs
 * @extends Layer2dVector
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVectorWfs (attributes) {
    const defaultAttributes = {
        crs: mapCollection.getMapView("2D").getProjection().getCode(),
        outputFormat: "XML",
        version: "1.1.0"
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2dVector.call(this, this.attributes);
    this.prepareFeaturesFor3D(this.layer?.getSource().getFeatures());
}

Layer2dVectorWfs.prototype = Object.create(Layer2dVector.prototype);

/**
 * Creates a layer of type WFS by using wfs-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dVectorWfs.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes),
        layerParams = this.getLayerParams(attributes),
        options = this.getOptions(attributes);

    if (attributes.fitCapabilitiesExtent && attributes.visibility && !attributes.encompassingBoundingBox) {
        if (!attributes.capabilitiesUrl) {
            console.warn("Please add a capabilitiesUrl for your layer configuration if you want to use fitCapabilitiesExtent!");
        }
        else {
            this.requestCapabilitiesToFitExtent();
        }
    }

    this.setLayer(wfs.createLayer(rawLayerAttributes, {layerParams, options}));
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dVectorWfs.prototype.getRawLayerAttributes = function (attributes) {
    return {
        clusterDistance: attributes.clusterDistance,
        crs: attributes.crs,
        featureNS: attributes.featureNS,
        featureType: attributes.featureType,
        id: attributes.id,
        url: attributes.url,
        version: attributes.version
    };
};

/**
 * Gets additional options.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The options.
 */
Layer2dVectorWfs.prototype.getOptions = function (attributes) {
    const options = {
        clusterGeometryFunction: this.clusterGeometryFunction,
        doNotLoadInitially: attributes.doNotLoadInitially,
        featuresFilter: (features) => this.featuresFilter(attributes, features),
        loadingParams: this.loadingParams(attributes),
        loadingStrategy: attributes.loadingStrategy === "all" ? all : bbox,
        onLoadingError: this.onLoadingError,
        wfsFilter: attributes.wfsFilter,
        style: this.getStyleFunction(attributes)
    };

    return options;
};
/**
 * Load the features manually.
 * @param {Object} attributes The new attributes.
 * @returns {void}
 */
Layer2dVectorWfs.prototype.loadFeaturesManually = function (attributes) {
    wfs.loadFeaturesManually(this.getRawLayerAttributes(attributes), this.layer.getSource());
};
