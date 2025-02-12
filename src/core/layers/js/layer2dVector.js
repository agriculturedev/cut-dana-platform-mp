import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import {getCenter} from "ol/extent";
import webgl from "./webglRenderer";
import store from "../../../app-store";
import Layer2d from "./layer2d";
import Cluster from "ol/source/Cluster";
import Style from "ol/style/Style";

/**
 * Creates a 2d vector layer.
 * @name Layer2dVector
 * @abstract
 * @constructs
 * @extends Layer2d
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVector (attributes) {
    const defaultAttributes = {
        altitudeMode: "clampToGround",
        renderer: "default",
        styleId: "default"
    };

    this.geometryTypeRequestLayers = [];
    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2d.call(this, this.attributes);
    // override class methods for webgl rendering
    // has to happen before setStyle
    if (attributes.renderer === "webgl") {
        webgl.setLayerProperties(this);
    }
    this.initStyle(attributes);
}

Layer2dVector.prototype = Object.create(Layer2d.prototype);

/**
 * Sets values to the ol layer.
 * @param {Object} attributes The new attributes.
 * @returns {void}
 */
Layer2dVector.prototype.updateLayerValues = function (attributes) {
    this.getLayer()?.setOpacity((100 - attributes.transparency) / 100);
    this.getLayer()?.setVisible(attributes.visibility);
    this.getLayer()?.setZIndex(attributes.zIndex);
    this.controlAutoRefresh(attributes);

    if (this.get("typ") === "WFS" || this.get("typ") === "OAF" || this.get("typ") === "GeoJSON") {
        if (store.getters["Maps/mode"] === "3D" && this.layerSource.getFeatures().length === 0) {
            this.loadFeaturesManually(attributes);
        }
    }
    if (attributes.fitCapabilitiesExtent && attributes.visibility && !attributes.encompassingBoundingBox) {
        if (!attributes.capabilitiesUrl) {
            console.warn("Please add a capabilitiesUrl for your layer configuration if you want to use fitCapabilitiesExtent!");

        }
        else {
            this.requestCapabilitiesToFitExtent();
            attributes.encompassingBoundingBox = true;
        }
    }
    else if (attributes.fitCapabilitiesExtent && !attributes.visibility && attributes.encompassingBoundingBox) {
        attributes.encompassingBoundingBox = false;
    }
};

/**
 * Gets the cluster feature geometry.
 * Note: Do not cluster invisible features;
 * can't rely on style since it will be null initially.
 * @param {module:ol/Feature~Feature} feature The ol feature.
 * @returns {module:ol/geom/Point~Point} The feature geometry.
 */
Layer2dVector.prototype.clusterGeometryFunction = function (feature) {
    if (feature.get("hideInClustering") === true) {
        return null;
    }

    return feature.getGeometry();
};

/**
 * Returns a function to filter features with.
 * Note: only use features with a geometry.
 * @param {Object} attributes The attributes of the layer configuration.
 * @param {module:ol/Feature~Feature[]} features The ol features.
 * @returns {module:ol/Feature~Feature[]} to filter features with
 */
Layer2dVector.prototype.featuresFilter = function (attributes, features) {
    let filteredFeatures = features.filter(feature => feature.getGeometry() !== undefined);

    if (attributes.bboxGeometry) {
        filteredFeatures = filteredFeatures.filter(
            (feature) => attributes.bboxGeometry.intersectsCoordinate(getCenter(feature.getGeometry().getExtent()))
        );
    }

    return filteredFeatures;
};

/**
 * Gets additional layer params.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The layer params.
 */
Layer2dVector.prototype.getLayerParams = function (attributes) {
    return {
        altitudeMode: attributes.altitudeMode,
        gfiAttributes: attributes.gfiAttributes,
        gfiTheme: attributes.gfiTheme,
        name: attributes.name,
        opacity: (100 - attributes.transparency) / 100,
        typ: attributes.typ,
        zIndex: attributes.zIndex,
        renderer: attributes.renderer, // use "default" (canvas) or "webgl" renderer
        styleId: attributes.styleId, // styleId to pass to masterportalapi
        style: attributes.style, // style function to style the layer or WebGLPoints style syntax
        excludeTypesFromParsing: attributes.excludeTypesFromParsing, // types that should not be parsed from strings, only necessary for webgl
        isPointLayer: attributes.isPointLayer, // whether the source will only hold point data, only necessary for webgl
        gfiThemeSettings: attributes.gfiThemeSettings // for accessing additional theme settings
    };
};

/**
 * Gets the loading params.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The loading Params.
 */
Layer2dVector.prototype.loadingParams = function (attributes) {
    const loadingParams = {
        xhrParameters: attributes.isSecured ? {credentials: "include"} : undefined,
        propertyname: this.propertyNames(attributes) || undefined,
        // only used if loading strategy is all
        bbox: attributes.bboxGeometry ? attributes.bboxGeometry.getExtent().toString() : undefined
    };

    return loadingParams;
};

/**
 * Returns the propertyNames as comma separated string.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {String} The propertynames as string.
 */
Layer2dVector.prototype.propertyNames = function (attributes) {
    let propertyname = "";

    if (Array.isArray(attributes.propertyNames)) {
        propertyname = attributes.propertyNames.join(",");
    }

    return propertyname;
};

/**
 * Print the on loading error message.
 * @param {Error} error The error message.
 * @returns {void}
 */
Layer2dVector.prototype.onLoadingError = function (error) {
    console.error("Masterportal wfs loading error: ", error);
};

/**
 * Setter for style of ol layer.
 * @param {Object} value The style to set at ol layer. If value is null, undefined is set as style at layer to use defaultStyle.
 * @returns {void}
 */
Layer2dVector.prototype.setStyle = function (value) {
    const style = value === null ? undefined : value;

    this.set("style", value);
    this.getLayer()?.setStyle(style);
};

/**
 * Initializes the style for this layer. If styleId is set, this is done after vector styles are loaded.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
Layer2dVector.prototype.initStyle = async function (attrs) {
    if (store.getters.styleListLoaded) {
        this.createStyle(attrs);
    }
    else {
        store.watch((state, getters) => getters.styleListLoaded, value => {
            if (value) {
                this.createStyle(attrs);
            }
        });
    }
};

/**
 * Creates the style function.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
Layer2dVector.prototype.createStyle = async function (attrs) {
    const styleId = attrs.styleId,
        styleObject = styleList.returnStyleObject(styleId);

    if (styleObject !== undefined) {
        /**
         * Returns style function to style fature.
         * @param {ol.Feature} feature the feature to style
         * @returns {Function} style function to style fature
         */
        const style = (feature) => {
            const feat = feature !== undefined ? feature : this,
                isClusterFeature = typeof feat.get("features") === "function" || typeof feat.get("features") === "object" && Boolean(feat.get("features"));

            return createStyle.createStyle(styleObject, feat, isClusterFeature, Config.wfsImgPath);
        };

        this.setStyle(style);
    }
    else {
        console.warn(i18next.t("common:core.layers.errorHandling.wrongStyleId", {styleId}));
    }
};

/**
 * Returns the style function of this layer to be called with feature.
 * @returns {Object} the style function
 */
Layer2dVector.prototype.getStyleFunction = function () {
    return this.get("style");
};
/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
Layer2dVector.prototype.showFeaturesByIds = function (featureIdList) {
    const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
        allLayerFeatures = layerSource.getFeatures(),
        featuresToShow = featureIdList.map(id => layerSource.getFeatureById(id));

    this.hideAllFeatures();
    featuresToShow.forEach(feature => {
        const style = this.getStyleAsFunction(this.get("style"));

        if (feature && feature !== null) {
            feature.set("hideInClustering", false);
            feature.setStyle(style(feature));
        }
    });

    layerSource.addFeatures(allLayerFeatures);
};

/**
 * Hides all features by setting style= null for all features.
 * @returns {void}
 */
Layer2dVector.prototype.hideAllFeatures = function () {
    const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
        features = layerSource.getFeatures();

    // optimization - clear and re-add to prevent cluster updates on each change
    layerSource.clear();

    features.forEach((feature) => {
        feature.set("hideInClustering", true);
        feature.setStyle(new Style());
    });

    layerSource.addFeatures(features);
};

/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} - style as function.
 */
Layer2dVector.prototype.getStyleAsFunction = function (style) {
    if (typeof style === "function") {
        return style;
    }

    return function () {
        return style;
    };
};

/**
 * Creates the legend
 * @returns {void}
 */
Layer2dVector.prototype.createLegend = async function () {
    const styleObject = styleList.returnStyleObject(this.attributes.styleId),
        rules = styleObject?.rules,
        isSecured = typeof this.attributes.isSecured === "boolean" ? this.attributes.isSecured : false;
    let legend = this.inspectLegendUrl();

    if (!Array.isArray(legend)) {
        if (styleObject && legend === true) {

            const legendInfos = await createStyle.returnLegendByStyleId(styleObject.styleId);

            if (styleObject.styleId === "default") {
                const type = this.layer.getSource().getFeatures()[0].getGeometry().getType(),
                    typeSpecificLegends = [];

                if (type === "MultiLineString") {
                    typeSpecificLegends.push(legendInfos.legendInformation?.find(element => element.geometryType === "LineString"));
                    legend = typeSpecificLegends;
                }
                else {
                    typeSpecificLegends.push(legendInfos.legendInformation?.find(element => element.geometryType === type));
                    legend = typeSpecificLegends;
                }
            }
            else {
                if (!this.geometryTypeRequestLayers.includes(this.get("id"))) {
                    this.geometryTypeRequestLayers.push(this.get("id"));
                    getGeometryTypeFromService.getGeometryTypeFromWFS(rules, this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"), isSecured, Config.wfsImgPath,
                        (geometryTypes, error) => {
                            if (error) {
                                store.dispatch("Alerting/addSingleAlert", "<strong>" + i18next.t("common:core.layers.errorHandling.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
                                    + "<small>" + i18next.t("common:core.layers.errorHandling.getGeometryTypeFromWFSFetchfailedMessage") + "</small>");
                            }
                            return geometryTypes;
                        });
                }
                if (rules && rules[0]?.conditions !== undefined && this.layer.getSource().getFeatures()) {
                    legend = this.filterUniqueLegendInfo(this.layer.getSource().getFeatures(), rules, legendInfos.legendInformation);
                }
                else {
                    legend = legendInfos.legendInformation;
                }
            }
        }
        else if (typeof legend === "string") {
            legend = [legend];
        }
    }

    return legend;
};

/**
 * Filters unique legend information
 * @param {Object} features selected features
 * @param {Object} rules  the styleObject rules
 * @param {Object} legendInfos styleObject legend information
 * @returns {Object[]} uniqueLegendInformation as array
 */
Layer2dVector.prototype.filterUniqueLegendInfo = function (features, rules, legendInfos) {
    if (!features.length) {
        return legendInfos;
    }
    const rulesKey = Object.keys(rules[0].conditions.properties)[0],
        conditionProperties = [...new Set(features.map(feature => feature.get(rulesKey)))];
    let uniqueLegendInformation = [];

    rules.forEach(rule => {
        const ruleValue = rule.conditions?.properties[rulesKey],
            value = String(ruleValue);
        let legendInformation;

        if (Array.isArray(ruleValue) && ruleValue.length === 2
            && conditionProperties.some(conditionValue => Number(conditionValue) >= ruleValue[0] && Number(conditionValue) < ruleValue[1])) {
            legendInformation = legendInfos.find(legendInfo => legendInfo?.label === rule.style?.legendValue);
        }
        else if (conditionProperties.includes(value)) {
            legendInformation = legendInfos.find(legendInfo => legendInfo?.label === (rule.style?.legendValue || value));
        }
        if (typeof legendInformation !== "undefined") {
            uniqueLegendInformation.push(legendInformation);
        }
    });

    if (uniqueLegendInformation.length === 0) {
        uniqueLegendInformation = legendInfos;
    }

    return uniqueLegendInformation;
};

