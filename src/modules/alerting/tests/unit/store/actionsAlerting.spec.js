import actions from "../../../store/actionsAlerting";
import sinon from "sinon";
import {expect} from "chai";

describe("src/modules/alerting/store/actionsAlerting.js", () => {
    let commit,
        dispatch;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    it("cleanup", () => {
        const state = {
            alerts: [
                {
                    hash: "123",
                    initial: true,
                    mustBeConfirmed: false
                }
            ]
        };

        actions.cleanup({state, commit});
        expect(commit.calledThrice).to.be.true;
        expect(commit.getCall(0).args).to.eql(["addToDisplayedAlerts", {hash: "123", initial: true, mustBeConfirmed: false}]);
        expect(commit.getCall(1).args).to.eql(["removeFromAlerts", {hash: "123", initial: true, mustBeConfirmed: false}]);
        expect(commit.getCall(2).args).to.eql(["setReadyToShow", false]);
    });

    it("setAlertAsRead", () => {
        const state = {
            alerts: [
                {
                    hash: "found",
                    mustBeConfirmed: true
                }
            ]
        };

        actions.alertHasBeenRead({state, commit}, "found");
        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args).to.eql(["setAlertAsRead", {hash: "found", mustBeConfirmed: true}]);
    });

    it("setAlertAsUnread", () => {
        const state = {
            alerts: [
                {
                    hash: "found",
                    mustBeConfirmed: false
                }
            ]
        };

        actions.alertHasBeenRead({state, commit}, "found");
        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args).to.eql(["setAlertAsUnread", {hash: "found", mustBeConfirmed: false}]);
    });

    it("addSingleAlert adds a valid alert", () => {
        const state = {
                alerts: [],
                displayedAlerts: [],
                availableCategories: ["news", "success", "warning", "error", "info"]
            },
            checkValue = actions.addSingleAlert({state, commit}, {hash: "123", content: "123", displayFrom: false, isNews: true});

        expect(checkValue).to.be.true;
        expect(commit.calledTwice).to.be.true;
        expect(commit.firstCall.args[0]).to.eql("Modules/News/addNews");
        expect(commit.firstCall.args[1].content).to.eql("123");
    });

    it("addSingleAlert doesnt show alert with not valid time restriction", () => {
        const state = {
                alerts: [],
                displayedAlerts: [],
                availableCategories: ["news", "success", "warning", "error", "info"]
            },
            checkValue = actions.addSingleAlert({state, commit}, {hash: "123", content: "123", "displayFrom": "2022-08-24 05:00", "displayUntil": "2022-09-28 23:59", isNews: true});

        expect(checkValue).to.be.false;
        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args[0]).to.eql("Modules/News/addNews");
        expect(commit.firstCall.args[1].content).to.eql("123");
    });

    it("addSingleAlert shows alert with valid time restriction", () => {
        const state = {
                alerts: [],
                displayedAlerts: [],
                availableCategories: ["news", "success", "warning", "error", "info"]
            },
            checkValue = actions.addSingleAlert({state, commit}, {hash: "123", content: "123", "displayFrom": "2022-08-24 05:00", "displayUntil": "2088-09-28 23:59", isNews: true});

        expect(checkValue).to.be.true;
        expect(commit.calledTwice).to.be.true;
        expect(commit.firstCall.args[0]).to.eql("Modules/News/addNews");
        expect(commit.firstCall.args[1].content).to.eql("123");
    });

    it("addSingleAlert doesnt show alert with already existing hash", () => {
        const state = {
            alerts: [{hash: "2db391b6db7866773874b3a5e60123040adb656a"}],
            displayedAlerts: [],
            availableCategories: ["news", "success", "warning", "error", "info"]
        };

        actions.addSingleAlert({state, commit}, {hash: "2db391b6db7866773874b3a5e60123040adb656a", isNews: true, content: "123", "displayFrom": "2022-08-24 05:00", "displayUntil": "2088-09-28 23:59"});

        expect(commit.calledTwice).to.be.true;
        expect(commit.firstCall.args[0]).to.eql("Modules/News/addNews");
        expect(commit.firstCall.args[1].content).to.eql("123");
        expect(commit.secondCall.args[0]).to.eql("setReadyToShow");
        expect(commit.secondCall.args[1]).to.be.true;
    });

    it("should only execute addNews if onceInSession === true and new alert already exists", () => {
        const state = {
            alerts: [{
                hash: "2db391b6db7866773874b3a5e60123040adb656a",
                content: "123",
                displayFrom: "2022-08-24 05:00",
                displayUntil: "2088-09-28 23:59",
                onceInSession: true
            }],
            displayedAlerts: [],
            availableCategories: ["news", "success", "warning", "error", "info"]
        };

        actions.addSingleAlert({state, commit}, {
            hash: "2db391b6db7866773874b3a5e60123040adb656a",
            content: "123",
            displayFrom: "2022-08-24 05:00",
            displayUntil: "2088-09-28 23:59",
            onceInSession: true,
            isNews: true
        });

        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args[0]).to.eql("Modules/News/addNews");
        expect(commit.firstCall.args[1].content).to.eql("123");
    });

    it("addAlertsFromConfig", () => {
        actions.addAlertsFromConfig({dispatch}, {testAlert: {"title": "testAlert"}, testAlert2: {"title": "testAlert2"}});

        expect(dispatch.calledTwice).to.be.true;
        expect(dispatch.firstCall.args[0]).to.equals("addSingleAlert");
        expect(dispatch.firstCall.args[1].title).to.equals("testAlert");
        expect(dispatch.secondCall.args[0]).to.equals("addSingleAlert");
        expect(dispatch.secondCall.args[1].title).to.equals("testAlert2");
    });

    describe("activateDisplayOnEventAlerts() init", () => {
        const state = {
            alerts: [{
                content: "test alert simple",
                displayOnEvent: {
                    "type": "test",
                    "value": "teststring"
                },
                onceInSession: true,
                once: false
            },
            {
                content: "test alert layer",
                displayOnEvent: {
                    "type": "showLayerAttributions",
                    "value": {
                        "id": "453",
                        "visibility": false
                    }
                },
                onceInSession: true,
                once: false
            },
            {
                content: "Second alerts for the same event",
                displayOnEvent: {
                    "type": "showLayerAttributions",
                    "value": {
                        "id": "453",
                        "visibility": false
                    }
                },
                onceInSession: true,
                once: false
            },
            {
                content: "default alert",
                onceInSession: true,
                once: false
            }]
        };

        it("event alert - event type A", () => {
            const action = {
                type: "test",
                payload: "teststring"
            };

            actions.activateDisplayOnEventAlerts({state, commit}, action);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setReadyToShow");
            expect(commit.firstCall.args[1]).to.eql(true);
            expect(state.alertsOnEvent.length).to.eql(1);
        });

        it("event alert - event type B - two alerts", () => {
            const action = {
                "type": "showLayerAttributions",
                "payload": {
                    "id": "453",
                    "visibility": false
                }
            };

            actions.activateDisplayOnEventAlerts({state, commit}, action);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setReadyToShow");
            expect(commit.firstCall.args[1]).to.eql(true);
            expect(state.alertsOnEvent.length).to.eql(2);
        });
    });
});
