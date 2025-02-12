import {createStore} from "vuex";
import {nextTick} from "vue";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import OpenConfigComponent from "../../../components/OpenConfig.vue";

config.global.mocks.$t = key => key;

describe("src/modules/openConfig/components/OpenConfig.vue", () => {
    let store,
        warn,
        wrapper;

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        OpenConfig: {
                            namespaced: true,
                            getters: {
                                icon: () => sinon.stub()
                            }
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the openConfig", () => {
        wrapper = shallowMount(OpenConfigComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#open-config").exists()).to.be.true;
        expect(wrapper.find("p").exists()).to.be.true;
        expect(wrapper.find("#open-config-input-button").exists()).to.be.true;
        expect(wrapper.find(".btn-transparent> label").exists()).to.be.true;
        expect(wrapper.find(".btn-transparent> label").text()).to.equals("common:modules.openConfig.openFile");
        expect(wrapper.find(".btn-transparent> label > input").exists()).to.be.true;
        expect(wrapper.find(".btn-transparent> label > span").exists()).to.be.true;
        expect(wrapper.find(".btn-transparent> label > span > i").exists()).to.be.true;
    });

    it("should trigger function triggerClickOnFileInput on keydown", async () => {
        nextTick(async () => {
            const openConfigComponentSpy = sinon.spy(OpenConfigComponent.methods, "triggerClickOnFileInput");

            wrapper = shallowMount(OpenConfigComponent, {
                global: {
                    plugins: [store]
                }});
            await wrapper.find("#open-config-input-button > label").trigger("keydown");

            expect(openConfigComponentSpy.calledOnce).to.be.true;
        });
    });

    it("should trigger function loadFile on change input", async () => {
        nextTick(async () => {
            const loadFileSpy = sinon.spy(OpenConfigComponent.methods, "loadFile");

            wrapper = shallowMount(OpenConfigComponent, {
                global: {
                    plugins: [store]
                }
            });
            await wrapper.find("#open-config-input-button > label > input").trigger("change");

            expect(loadFileSpy.calledOnce).to.be.true;
        });
    });
});
