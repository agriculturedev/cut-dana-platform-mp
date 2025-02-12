import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateStyleVT from "./stateStyleVT";
import layerCollection from "../../../core/layers/js/layerCollection";

const mutations = {
    ...generateSimpleMutations(stateStyleVT),

    /**
     * If the selected id is not an empty String the model of the layer is requested from the ModelList.
     * This value then is committed to the state.
     * If no id is present, null is committed.
     *
     * @param {Object} state State object of the module.
     * @param {String} id Id of the layerModel.
     * @returns {void}
     */
    setLayerModelById (state, id) {
        let layerModel = null;

        if (id !== "") {
            layerModel = layerCollection?.getLayerById(id);
        }

        Object.assign(state, {layerModel});
    }
};

export default mutations;
