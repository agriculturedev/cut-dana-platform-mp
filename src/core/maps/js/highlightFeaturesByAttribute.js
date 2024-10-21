import axios from "axios";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import {WFS} from "ol/format.js";

import layerCollection from "../../layers/js/layerCollection";
import {treeSubjectsKey} from "../../../shared/js/utils/constants";

export default {
    /**
     * User type definition
     * @typedef {Object} settings
     * @property {String} pointStyleId The id references the style.json for a point highlight features.
     * @property {String} polygonStyleId The id references the style.json for a polygon highlight features.
     * @property {String} lineStyleId The id references the style.json for a line highlight features.
     */
    settings: {
        pointStyleId: "defaultHighlightFeaturesPoint",
        polygonStyleId: "defaultHighlightFeaturesPolygon",
        lineStyleId: "defaultHighlightFeaturesLine"
    },

    /**
     * creates a vector layer
     * @param {String} styleId The style Id
     * @param {String} layerId The layer Id
     * @param {String} name Layer name
     * @param {Object} gfiAttributes GFI attributes configuration
     * @param {Function} dispatch dispatch function
     * @returns {Object} the created VectorLayer
    */
    createVectorLayer: async function (styleId, layerId, name, gfiAttributes, dispatch) {
        await dispatch("addLayerToLayerConfig", {
            layerConfig: {
                gfiAttributes: gfiAttributes,
                id: layerId,
                name: name,
                showInLayerTree: true,
                styleId: styleId,
                typ: "VECTORBASE",
                type: "layer",
                visibility: true
            },
            parentKey: treeSubjectsKey
        }, {root: true});

        return layerCollection.getLayerById(layerId)?.layer;
    },

    /**
     * highlight Features for Points
     * @param {String} styleId The styleId of the highlight-layer to create
     * @param {String} layerId The id of the highlight-layer to create
     * @param {String} name The name of the highlight-layer to create
     * @param {Object} rawLayer the raw layer
     * @param {Array} features The loaded WFS features
     * @param {Function} dispatch dispatch function
     * @param {Function} rootGetters rootGetters function
     * @returns {void}
    */
    highlightPointFeature: function (styleId, layerId, name, rawLayer, features, dispatch, rootGetters) {
        const styleObject = styleList.returnStyleObject(styleId),
            highlightFeatures = [];
        let hasPoint = false;

        features.forEach(feature => {
            const geometry = feature.getGeometry();

            if (styleObject && geometry.getType() === "Point") {
                hasPoint = true;
                const coordinate = geometry.getCoordinates(),
                    iconFeature = new Feature({
                        geometry: new Point(coordinate)
                    }),
                    featureStyle = createStyle.createStyle(styleObject, feature, false, Config.wfsImgPath);

                iconFeature.setProperties(feature.getProperties());
                iconFeature.setStyle(featureStyle);
                highlightFeatures.push(iconFeature);
            }
        });
        if (hasPoint) {
            this.showLayer(layerId, highlightFeatures, styleId, rawLayer, name, dispatch, rootGetters);
        }
    },

    /**
     * Creates a new layer with features and shows it in tree.
     * @param {String} layerId The id of the highlight-layer to create
     * @param {Object} highlightFeatures containing features to highlight
     * @param {String} styleId The styleId of the highlight-layer to create
     * @param {Object} rawLayer the raw layer
     * @param {String} name The name of the highlight-layer to create
     * @param {Function} dispatch dispatch function
     * @param {Function} rootGetters rootGetters function
     * @returns {void}
     */
    showLayer: async function (layerId, highlightFeatures, styleId, rawLayer, name, dispatch, rootGetters) {
        const highlightLayer = await this.createVectorLayer(styleId, layerId, rootGetters.treeHighlightedFeatures?.layerName || name, rawLayer.gfiAttributes, dispatch);

        highlightLayer.getSource().addFeatures(highlightFeatures);

        dispatch("Maps/zoomToExtent", {extent: highlightLayer.getSource().getExtent()}, {root: true});
    },

    /**
     * highlight Features / Line and Polygon
     * @param {String} styleId The styleId of the highlight-layer to create
     * @param {String} layerId The id of the highlight-layer to create
     * @param {String} name The name of the highlight-layer to create
     * @param {String} geometryRequested Polygon or LineString
     * @param {Object} rawLayer the raw layer
     * @param {Array} features The loaded WFS features
     * @param {Function} dispatch dispatch function
     * @param {Function} rootGetters rootGetters function
     * @returns {void}
    */
    highlightLineOrPolygonFeature: async function (styleId, layerId, name, geometryRequested, rawLayer, features, dispatch, rootGetters) {
        const styleObject = styleList.returnStyleObject(styleId),
            highlightFeatures = [];
        let hasGeometry = false;

        features.forEach(feature => {
            const geometry = feature.getGeometry();

            if (styleObject && geometry.getType() === geometryRequested) {
                hasGeometry = true;
                const newFeature = new Feature({
                        geometry: geometry
                    }),
                    featureStyle = createStyle.createStyle(styleObject, newFeature, false, Config.wfsImgPath);

                newFeature.setProperties(feature.getProperties());
                newFeature.setStyle(featureStyle);
                highlightFeatures.push(newFeature);
            }
        });

        if (hasGeometry) {
            this.showLayer(layerId, highlightFeatures, styleId, rawLayer, name, dispatch, rootGetters);
        }
    },

    /**
     * handles the error
     * @param {Function} dispatch dispatch function
     * @param {String} error - the given error
     * @returns {void}
    */
    handleGetFeatureError: function (dispatch, error) {
        console.error(error);
        dispatch("Alerting/addSingleAlert", i18next.t("common:core.maps.highlightFeaturesByAttribute.messages.requestFailed"), {root: true});
    },

    /**
     * handles the response from a wfs get feature request
     * @param {Function} dispatch dispatch function
     * @param {Function} rootGetters rootGetters function
     * @param {String} response - XML to be sent as String
     * @param {Object} highlightFeaturesLayer The configuration for the Layer.
     * @returns {void}
    */
    handleGetFeatureResponse: function (dispatch, rootGetters, response, highlightFeaturesLayer) {
        if (response.status !== 200) {
            console.warn(response.status);
            dispatch("Alerting/addSingleAlert", i18next.t("common:core.maps.highlightFeaturesByAttribute.messages.requestFailed"), {root: true});
            return;
        }
        const features = new WFS({version: highlightFeaturesLayer.version}).readFeatures(response.data);

        if (features.length === 0) {
            const parser = new DOMParser(),
                xmlDoc = parser.parseFromString(response.data, "text/xml"),
                exceptionText = xmlDoc.getElementsByTagNameNS("*", "ExceptionText").length > 0 ? xmlDoc.getElementsByTagNameNS("*", "ExceptionText")[0].childNodes[0].nodeValue : "";

            if (exceptionText) {
                console.error("highlightFeaturesByAttribute: service exception: " + exceptionText);
                dispatch("Alerting/addSingleAlert", i18next.t("common:core.maps.highlightFeaturesByAttribute.messages.requestFailed"), {root: true});
                return;
            }
        }

        this.highlightPointFeature(this.settings.pointStyleId, "highlight_point_layer", "highlightPoint", highlightFeaturesLayer, features, dispatch, rootGetters);
        this.highlightLineOrPolygonFeature(this.settings.polygonStyleId, "highlight_polygon_layer", "highlightPolygon", "Polygon", highlightFeaturesLayer, features, dispatch, rootGetters);
        this.highlightLineOrPolygonFeature(this.settings.lineStyleId, "highlight_line_layer", "highlightLine", "LineString", highlightFeaturesLayer, features, dispatch, rootGetters);
    },

    /**
     * builds the filter snippet for islike/equalto property searching
     * @param {Boolean} isEqual search method isEqual
     * @param {String} wildCard the configured wildCard character
     * @param {String} singleChar the configured singleChar character
     * @param {String} escapeChar the configured escapeChar character
     * @param {String} propPrefix the configured search prefix (e.g. app:)
     * @param {String} propName the property/type-Name
     * @param {String} propValue the value to search for
     * @returns {String} query snippet
    */
    getOGCFilterSnippet: function (isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue) {
        const propertyPrefix = propPrefix === undefined ? "" : propPrefix;
        let result = "";

        if (isEqual) {
            result = `<ogc:PropertyIsEqualTo matchCase='false' wildCard='${wildCard}' singleChar='${singleChar}' escapeChar='${escapeChar}'>
                <ogc:PropertyName>${propertyPrefix}${propName}</ogc:PropertyName>
                <ogc:Literal>${propValue}</ogc:Literal>
            </ogc:PropertyIsEqualTo>`;
        }
        else {
            result = `<ogc:PropertyIsLike matchCase='false' wildCard='${wildCard}' singleChar='${singleChar}' escapeChar='${escapeChar}'>
                <ogc:PropertyName>${propertyPrefix}${propName}</ogc:PropertyName>
                <ogc:Literal>${wildCard}${propValue}${wildCard}</ogc:Literal>
            </ogc:PropertyIsLike>`;
        }
        return result;
    },

    /**
     * builds the filter snippet for isin property searching
     * @param {String} valueDelimiter the configured value delimiter character
     * @param {String} wildCard the configured wildCard character
     * @param {String} singleChar the configured singleChar character
     * @param {String} escapeChar the configured escapeChar character
     * @param {String} propPrefix the configured search prefix (e.g. app:)
     * @param {String} propName the property/type-Name
     * @param {String} propValue the value to search for (,-separated)
     * @returns {String} query snippet
    */
    getOGCFilterSnippetIn: function (valueDelimiter, wildCard, singleChar, escapeChar, propPrefix, propName, propValue) {
        let result = "",
            value = "",
            delimiter = ";";

        if (valueDelimiter !== undefined && valueDelimiter.length === 1) {
            delimiter = valueDelimiter;
        }
        const propertyPrefix = propPrefix === undefined ? "" : propPrefix,
            valueItems = propValue.split(delimiter);

        if (valueItems.length >= 2) {
            result += "<ogc:Or>";
        }
        for (value of valueItems) {
            result += `<ogc:PropertyIsEqualTo matchCase='false' wildCard='${wildCard}' singleChar='${singleChar}' escapeChar='${escapeChar}'>
                <ogc:PropertyName>${propertyPrefix}${propName}</ogc:PropertyName>
                <ogc:Literal>${value}</ogc:Literal>
            </ogc:PropertyIsEqualTo>`;
        }
        if (valueItems.length >= 2) {
            result += "</ogc:Or>";
        }

        return result;
    },

    /**
     * builds the request body for WFS search
     * @param {String} featureType the feature queried
     * @param {String} version WFS version
     * @param {String} filterSnippet the snippet for the isLike/equalTo-Query
     * @returns {String} WFS request, complete body
    */
    getWFSQuery: function (featureType, version, filterSnippet) {
        const result = `<?xml version='1.0' encoding='UTF-8'?>
            <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='${version}'>
                <wfs:Query typeName='${featureType}'>
                    <ogc:Filter>
                        ${filterSnippet}
                    </ogc:Filter>
                </wfs:Query>
            </wfs:GetFeature>`;

        return result;
    },

    /**
     * checks for configuration errors and writes console warnings in case something is wrong
     * @param {Object} layer the WFS layer to check
     * @param {String} wfsId the wfsId to be checked
     * @returns {Boolean} error occured or not
    */
    configHasErrors: function (layer, wfsId) {
        if (!layer) {
            console.error("highlightFeaturesByAttribute: Layer with ID " + wfsId + " not found in Config");
            return true;
        }
        if (!layer.url) {
            console.error("highlightFeaturesByAttribute: Layer with ID " + wfsId + " has no url configured");
            return true;
        }
        if (!layer.wildCard || layer.wildCard?.length !== 1) {
            console.error("highlightFeaturesByAttribute: wildCard config setting must exist and be one character");
            return true;
        }
        if (!layer.singleChar || layer.singleChar?.length !== 1) {
            console.error("highlightFeaturesByAttribute: singleChar config setting must exist and be one character");
            return true;
        }
        if (!layer.escapeChar || layer.escapeChar?.length !== 1) {
            console.error("highlightFeaturesByAttribute: escapeChar config setting must exist and be one character");
            return true;
        }

        return false;
    },

    /**
     * highlight Features by Attributes
     * @param {Object} dispatch dispatch function
     * @param {Object} rootGetters rootGetters function
     * @param {String} wfsId the WFS Id
     * @param {String} propName the queried property name
     * @param {String} propValue the queried property value
     * @param {String} queryType the query type
     * @returns {void}
    */
    highlightFeaturesByAttribute: function (dispatch, rootGetters, wfsId, propName, propValue, queryType) {
        const layer = rootGetters.layerConfigById(wfsId),
            isEqual = queryType && queryType.toLowerCase() === "isequal",
            isIn = queryType && queryType.toLowerCase() === "isin",
            filterSnippet = this.getOGCFilterSnippet(isEqual,
                layer?.wildCard,
                layer?.singleChar,
                layer?.escapeChar,
                layer?.featurePrefix,
                propName,
                propValue);
        let requestBody = this.getWFSQuery(layer?.featureType, layer?.version, filterSnippet);

        if (isIn) {
            const filterSnippetIn = this.getOGCFilterSnippetIn(layer?.valueDelimiter,
                layer?.wildCard,
                layer?.singleChar,
                layer?.escapeChar,
                layer?.featurePrefix,
                propName,
                propValue);

            requestBody = this.getWFSQuery(layer?.featureType, layer?.version, filterSnippetIn);
        }

        if (this.configHasErrors(layer, wfsId)) {
            dispatch("Alerting/addSingleAlert", i18next.t("common:core.maps.highlightFeaturesByAttribute.messages.configurationError"), {root: true});
            return;
        }
        axios.post(layer.url, requestBody, {
            headers: {
                "Content-Type": "raw"
            },
            timeout: layer?.timeout,
            withCredentials: layer.isSecured
        })
            .then(response => {
                this.handleGetFeatureResponse(dispatch, rootGetters, response, layer);
            })
            .catch(error => this.handleGetFeatureError(dispatch, error));
    }
};
