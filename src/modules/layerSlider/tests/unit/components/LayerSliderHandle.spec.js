import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import LayerSliderHandleComponent from "../../../components/LayerSliderHandle.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerSlider/components/LayerSliderHandle.vue", () => {
    const layerIds = [
        {
            layerId: 0,
            index: 0
        },
        {
            layerId: 1,
            index: 1
        },
        {
            layerId: 2,
            index: 2
        }
    ];

    let store,
        wrapper;

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        LayerSlider: {
                            namespaced: true,
                            getters: {
                                type: () => "layerSlider",
                                name: () => "common:modules.layerSlider.name",
                                icon: () => "bi-hourglass-split",
                                title: () => "common:modules.layerSlider.title",
                                layerIds: () => layerIds,
                                activeLayer: () => {
                                    return {
                                        layerId: "",
                                        index: -1
                                    };
                                },
                                sliderMin: () => "0",
                                sliderMax: () => "",
                                sliderTicks: () => ""
                            },
                            actions: {
                                setActiveIndex: sinon.stub(),
                                sendModification: sinon.stub()
                            },
                            mutations: {
                                setLayerIds: sinon.stub(),
                                setSliderMax: sinon.stub(),
                                setSliderTicks: sinon.stub()
                            }
                        }
                    }
                }
            },
            actions: {
                replaceByIdInLayerConfig: sinon.stub()
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the layerSliderHandle elements", () => {
        store.commit("Modules/LayerSlider/setLayerIds", layerIds);

        wrapper = shallowMount(LayerSliderHandleComponent, {
            global: {
                plugins: [store]
            }
        });

        const input = wrapper.find("slider-item-stub");

        expect(wrapper.find("#module-layer-slider-handle").exists()).to.be.true;
        expect(input.exists()).to.be.true;
    });

    it("prepareSliderTicks - returns the slider ticks", () => {
        wrapper = shallowMount(LayerSliderHandleComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.vm.prepareSliderTicks(layerIds)).to.includes(0, 10, 20);
    });

    describe("getLayerIdFromIndex", () => {
        it("should return first layerId", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getLayerIdFromIndex(0)).equals(0);
        });
        it("should return second layerId based on the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getLayerIdFromIndex(0, "next")).equals(1);
        });
        it("should return third layerId", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getLayerIdFromIndex(14)).to.equal(1);
        });
        it("should return fourth layerId based on the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getLayerIdFromIndex(14, "next")).to.equal(2);
        });
    });

    describe("getPositionFromValue", () => {
        it("should return position based on \"value\"", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getPositionFromValue(0)).to.equal(0);
        });
        it("should return position based on \"value\" and the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getPositionFromValue(0, "next")).to.equal(1);
        });
        it("should return position based on \"value\"", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getPositionFromValue(14)).to.equal(1);
        });
        it("should return position based on \"value\" and the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.getPositionFromValue(14, "next")).to.equal(2);
        });
    });

    describe("showLayer", () => {
        it("show layer with status true, if transparency is 100", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 100, [{
                layerId: "100"
            },
            {
                layerId: "200"
            },
            {
                layerId: "300"

            }]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                visibility: true,
                transparency: 100
            });
        });
        it("show layer with status true, if transparency is 0", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 0, [{
                layerId: "100"
            },
            {
                layerId: "200"
            },
            {
                layerId: "300"

            }]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                visibility: true,
                transparency: 0
            });
        });
        it("show layer with status true, if transparency is 37", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 37, [{
                layerId: "100"
            },
            {
                layerId: "200"
            },
            {
                layerId: "300"

            }]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                visibility: true,
                transparency: 37
            });
        });
        it("show layer with status false, if transparency is 110", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 110, [{
                layerId: "100"
            },
            {
                layerId: "200"
            },
            {
                layerId: "300"

            }]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                visibility: false,
                transparency: 110
            });
        });
        it("show layer with layerId is an empty object", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {
                global: {
                    plugins: [store]
                }
            });

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer({}, 110, ["100", "200", "300"]);

            expect(spySendModification.notCalled).to.be.true;
        });
    });
});
