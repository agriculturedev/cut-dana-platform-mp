import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import View from "ol/View";

import actions from "../../../store/actionsMapsLayers";

const {
    addLayer,
    checkLayer
} = actions;

describe("src/core/maps/store/actionsMapsLayers.js", () => {
    let layer1,
        layer2,
        layer3,
        map,
        warn;

    before(() => {
        layer1 = new VectorLayer({
            id: "Donald",
            name: "Duck1",
            source: new VectorSource()
        });
        layer2 = new VectorLayer({
            id: "Dagobert",
            name: "Duck2",
            alwaysOnTop: true,
            source: new VectorSource()
        });
        layer3 = new VectorLayer({
            id: "Darkwing",
            name: "Duck3",
            source: new VectorSource()
        });
    });

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);

        mapCollection.clear();
        map = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });

        mapCollection.addMap(map, "2D");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("addLayer", () => {
        it("Should add three layers to the map", () => {
            const ids = ["Donald", "Dagobert", "Darkwing"];

            addLayer({}, layer1);
            addLayer({}, layer2);
            addLayer({}, layer3);

            mapCollection.getMap("2D").getLayers().forEach((layer, index) => {
                expect(layer.get("id")).equals(ids[index]);
            });
        });

        it("Should add a layer only once, otherwise print a warn, if layer is already exist in the map", () => {
            const ids = ["Donald"];

            addLayer({}, layer1);
            addLayer({}, layer1);

            mapCollection.getMap("2D").getLayers().forEach((layer, index) => {
                expect(layer.get("id")).equals(ids[index]);
            });
            expect(warn.calledOnce).to.be.true;
        });
    });

    describe("checkLayer", () => {
        it("Should return true if layer exists", () => {

            addLayer({}, layer1);
            addLayer({}, layer2);

            expect(checkLayer({}, layer1)).to.be.true;
            expect(checkLayer({}, layer2)).to.be.true;
            expect(checkLayer({}, layer3)).to.be.false;
        });

        it("Should return false if layer doesn't exists", () => {

            addLayer({}, layer2);

            expect(checkLayer({}, layer1)).to.be.false;
            expect(checkLayer({}, layer2)).to.be.true;
        });

    });
    describe("areLayerFeaturesLoaded", () => {
        let state, commit, isResolved;

        beforeEach(()=> {
            state = {loadedLayers: []};
            commit = sinon.spy();
            isResolved = false;
        });

        afterEach(()=> {
            sinon.restore();
        });

        it("Resolves immediately if layer is already fully loaded", () => {
            addLayer({}, layer1);

            actions.areLayerFeaturesLoaded({commit, state}, layer1.get("id"))
                .then(()=> {
                    isResolved = true;
                })
                .then(()=>{
                    expect(isResolved).to.be.true;
                });
        });
    });
});
