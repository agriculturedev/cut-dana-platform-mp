import {Group as LayerGroup} from "ol/layer.js";
import layerProvider from "../../../js/getVisibleLayer";
import {expect} from "chai";
import sinon from "sinon";
import store from "../../../../../app-store";

describe("src/modules/print/utils/getVisibleLayer", function () {
    let layers,
        layer1,
        layer2,
        origCommit,
        origDispatch;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getLayers: () => {
                return {
                    getArray: () => {
                        return layers;
                    }
                };
            }
        };

        mapCollection.addMap(map, "2D");
        origDispatch = store.dispatch;
        origCommit = store.commit;
    });

    beforeEach(() => {
        layers = [];
        layer1 = {
            id: "1",
            getVisible: () => true,
            getMaxResolution: () => 1000,
            getMinResolution: () => 0,
            getZIndex: () => 1,
            get: () => "maybeInvisible"
        };
        layer2 = {
            id: "2",
            getVisible: () => true,
            getMaxResolution: () => 1000,
            getMinResolution: () => 0,
            getZIndex: () => 2,
            addEventListener: sinon.stub(),
            get: () => "no_markerPoint",
            setZIndex: () => sinon.stub(),
            setOpacity: () => sinon.stub()
        };

        store.getters = {
            "Maps/getResolutionByScale": () => 100,
            "Modules/Print/currentScale": 5
        };
        store.dispatch = sinon.spy();
        store.commit = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
        store.dispatch = origDispatch;
        store.commit = origCommit;
    });

    describe("getVisibleLayer", function () {
        it("getVisibleLayer return empty array", function () {
            layerProvider.getVisibleLayer();

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.firstCall.args[0]).to.equals("Modules/Print/setVisibleLayerList");
            expect(store.dispatch.firstCall.args[1]).to.deep.equals([]);
            expect(store.commit.calledTwice).to.be.true;
            expect(store.commit.firstCall.args[0]).to.equals("Modules/Print/setInvisibleLayer");
            expect(store.commit.firstCall.args[1]).to.deep.equals([]);
            expect(store.commit.secondCall.args[0]).to.equals("Modules/Print/setInvisibleLayerNames");
            expect(store.commit.secondCall.args[1]).to.equals("");
        });
        it("getVisibleLayer return visible layer - no groups, no invisible layers", function () {
            layers.push(layer1);
            layers.push(layer2);
            layerProvider.getVisibleLayer();

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.firstCall.args[0]).to.equals("Modules/Print/setVisibleLayerList");
            expect(store.dispatch.firstCall.args[1]).to.deep.equals(layers);
            expect(store.commit.calledTwice).to.be.true;
            expect(store.commit.firstCall.args[0]).to.equals("Modules/Print/setInvisibleLayer");
            expect(store.commit.firstCall.args[1]).to.deep.equals([]);
            expect(store.commit.secondCall.args[0]).to.equals("Modules/Print/setInvisibleLayerNames");
            expect(store.commit.secondCall.args[1]).to.equals("");
        });

        it("getVisibleLayer return visible layer - with invisible layers", function () {
            layer1.getMaxResolution = () => 50;
            layers.push(layer1);
            layers.push(layer2);
            layerProvider.getVisibleLayer();

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.firstCall.args[0]).to.equals("Modules/Print/setVisibleLayerList");
            expect(store.dispatch.firstCall.args[1]).to.deep.equals([layer2]);
            expect(store.commit.calledTwice).to.be.true;
            expect(store.commit.firstCall.args[0]).to.equals("Modules/Print/setInvisibleLayer");
            expect(store.commit.firstCall.args[1]).to.deep.equals([layer1]);
            expect(store.commit.secondCall.args[0]).to.equals("Modules/Print/setInvisibleLayerNames");
            expect(store.commit.secondCall.args[1]).to.equals("- maybeInvisible<br>");
        });

        it("getVisibleLayer return visible layer sorted by zIndex - no groups, no invisible layers", function () {
            layer1.getZIndex = () => 5;
            layer2.getZIndex = () => 4;
            layers.push(layer1);
            layers.push(layer2);
            layerProvider.getVisibleLayer();

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.firstCall.args[0]).to.equals("Modules/Print/setVisibleLayerList");
            expect(store.dispatch.firstCall.args[1]).to.deep.equals([layer2, layer1]);
            expect(store.commit.calledTwice).to.be.true;
            expect(store.commit.firstCall.args[0]).to.equals("Modules/Print/setInvisibleLayer");
            expect(store.commit.firstCall.args[1]).to.deep.equals([]);
            expect(store.commit.secondCall.args[0]).to.equals("Modules/Print/setInvisibleLayerNames");
            expect(store.commit.secondCall.args[1]).to.equals("");
        });

        it("getVisibleLayer return visible layer include groups, no invisible layers", function () {
            const layer3 = {
                    id: "3",
                    getVisible: () => true,
                    getMaxResolution: () => 1000,
                    getMinResolution: () => 0,
                    getZIndex: () => 3,
                    addEventListener: sinon.stub(),
                    get: () => "no_markerPoint",
                    setZIndex: () => sinon.stub(),
                    setOpacity: () => sinon.stub()

                },

                groupLayer = new LayerGroup({
                    visible: true,
                    zIndex: 3,
                    minResolution: 0,
                    maxResolution: 5000,
                    layers: [layer2, layer3]
                });

            layers.push(layer1);
            layers.push(groupLayer);
            layerProvider.getVisibleLayer();

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.firstCall.args[0]).to.equals("Modules/Print/setVisibleLayerList");
            expect(store.dispatch.firstCall.args[1]).to.deep.equals([layer1, layer2, layer3]);
            expect(store.commit.calledTwice).to.be.true;
            expect(store.commit.firstCall.args[0]).to.equals("Modules/Print/setInvisibleLayer");
            expect(store.commit.firstCall.args[1]).to.deep.equals([]);
            expect(store.commit.secondCall.args[0]).to.equals("Modules/Print/setInvisibleLayerNames");
            expect(store.commit.secondCall.args[1]).to.equals("");
        });
    });

    describe("revertLayerOpacity", () => {
        let getVisibleLayerListStub, getGroupedLayersStub, layerStub, groupedLayerStub;
        const visibleLayers = [],
            groupedLayers = [];

        beforeEach(function () {
            getVisibleLayerListStub = sinon.stub(layerProvider, "getVisibleLayerList").returns(visibleLayers);
            getGroupedLayersStub = sinon.stub(layerProvider, "getGroupedLayers").returns(groupedLayers);
            layerStub = {setOpacity: sinon.spy()};
            groupedLayerStub = {getLayers: () => [layerStub]};
        });

        afterEach(function () {
            sinon.restore();
        });

        it("should do nothing when there are no grouped layers", () => {
            layerProvider.revertLayerOpacity();

            expect(getVisibleLayerListStub.calledOnce).to.be.true;
            expect(getGroupedLayersStub.calledOnce).to.be.true;
            expect(layerStub.setOpacity.calledWith(1)).to.be.false;
        });


        it("should revert opacity to 1 for each layer in groupedLayers", function () {
            getVisibleLayerListStub.returns(["someLayer"]);
            getGroupedLayersStub.returns([groupedLayerStub]);

            layerProvider.revertLayerOpacity();

            expect(getVisibleLayerListStub.calledOnce).to.be.true;
            expect(getGroupedLayersStub.calledOnce).to.be.true;
            expect(layerStub.setOpacity.calledWith(1)).to.be.true;
        });

        it("should call getVisibleLayerList with true when printMapMarker is true", function () {
            layerProvider.revertLayerOpacity(true);

            expect(getVisibleLayerListStub.calledOnceWith(true)).to.be.true;
        });

        it("should call getVisibleLayerList with false when printMapMarker is false", function () {
            layerProvider.revertLayerOpacity(false);

            expect(getVisibleLayerListStub.calledOnceWith(false)).to.be.true;
        });

        it("should revert opacity to 1 for multiple layers in groupedLayers", function () {
            const secondLayerStub = {setOpacity: sinon.spy()};

            groupedLayerStub = {getLayers: () => [layerStub, secondLayerStub]};

            getVisibleLayerListStub.returns(["someLayer"]);
            getGroupedLayersStub.returns([groupedLayerStub]);

            layerProvider.revertLayerOpacity();

            expect(getVisibleLayerListStub.calledOnce).to.be.true;
            expect(getGroupedLayersStub.calledOnce).to.be.true;
            expect(layerStub.setOpacity.calledWith(1)).to.be.true;
            expect(secondLayerStub.setOpacity.calledWith(1)).to.be.true;
        });

    });

});
