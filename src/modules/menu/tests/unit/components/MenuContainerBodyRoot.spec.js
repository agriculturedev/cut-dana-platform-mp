import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import MenuContainerBodyRoot from "../../../components/MenuContainerBodyRoot.vue";
import MenuContainerBodyRootLogo from "../../../components/MenuContainerBodyRootLogo.vue";
import MenuContainerBodyRootItems from "../../../components/MenuContainerBodyRootItems.vue";
import LayerTree from "../../../../layerTree/components/LayerTree.vue";
import SearchBar from "../../../../searchBar/components/SearchBar.vue";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuContainerBodyRoot.vue", () => {
    let store,
        mainMenu,
        mainMenuTitle,
        secondaryMenu,
        secondaryMenuTitle;

    beforeEach(() => {
        mainMenu = {
            sections: [
                {
                    type: "section1"
                },
                {
                    type: "section1"
                }
            ],
            searchBar: {}
        };
        secondaryMenu = {
            sections: [
                {
                    type: "section1"
                },
                {
                    type: "section1"
                }
            ]
        };
        mainMenuTitle = {
            idAppendix: "mainMenu",
            text: "Master"
        };
        secondaryMenuTitle = {
            idAppendix: "secondaryMenu",
            text: "MasterSecond"
        };
        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        titleBySide: () => (side) => {
                            if (side === "mainMenu") {
                                return mainMenuTitle;
                            }
                            else if (side === "secondaryMenu") {
                                return secondaryMenuTitle;
                            }
                            return null;
                        },
                        mainMenu: () => mainMenu,
                        secondaryMenu: () => secondaryMenu

                    }
                }
            }
        });
    });

    it("renders the component in mainMenu with no sections", () => {
        mainMenu.sections = [];
        const wrapper = shallowMount(MenuContainerBodyRoot, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-root-mainMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(LayerTree).exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuContainerBodyRootItems).exists()).to.be.false;
    });

    it("renders the component in secondaryMenu with no sections", () => {
        secondaryMenu.sections = [];
        const wrapper = shallowMount(MenuContainerBodyRoot, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "secondaryMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-root-secondaryMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(LayerTree).exists()).to.be.false;
        expect(bodyWrapper.findComponent(MenuContainerBodyRootItems).exists()).to.be.false;
    });

    it("renders the component in secondaryMenu with no sections and no logo", () => {
        secondaryMenu.sections = [];
        secondaryMenuTitle = null;
        const wrapper = shallowMount(MenuContainerBodyRoot, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "secondaryMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-root-secondaryMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuContainerBodyRootLogo).exists()).to.be.false;
        expect(bodyWrapper.findComponent(SearchBar).exists()).to.be.false;
        expect(bodyWrapper.findComponent(LayerTree).exists()).to.be.false;
        expect(bodyWrapper.findComponent(MenuContainerBodyRootItems).exists()).to.be.false;
    });

    it("renders the component in mainMenu with sections", () => {
        const wrapper = shallowMount(MenuContainerBodyRoot, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-root-mainMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(LayerTree).exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuContainerBodyRootItems).exists()).to.be.true;
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub").length).to.be.equals(2);
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[0].attributes("idappendix")).to.be.equals("mainMenu");
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[0].attributes("path")).to.be.equals("mainMenu,sections,0");
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[1].attributes("idappendix")).to.be.equals("mainMenu");
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[1].attributes("path")).to.be.equals("mainMenu,sections,1");
    });

    it("renders the component in secondaryMenu with sections and no logo", () => {
        secondaryMenuTitle = null;
        const wrapper = shallowMount(MenuContainerBodyRoot, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "secondaryMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-root-secondaryMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuContainerBodyRootLogo).exists()).to.be.false;
        expect(bodyWrapper.findComponent(SearchBar).exists()).to.be.false;
        expect(bodyWrapper.findComponent(LayerTree).exists()).to.be.false;
        expect(bodyWrapper.findComponent(MenuContainerBodyRootItems).exists()).to.be.true;
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub").length).to.be.equals(2);
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[0].attributes("idappendix")).to.be.equals("secondaryMenu");
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[0].attributes("path")).to.be.equals("secondaryMenu,sections,0");
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[1].attributes("idappendix")).to.be.equals("secondaryMenu");
        expect(bodyWrapper.findAll("menu-container-body-root-items-stub")[1].attributes("path")).to.be.equals("secondaryMenu,sections,1");
    });
});
