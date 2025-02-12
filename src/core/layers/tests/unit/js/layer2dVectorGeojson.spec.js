import Cluster from "ol/source/Cluster.js";
import {expect} from "chai";
import Feature from "ol/Feature";
import {GeoJSON} from "ol/format.js";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import Layer2dVectorGeojson from "../../../js/layer2dVectorGeojson";
import webgl from "../../../js/webglRenderer";

describe("src/core/js/layers/layer2dVectorGeojson.js", () => {
    let attributes,
        warn;

    before(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);

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
        attributes = {
            id: "id",
            name: "geojsonTestLayer",
            typ: "Geojson"
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dVectorGeojson should create an layer with no warning", () => {
            const styleObj = {
                styleId: "styleId",
                rules: []
            };
            let geojsonLayer = null;

            sinon.stub(styleList, "returnStyleObject").returns(styleObj);
            geojsonLayer = new Layer2dVectorGeojson({});

            expect(geojsonLayer).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("createLayer shall create an ol.VectorLayer with source and style and GeoJSON-format", function () {
            const geojsonLayer = new Layer2dVectorGeojson(attributes),
                layer = geojsonLayer.getLayer();

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(layer.getSource().getFormat()).to.be.an.instanceof(GeoJSON);
            expect(layer.get("id")).to.be.equals(attributes.id);
            expect(layer.get("name")).to.be.equals(attributes.name);
            expect(layer.get("gfiTheme")).to.be.equals(attributes.gfiTheme);
        });

        it("createLayer shall create an ol.VectorLayer with cluster-source", function () {
            const styleObj = {
                styleId: "styleId",
                rules: []
            };
            let geojsonLayer = null,
                layer = null;

            sinon.stub(styleList, "returnStyleObject").returns(styleObj);
            attributes.clusterDistance = 60;
            geojsonLayer = new Layer2dVectorGeojson(attributes);
            layer = geojsonLayer.getLayer();

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(Cluster);
            expect(layer.getSource().getDistance()).to.be.equals(attributes.clusterDistance);
            expect(layer.getSource().getSource().getFormat()).to.be.an.instanceof(GeoJSON);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
        });
    });

    describe("getRawLayerAttributes", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                clusterDistance: 10,
                geojson: ["feat", "ures"],
                id: "1234",
                url: "exmpale.url"
            };
        });

        it("should return the raw layer attributes", () => {
            const geojsonLayer = new Layer2dVectorGeojson(localAttributes);

            expect(geojsonLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                clusterDistance: 10,
                features: ["feat", "ures"],
                id: "1234",
                url: "exmpale.url"
            });
        });
    });

    describe("getOptions", () => {
        let options;

        beforeEach(() => {
            options = [
                "afterLoading",
                "clusterGeometryFunction",
                "featuresFilter",
                "map",
                "onLoadingError",
                "layerStyle"
            ];
        });

        it("should return the options that includes the correct keys", () => {
            const geojsonLayer = new Layer2dVectorGeojson(attributes);

            expect(Object.keys(geojsonLayer.getOptions(attributes))).to.deep.equals(options);
        });
    });

    describe("getStyleFunction", () => {
        it("createStyle and getStyleFunction shall return a function", function () {
            const styleObj = {
                styleId: "styleId",
                rules: []
            };
            let geojsonLayer = null,
                styleFunction = null;

            sinon.stub(styleList, "returnStyleObject").returns(styleObj);
            attributes.styleId = "styleId";
            geojsonLayer = new Layer2dVectorGeojson(attributes);
            geojsonLayer.createStyle(attributes);
            styleFunction = geojsonLayer.getStyleFunction();

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
    });

    describe("afterLoading", () => {
        it("should set id to features, if id === undefined", () => {
            const geojsonLayer = new Layer2dVectorGeojson(attributes),
                features = [
                    new Feature(),
                    new Feature()
                ];

            geojsonLayer.afterLoading(attributes, features);

            expect(features[0].getId()).to.equals("geojson-id-feature-id-0");
            expect(features[1].getId()).to.equals("geojson-id-feature-id-1");
        });
    });

    describe("Use WebGL renderer", () => {
        it("Should create the layer with WebGL methods, if renderer: \"webgl\" is set", function () {
            const vectorLayer = new Layer2dVectorGeojson({...attributes, renderer: "webgl"}),
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

    describe("createLegend", () => {
        beforeEach(() => {
            const styleObj = {
                styleId: "styleId",
                rules: []
            };

            attributes = {
                id: "id",
                version: "1.3.0"
            };
            sinon.stub(styleList, "returnStyleObject").returns(styleObj);
        });

        it("createLegend with legendURL", async () => {
            attributes.legendURL = "legendUrl1";
            const layerWrapper = new Layer2dVectorGeojson(attributes);

            expect(await layerWrapper.createLegend()).to.be.deep.equals([attributes.legendURL]);
        });

        it("createLegend with legendURL as array", async () => {
            attributes.legendURL = ["legendUrl1"];
            const layerWrapper = new Layer2dVectorGeojson(attributes);

            expect(await layerWrapper.createLegend()).to.be.deep.equals(attributes.legendURL);
        });

        it("createLegend with styleObject and legend true", async () => {
            attributes.legend = true;
            const layerWrapper = new Layer2dVectorGeojson(attributes),
                legendInformation = {
                    "the": "legend Information"
                };

            sinon.stub(createStyle, "returnLegendByStyleId").returns({legendInformation});
            sinon.stub(getGeometryTypeFromService, "getGeometryTypeFromWFS");

            expect(await layerWrapper.createLegend()).to.deep.equals(legendInformation);
        });
    });
});
