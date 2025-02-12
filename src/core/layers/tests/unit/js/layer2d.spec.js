import {expect} from "chai";
import sinon from "sinon";
import Layer from "ol/layer/Layer";
import TileWMS from "ol/source/TileWMS";
import store from "../../../../../app-store";
import Layer2d from "../../../js/layer2d";
import axios from "axios";
import crs from "@masterportal/masterportalapi/src/crs";

describe("src/core/js/layers/layer2d.js", () => {
    let warn,
        origDispatch;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });

        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            }
        };

        mapCollection.addMap(map, "2D");
        origDispatch = store.dispatch;
    });

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    afterEach(() => {
        sinon.restore();
        store.dispatch = origDispatch;
    });

    describe("createLayer", () => {
        it("new Layer2d should create an layer with warning", () => {
            const layer2d = new Layer2d({});

            expect(layer2d).not.to.be.undefined;
            expect(warn.calledOnce).to.be.true;
        });
    });

    describe("updateLayerValues", () => {
        it("updates the visibility of the ol layer to true", () => {
            const layer2d = new Layer2d();

            layer2d.layer = new Layer({
                source: new TileWMS(),
                visible: false
            });

            layer2d.updateLayerValues({visibility: true});

            expect(layer2d.layer.getVisible()).to.be.true;

        });

        it("updates the visibility of the ol layer to false", () => {
            const layer2d = new Layer2d();

            layer2d.layer = new Layer({
                source: new TileWMS(),
                visible: true
            });

            layer2d.updateLayerValues({visibility: false});

            expect(layer2d.layer.getVisible()).to.be.false;

        });
        it("executes the function requestCapabilitiesToFitExtent because the corresponding parameters are fulfilled", () => {
            const layer2d = new Layer2d(),
                requestCapabilitiesToFitExtent = sinon.stub(layer2d, "requestCapabilitiesToFitExtent");

            layer2d.layer = new Layer({
                source: new TileWMS(),
                visible: false
            });

            layer2d.updateLayerValues({
                visibility: true,
                fitCapabilitiesExtent: true,
                encompassingBoundingBox: false,
                capabilitiesUrl: "http://testUrl.de"
            });

            sinon.assert.calledOnce(requestCapabilitiesToFitExtent);
        });
        it("only executes the function requestCapabilitiesToFitExtent if the corresponding parameters are fulfilled", () => {
            const layer2d = new Layer2d();

            layer2d.layer = new Layer({
                source: new TileWMS(),
                visible: false
            });

            layer2d.updateLayerValues({
                visibility: true,
                fitCapabilitiesExtent: true,
                encompassingBoundingBox: false
            });

            expect(warn.calledTwice).to.be.true;
        });
    });

    describe("autoRefresh", () => {
        let controlAutoRefreshSpy,
            startAutoRefreshSpy,
            stopAutoRefreshSpy,
            layer2d;

        beforeEach(() => {
            controlAutoRefreshSpy = sinon.spy(Layer2d.prototype, "controlAutoRefresh");
            startAutoRefreshSpy = sinon.spy(Layer2d.prototype, "startAutoRefresh");
            stopAutoRefreshSpy = sinon.spy(Layer2d.prototype, "stopAutoRefresh");
            layer2d = new Layer2d({
                autoRefresh: 50000,
                id: 123456,
                visibility: true
            });
        });

        afterEach(() => {
            sinon.restore();
        });

        it("should start the function controlAutoRefresh and startAutoRefreshSpy when a layer is created", () => {
            expect(controlAutoRefreshSpy.calledOnce).to.be.true;
            expect(startAutoRefreshSpy.calledOnce).to.be.true;
            expect(layer2d.getIntervalAutoRefresh()).is.not.undefined;
        });

        it("stop the refreshing when layer is no longer visible", () => {
            layer2d.updateLayerValues({
                autoRefresh: 50000,
                id: 123456,
                visibility: false
            });

            expect(stopAutoRefreshSpy.calledOnce).to.be.true;
            expect(layer2d.getIntervalAutoRefresh()).is.undefined;
        });
    });

    describe("getIntervalAutoRefresh and setIntervalAutoRefresh", () => {
        it("should setLayer and getLayer return the layer", () => {
            const layer2d = new Layer2d({});

            layer2d.setIntervalAutoRefresh(18);

            expect(layer2d.getIntervalAutoRefresh()).to.equals(18);
        });
    });

    describe("getLayerSource and setLayerSource", () => {
        it("should setLayer and getLayer return the layer", () => {
            const layer2d = new Layer2d({});

            layer2d.setLayerSource({layer: "source"});

            expect(layer2d.getLayerSource()).to.deep.equals({layer: "source"});
        });
    });
    describe("errorHandling", () => {
        it("errorHandling shall dispatch Alerting with i18next key", function () {
            const attributes = {
                    name: "TestLayer",
                    id: "id",
                    typ: "WMS"
                },
                olLayer = {
                    getSource: () => {
                        return {
                            on: () => sinon.spy
                        };
                    }
                },
                dispatchCalls = {},
                layerWrapper = new Layer2d(attributes, olLayer);
            let alertMessage = null;

            store.dispatch = (arg1, arg2) => {
                dispatchCalls[arg1] = arg2 !== undefined ? arg2 : "called";
            };
            layerWrapper.errorHandling(403, "Layer1");
            alertMessage = dispatchCalls["Alerting/addSingleAlert"];
            expect(alertMessage.content).to.be.equals("core.layers.errorHandling.403");
            expect(alertMessage.multipleAlert).to.be.equals(true);
        });
    });
    describe("prepareFeaturesFor3D", () => {
        it("should prepare the features if its geometry type is not GeometryCollection", () => {
            const layer2d = new Layer2d({}),
                features = [
                    {
                        "id": 1,
                        getGeometry: () => {
                            return {
                                getType: () => ""
                            };
                        },
                        setGeometry: () => {
                            features[0].geometry = "geometrySet";
                        }
                    }
                ];

            layer2d.setAltitudeOnGeometry = sinon.stub();
            layer2d.prepareFeaturesFor3D(features);

            expect(features[0].geometry).to.equals("geometrySet");
        });
        it("should prepare the features if its geometry type is GeometryCollection", () => {
            const layer2d = new Layer2d({}),
                features = [
                    {
                        "id": 1,
                        getGeometry: () => {
                            return {
                                getType: () => "GeometryCollection",
                                getGeometries: () => {
                                    return [{}];
                                }
                            };
                        },
                        setGeometry: () => {
                            features[0].geometry = "geometrySet";
                        }
                    }
                ];

            layer2d.setAltitudeOnGeometry = sinon.stub();
            layer2d.prepareFeaturesFor3D(features);

            expect(features[0].geometry).to.equals("geometrySet");
        });
    });
    describe("extractBoundingBox", () => {
        let layer, layerNode, crsTransformStub;

        beforeEach(function () {
            const olLayer = {
                getSource: () => {
                    return {
                        on: () => sinon.spy
                    };
                }
            };

            layer = new Layer2d({typ: "WMS"}, olLayer);
            crsTransformStub = sinon.stub(crs, "transform").callsFake((sourceProjection, targetProjection, coords) => coords);
            layerNode = null;
        });
        afterEach(function () {
            sinon.restore();
        });
        it("should extract and transform bounding box for WMS layer", () => {
            layer.set("typ", "WMS");
            layerNode = new DOMParser().parseFromString(`
                <Layer>
                    <Name>wms_einzelbebauungsplaene</Name>
                    <BoundingBox CRS="EPSG:4326" minx="12.0244" miny="48.9629" maxx="12.198" maxy="49.0805"/>
                </Layer>
            `, "text/xml").documentElement;
            const bbox = document.createElement("BoundingBox"),
                result = layer.extractBoundingBox(layerNode);

            bbox.setAttribute("CRS", "EPSG:4326");
            bbox.setAttribute("minx", "10");
            bbox.setAttribute("miny", "20");
            bbox.setAttribute("maxx", "30");
            bbox.setAttribute("maxy", "40");
            layerNode.appendChild(bbox);
            expect(result).to.deep.equal([[48.9629, 12.0244], [49.0805, 12.198]]);
            expect(crsTransformStub.called).to.be.true;
        });
        it("should extract and transform bounding box for WFS layer", () => {
            layer.set("typ", "WFS");
            layerNode = new DOMParser().parseFromString(`
                <FeatureType>
                    <Name>app:strecken</Name>
                    <WGS84BoundingBox>
                        <LowerCorner>9.887604 53.575237</LowerCorner>
                        <UpperCorner>9.899925 53.583582</UpperCorner>
                    </WGS84BoundingBox>
                </FeatureType>
            `, "text/xml").documentElement;
            const result = layer.extractBoundingBox(layerNode);

            expect(result).to.deep.equal([[9.887604, 53.575237], [9.899925, 53.583582]]);
            expect(crsTransformStub.called).to.be.true;
        });
        it("should return null if bounding box is not found", () => {
            layerNode = new DOMParser().parseFromString(`
                <Layer>
                    <Name>wms_einzelbebauungsplaene</Name>
                </Layer>
            `, "text/xml").documentElement;
            const result = layer.extractBoundingBox(layerNode);

            expect(result).to.be.null;
        });
    });
    describe("requestCapabilitiesToFitExtent", () => {
        let layer, axiosGetStub, zoomToLayerExtentSpy;

        beforeEach(() => {
            const olLayer = {
                getSource: () => {
                    return {
                        on: () => sinon.spy
                    };
                }
            };

            layer = new Layer2d({capabilitiesUrl: "https://example.com/wms?request=GetCapabilities", typ: "WMS", layers: "TestLayer"}, olLayer);
            axiosGetStub = sinon.stub(axios, "get").resolves({
                status: 200,
                statusText: "OK",
                data: "<Capabilities><Layer><Name>TestLayer</Name></Layer></Capabilities>"
            });
            zoomToLayerExtentSpy = sinon.spy(layer, "zoomToLayerExtent");
        });
        afterEach(() => {
            sinon.restore();
        });
        it("should call zoomToLayerExtent with the correct layer node if the specific layer is found", async () => {
            await layer.requestCapabilitiesToFitExtent();
            sinon.assert.calledOnce(zoomToLayerExtentSpy);
        });
        it("should handle errors from axios.get gracefully", async () => {
            const error = sinon.spy();

            sinon.stub(console, "error").callsFake(error);
            axiosGetStub.rejects(new Error("Network Error"));
            await layer.requestCapabilitiesToFitExtent();
            sinon.assert.notCalled(zoomToLayerExtentSpy);
            sinon.assert.calledOnce(error);
        });
        it("should handle non-200 status codes from axios.get gracefully", async () => {
            const errorSpy = sinon.spy();

            sinon.stub(console, "error").callsFake(errorSpy);

            axiosGetStub.resolves({
                status: 404,
                statusText: "Not Found",
                data: "Not Found"
            });
            await layer.requestCapabilitiesToFitExtent();
            sinon.assert.notCalled(zoomToLayerExtentSpy);
            sinon.assert.calledOnce(errorSpy);
        });
    });
    describe("zoomToLayerExtent", () => {
        it("zoomToLayerExtent should dispatch 'Maps/zoomToExtent' with the correct extent and maxZoom", function () {
            const dispatchCalls = {},
                expectedExtent = [9.887604, 53.575237, 9.899925, 53.583582],
                expectedMaxZoom = 5,
                layer = new Layer2d(),
                mapViewStub = {
                    getZoomForResolution: sinon.stub().returns(expectedMaxZoom),
                    getResolutionForExtent: sinon.stub().returns(0.0001)
                };

            store.dispatch = (action, payload) => {
                dispatchCalls[action] = payload;
            };
            sinon.stub(layer, "extractBoundingBox").returns([[9.887604, 53.575237], [9.899925, 53.583582]]);
            sinon.stub(mapCollection, "getMap").returns({
                getView: sinon.stub().returns(mapViewStub),
                getSize: sinon.stub().returns([100, 100])
            });
            layer.zoomToLayerExtent({});
            expect(dispatchCalls["Maps/zoomToExtent"]).not.to.be.undefined;
            expect(dispatchCalls["Maps/zoomToExtent"].extent).to.deep.equal(expectedExtent);
            expect(dispatchCalls["Maps/zoomToExtent"].options.maxZoom).to.equal(expectedMaxZoom);
        });
    });
});
