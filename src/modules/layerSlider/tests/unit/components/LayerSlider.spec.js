import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import LayerSliderComponent from "../../../components/LayerSlider.vue";
import LayerSlider from "../../../store/indexLayerSlider";
import NavTab from "../../../../../shared/modules/tabs/components/NavTab.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerSlider/components/LayerSlider.vue", () => {
    const layerSliderPlayerComponentMock = {
            template: "<span />"
        },
        layerSliderHandleComponentMock = {
            template: "<span />"
        };
    let store,
        wrapper;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        LayerSlider
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

    it("renders the layerSlider", () => {
        wrapper = shallowMount(LayerSliderComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-layer-slider").exists()).to.be.true;
    });

    it("renders the layerSlider with LayerSliderPlayer and LayerSliderHandle", () => {
        wrapper = shallowMount(LayerSliderComponent, {
            global: {
                plugins: [store],
                components: {
                    "NavTab": NavTab
                }
            },
            components: {
                LayerSliderPlayer: layerSliderPlayerComponentMock,
                LayerSliderHandle: layerSliderHandleComponentMock
            }
        });

        expect(wrapper.findComponent(layerSliderPlayerComponentMock).exists()).to.be.true;
        expect(wrapper.findComponent(layerSliderHandleComponentMock).exists()).to.be.true;
    });

    it("should reset activeLayer from store and ste invisible to layerTree in unmounted-hook", async () => {
        const layerSliderWrapper = shallowMount(LayerSliderComponent, {
                global: {
                    plugins: [store]
                }
            }),
            sendModificationSpy = sinon.spy(layerSliderWrapper.vm, "sendModification");


        layerSliderWrapper.vm.$options.unmounted.call(layerSliderWrapper.vm);
        await wrapper.vm.$nextTick();

        expect(store.state.Modules.LayerSlider.windowsInterval).to.equals(null);
        expect(sendModificationSpy.calledOnce).to.be.true;
        expect(sendModificationSpy.firstCall.args[0]).to.deep.equals({
            layerId: "",
            visibility: false
        });
        expect(store.state.Modules.LayerSlider.activeLayer).to.deep.equals({
            layerId: "",
            index: -1
        });
    });
});
