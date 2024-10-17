import {expect} from "chai";
import sinon from "sinon";
import {Group as LayerGroup} from "ol/layer.js";
import VectorLayer from "ol/layer/Vector.js";
import layerFactory from "../../../js/layerFactory";
import Layer2d from "../../../js/layer2d";
import Layer2dGroup from "../../../js/layer2dGroup";

describe("src/core/js/layers/Layer2dGroup.js", () => {
    let warn,
        attributes,
        layerWMS,
        layerWMS2,
        layerFactorySpy;

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
        layerFactorySpy = sinon.stub(layerFactory, "createLayer").returns(
            {
                getLayer: () => {
                    return new VectorLayer();
                },
                getLayerSource: sinon.stub()
            }
        );
        layerWMS = {
            id: "WMS",
            name: "layerWMS",
            typ: "WMS"
        };
        layerWMS2 = {
            id: "WMS2",
            name: "layerWMS2",
            typ: "WMS"
        };
        attributes = {
            id: "1,2",
            name: "groupLayer",
            typ: "GROUP",
            type: "layer",
            children: [
                layerWMS,
                layerWMS2
            ]
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dGroup without children shall call warn", () => {
            attributes.children = undefined;
            const groupLayer = new Layer2dGroup(attributes);

            expect(groupLayer).not.to.be.undefined;
            expect(warn.calledOnce).to.be.true;
        });
        it("new Layer2dGroup with attributes should create an layer with 2 grouped layers in source", () => {
            const groupLayer = new Layer2dGroup(attributes);

            expect(groupLayer).not.to.be.undefined;
            expect(groupLayer.getLayer()).to.be.an.instanceof(LayerGroup);
            expect(warn.notCalled).to.be.true;
            expect(layerFactorySpy.calledTwice).to.be.true;
            expect(layerFactorySpy.firstCall.args[0]).to.be.deep.equals(layerWMS);
            expect(layerFactorySpy.firstCall.args[1]).to.be.deep.equals("2D");
            expect(layerFactorySpy.secondCall.args[0]).to.be.deep.equals(layerWMS2);
            expect(layerFactorySpy.secondCall.args[1]).to.be.deep.equals("2D");
            expect(groupLayer.getLayer().getSource().length).to.be.equals(2);
        });
    });

    describe("setLayerSource", () => {
        it("setLayerSource shall be called on creation", () => {
            const groupLayer = new Layer2dGroup(attributes);

            expect(groupLayer).not.to.be.undefined;
            expect(groupLayer.getLayer()).to.be.an.instanceof(LayerGroup);
            expect(warn.notCalled).to.be.true;
            expect(groupLayer.layerSource.length).to.be.equals(2);
        });
    });

    describe("getLayerSource", () => {
        it("getLayerSource shall return 2 grouped layers", () => {
            const groupLayer = new Layer2dGroup(attributes);

            expect(groupLayer).not.to.be.undefined;
            expect(groupLayer.getLayer()).to.be.an.instanceof(LayerGroup);
            expect(warn.notCalled).to.be.true;
            expect(groupLayer.getLayerSource().length).to.be.equals(2);
        });
    });

    describe("addErrorListener", () => {
        it("addErrorListener shall call addErrorListener at each grouped layer on creation", () => {
            const addErrorListenerSpy = sinon.spy(Layer2d.prototype, "addErrorListener"),
                groupLayer = new Layer2dGroup(attributes);

            expect(groupLayer).not.to.be.undefined;
            expect(groupLayer.getLayer()).to.be.an.instanceof(LayerGroup);
            expect(warn.notCalled).to.be.true;
            expect(addErrorListenerSpy.calledTwice).to.be.true;

        });
    });


});
