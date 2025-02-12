import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import BaselayerSwitcherComponent from "../../../components/BaselayerSwitcher.vue";
import BaselayerSwitcher from "../../../store/indexBaselayerSwitcher";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/BaselayerSwitcher.vue", () => {
    let store,
        wrapper,
        baselayerConfigs,
        visibleBaselayerConfigs,
        originalUpdateLayerVisibilityAndZIndex;
    const vectorTileLayer = {id: "VectorTile", name: "ArcGIS VectorTile", visibility: false, baselayer: true, showInLayerTree: true, zIndex: 1},
        layer_453 = {id: "453", name: "Geobasiskarten (HamburgDE)", visibility: true, baselayer: true, showInLayerTree: true, zIndex: 0};

    beforeEach(() => {
        baselayerConfigs = [
            {id: "WMTS", name: "EOC Basemap", visibility: false, baselayer: true, showInLayerTree: true},
            vectorTileLayer,
            layer_453,
            {id: "452", name: "Digitale Orthophotos (belaubt) Hamburg", visibility: false, baselayer: true, showInLayerTree: true}
        ];
        visibleBaselayerConfigs = [
            vectorTileLayer,
            layer_453
        ];

        originalUpdateLayerVisibilityAndZIndex = BaselayerSwitcher.actions.updateLayerVisibilityAndZIndex;
        BaselayerSwitcher.actions.updateLayerVisibilityAndZIndex = sinon.spy();

        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        BaselayerSwitcher
                    }
                }
            },
            actions: {
                initializeModule: sinon.stub()
            },
            getters: {
                isMobile: () => false,
                layerConfigsByAttributes: () => () => visibleBaselayerConfigs,
                allBaselayerConfigs: () => baselayerConfigs,
                visibleBaselayerConfigs: () => visibleBaselayerConfigs,
                activatedExpandable: () => false
            },
            mutations: {
                setLayerConfigsByAttributes: (state, layer) => {
                    return layer;
                },
                setAllBaselayerConfigs: (state, layer) => {
                    baselayerConfigs = layer;
                },
                setVisibleBaselayerConfigs: (state, layer) => {
                    visibleBaselayerConfigs = layer;
                }
            }
        });
    });

    afterEach(() => {
        BaselayerSwitcher.actions.updateLayerVisibilityAndZIndex = originalUpdateLayerVisibilityAndZIndex;

        sinon.restore();
    });

    describe("baselayerSwitcher DOM elements", () => {
        it("renders BaselayerSwitcher", () => {
            store.commit("Modules/BaselayerSwitcher/setActive", true);
            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#baselayer-switcher").exists()).to.be.true;
        });

        it("renders BaselayerSwitcher for two Baselayers", () => {
            store.commit("setAllBaselayerConfigs", [vectorTileLayer, layer_453]);
            store.commit("Modules/BaselayerSwitcher/setActive", true);
            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#baselayer-switcher").exists()).to.be.true;
        });

        it("does not render baselayerSwitcher", () => {
            store.commit("setAllBaselayerConfigs", []);

            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#baselayer-switcher").exists()).to.be.false;
        });

        it("baselayerSwitcher is expanded", () => {
            store.commit("Modules/BaselayerSwitcher/setActivatedExpandable", true);
            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#baselayer-switcher").exists()).to.be.true;
            expect(wrapper.find("#bs-expanded").exists()).to.be.true;
            expect(wrapper.findAll("#bs-expanded").length).to.equal(store.state.Modules.BaselayerSwitcher.baselayerIds.length);
        });

        it("baselayerId of layer with highest zIndex is shown as preview", () => {
            layer_453.zIndex = 1;
            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#baselayer-switcher").exists()).to.be.true;
            expect(wrapper.find("#layer-tree-layer-preview-" + store.state.Modules.BaselayerSwitcher.topBaselayerId).exists()).to.be.true;
        });
        it("placeholder is shown as preview", () => {
            store.commit("setVisibleBaselayerConfigs", []);

            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#baselayer-switcher").exists()).to.be.true;
            expect(wrapper.find("#bs-placeholder").exists()).to.be.true;
        });
    });

    describe("watcher", () => {
        it("visibleBaselayerConfigs with new baselayer", () => {
            const newValue = [{
                    id: "WMTS",
                    name: "EOC Basemap",
                    visibility: true,
                    baselayer: true,
                    showInLayerTree: true,
                    zIndex: 1
                }],
                oldValue = [];

            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }});

            wrapper.vm.$options.watch.visibleBaselayerConfigs.handler.call(wrapper.vm, newValue, oldValue);
            expect(store.state.Modules.BaselayerSwitcher.topBaselayerId).to.equal("WMTS");
        });
        it("visibleBaselayerConfigs with no selected baselayer", () => {
            const newValue = [],
                oldValue = [{id: "453", visibility: true, baselayer: true, showInLayerTree: true, zIndex: 1}];

            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.visibleBaselayerConfigs.handler.call(wrapper.vm, newValue, oldValue);
            expect(store.state.Modules.BaselayerSwitcher.topBaselayerId).to.equal(null);
        });
    });

    describe("created", () => {
        it("baselayerIds and topBaselayer", () => {
            baselayerConfigs = [
                {id: "Karte1", name: "EOC Basemap", visibility: false, baselayer: true, showInLayerTree: true},
                {id: "Karte2", name: "ArcGIS VectorTile", visibility: false, baselayer: true, showInLayerTree: true},
                {id: "Karte3", name: "Geobasiskarten (HamburgDE)", visibility: true, baselayer: true, showInLayerTree: true},
                {id: "Karte4", name: "Digitale Orthophotos (belaubt) Hamburg", visibility: false, baselayer: true, showInLayerTree: true}
            ];
            visibleBaselayerConfigs = [
                {id: "Karte3", name: "Geobasiskarten (HamburgDE)", visibility: true, baselayer: true, showInLayerTree: true}
            ];
            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(store.state.Modules.BaselayerSwitcher.baselayerIds).to.deep.equal(["Karte1", "Karte2", "Karte4"]);
            expect(store.state.Modules.BaselayerSwitcher.topBaselayerId).to.deep.equal("Karte3");

        });
    });

    describe("BaselayerSwitcher methods", () => {
        it("switchActiveBackgroundLaye to new layerId", () => {
            const layerId = "VectorTile";

            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.switchActiveBaselayer(layerId);

            expect(BaselayerSwitcher.actions.updateLayerVisibilityAndZIndex.calledOnce).to.equal(true);
            expect(store.state.Modules.BaselayerSwitcher.topBaselayerId).to.deep.equal(layerId);
            expect(store.state.Modules.BaselayerSwitcher.activatedExpandable).to.equal(false);
        });
        it("old layer stays visible", () => {
            const layerId = "VectorTile";

            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.switchActiveBaselayer(layerId);

            expect(BaselayerSwitcher.actions.updateLayerVisibilityAndZIndex.calledOnce).to.equal(true);
            expect(store.state.Modules.BaselayerSwitcher.topBaselayerId).to.deep.equal(layerId);
            expect(store.state.Modules.BaselayerSwitcher.activatedExpandable).to.equal(false);
            expect(layer_453.visibility).to.equal(true);
        });
        it("old layer is switched to invisible in singleBaseLayerMode", () => {
            const layerId = "VectorTile";

            store.commit("Modules/BaselayerSwitcher/setSingleBaseLayer", true);

            wrapper = shallowMount(BaselayerSwitcherComponent, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.switchActiveBaselayer(layerId);

            expect(BaselayerSwitcher.actions.updateLayerVisibilityAndZIndex.calledOnce).to.equal(true);
            expect(store.state.Modules.BaselayerSwitcher.topBaselayerId).to.deep.equal(layerId);
            expect(store.state.Modules.BaselayerSwitcher.activatedExpandable).to.equal(false);
            expect(layer_453.visibility).to.equal(false);
        });


    });
});
