import {expect} from "chai";
import sinon from "sinon";
import Layer3dTerrain from "../../../js/layer3dTerrain";

describe("src/core/js/layers/layer3dTerrain.js", () => {
    let attributes,
        cesiumEllipsoidTerrainProviderSpy,
        cesiumTerrainProviderSpy,
        fromUrlSpy,
        map3d,
        warn;

    before(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);

        mapCollection.clear();

        map3d = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return {};
            }
        };

        mapCollection.addMap(map3d, "3D");
    });

    beforeEach(() => {
        attributes = {
            name: "terrainTestLayer",
            id: "id",
            typ: "Terrain3D",
            cesiumTerrainProviderOptions: {
                requestVertexNormals: true
            },
            url: "https://example.com"
        };

        global.Cesium = {};
        global.Cesium.CesiumTerrainProvider = () => { /* no content*/ };
        global.Cesium.EllipsoidTerrainProvider = () => { /* no content*/ };
        global.Cesium.CesiumTerrainProvider.fromUrl = () => sinon.stub();

        cesiumEllipsoidTerrainProviderSpy = sinon.spy(global.Cesium, "EllipsoidTerrainProvider");
        cesiumTerrainProviderSpy = sinon.spy(global.Cesium, "CesiumTerrainProvider");
        fromUrlSpy = sinon.spy(global.Cesium.CesiumTerrainProvider, "fromUrl");
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
             * @returns {void}
             */
            checkLayer = (layer, terrainLayer, attrs) => {
                expect(layer).not.to.be.undefined;
                expect(terrainLayer.get("name")).to.be.equals(attrs.name);
                expect(terrainLayer.get("id")).to.be.equals(attrs.id);
                expect(terrainLayer.get("typ")).to.be.equals(attrs.typ);
            };
        });

        it("new Layer3dTerrain should create an layer with warning", () => {
            const layer3dTerrain = new Layer3dTerrain({});

            expect(layer3dTerrain).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("createLayer shall create a terrain layer", () => {
            const layer3dTerrain = new Layer3dTerrain(attributes),
                layer = layer3dTerrain.getLayer();

            checkLayer(layer, layer3dTerrain, attributes);
            expect(cesiumTerrainProviderSpy.notCalled).to.equal(true);
            expect(cesiumEllipsoidTerrainProviderSpy.calledOnce).to.equal(true);
        });

        it("createLayer shall create a visible terrain layer", () => {
            Object.assign(attributes, {visibility: true});

            const layer3dTerrain = new Layer3dTerrain(attributes),
                layer = layer3dTerrain.getLayer();

            checkLayer(layer, layer3dTerrain, attributes);
            expect(fromUrlSpy.calledOnce).to.equal(true);
            expect(fromUrlSpy.calledWithMatch("https://example.com", {})).to.equal(true);
            expect(cesiumEllipsoidTerrainProviderSpy.notCalled).to.equal(true);
        });
    });
});
