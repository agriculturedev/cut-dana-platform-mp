import {expect} from "chai";
import sinon from "sinon";
import Layer2dRasterWms from "../../../js/layer2dRasterWms";

describe("src/core/js/layers/layer2dRasterWms.js", () => {
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
                    getResolutions: () => [2000, 1000],
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
            layers: "layer1,layer2",
            name: "wmsTestLayer",
            singleTile: false,
            tilesize: 512,
            transparent: false,
            typ: "WMS"
        };
    });

    after(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dRasterWms should create an layer with no warning", () => {
            const wmsLayer = new Layer2dRasterWms({});

            expect(wmsLayer).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("new Layer2dRasterWms with attributes should create an layer", () => {
            const wmsLayer = new Layer2dRasterWms(attributes);

            expect(wmsLayer).not.to.be.undefined;
            expect(wmsLayer.getLayer()).not.to.be.undefined;
        });
    });

    describe("getRawLayerAttributes", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                crs: "25832",
                cqlFilter: "A=1",
                format: "image/png",
                gutter: 0,
                id: "123456789",
                layers: "layer_names",
                singleTile: false,
                tilesize: 512,
                transparent: true,
                url: "http://test.url",
                version: "1.3.0",
                isSecured: false
            };
        });

        it("should return the raw layer attributes", () => {
            const wmsLayer = new Layer2dRasterWms(localAttributes);

            expect(wmsLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                crs: "25832",
                cqlFilter: "A=1",
                format: "image/png",
                gutter: 0,
                id: "123456789",
                isSecured: false,
                layers: "layer_names",
                singleTile: false,
                tilesize: 512,
                transparent: "true",
                url: "http://test.url",
                version: "1.3.0",
                extent: undefined
            });
        });

        it("should return the raw layer attributes with styles and extent", () => {
            Object.assign(localAttributes, {
                styles: [
                    "geofox_stations"
                ],
                extent: [10, 20, 11, 22]
            });
            const wmsLayer = new Layer2dRasterWms(localAttributes);

            expect(wmsLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                crs: "25832",
                cqlFilter: "A=1",
                format: "image/png",
                gutter: 0,
                id: "123456789",
                isSecured: false,
                layers: "layer_names",
                singleTile: false,
                STYLES: ["geofox_stations"],
                tilesize: 512,
                transparent: "true",
                url: "http://test.url",
                version: "1.3.0",
                extent: [10, 20, 11, 22]
            });
        });
    });

    describe("getLayerParams", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                format: "image/png",
                gfiAsNewWindow: false,
                gfiAttributes: "showAll",
                gfiTheme: "default",
                infoFormat: "text/xml",
                layers: "test_layers",
                name: "test_name",
                transparency: 10,
                typ: "wms",
                zIndex: 1,
                featureCount: 5
            };
        });

        it("should return the layer params", () => {
            const wmsLayer = new Layer2dRasterWms(localAttributes);

            expect(wmsLayer.getLayerParams(localAttributes)).to.deep.equals({
                format: "image/png",
                gfiAsNewWindow: false,
                gfiAttributes: "showAll",
                gfiTheme: "default",
                infoFormat: "text/xml",
                layers: "test_layers",
                name: "test_name",
                opacity: 0.9,
                typ: "wms",
                zIndex: 1,
                featureCount: 5,
                gfiThemeSettings: undefined
            });
        });
    });

    describe("getOptions", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                origin: [442800, 5809000]
            };
        });

        it("should return the options", () => {
            const wmsLayer = new Layer2dRasterWms(localAttributes);

            expect(wmsLayer.getOptions(localAttributes)).to.deep.equals({
                origin: [442800, 5809000],
                resolutions: [2000, 1000]
            });
        });
    });

    describe("createLegend", () => {
        beforeEach(() => {
            attributes = {
                id: "id",
                version: "1.3.0"
            };
        });

        it("createLegend with legendURL", () => {
            attributes.legendURL = "https://legendURL";
            const layerWrapper = new Layer2dRasterWms(attributes);

            expect(layerWrapper.createLegend()).to.be.deep.equals([attributes.legendURL]);
        });

        it("createLegend with ignored legendURL", () => {
            attributes.legendURL = "ignore";
            const layerWrapper = new Layer2dRasterWms(attributes);

            layerWrapper.createLegend();
            expect(layerWrapper.createLegend()).to.be.false;
        });

        it("createLegend with legend as Array", () => {
            attributes.legend = ["legend"];
            const layerWrapper = new Layer2dRasterWms(attributes);

            layerWrapper.createLegend();
            expect(layerWrapper.createLegend()).to.be.deep.equals(attributes.legend);
        });

        it("createLegend with legend true and 2 layer names", () => {
            attributes.legend = true;
            attributes.url = "https://url";
            attributes.layers = "layer1,layer2";
            const layerWrapper = new Layer2dRasterWms(attributes),
                expectedLegend = ["https://url/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=layer1",
                    "https://url/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=layer2"];

            layerWrapper.createLegend();
            expect(layerWrapper.createLegend()).to.be.deep.equals(expectedLegend);
        });
    });
});
