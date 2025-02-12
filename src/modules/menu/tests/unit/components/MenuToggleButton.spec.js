import {createStore} from "vuex";
import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import MenuToggleButton from "../../../components/MenuToggleButton.vue";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuToggleButton.vue", () => {
    let store,
        side,
        wrapper,
        toggleMenuSpy;

    beforeEach(() => {
        side = "mainMenu";
        toggleMenuSpy = sinon.spy();
        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        mainExpanded: sinon.stub(),
                        secondaryExpanded: sinon.stub(),
                        mainToggleButtonIcon: () => "bi-list",
                        secondaryToggleButtonIcon: () => "bi-tools"
                    },
                    actions: {
                        toggleMenu: toggleMenuSpy
                    }
                }
            }
        });
    });

    afterEach(sinon.restore);

    it("should render the button including 'mainToggleButtonIcon' as the icon class for side 'main'", () => {
        wrapper = mount(MenuToggleButton, {
            global: {
                plugins: [store]
            },
            propsData: {side}
        });
        const button = wrapper.find(`#${side}-toggle-button`),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "btn-light", "bootstrap-icon", "shadow", "menu-toggle-button", "toggle-button-mainMenu"]);
        expect(button.attributes("type")).to.equal("button");
        expect(button.attributes("aria-label")).to.equal("common:modules.menu.ariaLabelOpen");
        expect(icon.exists()).to.be.true;
        expect(icon.classes()).to.eql(["bi-list"]);
    });
    it("should render the button including 'secondaryToggleButtonIcon' as the icon class for side 'secondaryMenu'", () => {
        side = "secondaryMenu";
        wrapper = mount(MenuToggleButton, {
            global: {
                plugins: [store]
            },
            propsData: {side}
        });
        const button = wrapper.find(`#${side}-toggle-button`),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "btn-light", "bootstrap-icon", "shadow", "menu-toggle-button", "toggle-button-secondaryMenu"]);
        expect(button.attributes("type")).to.equal("button");
        expect(button.attributes("aria-label")).to.equal("common:modules.menu.ariaLabelOpen");
        expect(icon.exists()).to.be.true;
        expect(icon.classes()).to.eql(["bi-tools"]);
    });

    it("mainMenu: calls toggleMenu if clicked on button", async () => {
        wrapper = mount(MenuToggleButton, {
            global: {
                plugins: [store]
            }, propsData: {side}});
        const button = wrapper.find(`#${side}-toggle-button`);

        await button.trigger("click");
        expect(toggleMenuSpy.calledOnce).to.be.true;
        expect(toggleMenuSpy.firstCall.args[1]).to.be.equals("mainMenu");

    });

    it("secondaryMenu: calls toggleMenu if clicked on button", async () => {
        side = "secondaryMenu";
        wrapper = mount(MenuToggleButton, {
            global: {
                plugins: [store]
            }, propsData: {side}});
        const button = wrapper.find(`#${side}-toggle-button`);

        await button.trigger("click");
        expect(toggleMenuSpy.calledOnce).to.be.true;
        expect(toggleMenuSpy.firstCall.args[1]).to.be.equals("secondaryMenu");

    });
});
