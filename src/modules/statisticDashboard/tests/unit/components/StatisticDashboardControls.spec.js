import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardControls from "../../../components/StatisticDashboardControls.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardControls.vue", () => {
    const descriptions = [{
            title: "TitleOne",
            content: "ContentOne"
        },
        {
            title: "TitleTwo",
            content: "ContentTwo"
        },
        {
            title: "TitleThree",
            content: "ContentThree"
        }],
        referenceData = {};

    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: indexStatisticDashboard
                    }
                }
            }});
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.exists()).to.be.true;
        });

        it("should find no description", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".description").exists()).to.be.false;
        });

        it("should find a description", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    descriptions,
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".description p").text()).to.be.equal("TitleOneContentOne");

        });

        it("should find a button toolbar", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".btn-toolbar").exists()).to.be.true;
        });

        it("should find switcher component", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findComponent({name: "StatisticSwitcher"}).exists()).to.be.true;
        });

        it("should find difference component", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.setData({showDifferenceModal: true});
            await wrapper.vm.$nextTick();

            expect(wrapper.find(".difference-modal").exists()).to.be.true;
        });

        it("The close button should exist", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({referenceTag: "2001"});
            expect(wrapper.find(".reference-tag").exists()).to.be.true;
        });

        it("should not find a back-overview element", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    descriptions,
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".back-overview").exists()).to.be.false;
        });

        it("should find a back to overview element", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    descriptions,
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setChosenStatisticName("name");
            wrapper.vm.setChartTableToggle("chart");
            wrapper.vm.setSelectedDates([{value: "value1"}]);
            wrapper.vm.setSelectedRegions([{value: "value1"}]);
            wrapper.vm.setSelectedStatistics({
                "Bevölkerung maennlich": {
                    Hamburg: {
                        "1890": "13",
                        "1990": "113"
                    }
                },
                "Bevölkerung weiblich": {
                    Hamburg: {
                        "1890": "12",
                        "1990": "112"
                    }
                }
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.find(".back-overview").exists()).to.be.true;
        });

        it("should not find a static-name container", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    descriptions,
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setChosenStatisticName("");
            wrapper.vm.setChartTableToggle("chart");
            await wrapper.vm.$nextTick();

            expect(wrapper.find(".static-name").exists()).to.be.false;
        });

        it("should find a static-name container", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    descriptions,
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setChosenStatisticName("name");
            wrapper.vm.setChartTableToggle("table");
            wrapper.vm.setSelectedDates([{value: "value1"}]);
            wrapper.vm.setSelectedRegions([{value: "value1"}]);
            wrapper.vm.setSelectedStatistics({
                "Bevölkerung maennlich": {
                    Hamburg: {
                        "1890": "13",
                        "1990": "113"
                    }
                },
                "Bevölkerung weiblich": {
                    Hamburg: {
                        "1890": "12",
                        "1990": "112"
                    }
                }
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.find(".static-name").exists()).to.be.true;
        });
    });

    describe("Computed Properties", () => {
        it("should set hasDescription to false", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.hasDescription).to.be.false;
        });

        it("should set hasDescription to true", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData,
                    descriptions
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.hasDescription).to.be.true;
        });

        it("should set init description content and title", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData,
                    descriptions
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.contentDescription).to.be.equal("ContentOne");
            expect(wrapper.vm.titleDescription).to.be.equal("TitleOne");
        });

        it("should set description content and title by the current index", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData,
                    descriptions
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({
                currentDescriptionIndex: 1
            });

            expect(wrapper.vm.contentDescription).to.be.equal("ContentTwo");
            expect(wrapper.vm.titleDescription).to.be.equal("TitleTwo");
        });
        it("should set precheckedViewSwitcher to buttonGroupControls 0 name", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions
                    },
                    global: {
                        plugins: [store]
                    }
                }),
                expected = wrapper.vm.buttonGroupControls[0].name;

            wrapper.vm.setChartTableToggle("table");
            expect(wrapper.vm.precheckedViewSwitcher).to.be.equal(expected);
        });
        it("should set precheckedViewSwitcher to buttonGroupControls 1 name", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions
                    },
                    global: {
                        plugins: [store]
                    }
                }),
                expected = wrapper.vm.buttonGroupControls[1].name;

            wrapper.vm.setChartTableToggle("chart");
            expect(wrapper.vm.precheckedViewSwitcher).to.be.equal(expected);
        });
        it("should set showStatisticnameInChart to be false", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData,
                    descriptions
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setChosenStatisticName("");
            wrapper.vm.setChartTableToggle("chart");
            expect(wrapper.vm.showStatisticnameInChart).to.be.false;
        });
        it("should set showStatisticnameInChart to be false", () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData,
                    descriptions
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setChosenStatisticName("name");
            wrapper.vm.setChartTableToggle("table");
            expect(wrapper.vm.showStatisticnameInChart).to.be.false;
            wrapper.vm.setChosenStatisticName("");
            wrapper.vm.setChartTableToggle("chart");
            expect(wrapper.vm.showStatisticnameInChart).to.be.false;
        });
        it("should set showStatisticnameInChart to be true", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData,
                    descriptions
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setChosenStatisticName("name");
            wrapper.vm.setChartTableToggle("chart");
            wrapper.vm.setSelectedDates([{value: "value1"}]);
            wrapper.vm.setSelectedRegions([{value: "value1"}]);
            wrapper.vm.setSelectedStatistics({
                "Bevölkerung maennlich": {
                    Hamburg: {
                        "1890": "13",
                        "1990": "113"
                    }
                },
                "Bevölkerung weiblich": {
                    Hamburg: {
                        "1890": "12",
                        "1990": "112"
                    }
                }
            });
            expect(wrapper.vm.showStatisticnameInChart).to.be.true;
        });
    });

    describe("Lifecycle Hooks", () => {
        it("should set the referenceTag undefined", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setSelectedReferenceData(undefined);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.referenceTag).to.be.undefined;
        });

        it("should set the referenceTag value with label", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.vm.setSelectedReferenceData({value: {label: "2001", value: "2001"}});

            expect(wrapper.vm.referenceTag).to.be.equal("2001");
        });

        it("should set the referenceTag value with value", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.vm.setSelectedReferenceData({value: "test"});

            expect(wrapper.vm.referenceTag).to.be.equal("test: ");
        });
    });

    describe("Methods", () => {
        describe("handleReferenceTag", () => {
            it("should set the referenceTag to undefined if undefined is given", () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.handleReferenceTag(undefined);
                expect(wrapper.vm.referenceTag).to.be.undefined;

            });
            it("should set the referenceTag to expected string if given param is an object with value attribute", () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.handleReferenceTag({value: "foo"});
                expect(wrapper.vm.referenceTag).to.be.equal("foo: ");

            });
            it("should set the referenceTag to expected string if given param is an object with an object as value for the property value", () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.handleReferenceTag({value: {label: "foo"}});
                expect(wrapper.vm.referenceTag).to.be.equal("foo");

            });
        });
        describe("nextDescription", () => {
            it("should set currentDescriptionIndex always to 0 if only one description is available", () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions: [descriptions[0]]
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.nextDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);
                wrapper.vm.nextDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);

            });

            it("should set currentDescriptionIndex in the correct order", () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);
                wrapper.vm.nextDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(1);
                wrapper.vm.nextDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(2);
                wrapper.vm.nextDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);

            });
        });
        describe("prevDescription", () => {
            it("should set currentDescriptionIndex always to 0 if only one description is available", () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions: [descriptions[0]]
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.prevDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);
                wrapper.vm.prevDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);

            });

            it("should set currentDescriptionIndex in the correct order", () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);
                wrapper.vm.prevDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(2);
                wrapper.vm.prevDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(1);
                wrapper.vm.prevDescription();
                expect(wrapper.vm.currentDescriptionIndex).to.be.equal(0);

            });
        });
        describe("prevStatistic", () => {
            it("should set the chosenStatisticName to the previous name", async () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                        propsData: {
                            referenceData
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {
                        "arbeitnehmer_inland_tausend": {
                            "key": "arbeitnehmer_inland_tausend",
                            "name": "Arbeitnehmer (Inland) in 1.000",
                            "category": "Beschäftigte",
                            "selectedOrder": 0
                        },
                        "arbeitslose_jahresdurchschnitt": {
                            "key": "arbeitslose_jahresdurchschnitt",
                            "name": "Arbeitslose",
                            "category": "Beschäftigte",
                            "selectedOrder": 1
                        }
                    };

                wrapper.vm.prevStatistic(1, statistics);
                await wrapper.vm.$nextTick();

                expect(wrapper.vm.chosenStatisticName).to.be.equal("Arbeitnehmer (Inland) in 1.000");
            });
        });
        describe("nextStatistic", () => {
            it("should set the chosenStatisticName to the next name", async () => {
                const wrapper = shallowMount(StatisticDashboardControls, {
                        propsData: {
                            referenceData
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {
                        "arbeitnehmer_inland_tausend": {
                            "key": "arbeitnehmer_inland_tausend",
                            "name": "Arbeitnehmer (Inland) in 1.000",
                            "category": "Beschäftigte",
                            "selectedOrder": 0
                        },
                        "arbeitslose_jahresdurchschnitt": {
                            "key": "arbeitslose_jahresdurchschnitt",
                            "name": "Arbeitslose",
                            "category": "Beschäftigte",
                            "selectedOrder": 1
                        }
                    };

                wrapper.vm.nextStatistic(0, statistics);
                await wrapper.vm.$nextTick();

                expect(wrapper.vm.chosenStatisticName).to.be.equal("Arbeitslose");
            });
        });
    });

    describe("User Interaction", () => {
        it("should set the description index if the user click the left chevron button", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions
                    },
                    global: {
                        plugins: [store]
                    }
                }),
                chevronLeftButton = wrapper.findAll("button.description-icons").at(0);

            await chevronLeftButton.trigger("click");
            expect(wrapper.vm.currentDescriptionIndex).to.be.equal(2);
        });

        it("should set the description index if the user click the right chevron button ", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData,
                        descriptions
                    },
                    global: {
                        plugins: [store]
                    }
                }),
                chevronRightButton = wrapper.findAll("button.description-icons").at(1);

            await chevronRightButton.trigger("click");
            expect(wrapper.vm.currentDescriptionIndex).to.be.equal(1);
        });

        it("should remove the reference data", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({referenceTag: "2001"});
            await wrapper.find(".reference-tag button").trigger("click");
            expect(wrapper.vm.selectedReferenceData).to.be.undefined;
            expect(wrapper.vm.referenceTag).to.be.undefined;
        });

        it("should set the chosenStatisticName to the previous name", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                propsData: {
                    referenceData
                },
                global: {
                    plugins: [store]
                }
            });
            let prevStatisticButton = "";

            wrapper.vm.setData({indexSelectedStatistics: 0});
            wrapper.vm.setSelectedStatistics({
                "arbeitnehmer_inland_tausend": {
                    "key": "arbeitnehmer_inland_tausend",
                    "name": "Arbeitnehmer (Inland) in 1.000",
                    "category": "Beschäftigte",
                    "selectedOrder": 0
                },
                "arbeitslose_jahresdurchschnitt": {
                    "key": "arbeitslose_jahresdurchschnitt",
                    "name": "Arbeitslose",
                    "category": "Beschäftigte",
                    "selectedOrder": 1
                }
            });
            wrapper.vm.setChartTableToggle("table");
            wrapper.vm.setSelectedDates([{value: "value1"}]);
            wrapper.vm.setSelectedRegions([{value: "value1"}]);

            await wrapper.vm.$nextTick();
            wrapper.vm.setData({indexSelectedStatistics: 1});
            prevStatisticButton = wrapper.findAll(".static-name button").at(0);
            prevStatisticButton.trigger("click");
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.chosenStatisticName).to.be.equal("Arbeitslose");
        });

        it("should set the chosenStatisticName to the next name", async () => {
            const wrapper = shallowMount(StatisticDashboardControls, {
                    propsData: {
                        referenceData
                    },
                    global: {
                        plugins: [store]
                    }
                }),
                nextStatisticButton = wrapper.findAll(".static-name button").at(1);

            wrapper.vm.setData({indexSelectedStatistics: 0});
            wrapper.vm.setSelectedStatistics({
                "arbeitnehmer_inland_tausend": {
                    "key": "arbeitnehmer_inland_tausend",
                    "name": "Arbeitnehmer (Inland) in 1.000",
                    "category": "Beschäftigte",
                    "selectedOrder": 0
                },
                "arbeitslose_jahresdurchschnitt": {
                    "key": "arbeitslose_jahresdurchschnitt",
                    "name": "Arbeitslose",
                    "category": "Beschäftigte",
                    "selectedOrder": 1
                }
            });
            wrapper.vm.setChartTableToggle("table");
            wrapper.vm.setSelectedDates([{value: "value1"}]);
            wrapper.vm.setSelectedRegions([{value: "value1"}]);

            await wrapper.vm.$nextTick();
            nextStatisticButton.trigger("click");
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.chosenStatisticName).to.be.equal("Arbeitslose");
        });
    });
});
