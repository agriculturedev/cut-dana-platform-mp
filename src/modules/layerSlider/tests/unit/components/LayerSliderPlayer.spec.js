import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import LayerSliderPlayerComponent from "../../../components/LayerSliderPlayer.vue";
import LayerSlider from "../../../store/indexLayerSlider";

config.global.mocks.$t = key => key;

describe("src/modules/layerSlider/components/LayerSliderPlayer.vue", () => {
    let store,
        wrapper;

    beforeEach(() => {
        store = createStore({
            modules: {
                namespaced: true,
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

    it("renders the layerSliderPlayer elements", () => {
        wrapper = shallowMount(LayerSliderPlayerComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-layer-slider-player").exists()).to.be.true;
        expect(wrapper.find("#module-layer-slider-player > div.progress").exists()).to.be.true;
        expect(wrapper.find("#module-layer-slider-player > div.input-group").exists()).to.be.true;
    });

    it("renders the progress-bar", () => {
        wrapper = shallowMount(LayerSliderPlayerComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-layer-slider-player > div.progress").exists()).to.be.true;
        expect(wrapper.find("#module-layer-slider-player > div.progress > div.progress-bar").exists()).to.be.true;
        expect(wrapper.find("#module-layer-slider-player > div.progress > div.progress-bar > span.visually-hidden").exists()).to.be.true;
        expect(wrapper.find("#module-layer-slider-player > div.progress > div.progress-bar > span.visually-hidden").text()).equals("common:modules.layerSlider.displayLayers");
    });

    it("renders the input-group with buttons", () => {
        const buttonIds = ["play", "stop", "backward", "forward"];

        wrapper = shallowMount(LayerSliderPlayerComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-layer-slider-player > div.input-group").exists()).to.be.true;
        expect(wrapper.findAll("#module-layer-slider-player > div.input-group > button").length).equals(4);

        wrapper.findAll("#module-layer-slider-player > div.input-group > button").forEach((button, index) => {
            expect(button.attributes("id")).equals(buttonIds[index]);
        });

        expect(wrapper.find("#module-layer-slider-player > div.input-group > label").exists()).to.be.true;
        expect(wrapper.find("#module-layer-slider-player > div.input-group > input#title").exists()).to.be.true;
    });

    it("renders the input-group button pause if play is clicked", async () => {
        await store.commit("Modules/LayerSlider/setLayerIds", [
            {
                layerId: 0,
                index: 0
            },
            {
                layerid: 1,
                index: 1
            }
        ]);

        wrapper = shallowMount(LayerSliderPlayerComponent, {
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#module-layer-slider-player > div.input-group > button#play").trigger("click");

        expect(wrapper.find("#module-layer-slider-player > div.input-group > button#play").exists()).to.be.false;
        expect(wrapper.find("#module-layer-slider-player > div.input-group > button#pause").exists()).to.be.true;
    });

    it("skip to next layer with forward button", async () => {
        await store.commit("Modules/LayerSlider/setLayerIds", [
            {
                layerId: 0,
                index: 0
            },
            {
                layerid: 1,
                index: 1
            },
            {
                layerid: 2,
                index: 2
            }
        ]);
        wrapper = shallowMount(LayerSliderPlayerComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(0);

        await wrapper.find("#module-layer-slider-player > div.input-group > button#forward").trigger("click");
        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(1);

        await wrapper.find("#module-layer-slider-player > div.input-group > button#forward").trigger("click");
        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(2);

        await wrapper.find("#module-layer-slider-player > div.input-group > button#forward").trigger("click");
        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(0);
    });

    it("skip to previous layer with backward button", async () => {
        await store.commit("Modules/LayerSlider/setLayerIds", [
            {
                layerId: 0,
                index: 0
            },
            {
                layerid: 1,
                index: 1
            },
            {
                layerid: 2,
                index: 2
            }
        ]);
        wrapper = shallowMount(LayerSliderPlayerComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(0);

        await wrapper.find("#module-layer-slider-player > div.input-group > button#backward").trigger("click");
        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(2);

        await wrapper.find("#module-layer-slider-player > div.input-group > button#backward").trigger("click");
        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(1);

        await wrapper.find("#module-layer-slider-player > div.input-group > button#backward").trigger("click");
        expect(store.getters["Modules/LayerSlider/activeLayer"].index).equals(0);
    });
});
