import getters from "../../../store/gettersAlerting";
import {expect} from "chai";

describe("src/modules/alerting/store/gettersAlerting.js", () => {

    const expectedAlertOrder = ["error", "warning", "success", "info"];

    it("fetchBroadcastUrl", async function () {
        const state = {
                fetchBroadcastUrl: "https://fetchBroadcastUrl"
            },
            checkValue = getters.fetchBroadcastUrl(state);


        expect(checkValue).to.eql("https://fetchBroadcastUrl");
    });
    it("localStorageDisplayedAlertsKey", async function () {
        const state = {
                localStorageDisplayedAlertsKey: "keyONE"
            },
            checkValue = getters.localStorageDisplayedAlertsKey(state);


        expect(checkValue).to.eql("keyONE");
    });
    it("displayedAlerts", async function () {
        const state = {
                displayedAlerts: ["a", "b", "c"]
            },
            checkValue = getters.displayedAlerts(state);


        expect(checkValue).to.eql(["a", "b", "c"]);
    });
    it("showTheModal", async function () {
        const state = {
                showTheModal: false
            },
            checkValue = getters.showTheModal(state);


        expect(checkValue).to.be.false;
    });
    it("alerts", async function () {
        const state = {
                alerts: ["info", "warning", "success", "error"]
            },
            checkValue = getters.alerts(state);


        expect(checkValue).to.eql(["info", "warning", "success", "error"]);
    });
    it("sortedAlerts - 1.error2.warning3.success4.other", async function () {
        const state = {
                alerts: [{category: "info"}, {category: "warning"}, {category: "success"}, {category: "error"}]
            },
            checkValue = getters.sortedAlerts(state)("initial");

        expectedAlertOrder.forEach((errName, idx) => {
            expect(checkValue[idx].category).to.eql(errName);
        });

        expect(checkValue[4]).to.eql(undefined);
    });

    it("sortedAlerts for alertsOnEvent - 1.error2.warning3.success4.other", async function () {
        const state = {
                alertsOnEvent: [{category: "info"}, {category: "success"}, {category: "warning"}, {category: "error"}]
            },
            checkValue = getters.sortedAlerts(state)("onEvent");

        expectedAlertOrder.forEach((errName, idx) => {
            expect(checkValue[idx].category).to.eql(errName);
        });

        expect(checkValue[4]).to.eql(undefined);
    });
});
