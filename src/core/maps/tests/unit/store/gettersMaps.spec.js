import {expect} from "chai";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import gettersMap from "../../../store/gettersMaps";
import stateMap from "../../../store/stateMaps";
import actions from "../../../store/actionsMapsLayers";
import sinon from "sinon";

const {
    addLayer
} = actions;

describe("src/core/maps/store/gettersMap.js", () => {
    let layer1,
        layer2,
        layer3,
        olMap;

    before(() => {
        layer1 = new VectorLayer({
            id: "1",
            name: "layer1",
            visible: true,
            source: new VectorSource()
        });
        layer2 = new VectorLayer({
            id: "2",
            name: "layer2",
            visible: true,
            source: new VectorSource()
        });
        layer3 = new VectorLayer({
            id: "3",
            name: "layer3",
            visible: false,
            source: new VectorSource()
        });
    });

    beforeEach(() => {
        olMap = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });
        mapCollection.clear();
        mapCollection.addMap(olMap, "2D");
        addLayer({}, layer1);
        addLayer({}, layer2);
        addLayer({}, layer3);
    });

    describe("getLayerById", () => {
        it("returns layer by id", () => {
            expect(gettersMap.getLayerById()("1")).to.deep.equal(layer1);

        });
    });

    describe("getLayerByName", () => {
        it("returns layer by name", () => {
            expect(gettersMap.getLayerByName()("layer2")).to.deep.equal(layer2);
            expect(gettersMap.getLayerByName()("nameUnknown")).to.equal(undefined);
            expect(gettersMap.getLayerByName()("undefined")).to.equal(undefined);
        });
    });

    describe("isMaxZoomDisplayed", async () => {
        it("returns false for isMaxZoomDisplayed from stateMaps and true for local state", () => {
            const state = {
                maxZoom: 10,
                zoom: 0
            };

            expect(gettersMap.isMaxZoomDisplayed(stateMap)).to.be.true;
            expect(gettersMap.isMaxZoomDisplayed(state)).to.be.false;
        });
    });

    describe("isMinZoomDisplayed", () => {
        it("returns false for isMinZoomDisplayed from stateMaps and true for local state", () => {
            const state = {
                minZoom: 0,
                zoom: 5
            };

            expect(gettersMap.isMinZoomDisplayed(stateMap)).to.be.true;
            expect(gettersMap.isMinZoomDisplayed(state)).to.be.false;
        });
    });

    describe("urlParams", async () => {
        it("returns urlParams for local state", () => {
            const state = {
                    center: [5, 8],
                    mode: "3D",
                    zoom: 5
                },
                map3d = {
                    id: "1",
                    mode: "3D",
                    getCesiumScene: () => {
                        return {"camera": {
                            "heading": 1,
                            "position": {x: 3742884.2199247065, y: 659588.8716800908, z: 5111473.458863588},
                            "pitch": 0
                        }};
                    }
                };

            global.Cesium = {};
            global.Cesium.Cartographic = () => { /* no content*/ };
            global.Cesium.Cartographic.fromCartesian = () => sinon.stub();
            global.Cesium.Cartographic.fromCartesian.height = () => sinon.stub();

            mapCollection.addMap(map3d, "3D");

            expect(gettersMap.urlParams(state).toString()).to.be.equal("MAPS={\"center\":[5,8],\"mode\":\"3D\",\"zoom\":5,\"heading\":1,\"tilt\":0}");

            mapCollection.clear();
        });
    });
});
