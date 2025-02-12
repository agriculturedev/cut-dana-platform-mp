import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsCompareMaps";
import layerCollection from "../../../../../core/layers/js/layerCollection";

describe("modules/compareMaps/store/actionsCompareMaps", () => {
    let commit, state, rootGetters;

    beforeEach(() => {
        commit = sinon.spy();
        rootGetters = {
            allLayerConfigs: [
                {id: "layer1", name: "Layer 1", typ: "WMS", visibility: true},
                {id: "layer2", name: "Layer 2", typ: "WFS", visibility: false},
                {id: "layer3", name: "Layer 3", typ: "Vector", visibility: true},
                {id: "layer4", name: "Layer 4", typ: "WMS", visibility: false}
            ]
        };
        state = {
            selectedLayer1Id: "layer1",
            selectedLayer2Id: "layer2"
        };
        const layer1 = {get: () => "layer1", getLayer: () => ({values_: {id: "layer1"}}), attributes: {id: "layer1"}},
            layer2 = {get: () => "layer2", getLayer: () => ({values_: {id: "layer2"}}), attributes: {id: "layer2"}};

        sinon.stub(layerCollection, "getLayers").returns([layer1, layer2]);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should initialize layer names and set initial base layer", () => {
        actions.initialize({commit, rootGetters});

        const expectedInitialBaseLayer = {id: "layer1", name: "Layer 1"};

        expect(commit.calledWith("setInitialBaseLayer", expectedInitialBaseLayer)).to.be.true;
    });

    it("should not set initial base layer if no visible WMS layer exists", () => {
        rootGetters.allLayerConfigs = [
            {id: "layer1", name: "Layer 1", typ: "WFS", visibility: false},
            {id: "layer2", name: "Layer 2", typ: "Vector", visibility: true}
        ];

        actions.initialize({commit, rootGetters});

        expect(commit.calledWith("setInitialBaseLayer")).to.be.false;
    });

    it("should activate LayerSwiper", () => {
        actions.activateSwiper({state, commit});

        expect(commit.calledWith("Modules/LayerSwiper/setActive", true, {root: true})).to.be.true;
        expect(commit.calledWith("Modules/LayerSwiper/setLayerSwiperSourceLayer", sinon.match.any, {root: true})).to.be.true;
        expect(commit.calledWith("Modules/LayerSwiper/setLayerSwiperTargetLayer", sinon.match.any, {root: true})).to.be.true;
    });
});
