import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateDraw from "./stateDraw";

/**
 * The mutations for the draw module.
 * @module modules/draw/store/mutationsDraw
 */
export default {
    ...generateSimpleMutations(stateDraw),

    /**
     * Sets the circle options.
     * @param {Object} state store state.
     * @param {Object} options The options for the circle.
     * @param {Number} options.innerRadius The inner radius of the circle.
     * @param {Boolean} options.interactive The interactive of the circle.
     * @param {Number} options.outerRadius The outer radius of the circle.
     * @param {String} options.unit The unit of the circle.
     * @returns {void}
     */
    setCircleOptions (state, options) {
        Object.assign(state.circleOptions, options);
    }
};
