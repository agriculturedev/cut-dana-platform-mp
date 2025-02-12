import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import RoutingDownloadComponent from "../../../components/RoutingDownload.vue";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";

import Directions from "../../../store/directions/indexDirections";
import Isochrones from "../../../store/isochrones/indexIsochrones";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/RoutingDownload.vue", () => {
    let activeRoutingToolOption,
        downloadFileName,
        store,
        wrapper,
        props;

    beforeEach(() => {
        activeRoutingToolOption = "DIRECTIONS";
        downloadFileName = "";

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing:
                        {
                            namespaced: true,
                            modules: {
                                Directions,
                                Isochrones
                            },
                            // state,
                            mutations,
                            actions,
                            getters: {
                                activeRoutingToolOption: () => activeRoutingToolOption,
                                download: () => {
                                    return {
                                        fileName: downloadFileName,
                                        format: "GEOJSON"
                                    };
                                }
                            }
                        }
                    },
                    Alerting: {
                        namespaced: true,
                        actions: {
                            addSingleAlert: sinon.stub()
                        }
                    }
                }
            }
        });

        props = {
            hideGpx: false
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders RoutingDownloadComponent", () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("#routing-download").exists()).to.be.true;
    });

    it("filters GPX download option", () => {
        props.hideGpx = true;
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.vm.downloadFormatOptions.includes("GPS")).to.be.false;
    });

    it("disables input without filename", () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        wrapper.vm.download.fileName = "";
        expect(wrapper.vm.isDisabled).to.be.true;
    });

    it("enables input with filename", () => {
        downloadFileName = "testfilename";
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });

        expect(wrapper.vm.isDisabled).to.be.false;
    });

    it("returns features for 'DIRECTIONS'", () => {
        store.commit("Modules/Routing/setActiveRoutingToolOption", "DIRECTIONS");
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect("isHighlight" in wrapper.vm.getDownloadFeatures()[0].getProperties()).to.be.true;
    });

    it("returns features for 'ISOCHRONES'", () => {
        activeRoutingToolOption = "ISOCHRONES";
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });

        expect(wrapper.vm.getDownloadFeatures().length).equal(0);
    });

    it("converts feature to 'GEOJSON'", async () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        wrapper.vm.download.format = "GEOJSON";
        wrapper.vm.transformCoordinatesLocalToWgs84Projection = (coordinates) => coordinates;
        const downloadString = await wrapper.vm.getDownloadStringInFormat([
            new Feature({
                geometry: new LineString([[8, 52], [9, 53]])
            })
        ]);

        expect(downloadString).equal("{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[8,52],[9,53]]},\"properties\":null}]}");
    });

    it("converts feature to 'GPX'", async () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        wrapper.vm.download.format = "GPX";
        wrapper.vm.transformCoordinatesLocalToWgs84Projection = (coordinates) => coordinates;
        const downloadString = await wrapper.vm.getDownloadStringInFormat([
            new Feature({
                geometry: new LineString([[8, 52], [9, 53]])
            })
        ]);

        expect(downloadString).equal("<gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\" version=\"1.1\" creator=\"OpenLayers\"><rte><rtept lat=\"52\" lon=\"8\"/><rtept lat=\"53\" lon=\"9\"/></rte></gpx>");
    });

    it("should add file type to file name", async () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        wrapper.vm.download.format = "GEOJSON";
        wrapper.vm.download.fileName = "test";

        expect(wrapper.vm.getFileName()).equal("test.geojson");
    });
});
