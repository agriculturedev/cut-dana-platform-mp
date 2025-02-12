import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import PoiChoiceComponent from "../../../../components/poi/PoiChoice.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/controls/orientation/components/PoiChoice.vue", () => {
    let store,
        wrapper;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Orientation: {
                            namespaced: true,
                            getters: {
                                poiMode: sinon.stub(),
                                customPosition: () => "common:modules.controls.orientation.poiChoiceCustomPosition"
                            },
                            mutations: {
                                setShowPoiChoice: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: {
                        registerListener: sinon.spy(),
                        unregisterListener: sinon.spy()
                    }
                }
            }
        });

        wrapper = shallowMount(PoiChoiceComponent, {
            global: {
                plugins: [store]
            }
        });
    });

    after(() => {
        sinon.restore();
    });


    describe("Render Component", function () {
        it("renders the Poi choice component", () => {
            expect(wrapper.find(".poi-choice").exists()).to.be.true;
            expect(wrapper.find(".choice-content").exists()).to.be.true;
            expect(wrapper.find(".choice-content >label.currentPosition").text()).to.equal("common:modules.controls.orientation.poiChoiceCurrentPosition");
            expect(wrapper.find(".choice-content >label.currentPosition input").element.value).to.equal("currentPosition");
            expect(wrapper.find(".choice-content >label.customPosition").text()).to.equal("common:modules.controls.orientation.poiChoiceCustomPosition");
            expect(wrapper.find(".choice-content >label.customPosition input").element.value).to.equal("customPosition");
        });

        it("should emitted track event if button is clicked", async () => {
            const button = wrapper.find(".choice-content button.confirm");

            await button.trigger("click");
            expect(wrapper.emitted()).to.have.property("track");
            expect(wrapper.emitted().track).to.have.lengthOf(1);
        });
    });
});
