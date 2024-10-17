import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateDraw from "./stateDraw";

/**
 * The getters for the draw module.
 * @module modules/draw/store/gettersDraw
 */
export default {
    ...generateSimpleGetters(stateDraw)
};
