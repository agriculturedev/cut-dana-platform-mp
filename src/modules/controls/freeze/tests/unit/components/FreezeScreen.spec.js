import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import FreezeScreen from "../../../components/FreezeScreen.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/freeze/components/FreezeScreen.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Freeze: {
                            namespaced: true,
                            getters: {
                                icon: sinon.stub()
                            }
                        }
                    }
                }
            }
        });
    });

    it("renders the freeze-screen-button", () => {
        const wrapper = mount(FreezeScreen, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#freeze-screen-button").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(1);
    });

    it("renders the freeze-screen-button and freeze-screen-unfreeze", async () => {
        const wrapper = mount(FreezeScreen, {
            global: {
                plugins: [store]
            }});

        await wrapper.vm.showFreezeWin();

        expect(wrapper.find("#freeze-screen-button").exists()).to.be.true;
        expect(wrapper.find("#freeze-screen-unfreeze").exists()).to.be.true;
    });
});
