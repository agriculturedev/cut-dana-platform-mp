import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import layerCollection from "../../layers/js/layerCollection";
import {nextTick} from "vue";

export default {
    /**
     * Determines the appropriate action to highlight a feature based on the type specified in the highlightObject.
     * This function acts as a dispatcher that delegates the highlighting task to specific functions based on the type.
     *
     * @param {Object} context - The Vuex action context, which includes dispatch among other properties.
     * @param {Object} highlightObject - An object containing information on how the feature should be highlighted.
     * @param {string} highlightObject.type - The type of highlighting action to perform. This determines which highlighting function will be called.
     * @param {Array} [highlightObject.layerIdAndFeatureId] - An optional array containing layer ID and feature ID, used when type is 'viaLayerIdAndFeatureId'.
     * @returns {void}
     */
    highlightFeature ({dispatch}, highlightObject) {
        switch (highlightObject.type) {
            case "increase":
                dispatch("increaseFeature", highlightObject);
                break;
            case "viaLayerIdAndFeatureId":
                dispatch("highlightViaParametricUrl", highlightObject.layerIdAndFeatureId);
                break;
            case "highlightPolygon":
            case "highlightMultiPolygon":
                dispatch("highlightPolygonTypes", highlightObject);
                break;
            case "highlightLine":
                dispatch("highlightLine", highlightObject);
                break;
            default:
                console.warn(`Unrecognized highlight type: ${highlightObject.type}`);
                break;
        }
    },

    /**
     * Highlights a geometry feature (Polygon or MultiPolygon) based on the provided highlightObject.
     * This function can either apply a new style to the feature or place a marker on it,
     * depending on the presence of a highlightStyle within the highlightObject.
     *
     * @param {Object} context - The Vuex action context, which includes commit and dispatch among other properties.
     * @param {Object} highlightObject - An object containing information on how the geometry feature should be highlighted.
     * @param {Object} [highlightObject.highlightStyle] - An optional style object to apply to the feature. If not provided, a default marker will be placed on the feature.
     * @param {ol/Feature} highlightObject.feature - The OpenLayers feature object representing the geometry to be highlighted.
     * @returns {void}
     */
    async highlightPolygonTypes ({commit, dispatch}, highlightObject) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            styleObjectPayload = {highlightObject, feature, returnFirst: feature.getGeometry().getType() !== "MultiPolygon"},
            originalStyle = await dispatch("fetchAndApplyStyle", styleObjectPayload) || undefined;

        if (originalStyle) {
            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (Array.isArray(originalStyle)) {
                const clonedStyles = originalStyle.map(style => {
                    const clonedStyle = style.clone();

                    applyStyleProperties(clonedStyle, newStyle);
                    return clonedStyle;
                });

                feature.setStyle(clonedStyles);
            }
            else {
                const clonedStyle = originalStyle.clone();

                applyStyleProperties(clonedStyle, newStyle);
                feature.setStyle(clonedStyle);
            }
        }
        else if (highlightObject.layer.id === "importDrawLayer") {
            const clonedStyle = typeof feature.getStyle() === "object" ? feature.getStyle()?.clone() : undefined;

            dispatch("setHighlightStyleToFeature", {feature, clonedStyle, newStyle});
        }
        else {
            dispatch("Maps/placingPolygonMarker", feature, {root: true});
        }
    },

    /**
     * Applies highlighting to a line feature. Similar to highlightPolygon, it clones and applies a provided custom style to the feature if available.
     * If no custom style is provided, it dispatches an action to place a default line marker.
     *
     * @param {Object} context - The Vuex action context, which includes commit and dispatch methods among others.
     * @param {Object} highlightObject - An object containing information on how the line feature should be highlighted.
     * @param {Object} [highlightObject.highlightStyle] - An optional style object to apply to the line feature.
     * @param {Object} highlightObject.feature - The line feature to be highlighted.
     * @returns {void}
     */
    async highlightLine ({dispatch}, highlightObject) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            styleObjectPayload = {highlightObject, feature},
            originalStyle = await dispatch("fetchAndApplyStyle", styleObjectPayload) || undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            dispatch("setHighlightStyleToFeature", {feature, clonedStyle, newStyle});
        }
        else if (highlightObject.layer.id === "importDrawLayer") {
            const clonedStyle = typeof feature.getStyle() === "object" ? feature.getStyle()?.clone() : undefined;

            dispatch("setHighlightStyleToFeature", {feature, clonedStyle, newStyle});
        }
        else {
            dispatch("Maps/placingPolygonMarker", feature, {root: true});
        }
    },

    /**
     * Highlights a feature by using layer ID and feature ID provided in the URL.
     * This function retrieves the specified feature using `getHighlightFeature`
     * and, if the feature is found, dispatches an action to place a polygon marker on the map.
     * @param {Object} context - The Vuex action context, which provides access to Vuex `dispatch` method.
     * @param {Array} layerIdAndFeatureId - An array containing the layer ID as the first element and the feature ID as the second element.
     * @returns {Promise<void>} A promise that resolves once the feature has been highlighted or when there's no feature to highlight.
     */
    async highlightViaParametricUrl ({dispatch}, layerIdAndFeatureId) {
        if (layerIdAndFeatureId) {
            const getHighlightFeaturePayload = {layerId: layerIdAndFeatureId[0], featureId: layerIdAndFeatureId[1]},
                feature = await dispatch("getHighlightFeature", getHighlightFeaturePayload);

            if (feature) {
                dispatch("Maps/placingPolygonMarker", feature, {root: true});
            }
        }
    },

    /**
     * increases the icon of the feature
     * @param {Function} commit commit function
     * @param {Object} highlightObject contains several parameters for feature highlighting
     * @returns {void}
     */
    async increaseFeature ({commit, dispatch}, highlightObject) {
        const scaleFactor = highlightObject.scale ? highlightObject.scale : 1.5,
            getHighlightFeaturePayload = {layerId: highlightObject.layer?.id, featureId: highlightObject.id},
            styleObjectPayload = {highlightObject: highlightObject, feature: highlightObject.feature},
            featureStyle = await dispatch("fetchAndApplyStyle", styleObjectPayload);

        let feature = highlightObject.feature,
            clonedStyle = featureStyle ? featureStyle.clone() : null,
            clonedImage = null;

        if (!feature) {
            feature = await dispatch("getHighlightFeature", getHighlightFeaturePayload);
        }

        if (!feature) {
            console.warn(`Feature not found for layerId: ${getHighlightFeaturePayload.layerId} and featureId: ${getHighlightFeaturePayload.featureId}`);
            return;
        }

        if (!clonedStyle) {
            if (typeof feature.getStyle()?.clone === "function") {
                clonedStyle = feature.getStyle()?.clone();
            }
            else {
                clonedStyle = {...feature.getStyle()};
            }
        }

        clonedImage = clonedStyle && typeof clonedStyle.getImage === "function" ? clonedStyle.getImage() : undefined;

        if (clonedImage) {
            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (clonedStyle.getText()) {
                clonedStyle.getText().setScale(scaleFactor);
            }

            clonedImage.setScale(clonedImage.getScale() * scaleFactor);
            if (highlightObject?.highlightStyle?.fill && highlightObject?.highlightStyle?.fill?.color && typeof clonedImage.getFill === "function") {
                clonedImage.getFill().setColor(highlightObject.highlightStyle.fill.color);
            }
            feature.setStyle(clonedStyle);
        }
    },

    /**
     * Asynchronously retrieves a feature by its layer ID and feature ID from the specified layer source.
     * If the layer's features are not yet loaded, it waits for the 'featuresloadend' event before attempting to find the feature again.
     *
     * @param {Object} context - The Vuex action context.
     * @param {Object} payload - The payload containing the layer ID and feature ID.
     * @param {String} payload.layerId - The ID of the layer to search for the feature.
     * @param {String} payload.featureId - The ID of the feature to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to the found feature, or `null` if the feature is not found.
     */
    async getHighlightFeature (context, {layerId, featureId}) {
        let feature = null;

        await nextTick();
        const layerSource = layerCollection.getLayerById(layerId)?.layerSource;

        if (layerSource) {
            if (layerSource.getFeatures().length > 0) {
                feature = layerSource.getFeatureById(featureId) ||
                layerSource.getFeatures().find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
            }
            else {
                await new Promise(resolve => {
                    layerSource.once("featuresloadend", () => {
                        feature = layerSource.getFeatureById(featureId) ||
                        layerSource.getFeatures().find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
                        resolve();
                    });
                });
            }
        }

        return feature;
    },

    /**
     * Retrieves and applies a style from the styleList based on the provided highlightObject and feature.
     * The style is then optionally committed to the Vuex store.
     *
     * @param {Object} context - The Vuex action context.
     * @param {Object} payload - The payload containing the highlightObject and the feature.
     * @param {Object} payload.highlightObject - Contains parameters for feature highlighting.
     * @param {ol/feature} payload.feature - OpenLayers feature to highlight.
     * @param {Boolean} [payload.returnFirst=true] - If true, returns the first found style, otherwise all created styles.
     * @returns {Promise<ol/style|Array>} A promise that resolves to the OpenLayers style or an array of styles.
     */
    async fetchAndApplyStyle (context, {highlightObject, feature, returnFirst = true}) {
        const styleId = highlightObject.styleId || highlightObject.layer.id,
            stylelistObject = styleList.returnStyleObject(styleId);
        let style;

        if (stylelistObject) {
            style = createStyle.createStyle(stylelistObject, feature, false, Config.wfsImgPath);
            if (returnFirst && Array.isArray(style) && style.length > 0) {
                style = style[0];
            }

            return style;
        }

        console.warn(`Style not found for styleId: ${styleId}`);
        return null;
    },

    /**
     * Sets the highlight style to a feature
     * @param {Object} context - The Vuex action context, which provides access to Vuex `commit` method.
     * @param {Object} payload - The payload containing the feature, the cloned and the new style.
     * @param {ol/feature} payload.feature - OpenLayers feature to highlight.
     * @param {ol/style} payload.clonedStyle - the "normal" style for the feature (if there is one).
     * @param {ol/style} payload.newStyle - the new hightlight style for the feature.
     * @returns {void}
     */
    async setHighlightStyleToFeature ({commit}, {feature, clonedStyle, newStyle}) {
        commit("Maps/addHighlightedFeature", feature, {root: true});
        commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

        if (clonedStyle) {
            applyStyleProperties(clonedStyle, newStyle);
            feature.setStyle(clonedStyle);
        }
    }
};

/**
 * Applies style properties to a cloned style object.
 *
 * @param {ol/style/Style} clonedStyle - The cloned style object to modify.
 * @param {Object} newStyle - The new style properties to apply.
 * @returns {void}
 */
function applyStyleProperties (clonedStyle, newStyle) {
    if (newStyle.fill?.color) {
        clonedStyle.getFill().setColor(newStyle.fill.color);
    }
    if (newStyle.stroke?.width) {
        clonedStyle.getStroke().setWidth(newStyle.stroke.width);
    }
    if (newStyle.stroke?.color) {
        clonedStyle.getStroke().setColor(newStyle.stroke.color);
    }
    if (newStyle.stroke?.width) {
        clonedStyle.getStroke().setWidth(newStyle.stroke.width);
    }
    if (newStyle.stroke?.color) {
        clonedStyle.getStroke().setColor(newStyle.stroke.color);
    }
}
