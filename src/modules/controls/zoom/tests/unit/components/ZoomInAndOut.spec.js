import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import ZoomInAndOut from "../../../components/ZoomInAndOut.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/zoom/components/ZoomInAndOut.vue", () => {
    const decreaseZoomSpy = sinon.spy(),
        increaseZoomSpy = sinon.spy(),
        mockAlertingActions = {
            addSingleAlert: sinon.stub()
        };
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Zoom: {
                            namespaced: true,
                            getters: {
                                iconIn: sinon.stub(),
                                iconOut: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        isMaxZoomDisplayed: () => false,
                        isMinZoomDisplayed: () => false
                    },
                    actions: {
                        decreaseZoom: decreaseZoomSpy,
                        increaseZoom: increaseZoomSpy
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: mockAlertingActions

                }
            }
        });
    });

    after(() => {
        sinon.restore();
    });

    it("renders the ZoomInAndOut buttons", () => {
        const wrapper = mount(ZoomInAndOut, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#zoom-in-and-out-buttons").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(2);
    });

    it("should trigger the action increaseZoom if button plus is clicked", async () => {
        const wrapper = mount(ZoomInAndOut, {
                global: {
                    plugins: [store]
                }}),
            buttons = wrapper.findAll("#zoom-in-and-out-buttons > button");

        await buttons.at(0).trigger("click");
        expect(increaseZoomSpy.calledOnce).to.be.true;
    });

    it("should trigger the action decreaseZoom if button minus is clicked", async () => {
        const wrapper = mount(ZoomInAndOut, {
                global: {
                    plugins: [store]
                }}),
            buttons = wrapper.findAll("#zoom-in-and-out-buttons > button");

        await buttons.at(1).trigger("click");
        expect(decreaseZoomSpy.calledOnce).to.be.true;
    });
});
