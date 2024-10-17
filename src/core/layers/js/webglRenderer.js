import store from "../../../app-store";
import * as webgl from "@masterportal/masterportalapi/src/renderer/webgl";


/**
 * Hides all features by removing them from the layer source. Overrides <LayerType>.hideAllFeatures
 * @public
 * @override
 * @returns {void}
 */
function hideAllFeatures () {
    this.getLayerSource().clear();
}

/**
 * sets the layerSource to have the inital features array. Overrides <LayerType>.showAllFeatures
 * @public
 * @override
 * @returns {void}
 */
function showAllFeatures () {
    this.hideAllFeatures();
    this.getLayerSource().addFeatures(this.features);
}

/**
 * Filters the visibility of features by ids. Overrides <LayerType>.showFeaturesByIds
 * @public
 * @param  {String[]} featureIdList Feature ids to be shown.
 * @override
 * @return {void}
 */
function showFeaturesByIds (featureIdList) {
    const featuresToShow = featureIdList.map(id => this.features.find(feature => feature.getId() === id));

    this.hideAllFeatures();
    this.getLayerSource().addFeatures(featuresToShow);
}

/**
 * Is called if visibility of layer changed. If newValue is false, the layer is removed from map, else layer is added.
 * Disposes WebGL resources if layer is set invisible. Overrides <LayerType>.visibilityChanged.
 * @public
 * @override
 * @param {Boolean} newValue true, if layer is set visible
 * @todo rerender map after canvas render complete
 *       necessary for GPU rendering, since no map/layer event catches the rendering correctly
 *       otherwise icons will be rendered as black quads
 * @returns {void}
 */
function visibilityChanged (newValue) {
    const map = mapCollection.getMap("2D");

    if (this.isDisposed()) {
        // recreate layer instance if buffer has been disposed
        this.setLayer(webgl.createLayer({
            ...this.attributes,
            source: this.source,
            style: this.getLayer().get("style")// pass style from the previous layer instance
        }));
    }
    if (this.attributes.type === "WFS") {
        this.getLayer().getSource().refresh();
    }
    if (!newValue) {
        // dispose WebGL buffer if layer removed
        this.getLayer().dispose();
        map.removeLayer(this.getLayer());
    }
    else if (!map.getLayers().getArray().includes(this.getLayer())) {
        store.dispatch("Maps/addLayer", this.getLayer());
    }
}

/**
 * Returns whether the WebGL resources have been disposed
 * @public
 * @readonly
 * @returns {Boolean} true / false
 */
function isDisposed () {
    return this.layer ? this.layer.disposed : true;
}

/**
 * Remove setter for style
 * If renderer is webgl don't do anything
 * @returns {void}
 */
function setStyle () {
    /**
     * execute empty
     * @todo enable future update of style?
     */
}

/**
 * Sets the necessary class methods/properties if layer uses webgl renderer
 * Overrides existing methods and properties
 * @param {Layer} layerObject - the layer instance to modify
 * @returns {void}
 */
function setLayerProperties (layerObject) {
    // set this.source as persistent, if layer is disposed
    layerObject.source = layerObject.layer.getSource();
    // override layer methods
    layerObject.isDisposed = isDisposed;
    layerObject.visibilityChanged = visibilityChanged;
    layerObject.setStyle = setStyle;
    // todo inka: these functions are not implemented in layers at the moment - delete?
    layerObject.hideAllFeatures = hideAllFeatures;
    layerObject.showAllFeatures = showAllFeatures;
    layerObject.showFeaturesByIds = showFeaturesByIds;
}

export default {
    setLayerProperties,
    hideAllFeatures,
    showAllFeatures,
    showFeaturesByIds,
    visibilityChanged,
    isDisposed,
    setStyle
};
