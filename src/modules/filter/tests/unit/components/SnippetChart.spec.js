import {shallowMount, config} from "@vue/test-utils";
import SnippetChart from "../../../components/SnippetChart.vue";
import {expect} from "chai";
import Feature from "ol/Feature";

config.global.mocks.$t = key => key;

describe("src/modules/filter/components/SnippetChart.vue", () => {
    const chartConfig = {
        "type": "bar",
        "data": {
            "datasets": [{
                "data": [1, 2, 3],
                "featureAttributes": ["bar", "foo"]
            }],
            "labels": ["Eins", "Zwei", "Drei"]
        }
    };

    describe("Component DOM", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig
                }
            });

            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.infoText).to.be.false;
            expect(wrapper.vm.api).to.be.null;
            expect(wrapper.vm.filteredItems).to.be.an("array");
            expect(wrapper.vm.chartConfig).to.be.an("object");
        });

        it("should not render the chart with default values", () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig
                }
            });

            expect(wrapper.isVisible()).to.be.false;
            expect(wrapper.findComponent({name: "BarchartItem"}).exists()).to.be.false;
        });

        it("should render the bar chart if visible is true", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig
                }
            });

            await wrapper.setData({
                isVisible: true
            });
            expect(wrapper.isVisible()).to.be.true;
            expect(wrapper.findComponent({name: "BarchartItem"}).exists()).to.be.true;
        });

        it("should render alternative text if isEmpty is true", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig
                }
            });

            await wrapper.setData({
                isVisible: true,
                isEmpty: true
            });
            expect(wrapper.findComponent({name: "BarchartItem"}).exists()).to.be.false;
            expect(wrapper.find("span").exists()).to.be.true;
        });

        it("should not render a chart if the type is not 'bar'", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig: {
                        "type": "line",
                        "data": {
                            "datasets": [{
                                "data": [1, 2, 3]
                            }],
                            "labels": ["Eins", "Zwei", "Drei"]
                        }
                    }
                }
            });

            await wrapper.setData({
                isVisible: true
            });
            expect(wrapper.isVisible()).to.be.true;
            expect(wrapper.findComponent({name: "BarchartItem"}).exists()).to.be.false;
        });
        it("should render an info text if one is given", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig,
                    infoText: "This is an info text."
                }
            });

            await wrapper.setData({
                isVisible: true
            });

            expect(wrapper.find(".info-text").text()).to.be.equal("This is an info text.");
        });
        it("should not render an info text if no chart is present", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig,
                    infoText: "This is an info text."
                }
            });

            await wrapper.setData({
                isVisible: true,
                isEmpty: true
            });

            expect(wrapper.find(".info-text").exists()).to.be.false;
        });
    });

    describe("Watcher", () => {
        it("should set 'isEmpty' to true if 'filterItems' change", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig,
                    filteredItems: [1, 2, 3]
                },
                data () {
                    return {
                        isEmpty: false
                    };
                }
            });

            await wrapper.setProps({
                filteredItems: []
            });
            expect(wrapper.vm.isEmpty).to.be.true;
        });
    });

    describe("Methods", () => {
        describe("addChartData", () => {
            it("should set the correct chart data", () => {
                const wrapper = shallowMount(SnippetChart, {
                        props: {
                            chartConfig
                        }
                    }),
                    obj = {
                        items: [
                            new Feature({foo: "bar", bar: "foo"})
                        ]
                    };

                wrapper.vm.addChartData(obj);
                expect(wrapper.vm.chartConfig.data.datasets[0].data).to.deep.equal(["foo", "bar"]);
            });

            it("should set isEmpty to false if feature contains non-zero values", () => {
                const wrapper = shallowMount(SnippetChart, {
                        props: {
                            chartConfig
                        },
                        data () {
                            return {
                                isEmpty: true
                            };
                        }
                    }),
                    obj = {
                        items: [
                            new Feature({foo: 0, bar: 1})
                        ]
                    };

                wrapper.vm.addChartData(obj);
                expect(wrapper.vm.isEmpty).to.be.false;
            });

            it("should not set isEmpty to false if feature contains only zeroes", () => {
                const wrapper = shallowMount(SnippetChart, {
                        props: {
                            chartConfig
                        },
                        data () {
                            return {
                                isEmpty: true
                            };
                        }
                    }),
                    obj = {
                        items: [
                            new Feature({foo: 0, bar: 0})
                        ]
                    };

                wrapper.vm.addChartData(obj);
                expect(wrapper.vm.isEmpty).to.be.true;
            });
        });

        describe("updateSubtitle", () => {
            it("should set no subtitle by default", () => {
                const wrapper = shallowMount(SnippetChart, {
                        props: {
                            chartConfig
                        }
                    }),
                    feature = new Feature({foo: 0, bar: 0}),
                    options = {plugins: {}};

                wrapper.vm.updateSubtitle(undefined, feature, options);

                expect(options.plugins.subtitle).to.be.undefined;
            });

            it("should not change configured subtitle if subtitle is not set", () => {
                const wrapper = shallowMount(SnippetChart, {
                        props: {
                            chartConfig
                        }
                    }),
                    feature = new Feature({foo: 0, bar: 0}),
                    options = {
                        plugins: {
                            subtitle: {
                                text: "Untertitel"
                            }
                        }
                    };

                wrapper.vm.updateSubtitle(undefined, feature, options);

                expect(options.plugins.subtitle.text).to.equal("Untertitel");
            });

            it("should update subtitle correctly", () => {
                const wrapper = shallowMount(SnippetChart, {
                        props: {
                            chartConfig
                        }
                    }),
                    subtitle = ["Der Wert von foo ist ", ["foo"], " und der von bar ist ", ["bar"], "."],
                    feature = new Feature({foo: 2, bar: 3}),
                    options = {
                        plugins: {
                            subtitle: {
                                text: "Untertitel"
                            }
                        }
                    };

                wrapper.vm.updateSubtitle(subtitle, feature, options);

                expect(options.plugins.subtitle.text).to.equal("Der Wert von foo ist 2 und der von bar ist 3.");
            });
        });
        describe("setTooltipUnit", () => {
            it("should set no label callback by default", () => {
                const wrapper = shallowMount(SnippetChart, {
                    props: {
                        chartConfig
                    }
                });

                expect(wrapper.vm.chartConfig.options?.plugins?.tooltip?.label).to.be.undefined;
            });

            it("should set no label callback if parameter tooltipUnit is not of type string", () => {
                const wrapper = shallowMount(SnippetChart, {
                    props: {
                        chartConfig
                    }
                });

                wrapper.vm.setTooltipUnit(true, chartConfig);

                expect(wrapper.vm.chartConfig.options?.plugins?.tooltip?.label).to.be.undefined;
            });

            it("should set callback returning expected value", () => {
                const wrapper = shallowMount(SnippetChart, {
                    props: {
                        chartConfig
                    }
                });

                wrapper.vm.setTooltipUnit("%", chartConfig);

                expect(wrapper.vm.chartConfig.options.plugins.tooltip.callbacks.label(
                    {parsed: {y: 50}}
                )).to.equal("50%");
            });

            it("should not overwrite other chart config options", () => {
                const wrapper = shallowMount(SnippetChart, {
                    props: {
                        chartConfig: {
                            ...chartConfig,
                            options: {
                                plugins: {
                                    legend: {
                                        display: true
                                    }
                                }
                            }
                        }
                    }
                });

                wrapper.vm.setTooltipUnit("%", chartConfig);

                expect(wrapper.vm.chartConfig.options.plugins.legend.display).to.be.true;
            });
        });
    });
});
