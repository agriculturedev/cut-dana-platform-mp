import actionsMapsAttributesMapper from "./actionsMapsAttributesMapper.js";
import actionsMapsFeatureViaUrl from "./actionsMapsFeatureViaUrl.js";
import actionsMapsInteractions from "./actionsMapsInteractions.js";
import actionsMapsLayers from "./actionsMapsLayers.js";
import actionsMapsMapMode from "./actionsMapsMapMode.js";
import actionsMapsMarker from "./actionsMapsMarker.js";
import actionsMapsZoomTo from "./actionsMapsZoomTo.js";
import highlightFeature from "../js/highlightFeature.js";
import * as removeHighlightFeature from "../js/removeHighlighting.js";

/**
 * Actions with the Map and MapView.
 */
export default {
    ...actionsMapsAttributesMapper,
    ...actionsMapsFeatureViaUrl,
    ...actionsMapsInteractions,
    ...actionsMapsLayers,
    ...actionsMapsMapMode,
    ...actionsMapsMarker,
    ...actionsMapsZoomTo,
    ...highlightFeature,
    ...removeHighlightFeature
};
