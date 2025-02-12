/**
 * User type definition
 * @typedef {Object} MapState
 * @property {Number[]} center Current center values of the map.
 * @property {Number[]} clickCoordinate Current coordinates where the mouse click event was triggered.
 * @property {Number[]} clickPixel Current pixel values where the mouse click event was triggered.
 * @property {Number[]} extent Current extent values of the map.
 * @property {String[]} highlightedFeatures list of highlighted features, indices correspond to "highlightedFeaturesStyles"
 * @property {String[]} highlightedFeatureStyles list of original styles for highlighted features, indices correspond to "highlightedFeatures"
 * @property {Number[]} initialCenter Initial center values of the map.
 * @property {Number} initialRotation Initial rotation of the map view.
 * @property {Number} initialZoom Initial zoom level of the map.
 * @property {Number} maxZoomLevel Max zoom level of the map view.
 * @property {Number} minZoomLevel Min zoom level of the map view.
 * @property {String} mode Current mode of the map e.g. 2D/3D.
 * @property {Number[]} mouseCoordinate Current mouse coordinate values of the map.
 * @property {String} projection Current projection of the map view.
 * @property {Number} resolution Current resolution value of the map.
 * @property {Number[]} resolutions Available resolutions of the map.
 * @property {Number} rotation Current rotation value of the map view.
 * @property {Number} scale Current scale value of the map.
 * @property {Number[]} scales Available scales of the map.
 * @property {Number} size Current size in pixels of the map in the DOM.
 * @property {Number} zoom Current zoom level of the map view.
*/

const state = {
    center: null,
    clickCoordinate: null,
    clickPixel: null,
    extent: null,
    highlightedFeatures: [],
    highlightedFeatureStyles: [],
    initialCenter: null,
    initialRotation: null,
    initialZoom: null,
    maxZoom: null,
    minZoom: null,
    mode: "2D",
    mouseCoordinate: null,
    projection: null,
    resolution: null,
    resolutions: null,
    rotation: null,
    scale: null,
    scales: null,
    size: null,
    twoFingerPanStart: false,
    zoom: null
};

export default state;
