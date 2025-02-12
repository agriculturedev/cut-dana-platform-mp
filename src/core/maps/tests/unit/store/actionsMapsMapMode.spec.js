import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";
import View from "ol/View";

import actions from "../../../store/actionsMapsMapMode";

const {
    changeMapMode,
    activateMap2d,
    activateMap3d
} = actions;

describe("src/core/maps/store/actionsMapsMapMode.js", () => {
    let commit,
        dispatch,
        getters,
        map2d,
        map3d,
        rootState,
        setEnabled3DSpy;

    beforeEach(() => {
        setEnabled3DSpy = sinon.spy();
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
        rootState = {
            portalConfig: {
                map: {}
            }
        };

        mapCollection.clear();
        map2d = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });

        map3d = {
            id: "olcs",
            mode: "3D",
            setEnabled: setEnabled3DSpy
        };

        mapCollection.addMap(map2d, "2D");
        mapCollection.addMap(map3d, "3D");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("changeMapMode", () => {
        it("Should dispatch activateMap3d, if change from 2D to 3D map mode", () => {
            const targetMode = "3D";

            getters = {
                mode: "2D"
            };

            changeMapMode({dispatch, getters}, targetMode);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.deep.equals(["unregisterMapListener"]);
            expect(dispatch.secondCall.args).to.deep.equals(["activateMap3d"]);
        });

        it("Should dispatch activateMap2d, if change from 3D to 2D map mode", () => {
            const targetMode = "2D";

            getters = {
                mode: "3D"
            };

            changeMapMode({dispatch, getters}, targetMode);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.deep.equals(["registerMapListener"]);
            expect(dispatch.secondCall.args).to.deep.equals(["activateMap2d"]);
        });

        it("Should dispatch do not called, if the current and target map mode are the same", () => {
            const targetMode = "2D";

            getters = {
                mode: "2D"
            };
            changeMapMode({dispatch, getters}, targetMode);
            expect(dispatch.notCalled).to.be.true;
        });
    });

    describe("activateMap2d", () => {
        it("should trigger mapView animation", () => {
            activateMap2d({commit});
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.deep.equals(["setMode", "2D"]);
            expect(setEnabled3DSpy.calledOnce).to.be.true;
        });
    });

    describe("activateMap3d", () => {
        it("should commit 3D to mode", ()=> {
            activateMap3d({commit, rootState});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.deep.equals(["setMode", "3D"]);
        });

        it("should not commit 3D to mode, if map3d doesn't exist", () => {
            mapCollection.clear();
            activateMap3d({commit, rootState});

            expect(commit.notCalled).to.be.true;
            expect(rootState.portalConfig.map.startingMapMode).to.equals("3D");
        });
    });
});
