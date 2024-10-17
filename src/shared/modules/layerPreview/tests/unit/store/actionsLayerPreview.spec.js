import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../store/actionsLayerPreview";

const {initialize} = actions;

describe("src/modules/layerPreview/store/actionsLayerPreview", () => {
    let commit,
        getters,
        rootGetters,
        warnSpy;

    beforeEach(() => {
        warnSpy = sinon.spy();
        sinon.stub(console, "warn").callsFake(warnSpy);
        commit = sinon.spy();
        getters = {
            previewCenter: null,
            previewZoomLevel: null
        };
        rootGetters = {
            "Maps/initialCenter": null,
            "Maps/initialZoom": null
        };
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000, 500, 100, 50, 10]
                };
            }
        };

        mapCollection.addMap(map, "2D");
    });

    afterEach(sinon.restore);

    describe("initialize", () => {
        it("initializes with center given as array and getters and rootGetters return null", () => {
            const id = "id",
                center = [1, 1],
                zoomLevel = 5;

            initialize({commit, getters, rootGetters}, {id, center, zoomLevel});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreviewCenter");
            expect(commit.firstCall.args[1]).to.be.deep.equals({id, center});
            expect(commit.secondCall.args[0]).to.be.equals("setPreviewZoomLevel");
            expect(commit.secondCall.args[1]).to.be.deep.equals({id, zoomLevel});
        });

        it("initializes with center given as string and getters and rootGetters return null", () => {
            const id = "id",
                center = "1,1",
                zoomLevel = 5;

            initialize({commit, getters, rootGetters}, {id, center, zoomLevel});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreviewCenter");
            expect(commit.firstCall.args[1]).to.be.deep.equals({id, center: [1, 1]});
            expect(commit.secondCall.args[0]).to.be.equals("setPreviewZoomLevel");
            expect(commit.secondCall.args[1]).to.be.deep.equals({id, zoomLevel});
        });

        it("initializes with center and zoomLevel is null", () => {
            const id = "id",
                center = null,
                zoomLevel = null;

            rootGetters = {
                "Maps/initialCenter": [2, 2],
                "Maps/initialZoom": 4
            };

            initialize({commit, getters, rootGetters}, {id, center, zoomLevel});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreviewCenter");
            expect(commit.firstCall.args[1]).to.be.deep.equals({id, center: [2, 2]});
            expect(commit.secondCall.args[0]).to.be.equals("setPreviewZoomLevel");
            expect(commit.secondCall.args[1]).to.be.deep.equals({id, zoomLevel: 4});
        });

        it("initializes with unusable zoomlevel use initialZoom", () => {
            const id = "id",
                center = null,
                zoomLevel = 9;

            rootGetters = {
                "Maps/initialCenter": [2, 2],
                "Maps/initialZoom": 4
            };

            initialize({commit, getters, rootGetters}, {id, center, zoomLevel});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreviewCenter");
            expect(commit.firstCall.args[1]).to.be.deep.equals({id, center: [2, 2]});
            expect(commit.secondCall.args[0]).to.be.equals("setPreviewZoomLevel");
            expect(commit.secondCall.args[1]).to.be.deep.equals({id, zoomLevel: 4});
            expect(warnSpy.calledOnce).to.be.true;
        });
    });
});
