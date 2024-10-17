import {getCenter} from "ol/extent";
import createLayerAddToTreeModule from "../../../shared/js/utils/createLayerAddToTree";

export default {

    /**
     * Click event that gets triggered when clicking on a feature in the list view.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} featureIndex index of the clicked Feature
     * @returns {void}
     */
    clickOnFeature ({state, commit, dispatch, getters, rootGetters}, featureIndex) {
        if (featureIndex !== "" && featureIndex >= 0 && featureIndex <= state.shownFeatures) {
            const feature = getters.selectedFeature(featureIndex),
                featureGeometry = feature.getGeometry(),
                styleObj = getters.getGeometryType?.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine;

            commit("setSelectedFeatureIndex", featureIndex);
            dispatch("switchToDetails");

            if (styleObj && styleObj.zoomLevel) {
                if (featureGeometry && typeof featureGeometry.getType === "function") {
                    if (featureGeometry.getType() === "Point") {
                        dispatch("Maps/zoomToCoordinates", {center: featureGeometry.getCoordinates()}, {root: true});
                    }
                    else {
                        dispatch("Maps/zoomToCoordinates", {center: getCenter(featureGeometry.getExtent())}, {root: true});
                    }
                    dispatch("Maps/setZoom", styleObj.zoomLevel, {root: true});
                }
            }
            if (rootGetters.treeHighlightedFeatures?.active) {
                createLayerAddToTreeModule.createLayerAddToTree(state.layer.id, [feature], rootGetters.treeHighlightedFeatures);
            }
        }
    },
    /**
     * Hover event that gets triggered when hovering over a feature in the list view.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {String} featureIndex index of the clicked Feature
     * @returns {void}
     */
    hoverOverFeature ({state, dispatch, getters}, featureIndex) {
        if (featureIndex !== "" && featureIndex >= 0 && featureIndex <= state.shownFeatures) {
            const feature = getters.selectedFeature(featureIndex);

            dispatch("highlightFeature", feature);
        }
    },
    /**
     * Highlights a feature depending on its geometryType.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} feature the feature to be highlighted.
     * @returns {void}
     */
    highlightFeature ({state, dispatch, getters, rootGetters}, feature) {
        dispatch("Maps/removeHighlightFeature", "decrease", {root: true});
        const layerConfig = rootGetters.layerConfigById(state.layer.id),
            styleObj = getters.getGeometryType?.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine,
            featureGeometryType = feature.getGeometry().getType(),
            highlightObject = {
                type: featureGeometryType === "Point" || featureGeometryType === "MultiPoint" ? "increase" : "highlightPolygon",
                id: feature.getId(),
                layer: {id: state.layer.id},
                feature: feature,
                scale: styleObj.image?.scale
            };

        if (featureGeometryType === "LineString") {
            highlightObject.type = "highlightLine";
        }
        if (styleObj.zoomLevel) {
            highlightObject.zoomLevel = styleObj.zoomLevel;
        }
        if (layerConfig && layerConfig.styleId) {
            highlightObject.styleId = layerConfig.styleId;
        }

        highlightObject.highlightStyle = {
            fill: styleObj.fill,
            stroke: styleObj.stroke,
            image: styleObj.image
        };
        dispatch("Maps/highlightFeature", highlightObject, {root: true});
    },
    /**
     * Switches back to the feature list of the selected layer.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    switchBackToList ({state, commit}) {
        if (state.layer) {
            commit("setLayerListView", false);
            commit("setFeatureDetailView", false);
            commit("setFeatureListView", true);
        }
    },
    /**
     * Switches to the feature list of the selected layer.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} layer reduced selected layer, only contains name, id and geometryType
     * @returns {void}
     */
    switchToList ({state, commit, dispatch}, layer) {
        commit("setLayer", layer);
        if (layer) {
            commit("setGfiFeaturesOfLayer");
            commit("setFeatureCount", state.gfiFeaturesOfLayer.length);
            commit("setShownFeatures", state.gfiFeaturesOfLayer.length < state.maxFeatures ? state.gfiFeaturesOfLayer.length : state.maxFeatures);
            dispatch("switchBackToList");
        }
    },
    /**
     * Switches to the details list of the selected feature.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    switchToDetails ({state, commit}) {
        if (state.selectedFeatureIndex !== null) {
            commit("setLayerListView", false);
            commit("setFeatureListView", false);
            commit("setFeatureDetailView", true);
        }
    },
    /**
     * Switches to the themes list of all visibile layers and resets the featureList and the selectedFeature.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    switchToThemes ({commit}) {
        commit("resetToThemeChooser");
    },
    /**
     * Expands the feature list to show more features.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    showMore ({state, commit}) {
        const numberOfFeaturesToShow = state.shownFeatures < state.featureCount - 10 ? state.shownFeatures + 10 : state.featureCount;

        commit("setShownFeatures", numberOfFeaturesToShow);
    }
};

