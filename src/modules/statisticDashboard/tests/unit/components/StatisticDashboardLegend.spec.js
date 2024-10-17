import {config, shallowMount, mount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardLegend from "../../../components/StatisticDashboardLegend.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardLegend.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: {
                            namespaced: true,
                            mutations: {
                                setClassificationMode: (state, options) => {
                                    state.classificationMode = options;
                                },
                                setAllowPositiveNegativeClasses: (state, options) => {
                                    state.allowPositiveNegativeClasses = options;
                                },
                                setNumberOfClasses: (state, options) => {
                                    state.numberOfClasses = options;
                                },
                                setSelectedColorPaletteIndex: (state, options) => {
                                    state.selectedColorPaletteIndex = options;
                                },
                                setOpacity: (state, options) => {
                                    state.opacity = options;
                                },
                                setStepValues: (state, options) => {
                                    state.stepValues = options;
                                },
                                setColorPalette: (state, options) => {
                                    state.colorPalette = options;
                                }
                            },
                            getters: {
                                classificationMode: (state) => state.classificationMode,
                                allowPositiveNegativeClasses: (state) => state.allowPositiveNegativeClasses,
                                minNumberOfClasses: () => 2,
                                maxNumberOfClasses: () => 5,
                                numberOfClasses: (state) => state.numberOfClasses,
                                selectableColorPalettes: () => [{label: "Schwarz"}],
                                selectedColorPaletteIndex: state => state.selectedColorPaletteIndex,
                                opacity: state => state.opacity,
                                stepValues: state => state.stepValues ?? [0, 100],
                                colorPalette: state => state.colorPalette
                            }
                        }
                    }
                }
            }
        });
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("should render title", () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("h5").text()).to.be.include("common:modules.statisticDashboard.legend.editClassification");
        });
        it("should render classification input", () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#classification").exists()).to.be.true;
        });
        it("should render class-range", () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#class-range").exists()).to.be.true;
        });
        it("should render color palette input", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#custom-color-palette").exists()).to.be.true;
        });
        it("should render value ranges if classification is 'custom'", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setClassificationMode("custom");
            wrapper.vm.setNumberOfClasses(1);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#value-ranges").exists()).to.be.true;
        });
        it("should render opacity input", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#opacity").exists()).to.be.true;
        });
        it("should render 5 value ranges if numberOfClasses is 5", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setClassificationMode("custom");
            wrapper.vm.setNumberOfClasses(5);
            await wrapper.vm.$nextTick();

            expect(wrapper.findAll("#value-ranges").length).to.equal(5);
        });
    });
    describe("Number of classes", () => {
        it("should show correct default status according to store", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setNumberOfClasses(4);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#class-range").element.value).to.equal("4");
        });
        it("should change value in store correctly when changed", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setNumberOfClasses(4);

            await wrapper.find("#class-range").setValue("3");
            await wrapper.find("#class-range").trigger("change");

            expect(wrapper.vm.numberOfClasses).to.equal(3);
        });
    });
    describe("Allow positive negative checkbox", () => {
        it("should show correct default status according to store", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setAllowPositiveNegativeClasses(true);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#allowPosNegMix").element.checked).to.equal(true);

            wrapper.vm.setAllowPositiveNegativeClasses(false);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#allowPosNegMix").element.checked).to.equal(false);
        });
        it("should change value in store correctly when clicked", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setAllowPositiveNegativeClasses(false);

            await wrapper.find("#allowPosNegMix").setValue(true);
            await wrapper.find("#allowPosNegMix").trigger("change");

            expect(wrapper.vm.allowPositiveNegativeClasses).to.equal(true);
        });
    });
    describe("Color settings", () => {
        it("should show correct color settings according to store", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setSelectedColorPaletteIndex(0);
            wrapper.vm.setOpacity(0.6);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#custom-color-palette").element.value).to.equal("0");
            expect(wrapper.find("#opacity").element.value).to.equal("0.6");
        });
        it("should change value in store correctly when changed", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.find("#custom-color-palette").setValue(0);
            await wrapper.find("#custom-color-palette").trigger("change");

            expect(wrapper.vm.selectedColorPaletteIndex).to.equal(0);

            await wrapper.find("#opacity").setValue("0.6");
            await wrapper.find("#opacity").trigger("change");

            expect(wrapper.vm.opacity).to.equal(0.6);
        });
    });
    describe("Custom classification", () => {
        it("should show correct step values according to store", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setNumberOfClasses(2);
            wrapper.vm.setStepValues([0, 10]);
            wrapper.vm.setClassificationMode("custom");
            await wrapper.vm.$nextTick();

            expect(wrapper.getComponent("#value-range1").vm.value).to.equal("0");
            expect(wrapper.getComponent("#value-range21").vm.value).to.equal("10");
            expect(wrapper.getComponent("#value-range2").vm.value).to.equal("10");
        });
        it("should change value in store correctly when changed", async () => {
            const wrapper = mount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setNumberOfClasses(2);
            wrapper.vm.setStepValues([0, 10]);
            wrapper.vm.setClassificationMode("custom");
            await wrapper.vm.$nextTick();

            await wrapper.find("#value-range1").setValue(3);
            await wrapper.find("#value-range1").trigger("change");

            expect(wrapper.vm.stepValues).to.deep.equal([3, 10]);
        });
        it("should show correct color value according to store", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setNumberOfClasses(2);
            wrapper.vm.setStepValues([0, 10]);
            wrapper.vm.setClassificationMode("custom");
            wrapper.vm.setColorPalette([[255, 0, 0], [0, 255, 0]]);
            await wrapper.vm.$nextTick();

            expect(wrapper.getComponent("#color-range1").vm.value).to.equal("#ff0000");
            expect(wrapper.getComponent("#color-range2").vm.value).to.equal("#00ff00");
        });
        it("should change value in store correctly when changed", async () => {
            const wrapper = mount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setNumberOfClasses(2);
            wrapper.vm.setStepValues([0, 10]);
            wrapper.vm.setClassificationMode("custom");
            wrapper.vm.setColorPalette([[0, 0, 0], [0, 0, 0]]);
            await wrapper.vm.$nextTick();

            await wrapper.find("#color-range1").setValue("#ff0000");
            await wrapper.find("#color-range1").trigger("input");
            await wrapper.find("#color-range2").setValue("#00ff00");
            await wrapper.find("#color-range2").trigger("input");

            expect(wrapper.vm.colorPalette).to.deep.equal([[255, 0, 0], [0, 255, 0]]);
        });
    });
});
