import {all, bbox} from "ol/loadingstrategy.js";
import {oaf} from "@masterportal/masterportalapi";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import store from "../../../app-store";
import Layer2dVector from "./layer2dVector";

/**
 * Creates a 2d vector oaf (OGC API - Features) layer.
 * @name Layer2dVectorOaf
 * @constructs
 * @extends Layer2dVector
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVectorOaf (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2dVector.call(this, this.attributes);
    this.prepareFeaturesFor3D(this.layer?.getSource().getFeatures());
}

Layer2dVectorOaf.prototype = Object.create(Layer2dVector.prototype);

/**
 * Creates a layer of type Geojson by using geojson-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dVectorOaf.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes),
        layerParams = this.getLayerParams(attributes),
        options = this.getOptions(attributes);

    this.setLayer(oaf.createLayer(rawLayerAttributes, {layerParams, options}));
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dVectorOaf.prototype.getRawLayerAttributes = function (attributes) {
    const crs = attributes.crs === false || attributes.crs ? attributes.crs : "http://www.opengis.net/def/crs/EPSG/0/25832";

    return {
        bbox: attributes.bbox || Array.isArray(attributes.datasets) && attributes.datasets[0]?.bbox || store.getters["Maps/extent"],
        bboxCrs: attributes.bboxCrs || crs,
        clusterDistance: attributes.clusterDistance,
        collection: attributes.collection,
        crs: crs,
        datetime: attributes.datetime,
        id: attributes.id,
        limit: typeof attributes.limit === "undefined" ? 400 : attributes.limit,
        offset: attributes.offset,
        params: attributes.params,
        url: attributes.url
    };
};

/**
 * Gets additional options.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The options.
 */
Layer2dVectorOaf.prototype.getOptions = function (attributes) {
    const options = {
        clusterGeometryFunction: this.clusterGeometryFunction,
        featuresFilter: (features) => this.featuresFilter(attributes, features),
        loadingParams: this.loadingParams(attributes),
        loadingStrategy: attributes.loadingStrategy === "all" ? all : bbox,
        onLoadingError: this.onLoadingError,
        style: this.getStyleFunction(attributes)
    };

    return options;
};

/**
 * Creates the legend
 * @returns {void}
 */
Layer2dVectorOaf.prototype.createLegend = async function () {
    const styleObject = styleList.returnStyleObject(this.attributes.styleId),
        rules = styleObject?.rules;
    let legend = this.inspectLegendUrl();

    if (!Array.isArray(legend)) {
        if (styleObject && legend === true) {
            getGeometryTypeFromService.getGeometryTypeFromOAF(rules, this.get("url"), this.get("collection"), Config.wfsImgPath,
                (error) => {
                    if (error) {
                        store.dispatch("Alerting/addSingleAlert", "<strong>" + i18next.t("common:core.layers.errorHandling.getGeometryTypeFromOAFFetchfailed") + "</strong> <br>"
                        + "<small>" + i18next.t("common:core.layers.errorHandling.getGeometryTypeFromOAFFetchfailedMessage") + "</small>");
                    }
                });
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
Layer2dVectorOaf.prototype.loadFeaturesManually = function (attributes) {
    const attr = {...this.getRawLayerAttributes(attributes)};

    if (store.getters["Maps/mode"] === "3D") {
        // do not load bbox, load all features at once
        // see Issue https://lgv-hamburg.atlassian.net/browse/BG-5669
        attr.bbox = undefined;
    }
    oaf.loadFeaturesManually(attr, this.layer.getSource());
};
