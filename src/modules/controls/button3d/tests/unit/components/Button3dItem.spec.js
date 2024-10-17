import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import Button3dItem from "../../../components/Button3dItem.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/button3d/components/Button3dItem.vue", () => {
    const changeMapModeSpy = sinon.spy();
    let store;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Button3d: {
                            namespaced: true,
                            getters: {
                                icon2d: sinon.stub(),
                                icon3d: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => "2D"
                    },
                    actions: {
                        changeMapMode: changeMapModeSpy
                    }
                }
            }
        });
    });

    after(() => {
        sinon.restore();
    });

    it("renders the button3d button", () => {
        const wrapper = mount(Button3dItem, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#button-3d-button > button").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(1);
    });

    it("should trigger change map mode with target mode 3D", async () => {
        const wrapper = mount(Button3dItem, {
            global: {
                plugins: [store]
            }});

        await wrapper.find("#button-3d-button > button").trigger("click");

        expect(changeMapModeSpy.calledOnce).to.be.true;
        expect(changeMapModeSpy.firstCall.args[1]).to.equals("3D");
    });
});
