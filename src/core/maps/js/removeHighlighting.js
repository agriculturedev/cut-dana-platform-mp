import Feature from "ol/Feature";

/**
 * Resets highlighted feature style.
 *
 * @param {Object} context The Vuex context object, providing access to Vuex operations.
 * @param {module:ol/Feature} [feature] The feature to remove from the highlighted features. If none is given, all highlighted features will be removed.
 * @returns {void}
 */
async function removeHighlightFeature ({commit, state, dispatch}, feature) {
    if (feature && feature instanceof Feature) {
        const index = state.highlightedFeatures.indexOf(feature);

        if (index !== -1) {
            const highlightedFeatureStyle = state.highlightedFeatureStyles[index];

            state.highlightedFeatures[index].setStyle(highlightedFeatureStyle);
            commit("setHighlightedFeatureStyles", state.highlightedFeatureStyles.filter((style, i) => i !== index));
            commit("setHighlightedFeatures", state.highlightedFeatures.filter((feat, i) => i !== index));
        }
        else {
            switch (feature.getGeometry()?.getType()) {
                case "Point":
                {
                    dispatch("removePointMarker");
                    break;
                }
                case "Polygon":
                case "MultiPolygon":
                case "LineString":
                {
                    dispatch("removePolygonMarker");
                    break;
                }
                default:
                    break;
            }
        }
    }
    else {
        state.highlightedFeatureStyles?.forEach((style, index) => {
            state.highlightedFeatures[index].setStyle(style);
        });

        commit("setHighlightedFeatureStyles", []);
        commit("setHighlightedFeatures", []);
    }
}

export {removeHighlightFeature};
