import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboard from "../../../components/StatisticDashboard.vue";
import FeatureHandler from "../../../js/handleFeatures.js";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import LegendComponent from "../../../components/StatisticDashboardLegend.vue";
import sinon from "sinon";
import fetchData from "../../../js/fetchData";
import ChartProcessor from "../../../js/chartProcessor";
import AccordionItem from "../../../../../shared/modules/accordion/components/AccordionItem.vue";
import {
    and as andFilter,
    equalTo as equalToFilter
} from "ol/format/filter";
import Feature from "ol/Feature.js";

config.global.mocks.$t = key => key;

/**
 * mocks secondary menu
 * @returns {void}
 */
function addSecondaryMenuElement () {
    const app = document.createElement("div");

    app.setAttribute("id", "mp-menu-secondaryMenu");
    document.body.append(app);
}

describe("src/modules/StatisticDashboard.vue", () => {
    const sourceStub = {
            clear: sinon.stub(),
            addFeature: sinon.stub(),
            addFeatures: sinon.stub()
        },
        featureList = [
            new Feature({
                bev_maennlich: "13",
                bev_weiblich: "12",
                jahr: "1890",
                ort: "Hamburg"

            }),
            new Feature({
                bev_maennlich: "113",
                bev_weiblich: "112",
                jahr: "1990",
                ort: "Hamburg"
            }),
            new Feature({
                bev_maennlich: "93",
                bev_weiblich: "92",
                jahr: "1990",
                ort: "Bremen"
            })
        ];

    let store;

    beforeEach(() => {
        addSecondaryMenuElement();
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: indexStatisticDashboard
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        projection: () => "EPSG:25832"
                    },
                    actions: {
                        addNewLayerIfNotExists: () => {
                            return Promise.resolve({
                                getSource: () => sourceStub
                            });
                        }
                    }
                }
            }});
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("Level name as switch button should not exist", () => {
            const wrapper = shallowMount(StatisticDashboard, {global: {
                plugins: [store]
            }});

            expect(wrapper.find(".level-switch").exists()).to.be.false;
        });

        it("The legend component should not exist", () => {
            const wrapper = shallowMount(StatisticDashboard, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findComponent(LegendComponent).exists()).to.be.false;
        });

        it("The legend component should exist", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({legendValue: ["legend"], showLegendView: true});

            expect(wrapper.findComponent(LegendComponent).exists()).to.be.true;
        });
        it("should render the legend accordion", async () => {
            const data = {
                    legendValue: [
                        {
                            "graphic": "data:image/svg+xml;charset=utf-8,<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'><polygon points='5,5 30,5 30,30 5,30' style='fill:rgb(158, 202, 225);fill-opacity:0.9;stroke:rgb(158, 202, 225);stroke-opacity:0.9;stroke-width:3;stroke-linecap:round;stroke-dasharray:;'/></svg>",
                            "name": "90"
                        }
                    ],
                    showNoticeText: false,
                    selectedLevel: {
                        id: ""
                    }
                },
                wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

            await wrapper.setData(data);

            expect(wrapper.findAllComponents(AccordionItem).at(0).attributes().id).to.equal("legend-accordion");
        });
        it("should not display statistic dashboard filter component", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({loadedFilterData: true});
            expect(wrapper.findComponent({name: "StatisticFilter"}).exists()).to.be.true;
            expect(wrapper.findComponent({name: "StatisticFilter"}).isVisible()).to.be.false;
        });
        it("should display statistic dashboard filter component", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({showFilter: true, loadedFilterData: true});
            expect(wrapper.findComponent({name: "StatisticFilter"}).exists()).to.be.true;
            expect(wrapper.findComponent({name: "StatisticFilter"}).isVisible()).to.be.true;
        });
        it("should render filter accordion component", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({loadedFilterData: true});
            expect(wrapper.findComponent({name: "AccordionItem"}).exists()).to.be.true;
        });
        it("should render filter search field if showLimitView is true", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({
                showLimitView: true,
                showChart: true
            });

            expect(wrapper.find(".filtered-areas").exists()).to.be.true;
        });
    });

    describe("computed properties", () => {
        describe("selectedStatisticsNames", () => {
            it("should return an empty array", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.selectedStatisticsNames).to.be.an("array").that.is.empty;
            });
            it("should return the correct statistic names", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedStatistics({stat1: {name: "Stat Eins"}, stat2: {name: "Stat Zwei"}});
                expect(wrapper.vm.selectedStatisticsNames).to.deep.equal(["Stat Eins", "Stat Zwei"]);
            });
        });
    });
    describe("watchers", () => {
        it("should not call 'checkFilterSettings' if selectedReferenceData is changed", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                }),
                spyCheckFilterSettings = sinon.stub(wrapper.vm, "checkFilterSettings");

            store.commit("Modules/StatisticDashboard/setSelectedReferenceData", "foo");
            await wrapper.vm.$nextTick();
            expect(spyCheckFilterSettings.calledOnce).to.be.false;
            sinon.restore();
        });

        it("should call 'checkFilterSettings' if selectedReferenceData is changed", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                }),
                spyCheckFilterSettings = sinon.stub(wrapper.vm, "checkFilterSettings");

            wrapper.vm.setSelectedReferenceData("too");
            wrapper.vm.setSelectedDates(["too"]);
            wrapper.vm.setSelectedRegions(["too"]);

            await wrapper.vm.$nextTick();

            expect(spyCheckFilterSettings.calledOnce).to.be.true;
            sinon.restore();
        });

        it("should call 'handleChartData' if chosenStatisticName is changed", async () => {
            const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                }),
                spyHandleChartData = sinon.stub(wrapper.vm, "handleChartData");

            store.commit("Modules/StatisticDashboard/setChosenStatisticName", "foo");
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();
            expect(spyHandleChartData.calledOnce).to.be.true;
            sinon.restore();
        });

    });


    describe("methods", () => {
        describe("downloadData", () => {
            it("should call onsuccess without params", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    onsuccess = sinon.stub(),
                    statisticsData = wrapper.vm.statisticsData;

                wrapper.vm.downloadData(onsuccess);
                wrapper.vm.statisticsData = null;
                expect(onsuccess.calledWith(null)).to.be.true;
                wrapper.vm.statisticsData = statisticsData;
                sinon.restore();
            });
            it("should call onsuccess with expected params", () => {
                const statisticsTmp = {
                        "Arbeitslose": {
                            "Herzogtum Lauenburg": {
                                "2020": 5785,
                                "2021": 5603
                            },
                            "Harburg": {
                                "2020": 6166,
                                "2021": 6186
                            }
                        },
                        "Arbeitslose 15 bis unter 25 Jahre": {
                            "Herzogtum Lauenburg": {
                                "2020": 643,
                                "2021": 597
                            },
                            "Harburg": {
                                "2020": 670,
                                "2021": 591
                            }
                        }
                    },
                    wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    onsuccess = sinon.stub(),
                    statisticsData = wrapper.vm.statisticsData,
                    expected = [
                        ["", "Arbeitslose", "Arbeitslose", "Arbeitslose 15 bis unter 25 Jahre", "Arbeitslose 15 bis unter 25 Jahre"],
                        ["Gebiet", "2021", "2020", "2021", "2020"],
                        ["Herzogtum Lauenburg", 5603, 5785, 597, 643],
                        ["Harburg", 6186, 6166, 591, 670]
                    ];

                wrapper.vm.statisticsData = statisticsTmp;
                wrapper.vm.downloadData(onsuccess);
                expect(onsuccess.getCall(0).args[0]).to.deep.equal(expected);
                wrapper.vm.statisticsData = statisticsData;
                sinon.restore();
            });
        });
        describe("getUniqueValuesForLevel", () => {
            it("should return an empty object if first parm is not an object", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(await wrapper.vm.getUniqueValuesForLevel(undefined)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel([])).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(null)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(true)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(false)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(1234)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel("1234")).to.be.an("object").that.is.empty;
            });
            it("should return an empty object if first param has no child object called mappingFilter", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(await wrapper.vm.getUniqueValuesForLevel({})).to.be.an("object").that.is.empty;
            });
            it("should return an empty object if first param has a child object but not expected structure", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(await wrapper.vm.getUniqueValuesForLevel({
                    mappingFilter: {}
                })).to.be.an("object").that.is.empty;
            });
            it("should call expected function with expected params", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    layerId = "1234",
                    attrNames = [
                        "fooBAR",
                        "fowWaw"
                    ];

                sinon.stub(fetchData, "getUniqueValues");
                await wrapper.vm.getUniqueValuesForLevel({
                    layerId,
                    mappingFilter: {
                        timeAttribute: {
                            attrName: "fooBAR"
                        },
                        regionNameAttribute: {
                            attrName: "fowWaw"
                        }
                    }
                });

                expect(fetchData.getUniqueValues.calledWith(layerId, attrNames, undefined, undefined)).to.be.true;
                sinon.restore();
            });
        });
        describe("getTimestepsMerged", () => {
            it("should return an empty array if first param and second param are not objects", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getTimestepsMerged(undefined, undefined)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(null, null)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged([], [])).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(true, true)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(false, false)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(1234, 1234)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged("1234", "1234")).to.be.an("array").that.is.empty;
            });
            it("should return an empty array if second param is not an object but first is", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getTimestepsMerged({foo: "bar"})).to.be.an("array").that.is.empty;
            });
            it("should return only the values of the second param as array with invalid dates", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    uniqueList = {foo: true, bar: true},
                    expected = [{value: "bar", label: "Invalid Date"}, {value: "foo", label: "Invalid Date"}];

                expect(wrapper.vm.getTimestepsMerged(undefined, uniqueList)).to.deep.equal(expected);
            });
            it("should return a merged array based of the given two objects", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    uniqueList = {bar: true, buz: true, foo: true},
                    configSteps = {2: "Last 2 Years"},
                    expected = [{value: ["buz", "foo"], label: "Last 2 Years"}, {value: "foo", label: "Invalid Date"}, {value: "buz", label: "Invalid Date"}, {value: "bar", label: "Invalid Date"}];

                expect(wrapper.vm.getTimestepsMerged(configSteps, uniqueList)).to.deep.equal(expected);
            });
        });
        describe("getAllRegions", () => {
            it("should return an empty array if there are no regions found", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getAllRegions(undefined)).to.deep.equal([]);
                expect(wrapper.vm.getAllRegions("")).to.deep.equal([]);
                expect(wrapper.vm.getAllRegions(true)).to.deep.equal([]);
                expect(wrapper.vm.getAllRegions({})).to.deep.equal([]);
                expect(wrapper.vm.getAllRegions(true)).to.deep.equal([]);
                expect(wrapper.vm.getAllRegions(0)).to.deep.equal([]);
            });

            it("should return an array with all option", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getAllRegions(["test", "test2"])).to.deep.equal([
                    {value: ["test", "test2"], label: "Alle Gebiete"},
                    {value: "test", label: "test"},
                    {value: "test2", label: "test2"}
                ]);
            });
        });
        describe("setStatisticsByCategories", () => {
            it("should set all statistics if the category 'alle' is passed", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.categories = [{name: "Beschäftigte"}, {name: "Bevölkerung"}];
                wrapper.vm.setSelectedLevel({
                    "mappingFilter": {
                        "statisticsAttributes": {
                            "beschaeftigte": {
                                "name": "Beschäftigte",
                                "category": "Beschäftigte"
                            },
                            "bevoelkerung": {
                                "name": "Bevölkerung",
                                "category": "Bevölkerung"
                            }
                        }
                    }
                });

                wrapper.vm.setStatisticsByCategories([{name: i18next.t("common:modules.statisticDashboard.button.all")}]);
                expect(wrapper.vm.statisticsByCategory).to.deep.equal([{
                    "beschaeftigte": {
                        "name": "Beschäftigte",
                        "category": "Beschäftigte"
                    }
                },
                {
                    "bevoelkerung": {
                        "name": "Bevölkerung",
                        "category": "Bevölkerung"
                    }
                }]);
            });
            it("should set the statistics by the given category", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.categories = [{name: "Beschäftigte"}, {name: "Bevölkerung"}];
                wrapper.vm.setSelectedLevel({
                    "mappingFilter": {
                        "statisticsAttributes": {
                            "beschaeftigte": {
                                "name": "Beschäftigte",
                                "category": "Beschäftigte"
                            },
                            "bevoelkerung": {
                                "name": "Bevölkerung",
                                "category": "Bevölkerung"
                            }
                        }
                    }
                });

                wrapper.vm.setStatisticsByCategories([{name: "Beschäftigte"}]);
                expect(wrapper.vm.statisticsByCategory).to.deep.equal([{
                    "beschaeftigte": {
                        "name": "Beschäftigte",
                        "category": "Beschäftigte"
                    }
                }]);
            });
        });
        describe("getFilter", () => {
            it("should return undefined if given params has the same length as the data variables", () => {
                const regions = ["foo", "bar"],
                    dates = ["01.01.1999", "01.01.2000"],
                    wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    });

                wrapper.vm.regions = regions;
                wrapper.vm.dates = dates;
                wrapper.vm.setSelectedLevel({
                    mappingFilter: {
                        regionNameAttribute: {
                            attrName: "bar"
                        }
                    }
                });
                wrapper.vm.setFlattenedRegions([{
                    values: ["foo", "bar"]
                }]);

                expect(wrapper.vm.getFilter(regions, dates)).to.be.undefined;
            });
            it("should call getFilterForList with expected params if regions is the same length as the data variable", () => {
                const regions = ["foo", "bar"],
                    dates = ["01.01.1999", "01.01.2000"],
                    wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    getFilterForListSpy = sinon.spy(wrapper.vm, "getFilterForList");

                wrapper.vm.dates = ["01.01.1999"];
                wrapper.vm.setSelectedLevel({
                    mappingFilter: {
                        regionNameAttribute: {
                            attrName: "bar"
                        }
                    }
                });
                wrapper.vm.setFlattenedRegions([{
                    values: ["foo", "bar"]
                }]);

                wrapper.vm.getFilter(regions, dates);
                expect(getFilterForListSpy.calledWith(dates, undefined)).to.be.true;
                sinon.restore();
            });
            it("should call getFilterForList with expected params if dates is the same length as the data variable", () => {
                const regions = ["foo", "bar"],
                    dates = ["01.01.1999", "01.01.2000"],
                    wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    getFilterForListSpy = sinon.spy(wrapper.vm, "getFilterForList");

                wrapper.vm.dates = dates;
                wrapper.vm.setSelectedLevel({
                    mappingFilter: {
                        regionNameAttribute: {
                            attrName: "bar"
                        }
                    }
                });
                wrapper.vm.setFlattenedRegions([{
                    values: ["foo"]
                }]);

                wrapper.vm.getFilter(regions, dates);
                expect(getFilterForListSpy.calledWith(regions, "bar")).to.be.true;
                sinon.restore();
            });
            it("should return an and filter if given regions and dates have values but not the same length as the data values", () => {
                const regions = ["foo"],
                    dates = ["01.01.1999"],
                    eq1 = equalToFilter("bar", "foo"),
                    eq2 = equalToFilter("bow", "01.01.1999"),
                    expected = andFilter(eq2, eq1),
                    wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    });

                wrapper.vm.dates = [...dates, "01.01.2001"];
                wrapper.vm.setSelectedLevel({
                    mappingFilter: {
                        timeAttribute: {
                            attrName: "bow"
                        },
                        regionNameAttribute: {
                            attrName: "bar"
                        }
                    }
                });
                wrapper.vm.setFlattenedRegions([{
                    values: ["foo", "faw"]
                }]);

                expect(wrapper.vm.getFilter(regions, dates)).to.deep.equal(expected);
            });
            it("should call andFilter if given regions are all regions and more than one region level is defined and not parent regions have all selected", () => {
                const regions = ["foo", "bar"],
                    dates = ["01.01.1999", "01.01.2000"],
                    wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    getFilterForListSpy = sinon.spy(wrapper.vm, "getFilterForList");

                wrapper.vm.dates = ["01.01.1999"];
                wrapper.vm.setSelectedLevel({
                    mappingFilter: {
                        regionNameAttribute: {
                            attrName: "bar"
                        },
                        timeAttribute: {
                            attrName: "date"
                        }
                    }
                });
                wrapper.vm.setFlattenedRegions([
                    {attrName: "foo", selectedValues: ["foo"], values: ["foo"], child: "foo"},
                    {attrName: "bar", selectedValues: [{label: "bar"}], values: ["bar", "baz"], child: "foo"},
                    {attrName: "baz", selectedValues: [{label: "modules.statisticDashboard.button.all"}], values: ["bar", "baz"]}
                ]);

                wrapper.vm.getFilter(regions, dates);
                expect(getFilterForListSpy.getCall(0).args).to.deep.equal([dates, "date"]);
                expect(getFilterForListSpy.getCall(1).args).to.deep.equal([["bar"], "bar"]);
                sinon.restore();
            });
        });
        describe("getFilterForList", () => {
            it("should return undefined if given list is not an array", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getFilterForList(undefined)).to.be.undefined;
                expect(wrapper.vm.getFilterForList({})).to.be.undefined;
                expect(wrapper.vm.getFilterForList(null)).to.be.undefined;
                expect(wrapper.vm.getFilterForList(true)).to.be.undefined;
                expect(wrapper.vm.getFilterForList(false)).to.be.undefined;
                expect(wrapper.vm.getFilterForList("1234")).to.be.undefined;
                expect(wrapper.vm.getFilterForList(1234)).to.be.undefined;
            });
            it("should return an equalTo filter", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    result = wrapper.vm.getFilterForList(["foo"], "bar");

                expect(result.tagName_).to.be.equal("PropertyIsEqualTo");
            });
            it("should return an equalTo filter", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    result = wrapper.vm.getFilterForList(["foo", "fow"], "bar");


                expect(result.tagName_).to.be.equal("Or");
            });
        });
        describe("updateReferenceTag", () => {
            it("should not call the method spySetSelectedReferenceValueTag", () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {});
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    spySetSelectedReferenceValueTag = sinon.stub(wrapper.vm, "setSelectedReferenceValueTag");

                wrapper.vm.updateReferenceTag(undefined);

                expect(spySetSelectedReferenceValueTag.calledOnce).to.be.false;


                sinon.restore();
            });
            it("should not call the method spySetSelectedReferenceValueTag", () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {});
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    spySetSelectedReferenceValueTag = sinon.stub(wrapper.vm, "setSelectedReferenceValueTag");

                wrapper.vm.updateReferenceTag("2001", undefined);

                expect(spySetSelectedReferenceValueTag.calledOnce).to.be.false;


                sinon.restore();
            });
            it("should not call the method spySetSelectedReferenceValueTag", () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {});
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    spySetSelectedReferenceValueTag = sinon.stub(wrapper.vm, "setSelectedReferenceValueTag"),
                    selectedLevel = {
                        "layerId": "28992",
                        "geometryAttribute": "geom",
                        "timeStepsFilter": {
                            "5": "Die letzten 5 Jahre",
                            "10": "Die letzten 10 Jahre",
                            "all": "Alle Jahre"
                        },
                        "mappingFilter": {
                            "beschaeftigte": {
                                "name": "Beschäftigte",
                                "category": "Beschäftigte",
                                "useConfigName": true
                            }
                        }
                    };

                wrapper.vm.updateReferenceTag("2001", selectedLevel, undefined);

                expect(spySetSelectedReferenceValueTag.calledOnce).to.be.false;


                sinon.restore();
            });
            it("should call the method getSelectedLevelDateAttribute", () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {});
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    selectedLevel = {
                        "layerId": "28992",
                        "geometryAttribute": "geom",
                        "timeStepsFilter": {
                            "5": "Die letzten 5 Jahre",
                            "10": "Die letzten 10 Jahre",
                            "all": "Alle Jahre"
                        },
                        "mappingFilter": {
                            "beschaeftigte": {
                                "name": "Beschäftigte",
                                "category": "Beschäftigte",
                                "useConfigName": true
                            }
                        }
                    },
                    referenceFeatures = {
                        "2022-12-31": 70885,
                        "2021-12-31": 69010
                    },
                    spyGetSelectedLevelDateAttribute = sinon.stub(wrapper.vm, "getSelectedLevelDateAttribute");

                wrapper.vm.updateReferenceTag("2021", selectedLevel, referenceFeatures);

                expect(spyGetSelectedLevelDateAttribute.calledOnce).to.be.true;


                sinon.restore();
            });
        });
        describe("setSelectedColumn", () => {
            it("should call 'getStepValue' with the correct arguments", async () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", undefined);
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    stubGetStepValue = sinon.stub(FeatureHandler, "getStepValue");

                await wrapper.setData({statisticsData: {}});
                wrapper.vm.setSelectedColumn("2022");

                expect(stubGetStepValue.calledWith(undefined, 5, "2022")).to.be.true;

                sinon.restore();
            });
        });
        describe("getStatisticValue", () => {
            it("should return the right statistic value", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    value = wrapper.vm.getStatisticValue(featureList, "bev_maennlich", "Hamburg", "ort", "1890", "jahr");

                expect(value).to.be.equal(13);
            });
            it("should call prepareChartData with expected params for line chart", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    value = wrapper.vm.getStatisticValue(featureList, "bev_maennlich", "Hamburg", "ort", "1790", "jahr");

                expect(value).to.be.equal("-");
            });

            it("should return the right statistic value if reference date is set", () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {value: {value: "1990"}});

                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    value = wrapper.vm.getStatisticValue(featureList, "bev_maennlich", "Hamburg", "ort", "1890", "jahr", "date");

                expect(value).to.be.equal(-100);
            });

            it("should return the right statistic value if reference region is set", () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {value: "Bremen"});

                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    value = wrapper.vm.getStatisticValue(featureList, "bev_maennlich", "Hamburg", "ort", "1990", "jahr", "region");

                expect(value).to.be.equal(20);
            });
        });
        describe("prepareStatisticsData", () => {
            it("should return an object representing the statistics from the features", () => {
                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {});

                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {
                        "Bevölkerung maennlich": {
                            Hamburg: {
                                "1890": 13,
                                "1990": 113
                            }
                        },
                        "Bevölkerung weiblich": {
                            Hamburg: {
                                "1890": 12,
                                "1990": 112
                            }
                        }
                    };

                wrapper.vm.statisticsByCategory = [{
                    "bev_maennlich": {
                        "name": "Bevölkerung maennlich"
                    },
                    "bev_weiblich": {
                        "name": "Bevölkerung weiblich"
                    }
                }];

                expect(wrapper.vm.prepareStatisticsData(featureList, ["Bevölkerung maennlich", "Bevölkerung weiblich"], ["Hamburg"], ["1890", "1990"], {outputFormat: "YYYY", attrName: "jahr"}, {attrName: "ort"})).to.deep.equal(statistics);
            });

            it("should return an object representing the statistics from the features without the reference date", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {
                        "Bevölkerung maennlich": {
                            Hamburg: {
                                "1990": 113
                            }
                        },
                        "Bevölkerung weiblich": {
                            Hamburg: {
                                "1990": 112
                            }
                        }
                    };

                wrapper.vm.statisticsByCategory = [{
                    "bev_maennlich": {
                        "name": "Bevölkerung maennlich"
                    },
                    "bev_weiblich": {
                        "name": "Bevölkerung weiblich"
                    }
                }];

                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {value: {value: "1890"}});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.prepareStatisticsData(featureList, ["Bevölkerung maennlich", "Bevölkerung weiblich"], ["Hamburg"], ["1890", "1990"], {outputFormat: "YYYY", attrName: "jahr"}, {attrName: "ort"})).to.deep.equal(statistics);
            });
            it("should return an object representing the statistics from the features without the reference region", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {
                        "Bevölkerung maennlich": {
                            Bremen: {
                                "1890": "-",
                                "1990": 93
                            }
                        },
                        "Bevölkerung weiblich": {
                            Bremen: {
                                "1890": "-",
                                "1990": 92
                            }
                        }
                    };

                wrapper.vm.statisticsByCategory = [{
                    "bev_maennlich": {
                        "name": "Bevölkerung maennlich"
                    },
                    "bev_weiblich": {
                        "name": "Bevölkerung weiblich"
                    }
                }];

                store.commit("Modules/StatisticDashboard/setSelectedReferenceData", {value: "Hamburg"});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.prepareStatisticsData(featureList, ["Bevölkerung maennlich", "Bevölkerung weiblich"], ["Hamburg", "Bremen"], ["1890", "1990"], {outputFormat: "YYYY", attrName: "jahr"}, {attrName: "ort"})).to.deep.equal(statistics);
            });
        });
        describe("getTableData", () => {
            it("should return an empty array if there are no statistic data", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getTableData({}, "")).to.deep.equal([]);
            });

            it("should return the data for the table(s) from the statistics object according the chosen statistic name", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    preparedData = {
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
                    },
                    expectedValue = [{
                        headers: [
                            {name: "Gebiet", index: 0},
                            {name: "1990", index: 1},
                            {name: "1890", index: 2}
                        ],
                        items: [{
                            "1890": "12",
                            "1990": "112",
                            "Gebiet": "Hamburg"
                        }]
                    }];

                expect(wrapper.vm.getTableData(preparedData, "Bevölkerung weiblich")).to.deep.equal(expectedValue);
            });
        });
        describe("handleChartData", () => {
            it("should call prepareGridCharts with expected params", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    prepareGridChartsStub = sinon.stub(wrapper.vm, "prepareGridCharts");

                wrapper.vm.handleChartData(["foo", "bar"], [1], [], undefined, false);
                expect(prepareGridChartsStub.calledWith(["foo", "bar"], undefined, "vertical", false)).to.be.true;
            });
            it("should call prepareChartData with expected params for line chart", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    prepareChartDataStub = sinon.stub(wrapper.vm, "prepareChartData");

                wrapper.vm.handleChartData(["foo"], ["region1"], ["date1", "date2"], {foo: "bar"});
                await wrapper.vm.$nextTick();
                expect(prepareChartDataStub.calledWith("foo", "bar", undefined, "line")).to.be.true;
                sinon.restore();
            });
            it("should call prepareChartData with expected params for bar chart", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    prepareChartDataStub = sinon.stub(wrapper.vm, "prepareChartData");

                wrapper.vm.handleChartData(["foo"], ["region1"], ["date1"], {foo: "bar"});
                await wrapper.vm.$nextTick();
                expect(prepareChartDataStub.calledWith("foo", "bar", undefined, "bar", "vertical")).to.be.true;
                sinon.restore();
            });
            it("should call prepareChartData with expected params for bar chart horizontal", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    prepareChartDataStub = sinon.stub(wrapper.vm, "prepareChartData");

                wrapper.vm.handleChartData(["foo"], ["region1", "region2", "region3", "region4", "region5"], ["date1"], {foo: "bar"}, false);
                await wrapper.vm.$nextTick();
                expect(prepareChartDataStub.calledWith("foo", "bar", undefined, "bar", "horizontal")).to.be.true;
                sinon.restore();
            });
        });
        describe("prepareChartData", () => {
            it("should set canvas and chart to property currentChart", () => {
                sinon.stub(ChartProcessor, "createLineChart").returns(null);
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    topic = "fooBar",
                    canvas = document.createElement("canvas"),
                    expected = {};

                expected[topic] = {
                    chart: null
                };
                wrapper.vm.prepareChartData(topic, undefined, canvas, "line");
                expect(wrapper.vm.currentChart).to.deep.equal(expected);
                sinon.restore();
            });
            it("should set canvas and chart to property currentChart for bar", () => {
                sinon.stub(ChartProcessor, "createBarChart").returns(null);
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    topic = "fooBar",
                    canvas = document.createElement("canvas"),
                    expected = {};

                expected[topic] = {
                    chart: null
                };
                wrapper.vm.prepareChartData(topic, undefined, canvas, "bar");
                expect(wrapper.vm.currentChart).to.deep.equal(expected);
                sinon.restore();
            });
            it("should destroy existing chart and set canvas and chart to property currentChart", async () => {
                sinon.stub(ChartProcessor, "createLineChart").returns(null);
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    topic = "fooBar",
                    expected = {};

                expected[topic] = {
                    chart: null
                };
                wrapper.vm.currentChart[topic] = {
                    chart: {destroy: () => sinon.stub()}
                };
                await wrapper.vm.$nextTick();
                wrapper.vm.prepareChartData(topic, undefined, undefined, "line");
                expect(wrapper.vm.currentChart).to.deep.equal(expected);
                sinon.restore();
            });
        });
        describe("hasDescription", () => {
            it("should return true if a description is present", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {statistik: {name: "Statistik1", description: "StatistikTest1"}};

                expect(wrapper.vm.hasDescription(statistics)).to.be.true;
            });
            it("should return false if no description is present", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {statistik: {name: "Statistik1"}};

                expect(wrapper.vm.hasDescription(statistics)).to.be.false;
            });
            it("should return true if at least one description is present", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {statistik: {name: "Statistik1"}, statitsik2: {name: "Statistik2", description: "StatistikTest2"}};

                expect(wrapper.vm.hasDescription(statistics)).to.be.true;
            });
        });
        describe("setDescriptionsOfSelectedStatistics", () => {
            it("should return a description with title and content", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    statistics = {statistik: {name: "Statistik1", description: "StatistikTest1"}},
                    expected = [{content: "StatistikTest1", title: "Statistik1"}];

                expect(wrapper.vm.setDescriptionsOfSelectedStatistics(statistics)).to.deep.equal(expected);
            });
        });
        describe("toggleLevel", () => {
            it("should not trigger the resetLevel function", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    spyResetLevel = sinon.stub(StatisticDashboard.methods, "resetLevel");

                wrapper.vm.toggleLevel(null);
                await wrapper.vm.$nextTick();
                expect(spyResetLevel.calledOnce).to.be.false;
                wrapper.vm.toggleLevel(true);
                await wrapper.vm.$nextTick();
                expect(spyResetLevel.calledOnce).to.be.false;
                sinon.restore();

            });

            it("should not trigger the initializeData function", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    spyInitializeData = sinon.stub(StatisticDashboard.methods, "initializeData");

                wrapper.vm.toggleLevel(null);
                await wrapper.vm.$nextTick();
                expect(spyInitializeData.calledOnce).to.be.false;
                wrapper.vm.toggleLevel(true);
                await wrapper.vm.$nextTick();
                expect(spyInitializeData.calledOnce).to.be.false;
                sinon.restore();

            });
        });
        describe("formatFilterExpression", () => {
            it("should return the input if first param is undefined", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.formatFilterExpression(undefined)).to.undefined;
            });
            it("should return the input if second param is not a boolean", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.formatFilterExpression("foo", undefined)).to.be.equal("foo");
                expect(wrapper.vm.formatFilterExpression("foo", null)).to.be.equal("foo");
                expect(wrapper.vm.formatFilterExpression("foo", {})).to.be.equal("foo");
                expect(wrapper.vm.formatFilterExpression("foo", [])).to.be.equal("foo");
                expect(wrapper.vm.formatFilterExpression("foo", 1234)).to.be.equal("foo");
                expect(wrapper.vm.formatFilterExpression("foo", "1234")).to.be.equal("foo");
            });
            it("should return the input as date parsed", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    expected = "DATE('01-01-2000')";

                expect(wrapper.vm.formatFilterExpression("01-01-2000", true)).to.be.equal(expected);
            });
            it("should return the input as string parsed", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    expected = "'01-01-2000'";

                expect(wrapper.vm.formatFilterExpression("01-01-2000", false)).to.be.equal(expected);
            });
            it("should return the input as string parsed without single quotes", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    expected = "10";

                expect(wrapper.vm.formatFilterExpression(10, false)).to.be.equal(expected);
            });
        });
        describe("parseOLFilterToOAF", () => {
            it("should return an empty string if the params are not as expected", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.parseOLFilterToOAF(undefined)).to.be.equal("");
                expect(wrapper.vm.parseOLFilterToOAF({}, undefined)).to.be.equal("");
            });
            it("should return an empty string if the filter has no conditions or is not an filter at all", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.parseOLFilterToOAF({}, {})).to.be.equal("");
            });
            it("should return a string if filter has no conditions but is an filter by itself", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    filter = {
                        propertyName: "foo",
                        tagName_: "PropertyIsEqualTo",
                        expression: "bar"
                    },
                    expected = `${filter.propertyName} = ${wrapper.vm.formatFilterExpression(filter.expression, false)}`;

                expect(wrapper.vm.parseOLFilterToOAF(filter, {"PropertyIsEqualTo": "="})).to.be.equal(expected);
            });
            it("should return a string of a nested filter condition", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    filter = {
                        tagName_: "And",
                        conditions: [
                            {
                                tagName_: "Or",
                                conditions: [
                                    {
                                        propertyName: "foo",
                                        tagName_: "PropertyIsEqualTo",
                                        expression: "bar"
                                    },
                                    {
                                        propertyName: "foo",
                                        tagName_: "PropertyIsEqualTo",
                                        expression: "baz"
                                    }
                                ]
                            },
                            {
                                tagName_: "Or",
                                conditions: [
                                    {
                                        propertyName: "boo",
                                        tagName_: "PropertyIsEqualTo",
                                        expression: "bar"
                                    },
                                    {
                                        propertyName: "boo",
                                        tagName_: "PropertyIsEqualTo",
                                        expression: "baz"
                                    }
                                ]
                            }
                        ]
                    },
                    expected = "(foo = 'bar' OR foo = 'baz') AND (boo = 'bar' OR boo = 'baz')";

                expect(wrapper.vm.parseOLFilterToOAF(filter, {
                    "Or": "OR",
                    "And": "AND",
                    "PropertyIsEqualTo": "=",
                    "PropertyIsNotEqualTo": "<>",
                    "PropertyIsLessThan": "<",
                    "PropertyIsLessThanOrEqualTo": "<=",
                    "PropertyIsGreaterThan": ">",
                    "PropertyIsGreaterThanOrEqualTo": ">="
                })).to.be.equal(expected);
            });
        });
        describe("toggleFilter", () => {
            it("should toggle the value of showFilter", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.toggleFilter();
                expect(wrapper.vm.showFilter).to.be.true;
                wrapper.vm.toggleFilter();
                expect(wrapper.vm.showFilter).to.be.false;
            });
        });
        describe("removeFilter", () => {
            it("should remove the correct date filter", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedDates([{label: 2000, value: 2000}, {label: 666, value: 666}]);
                wrapper.vm.setSelectedRegions([{label: "Hamburg", value: "Hamburg"}, {label: "Bremen", value: "Bremen"}]);
                wrapper.vm.removeFilter(2000);
                expect(wrapper.vm.selectedDates).to.deep.equal([{label: 666, value: 666}]);
                expect(wrapper.vm.selectedRegions).to.deep.equal([{label: "Hamburg", value: "Hamburg"}, {label: "Bremen", value: "Bremen"}]);
            });
            it("should remove the correct region filter", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedDates([{label: 2000, value: 2000}, {label: 666, value: 666}]);
                wrapper.vm.setSelectedRegions([{label: "Hamburg", value: "Hamburg"}, {label: "Bremen", value: "Bremen"}]);
                wrapper.vm.removeFilter("Bremen");
                expect(wrapper.vm.selectedDates).to.deep.equal([{label: 2000, value: 2000}, {label: 666, value: 666}]);
                expect(wrapper.vm.selectedRegions).to.deep.equal([{label: "Hamburg", value: "Hamburg"}]);
            });
            it("should remove the correct statistic filter", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedDates([{label: 2000, value: 2000}, {label: 666, value: 666}]);
                wrapper.vm.setSelectedRegions([{label: "Hamburg", value: "Hamburg"}, {label: "Bremen", value: "Bremen"}]);
                wrapper.vm.setSelectedStatistics({
                    "stat1": {
                        category: "Kategorie 1",
                        name: "Stat eins"
                    },
                    "stat2": {
                        category: "Kategorie 2",
                        name: "Stat zwei"
                    }
                });
                wrapper.vm.removeFilter("Stat eins");
                expect(wrapper.vm.selectedDates).to.deep.equal([{label: 2000, value: 2000}, {label: 666, value: 666}]);
                expect(wrapper.vm.selectedRegions).to.deep.equal([{label: "Hamburg", value: "Hamburg"}, {label: "Bremen", value: "Bremen"}]);
                expect(wrapper.vm.selectedStatistics).to.deep.equal({"stat2": {
                    category: "Kategorie 2",
                    name: "Stat zwei"
                }});
            });
        });
        describe("getTotalProp", () => {
            it("should return an object", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.getTotalProp(false)).to.deep.equal({
                    enabled: false,
                    rowTitle: true,
                    hintText: "common:modules.statisticDashboard.totalHint"
                });
                expect(wrapper.vm.getTotalProp(true)).to.deep.equal({
                    enabled: true,
                    rowTitle: true,
                    hintText: "common:modules.statisticDashboard.totalHint"
                });
            });
        });
        describe("limitingDataForChart", () => {
            const data = {
                    "Region1": {
                        "2021": 80395,
                        "2022": 73800
                    },
                    "Region2": {
                        "2021": 4478,
                        "2022": 4260
                    },
                    "Region3": {
                        "2021": 6186,
                        "2022": 6065
                    },
                    "Region4": {
                        "2021": 6186,
                        "2022": 6065
                    }
                },
                expectedObject = {
                    "Region1": {
                        "2021": 80395,
                        "2022": 73800
                    },
                    "Region2": {
                        "2021": 4478,
                        "2022": 4260
                    },
                    "Region3": {
                        "2021": 6186,
                        "2022": 6065
                    }
                },
                expectedBarObject = {
                    "Region1": {
                        "2021": 80395,
                        "2022": 73800
                    },
                    "Region2": {
                        "2021": 4478,
                        "2022": 4260
                    },
                    "Region3": {
                        "2021": 6186,
                        "2022": 6065
                    },
                    "Region4": {
                        "2021": 6186,
                        "2022": 6065
                    }
                },
                expectedArray = [
                    "Region1",
                    "Region2",
                    "Region3"
                ],
                expectedBarArray = [
                    "Region1",
                    "Region2",
                    "Region3",
                    "Region4"
                ];

            it("should return trimmed object for line charts", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                await wrapper.setData({diagramType: "line"});

                expect(wrapper.vm.limitingDataForChart(data, 3)).to.deep.equal(expectedObject);
                expect(wrapper.vm.showLimitView).to.be.true;
                expect(wrapper.vm.selectedFilteredRegions).to.deep.equal(expectedArray);
            });
            it("should return trimmed object for bar charts", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                await wrapper.setData({diagramType: "bar"});

                expect(wrapper.vm.limitingDataForChart(data, 4)).to.deep.equal(expectedBarObject);
                expect(wrapper.vm.showLimitView).to.be.true;
                expect(wrapper.vm.selectedFilteredRegions).to.deep.equal(expectedArray);
                expect(wrapper.vm.allFilteredRegions).to.deep.equal(expectedBarArray);
            });
        });
        describe("addSelectedFilteredRegions", () => {
            it("should add region", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.selectedFilteredRegions = ["aaaa", "bbbb", "ccccc"];
                wrapper.vm.allFilteredRegions = ["aaaa", "bbbb", "ccccc", "ddddd"];

                wrapper.vm.addSelectedFilteredRegions("ddddd");
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.selectedFilteredRegions).to.deep.equal(["ddddd", "aaaa", "bbbb", "ccccc"]);
                expect(wrapper.vm.allFilteredRegions).to.deep.equal(["ddddd", "aaaa", "bbbb", "ccccc"]);
                expect(wrapper.vm.numberOfColouredBars).to.be.equal(4);
            });
        });
        describe("removeRegion", () => {
            it("should remove selected region", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                await wrapper.setData({diagramType: "line"});

                wrapper.vm.selectedFilteredRegions = ["aaaa", "bbbb", "ccccc", "ddddd"];
                wrapper.vm.removeRegion("ddddd");
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.selectedFilteredRegions).to.deep.equal(["aaaa", "bbbb", "ccccc"]);
            });
            it("should remove region", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                await wrapper.setData({diagramType: "bar", allFilteredRegions: ["aaaa", "bbbb", "ccccc", "ddddd"]});

                wrapper.vm.selectedFilteredRegions = ["aaaa", "bbbb", "ccccc", "ddddd"];
                wrapper.vm.allFilteredRegions = ["aaaa", "bbbb", "ccccc", "ddddd", "eeeee"];
                wrapper.vm.removeRegion("ddddd");
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.selectedFilteredRegions).to.deep.equal(["aaaa", "bbbb", "ccccc"]);
                expect(wrapper.vm.allFilteredRegions).to.deep.equal(["aaaa", "bbbb", "ccccc", "eeeee", "ddddd"]);
                expect(wrapper.vm.numberOfColouredBars).to.be.equal(3);
            });
        });
        describe("createColorPalette", () => {
            it("should return expected result", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectableColorPalettes({baseColor: [0, 0, 0]});

                expect(wrapper.vm.createColorPalette()).to.deep.equal(
                    [[204, 204, 204], [153, 153, 153], [102, 102, 102], [51, 51, 51], [0, 0, 0]]
                );
            });
        });
        describe("getSelectedLevelRegionNameAttributeInDepth", () => {
            it("should", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    obj = {
                        "attrName": "bundesland",
                        "name": "Bundesland",
                        "child": {
                            "attrName": "statistisches_gebiet",
                            "name": "Kreise und Städte",
                            "child": {
                                "attrName": "statistisches_gebiet",
                                "name": "Gemeinden"
                            }
                        }
                    },
                    nameAttribute = wrapper.vm.getSelectedLevelRegionNameAttributeInDepth(obj);

                expect(nameAttribute).to.deep.equal(obj.child.child);
            });
            it("should", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    obj = {
                        "attrName": "bundesland",
                        "name": "Bundesland"
                    },
                    nameAttribute = wrapper.vm.getSelectedLevelRegionNameAttributeInDepth(obj);

                expect(nameAttribute).to.deep.equal(obj);
            });
        });
        describe("flattenRegionHierarchy", () => {
            it("should flatten the given object", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        global: {
                            plugins: [store]
                        }
                    }),
                    obj = {
                        "attrName": "bundesland",
                        "name": "Bundesland",
                        "child": {
                            "attrName": "statistisches_gebiet",
                            "name": "Kreise und Städte"
                        }
                    };

                wrapper.vm.setFlattenedRegions([]);
                wrapper.vm.flattenRegionHierarchy(obj);

                expect(wrapper.vm.flattenedRegions).to.deep.equal([obj, obj.child]);
            });
        });
    });
});
