import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import TiltView from "../../../components/TiltView.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/button3d/components/TiltView.vue", () => {
    let lookDownSpy,
        lookUpSpy,
        map3d,
        store;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        lookDownSpy = sinon.spy();
        lookUpSpy = sinon.spy();

        map3d = {
            id: "olcs",
            mode: "3D",
            getCesiumScene: () => {
                return {
                    camera: {
                        lookDown: lookDownSpy,
                        lookUp: lookUpSpy
                    }
                };
            }
        };

        mapCollection.clear();
        mapCollection.addMap(map3d, "3D");

        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        TiltView: {
                            namespaced: true,
                            getters: {
                                tiltDownIcon: sinon.stub(),
                                tiltUpIcon: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => "3D"
                    }
                }
            }
        });
    });

    after(() => {
        sinon.restore();
    });

    it("renders the TiltView button", () => {
        const wrapper = mount(TiltView, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#tilt-view-button > #tilt-view-up").exists()).to.be.true;
        expect(wrapper.find("#tilt-view-button > #tilt-view-down").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(2);
    });

    it("should return the camera", async () => {
        const wrapper = mount(TiltView, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.vm.getCamera()).to.deep.equals({
            lookDown: lookDownSpy,
            lookUp: lookUpSpy
        });
    });

    it("should call camera lookUp", async () => {
        const wrapper = mount(TiltView, {
            global: {
                plugins: [store]
            }});

        wrapper.vm.tiltUp();

        expect(lookUpSpy.calledOnce).to.be.true;
        expect(lookDownSpy.notCalled).to.be.true;
    });

    it("should call camera lookDown", async () => {
        const wrapper = mount(TiltView, {
            global: {
                plugins: [store]
            }});

        wrapper.vm.tiltDown();

        expect(lookDownSpy.calledOnce).to.be.true;
        expect(lookUpSpy.notCalled).to.be.true;
    });
});
