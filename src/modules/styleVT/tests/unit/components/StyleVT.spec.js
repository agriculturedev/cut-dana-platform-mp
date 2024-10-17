import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import sinon from "sinon";

import StyleVTComponent from "../../../components/StyleVT.vue";

config.global.mocks.$t = key => key;

describe("src/modules/styleVT/components/StyleVT.vue", () => {
    let store,
        vectorTileLayerList,
        wrapper;

    beforeEach(() => {
        vectorTileLayerList = [];

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        StyleVT: {
                            namespaced: true,
                            getters: {
                                layerModel: () => null,
                                selectedLayerId: () => sinon.stub(),
                                selectedStyle: () => sinon.stub(),
                                vectorTileLayerList: () => vectorTileLayerList
                            },
                            actions: {
                                refreshVectorTileLayerList: () => sinon.stub(),
                                updateStyle: () => sinon.stub(),
                                startLayerProcess: () => sinon.stub()
                            }
                        }
                    }
                }
            },
            getters: {
                visibleLayerConfigs: () => []
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should render a paragraph informing the user that no styleable layers are available if none are", () => {
        wrapper = shallowMount(StyleVTComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-styleVT-noStyleableLayers").exists()).to.be.true;
        expect(wrapper.find("#module-styleVT-styleableLayersAvailable").exists()).to.be.false;
    });

    it("should render the regular UI if styleable layers are available", () => {
        const layerOne = Symbol(),
            layerTwo = Symbol();

        vectorTileLayerList = [layerOne, layerTwo];

        wrapper = shallowMount(StyleVTComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-styleVT-styleableLayersAvailable").exists()).to.be.true;
        expect(wrapper.find("#module-styleVT-noStyleableLayers").exists()).to.be.false;
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div"),
            layerOne = Symbol(),
            layerTwo = Symbol();

        vectorTileLayerList = [layerOne, layerTwo];

        if (document.body) {
            document.body.appendChild(elem);
        }

        wrapper = shallowMount(StyleVTComponent, {
            attachTo: elem,
            global: {
                plugins: [store]
            }
        });

        wrapper.vm.setFocusToFirstControl();

        await wrapper.vm.$nextTick();

        expect(wrapper.find("#module-styleVT-selectedLayerField").element).to.equal(document.activeElement);
    });
});
