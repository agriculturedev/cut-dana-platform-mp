import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import FullScreen from "../../../components/FullScreen.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/fullScreen/components/FullScreen.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        FullScreen: {
                            namespaced: true,
                            getters: {
                                iconArrow: sinon.stub()
                            }
                        }
                    }
                }
            }
        });
    });

    it("renders the fullScreen button", () => {
        const wrapper = mount(FullScreen, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#full-screen-button").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(1);
    });
});
