import Cluster from "ol/source/Cluster.js";
import {expect} from "chai";
import {WFS} from "ol/format.js";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import webgl from "../../../js/webglRenderer";
import Layer2dVectorWfs from "../../../js/layer2dVectorWfs";

describe("src/core/js/layers/layer2dVectorWfs.js", () => {
    let attributes,
        warn;

    before(() => {
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
    });

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
        attributes = {
            id: "id",
            name: "wfsTestLayer",
            typ: "WFS"
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        beforeEach(() => {
            const styleObj = {
                styleId: "styleId",
                rules: []
            };

            sinon.stub(styleList, "returnStyleObject").returns(styleObj);
        });

        it("new Layer2dVectorWfs should create an layer with no warning", () => {
            const wfsLayer = new Layer2dVectorWfs({});

            expect(wfsLayer).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("createLayer shall create an ol.VectorLayer with source and style and WFS-format", function () {
            const wfsLayer = new Layer2dVectorWfs(attributes),
                layer = wfsLayer.getLayer();

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(layer.getSource().getFormat()).to.be.an.instanceof(WFS);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
            expect(layer.get("id")).to.be.equals(attributes.id);
            expect(layer.get("name")).to.be.equals(attributes.name);
            expect(layer.get("gfiTheme")).to.be.equals(attributes.gfiTheme);
        });

        it("createLayer shall create an ol.VectorLayer with cluster-source", function () {
            attributes.clusterDistance = 60;
            const wfsLayer = new Layer2dVectorWfs(attributes),
                layer = wfsLayer.getLayer();

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(Cluster);
            expect(layer.getSource().getDistance()).to.be.equals(attributes.clusterDistance);
            expect(layer.getSource().getSource().getFormat()).to.be.an.instanceof(WFS);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
        });
        it("executes the function requestCapabilitiesToFitExtent because the corresponding parameters are fulfilled", () => {
            const wfsLayer = new Layer2dVectorWfs({}),
                requestCapabilitiesToFitExtent = sinon.stub(wfsLayer, "requestCapabilitiesToFitExtent");

            wfsLayer.createLayer({
                visibility: true,
                fitCapabilitiesExtent: true,
                encompassingBoundingBox: false,
                capabilitiesUrl: "https://testUrl.de"
            });

            sinon.assert.calledOnce(requestCapabilitiesToFitExtent);
        });
        it("only executes the function requestCapabilitiesToFitExtent if the corresponding parameters are fulfilled", () => {
            const wfsLayer = new Layer2dVectorWfs({});

            wfsLayer.createLayer({
                visibility: true,
                fitCapabilitiesExtent: true,
                encompassingBoundingBox: false
            });

            expect(warn.calledTwice).to.be.true;
        });
    });

    describe("getRawLayerAttributes", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                clusterDistance: 10,
                crs: "EPSG:25832",
                featureNS: "featureNS",
                featureType: "featureType",
                id: "1234",
                url: "exmpale.url",
                version: "2.0.0"
            };
        });

        it("should return the raw layer attributes", () => {
            const wfsLayer = new Layer2dVectorWfs(localAttributes);

            expect(wfsLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                clusterDistance: 10,
                crs: "EPSG:25832",
                featureNS: "featureNS",
                featureType: "featureType",
                id: "1234",
                url: "exmpale.url",
                version: "2.0.0"
            });
        });
    });

    describe("getOptions", () => {
        let options;

        beforeEach(() => {
            options = [
                "clusterGeometryFunction",
                "doNotLoadInitially",
                "featuresFilter",
                "loadingParams",
                "loadingStrategy",
                "onLoadingError",
                "wfsFilter",
                "style"
            ];
        });

        it("should return the options that includes the correct keys", () => {
            const wfsLayer = new Layer2dVectorWfs(attributes);

            expect(Object.keys(wfsLayer.getOptions(attributes))).to.deep.equals(options);
        });
    });
    describe("getStyleFunction", () => {
        it("createStyle and getStyleFunction shall return a function", function () {
            sinon.stub(styleList, "returnStyleObject").returns(true);
            attributes.styleId = "styleId";
            const wfsLayer = new Layer2dVectorWfs(attributes);
            let styleFunction = null;

            wfsLayer.createStyle(attributes);
            styleFunction = wfsLayer.getStyleFunction();

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
    });

    describe("Use WebGL renderer", () => {
        it("Should create the layer with WebGL methods, if renderer: \"webgl\" is set", function () {
            const vectorLayer = new Layer2dVectorWfs({...attributes, renderer: "webgl"}),
                layer = vectorLayer.getLayer();

            expect(vectorLayer.isDisposed).to.equal(webgl.isDisposed);
            expect(vectorLayer.setIsSelected).to.equal(webgl.setIsSelected);
            expect(vectorLayer.hideAllFeatures).to.equal(webgl.hideAllFeatures);
            expect(vectorLayer.showAllFeatures).to.equal(webgl.showAllFeatures);
            expect(vectorLayer.showFeaturesByIds).to.equal(webgl.showFeaturesByIds);
            expect(vectorLayer.setStyle).to.equal(webgl.setStyle);
            expect(vectorLayer.source).to.equal(layer.getSource());
            expect(layer.get("isPointLayer")).to.not.be.undefined;
        });
    });
});
