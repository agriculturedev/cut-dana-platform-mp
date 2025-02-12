import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";
import View from "ol/View";

import actions from "../../../store/actionsMapsAttributesMapper";

const {
    initTwoFingerPan,
    oneFingerDragMessage,
    oneFingerDragMessageEnd,
    setMapAttributes,
    registerMapListener,
    unregisterMapListener,
    setInitialAttributes,
    updateAttributesByChangeSize,
    updateAttributesByClick,
    updateAttributesByMoveend,
    updateAttributesByChangeResolution
} = actions;

describe("src/core/maps/store/actionsMapsAttributesMapper.js", () => {
    const options = [
            {
                resolution: 66.14579761460263,
                scale: 250000,
                zoomLevel: 0
            },
            {
                resolution: 26.458319045841044,
                scale: 100000,
                zoomLevel: 1
            },
            {
                resolution: 15.874991427504629,
                scale: 60000,
                zoomLevel: 2
            },
            {
                resolution: 10.583327618336419,
                scale: 40000,
                zoomLevel: 3
            },
            {
                resolution: 5.2916638091682096,
                scale: 20000,
                zoomLevel: 4
            },
            {
                resolution: 2.6458319045841048,
                scale: 10000,
                zoomLevel: 5
            }
        ],
        resolutions = [
            66.14579761460263,
            26.458319045841044,
            15.874991427504629,
            10.583327618336419,
            5.2916638091682096,
            2.6458319045841048
        ];
    let commit,
        dispatch,
        getters,
        map2d,
        mapDiv;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {
            mode: "2D"
        };

        mapCollection.clear();
        map2d = new Map({
            id: "ol",
            mode: "2D",
            view: new View({
                center: [10, 20],
                options: options,
                resolution: 2.6458319045841048,
                resolutions: resolutions,
                rotation: 0
            })
        });

        map2d.setSize([50, 50]);
        mapCollection.addMap(map2d, "2D");

        document.body.innerHTML = "<div id=\"map\"></div>";
        mapDiv = document.getElementById("map");
    });

    afterEach(() => {
        sinon.restore();
        mapDiv?.remove();
    });

    describe("setMapAttributes", () => {
        it("Should dispatch map attributes", () => {
            setMapAttributes({dispatch});

            expect(dispatch.callCount).to.equals(6);
            expect(dispatch.firstCall.args[0]).to.deep.equals("registerMapListener");
            expect(dispatch.secondCall.args[0]).to.deep.equals("initTwoFingerPan");
            expect(dispatch.thirdCall.args[0]).to.deep.equals("registerMapViewListener");
            expect(dispatch.getCall(3).args[0]).to.deep.equals("setInitialAttributes");
            expect(dispatch.getCall(4).args[0]).to.deep.equals("updateAttributesByMoveend");
            expect(dispatch.getCall(5).args[0]).to.deep.equals("updateAttributesByChangeResolution");
        });
    });

    describe("initTwoFingerPan", () => {
        it("Should do nothing, if twoFingerPan is false", () => {
            const rootGetters = {
                twoFingerPan: false
            };

            initTwoFingerPan({dispatch, rootGetters});

            expect(dispatch.notCalled).to.be.true;
        });
        it("Should do nothing, if twoFingerPan is not available", () => {
            const rootGetters = {};

            initTwoFingerPan({dispatch, rootGetters});

            expect(dispatch.notCalled).to.be.true;
        });
        it("adds event listener to map, if twoFingerPan is true", () => {
            const rootGetters = {
                twoFingerPan: true
            };

            mapDiv.addEventListener = sinon.spy();
            initTwoFingerPan({dispatch, rootGetters});

            expect(dispatch.notCalled).to.be.true;
            expect(mapDiv.addEventListener.calledTwice).to.be.true;
            expect(mapDiv.addEventListener.firstCall.args[0]).to.equals("touchmove");
            expect(mapDiv.addEventListener.secondCall.args[0]).to.equals("touchend");
        });
    });

    describe("registerMapListener", () => {
        it("Should register listeners", () => {
            registerMapListener({dispatch});

            expect(dispatch.callCount).to.equals(4);
            expect(dispatch.firstCall.args).to.deep.equals(["registerListener", {
                type: "change:size",
                listener: "updateAttributesByChangeSize",
                listenerType: "dispatch"
            }]);
            expect(dispatch.secondCall.args).to.deep.equals(["registerListener", {
                type: "click",
                listener: "updateAttributesByClick",
                listenerType: "dispatch"
            }]);
            expect(dispatch.thirdCall.args).to.deep.equals(["registerListener", {
                type: "moveend",
                listener: "updateAttributesByMoveend",
                listenerType: "dispatch"
            }]);
            expect(dispatch.getCall(3).args).to.deep.equals(["registerListener", {
                type: "pointermove",
                listener: "updateAttributesByPointer",
                listenerType: "dispatch"
            }]);
        });
    });

    describe("unregisterMapListener", () => {
        it("Should unregister listeners", () => {
            unregisterMapListener({dispatch});

            expect(dispatch.callCount).to.equals(2);

            expect(dispatch.firstCall.args).to.deep.equals(["unregisterListener", {
                type: "click",
                listener: "updateAttributesByClick",
                listenerType: "dispatch"
            }]);

            expect(dispatch.secondCall.args).to.deep.equals(["unregisterListener", {
                type: "pointermove",
                listener: "updateAttributesByPointer",
                listenerType: "dispatch"
            }]);
        });
    });

    describe("setInitialAttributes", () => {
        it("Should set initial attributes", () => {
            setInitialAttributes({commit});

            expect(commit.callCount).to.equals(8);
            expect(commit.firstCall.args).to.deep.equals(["setInitialCenter", [10, 20]]);
            expect(commit.secondCall.args).to.deep.equals(["setInitialRotation", 0]);
            expect(commit.thirdCall.args).to.deep.equals(["setInitialZoom", 5]);
            expect(commit.getCall(3).args).to.deep.equals(["setMode", "2D"]);
            expect(commit.getCall(4).args[0]).to.equals("setProjection");
            expect(commit.getCall(4).args[1].code_).to.equals("EPSG:3857");
            expect(commit.getCall(5).args).to.deep.equals(["setResolutions", [
                66.14579761460263,
                26.458319045841044,
                15.874991427504629,
                10.583327618336419,
                5.2916638091682096,
                2.6458319045841048
            ]]);
            expect(commit.getCall(6).args).to.deep.equals(["setScales", [
                250000,
                100000,
                60000,
                40000,
                20000,
                10000
            ]]);
            expect(commit.getCall(7).args).to.deep.equals(["setSize", [
                50,
                50
            ]]);
        });
    });

    describe("updateAttributesByChangeSize", () => {
        it("Should update attributes by change size event", () => {
            updateAttributesByChangeSize({commit});

            expect(commit.callCount).to.equals(1);
            expect(commit.firstCall.args).to.deep.equals(["setSize", [50, 50]]);
        });
    });

    describe("updateAttributesByClick", () => {
        it("Should update attributes by click event", () => {
            const evt = {
                coordinate: [1, 2],
                pixel: 100
            };

            updateAttributesByClick({getters, commit}, evt);

            expect(commit.callCount).to.equals(2);
            expect(commit.firstCall.args).to.deep.equals(["setClickCoordinate", [1, 2]]);
            expect(commit.secondCall.args).to.deep.equals(["setClickPixel", 100]);
        });
    });

    describe("updateAttributesByMoveend", () => {
        it("Should update attributes by moveend event", () => {
            updateAttributesByMoveend({commit});

            expect(commit.callCount).to.equals(2);
            expect(commit.firstCall.args).to.deep.equals(["setCenter", [10, 20]]);
            expect(commit.secondCall.args).to.deep.equals(["setExtent", [-56.145797614602614, -46.145797614602614, 76.14579761460261, 86.14579761460261]]);
        });
    });

    describe("updateAttributesByChangeResolution", () => {
        it("Should update attributes by change resolution event", () => {
            updateAttributesByChangeResolution({commit});

            expect(commit.callCount).to.equals(5);
            expect(commit.firstCall.args).to.deep.equals(["setMaxZoom", 5]);
            expect(commit.secondCall.args).to.deep.equals(["setMinZoom", 0]);
            expect(commit.thirdCall.args).to.deep.equals(["setResolution", 2.6458319045841048]);
            expect(commit.getCall(3).args).to.deep.equals(["setScale", 10000]);
            expect(commit.getCall(4).args).to.deep.equals(["setZoom", 5]);
        });
    });
    describe("oneFingerDragMessage", () => {
        it("Should alert if targetTouches length is 1 and twoFingerPanStart is false", () => {
            const event = {
                targetTouches: ["1"]
            };

            oneFingerDragMessage({commit, dispatch, getters}, event);

            expect(commit.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.deep.equals(["Alerting/addSingleAlert", "core.maps.mapRegion.twoFingerPanAlert", {root: true}]);
        });
        it("Should commit if targetTouches length is 0 and remove eventListener", () => {
            const event = {
                targetTouches: []
            };

            mapDiv.removeEventListener = sinon.spy();
            oneFingerDragMessageEnd({commit, dispatch}, event);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.deep.equals(["setTwoFingerPanStart", false]);
            expect(mapDiv.removeEventListener.calledTwice).to.be.true;
            expect(mapDiv.removeEventListener.firstCall.args[0]).to.equals("touchmove");
            expect(mapDiv.removeEventListener.secondCall.args[0]).to.equals("touchend");
        });
    });
});
