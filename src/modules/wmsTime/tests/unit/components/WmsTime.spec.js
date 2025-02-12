import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";

import WmsTimeComponent from "../../../components/WmsTime.vue";
import LayerSwiper from "../../../../../shared/modules/layerSwiper/components/LayerSwiper.vue";
import TimeSlider from "../../../components/TimeSlider.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/wmsTime/components/WmsTime.vue", () => {
    let store,
        timeSliderActive,
        winWidth;

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        WmsTime: {
                            namespaced: true,
                            getters: {
                                timeRange: () => sinon.spy(),
                                minWidth: () => {
                                    return winWidth > 800;
                                },
                                timeSlider: () => {
                                    return {
                                        active: timeSliderActive,
                                        currentLayerId: "",
                                        objects: [],
                                        playbackDelay: 1,
                                        playing: false
                                    };
                                },
                                currentTimeSliderObject: () => {
                                    return {
                                        layerId: "sesamLayer"
                                    };
                                },
                                layerAppendix: () => {
                                    return "_oskarTonne";
                                }
                            },
                            actions: {
                                updateMap: sinon.spy(),
                                toggleSwiper: sinon.spy()
                            },
                            mutations: {
                                setWindowWidth: (number) => {
                                    winWidth = number;
                                },
                                setTimeSliderActive: (active) => {
                                    timeSliderActive = active;
                                },
                                setTimeSliderPlaying: sinon.stub()
                            }
                        },
                        LayerSwiper: {
                            namespaced: true,
                            state: {
                                active: false
                            },
                            getters: {
                                active: state => state.active
                            },
                            mutations: {
                                setActive: (state, active) => {
                                    state.active = active;
                                }
                            }
                        }
                    }
                }
            }
        });
        timeSliderActive = false;
        winWidth = 801;
    });

    afterEach(() => {
        winWidth = 1024;
        timeSliderActive = false;
        sinon.restore();
    });

    it("render one TimeSlider component if it is active and the layerSwiper is inactive", () => {
        timeSliderActive = true;
        const wrapper = shallowMount(WmsTimeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.findAllComponents(TimeSlider).length).to.equal(1);
        expect(wrapper.findComponent(LayerSwiper).exists()).to.be.false;
    });
    it("render two TimeSlider component and a LayerSwiper component if the timeSlider is active, the layerSwiper is active and the window has a minWidth of 800px", () => {
        timeSliderActive = true;
        store.commit("Modules/LayerSwiper/setActive", true);

        const wrapper = shallowMount(WmsTimeComponent, {
                global: {
                    plugins: [store]
                }
            }),
            timeSliderComponents = wrapper.findAllComponents(TimeSlider);

        expect(timeSliderComponents.length).to.equal(2);
        expect(timeSliderComponents.at(0).element.className).to.include("moveLeft");
        expect(timeSliderComponents.at(1).element.className).to.include("moveRight");
        expect(wrapper.findComponent(LayerSwiper).exists()).to.be.true;
    });
    it("should only render one TimeSlider component and no LayerSwiper component if the window size is smaller than the minWidth of 800px", () => {
        timeSliderActive = true;
        winWidth = 799;
        const wrapper = shallowMount(WmsTimeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.findAllComponents(TimeSlider).length).to.equal(1);
        expect(wrapper.findComponent(LayerSwiper).exists()).to.be.false;
    });
});
