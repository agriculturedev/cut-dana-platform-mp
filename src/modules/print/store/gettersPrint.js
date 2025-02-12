import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import statePrint from "./statePrint";
import layerFactory from "../../../core/layers/js/layerFactory";
import {rawLayerList} from "@masterportal/masterportalapi";

const getters = {
    ...generateSimpleGetters(statePrint),

    /**
     * Provides state for urlParams.
     * @param {Object} state state of the app-store.
     * @returns {Array} list of additional layers with status active
     */
    activeAdditionalLayers: state => {
        return state.additionalLayers.filter(layer => layer.active)
            .map(layer => layerFactory.createLayer(rawLayerList.getLayerWhere({id: layer.id}), "2D").layer);
    },

    /**
     * Provides state for urlParams.
     * @param {Object} state state of the app-store.
     * @returns {Object} state for urlParams
     */
    urlParams: state => {
        const params = {
            autoAdjustScale: state.autoAdjustScale,
            isScaleSelectedManually: state.isScaleSelectedManually,
            currentFormat: state.currentFormat,
            currentLayoutName: state.currentLayoutName,
            currentScale: state.currentScale,
            currentScaleUrlParams: state.currentScale,
            dpiForPdf: state.dpiForPdf,
            title: state.title,
            isGfiSelected: state.isGfiSelected,
            isLegendSelected: state.isLegendSelected
        };

        return params;
    }
};

export default getters;
