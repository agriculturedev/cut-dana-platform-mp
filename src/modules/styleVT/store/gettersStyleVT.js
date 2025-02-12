import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateStyleVT from "./stateStyleVT";

const getters = {
    ...generateSimpleGetters(stateStyleVT),

    /**
     * Checks whether the given layerId is the id of the currently set layerModel.
     *
     * @param {Object} state State object of the module.
     * @returns {function(String): boolean} The returned function returns true, if the given layerId is the id of the layer set in the state; false otherwise.
     */
    selectedLayerId (state) {
        return layerId => layerId === state.layerModel?.id;
    },

    /**
     * Checks whether the given styleId is the id of the style the currently set layerModel.
     *
     * @param {Object} state State object of the module.
     * @returns {function(String): boolean} The returned function returns true, if the given styleId is the id of the style of the layer set in the state; false otherwise.
     */
    selectedStyle (state) {
        return styleId => styleId === state.layerModel.get("selectedStyleID");
    }
};

export default getters;
