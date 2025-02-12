import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import TotalView from "../../../components/TotalView.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/totalView/components/TotalView.vue", () => {
    const resetViewSpy = sinon.spy();
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        TotalView: {
                            namespaced: true,
                            getters: {
                                icon: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        center: () => [10, 20],
                        initialCenter: () => [5, 5],
                        initialZoom: () => 3,
                        zoom: () => 5
                    },
                    actions: {
                        resetView: resetViewSpy
                    }
                }
            }
        });
    });

    after(() => {
        sinon.restore();
    });

    it("renders the totalView button", () => {
        const wrapper = mount(TotalView, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#total-view-button").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(1);
    });

    it("should trigger the action resetView if button is clicked", async () => {
        const wrapper = mount(TotalView, {
            global: {
                plugins: [store]
            }});

        await wrapper.find("#total-view-button > button").trigger("click");

        expect(resetViewSpy.calledOnce).to.be.true;
    });
});
