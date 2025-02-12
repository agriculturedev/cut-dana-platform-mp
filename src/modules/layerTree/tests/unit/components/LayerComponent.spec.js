import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import layerFactory from "../../../../../core/layers/js/layerFactory";
import LayerComponent from "../../../components/LayerComponent.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/LayerComponent.vue", () => {
    let store,
        wrapper,
        layer,
        propsData,
        mapMode,
        replaceByIdInLayerConfigSpy,
        isLayerTree;

    beforeEach(() => {
        mapMode = "2D";
        isLayerTree = true;
        layer = {
            id: "1",
            name: "layer",
            typ: "WMS",
            visibility: false,
            showInLayerTree: true
        };

        propsData = {
            conf: layer
        };

        replaceByIdInLayerConfigSpy = sinon.spy();
        sinon.stub(layerFactory, "getLayerTypes3d").returns(["TERRAIN3D"]);
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        LayerComponent
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => mapMode,
                        scale: () => 20000,
                        scales: () => [500, 1000, 10000, 20000, 100000]
                    }
                }
            },
            mutations: {
                replaceByIdInLayerConfig: replaceByIdInLayerConfigSpy
            }
        });
        sinon.stub(LayerComponent.methods, "isLayerTree").callsFake(() => {
            return isLayerTree;
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the layer given as property to the component,  isLayerTree = true", () => {
        wrapper = shallowMount(LayerComponent, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#layer-tree-layer-" + propsData.conf.id).exists()).to.be.true;
    });
    it("renders the layer given as property to the component,  isLayerTree = false, no tooltip", () => {
        isLayerTree = false;
        layer.showInLayerTree = false;
        wrapper = shallowMount(LayerComponent, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#layer-tree-layer-" + propsData.conf.id).exists()).to.be.true;
        expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(1);
        expect(wrapper.find("span").attributes()["data-bs-toggle"]).to.be.undefined;
        expect(wrapper.find("layer-check-box-stub").attributes().disabled).to.be.equals("false");
        expect(wrapper.vm.tooltipText).to.be.equals("");
    });
    it("renders layer with visibility false and checkbox, icon and submenu for layerTree", () => {
        wrapper = shallowMount(LayerComponent, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#layer-tree-layer-" + propsData.conf.id).exists()).to.be.true;
        expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-icon-sub-menu-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-icon-info-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-sub-menu-stub").length).to.be.equals(1);
        expect(wrapper.find("layer-check-box-stub").attributes().disabled).to.be.equals("false");
        expect(wrapper.vm.tooltipText).to.be.equals("");
    });
    it("renders layer, that is out of range with tooltip and disabled", () => {
        layer.maxScale = "10000";
        layer.minScale = "0";
        wrapper = shallowMount(LayerComponent, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#layer-tree-layer-" + propsData.conf.id).exists()).to.be.true;
        expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-icon-sub-menu-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-icon-info-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-sub-menu-stub").length).to.be.equals(1);
        expect(wrapper.find("span").attributes()["data-bs-toggle"]).to.be.equals("tooltip");
        expect(wrapper.find("layer-check-box-stub").attributes().disabled).to.be.equals("true");
        expect(wrapper.vm.tooltipText).to.be.equals("common:modules.layerTree.invisibleLayer");
    });
    it("renders layer only with checkbox - no submenu", () => {
        isLayerTree = false;
        layer.showInLayerTree = false;
        wrapper = shallowMount(LayerComponent, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#layer-tree-layer-" + propsData.conf.id).exists()).to.be.true;
        expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-icon-sub-menu-stub").length).to.be.equals(0);
        expect(wrapper.findAll("layer-component-icon-info-stub").length).to.be.equals(1);
        expect(wrapper.findAll("layer-component-sub-menu-stub").length).to.be.equals(0);
    });

    describe("methods", () => {
        it("test method show in 3D - typ not VectorTile", () => {
            mapMode = "3D";
            isLayerTree = true;
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const layerShallBeShown = wrapper.vm.show();

            expect(layerShallBeShown).to.be.true;
        });
        it("test method show in 3D - typ is VectorTile", () => {
            mapMode = "3D";
            propsData.conf.typ = "Vectortile";
            isLayerTree = true;
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const layerShallBeShown = wrapper.vm.show();

            expect(layerShallBeShown).to.be.false;
        });
        it("test method show in layertree if isNeverVisibleInTree is true", () => {
            propsData.conf.typ = "WFS";
            propsData.conf.isNeverVisibleInTree = true;
            isLayerTree = true;
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const layerShallBeShown = wrapper.vm.show();

            expect(layerShallBeShown).to.be.false;
        });
        it("test method show in layertree if isNeverVisibleInTree is false", () => {
            propsData.conf.typ = "WMS";
            propsData.conf.isNeverVisibleInTree = false;
            isLayerTree = true;
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const layerShallBeShown = wrapper.vm.show();

            expect(layerShallBeShown).to.be.true;
        });
        it("test method show not in layertree if isNeverVisibleInTree is true", () => {
            propsData.conf.typ = "WFS";
            propsData.conf.isNeverVisibleInTree = true;
            isLayerTree = false;
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const layerShallBeShown = wrapper.vm.show();

            expect(layerShallBeShown).to.be.false;
        });
        it("test method show not in layertree if isNeverVisibleInTree is false", () => {
            propsData.conf.typ = "WMS";
            propsData.conf.isNeverVisibleInTree = false;
            isLayerTree = false;
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const layerShallBeShown = wrapper.vm.show();

            expect(layerShallBeShown).to.be.true;
        });
        it("test method scaleIsOutOfRange, isLayerTree = false", () => {
            isLayerTree = false;
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const scaleIsOutOfRange = wrapper.vm.scaleIsOutOfRange();

            expect(scaleIsOutOfRange).to.be.false;
        });
        it("test method scaleIsOutOfRange, isLayerTree = true, conf.maxScale not set", () => {
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const scaleIsOutOfRange = wrapper.vm.scaleIsOutOfRange();

            expect(scaleIsOutOfRange).to.be.false;
        });
        it("test method scaleIsOutOfRange, isLayerTree = true, conf.maxScale is set, is in scale", () => {
            layer.maxScale = "100000";
            layer.minScale = "0";
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const scaleIsOutOfRange = wrapper.vm.scaleIsOutOfRange();

            expect(scaleIsOutOfRange).to.be.false;
        });
        it("test method scaleIsOutOfRange, isLayerTree = true, conf.maxScale is set, is not in scale", () => {
            layer.maxScale = "10000";
            layer.minScale = "0";
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const scaleIsOutOfRange = wrapper.vm.scaleIsOutOfRange();

            expect(scaleIsOutOfRange).to.be.true;
        });
        it("test method scaleIsOutOfRange, isLayerTree = true, conf.maxScale is set, is mapMode = 3D, is layer visible, is not in scale", () => {
            store = createStore({
                modules: {
                    Modules: {
                        namespaced: true,
                        modules: {
                            namespaced: true,
                            LayerComponent
                        }
                    },
                    Maps: {
                        namespaced: true,
                        getters: {
                            mode: () => "3D",
                            scale: () => 20000,
                            scales: () => [500, 1000, 10000, 20000, 100000]
                        }
                    }
                },
                mutations: {
                    replaceByIdInLayerConfig: replaceByIdInLayerConfigSpy
                }
            });
            layer.maxScale = "10000";
            layer.minScale = "0";
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const scaleIsOutOfRange = wrapper.vm.scaleIsOutOfRange();

            expect(scaleIsOutOfRange).to.be.true;
        });
        it("test method scaleIsOutOfRange, isLayerTree = true, conf.maxScale is set, is mapMode = 3D, is layer visible, is in scale", () => {
            layer.maxScale = "100000";
            layer.minScale = "0";
            wrapper = shallowMount(LayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            const scaleIsOutOfRange = wrapper.vm.scaleIsOutOfRange();

            expect(scaleIsOutOfRange).to.be.false;
        });
    });
});
