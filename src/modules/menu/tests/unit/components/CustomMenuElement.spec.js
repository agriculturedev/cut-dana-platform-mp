import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import axios from "axios";
import CustomMenuElement from "../../../components/CustomMenuElement.vue";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/menu/components/CustomMenuElement.vue", () => {
    let store,
        wrapper,
        currentComponent,
        side,
        htmlContent,
        errorSpy,
        currentComponentProps;

    beforeEach(() => {
        side = "mainMenu";
        currentComponentProps = {
            htmlContent: undefined,
            pathToContent: undefined
        };
        currentComponent = {
            props: currentComponentProps
        };
        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        currentComponent: () => () => currentComponent
                    }
                }
            }
        });
        htmlContent = "<div><span>Hallo Welt</span></div>";
        errorSpy = sinon.spy();
        sinon.stub(console, "error").callsFake(errorSpy);
    });

    afterEach(sinon.restore);

    it("renders only a div if no htmlContent or pathToContent is given", () => {
        wrapper = mount(CustomMenuElement,
            {
                global: {
                    plugins: [store]
                },
                propsData: {side}
            });

        expect(wrapper.find(".custom-menu-element").exists()).to.be.true;
        expect(wrapper.findAll("div").length).to.be.equals(1);
    });

    it("renders htmlContent", () => {
        currentComponentProps.htmlContent = "<div><span/></div>";
        wrapper = mount(CustomMenuElement,
            {
                global: {
                    plugins: [store]
                },
                propsData: {side}
            });

        expect(wrapper.find(".custom-menu-element").exists()).to.be.true;
        expect(wrapper.findAll("div").length).to.be.equals(3);
        expect(wrapper.findAll("span").length).to.be.equals(1);
    });

    it("renders pathToContent", async () => {
        sinon.stub(axios, "get").resolves({status: 200, data: htmlContent});
        currentComponentProps.pathToContent = "aPath/path";
        wrapper = mount(CustomMenuElement,
            {
                global: {
                    plugins: [store]
                },
                propsData: {side}
            });
        await wrapper.vm.$nextTick();

        expect(wrapper.find(".custom-menu-element").exists()).to.be.true;
        expect(wrapper.findAll("div").length).to.be.equals(3);
        expect(wrapper.findAll("span").length).to.be.equals(1);
        expect(wrapper.find("span").text()).to.be.equals("Hallo Welt");
    });

    it("logs error if pathToContent cannot be read", async () => {
        currentComponentProps.pathToContent = "aPath/path";
        sinon.stub(axios, "get").resolves({status: 404, data: null});
        wrapper = mount(CustomMenuElement,
            {
                global: {
                    plugins: [store]
                },
                propsData: {side}
            });
        await wrapper.vm.$nextTick();

        expect(wrapper.find(".custom-menu-element").exists()).to.be.true;
        expect(errorSpy.calledOnce).to.be.true;
    });
});
