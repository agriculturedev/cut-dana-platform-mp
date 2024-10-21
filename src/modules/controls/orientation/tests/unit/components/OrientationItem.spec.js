import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import OrientationItemComponent from "../../../components/OrientationItem.vue";
import layerCollection from "../../../../../../core/layers/js/layerCollection";

config.global.mocks.$t = key => key;

describe("src/modules/controls/orientation/components/OrientationItem.vue", () => {
    let store,
        onlyFilteredFeatures = false;
    const mockAlertingActions = {
        addSingleAlert: sinon.stub()
    };

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
                                geolocation: sinon.stub(),
                                iconGeolocate: sinon.stub(),
                                iconGeolocatePOI: sinon.stub(),
                                poiDistances: () => [],
                                poiMode: sinon.stub(),
                                poiModeCurrentPositionEnabled: sinon.stub(),
                                showPoi: sinon.stub(),
                                showPoiChoice: sinon.stub(),
                                showPoiIcon: sinon.stub(),
                                zoomMode: sinon.stub(),
                                onlyFilteredFeatures: () => onlyFilteredFeatures
                            }
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: mockAlertingActions

                }
            },
            getters: {
                visibleLayerConfigs: sinon.stub()
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the Orientation component", () => {
        const wrapper = mount(OrientationItemComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find(".orientationButtons").exists()).to.be.true;
        expect(wrapper.find("#geolocation_marker").exists()).to.be.true;
    });

    it("renders the Orientation button", () => {
        const wrapper = mount(OrientationItemComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#geolocate").exists()).to.be.true;
    });

    it("will not render the Poi Orientation button", () => {
        const wrapper = mount(OrientationItemComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#geolocatePOI").exists()).to.be.false;
    });

    it("will union the array", () => {
        const wrapper = mount(OrientationItemComponent, {
                global: {
                    plugins: [store]
                }}),
            arr1 = [3, 3, 4],
            arr2 = [5, 6, 7],
            arr = [3, 4, 5, 6, 7];

        expect(wrapper.vm.union(arr1, arr2, (obj1, obj2) => obj1 === obj2)).to.deep.equal(arr);
    });
    describe("OrientationItem.vue methods", () => {
        const centerPosition = [0, 0],
            distance = 100,
            features = [{
                getStyle: () => {
                    return {
                        getImage: sinon.stub()
                    };
                },
                getGeometry: () => {
                    return {
                        getClosestPoint: () => {
                            return [10, 10];
                        }
                    };
                },
                get: () => sinon.stub()
            },
            {
                getStyle: () => {
                    return () => null;
                },
                getGeometry: () => {
                    return {
                        getClosestPoint: () => {
                            return [15, 10];
                        }
                    };
                },
                get: () => sinon.stub()
            }],
            layerSource = {
                getFeaturesInExtent: () => {
                    return features;
                }
            },
            wfsLayer = {
                has: () => {
                    return true;
                },
                get: (key) => {
                    if (key === "layerSource") {
                        return layerSource;
                    }
                    else if (key === "styleId") {
                        return "123";
                    }
                    else if (key === "name") {
                        return "TestLayer";
                    }
                    return "";
                },
                getLayerSource: () => layerSource
            },
            layerConfigs = [
                {
                    id: "1",
                    typ: "WFS",
                    visibility: true
                },
                {
                    id: "2",
                    typ: "WFS",
                    visibility: true
                },
                {
                    id: "3",
                    typ: "WFS",
                    visibility: true
                }
            ];

        it("getVectorFeaturesInCircle returns all features", () => {
            const wrapper = mount(OrientationItemComponent, {
                global: {
                    plugins: [store]
                }});
            let returnedFeatures = "";

            sinon.stub(layerCollection, "getLayerById").returns(wfsLayer);
            returnedFeatures = wrapper.vm.getVectorFeaturesInCircle(layerConfigs, distance, centerPosition);
            expect(returnedFeatures.length).to.be.equals(2);
        });
        it("getVectorFeaturesInCircle returns only filtered features", () => {
            onlyFilteredFeatures = true;
            const wrapper = mount(OrientationItemComponent, {
                global: {
                    plugins: [store]
                }});
            let returnedFeatures = "";

            sinon.stub(layerCollection, "getLayerById").returns(wfsLayer);
            returnedFeatures = wrapper.vm.getVectorFeaturesInCircle(layerConfigs, distance, centerPosition);
            expect(returnedFeatures.length).to.be.equals(1);
        });
        it("getVectorFeaturesInCircle returns only features in extent", () => {
            let returnedFeatures = "";
            const wrapper = mount(OrientationItemComponent, {
                global: {
                    plugins: [store]
                }});

            sinon.stub(layerCollection, "getLayerById").returns(wfsLayer);
            returnedFeatures = wrapper.vm.getVectorFeaturesInCircle(layerConfigs, 15, centerPosition);
            expect(returnedFeatures.length).to.be.equals(1);
        });
    });

});
