import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardFilterRegions from "../../../components/StatisticDashboardFilterRegions.vue";
import {Multiselect} from "vue-multiselect";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardFilterRegions.vue", () => {
    const factory = {
        createVuexStore: (initialState) => {
            return createStore({
                namespaced: true,
                modules: {
                    Maps: {
                        namespaced: true,
                        getters: {
                            projection: () => {
                                return {
                                    id: "http://www.opengis.net/gml/srs/epsg.xml#25832",
                                    name: "EPSG:25832",
                                    projName: "utm",
                                    getCode: () => "EPSG:25832"
                                };
                            }
                        }
                    },
                    Modules: {
                        namespaced: true,
                        modules: {
                            StatisticDashboard: {
                                state: {
                                    ...initialState
                                },
                                mutations: {
                                    setSelectedRegions: sinon.stub()
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    describe("Component DOM", () => {
        it("should exist", () => {
            const store = factory.createVuexStore(),
                wrapper = shallowMount(StatisticDashboardFilterRegions, {
                    propsData: {
                        regions: []
                    },
                    global: {
                        plugins: [store]
                    }
                });

            expect(wrapper.exists()).to.be.true;
        });

        it("should find one vue multiselect component and no buttos for top level regions", () => {
            const store = factory.createVuexStore(),
                wrapper = shallowMount(StatisticDashboardFilterRegions, {
                    propsData: {
                        regions: [{
                            attrName: "atlantis",
                            name: "Atlantis",
                            values: [],
                            selectedValues: []
                        }]
                    },
                    global: {
                        plugins: [store]
                    }
                });

            expect(wrapper.findAllComponents(Multiselect)).to.be.an("array").with.lengthOf(1);
            expect(wrapper.find("button").exists()).to.be.false;
        });

        it("should find two vue multiselect components and no buttos for top level regions", () => {
            const store = factory.createVuexStore(),
                wrapper = shallowMount(StatisticDashboardFilterRegions, {
                    propsData: {
                        regions: [
                            {
                                attrName: "atlantis",
                                name: "Atlantis",
                                values: [],
                                selectedValues: []
                            },
                            {
                                attrName: "auenland",
                                name: "Auenland",
                                values: [],
                                selectedValues: []
                            }
                        ]
                    },
                    global: {
                        plugins: [store]
                    }
                });

            expect(wrapper.findAllComponents(Multiselect)).to.be.an("array").with.lengthOf(2);
            expect(wrapper.find("button").exists()).to.be.false;
        });

        it("should find one vue multiselect components and buttos for top level regions", () => {
            const store = factory.createVuexStore(),
                wrapper = shallowMount(StatisticDashboardFilterRegions, {
                    propsData: {
                        regions: [
                            {
                                attrName: "atlantis",
                                name: "Atlantis",
                                values: [{label: "Hamen"}, {label: "Bremburg"}],
                                selectedValues: [],
                                child: {}
                            },
                            {
                                attrName: "auenland",
                                name: "Auenland",
                                values: [],
                                selectedValues: []
                            }
                        ]
                    },
                    global: {
                        plugins: [store]
                    }
                });

            expect(wrapper.findAllComponents(Multiselect)).to.be.an("array").with.lengthOf(1);
            expect(wrapper.findAll("button")).to.be.an("array").with.lengthOf(3);
            expect(wrapper.findAll("button").at(1).text()).to.be.equal("Hamen");
            expect(wrapper.findAll("button").at(2).text()).to.be.equal("Bremburg");
        });
    });
    describe("methods", () => {
        describe("hasRegionChild", () => {
            it("should return true if given object has the key child", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.hasRegionChild({child: true})).to.be.true;
            });
            it("should return false if given object has no key child", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.hasRegionChild({})).to.be.false;
            });
        });
        describe("regionsSorted", () => {
            it("should return an empty array", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.getRegionsSorted()).to.be.an("array").that.is.empty;
            });
            it("should return the array with all regions as given", () => {
                const regions = [
                        {value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"},
                        {value: "Harburg", label: "Harburg"},
                        {value: "Lübeck", label: "Lübeck"},
                        {value: "Schwerin", label: "Schwerin"}
                    ],
                    expectedRegions = [
                        {label: "modules.statisticDashboard.button.all"},
                        {value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"},
                        {value: "Harburg", label: "Harburg"},
                        {value: "Lübeck", label: "Lübeck"},
                        {value: "Schwerin", label: "Schwerin"}
                    ],
                    store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.getRegionsSorted(regions, [])).to.deep.equal(expectedRegions);
            });
            it("should return the array with the selected entries at first", () => {
                const regions = [
                        {value: "Harburg", label: "Harburg"},
                        {value: "Lübeck", label: "Lübeck"},
                        {value: "Schwerin", label: "Schwerin"},
                        {value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"}
                    ],
                    store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.getRegionsSorted(regions, [{value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"}])).to.deep.equal([
                    {value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"},
                    {label: "modules.statisticDashboard.button.all"},
                    {value: "Harburg", label: "Harburg"},
                    {value: "Lübeck", label: "Lübeck"},
                    {value: "Schwerin", label: "Schwerin"}
                ]);
            });
        });
        describe("setSelectedValuesToRegion", () => {
            it("should call 'setSelectedRegions' if given region has no child", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    stubSetSelectedRegions = sinon.stub(wrapper.vm, "setSelectedRegions");

                wrapper.vm.setSelectedValuesToRegion([], {});

                expect(stubSetSelectedRegions.calledOnce).to.be.true;
                expect(stubSetSelectedRegions.calledWith([])).to.be.true;
            });

            it("should call 'setSelectedRegions' if given region has child", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    stubSetSelectedRegions = sinon.stub(wrapper.vm, "setSelectedRegions");

                wrapper.vm.setSelectedValuesToRegion([], {child: {}});

                expect(stubSetSelectedRegions.calledOnce).to.be.true;
                expect(stubSetSelectedRegions.calledWith([])).to.be.true;
            });

            it("should call 'getValuesFromLayer' if given value is not empty array", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    stubGetValuesFromLayer = sinon.stub(wrapper.vm, "getValuesFromLayer");

                wrapper.vm.setSelectedValuesToRegion(["value"], {child: {}});

                expect(stubGetValuesFromLayer.calledOnce).to.be.true;
            });
        });
        describe("updatesRegionSelectedValues", () => {
            it("should remove the correct value", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    selectedValues = [{label: "Mordor"}, {label: "Manhatten"}],
                    values = [{label: "Mordor"}],
                    newSelectedValues = wrapper.vm.updatesRegionSelectedValues(selectedValues, values);

                expect(newSelectedValues).to.deep.equal([{label: "Mordor"}]);

            });

            it("should neither remove or add any value", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    selectedValues = [{label: "Mordor"}, {label: "Manhatten"}],
                    values = [{label: "Mordor"}, {label: "Manhatten"}, {label: "Wilhelmsburg"}],
                    newSelectedValues = wrapper.vm.updatesRegionSelectedValues(selectedValues, values);

                expect(newSelectedValues).to.deep.equal([{label: "Mordor"}, {label: "Manhatten"}]);
            });

            it("should remove all selected values", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    selectedValues = [{label: "Mordor"}, {label: "Manhatten"}],
                    values = [],
                    newSelectedValues = wrapper.vm.updatesRegionSelectedValues(selectedValues, values);

                expect(newSelectedValues).to.deep.equal([]);
            });
        });
        describe("updatesTopLevelRegionSelectedValues", () => {
            it("should call 'setSelectedValuesToRegion' with the correct params", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    stubSetSelectedValuesToRegion = sinon.stub(wrapper.vm, "setSelectedValuesToRegion"),
                    region = {
                        selectedValues: [{value: "Mordor"}, {value: "Manhatten"}]
                    };

                wrapper.vm.updatesTopLevelRegionSelectedValues({value: "Mordor"}, region);

                expect(stubSetSelectedValuesToRegion.calledWith([{value: "Manhatten"}], region)).to.be.true;
            });

            it("should call 'setSelectedValuesToRegion' with the correct params", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    stubSetSelectedValuesToRegion = sinon.stub(wrapper.vm, "setSelectedValuesToRegion"),
                    region = {
                        selectedValues: [{value: "Mordor"}, {value: "Manhatten"}]
                    };

                wrapper.vm.updatesTopLevelRegionSelectedValues({value: "Wilhelmsburg"}, region);

                expect(stubSetSelectedValuesToRegion.calledWith([{value: "Mordor"}, {value: "Manhatten"}, {value: "Wilhelmsburg"}], region)).to.be.true;
            });
        });
        describe("toggleButtonActive", () => {
            it("should get the string 'active-button'", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    classString = wrapper.vm.toggleButtonActive({value: "Mordor"}, [{value: "Mordor"}, {value: "Manhatten"}]);

                expect(classString).to.be.equal("active-button");
            });

            it("should get an empty string", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    classString = wrapper.vm.toggleButtonActive({value: "Mordor"}, [{value: "Manhatten"}]);

                expect(classString).to.be.equal("");
            });
        });
        describe("selectAll", () => {
            it("should call 'setSelectedValuesToRegion' with the correct parameter", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    stubSetSelectedValuesToRegion = sinon.stub(wrapper.vm, "setSelectedValuesToRegion"),
                    region = {
                        values: [{value: "test1"}, {value: "test2"}],
                        selectedValues: [{value: "Mordor"}]
                    };

                wrapper.vm.selectAll(region);

                expect(stubSetSelectedValuesToRegion.calledWith([{value: "Mordor"}, {value: "test1"}, {value: "test2"}], region)).to.be.true;
            });
        });
        describe("requestScheme", () => {
            it("should return false if the first param is not an object", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.requestScheme([])).to.be.false;
                expect(wrapper.vm.requestScheme(null)).to.be.false;
                expect(wrapper.vm.requestScheme(true)).to.be.false;
                expect(wrapper.vm.requestScheme(false)).to.be.false;
                expect(wrapper.vm.requestScheme("1234")).to.be.false;
                expect(wrapper.vm.requestScheme(1234)).to.be.false;
                expect(wrapper.vm.requestScheme(undefined)).to.be.false;
            });
            it("should return false if the second param is false", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.requestScheme({}, false)).to.be.false;
            });
            it("should return true if given region has all selected and parent snippets aswell", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: []
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.requestScheme({
                    attrName: "auenland",
                    name: "Auenland",
                    values: ["foo"],
                    selectedValues: ["foo"]
                }, true)).to.be.true;
            });
            it("should return true if given region has all selected and parent snippets aswell", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: [
                                {
                                    attrName: "atlantis",
                                    name: "Atlantis",
                                    values: ["foo"],
                                    selectedValues: ["foo"]
                                },
                                {
                                    attrName: "auenland",
                                    name: "Auenland",
                                    values: ["foo"],
                                    selectedValues: ["foo"]
                                }
                            ]
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.requestScheme({
                    attrName: "auenland",
                    name: "Auenland",
                    values: ["foo"],
                    selectedValues: ["foo"]
                }, true)).to.be.true;
            });
            it("should return false if given region has all selected and one parent snippet doesnt", () => {
                const store = factory.createVuexStore(),
                    wrapper = shallowMount(StatisticDashboardFilterRegions, {
                        propsData: {
                            regions: [
                                {
                                    attrName: "atlantis",
                                    name: "Atlantis",
                                    values: ["foo", "bar"],
                                    selectedValues: ["foo"]
                                },
                                {
                                    attrName: "auenland",
                                    name: "Auenland",
                                    values: ["foo"],
                                    selectedValues: ["foo"]
                                }
                            ]
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.requestScheme({
                    attrName: "auenland",
                    name: "Auenland",
                    values: ["foo"],
                    selectedValues: ["foo"]
                }, true)).to.be.false;
            });
        });
    });
});
