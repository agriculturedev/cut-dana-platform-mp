import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";
import View from "ol/View";

import actions from "../../../store/actionsMapsInteractionsZoom";

const {
    decreaseZoom,
    increaseZoom,
    setZoom,
    zoomToCoordinates
} = actions;

describe("src/core/maps/store/actionsMapsInteractionsZoom.js", () => {
    let dispatch,
        map2d,
        setRotationSpy;

    beforeEach(() => {
        dispatch = sinon.spy();
        setRotationSpy = sinon.spy();

        mapCollection.clear();
        map2d = new Map({
            id: "ol",
            mode: "2D",
            view: new View({
                maxZoom: 10,
                minZoom: 2,
                zoom: 3
            })
        });

        map2d.getView().setRotation = setRotationSpy;
        mapCollection.addMap(map2d, "2D");
    });

    after(() => {
        sinon.restore();
    });

    describe("decreaseZoom", () => {
        it("should decrease zoom level by one", () => {
            decreaseZoom({dispatch});

            expect(dispatch.callCount).to.equals(1);
            expect(dispatch.firstCall.args).to.deep.equals(["setZoom", 2]);
        });
    });

    describe("increaseZoom", () => {
        it("should increase zoom level by one", () => {
            increaseZoom({dispatch});

            expect(dispatch.callCount).to.equals(1);
            expect(dispatch.firstCall.args).to.deep.equals(["setZoom", 4]);
        });
    });

    describe("setZoom", () => {
        it("should set the zoom level to the map view", () => {
            const view = map2d.getView();

            setZoom({}, 5);

            expect(dispatch.notCalled).to.be.true;
            expect(view.getZoom()).to.equals(5);
        });

        it("shouldn't set the zoom level to the map view, if the new zoom level exceeds maxZoom", () => {
            const view = map2d.getView();

            setZoom({}, 20);

            expect(dispatch.notCalled).to.be.true;
            expect(view.getZoom()).to.equals(3);
        });

        it("shouldn't set the zoom level to the map view, if the new zoom level below minZoom", () => {
            const view = map2d.getView();

            setZoom({}, 0);

            expect(dispatch.notCalled).to.be.true;
            expect(view.getZoom()).to.equals(3);
        });

        describe("zoomToExtent", () => {
            it("Zoom to the extent with duration 0 milliseconds", () => {
                const view = map2d.getView();

                actions.zoomToExtent({}, {
                    extent: [565760.049, 5931747.185, 568940.626, 5935453.891],
                    options: {duration: 0}
                });
                expect(view.getCenter()).to.deep.equal([567350.3375, 5933600.538]);
                expect(Math.round(view.getZoom())).equals(10);
            });
        });
    });

    describe("zoomToProjExtent", () => {
        let getters;

        beforeEach(() => {
            getters = {
                "Maps/projectionCode": "EPSG:25832"
            };
        });

        it("Zoom to the extent with projection EPSG:4326", () => {
            const zoomParams = {
                extent: ["10.0822", "53.6458", "10.1781", "53.8003"],
                projection: "EPSG:4326",
                options: {duration: 0}
            };

            sinon.stub(crs, "transformToMapProjection").returns([1, 2]);

            actions.zoomToProjExtent({dispatch, getters}, zoomParams);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("zoomToExtent");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                extent: [1, 2, 1, 2],
                options: {duration: 0}
            });
        });

        it("Zoom to the extent with projection EPSG: 25832", () => {
            const zoomParams = {
                extent: ["565760.049", "5931747.185", "568940.626", "5935453.891"],
                projection: "EPSG:25832",
                options: {duration: 0}
            };

            actions.zoomToProjExtent({dispatch, getters}, zoomParams);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("zoomToExtent");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                extent: [565760.049, 5931747.185, 568940.626, 5935453.891],
                options: {duration: 0}
            });
        });
    });

    describe("zoomToCoordinates", () => {
        it("should do nothing without center and zoom", () => {
            const center = undefined,
                zoom = undefined;

            zoomToCoordinates({dispatch}, {center, zoom});

            expect(dispatch.notCalled).to.be.true;
            expect(setRotationSpy.notCalled).to.be.true;
        });

        it("should only set center if zoom is undefined", () => {
            const center = [1, 2],
                zoom = undefined;

            zoomToCoordinates({dispatch}, {center, zoom});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("setCenter");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(center);
            expect(setRotationSpy.notCalled).to.be.true;
        });

        it("should only set zoom if center is undefined", () => {
            const center = undefined,
                zoom = 1;

            zoomToCoordinates({dispatch}, {center, zoom});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("setZoom");
            expect(dispatch.firstCall.args[1]).to.be.equals(zoom);
            expect(setRotationSpy.notCalled).to.be.true;
        });

        it("should set the zoom level to the map view", () => {
            const center = [1, 2],
                zoom = 10;

            zoomToCoordinates({dispatch}, {center, zoom});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("setCenter");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(center);
            expect(dispatch.secondCall.args[0]).to.equals("setZoom");
            expect(dispatch.secondCall.args[1]).to.be.equals(zoom);
            expect(setRotationSpy.notCalled).to.be.true;
        });

        it("should set the zoom level to the map view and rotate", () => {
            const center = [1, 2],
                zoom = 10,
                rotation = 1;

            zoomToCoordinates({dispatch}, {center, zoom, rotation});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("setCenter");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(center);
            expect(dispatch.secondCall.args[0]).to.equals("setZoom");
            expect(dispatch.secondCall.args[1]).to.be.equals(zoom);
            expect(setRotationSpy.calledOnce).to.be.true;
            expect(setRotationSpy.firstCall.args[0]).to.equals(rotation);
        });
    });

});
