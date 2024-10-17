import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import isObject from "../../../shared/js/utils/isObject";
import initialState from "./stateStatisticDashboard";
import sortBy from "../../../shared/js/utils/sortBy";

const getters = {
    ...generateSimpleGetters(initialState),

    /**
     * Gets the values of the selected dates.
     * @param {Object} state - The StatisticDashboard state.
     * @param {Object} getters - The StatisticDashboard getters.
     * @param {Object[]} getters.selectedDates - The selected dates.
     * @return {String[]} The values of the selected dates.
     */
    selectedDatesValues (state, {selectedDates}) {
        const datesValues = [];

        selectedDates.forEach(date => {
            if (!isObject(date)) {
                return;
            }
            if (Array.isArray(date.value)) {
                datesValues.push(...date.value);
            }
            else {
                datesValues.push(date.value);
            }
        });

        return datesValues;
    },

    /**
     * Gets the values of the selected regions.
     * @param {Object} state - The StatisticDashboard state.
     * @param {Object} getters - The StatisticDashboard getters.
     * @param {Object[]} getters.selectedRegions - The selected regions.
     * @returns {String[]} The values(names) of the selected regions.
     */
    selectedRegionsValues (state, {selectedRegions}) {
        if (!Array.isArray(selectedRegions)) {
            return [];
        }

        let regions = selectedRegions;

        if (selectedRegions.some(val => val.label === i18next.t("common:modules.statisticDashboard.button.all")) && typeof state?.flattenedRegions !== "undefined") {
            regions = sortBy(state?.flattenedRegions.find(region => {
                return !Object.prototype.hasOwnProperty.call(region, "child");
            }).values, "label");
        }

        const mappedRegionsValues = regions.map(region => region.value),
            allRegions = mappedRegionsValues.find(region => Array.isArray(region));

        return typeof allRegions !== "undefined" ? allRegions : mappedRegionsValues;
    }
};

export default getters;
