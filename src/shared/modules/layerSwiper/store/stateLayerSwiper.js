/**
 * @typedef {Object}  stateLayerSwiper
 * @property {Boolean} active Whether the swiper should be active.
 * @property {Boolean} isMoving Whether the swiper is currently being moved.
 * @property {HTMLElement} swiper The DOM element for the swiper.
 * @property {Object} targetLayer The layer that is supposed to be manipulated.
 * @property {Object} sourceLayer The source layer for comparison.
 * @property {Number} valueX The current x-axis position of the swiper.
 * @property {Number} valueY The current y-axis position of the swiper.
 * @property {String} splitDirection The direction of the swiper ("vertical" or "horizontal").
 */
const state = {
    active: false,
    currentTimeSliderObject: null,
    isMoving: false,
    swiper: null,
    targetLayer: null,
    sourceLayer: null,
    valueX: null,
    valueY: null,
    splitDirection: "vertical"
};

export default state;
