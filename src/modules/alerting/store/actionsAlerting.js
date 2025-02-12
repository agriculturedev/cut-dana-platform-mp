import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import store from "../../../app-store";

dayjs.extend(duration);

/**
 * Finds an alert by hash value
 * @param {Object[]} haystackAlerts an array of objects{hash, ...} with the alerts
 * @param {String} needleHash Hash of the wanted alert
 * @returns {Object|Boolean} Retrieved alert or false, if nothing found
 */
function findSingleAlertByHash (haystackAlerts, needleHash) {
    const foundAlerts = haystackAlerts.filter(singleAlert => singleAlert.hash === needleHash);

    return foundAlerts.length ? foundAlerts[0] : false;
}
/**
 * Checks if an alert should be displayed considerung its .displayFrom and .displayUntil properties.
 * @param {Object} alertToCheck The alert to check
 * @returns {Boolean} True if its defined timespan includes current time
 */
function checkAlertLifespan (alertToCheck) {
    if (alertToCheck.displayFrom === false && alertToCheck.displayUntil === false) {
        return true;
    }

    return (!alertToCheck.displayFrom || dayjs().isAfter(alertToCheck.displayFrom)) && (!alertToCheck.displayUntil || dayjs().isBefore(alertToCheck.displayUntil));

}
/**
 * Checks if an already displayed alert may be displayed again.
 * @param {Object} displayedAlerts an object as collection of already displayed alerts with their hash value as associated key
 * @param {Object} alertToCheck The alert to check as object{hash, once, ...}
 * @returns {Boolean} True if the given alert may be displayed again
 */
function checkAlertViewRestriction (displayedAlerts, alertToCheck) {

    // if hash is already in localStorage then alert is not shown
    if (localStorage[store.getters["Alerting/localStorageDisplayedAlertsKey"]]?.includes(alertToCheck.hash)) {
        return false;
    }

    // displayed, but not restricted to display multiple times
    if (alertToCheck.once === false || alertToCheck.once === undefined) {
        return true;
    }

    // displayed and restricted to only a single time
    if (alertToCheck.once === true) {
        store.commit("Alerting/addToDisplayedAlerts", alertToCheck);
    }

    return true;

}

export default {
    /**
     * Updates localStorage with read and once:true alerts, set displayed alerts as displayed and hide modal.
     * @param {Object} state state
     * @param {Object} commit commit
     * @returns {void}
     */
    cleanup: function ({state, commit}) {
        const storageKey = state.localStorageDisplayedAlertsKey;

        state.alerts.forEach(singleAlert => {
            if (!singleAlert.mustBeConfirmed && singleAlert.initialConfirmed !== false && singleAlert.initial !== undefined) {
                commit("addToDisplayedAlerts", singleAlert);
                commit("removeFromAlerts", singleAlert);
            }
        });

        if (localStorage[storageKey]) {
            localStorage[storageKey] = JSON.stringify({...state.displayedAlerts, ...JSON.parse(localStorage[storageKey])});
        }
        else {
            localStorage[storageKey] = JSON.stringify(state.displayedAlerts);
        }
        commit("setReadyToShow", false);

    },
    /**
     * Marks a single alert as un/read. Triggers callback function if defined.
     * @param {Object} state state
     * @param {String} hash Hash of read alert
     * @returns {void}
     */
    alertHasBeenRead: function ({state, commit}, hash) {
        const singleAlert = findSingleAlertByHash(state.alerts, hash);

        if (singleAlert !== false) {
            if (singleAlert.mustBeConfirmed === true) {
                commit("setAlertAsRead", singleAlert);
            }
            else {
                commit("setAlertAsUnread", singleAlert);
            }
        }
    },
    /**
     * Checks a new alert object, if it may be added to alerting queue. This includes checking, if
     *  1: alert is already in queue
     *  2: alert is limited to be displayed in a past time
     *  3: alert is limited to be display in the future
     *  4: alert has already been read and is not ready to be displayed again yet
     *  5: allows multiple alerts from newsFeedPortaljson (singleAlert.multipleAlert = true) in state.alerts.
     * @param {Object} state state
     * @param {Object} newAlert alert object to be added to queue
     * @returns {void}
     */
    addSingleAlert: function ({state, commit}, newAlert) {
        const objectHash = require("object-hash"),
            newAlertObj = typeof newAlert === "string" ? {content: newAlert} : newAlert,
            alertProtoClone = {...state.alertProto},
            hasInitAlert = state.alerts.some(function (alert) {
                return alert.initial === true;
            });

        let category,
            isUnique = false,
            onceInSession = false,
            isNotRestricted = false,
            isInTime = false,
            displayAlert = false;

        if (newAlertObj === undefined) {
            return false;
        }

        if (newAlertObj?.category !== undefined) {
            category = newAlertObj.category.toLowerCase();
        }

        if (state.availableCategories.includes(category)) {
            newAlertObj.displayCategory = `common:modules.alerting.categories.${category}`;
        }
        else if (newAlertObj.category === undefined || newAlertObj.category === "") {
            newAlertObj.displayCategory = "info";
        }
        else {
            newAlertObj.displayCategory = newAlertObj.category;
        }

        // in case its not an object with a non empty string at .content, dont continue
        if (typeof newAlertObj.content !== "string" || newAlertObj.content.length < 1) {
            console.warn("Alert cancelled, bad content value:", newAlertObj.content);
            return false;
        }
        for (const key in newAlertObj) {
            alertProtoClone[key] = newAlertObj[key];
        }

        alertProtoClone.hash = alertProtoClone.content;
        if (typeof alertProtoClone.displayFrom === "string") {
            alertProtoClone.hash = alertProtoClone.hash + alertProtoClone.displayFrom;
        }
        if (typeof alertProtoClone.displayUntil === "string") {
            alertProtoClone.hash = alertProtoClone.hash + alertProtoClone.displayUntil;
        }
        alertProtoClone.hash = objectHash(alertProtoClone.hash);
        isUnique = findSingleAlertByHash(state.alerts, alertProtoClone.hash) === false;
        onceInSession = !isUnique ? alertProtoClone.onceInSession : false;
        isInTime = checkAlertLifespan(alertProtoClone);
        isNotRestricted = checkAlertViewRestriction(state.displayedAlerts, alertProtoClone);

        if (alertProtoClone.isNews) {
            commit("Modules/News/addNews", alertProtoClone, {root: true});
        }

        if (typeof alertProtoClone.displayOnEvent === "object") {
            commit("addToDisplayOnEventList", alertProtoClone.displayOnEvent);
        }

        displayAlert = isUnique && isInTime && isNotRestricted;
        if (displayAlert) {
            if ((newAlert.multipleAlert !== true && !newAlert.initial && state.initialClosed === true) || (newAlert.multipleAlert === true && hasInitAlert === true && state.initialClosed === true)) {
                state.alerts = [];
            }
            if (!localStorage[state.localStorageDisplayedAlertsKey]?.includes(alertProtoClone.hash)) {
                commit("addToAlerts", alertProtoClone);
            }
        }
        // even if current alert got seeded out, there still might be another one in the pipe
        if (state.alerts.length > 0) {
            if (findSingleAlertByHash(state.alerts, alertProtoClone.hash) !== false && isInTime && isNotRestricted && !onceInSession) {
                // this is necessary because this action returned false even if the alert was displayed
                displayAlert = true;
            }

            if (displayAlert) {
                commit("setReadyToShow", true);
            }
        }

        return displayAlert;
    },

    /**
     * Loops trough defined alerts from config.js and add it to the alerting module.
     * @param {Object} context the vue context
     * @param {Object} context.dispatch the commit
     * @param {Object} alerts object with defined alerts
     * @returns {void}
     */
    addAlertsFromConfig ({dispatch}, alerts) {
        Object.values(alerts).forEach((value) => {
            value.initial = true;
            value.isNews = true;
            value.initialConfirmed = value.mustBeConfirmed;
            dispatch("addSingleAlert", value);
        });
    },
    /**
     * Check if a current event has alert items and activate them.
     * @param {Object} state state
     * @param {Object} action Event type and value to check for alertsOnEvent items
     * @returns {void}
     */
    activateDisplayOnEventAlerts ({state, commit}, action) {
        state.alertsOnEvent = [];

        state.alerts.forEach((alert) => {
            let displayProps;

            if (Object.hasOwn(alert, "displayOnEvent")) {
                displayProps = alert.displayOnEvent;

                if (action.type === displayProps.type) {
                    if (typeof displayProps.value === "string" && displayProps.value === action.payload) {
                        state.alertsOnEvent.push(alert);
                    }
                    else if (typeof displayProps.value === "object" &&
                        Object.entries(displayProps.value).every(([key, value]) => action.payload[key] === value)
                    ) {
                        state.alertsOnEvent.push(alert);
                    }
                }
            }
        });

        commit("setReadyToShow", true);
    }
};
