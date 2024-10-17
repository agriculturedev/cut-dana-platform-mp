import {expect} from "chai";
import sinon from "sinon";

import Layer2dRasterWmts from "../../../js/layer2dRasterWmts";

describe("src/core/js/layers/layer2dRasterWmts.js", () => {
    let attributes,
        fetch,
        warn;

    before(() => {
        fetch = global.fetch;
        global.fetch = sinon.spy(() => new Promise(r => r));

        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    beforeEach(() => {
        attributes = {
            id: "id",
            layers: "layer1,layer2",
            name: "wmtsTestLayer",
            optionsFromCapabilities: false,
            typ: "WMTS",
            zIndex: 1
        };

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

    after(() => {
        global.fetch = fetch;
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dRasterWmts should create an layer with no warning", () => {
            const wmtsLayer = new Layer2dRasterWmts({});

            expect(wmtsLayer).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("new Layer2dRasterWmts with attributes should create an layer", () => {
            const wmtsLayer = new Layer2dRasterWmts(attributes);

            expect(wmtsLayer).not.to.be.undefined;
            expect(wmtsLayer.getLayer()).not.to.be.undefined;
        });
    });

    describe("getRawLayerAttributes", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                id: "123456789",
                url: "test.url",
                typ: "wmst"
            };
        });

        it("should return the raw layer attributes", () => {
            const wmsLayer = new Layer2dRasterWmts(localAttributes);

            expect(wmsLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                id: "123456789",
                url: "test.url",
                typ: "wmst"
            });
        });
    });

    describe("getLayerParams", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                transparency: 10,
                zIndex: 1
            };
        });

        it("should return the layer params", () => {
            const wmsLayer = new Layer2dRasterWmts(localAttributes);

            expect(wmsLayer.getLayerParams(localAttributes)).to.deep.equals({
                opacity: 0.9,
                zIndex: 1
            });
        });
    });

    describe("createLegend", () => {
        beforeEach(() => {
            attributes.version = "1.3.0";
            attributes.legend = true;
        });

        it("createLegend with no optionsFromCapabilities does nothing", async () => {
            const layerWrapper = new Layer2dRasterWmts(attributes);

            expect(await layerWrapper.createLegend()).to.be.true;
        });
    });
});
