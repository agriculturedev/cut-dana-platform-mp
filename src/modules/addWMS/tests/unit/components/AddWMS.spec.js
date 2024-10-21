import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import AddWMSComponent from "../../../components/AddWMS.vue";
import AddWMS from "../../../store/indexAddWMS";

config.global.mocks.$t = key => key;

describe("src/modules/addWMS/components/AddWMS.vue", () => {
    let store,
        wrapper,
        componentData;

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        AddWMS
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        projection: () => {
                            return {
                                id: "http://www.opengis.net/gml/srs/epsg.xml#25832",
                                name: "EPSG:25832",
                                projName: "utm",
                                getCode: () => "EPSG:25832"
                            };
                        }
                    }
                }
            }
        });

        componentData = () => {
            return {
                treeTyp: "custom"
            };
        };

        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = shallowMount(AddWMSComponent, {
            global: {
                plugins: [store]
            },
            data: componentData,
            attachTo: elem
        });
    });

    it("renders the AddWMS Module", () => {
        expect(wrapper.find("#addWMS").exists()).to.be.true;
    });

    it("renders the iput field", () => {
        expect(wrapper.find("#wmsUrl").exists()).to.be.true;
    });

    it("renders the AddWMS button", () => {
        expect(wrapper.find("#addWMSButton").exists()).to.be.true;
    });

    it("sets focus to first input control", async () => {
        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#wmsUrl").element).to.equal(document.activeElement);
    });

    it("getParsedTitle", () => {
        it("should return parsed title without space and be replaced with minus", function () {
            expect(wrapper.vm.getParsedTitle("test title")).to.equal("test-title");
        });
        it("should return parsed title without slash and be replaced with minus", function () {
            expect(wrapper.vm.getParsedTitle("WMS Digitales Höhenmodell Hamburg (DGM1) - 1:10.000")).to.equal("WMS-Digitales-Höhenmodell-Hamburg--DGM1----1-10.000");
        });
        it("should return parsed title without slash and be replaced with minus", function () {
            expect(wrapper.vm.getParsedTitle("test/title")).to.equal("test-title");
        });
        it("should return parsed title as original title", function () {
            expect(wrapper.vm.getParsedTitle(undefined)).to.equal("undefined");
            expect(wrapper.vm.getParsedTitle("test")).to.equal("test");
            expect(wrapper.vm.getParsedTitle(1234)).to.equal("1234");
        });
    });

    it("isVersionEnabled", () => {
        it("should return false if the type of version is not string", function () {
            expect(wrapper.vm.isVersionEnabled(null)).to.be.false;
        });
        it("should return false if the version is lower than 1.3.0", function () {
            expect(wrapper.vm.isVersionEnabled("0.3.0")).to.be.false;
            expect(wrapper.vm.isVersionEnabled("1.2.9")).to.be.false;
        });
        it("should return true if the version is equal or higher than 1.3.0", function () {
            expect(wrapper.vm.isVersionEnabled("1.3.0")).to.be.true;
            expect(wrapper.vm.isVersionEnabled("2.3.5")).to.be.true;
        });
    });

    describe("getIfInExtent", () => {
        let capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:25832",
                                "extent": [
                                    302907.887193,
                                    5435104.982326,
                                    389523.673913,
                                    5508222.768538
                                ]
                            }
                        ]
                    }
                }
            },
            currentExtent = [];

        it("should return true if the currentExtent intersects the capability extent", function () {
            currentExtent = [
                205000,
                5009000,
                730000,
                6075800
            ];
            expect(wrapper.vm.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("should return true if the currentExtent intersects the capability extent", function () {
            currentExtent = [
                205000,
                5009000,
                730000
            ];
            expect(wrapper.vm.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("should return true if the currentExtent is not in the right format", function () {
            currentExtent = "";
            expect(wrapper.vm.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("should return true if the layer in Capability does not have the right crs", function () {
            capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:3067",
                                "extent": [
                                    336385.4535501953,
                                    6628495.2621008465,
                                    447592.181149918,
                                    7646073.290737241
                                ]
                            }
                        ]
                    }
                }
            };
            currentExtent = [
                455000,
                5809000,
                730000,
                6075800
            ];
            expect(wrapper.vm.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("should return true if the layer in Capability does not have the right extent", () => {
            capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:25832",
                                "extent": [
                                    302907.887193,
                                    5435104.982326,
                                    389523.673913
                                ]
                            }
                        ]
                    }
                }
            };
            currentExtent = [
                455000,
                5809000,
                730000,
                6075800
            ];
            expect(wrapper.vm.getIfInExtent(capability, currentExtent)).to.be.true;
        });
        it("should return true if the transformed extent of the layer in Capability intersects the extent", () => {
            capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:4326",
                                "extent": [
                                    47,
                                    5,
                                    56,
                                    15
                                ]
                            }
                        ]
                    }
                }
            };
            currentExtent = [
                455000,
                5809000,
                730000,
                6075800
            ];
            expect(wrapper.vm.getIfInExtent(capability, currentExtent)).to.be.true;
        });
        it("should return false if the transformed extent of the layer in Capability intersects the extent", () => {
            capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:4326",
                                "extent": [
                                    56,
                                    9,
                                    56,
                                    10
                                ]
                            }
                        ]
                    }
                }
            };
            currentExtent = [
                455000,
                5809000,
                730000,
                6075800
            ];
            expect(wrapper.vm.getIfInExtent(capability, currentExtent)).to.be.false;
        });
    });

    it("getReversedData", () => {
        const data = "<Layer><SRS>EPSG:4326</SRS><Layer queryable=\"1\"><SRS>EPSG:102100</SRS><BoundingBox SRS=\"EPSG:4326\" minx=\"6.355978\" miny=\"49.11015\" maxx=\"7.413363\" maxy=\"49.644331\"/></Layer></Layer>",
            dataXml = new DOMParser().parseFromString(data, "text/xml");

        it("should replace all SRS with CRS in the xml node and attribute", function () {
            expect(wrapper.vm.getReversedData(dataXml).getElementsByTagName("SRS").length).to.equal(0);
            expect(wrapper.vm.getReversedData(dataXml).getElementsByTagName("CRS").length).not.to.equal(0);
        });
    });
    describe("getUrl", () => {
        const serviceUrl = "https://test/test?map=/storage/mapfiles/test.map";

        it("creates url correctly'", function () {
            expect(wrapper.vm.getUrl(serviceUrl)).to.equal("https://test/test?map=%2Fstorage%2Fmapfiles%2Ftest.map&request=GetCapabilities&service=WMS");
            expect(wrapper.vm.getUrl(serviceUrl).split("?").length - 1).to.equal(1);
            expect(wrapper.vm.getUrl(serviceUrl)).to.contain("request=GetCapabilities&service=WMS");
        });
    });
});
