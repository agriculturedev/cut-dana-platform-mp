import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import ScaleLine from "../../../components/ScaleLine.vue";

config.global.mocks.$t = key => key;

describe("src/modules/portalFooter/components/ScaleLine.vue", () => {
    let mapMode,
        store,
        wrapper;

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        PortalFooter: {
                            namespaced: true,
                            getters: {
                                scaleLineWidth: () => 2
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => mapMode,
                        scale: () => 60000
                    }
                }
            }
        });
    });

    describe("Check render scale line", () => {
        it("check mapMode normal -> do render", () => {
            mapMode = "2D";
            wrapper = shallowMount(ScaleLine, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#modules-scales").exists()).to.equal(true);
            expect(wrapper.find(".scale-line").text()).to.equals("1.2 km");
            expect(wrapper.find(".scale-as-a-ratio").text()).to.equals("1 : 60.000");
        });

        it("check mapMode 3D -> do not render", () => {
            mapMode = "3D";
            wrapper = shallowMount(ScaleLine, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#scales").exists()).to.equal(false);
        });
    });

    describe("scaleToOne", () => {
        beforeEach(() => {
            wrapper = shallowMount(ScaleLine, {
                global: {
                    plugins: [store]
                }
            });
        });

        it("should return \"1 : scale must be a positive number\" if anything but a number is given", () => {
            expect(wrapper.vm.scaleToOne(undefined)).to.equal("1 : scale must be a positive number");
            expect(wrapper.vm.scaleToOne(null)).to.equal("1 : scale must be a positive number");
            expect(wrapper.vm.scaleToOne("string")).to.equal("1 : scale must be a positive number");
            expect(wrapper.vm.scaleToOne(true)).to.equal("1 : scale must be a positive number");
            expect(wrapper.vm.scaleToOne(false)).to.equal("1 : scale must be a positive number");
            expect(wrapper.vm.scaleToOne({})).to.equal("1 : scale must be a positive number");
            expect(wrapper.vm.scaleToOne([])).to.equal("1 : scale must be a positive number");
        });

        it("should return \"1 : scale must be a positive number\" if zero is given", () => {
            expect(wrapper.vm.scaleToOne(0)).to.equal("1 : scale must be a positive number");
        });

        it("should return \"1 : scale must be a positive number\" if a negative scale is given", () => {
            expect(wrapper.vm.scaleToOne(-1)).to.equal("1 : scale must be a positive number");
        });

        it("should keep the given scale as scaleToOne untouched if scale is 1.000 or less", () => {
            expect(wrapper.vm.scaleToOne(1)).to.equal("1 : 1");
            expect(wrapper.vm.scaleToOne(123)).to.equal("1 : 123");
            expect(wrapper.vm.scaleToOne(999)).to.equal("1 : 999");
            expect(wrapper.vm.scaleToOne(1000)).to.equal("1 : 1.000");
        });

        it("should return the given scale as scaleToOne down to the fifties if scale is 10.000 or less", () => {
            expect(wrapper.vm.scaleToOne(1001)).to.equal("1 : 1.000");
            expect(wrapper.vm.scaleToOne(1024)).to.equal("1 : 1.000");
            expect(wrapper.vm.scaleToOne(1025)).to.equal("1 : 1.050");
            expect(wrapper.vm.scaleToOne(10000)).to.equal("1 : 10.000");
        });

        it("should return the given scale as scaleToOne down to five hundreds if scale is greater than 10.000", () => {
            expect(wrapper.vm.scaleToOne(10249)).to.equal("1 : 10.000");
            expect(wrapper.vm.scaleToOne(10250)).to.equal("1 : 10.500");
        });
    });

    describe("scaleWithUnit", () => {
        beforeEach(() => {
            wrapper = shallowMount(ScaleLine, {
                global: {
                    plugins: [store]
                }
            });
        });

        it("should return a scale with unit for 2cm scale line width", () => {
            expect(wrapper.vm.scaleWithUnit(10000, 2)).to.equal("200 m");
            expect(wrapper.vm.scaleWithUnit(20000, 2)).to.equal("400 m");
        });

        it("should return a scale with unit for 4cm scale line width", () => {
            expect(wrapper.vm.scaleWithUnit(10000, 4)).to.equal("400 m");
            expect(wrapper.vm.scaleWithUnit(20000, 4)).to.equal("800 m");
        });
    });
});
