import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";
import View from "ol/View";

import actions from "../../../store/actionsMapsInteractions";

const {
    registerListener,
    resetView,
    unregisterListener,
    setCenter
} = actions;

describe("src/core/maps/store/actionsMapsInteractions.js", () => {
    let olMap,
        payload;

    beforeEach(() => {
        olMap = new Map({
            id: "ol",
            mode: "2D",
            view: new View({
                center: [10, 20],
                resolution: 2.6458319045841048,
                rotation: 1,
                zoom: 3
            })
        });
        payload = {
            type: "pointermove",
            listener: "updatePointer",
            listenerType: "dispatch"
        };
        mapCollection.clear();
        mapCollection.addMap(olMap, "2D");
    });

    after(() => {
        sinon.restore();
    });

    describe("registerListener", () => {
        it("register pointermove listener to ol map and execute function", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                evt = {type: "pointermove"};

            payload = {
                type: "pointermove",
                listener: sinon.spy()
            };
            registerListener({commit, dispatch}, payload);
            expect(Object.keys(olMap.listeners_)).include("pointermove");
            olMap.listeners_.pointermove[0](evt);
            expect(dispatch.notCalled).to.be.true;
            expect(commit.notCalled).to.be.true;
            expect(payload.listener.calledOnce).to.be.true;
            expect(payload.listener.firstCall.args[0]).to.be.deep.equals(evt);
        });
        it("register pointermove listener to ol map and execute dispatch", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                evt = {type: "pointermove"};

            registerListener({commit, dispatch}, payload);
            expect(Object.keys(olMap.listeners_)).include("pointermove");
            olMap.listeners_.pointermove[0](evt);
            expect(dispatch.calledOnce).to.be.true;
            expect(commit.notCalled).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals(payload.listener);
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(evt);
            expect(dispatch.firstCall.args[2]).to.be.deep.equals({root: false});
        });
        it("register click listener to ol map and execute commit", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                evt = {type: "click"};

            payload = {
                type: "click",
                listener: "listenerCallback",
                listenerType: "commit"
            };
            registerListener({commit, dispatch}, payload);
            expect(Object.keys(olMap.listeners_)).include("click");
            olMap.listeners_.click[0](evt);
            expect(dispatch.notCalled).to.be.true;
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals(payload.listener);
            expect(commit.firstCall.args[1]).to.be.deep.equals(evt);
            expect(commit.firstCall.args[2]).to.be.deep.equals({root: false});
        });
        it("register a listener with dispatch and root:true", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                evt = {type: "click"};

            payload = {
                type: "click",
                listener: "Controls/Orientation/mapClicked",
                listenerType: "dispatch",
                root: true
            };
            registerListener({commit, dispatch}, payload);
            expect(Object.keys(olMap.listeners_)).include("click");
            olMap.listeners_.click[0](evt);
            expect(dispatch.calledOnce).to.be.true;
            expect(commit.notCalled).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals(payload.listener);
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(evt);
            expect(dispatch.firstCall.args[2]).to.be.deep.equals({root: true});
        });
        it("register a listener with commit and root:true", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                evt = {type: "click"};

            payload = {
                type: "click",
                listener: "setSomething",
                listenerType: "commit",
                root: true
            };
            registerListener({commit, dispatch}, payload);
            expect(Object.keys(olMap.listeners_)).include("click");
            olMap.listeners_.click[0](evt);
            expect(commit.calledOnce).to.be.true;
            expect(dispatch.notCalled).to.be.true;
            expect(commit.firstCall.args[0]).to.equals(payload.listener);
            expect(commit.firstCall.args[1]).to.be.deep.equals(evt);
            expect(commit.firstCall.args[2]).to.be.deep.equals({root: true});
        });
    });

    describe("resetView", () => {
        it("should reset the map view", () => {
            const state = {
                initialCenter: [50, 50],
                initialRotation: 0,
                initialZoom: 5
            };

            resetView({state});

            expect(mapCollection.getMapView("2D").getCenter()).to.deep.equals([50, 50]);
            expect(mapCollection.getMapView("2D").getRotation()).to.equals(0);
            expect(mapCollection.getMapView("2D").getZoom()).to.equals(5);
        });
    });

    describe("unregisterListener", () => {
        it("unregister pointermove listener from ol map", () => {
            unregisterListener({}, payload);
            expect(Object.keys(olMap.listeners_)).not.include("pointermove");
        });
    });

    describe("setCenter", () => {
        it("set the center", () => {
            const commit = sinon.spy(),
                coordinates = [575575.269, 5939992.777];

            setCenter({commit}, coordinates);

            expect(mapCollection.getMapView("2D").getCenter()).to.deep.equals(coordinates);
        });
    });
});
