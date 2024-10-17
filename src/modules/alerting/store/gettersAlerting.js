import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import alertState from "./stateAlerting";

export default {
    ...generateSimpleGetters(alertState),
    /**
     * This returns the alerts queue array grouped by the alerts' category property.
     * And show error-warning-success -Alerts before info and news
     * @param {Object} state state
     * @param {string} which identifyer, if the "alertOnEvent"-events shall be sortet or the "initial" events
     * @returns {Object[]} sortedAlerts
     */
    sortedAlerts: (state) => (which) => {
        const
            resultByCategory = {},
            results = [];

        let alertsToSort = state.alerts;

        if (which === "onEvent") {
            alertsToSort = state.alertsOnEvent;
        }

        alertsToSort.forEach(singleAlert => {
            if (which === "initial" && Object.hasOwn(singleAlert, "displayOnEvent")) {
                return;
            }

            if (resultByCategory[singleAlert.category] === undefined) {
                resultByCategory[singleAlert.category] = [];
            }
            resultByCategory[singleAlert.category].push({...singleAlert});
        });

        Object.keys(resultByCategory).forEach(key => {
            results.push({category: key, content: resultByCategory[key]});
        });

        results.sort(function (a, b) {
            const sortingArr = ["success", "warning", "error"];

            return sortingArr.indexOf(b.category) - sortingArr.indexOf(a.category);
        });

        return results;
    }
};
