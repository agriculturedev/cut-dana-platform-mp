import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import IsochronesComponent from "../../../../components/Isochrones/IsochronesItem.vue";
import IsochronesItemBatchProcessingComponent from "../../../../components/Isochrones/IsochronesItemBatchProcessing.vue";
import RoutingBatchProcessingCheckboxComponent from "../../../../components/RoutingBatchProcessingCheckbox.vue";
import RoutingSliderInputComponent from "../../../../components/RoutingSliderInput.vue";
import RoutingDownloadComponent from "../../../../components/RoutingDownload.vue";
import mutations from "../../../../store/mutationsRouting";
import actions from "../../../../store/actionsRouting";
import mutationsIsochrones from "../../../../store/isochrones/mutationsIsochrones";
import actionsIsochrones from "../../../../store/isochrones/actionsIsochrones";
import gettersIsochrones from "../../../../store/isochrones/gettersIsochrones";
import stateIsochrones from "../../../../store/isochrones/stateIsochrones";

config.silent = true;
config.global.mocks.$t = key => key;

describe("src/modules/routing/components/Isochrones/IsochronesItem.vue", () => {
    let batchProcessingActive,
        batchProcessingEnabled,
        store,
        wrapper;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            removeLayer: sinon.spy()
        };

        mapCollection.addMap(map, "2D");
    });


    beforeEach(() => {
        batchProcessingActive = false;
        batchProcessingEnabled = false;

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing: {
                            namespaced: true,
                            modules: {
                                Isochrones: {
                                    namespaced: true,
                                    state: stateIsochrones,
                                    mutations: mutationsIsochrones,
                                    actions: actionsIsochrones,
                                    getters: gettersIsochrones
                                }
                            },
                            mutations,
                            actions,
                            getters: {
                                isochronesSettings: () => {
                                    return {
                                        batchProcessing: {
                                            active: batchProcessingActive,
                                            enabled: batchProcessingEnabled
                                        }
                                    };
                                }
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    state: {
                        mode: "2D"
                    },
                    actions: {
                        addLayer: sinon.stub(),
                        removeInteraction: sinon.stub(),
                        addInteraction: sinon.stub()
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders Isochrones", () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        expect(wrapper.find("#routing-isochrones").exists()).to.be.true;
    });

    it("renders IsochronesBatchProcessingCheckbox", async () => {
        batchProcessingEnabled = true;
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.true;
    });

    it("doesn't render IsochronesBatchProcessingCheckbox", async () => {
        batchProcessingEnabled = false;
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.false;
    });

    it("renders IsochronesBatchProcessing", async () => {
        batchProcessingActive = true;
        batchProcessingEnabled = true;
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(IsochronesItemBatchProcessingComponent).exists()).to.be.true;
    });

    it("doesn't render IsochronesBatchProcessing", async () => {
        batchProcessingActive = false;
        batchProcessingEnabled = true;
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(IsochronesItemBatchProcessingComponent).exists()).to.be.false;
    });

    it("renders RoutingCoordinateInput", async () => {
        batchProcessingEnabled = false;
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-coordinate-input-form").exists()).to.be.true;
    });

    it("doesn't render RoutingCoordinateInput", async () => {
        batchProcessingActive = true;
        batchProcessingEnabled = true;
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-coordinate-input-form").exists()).to.be.false;
    });

    it("renders RoutingSliderInput - DISTANCE", async () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.isochronesMethodOption = "DISTANCE";
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.routing.isochrones.maxDistance")
                .length
        ).equal(1);
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.routing.isochrones.maxTraveltime")
                .length
        ).equal(0);
    });

    it("renders RoutingSliderInput - TIME", async () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.isochronesMethodOption = "TIME";
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.routing.isochrones.maxTraveltime")
                .length
        ).equal(1);
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.routing.isochrones.maxDistance")
                .length
        ).equal(0);
    });

    it("renders isochrones result", async () => {
        batchProcessingEnabled = false;
        store.commit("Modules/Routing/Isochrones/setRoutingIsochrones", {
            getAreas: () => []
        });
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-result-isochrones").exists()).to.be.true;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.true;
    });

    it("doesn't render isochrones result", async () => {
        batchProcessingEnabled = false;
        store.commit("Modules/Routing/Isochrones/setRoutingIsochrones", null);
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-result-isochrones").exists()).to.be.false;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.false;
    });

    it("computes currentValue depending on method option", () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.distanceValue = 10;
        wrapper.vm.settings.timeValue = 20;
        wrapper.vm.settings.isochronesMethodOption = "TIME";
        expect(wrapper.vm.currentValue).equal(20);
        wrapper.vm.settings.isochronesMethodOption = "DISTANCE";
        expect(wrapper.vm.currentValue).equal(10);
    });

    it("computes maxInterval depending on currentValue", () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.distanceValue = 10;
        wrapper.vm.settings.isochronesMethodOption = "DISTANCE";
        wrapper.vm.settings.maxInterval = 15;
        expect(wrapper.vm.maxIntervalValue).equal(10);
        wrapper.vm.settings.distanceValue = 30;
        expect(wrapper.vm.settings.maxInterval).equal(15);
    });

    it("should setIntervalValue on changeMethodOption if value smaller than intervalValue", () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.distanceValue = 10;
        wrapper.vm.settings.intervalValue = 30;
        wrapper.vm.settings.isochronesMethodOption = "TIME";
        wrapper.vm.changeMethodOption("DISTANCE");
        expect(wrapper.vm.settings.intervalValue).equal(10);
    });

    it("should setIntervalValue on setDistanceValue if value smaller than intervalValue", () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.distanceValue = 30;
        wrapper.vm.settings.intervalValue = 30;
        wrapper.vm.setDistanceValue(20);
        expect(wrapper.vm.settings.intervalValue).equal(20);
    });

    it("should setIntervalValue on setTimeValue if value smaller than intervalValue", () => {
        wrapper = shallowMount(IsochronesComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.timeValue = 30;
        wrapper.vm.settings.intervalValue = 30;
        wrapper.vm.setTimeValue(20);
        expect(wrapper.vm.settings.intervalValue).equal(20);
    });
});
