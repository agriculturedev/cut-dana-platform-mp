import Vuex from "vuex";
import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import OrientationItemComponent from "../../../components/OrientationItem.vue";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/controls/orientation/components/OrientationItem.vue", () => {
    const mockGetters = {
            showPoiIcon: () => false,
            position: () => null,
            showPoiChoice: () => false,
            showPoi: () => false
        },
        mockAlertingActions = {
            addSingleAlert: sinon.stub()
        };

    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                controls: {
                    namespaced: true,
                    modules: {
                        orientation: {
                            namespaced: true,
                            getters: mockGetters
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: mockAlertingActions
                }
            }
        });

        wrapper = shallowMount(OrientationItemComponent, {
            store,
            localVue
        });
    });
    afterEach(() => {
        sinon.restore();
        wrapper.destroy();
    });

    it("renders the Orientation component", () => {
        expect(wrapper.find(".orientationButtons").exists()).to.be.true;
        expect(wrapper.find("#geolocation_marker").exists()).to.be.true;
    });

    it("renders the Orientation button", () => {
        expect(wrapper.find("#geolocate").exists()).to.be.true;
    });

    it("will not render the Poi Orientation button", () => {
        expect(wrapper.find("#geolocatePOI").exists()).to.be.false;
    });

    it("will union the array", () => {
        const arr1 = [3, 3, 4],
            arr2 = [5, 6, 7],
            arr = [3, 4, 5, 6, 7];

        expect(wrapper.vm.union(arr1, arr2, (obj1, obj2) => obj1 === obj2)).to.deep.equal(arr);
    });
    describe("OrientationItem.vue methods", () => {
        const centerPosition = [0, 0],
            distance = 100,
            features = [{
                getStyle: () => {
                    return {};
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
            wfsLayer = [{
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
                }
            }];

        beforeEach(() => {
            sinon.stub(Radio, "request").callsFake(() => {
                return wfsLayer;
            });
        });

        it("getVectorFeaturesInCircle returns only filtered features", async () => {
            let returnedFeatures = "";

            await wrapper.setProps({
                onlyFilteredFeatures: true
            });
            returnedFeatures = wrapper.vm.getVectorFeaturesInCircle(distance, centerPosition);

            expect(returnedFeatures.length).to.be.equals(1);
        });
        it("getVectorFeaturesInCircle returns all features", () => {
            let returnedFeatures = "";

            returnedFeatures = wrapper.vm.getVectorFeaturesInCircle(distance, centerPosition);

            expect(returnedFeatures.length).to.be.equals(2);
        });
        it("getVectorFeaturesInCircle returns only features in extent", () => {
            let returnedFeatures = "";

            returnedFeatures = wrapper.vm.getVectorFeaturesInCircle(15, centerPosition);

            expect(returnedFeatures.length).to.be.equals(1);
        });
    });
});
