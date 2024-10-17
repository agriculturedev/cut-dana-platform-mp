import stateMeasure from "./stateMeasure";
import {calculateLineLengths, calculatePolygonAreas} from "../js/measureCalculation";

import {generateSimpleGetters} from "../../../shared/js/utils/generators";

const simpleGetters = {
    ...generateSimpleGetters(stateMeasure),

    /**
     * @param {Object} state measure store state
     * @param {Object} getters measure store getters
     * @param {Object} rootState root state
     * @param {Object} rootGetters root getters
     * @returns {String[]} options for measurement units
     */
    currentUnits ({selectedGeometry, lineStringUnits, polygonUnits}) {
        return selectedGeometry === "LineString"
            ? lineStringUnits
            : polygonUnits;
    },
    /**
     * Calculates the length of lines.
     * @param {Object} state measure store state
     * @param {Object} getters measure store getters
     * @param {Object} rootState root state
     * @param {Object} rootGetters root getters
     * @return {String[]} calculated display values
     */
    lineLengths ({lines, earthRadius, measurementAccuracy, selectedLineStringUnit, selectedGeometry, lineStringUnits}, getters, rootState, rootGetters) {
        return calculateLineLengths(
            rootGetters["Maps/projection"].getCode(),
            lines,
            earthRadius,
            measurementAccuracy,
            selectedLineStringUnit,
            selectedGeometry,
            lineStringUnits
        );
    },
    /**
     * Calculates the area of a polygon.
     * @param {Object} state measure store state
     * @param {Object} getters measure store getters
     * @param {Object} rootState root state
     * @param {Object} rootGetters root getters
     * @return {String[]} calculated display values
     */
    polygonAreas ({polygons, earthRadius, measurementAccuracy, selectedPolygonUnit, selectedGeometry, polygonUnits}, getters, rootState, rootGetters) {
        return calculatePolygonAreas(
            rootGetters["Maps/projection"].getCode(),
            polygons,
            earthRadius,
            measurementAccuracy,
            selectedPolygonUnit,
            selectedGeometry,
            polygonUnits
        );
    },

    urlParams: state => {
        const params = {
            selectedGeometry: state.selectedGeometry,
            selectedLineStringUnit: state.selectedLineStringUnit2,
            selectedPolygonUnit: state.selectedPolygonUnit
        };

        return JSON.stringify(params);
    }
};

export default simpleGetters;
