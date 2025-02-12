import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import MenuContainer from "../../../components/MenuContainer.vue";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuContainer.vue", () => {
    let store,
        currentMenuWidth,
        mainExpanded = false,
        secondaryExpanded = false,
        uiStyle = "default",
        mergeMenuStateSpy,
        mainMenu,
        secondaryMenu,
        defaultComponent,
        closeMenuSpy,
        collapseMenuesSpy,
        isMobile;

    beforeEach(() => {
        currentMenuWidth = sinon.stub();
        closeMenuSpy = sinon.spy();
        mergeMenuStateSpy = sinon.spy();
        collapseMenuesSpy = sinon.spy();
        isMobile = false;

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        MenuContainer
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        defaultComponent: () => defaultComponent,
                        secondaryMenu: () => secondaryMenu,
                        mainMenu: () => mainMenu,
                        currentMenuWidth: () => currentMenuWidth,
                        mainExpanded: () => mainExpanded,
                        secondaryExpanded: () => secondaryExpanded,
                        titleBySide: () => () => true,
                        currentComponent: () => () => "root"
                    },
                    mutations: {
                        collapseMenues: collapseMenuesSpy,
                        mergeMenuState: mergeMenuStateSpy,
                        setCurrentMenuWidth: sinon.spy()
                    },
                    actions: {
                        closeMenu: closeMenuSpy,
                        toggleMenu: sinon.spy()
                    }
                }
            },
            getters: {
                menuFromConfig: () => () => "menuFromConfig",
                isMobile: () => isMobile,
                uiStyle: () => uiStyle
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("mainMenu", () => {
        it("renders the mainMenu component not expanded", () => {
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "mainMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-mainMenu"),
                secondaryMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");


            expect(mainMenuWrapper.exists()).to.be.true;
            expect(secondaryMenuWrapper.exists()).to.be.false;
            expect(wrapper.find("#mp-header-mainMenu").exists()).to.be.true;
            expect(wrapper.find("menu-container-body-stub").exists()).to.be.true;
            expect(wrapper.find("resize-handle-stub").exists()).to.be.true;
            expect(wrapper.find("#mp-menu-mainMenu").attributes().style).to.include("width: 0px");
            expect(collapseMenuesSpy.notCalled).to.be.true;
        });

        it("renders the mainMenu component expanded", () => {
            mainExpanded = true;
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "mainMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-mainMenu"),
                secondaryMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");

            expect(mainMenuWrapper.exists()).to.be.true;
            expect(secondaryMenuWrapper.exists()).to.be.false;
            expect(wrapper.find("#mp-header-mainMenu").exists()).to.be.true;
            expect(wrapper.find("#mp-menu-header-close-button-mainMenu").exists()).to.be.true;
            expect(wrapper.find("menu-container-body-stub").exists()).to.be.true;
            expect(wrapper.find("resize-handle-stub").exists()).to.be.true;
            expect(wrapper.find("#mp-menu-mainMenu").attributes().style).not.to.include("width: 0px");
            expect(collapseMenuesSpy.notCalled).to.be.true;
        });
    });

    describe("secondaryMenu", () => {
        it("renders the secondaryMenu component not expanded", () => {
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "secondaryMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-mainMenu"),
                secondaryMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");

            expect(mainMenuWrapper.exists()).to.be.false;
            expect(secondaryMenuWrapper.exists()).to.be.true;
            expect(wrapper.find("#mp-header-secondaryMenu").exists()).to.be.true;
            expect(wrapper.find("menu-container-body-stub").exists()).to.be.true;
            expect(wrapper.find("resize-handle-stub").exists()).to.be.true;
            expect(wrapper.find("#mp-menu-secondaryMenu").attributes().style).to.include("width: 0px");
            expect(collapseMenuesSpy.notCalled).to.be.true;
        });

        it("renders the secondaryMenu component expanded", () => {
            secondaryExpanded = true;
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "secondaryMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-mainMenu"),
                secondaryMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");

            expect(mainMenuWrapper.exists()).to.be.false;
            expect(secondaryMenuWrapper.exists()).to.be.true;
            expect(wrapper.find("#mp-header-secondaryMenu").exists()).to.be.true;
            expect(wrapper.find("menu-container-body-stub").exists()).to.be.true;
            expect(wrapper.find("resize-handle-stub").exists()).to.be.true;
            expect(wrapper.find("#mp-menu-secondaryMenu").attributes().style).not.to.include("width: 0px");
            expect(collapseMenuesSpy.notCalled).to.be.true;
        });
    });

    it("renders the mainMenu component with table style", () => {
        uiStyle = "TABLE";
        const wrapper = shallowMount(MenuContainer, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            mainMenuWrapper = wrapper.find("#mp-menu-mainMenu"),
            secondaryMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");

        expect(mainMenuWrapper.exists()).to.be.true;
        expect(secondaryMenuWrapper.exists()).to.be.false;
        expect(wrapper.find("#mp-header-mainMenu").exists()).to.be.true;
        expect(wrapper.find("menu-container-body-stub").exists()).to.be.true;
        expect(wrapper.find("resize-handle-stub").exists()).to.be.true;
        expect(wrapper.find("#mp-menu-mainMenu").classes()).to.contain("mp-menu-table");
    });

    it("renders the mainMenu component mobile", () => {
        isMobile = true;
        const wrapper = shallowMount(MenuContainer, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            mainMenuWrapper = wrapper.find("#mp-menu-mainMenu"),
            secondaryMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");

        expect(mainMenuWrapper.exists()).to.be.true;
        expect(secondaryMenuWrapper.exists()).to.be.false;
        expect(mergeMenuStateSpy.calledOnce).to.be.true;
        expect(mergeMenuStateSpy.firstCall.args[1]).deep.equals({
            menu: "menuFromConfig",
            side: "mainMenu"
        });
        expect(collapseMenuesSpy.calledOnce).to.be.true;
    });

    it("shall call toggleMenu if close button is clicked", async () => {
        const wrapper = shallowMount(MenuContainer, {
                global: {
                    plugins: [store]
                },
                propsData: {side: "mainMenu"}
            }),
            mainMenuWrapper = wrapper.find("#mp-menu-mainMenu"),
            closeBtn = wrapper.find("#mp-menu-header-close-button-mainMenu");

        expect(mainMenuWrapper.exists()).to.be.true;
        expect(closeBtn.exists()).to.be.true;
        await closeBtn.trigger("click");
        expect(closeMenuSpy.calledOnce).to.be.true;
        expect(closeMenuSpy.firstCall.args[1]).equals("mainMenu");
    });

    describe("handlePosition", () => {
        it("computed property handlePosition in mainMenu", () => {
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "mainMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-mainMenu");

            expect(mainMenuWrapper.exists()).to.be.true;
            expect(wrapper.vm.handlePosition).equals("right");
        });

        it("computed property handlePosition in secondaryMenu", () => {
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "secondaryMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");

            expect(mainMenuWrapper.exists()).to.be.true;
            expect(wrapper.vm.handlePosition).equals("left");
        });
    });

    describe("watcher mainMenu and secondaryMenu", () => {
        it("watcher mainMenu", () => {
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "mainMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-mainMenu");

            expect(mainMenuWrapper.exists()).to.be.true;
            wrapper.vm.$options.watch.mainMenu.call(wrapper.vm, {id: "mainMenu"});
            expect(mergeMenuStateSpy.calledTwice).to.be.true;
            expect(mergeMenuStateSpy.secondCall.args[1]).deep.equals({
                menu: {id: "mainMenu"},
                side: "mainMenu"
            });
        });

        it("watcher secondaryMenu", () => {
            const wrapper = shallowMount(MenuContainer, {
                    global: {
                        plugins: [store]
                    },
                    propsData: {side: "secondaryMenu"}
                }),
                mainMenuWrapper = wrapper.find("#mp-menu-secondaryMenu");

            expect(mainMenuWrapper.exists()).to.be.true;
            wrapper.vm.$options.watch.secondaryMenu.call(wrapper.vm, {id: "secondaryMenu"});
            expect(mergeMenuStateSpy.calledTwice).to.be.true;
            expect(mergeMenuStateSpy.secondCall.args[1]).deep.equals({
                menu: {id: "secondaryMenu"},
                side: "secondaryMenu"
            });
        });
    });

});
