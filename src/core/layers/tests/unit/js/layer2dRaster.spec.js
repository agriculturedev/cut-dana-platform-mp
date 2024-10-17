import {expect} from "chai";
import sinon from "sinon";
import Layer2dRaster from "../../../js/layer2dRaster";

describe("src/core/js/layers/layer2dRaster.js", () => {
    let warn;

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

    after(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dRaster should create an layer with warning", () => {
            const layerWrapper = new Layer2dRaster({});

            expect(layerWrapper).not.to.be.undefined;
            expect(warn.calledOnce).to.be.true;
        });
    });
});
