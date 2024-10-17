import degreesToRadians from "../../../../../../shared/js/utils/degreesToRadians";
import actions from "../../../store/actionsRotation";
import Map from "ol/Map";
import sinon from "sinon";
import {expect} from "chai";

describe("src/modules/controls/rotation/store/actionsRotation.js", () => {
    let commit, dispatch, getters;

    beforeEach(() => {
        const map2d = new Map(),
            map3d = {
                id: "olcs",
                mode: "3D"
            };

        mapCollection.clear();
        mapCollection.addMap(map2d, "2D");
        mapCollection.addMap(map3d, "3D");
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("actionsRotation", () => {

        describe("move2d", () => {
            it("move2d to north", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_north"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0], center[1] + distance]);
            });

            it("move2d to south", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_south"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0], center[1] - distance]);
            });

            it("move2d to east", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_east"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0] + distance, center[1]]);
            });
            it("move2d to west", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_west"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0] - distance, center[1]]);
            });
            it("move2d currentTarget id wrong, expect console warn", () => {
                const warn = sinon.spy(),
                    center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "wrong"
                        }
                    };

                sinon.stub(console, "warn").callsFake(warn);
                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.notCalled).to.be.true;
                expect(warn.calledOnce).to.be.true;
            });
        });
        describe("rotateClockwise", () => {
            it("rotateClockwise by rotationAngle", () => {
                const animationSpy = sinon.spy();

                mapCollection.getMapView("2D").animate = animationSpy;
                getters.rotation = 0;
                getters.rotationAngle = 90;
                mapCollection.getMapView("2D").setRotation(0);
                actions.rotateClockwise({commit, getters});
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("setRotation");
                expect(commit.firstCall.args[1]).to.equal(degreesToRadians(90));
                expect(animationSpy.calledOnce).to.be.true;
                expect(animationSpy.firstCall.args[0]).to.deep.equal({rotation: degreesToRadians(90)});
            });
            it("rotateClockwise set rotation to 0 if near north", () => {
                const animationSpy = sinon.spy();

                mapCollection.getMapView("2D").animate = animationSpy;
                getters.rotation = degreesToRadians(-45);
                getters.rotationAngle = 43;
                mapCollection.getMapView("2D").setRotation(degreesToRadians(-45));
                actions.rotateClockwise({commit, getters});
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("setRotation");
                expect(commit.firstCall.args[1]).to.equal(0);
                expect(animationSpy.calledOnce).to.be.true;
                expect(animationSpy.firstCall.args[0]).to.deep.equal({rotation: 0});
            });
        });

        describe("rotateCounterClockwise", () => {
            it("rotateCounterClockwise by rotationAngle", () => {
                const animationSpy = sinon.spy();

                mapCollection.getMapView("2D").animate = animationSpy;
                getters.rotation = 0;
                getters.rotationAngle = 22.5;
                mapCollection.getMapView("2D").setRotation(0);
                actions.rotateCounterClockwise({commit, getters});
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("setRotation");
                expect(commit.firstCall.args[1]).to.equal(degreesToRadians(-22.5));
                expect(animationSpy.calledOnce).to.be.true;
                expect(animationSpy.firstCall.args[0]).to.deep.equal({rotation: degreesToRadians(-22.5)});
            });
            it("rotateCounterClockwise set rotation to 0 if near north", () => {
                const animationSpy = sinon.spy();

                mapCollection.getMapView("2D").animate = animationSpy;
                getters.rotation = degreesToRadians(45);
                getters.rotationAngle = 42;
                mapCollection.getMapView("2D").setRotation(degreesToRadians(45));
                actions.rotateCounterClockwise({commit, getters});
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("setRotation");
                expect(commit.firstCall.args[1]).to.equal(0);
                expect(animationSpy.calledOnce).to.be.true;
                expect(animationSpy.firstCall.args[0]).to.deep.equal({rotation: 0});
            });
        });

    });
});

