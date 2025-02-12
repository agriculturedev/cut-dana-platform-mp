import AlertingItemComponent from "../../../components/AlertingItem.vue";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import {createStore} from "vuex";

const Storage = require("dom-storage");

global.localStorage = new Storage(null, {strict: true});

config.global.mocks.$t = key => key;
config.global.mocks.$i18n = {
    i18next: {
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

describe("src/modules/alerting/components/AlertingItem.vue", () => {
    let alerts,
        sortedAlerts,
        store,
        wrapper;

    const alertFromConfig = [
            {
                category: "Portal zur Abnahme!",
                title: "Portal zur Abnahme!",
                displayClass: "info",
                displayCategory: "Portal zur Abnahme!",
                hash: "d05e5351732cfeea934cc3ab43537e0c7265c922",
                content: "Dieses Geoportal dient der Qualitätskontrolle durch den Kunden.<br>Es ist aufgrund von möglichen Fehlern <b>nicht</b> zur Nutzung für alltägliche oder berufliche Aufgaben geeignet!<br><br>",
                creationDate: "01/09/22",
                mustBeConfirmed: true,
                multipleAlert: true,
                once: true
            },
            {
                category: "Portal zur Abnahme!2",
                title: "Portal zur Abnahme!2",
                displayClass: "info",
                displayCategory: "Portal zur Abnahme2!",
                hash: "fglksdfh9729rhilughfui76237wefaäpijf",
                content: "2Dieses Geoportal dient der Qualitätskontrolle durch den Kunden.<br>Es ist aufgrund von möglichen Fehlern <b>nicht</b> zur Nutzung für alltägliche oder berufliche Aufgaben geeignet!<br><br>",
                creationDate: "04/09/22",
                mustBeConfirmed: true,
                multipleAlert: true,
                once: true
            },
            {
                category: "Expired item",
                title: "Expired item",
                displayClass: "info",
                displayCategory: "Expired item",
                content: "Expired item\n\nExpired item",
                displayFrom: "2024-07-17 14:30",
                displayUntil: "2024-08-17 14:30",
                mustBeConfirmed: true,
                once: true
            }
        ],
        alertingData = [
            {
                category: "error",
                title: "Test 1",
                displayCategory: "error",
                content: "Lorem Ipsum 1 (global content)",
                displayFrom: "2020-03-01 20:15:55",
                displayUntil: "2052-05-17 14:30",
                mustBeConfirmed: true,
                once: {"seconds": 15},
                multipleAlert: true
            },
            {
                category: "info",
                title: "Test 2",
                displayCategory: "info",
                content: "Lorem Ipsum 2 (content for master)",
                displayFrom: false,
                displayUntil: "2052-05-17 14:30",
                mustBeConfirmed: true,
                once: {"seconds": 30},
                multipleAlert: true
            },
            {
                category: "error",
                title: "Test 3",
                displayCategory: "error",
                content: "Lorem Ipsum 3 (content for basic)",
                displayFrom: false,
                displayUntil: "2052-05-17 14:30",
                mustBeConfirmed: true,
                once: {"seconds": 45},
                multipleAlert: true
            },
            {
                category: "info",
                title: "Test 4",
                displayCategory: "error",
                content: "Lorem Ipsum 4 (global content)",
                displayFrom: false,
                displayUntil: "2052-05-17 14:30",
                mustBeConfirmed: true,
                once: {"seconds": 60},
                multipleAlert: true
            }
        ];

    beforeEach(() => {
        alerts = [];

        // Simulate loadConfigJson
        alertFromConfig.forEach(value => {
            value.initial = true;
            value.initialConfirmed = value.mustBeConfirmed;
            value.confirmText = "confirmText";
            value.reConfirmText = "reConfirmText";

            alerts.push(value);
        });
        alertingData.forEach(value => {
            value.initial = true;
            value.initialConfirmed = value.mustBeConfirmed;
            value.confirmText = "confirmText";
            value.reConfirmText = "reConfirmText";
            alerts.push(value);
        });

        sortedAlerts = [
            {
                category: "error",
                content: alerts.filter(alert => alert.category === "error")
            },
            {
                category: "Portal zur Abnahme!",
                content: alerts.filter(alert => alert.category === "Portal zur Abnahme!")
            },
            {
                category: "Portal zur Abnahme!2",
                content: alerts.filter(alert => alert.category === "Portal zur Abnahme!2")
            },
            {
                category: "info",
                content: alerts.filter(alert => alert.category === "info")
            }
        ];

        store = createStore({
            modules: {
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.spy(),
                        cleanup: sinon.stub(),
                        addAlertsFromConfig: sinon.stub(),
                        alertHasBeenRead: sinon.stub(),
                        activateDisplayOnEventAlerts: sinon.stub()
                    },
                    getters: {
                        alerts: () => alerts,
                        alertWindowTitle: () => "common:modules.alerting.alertWindowTitle",
                        configPaths: () => ["configJs.alerting"],
                        fetchBroadcastUrl: () => false,
                        fetchBroadcastStrapiUrl: () => false,
                        showTheModal: () => true,
                        sortedAlerts: () => () => sortedAlerts,
                        type: () => "alerting",
                        initialAlerts: () => [],
                        displayOnEventList: () => [
                            {
                                "type": "Test/displayOnEventsAction",
                                "value": "testDisplayOnEventsValueA"
                            },
                            {
                                "type": "Test/displayOnEventsAction",
                                "value": {
                                    "type": "testDisplayOnEventsValueB"
                                }
                            }
                        ]
                    },
                    mutations: {
                        setInitialClosed: sinon.stub(),
                        setShowTheModal: sinon.stub()
                    }
                },
                Modules: {
                    namespaced: true,
                    modules: {
                        News: {
                            namespaced: true,
                            mutations: {
                                addNews: sinon.stub()
                            }
                        }
                    }
                }
            },
            state: {
                availableLocalStorage: true
            },
            mutations: {
                configJs (state, value) {
                    state.configJs = value;
                }
            },
            actions: {
                replaceByIdInLayerConfig: sinon.stub(),
                initializeModule: sinon.stub()
            },
            getters: {
                allLayerConfigs: () => [],
                layerConfigById: () => sinon.stub(),
                configJs: () => sinon.stub()
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });


    it("Checking the initially displayed alerts", async () => {
        const
            mountingSettings = {
                global: {
                    plugins: [store]
                },
                data () {
                    return {
                        currentUrl: "https://localhost:9001/portal/master/"
                    };
                }
            };

        let
            categoryContainers = [],
            alertWrappers = [];


        wrapper = shallowMount(AlertingItemComponent, mountingSettings);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();


        categoryContainers = wrapper.findAll(".alertCategoryContainer");
        alertWrappers = wrapper.findAll(".singleAlertContainer");

        expect(categoryContainers.length).to.equal(4);
        expect(categoryContainers[0].exists()).to.be.true;
        expect(categoryContainers[1].exists()).to.be.true;
        expect(categoryContainers[2].exists()).to.be.true;
        expect(categoryContainers[3].exists()).to.be.true;

        describe("Expecting initially shown 4 category groups", () => {
            it("There are 4 category groups", () => {
                expect(categoryContainers.length).to.equal(4);
            });

            it("1st category group is named \"Test 1\"", () => {
                expect(categoryContainers[0].find("h3").exists()).to.be.true;
                expect(categoryContainers[0].find("h3").text()).to.equal("Test 1");
            });
            it("and contains 1 alerts", () => {
                expect(categoryContainers[0].findAll(".singleAlertContainer").length).to.equal(2);
            });

            it("1st alert is of category \"error\"", () => {
                expect(alertWrappers[0].html().indexOf("bg-danger")).not.to.equal(-1);
            });
            it("and has no confirmation link", () => {
                expect(alertWrappers[0].html().indexOf("form-check-label")).to.equal(-1);
            });
            it("2nd alert is of category \"info\"", () => {
                expect(alertWrappers[2].html().indexOf("bg-info")).not.to.equal(-1);
            });
            it("and has confirmation link", () => {
                expect(alertWrappers[2].html().indexOf("form-check form-check-reverse form-switch mt-1")).not.to.equal(-1);
            });

            it("2st category group is named \"Test 2\"", () => {
                expect(categoryContainers[3].find("h3").exists()).to.be.true;
                expect(categoryContainers[3].find("h3").text()).to.equal("Test 2");
            });
            it("and contains 2 alert", () => {
                expect(categoryContainers[3].findAll(".singleAlertContainer").length).to.equal(2);
            });
            it("1st category group is named \"Portal zur Abnahme!\"", () => {
                expect(categoryContainers[2].find("h3").exists()).to.be.true;
                expect(categoryContainers[2].find("h3").text()).to.equal("Portal zur Abnahme!2");
            });
        });

        describe("Now checking if 2nd alert's confirmation switch exists", () => {
            it("confirmation switch of second alert is checked", () => {
                const checkedInputs = alertWrappers[2].findAll("switch-input-stub");

                expect(checkedInputs.length === 1).to.be.true;
            });
        });

        describe("Close the modal", () => {
            it("4 first alerts have vanished", async () => {
                wrapper.vm.onModalClose();
                await wrapper.vm.$nextTick();
                expect(wrapper.findAll(".singleAlertWrapper").length).to.equal(0);
            });
        });

        describe("Alerts onEvents check handler", () => {
            it("Checks unsubscribeAction not to be null", () => {
                expect(wrapper.vm.unsubscribeAction).not.to.be.null;
            });

            it("Checks event handling", async () => {
                let action = {
                    type: "Test/displayOnEventsAction",
                    payload: "testDisplayOnEventsValueA"
                };

                expect(wrapper.vm.sortedAlertsSwitch).to.equal("initial");
                wrapper.vm.checkForEventAlerts(action);
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.sortedAlertsSwitch).to.equal("onEvent");

                action = {
                    type: "Test/displayOnEventsAction",
                    payload: {
                        type: "testDisplayOnEventsValueB"
                    }
                };

                wrapper.vm.sortedAlertsSwitch = "initial";
                wrapper.vm.checkForEventAlerts(action);
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.sortedAlertsSwitch).to.equal("onEvent");
            });
        });
    });


    describe("Add some alerts", () => {
        let settings;

        beforeEach(() => {
            settings = {
                global: {
                    plugins: [store]
                },
                data () {
                    return {
                        currentUrl: "https://localhost:9001/portal/master/"
                    };
                }
            };
        });

        it("displayed alert is the new one", () => {
            alerts = [{
                category: "error",
                content: "copycat",
                displayFrom: "2020-03-01 20:15:55",
                displayUntil: "2052-05-17 14:30",
                mustBeConfirmed: true,
                once: {"seconds": 30},
                multipleAlert: true
            }];

            sortedAlerts = [{
                category: "error",
                content: alerts
            }];

            wrapper = shallowMount(AlertingItemComponent, settings);

            expect(wrapper.findAll(".singleAlertContainer")[0].html().indexOf("copycat")).not.to.equal(-1);
        });

        it("Adding the exact same alert again does nothing", () => {
            alerts = [{
                category: "error",
                content: "copycat",
                displayFrom: "2020-03-01 20:15:55",
                displayUntil: "2052-05-17 14:30",
                mustBeConfirmed: true,
                once: true,
                multipleAlert: true
            }];

            sortedAlerts = [{
                category: "error",
                content: alerts
            }];

            wrapper = shallowMount(AlertingItemComponent, settings);

            expect(wrapper.findAll(".singleAlertContainer").length).to.equal(1);
        });

        it("Adding an expired alert does nothing", () => {
            alerts = [{
                category: "info",
                content: "No one ever looks at me only because I'm expired.",
                displayFrom: "2020-03-01 20:15:55",
                displayUntil: "2020-05-17 14:30",
                mustBeConfirmed: true,
                once: true,
                multipleAlert: true
            }];

            sortedAlerts = [{
                category: "info",
                content: alerts
            }];

            wrapper = shallowMount(AlertingItemComponent, settings);

            expect(wrapper.findAll(".singleAlertContainer").length).to.equal(1);
        });

        it("Verifies that an expired alert from config does not exist on output", () => {
            let alertWrappers = [];

            wrapper = shallowMount(AlertingItemComponent, settings);

            alertWrappers = wrapper.findAll(".singleAlertContainer");

            // check the item does not exist
            expect(wrapper.text().indexOf("Expired item")).to.equal(-1);
            // we have N alerts in config (see above), one is outdated. generic test
            expect(alertWrappers.length).to.equal(wrapper.vm.alerts.length - 1);
        });

        it("Adding an alert from the future does nothing", () => {
            alerts = [{
                category: "info",
                content: "I am too avant garde for this 'unalerted' society.",
                displayFrom: "2050-03-01 20:15:55",
                displayUntil: "2060-05-17 14:30",
                multipleAlert: true
            }];

            sortedAlerts = [{
                category: "info",
                content: alerts
            }];

            wrapper = shallowMount(AlertingItemComponent, settings);

            expect(wrapper.findAll(".singleAlertContainer").length).to.equal(1);
            expect(wrapper.find(".creation-date").exists()).to.be.false;
        });

        it("show an alert with creationDate", () => {
            alerts = [{
                category: "info",
                content: "with creation date",
                creationDate: "26/07/23"
            }];

            sortedAlerts = [{
                category: "error",
                content: alerts
            }];

            wrapper = shallowMount(AlertingItemComponent, settings);

            expect(wrapper.find(".singleAlertContainer").html().indexOf("with creation date")).not.to.equal(-1);
            expect(wrapper.find(".creation-date").exists()).to.be.true;
        });

        it("Add an onEvent alert", () => {
            alerts = [{
                category: "info",
                title: "Alert Test B",
                content: "Content: Alert Test B",
                mustBeConfirmed: false,
                once: false,
                displayOnEvent: {
                    type: "Test/displayOnEventsAction",
                    payload: {
                        type: "testDisplayOnEventsValueB"
                    }
                }
            }];

            sortedAlerts = [{
                category: "info",
                content: alerts
            }];

            wrapper = shallowMount(AlertingItemComponent, settings);
            expect(wrapper.find(".singleAlertContainer").html().indexOf("Alert Test B")).not.to.equal(-1);
        });
    });

    describe("axiosCallback", () => {
        it("axiosCallback adds alert", async () => {
            const addSingleAlertSpy = sinon.spy(wrapper.vm, "addSingleAlert"),
                parseObject = {
                    "data": {
                        globalAlerts: [
                        ],
                        restrictedAlerts: {
                            "https://localhost:9001/portal/master/": [
                                "testParsing"
                            ]
                        },
                        alerts: {
                            testParsing: {
                                category: "info",
                                title: "testParsing",
                                content: "testParsing",
                                displayFrom: "2022-08-24 05:00",
                                displayUntil: "2088-09-28 23:59",
                                creationDate: "01/09/22",
                                mustBeConfirmed: true,
                                once: true,
                                initial: true,
                                initialConfirmed: true,
                                displayCategory: "common:modules.alerting.categories.info"
                            }
                        }
                    }
                };

            await wrapper.vm.axiosCallback(parseObject);

            expect(addSingleAlertSpy.calledOnce).to.be.true;
            expect(addSingleAlertSpy.firstCall.args[0]).to.deep.equals({
                category: "info",
                title: "testParsing",
                content: "testParsing",
                displayFrom: "2022-08-24 05:00",
                displayUntil: "2088-09-28 23:59",
                creationDate: "01/09/22",
                mustBeConfirmed: true,
                once: true,
                isNews: true,
                initial: true,
                initialConfirmed: true,
                displayCategory: "common:modules.alerting.categories.info"
            });
        });
    });
});
