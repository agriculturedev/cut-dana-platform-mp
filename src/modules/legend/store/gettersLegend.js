import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import {isUrl} from "../../../shared/js/utils/urlHelper";
import legendState from "./stateLegend";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     * @param {Object} state state to generate getters for
     * @returns {object.<string, function>} object of getters
     */
    ...generateSimpleGetters(legendState),

    /**
    * Checks if given layerid is in the legend.
    * @param {Object} state state of the app-store.
    * @param {String} layerId Id of layer.
    * @returns {Boolean} - Flag if layer is in the legend
    */
    isLayerInLegend: state => (layerId) => {
        return state.legends.filter((legendObj) => {
            return legendObj.id === layerId;
        }).length > 0;
    },

    /**
     * Checks if the legend object of the layer has changed
     * @param {Object} state state of the app-store.
     * @param {Object} legendObj The legend object to be checked.
     * @returns {Boolean} - Flag if the legendObject has changed
     */
    isLegendChanged: state => (legendObj) => {
        let isLegendChanged = false;
        const layerLegend = state.legends.filter((legend) => {
            return legend.id === legendObj.id;
        })[0];

        if (encodeURIComponent(JSON.stringify(layerLegend)) !== encodeURIComponent(JSON.stringify(legendObj))) {
            isLegendChanged = true;
        }
        return isLegendChanged;
    },
    /**
     * Provides state for urlParams, encodes uris in legends.
     * @param {Object} state state of the app-store.
     * @returns {Object} state for urlParams
     */
    urlParams: state => {
        const legendsCopy = [...state.legends],
            legendsEncoded = [];

        legendsCopy.forEach(legend => {
            const legendCopy = {...legend};

            if (Array.isArray(legendCopy.legend)) {
                const replacement = [];

                legendCopy.legend.forEach(aLegend => {
                    let encoded;

                    if (isUrl(aLegend)) {
                        encoded = encodeURIComponent(aLegend.slice());
                    }
                    else {
                        encoded = {...aLegend};
                    }
                    replacement.push(encoded);
                });
                legendCopy.legend = replacement;
                legendsEncoded.push(legendCopy);
            }
        });

        return {
            legends: legendsEncoded,
            type: state.type,
            name: state.name,
            icon: state.icon,
            sldVersion: state.sldVersion
        };
    }

};

export default getters;
