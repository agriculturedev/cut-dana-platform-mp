import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import MenuNavigation from "../../../components/MenuNavigation.vue";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/core/menu/navigation/components/MenuNavigation.vue", () => {
    let wrapper,
        store,
        navigateBackSpy,
        side,
        componentName,
        component,
        previousNavigationEntryText,
        showHeaderIcon;

    beforeEach(() => {
        side = "mainMenu";
        previousNavigationEntryText = {
            mainMenu: "previousMainMenu",
            secondaryMenu: "previousSecondaryMenu"
        };
        componentName = {
            mainMenu: "nameMainMenu",
            secondaryMenu: "nameSecondaryMenu"
        };
        component = {
            mainMenu: "root",
            secondaryMenu: "root"
        };
        navigateBackSpy = sinon.spy();
        showHeaderIcon = {
            mainMenu: false,
            secondaryMenu: false
        };

        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        previousNavigationEntryText: () => (theSide) => previousNavigationEntryText[theSide],
                        currentComponentName: () => (theSide) => componentName[theSide],
                        currentComponent: () => (theSide) => component[theSide],
                        showHeaderIcon: () => (theSide) => showHeaderIcon[theSide]
                    },
                    actions: {
                        navigateBack: navigateBackSpy
                    }
                }
            },
            getters: {
                isMobile: () => false
            }
        });
    });

    afterEach(sinon.restore);

    it("renders the navigation in the main menu side", () => {
        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});

        expect(wrapper.find("#mp-menu-navigation-mainMenu").exists()).to.be.true;
        expect(wrapper.find("#mp-navigation-mainMenu").exists()).to.be.true;
        expect(wrapper.find(".mp-menu-navigation-moduletitle").exists()).to.be.true;
        expect(wrapper.find(".mp-menu-navigation-moduletitle").text()).to.be.equals(componentName.mainMenu);
    });

    it("renders the navigation in the secondary menu side", () => {
        side = "secondaryMenu";
        wrapper = mount(MenuNavigation, {global: {
            plugins: [store]
        }, propsData: {side: "secondaryMenu"}});

        expect(wrapper.find("#mp-menu-navigation-secondaryMenu").exists()).to.be.true;
        expect(wrapper.find("#mp-navigation-secondaryMenu").exists()).to.be.true;
        expect(wrapper.find(".mp-menu-navigation-moduletitle").exists()).to.be.true;
        expect(wrapper.find(".mp-menu-navigation-moduletitle").text()).to.be.equals(componentName.secondaryMenu);
    });

    it("doesn't render the navigation in the main menu side if no previousNav available", () => {
        previousNavigationEntryText = {};

        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});

        expect(wrapper.find("#mp-menu-navigation-mainMenu").exists()).to.be.false;
        expect(wrapper.find("#mp-navigation-mainMenu").exists()).to.be.false;
        expect(wrapper.find(".mp-menu-navigation-moduletitle").exists()).to.be.false;
    });

    it("doesn't render the navigation in the main menu side if no previousNav available", () => {
        previousNavigationEntryText = {};
        side = "secondaryMenu";

        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});

        expect(wrapper.find("#mp-menu-navigation-secondaryMenu").exists()).to.be.false;
        expect(wrapper.find("#mp-navigation-secondaryMenu").exists()).to.be.false;
        expect(wrapper.find(".mp-menu-navigation-moduletitle").exists()).to.be.false;
    });

    it("mainMenu: calls navigateBack if clicked on previousNavigation", async () => {
        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});
        const navigation = wrapper.find("#mp-navigation-mainMenu");

        await navigation.trigger("click");
        expect(navigateBackSpy.calledOnce).to.be.true;
        expect(navigateBackSpy.firstCall.args[1]).to.be.equals("mainMenu");

    });

    it("secondaryMenu: calls navigateBack if clicked on previousNavigation", async () => {
        side = "secondaryMenu";
        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});
        const navigation = wrapper.find("#mp-navigation-secondaryMenu");

        await navigation.trigger("click");
        expect(navigateBackSpy.calledOnce).to.be.true;
        expect(navigateBackSpy.firstCall.args[1]).to.be.equals("secondaryMenu");

    });

    it("renders the header icon in the main menu side", () => {
        showHeaderIcon.mainMenu = true;
        component.mainMenu = {"name": "componentName", "icon": "bi-tools"};
        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});

        expect(wrapper.find("#mp-menu-navigation-mainMenu > .mp-menu-navigation-moduletitle > i").exists()).to.be.true;
    });

    it("renders the header icon in the secondary menu side", () => {
        side = "secondaryMenu";
        showHeaderIcon.secondaryMenu = true;
        component.secondaryMenu = {"name": "componentName", "props": {"icon": "bi-tools"}};
        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});

        expect(wrapper.find("#mp-menu-navigation-secondaryMenu > .mp-menu-navigation-moduletitle > i").exists()).to.be.true;
    });

    it("dont renders the header icon in the main menu side", () => {
        component.mainMenu = {"name": "componentName", "icon": "bi-tools"};
        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});

        expect(wrapper.find("#mp-menu-navigation-mainMenu > .mp-menu-navigation-moduletitle > i").exists()).to.be.false;
    });

    it("dont renders the header icon in the secondar menu side", () => {
        side = "secondaryMenu";
        component.secondaryMenu = {"name": "componentName", "icon": "bi-tools"};
        wrapper = mount(MenuNavigation, {
            global: {
                plugins: [store]
            }, propsData: {side}});

        expect(wrapper.find("#mp-menu-navigation-secondaryMenu > .mp-menu-navigation-moduletitle > i").exists()).to.be.false;
    });
});
