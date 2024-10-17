import {expect} from "chai";
import sinon from "sinon";
import Layer2dRasterStaticImage from "../../../js/layer2dRasterStaticImage";

describe("src/core/js/layers/layer2dRasterStaticImage.js", () => {
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
            name: "staticImageTestLayer",
            typ: "StaticImage"
        };
    });

    after(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dRasterStaticImage should create an layer with no warning", () => {
            const staticImageLayer = new Layer2dRasterStaticImage({});

            expect(staticImageLayer).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("new Layer2dRasterStaticImage with attributes should create an layer", () => {
            const staticImageLayer = new Layer2dRasterStaticImage(attributes);

            expect(staticImageLayer).not.to.be.undefined;
            expect(staticImageLayer.getLayer()).not.to.be.undefined;
        });
    });

    describe("getRawLayerAttributes", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                extent: [],
                name: "layer_name",
                url: "test.url",
                crs: "EPSG:25832",
                zIndex: 1
            };
        });

        it("should return the raw layer attributes", () => {
            const staticImageLayer = new Layer2dRasterStaticImage(localAttributes);

            expect(staticImageLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                imageExtent: [],
                name: "layer_name",
                url: "test.url",
                crs: "EPSG:25832",
                zIndex: 1
            });
        });
    });
});
