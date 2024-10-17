import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import MouseHoverComponent from "../../../components/MouseHover.vue";
import MouseHover from "../../../store/indexMouseHover";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/mouseHover/components/MouseHover.vue", () => {
    const mockMapGetters = {
        ol2DMap: sinon.stub()
    };
    let store,
        wrapper;

    beforeEach(() => {
        MouseHover.actions.initialize = sinon.stub(MouseHover.actions.initialize);
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        MouseHover
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters
                }
            },
            getters: {
                mobile: () => false
            },
            actions: {
                initializeModule: sinon.stub()
            }
        });
    });

    it("renders mouseHover module", () => {
        wrapper = shallowMount(MouseHoverComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#mousehover-overlay").exists()).to.be.true;
    });
});
