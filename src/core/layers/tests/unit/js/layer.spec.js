import {expect} from "chai";
import sinon from "sinon";
import Layer from "../../../js/layer";

describe("src/core/js/layers/layer.js", () => {
    let attributes,
        warn;

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);

        attributes = {
            abc: 123
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer should create an layer with warning", () => {
            const layerWrapper = new Layer({});

            expect(layerWrapper).not.to.be.undefined;
            expect(warn.calledOnce).to.be.true;
        });

        it("new Layer and updateLayerValues should create two warnings", () => {
            const layerWrapper = new Layer({});

            layerWrapper.updateLayerValues();

            expect(warn.calledTwice).to.be.true;
        });

        it("new Layer and createLegend should create two warnings", () => {
            const layerWrapper = new Layer({});

            layerWrapper.createLegend();

            expect(warn.calledTwice).to.be.true;
        });
    });

    describe("get and set", () => {
        it("should return an attribute through a getter", () => {
            const layerWrapper = new Layer(attributes);

            expect(layerWrapper.get("abc")).to.equals(123);
        });

        it("should set an attribute through a setter", () => {
            const layerWrapper = new Layer(attributes);

            layerWrapper.set("abc", 999);

            expect(layerWrapper.get("abc")).to.equals(999);
        });
    });

    describe("getLayer and setLayer", () => {
        it("should setLayer and getLayer return the layer", () => {
            const layerWrapper = new Layer({});

            layerWrapper.setLayer({layer: "layer"});

            expect(layerWrapper.getLayer()).to.deep.equals({layer: "layer"});
        });
    });

    describe("inspectLegendUrl and getLegend", () => {
        beforeEach(() => {
            attributes = {
                id: "id",
                legend: true
            };
        });

        it("inspectLegendUrl without legendURL", () => {
            const layerWrapper = new Layer(attributes);

            expect(layerWrapper.inspectLegendUrl()).to.be.true;
        });

        it("inspectLegendUrl with filled legendURL", () => {
            attributes.legendURL = "https://legendURL";
            const layerWrapper = new Layer(attributes);

            expect(layerWrapper.inspectLegendUrl()).to.be.equals(attributes.legendURL);
        });

        it("inspectLegendUrl with empty String as legendURL", () => {
            attributes.legendURL = "";
            const layerWrapper = new Layer(attributes);

            expect(layerWrapper.inspectLegendUrl()).to.be.true;
        });

        it("inspectLegendUrl with 'ignore' as legendURL", () => {
            attributes.legendURL = "ignore";
            const layerWrapper = new Layer(attributes);

            expect(layerWrapper.inspectLegendUrl()).to.be.false;
        });
    });
});
