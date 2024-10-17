import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import visibilityChecker from "../../../../../shared/js/utils/visibilityChecker";
import MenuContainerBodyRootItemElement from "../../../components/MenuContainerBodyRootItemElement.vue";
import LightButton from "../../../../../shared/modules/buttons/components/LightButton.vue";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuContainerBodyRootItemElement.vue", () => {
    const
        mockConfigJson = {
            portalConfig: {
                tree: {
                }
            }
        };
    let store,
        clickedMenuElementSpy,
        resetMenuSpy,
        menu,
        mapMode,
        isModuleVisible;

    beforeEach(() => {
        menu = {
            currentComponent: "componentType"
        };
        isModuleVisible = true;
        mapMode = "2D";
        clickedMenuElementSpy = sinon.spy();
        resetMenuSpy = sinon.spy();
        sinon.stub(visibilityChecker, "isModuleVisible").callsFake(() => {
            return isModuleVisible;
        });
        store = createStore({
            namespaced: true,
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        mainMenu: () => menu,
                        secondaryMenu: () => menu,
                        showDescription: () => () => false
                    },
                    actions: {
                        clickedMenuElement: clickedMenuElementSpy,
                        resetMenu: resetMenuSpy
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => mapMode
                    }
                }
            },
            getters: {
                deviceMode: () => "Desktop",
                portalConfig: () => mockConfigJson.portalConfig
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the component and it contains the LightButton", () => {
        const wrapper = shallowMount(MenuContainerBodyRootItemElement, {
            global: {
                plugins: [store]
            },
            propsData: {icon: "bi-file-plus", name: "awesomeName", properties: {}}
        });

        expect(wrapper.findComponent(LightButton).exists()).to.be.true;
    });

    it("calls clickedMenuElement in created if type is equals currentComponent", () => {
        const name = "awesomeName",
            type = "componentType",
            path = ["mainMenu", type],
            wrapper = shallowMount(MenuContainerBodyRootItemElement, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    icon: "bi-file-plus",
                    name: name,
                    path: path,
                    properties: {
                        type: type
                    }}
            });

        expect(wrapper.findComponent(LightButton).exists()).to.be.true;
        expect(clickedMenuElementSpy.calledOnce).to.be.true;
        expect(clickedMenuElementSpy.firstCall.args[1]).to.be.deep.equals({
            name: name,
            path: path,
            side: path[0],
            type: type
        });
    });

    it("calls not clickedMenuElement in created if type is not equals currentComponent", () => {
        const name = "awesomeName",
            type = "otherType",
            path = ["mainMenu", type],
            wrapper = shallowMount(MenuContainerBodyRootItemElement, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    icon: "bi-file-plus",
                    name: name,
                    path: path,
                    properties: {
                        type: type
                    }}
            });

        expect(wrapper.findComponent(LightButton).exists()).to.be.true;
        expect(clickedMenuElementSpy.notCalled).to.be.true;
    });

    describe("methods", () => {
        it("checkIsVisible shall not close currentComponent if it shall be visible on mode change", () => {
            mapMode = "3D";
            isModuleVisible = true;

            const name = "awesomeName",
                type = "componentType",
                path = ["mainMenu", type],
                wrapper = shallowMount(MenuContainerBodyRootItemElement, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {
                        icon: "bi-file-plus",
                        name: name,
                        path: path,
                        properties: {
                            type: type,
                            supportedMapModes: ["2D", "3D"],
                            supportedDevices: ["Desktop", "Mobile", "Table"]
                        }}
                });

            expect(wrapper.findComponent(LightButton).exists()).to.be.true;
            expect(resetMenuSpy.notCalled).to.be.true;
        });

        it("checkIsVisible shall close currentComponent if not shall be visible on mode change", () => {
            mapMode = "3D";
            isModuleVisible = false;

            const name = "awesomeName",
                type = "componentType",
                path = ["mainMenu", type],
                wrapper = shallowMount(MenuContainerBodyRootItemElement, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {
                        icon: "bi-file-plus",
                        name: name,
                        path: path,
                        properties: {
                            type: type,
                            supportedMapModes: ["2D"],
                            supportedDevices: ["Desktop", "Mobile", "Table"]
                        }}
                });

            expect(wrapper.findComponent(LightButton).exists()).to.be.false;
            expect(resetMenuSpy.calledOnce).to.be.true;
            expect(resetMenuSpy.firstCall.args[1]).to.be.equals(path[0]);
        });
    });

});
