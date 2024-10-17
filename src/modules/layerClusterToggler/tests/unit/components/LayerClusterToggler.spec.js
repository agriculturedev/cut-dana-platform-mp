import {createStore} from "vuex";
import {config, mount, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import LayerClusterTogglerComponent from "../../../components/LayerClusterToggler.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerClusterToggler/components/LayerClusterToggler.vue", () => {
    let layerNames,
        store,
        wrapper;

    beforeEach(() => {
        layerNames = [
            "Abc",
            "Example",
            "Xyz"
        ];

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        LayerClusterToggler: {
                            namespaced: true,
                            getters: {
                                icon: () => "",
                                isToggled: () => true,
                                layerIdList: () => [
                                    "1234",
                                    "8712.1",
                                    "8712.2"
                                ],
                                layerNames: () => layerNames
                            },
                            actions: {
                                toggleLayerVisibility: sinon.stub()
                            }
                        }
                    }
                }
            }
        });

    });

    afterEach(() => {
        sinon.restore();
    });


    it("should find the component LayerClusterToggler", () => {
        wrapper = shallowMount(LayerClusterTogglerComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent({name: "LayerClusterToggler"}).exists()).to.be.true;
        expect(wrapper.find("#layer-cluster-toggler-text").exists()).to.be.true;
        expect(wrapper.find("#layer-cluster-toggler-button").exists()).to.be.true;
    });

    it("should find the list for configured layerIdList", () => {
        wrapper = shallowMount(LayerClusterTogglerComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("p").exists()).to.be.true;
        expect(wrapper.find("p").text()).to.equals("common:modules.layerClusterToggler.info");
        expect(wrapper.find("ul").exists()).to.be.true;
        expect(wrapper.findAll("ul > li").length).to.equals(3);

        wrapper.findAll("ul > li").forEach((li, index) => {
            expect(li.exists()).to.be.true;
            expect(li.text()).to.equals(layerNames[index]);
        });
    });

    it("should toogle visible of the layers, if the flat button is clicked", async () => {
        wrapper = mount(LayerClusterTogglerComponent, {
            global: {
                plugins: [store]
            }
        });

        const toggleLayerVisibilitySpy = sinon.spy(wrapper.vm, "toggleLayerVisibility");

        await wrapper.find(".flat-button").trigger("click");

        expect(toggleLayerVisibilitySpy.calledOnce).to.be.true;
    });
});
