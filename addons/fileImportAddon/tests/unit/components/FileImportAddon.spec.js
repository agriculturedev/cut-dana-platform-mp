import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import FileImportAddonComponent from "../../../components/FileImportAddon.vue";
import FileImportAddon from "../../../store/indexFileImportAddon";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("addons/fileImportAddon/components/FileImportAddon.vue", () => {
    const
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            FileImportAddon:
                            {
                                "title": "translate#addtional:menu.tools.fileImportAddon",
                                "icon": "bi-file-earmark-arrow-up-fill",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };

    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        FileImportAddon
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/FileImportAddon/setActive", true);
    });

    it("renders the FileImportAddon", () => {
        const wrapper = shallowMount(FileImportAddonComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.true;
    });

    it("do not render the FileImportAddon tool if not active", () => {
        store.commit("Tools/FileImportAddon/setActive", false);
        const wrapper = shallowMount(FileImportAddonComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.false;
    });

    it("import method is initially set to \"auto\"", () => {
        const wrapper = shallowMount(FileImportAddonComponent, {store, localVue});

        expect(wrapper.vm.selectedFiletype).to.equal("auto");
    });

    it("The layer name will be got from file name", () => {
        const wrapper = shallowMount(FileImportAddonComponent, {store, localVue});

        expect(wrapper.vm.getLayerName("geolayer.kml")).to.equal("geolayer");
    });
});
