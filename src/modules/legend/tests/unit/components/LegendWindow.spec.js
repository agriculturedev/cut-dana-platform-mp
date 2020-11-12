import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LegendWindowComponent from "../../../components/LegendWindow.vue";
import Legend from "../../../store/indexLegend";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("LegendWindow.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    legend: {
                        name: "common:modules.legend.name",
                        glyphicon: "glyphicon-book",
                        showCollapseAllButton: true
                    }
                }
            }
        },
        getters = {
            mobile: state => state.mobile
        },
        mutations = {
            setMobile (state, mobile) {
                state.mobile = mobile;
            }
        };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Legend
            },
            state: {
                configJson: mockConfigJson,
                mobile: false
            },
            getters,
            mutations
        });
        store.commit("Legend/setShowLegend", true);
        store.state.Legend.legends = [];
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });
    LegendWindowComponent.updated = undefined;

    describe("LegendWindow.vue rendering", () => {
        describe("render in desktop and mobile", () => {
            it("renders the legend window in desktop view", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});

                expect(wrapper.find(".legend-window").exists()).to.be.true;
            });
            it("renders the legend window in mobile view", () => {
                store.commit("setMobile", true);
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.find(".legend-window-mobile").exists()).to.be.true;
            });
        });
        describe("showCollapseAllButton", () => {
            it("renders the legend window with the collapseAllButton based on the config", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.find("span.glyphicon-arrow-up").exists()).to.be.true;
            });
            it("renders the legend window without the collapseAllButton based on the config", () => {
                store.state.Legend.showCollapseAllButton = false;
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.find("span.glyphicon-arrow-up").exists()).to.be.false;
            });
        });
    });
    describe("LegendMenu.vue methods", () => {
        describe("isValidLegendObj", () => {
            it("returns false if position is negative", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: "foo.bar",
                    position: -1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is false", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: false,
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is true", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: true,
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is undefined", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is empty array", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: [],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns true if position is positive and legend is string or not empty array", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(true);
            });
        });
        describe("generateId", () => {
            it("generates id", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.generateId("Layername 1")).to.be.equals("legend_Layername_1");
                expect(wrapper.vm.generateId("Layername 1:")).to.be.equals("legend_Layername_1_");
                expect(wrapper.vm.generateId("Layername (1)")).to.be.equals("legend_Layername_1_");
                expect(wrapper.vm.generateId("Layername (/)")).to.be.equals("legend_Layername_");
                expect(wrapper.vm.generateId("Layername (//)")).to.be.equals("legend_Layername_");
                expect(wrapper.vm.generateId("Layername (/abc/)")).to.be.equals("legend_Layername_abc_");
            });
        });
        describe("LegendMenu.vue isLayerNotYetInLegend", () => {
            it("returns true if layer is not yet in legend", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isLayerNotYetInLegend("Layername_1")).to.be.equals(true);
            });
            it("returns false if layer is already in legend", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                wrapper.vm.addLegend(legendObj);
                expect(wrapper.vm.isLayerNotYetInLegend(legendObj.id)).to.be.equals(false);
            });
        });
        describe("LegendMenu.vue isLegendChanged", () => {
            it("returns true if legend changed", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                wrapper.vm.addLegend(legendObj);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 0
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "layer_1",
                    legend: ["changed_link_to_legend"],
                    position: 1
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend", "new_link"],
                    position: 1
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "changed_layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "changed_1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                })).to.be.equals(true);
            });
            it("returns false if legend doesn't changed", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                wrapper.vm.addLegend(legendObj);
                expect(wrapper.vm.isLegendChanged(legendObj.id, legendObj)).to.be.equals(false);
            });
        });
        describe("prepareLegendForGroupLayer", () => {
            it("iterates over all layerSources and aggregates the legends", () => {
                const layerSource = [
                    new Backbone.Model({legend: ["foobar", "barfoo"]}),
                    new Backbone.Model({legend: ["barbar"]}),
                    new Backbone.Model({legend: ["foofoo"]})
                ];

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.prepareLegendForGroupLayer(layerSource)).to.deep.equal(["foobar", "barfoo", "barbar", "foofoo"]);
            });
        });
    });
});
