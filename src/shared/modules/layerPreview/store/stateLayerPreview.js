/**
     * @typedef {Object} stateLayerPreview
     * @description creates a preview of a layer.
     * @property {Object} [center={}] center coordinates of the preview by layerId
     * @property {Object} [zoomLevel={}] zoom level of the preview by layerId
     * @property {Object} [previewUrlByLayerIds={}] preview urls by layerId
     */
const state = {
    center: {},
    zoomLevel: {},
    previewUrlByLayerIds: {}
};

export default state;
