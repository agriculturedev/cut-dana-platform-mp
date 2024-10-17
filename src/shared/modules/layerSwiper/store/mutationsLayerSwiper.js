import {generateSimpleMutations} from "../../../js/utils/generators";
import stateLayerSwiper from "./stateLayerSwiper";

/**
 * The mutations for the LayerSwiper.
 * @module modules/layerSwiper/store/mutationsLayerSwiper
 */
const mutations = {
    ...generateSimpleMutations(stateLayerSwiper),

    /**
     * Sets the active state of the LayerSwiper.
     * @param {Object} state - The Vuex state object.
     * @param {boolean} active - The new active state.
     * @returns {void}
     */
    setLayerSwiperActive (state, active) {
        state.active = active;
    },

    /**
     * Sets the DOM element for the LayerSwiper.
     * @param {Object} state - The Vuex state object.
     * @param {HTMLElement} target - The DOM element for the LayerSwiper.
     * @returns {void}
     */
    setLayerSwiperDomSwiper (state, target) {
        state.swiper = target;
    },

    /**
     * Sets the x-axis position of the LayerSwiper.
     * @param {Object} state - The Vuex state object.
     * @param {number} clientX - The new x-axis position.
     * @returns {void}
     */
    setLayerSwiperValueX (state, clientX) {
        state.valueX = clientX;
    },

    /**
     * Sets the y-axis position of the LayerSwiper.
     * @param {Object} state - The Vuex state object.
     * @param {number} clientY - The new y-axis position.
     * @returns {void}
     */
    setLayerSwiperValueY (state, clientY) {
        state.valueY = clientY;
    },

    /**
     * Sets the left style property of the LayerSwiper's DOM element.
     * @param {Object} state - The Vuex state object.
     * @param {number} clientX - The new left style property value.
     * @returns {void}
     */
    setLayerSwiperStyleLeft (state, clientX) {
        state.swiper.style.left = clientX + "px";
    },

    /**
     * Sets the top style property of the LayerSwiper's DOM element.
     * @param {Object} state - The Vuex state object.
     * @param {number} clientY - The new top style property value.
     * @returns {void}
     */
    setLayerSwiperStyleTop (state, clientY) {
        state.swiper.style.top = clientY + "px";
    },

    /**
     * Sets the target layer for the LayerSwiper.
     * @param {Object} state - The Vuex state object.
     * @param {Object} layer - The target layer.
     * @returns {void}
     */
    setLayerSwiperTargetLayer (state, layer) {
        state.targetLayer = layer;
    },

    /**
     * Sets the source layer for the LayerSwiper.
     * @param {Object} state - The Vuex state object.
     * @param {Object} layer - The source layer.
     * @returns {void}
     */
    setLayerSwiperSourceLayer (state, layer) {
        state.sourceLayer = layer;
    },

    /**
     * Sets the split direction for the LayerSwiper.
     * @param {Object} state - The Vuex state object.
     * @param {string} direction - The new split direction.
     * @returns {void}
     */
    setSplitDirection (state, direction) {
        state.splitDirection = direction;
    }
};

export default mutations;
