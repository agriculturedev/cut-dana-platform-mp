import isObject from "../../../shared/js/utils/isObject";

export default {
    /**
     * Checks if the given legend is duplicated and cuts all duplicated legends.
     * @param {Array} legends The legend object to be checked.
     * @returns {Array} the legends to use
     */
    cleanUpLegend: (legends) => {
        const allEqualLegendURLs = legends.every(
                (layer, _, arr) => layer === arr[0]
            ),
            allEqualLegendObjects = legends.every((layer, _, arr) => isObject(layer) && layer.graphic === arr[0].graphic);


        if (allEqualLegendURLs || allEqualLegendObjects) {
            legends.length = 1;
        }
        return legends;

    }
};
