import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {expect} from "chai";
import {Polygon, LineString} from "ol/geom.js";
import sinon from "sinon";
import {Style} from "ol/style.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

import highlightFeaturesByAttribute from "../../../js/highlightFeaturesByAttribute.js";
import handleAxiosError from "../../../../../shared/js/utils/handleAxiosError.js";

describe("src/core/maps/js/highlightFeaturesByAttribute", () => {
    const expectedEqualToOGC = `<ogc:PropertyIsEqualTo matchCase='false' wildCard='%' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>app:DS_USER_CODE</ogc:PropertyName>
                <ogc:Literal>X5555X</ogc:Literal>
            </ogc:PropertyIsEqualTo>`,
        expectedIsLikeOGC = `<ogc:PropertyIsLike matchCase='false' wildCard='%' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>app:DS_USER_CODE</ogc:PropertyName>
                <ogc:Literal>%X5555X%</ogc:Literal>
            </ogc:PropertyIsLike>`,
        expectedWFSQueryEqualTo = `<?xml version='1.0' encoding='UTF-8'?>
            <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='1.1.0'>
                <wfs:Query typeName='app:AK19G.P_TIERARTEN_INVASIV'>
                    <ogc:Filter>
                        ${expectedEqualToOGC}
                    </ogc:Filter>
                </wfs:Query>
            </wfs:GetFeature>`,
        expectedWFSQueryIsLike = `<?xml version='1.0' encoding='UTF-8'?>
            <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='1.1.0'>
                <wfs:Query typeName='app:AK19G.P_TIERARTEN_INVASIV'>
                    <ogc:Filter>
                        ${expectedIsLikeOGC}
                    </ogc:Filter>
                </wfs:Query>
            </wfs:GetFeature>`;


    describe("getOGCFilterSnippet for isEqual", () => {
        it("should return isEqual XML Snippet", function () {
            const wildCard = "%",
                singleChar = "#",
                escapeChar = "!",
                propPrefix = "app:",
                propName = "DS_USER_CODE",
                propValue = "X5555X",
                isEqual = true;

            expect(highlightFeaturesByAttribute.getOGCFilterSnippet(isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue)).to.have.string(expectedEqualToOGC);
        });
    });

    describe("getOGCFilterSnippet for isLike", () => {
        it("should return isLike XML Snippet", function () {
            const wildCard = "%",
                singleChar = "#",
                escapeChar = "!",
                propPrefix = "app:",
                propName = "DS_USER_CODE",
                propValue = "X5555X",
                isEqual = false;

            expect(highlightFeaturesByAttribute.getOGCFilterSnippet(isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue)).to.have.string(expectedIsLikeOGC);
        });
    });

    describe("getWFSQuery for P_TIERARTEN_INVASIV", () => {
        it("should return full query Snippet for equalTo", function () {
            const featureType = "app:AK19G.P_TIERARTEN_INVASIV",
                version = "1.1.0";

            expect(highlightFeaturesByAttribute.getWFSQuery(featureType, version, expectedEqualToOGC)).to.have.string(expectedWFSQueryEqualTo);
        });

        it("should return full query Snippet for isLike", function () {
            const featureType = "app:AK19G.P_TIERARTEN_INVASIV",
                version = "1.1.0";

            expect(highlightFeaturesByAttribute.getWFSQuery(featureType, version, expectedIsLikeOGC)).to.have.string(expectedWFSQueryIsLike);
        });
    });

    describe("createLayer", () => {
        it("createVectorLayer should start the action addLayerToLayerConfig", () => {
            const styleId = "defaultHighlightFeaturesPoint",
                layerId = "highlight_point_layer",
                layerName = "highlight features point layer",
                gfiAttributes = "showAll",
                dispatch = sinon.spy();

            highlightFeaturesByAttribute.createVectorLayer(styleId, layerId, layerName, gfiAttributes, dispatch);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("addLayerToLayerConfig");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerConfig: {
                    gfiAttributes: gfiAttributes,
                    id: layerId,
                    name: layerName,
                    showInLayerTree: true,
                    styleId: styleId,
                    typ: "VECTORBASE",
                    type: "layer",
                    visibility: true
                },
                parentKey: "subjectlayer"
            });
        });
    });

    describe("highlight(Point/Polygon/LineString)Feature", () => {
        const pointFeatures = [
                {
                    id: "456",
                    getGeometry: () => sinon.spy({
                        getType: () => "Point",
                        getCoordinates: () => [100, 100]
                    }),
                    getProperties: () => [],
                    get: () => sinon.stub()
                },
                {
                    id: "789",
                    getGeometry: () => sinon.spy({
                        getType: () => "Point",
                        getCoordinates: () => [150, 150]
                    }),
                    getProperties: () => [],
                    get: () => sinon.stub()
                }
            ],
            polygonFeatures = [
                {
                    id: "123",
                    getGeometry: () => new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]]),
                    getProperties: () => []
                },
                {
                    id: "456",
                    getGeometry: () => new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]]),
                    getProperties: () => []
                }
            ],
            lineFeatures = [
                {
                    id: "123",
                    getGeometry: () => new LineString([[0, 0], [1000, 0]]),
                    getProperties: () => []
                },
                {
                    id: "456",
                    getGeometry: () => new LineString([[0, 0], [1000, 0]]),
                    getProperties: () => []
                }
            ],
            styleObject = {
                styleId: "defaultHighlightFeaturesPoint",
                rules: [{
                    style: {
                        type: "circle",
                        circleFillColor: [255, 255, 0, 0.9],
                        circleRadius: 8,
                        circleStrokeColor: [0, 0, 0, 1],
                        circleStrokeWidth: 2
                    }
                }]
            };
        let highlightVector,
            showLayerSpy;

        beforeEach(() => {
            highlightVector = new VectorLayer({
                source: new VectorSource(),
                style: new Style()
            });
            sinon.stub(highlightFeaturesByAttribute, "createVectorLayer").returns(highlightVector);
            sinon.stub(styleList, "returnStyleObject").returns(styleObject);
            showLayerSpy = sinon.spy(highlightFeaturesByAttribute, "showLayer");
            sinon.stub(createStyle, "createStyle");
        });

        afterEach(function () {
            sinon.restore();
            sinon.stub().resetHistory();
        });

        it("should call showLayer and return 2 features for Points", async () => {
            const layer = {
                    id: "123",
                    gfiAttributes: "showAll"
                },
                dispatch = sinon.spy(),
                rootGetters = {treeHighlightedFeatures: null, treeType: undefined};

            highlightFeaturesByAttribute.highlightPointFeature("defaultHighlightFeaturesPoint", "highlight_point_layer", "highlightPoint", layer, pointFeatures, dispatch, rootGetters);

            expect(showLayerSpy.calledOnce).to.be.true;
            expect(showLayerSpy.firstCall.args[0]).to.equals("highlight_point_layer");
            expect(showLayerSpy.firstCall.args[1].length).to.equals(2);
            expect(showLayerSpy.firstCall.args[2]).to.equals("defaultHighlightFeaturesPoint");
            expect(showLayerSpy.firstCall.args[3]).to.deep.equals(layer);
            expect(showLayerSpy.firstCall.args[4]).to.equals("highlightPoint");
            expect(showLayerSpy.firstCall.args[5]).to.equals(dispatch);
            expect(showLayerSpy.firstCall.args[6]).to.deep.equals(rootGetters);
        });

        it("should call showLayer and return 2 features for Polygons", async () => {
            const layer = {
                    id: "012",
                    gfiAttributes: "showAll"
                },
                dispatch = sinon.spy(),
                rootGetters = {treeHighlightedFeatures: {active: false}, treeType: undefined};

            highlightFeaturesByAttribute.highlightLineOrPolygonFeature("defaultHighlightFeaturesPolygon", "highlight_polygon_layer", "highlightPolygon", "Polygon", layer, polygonFeatures, dispatch, rootGetters);

            expect(showLayerSpy.calledOnce).to.be.true;
            expect(showLayerSpy.firstCall.args[0]).to.equals("highlight_polygon_layer");
            expect(showLayerSpy.firstCall.args[1].length).to.equals(2);
            expect(showLayerSpy.firstCall.args[2]).to.equals("defaultHighlightFeaturesPolygon");
            expect(showLayerSpy.firstCall.args[3]).to.deep.equals(layer);
            expect(showLayerSpy.firstCall.args[4]).to.equals("highlightPolygon");
            expect(showLayerSpy.firstCall.args[5]).to.equals(dispatch);
            expect(showLayerSpy.firstCall.args[6]).to.deep.equals(rootGetters);
        });

        it("should call showLayer and return 2 features for Lines", async () => {
            const layer = {
                    id: "012",
                    gfiAttributes: "showAll"
                },
                dispatch = sinon.spy(),
                rootGetters = {treeHighlightedFeatures: {active: false}, treeType: undefined};

            highlightFeaturesByAttribute.highlightLineOrPolygonFeature("defaultHighlightFeaturesLine", "highlight_line_layer", "highlightLine", "LineString", layer, lineFeatures, dispatch, rootGetters);

            expect(showLayerSpy.calledOnce).to.be.true;
            expect(showLayerSpy.firstCall.args[0]).to.equals("highlight_line_layer");
            expect(showLayerSpy.firstCall.args[1].length).to.equals(2);
            expect(showLayerSpy.firstCall.args[2]).to.equals("defaultHighlightFeaturesLine");
            expect(showLayerSpy.firstCall.args[3]).to.deep.equals(layer);
            expect(showLayerSpy.firstCall.args[4]).to.equals("highlightLine");
            expect(showLayerSpy.firstCall.args[5]).to.equals(dispatch);
            expect(showLayerSpy.firstCall.args[6]).to.deep.equals(rootGetters);
        });
    });

    describe("configHasErrors", () => {
        let layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!",
                singleChar: "#"
            },
            spyErrorHandling,
            error;
        const wfsId = "123";

        beforeEach(function () {
            error = sinon.spy();
            sinon.stub(console, "error").callsFake(error);
            spyErrorHandling = sinon.spy(handleAxiosError, "handleAxiosError");
        });

        afterEach(function () {
            sinon.restore();
            spyErrorHandling.restore();
        });

        it("configHasErrors should return false", () => {
            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.false;
        });

        it("configHasErrors should return true when url is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                wildCard: "%",
                escapeChar: "!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when wildCard is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                escapeChar: "!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when wildCard is too long", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%%",
                escapeChar: "!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when escapeChar is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when escapeChar is too long", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when singleChar is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when singleChar is too long", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!",
                singleChar: "##"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });
    });
});
