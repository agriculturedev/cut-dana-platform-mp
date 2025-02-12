import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import ShadowComponent from "../../../components/ShadowTool.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;
config.global.mocks.$i18next = {
    language: "de"
};

describe("src/modules/shadowTool/components/ShadowTool.vue", () => {
    let map3D,
        store;

    before(() => {
        mapCollection.clear();

        global.Cesium = {};
        global.Cesium.ShadowMode = {
            RECEIVE_ONLY: sinon.stub()
        };
        global.Cesium.Sun = {};
        global.Cesium.JulianDate = {
            fromDate: () => {
                return {dayNumber: 2459950, secondsOfDay: 81397};
            }
        };

        map3D = {
            id: "1",
            mode: "3D",
            time: null,
            getCesiumScene: () => {
                return {
                    globe: {
                        enableLighting: true,
                        shadows: true
                    },
                    shadowMap: {
                        enabled: true
                    },
                    sun: sinon.stub()
                };
            }
        };

        mapCollection.addMap(map3D, "3D");
    });

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Language: {
                            namespaced: true,
                            getters: {
                                currentLocale: () => "en"
                            }
                        },
                        Shadow: {
                            namespaced: true,
                            getters: {
                                isShadowEnabled: () => true,
                                name: () => "common:modules.shadow.name",
                                shadowTime: () => {
                                    return {};
                                }
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

    afterEach(() => {
        sinon.restore();
    });

    describe("shadow tool", () => {
        it("component has checkbox,date picker, time and date slider", () => {
            const wrapper = shallowMount(ShadowComponent, {
                    global: {
                        plugins: [store]
                    }
                }),
                checkbox = wrapper.find("#module-shadow-checkbox"),
                datePicker = wrapper.find("#datePicker"),
                dateSlider = wrapper.find("#dateSlider"),
                timeSlider = wrapper.find("#timeSlider");

            expect(checkbox.exists()).to.be.true;
            expect(datePicker.exists()).to.be.true;
            expect(dateSlider.exists()).to.be.true;
            expect(timeSlider.exists()).to.be.true;
        });

        it("PickDateFormat is DD.MM.YYYY for de", () => {
            const wrapper = shallowMount(ShadowComponent, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.checkDateFormat();
            expect(wrapper.vm.pickDateFormat).to.equal("DD.MM.YYYY");
        });
        it("PickDateFormat is MM.DD.YYYY for en", () => {
            config.global.mocks.$i18next.language = "en";
            const wrapper = shallowMount(ShadowComponent, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.checkDateFormat();
            expect(wrapper.vm.pickDateFormat).to.equal("MM.DD.YYYY");
        });
    });
});
