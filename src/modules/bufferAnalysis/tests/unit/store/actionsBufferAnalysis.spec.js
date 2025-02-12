import sinon from "sinon";
import {expect} from "chai";
import {createLayerConfigsArray} from "../utils/functions";
import actions from "../../../store/actionsBufferAnalysis";
import stateBufferAnalysis from "../../../store/stateBufferAnalysis";
import testAction from "../../../../../../devtools/tests/VueTestUtils";
import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

describe("src/modules/bufferAnalysis/store/actionsBufferAnalysis.js", () => {
    let commit, dispatch, rootGetters, rootState, state;

    const defaultState = {...stateBufferAnalysis};

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addLayer: sinon.spy(),
            removeLayer: sinon.spy()
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.stub().resolves(true);
        rootGetters = {
            "Maps/mode": "2D"
        };
        rootState = {
            Maps: {
                mode: "2D"
            },
            urlParams: {
                initvalues: [
                    "{\"applySelectedSourceLayer\":\"1711\"",
                    "\"applyBufferRadius\":\"1010\"",
                    "\"setResultType\":0",
                    "\"applySelectedTargetLayer\":\"2128\"}"
                ]
            }
        };
        state = Object.assign({}, defaultState);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("initJSTSParser", () => {
        it("initializes the JSTS parser by injecting open layer geometries ", () => {
            const inject = sinon.spy();

            actions.initJSTSParser({getters: {jstsParser: {inject: inject}}});
            expect(inject.calledOnce).to.be.true;

            expect(inject.args[0]).to.eql([Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon]);
        });
    });
    describe("loadSelectOptions", () => {
        it("loads a number of layers as select options and commits them", done => {
            const source = {getFeatures: ()=>[]},
                layers = createLayerConfigsArray(3),
                getters = {
                    "selectOptions": []
                };

            layers.forEach((layer, index) => {
                layers[index].get = key => key === "layerSource" ? source : null;
                layer.typ = "WFS";
            });

            rootGetters = {
                "allSubjectDataLayerConfigs": layers
            };

            testAction(actions.loadSelectOptions, {}, state, {}, [
                {type: "addSelectOption", payload: layers[0], commit: true},
                {type: "addSelectOption", payload: layers[1], commit: true},
                {type: "addSelectOption", payload: layers[2], commit: true}
            ], getters, done, rootGetters);
        });
    });
    describe("applySelectedSourceLayer", () => {
        it("calls commit and dispatch each one time with correct parameters", done => {
            state.bufferRadius = 1000;
            const layers = createLayerConfigsArray(2),
                layerConfig = {
                    layerConfigs: [{
                        id: layers[0].id,
                        layer: {
                            id: layers[0].id,
                            opacity: 1,
                            visibility: true
                        }
                    }]
                },
                layerConfigFalse = {
                    layerConfigs: [{
                        id: layers[1].id,
                        layer: {
                            id: layers[1].id,
                            visibility: false
                        }
                    }]
                };

            state.selectOptions = createLayerConfigsArray(2);
            testAction(actions.applySelectedSourceLayer, layers[0], state, {}, [
                {type: "replaceByIdInLayerConfig", payload: layerConfig, dispatch: true},
                {type: "replaceByIdInLayerConfig", payload: layerConfigFalse, dispatch: true},
                {type: "setSelectedSourceLayer", payload: layers[0], commit: true}
            ], state, done, {});
        });
    });
    describe("applySelectedTargetLayer", () => {
        it("calls commit and dispatch each one time with correct parameters", done => {
            state.bufferRadius = 1000;
            const layer = createLayerConfigsArray(1)[0],
                layerConfig = {
                    layerConfigs: [{
                        id: layer.id,
                        layer: {
                            id: layer.id,
                            visibility: true
                        }
                    }]
                };

            state.selectOptions = createLayerConfigsArray(3);

            testAction(actions.applySelectedTargetLayer, layer, state, {}, [
                {type: "setSelectedTargetLayer", payload: layer, commit: true},
                {type: "replaceByIdInLayerConfig", payload: layerConfig, dispatch: true},
                {type: "checkIntersection", dispatch: true}
            ], state, done, {});
        });
    });
    describe("applySelectedTargetLayer", () => {
        it("throws an error if a layerId is not found", () => {
            expect(() => actions.applySelectedTargetLayer({commit, dispatch, getters: state}, "1234")).to.throw();
        });
    });
    describe("applyBufferRadius", () => {
        it("calls commit and dispatch each one time with correct parameters", () => {
            state.bufferRadius = 1000;
            actions.applyBufferRadius({commit, dispatch}, 1000);

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setBufferRadius");
            expect(commit.args[0][1]).to.equal(1000);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0][0]).to.equal("removeGeneratedLayers");
            expect(dispatch.args[1][0]).to.equal("showBuffer");
        });
    });
    describe("checkIntersection", () => {
        it("calls dispatch with correct parameters", done => {
            state.selectedTargetLayer = {...createLayerConfigsArray(1)[0], get: sinon.stub().returns({setOpacity: () => ({})})};
            state.bufferLayer = {...createLayerConfigsArray(1)[0], getSource: ()=> ({getFeatures: ()=>({})})};

            testAction(actions.checkIntersection, {}, state, {}, [
                {type: "Maps/areLayerFeaturesLoaded", payload: 0, dispatch: true}
            ], state, done, {});
        });
    });
    describe("showBuffer", () => {
        it("calls commit and addLayer once each", () => {
            state.selectedSourceLayer = {...createLayerConfigsArray(1)[0], get: ()=> ({getFeatures: ()=>[], setOpacity: () => ({})})};
            actions.showBuffer({commit, getters: state, dispatch, rootGetters});

            expect(commit.calledOnce).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
        });
    });
    describe("removeGeneratedLayers", () => {
        it("calls commit four times and removeLayer twice", done => {
            state.resultLayer = createLayerConfigsArray(1)[0];
            state.bufferLayer = createLayerConfigsArray(1)[0];

            testAction(actions.removeGeneratedLayers, {}, state, rootState, [
                {type: "setResultLayer", payload: {}, commit: true},
                {type: "setBufferLayer", payload: {}, commit: true},
                {type: "setIntersections", payload: [], commit: true},
                {type: "setResultFeatures", payload: [], commit: true}
            ], state, done, {});
        });
    });
    describe("resetModule", () => {
        it("calls dispatch three times", async () => {
            actions.resetModule({commit, getters: state, dispatch});

            expect(dispatch.callCount).to.equal(3);
        });
    });
});
