import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import layerCollection from "../../../../../core/layers/js/layerCollection";
import LegendContainer from "../../../components/LegendContainer.vue";
import Legend from "../../../store/indexLegend";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/legend/components/LegendContainer.vue", () => {
    let store,
        wrapper,
        layersInCollection,
        visibleLayerConfigs,
        layer,
        layerAttributes;

    beforeEach(() => {
        layersInCollection = [];
        visibleLayerConfigs = [];
        layerAttributes = {
            id: "1132",
            name: "100 Jahre Stadtgruen POIs",
            visibility: true
        };
        layer = {
            id: "1132",
            get: (key) => {
                return layerAttributes[key];
            },
            getLegend: () => true,
            getLayer: () => {
                return {
                    getZIndex: () => 1
                };
            },
            getLayerSource: () => []
        };

        Legend.actions.createLegend = sinon.spy();
        Legend.actions.toggleLayerInLegend = sinon.spy();
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Legend
                    }

                }
            },
            getters: {
                uiStyle: () => "DEFAULT",
                visibleLayerConfigs: () => visibleLayerConfigs
            }
        });

        sinon.stub(layerCollection, "getLayers").returns(
            layersInCollection
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("render LegendContainer", () => {
        it("renders the legend container without legends", () => {
            wrapper = shallowMount(LegendContainer, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("#legend").exists()).to.be.true;
        });

        it("renders the legend container with legends", () => {
            store.commit("Modules/Legend/setLegends", [{
                id: layer.id,
                name: layer.get("name"),
                legend: ["legend"],
                position: 0
            },
            {
                id: "2",
                name: "name",
                legend: ["legend2"],
                position: 1
            }]);
            wrapper = shallowMount(LegendContainer, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("#legend").exists()).to.be.true;
            expect(wrapper.find("legend-single-layer-stub").exists()).to.be.true;
            expect(wrapper.findAll("legend-single-layer-stub").length).to.be.equals(2);
        });
    });
    describe("LegendContainer.vue methods", () => {
        // it("calls prepareLegend and addLegend, if layer is in collection", () => {
        //     layersInCollection.push(layer);
        //     wrapper = shallowMount(LegendContainer, {
        //         global: {
        //             plugins: [store]
        //         }});

        //     expect(wrapper.find("#legend").exists()).to.be.true;
        //     expect(Legend.actions.prepareLegend.calledOnce).to.be.true;
        //     expect(Legend.actions.addLegend.calledOnce).to.be.true;
        //     expect(Legend.actions.addLegend.firstCall.args[1]).to.be.deep.equals({
        //         id: layerAttributes.id,
        //         name: layerAttributes.name,
        //         legend: ["url"],
        //         position: 1
        //     });
        //     expect(Legend.actions.sortLegend.calledOnce).to.be.true;
        // });
        // it("calls prepareLegend, removeLegend and addLegend, if legend changes", () => {
        //     layersInCollection.push(layer);
        //     sinon.stub(LegendContainer.methods, "isLegendChanged").returns(true);
        //     sinon.stub(LegendContainer.methods, "isLayerInLegend").returns(true);
        //     wrapper = shallowMount(LegendContainer, {
        //         global: {
        //             plugins: [store]
        //         }});

        //     expect(wrapper.find("#legend").exists()).to.be.true;
        //     expect(Legend.actions.prepareLegend.calledOnce).to.be.true;
        //     expect(Legend.actions.removeLegend.calledOnce).to.be.true;
        //     expect(Legend.actions.removeLegend.firstCall.args[1]).to.be.equals(layerAttributes.id);
        //     expect(Legend.actions.addLegend.calledOnce).to.be.true;
        //     expect(Legend.actions.addLegend.firstCall.args[1]).to.be.deep.equals({
        //         id: layerAttributes.id,
        //         name: layerAttributes.name,
        //         legend: ["url"],
        //         position: 1
        //     });
        //     expect(Legend.actions.sortLegend.calledOnce).to.be.true;
        // });
        // it("calls prepareLegendForGroupLayer and addLegend, if layer has typ GROUP", () => {
        //     layerAttributes.typ = "GROUP";
        //     layersInCollection.push(layer);
        //     wrapper = shallowMount(LegendContainer, {
        //         global: {
        //             plugins: [store]
        //         }});

        //     expect(wrapper.find("#legend").exists()).to.be.true;
        //     expect(Legend.actions.prepareLegendForGroupLayer.calledOnce).to.be.true;
        //     expect(Legend.actions.addLegend.calledOnce).to.be.true;
        //     expect(Legend.actions.addLegend.firstCall.args[1]).to.be.deep.equals({
        //         id: layerAttributes.id,
        //         name: layerAttributes.name,
        //         legend: ["url"],
        //         position: 1
        //     });
        //     expect(Legend.actions.sortLegend.calledOnce).to.be.true;
        // });

        it("method generateId", () => {
            wrapper = shallowMount(LegendContainer, {
                global: {
                    plugins: [store]
                }});
            expect(wrapper.vm.generateId("Layername 1")).to.be.equals("legend_Layername_1");
            expect(wrapper.vm.generateId("Layername 1:")).to.be.equals("legend_Layername_1_");
            expect(wrapper.vm.generateId("Layername (1)")).to.be.equals("legend_Layername_1_");
            expect(wrapper.vm.generateId("Layername (/)")).to.be.equals("legend_Layername_");
            expect(wrapper.vm.generateId("Layername (//)")).to.be.equals("legend_Layername_");
            expect(wrapper.vm.generateId("Layername (/abc/)")).to.be.equals("legend_Layername_abc_");
        });

        // it("method isLayerInLegend", () => {
        //     const legendObj = {
        //         id: "1",
        //         name: "layer_1",
        //         legend: ["link_to_legend"]
        //     };

        //     wrapper = shallowMount(LegendContainer, {
        //         global: {
        //             plugins: [store]
        //         }});
        //     store.commit("Modules/Legend/setLegends", [legendObj]);
        //     expect(wrapper.vm.isLayerInLegend("id")).to.be.equals(false);
        //     expect(wrapper.vm.isLayerInLegend("1")).to.be.equals(true);
        // });

        // describe("method isLegendChanged", () => {
        //     it("returns true if legend changed", () => {
        //         const legendObj = {
        //             id: "1",
        //             name: "layer_1",
        //             legend: ["link_to_legend"],
        //             position: 1
        //         };

        //         wrapper = shallowMount(LegendContainer, {
        //             global: {
        //                 plugins: [store]
        //             }});
        //         store.commit("Modules/Legend/setLegends", [legendObj]);
        //         expect(wrapper.vm.isLegendChanged(legendObj.id, {
        //             id: "1",
        //             name: "layer_1",
        //             legend: ["link_to_legend"],
        //             position: 0
        //         })).to.be.equals(true);
        //         expect(wrapper.vm.isLegendChanged(legendObj.id, {
        //             id: "1",
        //             name: "layer_1",
        //             legend: ["changed_link_to_legend"],
        //             position: 1
        //         })).to.be.equals(true);
        //         expect(wrapper.vm.isLegendChanged(legendObj.id, {
        //             id: "1",
        //             name: "layer_1",
        //             legend: ["link_to_legend", "new_link"],
        //             position: 1
        //         })).to.be.equals(true);
        //         expect(wrapper.vm.isLegendChanged(legendObj.id, {
        //             id: "1",
        //             name: "changed_layer_1",
        //             legend: ["link_to_legend"],
        //             position: 1
        //         })).to.be.equals(true);
        //         expect(wrapper.vm.isLegendChanged(legendObj.id, {
        //             id: "changed_1",
        //             name: "layer_1",
        //             legend: ["link_to_legend"],
        //             position: 1
        //         })).to.be.equals(true);
        //         expect(wrapper.vm.isLegendChanged(legendObj.id, {
        //             id: "2042",
        //             name: "Festgestellte Änderungen – Berichtigungen – Nachrichtliche Übernahmen seit 1997",
        //             legend: ["https://geodienste.hamburg.de/HH_WMS_FNP_Aend?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=fnp_aenderungsuebersicht_aenderungen_festgestellt"],
        //             position: 2
        //         })).to.be.equals(true);
        //     });
        //     it("returns false if legend doesn't changed", () => {
        //         const legendObj = {
        //             id: "1",
        //             name: "layer_1",
        //             legend: ["link_to_legend"],
        //             position: 1
        //         };

        //         wrapper = shallowMount(LegendContainer, {
        //             global: {
        //                 plugins: [store]
        //             }});
        //         store.commit("Modules/Legend/setLegends", [legendObj]);
        //         expect(wrapper.vm.isLegendChanged(legendObj.id, legendObj)).to.be.equals(false);
        //     });
        // });
        describe("watcher", () => {
            let config_1, config_2;

            beforeEach(() => {
                config_1 = {
                    id: "1",
                    name: "layer_1",
                    zIndex: 1
                };
                config_2 = {
                    id: "2",
                    name: "layer_2",
                    visibility: true,
                    zIndex: 2
                };
                sinon.stub(layerCollection, "getLayerById").callsFake(
                    function (id) {
                        if (id === "1") {
                            return config_1;
                        }
                        if (id === "2") {
                            return config_2;
                        }
                        return null;
                    }
                );
                store.commit("Modules/Legend/setLegends", []);
            });
            afterEach(() => {
                sinon.restore();
            });

            it("visibleLayerConfigs shall call toggleLayerInLegend with true", async () => {
                const newLayerConfigs = [config_1, config_2],
                    oldLayerConfigs = [config_1];

                wrapper = shallowMount(LegendContainer, {
                    global: {
                        plugins: [store]
                    }});

                wrapper.vm.$options.watch.visibleLayerConfigs.handler.call(wrapper.vm, newLayerConfigs, oldLayerConfigs);
                await wrapper.vm.$nextTick();

                expect(Legend.actions.toggleLayerInLegend.calledOnce).to.be.true;
                expect(Legend.actions.toggleLayerInLegend.firstCall.args[1]).to.be.deep.equals({layer: config_2, visibility: true});
            });

            it("visibleLayerConfigs shall call toggleLayerInLegend with false", async () => {
                const newLayerConfigs = [config_1],
                    oldLayerConfigs = [config_1, config_2];

                wrapper = shallowMount(LegendContainer, {
                    global: {
                        plugins: [store]
                    }});

                wrapper.vm.$options.watch.visibleLayerConfigs.handler.call(wrapper.vm, newLayerConfigs, oldLayerConfigs);
                await wrapper.vm.$nextTick();
                expect(Legend.actions.toggleLayerInLegend.calledOnce).to.be.true;
                expect(Legend.actions.toggleLayerInLegend.firstCall.args[1]).to.be.deep.equals({layer: config_2, visibility: false});
            });

            it("visibleLayerConfigs shall call toggleLayerInLegend if zIndex changed", async () => {
                const newLayerConfigs = [config_1, config_2],
                    oldLayerConfigs = [config_1];

                store.commit("Modules/Legend/setLegends", [{id: "2", position: "3"}]);

                wrapper = shallowMount(LegendContainer, {
                    global: {
                        plugins: [store]
                    }});

                wrapper.vm.$options.watch.visibleLayerConfigs.handler.call(wrapper.vm, newLayerConfigs, oldLayerConfigs);
                await wrapper.vm.$nextTick();

                expect(Legend.actions.toggleLayerInLegend.calledOnce).to.be.true;
                expect(Legend.actions.toggleLayerInLegend.firstCall.args[1]).to.be.deep.equals({layer: config_2, visibility: true});
            });

            //     it("legendOnChanged shall call createLegend if legend available", () => {
            //         const createLegendSpy = sinon.spy(LegendContainer.methods, "createLegend");

            //         wrapper = shallowMount(LegendContainer, {
            //             global: {
            //                 plugins: [store]
            //             }});

            //         wrapper.vm.$options.watch.legendOnChanged.handler.call(wrapper.vm, {});
            //         // is called once on mounted
            //         expect(createLegendSpy.calledTwice).to.be.true;
            //     });

            //     it("legendOnChanged shall not call createLegend if legend not available", () => {
            //         const createLegendSpy = sinon.spy(LegendContainer.methods, "createLegend");

            //         wrapper = shallowMount(LegendContainer, {
            //             global: {
            //                 plugins: [store]
            //             }});

        //         wrapper.vm.$options.watch.legendOnChanged.handler.call(wrapper.vm);
        //         // is called once on mounted
        //         expect(createLegendSpy.calledOnce).to.be.true;
        //     });
        });
    });
});
