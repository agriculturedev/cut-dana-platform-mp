import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import CompareMaps from "../../../components/CompareMaps.vue";
import {expect} from "chai";
import sinon from "sinon";
import mapCollection from "../../../../../core/maps/js/mapCollection";
import mutations from "../../../store/mutationsCompareMaps";

config.global.mocks.$t = key => key;

describe("src/modules/compareMaps/components/CompareMaps.vue", () => {
    let store, initializeSpy, rootCommitSpy, wrapper, map;

    beforeEach(() => {
        map = {
            id: "ol",
            mode: "2D",
            removeLayer: sinon.spy(),
            on: sinon.stub(),
            once: sinon.stub()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        initializeSpy = sinon.spy();
        rootCommitSpy = sinon.spy();

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        CompareMaps: {
                            namespaced: true,
                            actions: {
                                initialize: initializeSpy
                            },
                            mutations: {
                                ...mutations
                            },
                            getters: {
                                layerNames: () => [{name: "Layer 1", id: "layer1"}, {name: "Layer 2", id: "layer2"}],
                                initialBaseLayer: () => ({name: "Base Layer", id: "baseLayer"}),
                                selectedLayer1Id: () => "layer1",
                                selectedLayer2Id: () => "layer2"
                            }
                        },
                        LayerSwiper: {
                            namespaced: true,
                            actions: {
                                updateMap: sinon.spy()
                            },
                            mutations: {
                                setActive: sinon.spy(),
                                setLayerSwiperSourceLayer: sinon.spy(),
                                setLayerSwiperTargetLayer: sinon.spy()
                            }
                        },
                        LayerSelection: {
                            namespaced: true,
                            actions: {
                                changeVisibility: sinon.spy()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => "2D"
                    }
                }
            },
            getters: {
                visibleLayerConfigs: () => [
                    {id: "layer1", name: "Layer 1", typ: "WMS", visibility: true},
                    {id: "layer2", name: "Layer 2", typ: "WFS", visibility: true}
                ]
            }
        });

        store.commit = rootCommitSpy;
    });

    afterEach(() => {
        mapCollection.clear();
        sinon.restore();
    });

    it("renders the CompareMaps component", () => {
        wrapper = shallowMount(CompareMaps, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#compare-maps").exists()).to.be.true;
    });

    it("initializes the component and sets active", async () => {
        wrapper = shallowMount(CompareMaps, {
            global: {
                plugins: [store]
            }
        });

        await wrapper.vm.$nextTick();

        expect(initializeSpy.calledOnce).to.be.true;
        expect(wrapper.vm.splitDirection).to.equal("vertical");
    });

    it("resets the layer selection", async () => {
        wrapper = shallowMount(CompareMaps, {
            global: {
                plugins: [store]
            }
        });

        await wrapper.vm.resetSelection();

        expect(wrapper.vm.selectedLayer1).to.be.null;
        expect(wrapper.vm.selectedLayer2).to.be.null;

        expect(rootCommitSpy.calledWith("Modules/CompareMaps/setSelectedLayer1Id", "", undefined)).to.be.true;
        expect(rootCommitSpy.calledWith("Modules/CompareMaps/setSelectedLayer2Id", "", undefined)).to.be.true;
        expect(rootCommitSpy.calledWith("Modules/LayerSwiper/setActive", false, undefined)).to.be.true;
        expect(rootCommitSpy.calledWith("Modules/LayerSwiper/setLayerSwiperSourceLayer", null, undefined)).to.be.true;
        expect(rootCommitSpy.calledWith("Modules/LayerSwiper/setLayerSwiperTargetLayer", null, undefined)).to.be.true;
    });
});
