import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import DirectionsComponent from "../../../../components/Directions/DirectionsItem.vue";
import DirectionsItemBatchProcessingComponent from "../../../../components/Directions/DirectionsItemBatchProcessing.vue";
import RoutingBatchProcessingCheckboxComponent from "../../../../components/RoutingBatchProcessingCheckbox.vue";
import RoutingDownloadComponent from "../../../../components/RoutingDownload.vue";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/Directions/DirectionsItem.vue", () => {
    let batchProcessingActive,
        batchProcessingEnabled,
        directionsAvoidSource,
        mapInteractionMode,
        routingDirections,
        setMapInteractionModeSpy,
        store,
        wrapper;

    beforeEach(() => {
        batchProcessingActive = false;
        batchProcessingEnabled = false;
        mapInteractionMode = "WAYPOINTS";
        routingDirections = null;

        mapCollection.clear();
        mapCollection.addMap({
            mode: "2D",
            mapMode: "2D"
        }, "2D");

        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing:
                        {
                            namespaced: true,
                            modules: {
                                Directions: {
                                    namespaced: true,
                                    getters: {
                                        directionsAvoidSource: () => directionsAvoidSource,
                                        directionsRouteSource: () => {
                                            return {
                                                getFeatures: () => []
                                            };
                                        },
                                        isInputDisabled: () => false,
                                        mapInteractionMode: () => mapInteractionMode,
                                        routingAvoidFeaturesOptions: () => [],
                                        routingDirections: () => routingDirections,
                                        settings: () => {
                                            return {
                                                speedProfile: "CAR"
                                            };
                                        },
                                        waypoints: () => [
                                            {
                                                index: sinon.stub(),
                                                getDisplayName: () => sinon.stub()
                                            },
                                            {
                                                index: sinon.stub(),
                                                getDisplayName: () => sinon.stub()
                                            }
                                        ],
                                        keepRoutes: (state) => {
                                            return state.keepRoutes;
                                        }
                                    },
                                    mutations: {
                                        setDirectionsAvoidSource: sinon.stub(),
                                        setMapInteractionMode: sinon.stub(),
                                        setRoutingDirections: sinon.stub()
                                    },
                                    actions: {
                                        createInteractionFromMapInteractionMode: sinon.stub(),
                                        initDirections: sinon.stub()
                                    }
                                }
                            },
                            getters: {
                                directionsSettings: () => {
                                    return {
                                        batchProcessing: {
                                            active: batchProcessingActive,
                                            enabled: batchProcessingEnabled
                                        }
                                    };
                                }
                            },
                            mutations: {
                                setDirectionsAvoidSource: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    mode: "2D",
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

    it("renders Directions", () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        expect(wrapper.find("#routing-directions").exists()).to.be.true;
    });

    it("renders DirectionsBatchProcessingCheckbox", async () => {
        batchProcessingEnabled = true;
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.true;
    });

    it("doesn't render DirectionsBatchProcessingCheckbox", async () => {
        batchProcessingEnabled = false;
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.false;
    });

    it("renders DirectionsBatchProcessing", async () => {
        batchProcessingEnabled = true;
        batchProcessingActive = true;
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(DirectionsItemBatchProcessingComponent).exists()).to.be.true;
    });

    it("doesn't render DirectionsBatchProcessing", async () => {
        batchProcessingEnabled = true;
        batchProcessingActive = false;
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(DirectionsItemBatchProcessingComponent).exists()).to.be.false;
    });

    it("renders RoutingCoordinateInput", async () => {
        batchProcessingEnabled = false;
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-coordinate-input-form").exists()).to.be.true;
    });

    it("doesn't render RoutingCoordinateInput", async () => {
        batchProcessingEnabled = true;
        batchProcessingActive = true;
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});


        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-coordinate-input-form").exists()).to.be.false;
    });

    it("renders routing result", async () => {
        batchProcessingEnabled = false;
        routingDirections = {
            duration: 10,
            distance: 10,
            segments: []
        };
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-result-directions").exists()).to.be.true;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.true;
    });

    it("doesn't render routing result", async () => {
        batchProcessingEnabled = false;
        routingDirections = null;
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-result-directions").exists()).to.be.false;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.false;
    });

    describe("checks if findDirections are called", () => {
        it("should call on changeSpeedProfile", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.changeSpeedProfile("CAR");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on changePreference", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.changePreference("SHORTEST");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on onAddAvoidOption", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.onAddAvoidOption("HIGHWAYS");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on onRemoveAvoidOption", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.onRemoveAvoidOption("HIGHWAYS");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });
    });

    it("should toggle mapInteractionMode AVOID_AREAS => WAYPOINTS", async () => {
        mapInteractionMode = "AVOID_AREAS";
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        setMapInteractionModeSpy = sinon.spy(wrapper.vm, "setMapInteractionMode");
        wrapper.vm.changeMapInteractionModeAvoidAreasEdit();

        expect(setMapInteractionModeSpy.calledOnce).to.be.true;
        expect(setMapInteractionModeSpy.firstCall.args[0]).to.equals("WAYPOINTS");
    });

    it("should toggle mapInteractionMode WAYPOINTS => AVOID_AREAS", async () => {
        mapInteractionMode = "WAYPOINTS";
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        setMapInteractionModeSpy = sinon.spy(wrapper.vm, "setMapInteractionMode");
        wrapper.vm.changeMapInteractionModeAvoidAreasEdit();

        expect(setMapInteractionModeSpy.calledOnce).to.be.true;
        expect(setMapInteractionModeSpy.firstCall.args[0]).to.equals("AVOID_AREAS");
    });


    it("should toggle mapInteractionMode DELETE_AVOID_AREAS => WAYPOINTS", async () => {
        mapInteractionMode = "DELETE_AVOID_AREAS";
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        setMapInteractionModeSpy = sinon.spy(wrapper.vm, "setMapInteractionMode");
        wrapper.vm.changeMapInteractionModeAvoidAreasDelete();

        expect(setMapInteractionModeSpy.calledOnce).to.be.true;
        expect(setMapInteractionModeSpy.firstCall.args[0]).to.equals("WAYPOINTS");
    });

    it("should toggle mapInteractionMode WAYPOINTS => DELETE_AVOID_AREAS", () => {
        mapInteractionMode = "WAYPOINTS";
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        setMapInteractionModeSpy = sinon.spy(wrapper.vm, "setMapInteractionMode");
        wrapper.vm.changeMapInteractionModeAvoidAreasDelete();

        expect(setMapInteractionModeSpy.calledOnce).to.be.true;
        expect(setMapInteractionModeSpy.firstCall.args[0]).to.equals("DELETE_AVOID_AREAS");
    });

    it("should reset all user settings", async () => {
        const removeWaypoint = sinon.spy(),
            setRoutingDirections = sinon.spy(),
            clearDirectionsAvoidSource = sinon.spy();

        directionsAvoidSource = {
            clear: clearDirectionsAvoidSource
        };

        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});

        wrapper.vm.setRoutingDirections = setRoutingDirections;
        wrapper.vm.removeWaypoint = removeWaypoint;
        wrapper.vm.reset();

        expect(removeWaypoint.calledTwice).to.be.true;
        expect(setRoutingDirections.calledOnce).to.be.true;
        expect(clearDirectionsAvoidSource.calledOnce).to.be.true;
    });
});
