import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import MenuContainerBody from "../../../components/MenuContainerBody.vue";
import {expect} from "chai";
import MenuNavigation from "../../../components/MenuNavigation.vue";
import MenuContainerBodyRoot from "../../../components/MenuContainerBodyRoot.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuContainerBody.vue", () => {
    let store,
        menu,
        menuType;

    beforeEach(() => {
        menuType = "type";
        menu = {
            navigation: {
                currentComponent: {
                    type: menuType
                }
            }

        };
        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        defaultComponent: sinon.stub(),
                        mainMenu: () => menu,
                        secondaryMenu: () => menu,
                        mainExpanded: () => sinon.stub,
                        secondaryExpanded: () => sinon.stub

                    },
                    mutations: {
                        addTestMenuSection: (state, section) => {
                            state.menuSections.push(section);
                        },
                        addModuleToMenuSection: sinon.stub()
                    }
                },
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        GetFeatureInfo: {
                            namespaced: true,
                            getters: {
                                menuSide: () => "secondaryMenu"
                            }
                        }
                    },
                    getters: {
                        componentMap: () => {
                            return {
                                type: menuType
                            };
                        }
                    }
                }
            }
        });
    });

    it("renders the component in mainMenu and it contains the MenuNavigation and not GetFeatureInfo", () => {
        const wrapper = shallowMount(MenuContainerBody, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-mainMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuNavigation).exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuContainerBodyRoot).exists()).to.be.true;
        expect(bodyWrapper.find("get-feature-info-stub").exists()).to.be.false;
    });

    it("renders the component in secondaryMenu and it contains the MenuNavigation and not displayed GetFeatureInfo", () => {
        const wrapper = shallowMount(MenuContainerBody, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "secondaryMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-secondaryMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuNavigation).exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuContainerBodyRoot).exists()).to.be.true;
        expect(bodyWrapper.find("get-feature-info-stub").exists()).to.be.true;
        expect(bodyWrapper.find("get-feature-info-stub").attributes("style")).to.be.equals("display: none;");
        expect(bodyWrapper.find("menu-container-body-root-stub").attributes("style")).to.be.equals("display: none;");

    });

    it("renders the component in mainMenu, currentComponent is root", () => {
        menuType = "root";
        const wrapper = shallowMount(MenuContainerBody, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-mainMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuNavigation).exists()).to.be.true;
        expect(bodyWrapper.find("menu-container-body-root-stub").exists()).to.be.true;
        expect(bodyWrapper.find("menu-container-body-root-stub").attributes("side")).to.be.equals("mainMenu");
        expect(bodyWrapper.find("menu-container-body-root-stub").attributes("style")).to.be.undefined;
    });

    it("renders the component in mainMenu, currentComponent is not root or getFeatureInfo", () => {
        menuType = "component";
        const wrapper = shallowMount(MenuContainerBody, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-mainMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuNavigation).exists()).to.be.true;
        expect(bodyWrapper.find("component").exists()).to.be.true;
    });

    it("renders the component in secondaryMenu, currentComponent is getFeatureInfo", () => {
        menuType = "getFeatureInfo";
        const wrapper = shallowMount(MenuContainerBody, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "secondaryMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-secondaryMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(bodyWrapper.findComponent(MenuNavigation).exists()).to.be.true;
        expect(bodyWrapper.find("menu-container-body-root-stub").exists()).to.be.true;
        expect(bodyWrapper.find("menu-container-body-root-stub").attributes("side")).to.be.equals("secondaryMenu");
        expect(bodyWrapper.find("menu-container-body-root-stub").attributes("style")).to.be.equals("display: none;");
        expect(bodyWrapper.find("get-feature-info-stub").exists()).to.be.true;
        expect(bodyWrapper.find("get-feature-info-stub").attributes("style")).to.be.undefined;
    });

    it("computed property currentComponent", () => {
        menuType = "getFeatureInfo";
        const wrapper = shallowMount(MenuContainerBody, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            bodyWrapper = wrapper.find("#mp-body-mainMenu");

        expect(bodyWrapper.exists()).to.be.true;
        expect(wrapper.vm.currentComponent).to.be.equals("getFeatureInfo");
    });


});
