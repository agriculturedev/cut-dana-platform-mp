import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";

/**
 * check how to highlight
 * @param {Object} param store context
 * @param {Object} param.commit the commit
 * @param {Object} param.dispatch the dispatch
 * @param {Object} param.getters the getters
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightFeature ({commit, dispatch, getters}, highlightObject) {
    if (highlightObject.type === "increase") {
        increaseFeature(commit, getters, highlightObject);
    }
    else if (highlightObject.type === "viaLayerIdAndFeatureId") {
        highlightViaParametricUrl(dispatch, getters, highlightObject.layerIdAndFeatureId);
    }
    else if (highlightObject.type === "highlightPoint") {
        highlightPoint(commit, dispatch, highlightObject);
    }
    else if (highlightObject.type === "highlightPolygon") {
        highlightPolygon(commit, dispatch, highlightObject);
    }
    else if (highlightObject.type === "highlightMultiPolygon") {
        highlightMultiPolygon(commit, dispatch, highlightObject);
    }
    else if (highlightObject.type === "highlightLine") {
        highlightLine(commit, dispatch, highlightObject);
    }
}

/**
 * highlights a Point feature
 * @param {Function} commit commit function
 * @param {Function} dispatch dispatch function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightPoint (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature) : undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (newStyle.fill?.color) {
                clonedStyle.getFill().setColor(newStyle.fill.color);
            }
            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
            }
            if (newStyle.image?.scale) {
                clonedStyle.getImage()?.setScale(newStyle.image.scale);
            }
            feature.setStyle(clonedStyle);
        }
    }
    else {
        dispatch("MapMarker/placingPolygonMarker", highlightObject.feature, {root: true});
    }
}

/**
 * highlights a polygon feature
 * @param {Function} commit commit function
 * @param {Function} dispatch dispatch function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightPolygon (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature) : undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (newStyle.fill?.color) {
                clonedStyle.getFill().setColor(newStyle.fill.color);
            }
            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
            }
            feature.setStyle(clonedStyle);
        }
    }
    else {
        dispatch("MapMarker/placingPolygonMarker", highlightObject.feature, {root: true});
    }

}
/** highlights a multipolygon feature
 * @param {Function} commit commit function
 * @param {Function} dispatch dispatch function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightMultiPolygon (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature),
            clonedStyles = [];

        if (originalStyle) {
            for (let i = 0; i < originalStyle.length; i++) {
                commit("Maps/addHighlightedFeature", feature, {root: true});
                commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {
                    root: true
                });
                const clonedStyle = originalStyle[i].clone();

                if (newStyle.fill?.color) {
                    clonedStyle.getFill().setColor(newStyle.fill.color);
                }
                if (newStyle.stroke?.width) {
                    clonedStyle.getStroke().setWidth(newStyle.stroke.width);
                }
                if (newStyle.stroke?.color) {
                    clonedStyle.getStroke().setColor(newStyle.stroke.color);
                }
                clonedStyles.push(clonedStyle);
            }
            feature.setStyle(clonedStyles);
        }
    }
    else {
        dispatch("MapMarker/placingPolygonMarker", highlightObject.feature, {
            root: true
        });
    }
}

/**
 * highlights a line feature
 * @param {Function} commit commit function
 * @param {Function} dispatch dispatch function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightLine (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature) : undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
            }
            feature.setStyle(clonedStyle);
        }
    }
    else {
        dispatch("MapMarker/placingPolygonMarker", highlightObject.feature, {root: true});
    }

}
/**
 * highlights a feature via layerid and featureid
 * @param {Object} dispatch the dispatch
 * @param {Object} getters the getters
 * @param {String} layerIdAndFeatureId contains layerid and featureid
 * @fires ModelList#RadioRequestModelListGetModelByAttributes
 * @returns {void}
 */
function highlightViaParametricUrl (dispatch, getters, layerIdAndFeatureId) {
    const features = [],
        featureToAdd = layerIdAndFeatureId;
    let layerId, params;

    if (featureToAdd) {
        params = featureToAdd.split(",");
        layerId = params.shift();

        params.forEach((featId) => {
            features.push(getHighlightFeature(layerId, featId, getters));
        });
    }
    if (features.length) {
        features.forEach(feature => {
            dispatch("MapMarker/placingPolygonMarker", feature, {root: true});
        });
    }
}
/**
 * Searches the feature which shall be hightlighted
 * @param {String} layerId Id of the layer, containing the feature to hightlight
 * @param {String} featureId Id of feature which shall be hightlighted
 * @param {Object} getters the getters
 * @fires ModelList#RadioRequestModelListGetModelByAttributes
 * @returns {ol/feature} feature to highlight
 */
function getHighlightFeature (layerId, featureId, getters) {
    const layer = getters.getLayerById({layerId});

    if (layer) {
        return layer.getSource().getFeatureById(featureId)
            || layer.getSource().getFeatures() // if feature clustered source find cluster the highlighted feature belongs to
                .find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
    }
    return undefined;
}
/**
 * increases the icon of the feature
 * @param {Function} commit commit function
 * @param {Function} getters map getters
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function increaseFeature (commit, getters, highlightObject) {
    const scaleFactor = highlightObject.scale ? highlightObject.scale : 1.5,
        feature = highlightObject.feature // given already
            ? highlightObject.feature
            : getHighlightFeature(highlightObject.layer?.id, highlightObject.id, getters); // get feature from layersource, incl. check against clustered features
    let clonedStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature).clone() : null,
        clonedImage = null;

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
        if (highlightObject?.highlightStyle?.fill && highlightObject?.highlightStyle?.fill?.color) {
            clonedImage.getFill().setColor(highlightObject.highlightStyle.fill.color);
        }
        feature.setStyle(clonedStyle);
    }
}
/**
 * Get style via styleList
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @param {ol/feature} feature openlayers feature to highlight
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {ol/style} ol style
 */
function styleObject (highlightObject, feature) {
    const stylelistObject = highlightObject.styleId ? styleList.returnStyleObject(highlightObject.styleId) : styleList.returnStyleObject(highlightObject.layer.id);
    let style;

    if (stylelistObject !== undefined) {
        style = createStyle.createStyle(stylelistObject, feature, false, Config.wfsImgPath);
    }
    return style;
}

export {highlightFeature};

