import {expect} from "chai";
import sinon from "sinon";
import Layer3dTileset from "../../../js/layer3dTileset";
import layerCollection from "../../../js/layerCollection";

describe("src/core/js/layers/layer3dTileset.js", () => {
    let attributes,
        fromUrlSpy,
        warn;

    before(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    beforeEach(() => {
        attributes = {
            id: "id",
            name: "tilesetLayer",
            url: "the_url",
            typ: "TileSet3D",
            cesium3DTilesetOptions: {
                maximumScreenSpaceError: 6
            }
        };

        mapCollection.clear();

        global.Cesium = {};
        global.Cesium.Cesium3DTileset = () => { /* no content*/ };
        global.Cesium.Cesium3DTileset.fromUrl = () => sinon.stub();

        fromUrlSpy = sinon.spy(global.Cesium.Cesium3DTileset, "fromUrl");
    });

    afterEach(() => {
        sinon.restore();
        global.Cesium = null;
    });

    describe("createLayer", () => {
        let checkLayer;

        before(() => {
            /**
             * Checks the layer for attributes content.
             * @param {Object} layer the layer
             * @param {Object} terrainLayer the terrainLayer
             * @param {Object} attrs the attributes
             * @param {function} done to be called at the end of test
             * @returns {void}
             */
            checkLayer = (layer, terrainLayer, attrs, done) => {
                expect(layer).not.to.be.undefined;
                expect(terrainLayer.get("name")).to.be.equals(attrs.name);
                expect(terrainLayer.get("id")).to.be.equals(attrs.id);
                expect(terrainLayer.get("typ")).to.be.equals(attrs.typ);
                layer.tileset.then(tileset => {
                    expect(tileset.layerReferenceId).to.be.equals(attrs.id);
                    done();
                });
            };
        });

        it("new Layer3dTileset should create an layer with warning", () => {
            const layer3dTileset = new Layer3dTileset(attributes);

            expect(layer3dTileset).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("createLayer shall create a tileset layer", function (done) {
            const layer3dTileset = new Layer3dTileset(attributes),
                layer = layer3dTileset.getLayer();

            expect(fromUrlSpy.calledOnce).to.equal(true);
            checkLayer(layer, layer3dTileset, attributes, done);
        });

        it("createLayer shall create a visible tileset layer", function (done) {
            Object.assign(attributes, {visibility: true});

            const layer3dTileset = new Layer3dTileset(attributes),
                layer = layer3dTileset.getLayer();

            expect(layer3dTileset.get("visibility")).to.equal(true);
            expect(fromUrlSpy.calledOnce).to.equal(true);
            expect(fromUrlSpy.calledWithMatch("the_url/tileset.json", {maximumScreenSpaceError: 6})).to.equal(true);
            checkLayer(layer, layer3dTileset, attributes, done);
        });
        it("createLayer shall add hidden features at visible layer", function (done) {
            attributes.hiddenFeatures = [
                "DEHHALKAJ00011uJ",
                "DEHHALKAJ0000yd2"
            ];
            attributes.visibility = true;
            const addToHiddenObjectsSpy = sinon.spy(Layer3dTileset.prototype, "addToHiddenObjects"),
                layer3dTileset = new Layer3dTileset(attributes),
                layer = layer3dTileset.getLayer();

            expect(fromUrlSpy.calledOnce).to.equal(true);
            checkLayer(layer, layer3dTileset, attributes, done);
            expect(addToHiddenObjectsSpy.calledOnce).to.be.true;
            expect(addToHiddenObjectsSpy.firstCall.args[0]).to.be.deep.equals(attributes.hiddenFeatures);
        });
    });
    describe("setVisible", function () {
        let createLegendSpy, showObjectsSpy, setVisibleSpy, map;

        beforeEach(() => {
            createLegendSpy = sinon.spy(Layer3dTileset.prototype, "createLegend");
            showObjectsSpy = sinon.spy(Layer3dTileset.prototype, "showObjects");
            setVisibleSpy = sinon.spy();
            map = {
                id: "map"
            };
        });

        it("setVisible with visibility true and hiddenFeatures", function () {
            attributes.hiddenFeatures = [
                "DEHHALKAJ00011uJ",
                "DEHHALKAJ0000yd2"
            ];

            const tilesetLayer = new Layer3dTileset(attributes);

            tilesetLayer.getLayer().setVisible = setVisibleSpy;

            tilesetLayer.setVisible(true, map);
            expect(setVisibleSpy.calledOnce).to.be.true;
            expect(setVisibleSpy.firstCall.args[0]).to.be.true;
            expect(setVisibleSpy.firstCall.args[1]).to.be.deep.equals(map);
            expect(createLegendSpy.calledOnce).to.be.true;
            expect(showObjectsSpy.notCalled).to.be.true;
        });
        it("setVisible with visibility false and hiddenFeatures", function () {
            attributes.hiddenFeatures = [
                "DEHHALKAJ00011uJ",
                "DEHHALKAJ0000yd2"
            ];

            const tilesetLayer = new Layer3dTileset(attributes);

            tilesetLayer.getLayer().setVisible = setVisibleSpy;

            tilesetLayer.setVisible(false, map);
            expect(setVisibleSpy.calledOnce).to.be.true;
            expect(setVisibleSpy.firstCall.args[0]).to.be.false;
            expect(setVisibleSpy.firstCall.args[1]).to.be.deep.equals(map);
            expect(createLegendSpy.notCalled).to.be.true;
            expect(showObjectsSpy.calledOnce).to.be.true;
            expect(showObjectsSpy.firstCall.args[0]).to.be.deep.equals(attributes.hiddenFeatures);
        });
        it("setVisible with visibility true and no hiddenFeatures", function () {
            const tilesetLayer = new Layer3dTileset(attributes);

            tilesetLayer.getLayer().setVisible = setVisibleSpy;

            tilesetLayer.setVisible(true, map);
            expect(setVisibleSpy.calledOnce).to.be.true;
            expect(setVisibleSpy.firstCall.args[0]).to.be.true;
            expect(setVisibleSpy.firstCall.args[1]).to.be.deep.equals(map);
            expect(createLegendSpy.calledOnce).to.be.true;
            expect(showObjectsSpy.notCalled).to.be.true;
        });
        it("setVisible with visibility false and no hiddenFeatures", function () {
            const tilesetLayer = new Layer3dTileset(attributes);

            tilesetLayer.getLayer().setVisible = setVisibleSpy;

            tilesetLayer.setVisible(false, map);
            expect(setVisibleSpy.calledOnce).to.be.true;
            expect(setVisibleSpy.firstCall.args[0]).to.be.false;
            expect(setVisibleSpy.firstCall.args[1]).to.be.deep.equals(map);
            expect(createLegendSpy.notCalled).to.be.true;
            expect(showObjectsSpy.notCalled).to.be.true;
        });
    });
    describe("updateLayerValues", function () {
        it("updateLayerValues shall call setVisible and setOpacity if visibility changed", function () {
            attributes.visibility = true;
            const tilesetLayer = new Layer3dTileset(attributes),
                setVisibleSpy = sinon.spy(Layer3dTileset.prototype, "setVisible"),
                setOpacitySpy = sinon.spy(Layer3dTileset.prototype, "setOpacity");

            tilesetLayer.updateLayerValues({visibility: false, transparency: 1});
            expect(setVisibleSpy.calledOnce).to.be.true;
            expect(setVisibleSpy.firstCall.args[0]).to.be.false;
            expect(setOpacitySpy.calledOnce).to.be.true;
            expect(setOpacitySpy.firstCall.args[0]).to.be.equals(1);
        });
        it("updateLayerValues shall call setOpacity if visibility not changed", function () {
            attributes.visibility = true;
            const tilesetLayer = new Layer3dTileset(attributes),
                setVisibleSpy = sinon.spy(Layer3dTileset.prototype, "setVisible"),
                setOpacitySpy = sinon.spy(Layer3dTileset.prototype, "setOpacity");

            tilesetLayer.updateLayerValues({visibility: true, transparency: 1});
            expect(setVisibleSpy.notCalled).to.be.true;
            expect(setOpacitySpy.calledOnce).to.be.true;
            expect(setOpacitySpy.firstCall.args[0]).to.be.equals(1);
        });
    });
    describe("setOpacity", function () {
        it("setOpacity 100 shall call setOpacity at layer", function () {
            attributes.visibility = true;
            const tilesetLayer = new Layer3dTileset(attributes),
                setOpacitySpy = sinon.spy();

            tilesetLayer.getLayer().setOpacity = setOpacitySpy;

            tilesetLayer.setOpacity(100);
            expect(setOpacitySpy.calledOnce).to.be.true;
            expect(setOpacitySpy.firstCall.args[0]).to.be.equals(0);
        });
        it("setOpacity 0 shall call setOpacity at layer", function () {
            attributes.visibility = true;
            const tilesetLayer = new Layer3dTileset(attributes),
                setOpacitySpy = sinon.spy();

            tilesetLayer.getLayer().setOpacity = setOpacitySpy;

            tilesetLayer.setOpacity(0);
            expect(setOpacitySpy.calledOnce).to.be.true;
            expect(setOpacitySpy.firstCall.args[0]).to.be.equals(1);
        });
    });
    describe("featureExists", function () {
        it("featureExists shall return true", function () {
            attributes.visibility = true;
            const tilesetLayer = new Layer3dTileset(attributes),
                feature = {
                    content: {
                        isDestroyed: () => false,
                        batchTable: {
                            isDestroyed: () => false
                        }
                    }

                },
                result = tilesetLayer.featureExists(feature);

            expect(result).to.be.true;
        });
        it("featureExists shall return false", function () {
            attributes.visibility = true;
            const tilesetLayer = new Layer3dTileset(attributes),
                feature = {
                    content: {
                        isDestroyed: () => true,
                        batchTable: {
                            isDestroyed: () => false
                        }
                    }

                },
                result = tilesetLayer.featureExists(feature);

            expect(result).to.be.false;
        });
    });
    describe("styleContent", function () {
        it("should set lastUpdatedSymbol on the content on first call", function () {
            attributes.hiddenFeatures = [
                "DEHHALKAJ00011uJ",
                "DEHHALKAJ0000yd2"
            ];
            const updateHiddenFeatureListSpy = sinon.spy(Layer3dTileset.prototype, "updateHiddenFeatureList"),
                tilesetLayer = new Layer3dTileset(attributes),
                content = sinon.spy();

            expect(content[tilesetLayer.lastUpdatedSymbol]).to.be.undefined;
            tilesetLayer.styleContent(content);
            expect(content[tilesetLayer.lastUpdatedSymbol]).to.not.be.undefined;
            expect(updateHiddenFeatureListSpy.calledOnce).to.be.true;
        });
    });
    describe("addToHiddenObjects", function () {
        it("add the id to the hiddenObjects and create an empty Set", function () {
            const setFeatureVisibilityLastUpdatedSpy = sinon.spy(Layer3dTileset.prototype, "setFeatureVisibilityLastUpdated"),
                tilesetLayer = new Layer3dTileset(attributes);

            tilesetLayer.addToHiddenObjects(["id"]);
            expect(tilesetLayer.hiddenObjects.id).to.be.an.instanceOf(Set);
            // once called at creation of layer
            expect(setFeatureVisibilityLastUpdatedSpy.calledTwice).to.be.true;
        });
    });
    describe("showObjects", function () {
        it("should remove the id from the hiddenObjects List", function () {
            const tilesetLayer = new Layer3dTileset(attributes);

            tilesetLayer.addToHiddenObjects(["id"]);
            expect(tilesetLayer.hiddenObjects.id).to.be.an.instanceOf(Set);
            tilesetLayer.showObjects(["id"]);
            expect(tilesetLayer.hiddenObjects.id).to.be.undefined;
        });
    });
    describe("createLegend", function () {
        it("createLegend shall create a legend", async function () {
            attributes.legendURL = "https://legendUrl";
            const tilesetLayer = new Layer3dTileset(attributes),
                legend = await tilesetLayer.createLegend();

            expect(legend).to.be.deep.equals([attributes.legendURL]);
        });
    });
    describe("updateHiddenFeatureList", function () {
        it("updateHiddenFeatureList", async function () {
            let tilesetLayer = null;
            const addToHiddenObjectsSpy = sinon.spy(),
                hiddenFeatures1 = [
                    "DEHHALKAJ00011uJ",
                    "DEHHALKAJ0000yd2"
                ],
                hiddenFeatures3 = [
                    "DEHHALKAJ0001abc"
                ];

            sinon.stub(layerCollection, "getLayers").returns(
                [
                    {
                        id: "1",
                        addToHiddenObjects: addToHiddenObjectsSpy,
                        get: (key) =>{
                            if (key === "hiddenFeatures") {
                                return hiddenFeatures1;
                            }
                            if (key === "typ") {
                                return "TileSet3D";
                            }
                            return null;
                        }
                    },
                    {
                        id: "2",
                        addToHiddenObjects: addToHiddenObjectsSpy,
                        get: (key) =>{
                            if (key === "hiddenFeatures") {
                                return [];
                            }
                            if (key === "typ") {
                                return "TileSet3D";
                            }
                            return null;
                        }
                    },
                    {
                        id: "3",
                        addToHiddenObjects: addToHiddenObjectsSpy,
                        get: (key) =>{
                            if (key === "hiddenFeatures") {
                                return hiddenFeatures3;
                            }
                            if (key === "typ") {
                                return "TileSet3D";
                            }
                            return null;
                        }
                    },
                    {
                        id: "4",
                        addToHiddenObjects: addToHiddenObjectsSpy,
                        get: (key) =>{
                            if (key === "typ") {
                                return "WMS";
                            }
                            return null;
                        }
                    }
                ]
            );
            tilesetLayer = new Layer3dTileset(attributes);
            tilesetLayer.updateHiddenFeatureList();

            expect(addToHiddenObjectsSpy.calledThrice).to.be.true;
            expect(addToHiddenObjectsSpy.firstCall.args[0]).to.be.deep.equals(hiddenFeatures1.concat(hiddenFeatures3));
            expect(addToHiddenObjectsSpy.firstCall.args[1]).to.be.true;
            expect(addToHiddenObjectsSpy.secondCall.args[0]).to.be.deep.equals(hiddenFeatures1.concat(hiddenFeatures3));
            expect(addToHiddenObjectsSpy.secondCall.args[1]).to.be.true;
            expect(addToHiddenObjectsSpy.thirdCall.args[0]).to.be.deep.equals(hiddenFeatures1.concat(hiddenFeatures3));
            expect(addToHiddenObjectsSpy.thirdCall.args[1]).to.be.true;
        });
    });
});
