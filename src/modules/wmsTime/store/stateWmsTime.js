/**
 * state of the WMSTime
 * @module modules/WMSTime/state
 *
 * @property {String} layerAppendix Value to be added to the second layer, which is added when using the layerSwiper.
 * @property {Number} windowWidth Current width (window.innerWidth) of the window in px.
 * @property {Object} timeSlider Values for the timeSlider.
 * @property {Boolean} timeSlider.active Whether the timeSlider window should be active.
 * @property {String} timeSlider.currentLayerId Id of the currently selected WMS-T.
 * @property {timeSliderObject[]} timeSlider.objects Array of objects containing values that are relevant for every WMS-T layer configured.
 * @property {Number} timeSlider.playbackDelay Time in seconds that a moment should be shown when using the playback function.
 * @property {Boolean} timeSlider.playing Whether the playback function is currently active in either of the TimeSlider windows.
 */
const state = {
    layerAppendix: "_secondLayer",
    windowWidth: 1280,
    visibility: true,
    timeSlider: {
        active: false,
        currentLayerId: "",
        objects: [],
        playbackDelay: 1,
        playing: false
    }
};

export default state;
