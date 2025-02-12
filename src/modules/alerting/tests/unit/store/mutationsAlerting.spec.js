import mutations from "../../../store/mutationsAlerting";
import {expect} from "chai";

describe("src/modules/alerting/store/mutationsAlerting.js", () => {

    it("addToAlerts", async function () {
        const state = {
            alerts: [{title: "alone"}]
        };

        mutations.addToAlerts(state, {title: "notalone"});


        expect(state.alerts.length).to.be.equals(2);
        expect(state.alerts[1].title).to.be.equals("notalone");
    });
    it("removeFromAlerts", async function () {
        const state = {
            alerts: [{hash: "stay"}, {hash: "remove"}]
        };

        mutations.removeFromAlerts(state, {hash: "remove"});


        expect(state.alerts.length).to.be.equals(1);
        expect(state.alerts[0].hash).to.be.equals("stay");
    });
    it("setReadyToShow", async function () {
        const state = {
            showTheModal: false
        };

        mutations.setReadyToShow(state, true);


        expect(state.showTheModal).to.be.true;
    });
    it("setReadyToShow", async function () {
        const state = {
            showTheModal: false
        };

        mutations.setReadyToShow(state, true);


        expect(state.showTheModal).to.be.true;
    });
    it("setAlertAsRead", async function () {
        const state = {},
            testAlert = {mustBeConfirmed: true};

        mutations.setAlertAsRead(state, testAlert);


        expect(testAlert.mustBeConfirmed).to.be.false;
    });
    it("setAlertAsUnread", async function () {
        const state = {},
            testAlert = {mustBeConfirmed: false};

        mutations.setAlertAsUnread(state, testAlert);


        expect(testAlert.mustBeConfirmed).to.be.true;
    });
    it("addToDisplayedAlerts", async function () {
        const state = {
            displayedAlerts: {exist: "123"}
        };

        mutations.addToDisplayedAlerts(state, {hash: "added"});

        expect(state.displayedAlerts).to.have.all.keys("exist", "added");
    });
    it("setDisplayedAlerts", async function () {
        const state = {
            displayedAlerts: {}
        };

        mutations.setDisplayedAlerts(state, {1: "one", 2: "two"});

        expect(state.displayedAlerts).to.eql({1: "one", 2: "two"});
    });
});
