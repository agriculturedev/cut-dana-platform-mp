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
        previousNavigationEntryText;

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
        navigateBackSpy = sinon.spy();

        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        previousNavigationEntryText: () => (theSide) => previousNavigationEntryText[theSide],
                        currentComponentName: () => (theSide) => componentName[theSide]
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

});
