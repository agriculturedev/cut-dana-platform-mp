import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardFilter from "../../../components/StatisticDashboardFilter.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardFilter.vue", () => {
    const timeStepsFilter = [
            "Die letzten 5 Jahre",
            "Die letzten 10 Jahre",
            "Alle Jahre"
        ],
        regions = [
            {value: "Harburg", label: "Harburg"},
            {value: "Lübeck", label: "Lübeck"},
            {value: "Schwerin", label: "Schwerin"},
            {value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"}
        ];

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
            }
        });
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.exists()).to.be.true;
        });
        it("should render an accordion for statistics selection", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#filter-accordion-statistic").exists()).to.be.true;
        });
        it("should render an accordion for regions selection", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#filter-accordion-region").exists()).to.be.true;
        });
        it("should render an accordion for dates selection", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#filter-accordion-date").exists()).to.be.true;
        });
        it("should render a flat button component", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findComponent({name: "FlatButton"}).exists()).to.be.true;
        });
    });
    describe("Computed", () => {
        describe("validated", () => {
            it("should return false if no options are chosen.", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedStatistics({});
                wrapper.vm.setSelectedDates([]);
                wrapper.vm.setSelectedRegions([]);
                await wrapper.vm.$nextTick();

                expect(wrapper.vm.validated).to.be.false;
            });

            it("should return false if not all the options are chosen.", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        selectedCategories: []
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedCategories([{name: "Kategorie 1"}]);
                await wrapper.vm.$nextTick();

                expect(wrapper.vm.validated).to.be.false;
            });

            it("should return true if all the options are chosen.", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        selectedCategories: [{name: "Kategorie 1"}],
                        selectedDates: ["Die letzten 5 Jahre"],
                        selectedRegions: [{value: "Harburg", label: "Harburg"}],
                        statistics: [{
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            },
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            }
                        }]
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedStatistics({"stat1": {
                    category: "Kategorie 1",
                    name: "Stat eins"
                }});

                wrapper.vm.setSelectedCategories([{name: "Kategorie 1"}]);
                wrapper.vm.setSelectedDates(["Die letzten 5 Jahre"]);
                wrapper.vm.setSelectedRegions([{value: "Harburg", label: "Harburg"}]);

                await wrapper.vm.$nextTick();

                expect(wrapper.vm.validated).to.be.true;
            });
        });
    });

    // describe("Watchers", () => {
    //     describe("selectedCategory", () => {
    //         it("should emit 'resetStatistics' and 'changeCategory' with the name of", async () => {
    //             const wrapper = shallowMount(StatisticDashboardFilter, {
    //                 propsData: {
    //                     categories: [],
    //                     timeStepsFilter,
    //                     regions,
    //                     areCategoriesGrouped: false
    //                 },
    //                 global: {
    //                     plugins: [store]
    //                 }
    //             });

    //             wrapper.vm.setSelectedCategories({name: "Kategorie 1"});
    //             await wrapper.vm.$nextTick();
    //             expect(wrapper.emitted()).to.have.keys(["resetStatistics", "changeCategory"]);
    //             expect(wrapper.emitted().changeCategory).to.deep.equal([[{name: "Kategorie 1"}]]);
    //         });
    //     });
    // });

    describe("User Interactions", () => {
        it("should emit 'toggleFilter' if ths user click the 'back' button", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                }),
                flatButton = wrapper.findComponent({name: "FlatButton"});

            flatButton.vm.interaction();
            expect(wrapper.emitted()).to.have.keys(["resetStatistics", "toggleFilter"]);
        });
    });

    describe("Methods", () => {
        describe("allFilterSettingsSelected", () => {
            it("should return 1 if all given values are not empty", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.allFilterSettingsSelected({name: "name"}, [2], [3])).to.be.equals(1);

            });
            it("should return false if the first given value is not an object", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.allFilterSettingsSelected(undefined, [2], [3])).to.be.false;

            });
        });

        describe("addStatisticsToSelect", () => {
            it("should add a statistic if it is not already selected", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: [{
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            },
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            },
                            "stat3": {
                                category: "Kategorie 3",
                                name: "Stat drei"
                            }
                        }]
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.addStatisticsToSelect([{key: "stat1", name: "Stat eins"}, {key: "stat3", name: "Stat drei"}]);
                expect(wrapper.vm.selectedStatistics).to.deep.equals({"stat1": {name: "Stat eins", key: "stat1", selectedOrder: 0}, "stat3": {name: "Stat drei", key: "stat3", selectedOrder: 1}});

            });
        });

        describe("removeSelectedStatsByCategory", () => {
            it("should remove the statistics by the given category", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: [{
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            }
                        },
                        {
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            }
                        }]
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedCategories([{name: "Kategorie 1"}]);
                wrapper.vm.setSelectedStatistics({"stat1": {
                    category: "Kategorie 1",
                    name: "Stat eins"
                }});
                await wrapper.vm.$nextTick();
                wrapper.vm.removeSelectedStatsByCategory({name: "Kategorie 1"});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.selectedStatistics).to.be.an("object").to.be.empty;
            });
            it("should not remove the statistics by the given category if category 'alle' is selected", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: [{
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            }
                        },
                        {
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            }
                        }]
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedCategories([{name: "Kategorie 1"}, {name: "alle"}]);
                wrapper.vm.setSelectedStatistics({"stat1": {
                    category: "Kategorie 1",
                    name: "Stat eins"
                }});
                wrapper.vm.removeSelectedStatsByCategory({name: "Kategorie 1"});
                expect(wrapper.vm.selectedStatistics).to.deep.equal({"stat1": {
                    category: "Kategorie 1",
                    name: "Stat eins"
                }});
            });
            it("should remove all statistics whose category is not selected if 'alle' is passed", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: [{
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            }
                        },
                        {
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            }
                        }]
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedCategories([{name: "Kategorie 1"}, {name: "alle"}]);
                wrapper.vm.setSelectedStatistics({
                    "stat1": {
                        category: "Kategorie 1",
                        name: "Stat eins"
                    }
                },
                {
                    "stat2": {
                        category: "Kategorie 2",
                        name: "Stat zwei"
                    }
                });
                wrapper.vm.removeSelectedStatsByCategory({name: "alle"});
                expect(wrapper.vm.selectedStatistics).to.deep.equal({"stat1": {
                    category: "Kategorie 1",
                    name: "Stat eins"
                }});
            });
        });

        describe("getCategoriesSorted", () => {
            it("should return an empty array", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getCategoriesSorted()).to.be.an("array").that.is.empty;
            });
            it("should return the list given as it is", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                        propsData: {
                            categories: [],
                            timeStepsFilter,
                            regions,
                            areCategoriesGrouped: false,
                            statistics: false
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    unsorted = [{name: "foo"}, {name: "bar"}],
                    expected = [{name: "modules.statisticDashboard.button.all"}, {name: "foo"}, {name: "bar"}];

                expect(wrapper.vm.getCategoriesSorted(unsorted, [])).to.deep.equal(expected);
            });
            it("should return the list sorted by the selected ones at first", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                        propsData: {
                            categories: [],
                            timeStepsFilter,
                            regions,
                            areCategoriesGrouped: false,
                            statistics: false
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    unsorted = [{name: "foo"}, {name: "bar"}],
                    expected = [{name: "bar"}, {name: "modules.statisticDashboard.button.all"}, {name: "foo"}];

                expect(wrapper.vm.getCategoriesSorted(unsorted, [{name: "bar"}])).to.deep.equal(expected);
            });
        });

        describe("getStatisticNamesSorted", () => {
            it("should return an empty array", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getStatisticNamesSorted()).to.be.an("array").that.is.empty;
            });
            it("should return the names of the given statistics", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getStatisticNamesSorted(
                    [
                        {
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            }
                        }
                    ], {})
                ).to.deep.equal([{key: "stat1", name: "Stat eins", category: "Kategorie 1"}]);
            });
            it("should return the names of the given statistics with the right alphabetical position", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getStatisticNamesSorted(
                    [
                        {
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            },
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            }
                        }
                    ],
                    {
                        "stat2": {
                            category: "Kategorie 2",
                            name: "Stat zwei"
                        }
                    }
                )).to.deep.equal([
                    {key: "stat1", name: "Stat eins", category: "Kategorie 1"},
                    {key: "stat2", name: "Stat zwei", category: "Kategorie 2"}
                ]);
            });
        });

        describe("getSelectedStatisticNames", () => {
            it("should return an empty array", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getSelectedStatisticNames()).to.be.an("array").that.is.empty;
            });
            it("should return an array with the selected statistic names in expected format", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getSelectedStatisticNames(
                    {
                        "stat1": {
                            category: "Kategorie 1",
                            name: "Stat eins"
                        }
                    }
                )).to.deep.equal([{key: "stat1", name: "Stat eins", category: "Kategorie 1"}]);
            });
        });

        describe("getDatesSorted", () => {
            it("should return an empty array", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter: [],
                        regions,
                        areCategoriesGrouped: false,
                        statistics: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getDatesSorted([])).to.be.an("array").that.is.empty;
            });
            it("should return the array with all dates as given", () => {
                const localTimeSteps = [
                        {label: "Die letzten 5 Jahre", value: []},
                        {label: "Die letzten 10 Jahre", value: []},
                        {label: "Alle Jahre", value: []}
                    ],
                    wrapper = shallowMount(StatisticDashboardFilter, {
                        propsData: {
                            categories: [],
                            timeStepsFilter,
                            regions,
                            areCategoriesGrouped: false,
                            statistics: false
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.getDatesSorted(localTimeSteps)).to.deep.equal(localTimeSteps);
            });
            it("should return the array with the selected entries at first", () => {
                const localTimeSteps = [
                        {label: "Die letzten 5 Jahre", value: []},
                        {label: "Die letzten 10 Jahre", value: []},
                        {label: "Alle Jahre", value: []}
                    ],
                    wrapper = shallowMount(StatisticDashboardFilter, {
                        propsData: {
                            categories: [],
                            timeStepsFilter,
                            regions,
                            areCategoriesGrouped: false,
                            statistics: false
                        },
                        global: {
                            plugins: [store]
                        }
                    });

                expect(wrapper.vm.getDatesSorted(localTimeSteps, [{label: "Alle Jahre", value: []}])).to.deep.equal([
                    {label: "Alle Jahre", value: []},
                    {label: "Die letzten 5 Jahre", value: []},
                    {label: "Die letzten 10 Jahre", value: []}
                ]);
            });
        });
    });
});
