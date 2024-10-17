import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../store/actionsStyleVT";

describe("src/modules/styleVT/store/actionsStyleVT.js", () => {
    const layerOne = {
            id: "l1",
            name: "Layer One",
            typ: "VectorTile"
        },
        layerTwo = {
            id: "l2",
            name: "Layer Two",
            typ: "VectorTile"
        };
    let commit,
        state,
        rootGetters;

    beforeEach(() => {
        commit = sinon.spy();
        rootGetters = {
            visibleLayerConfigs: [layerOne, layerTwo]
        };
    });

    afterEach(sinon.restore);

    describe("refreshVectorTileLayerList", () => {
        beforeEach(() => {
            state = {
                layerModel: null
            };
        });

        it("should update the vectorTileLayerList and not update the currently selected layerModel", () => {
            actions.refreshVectorTileLayerList({state, commit, rootGetters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setVectorTileLayerList", [
                {
                    id: "l1",
                    name: "Layer One"
                },
                {
                    id: "l2",
                    name: "Layer Two"
                }
            ]]);
        });

        it("should remove invisible layers from the vectorTileLayerList", () => {
            const id = "l3";

            state.layerModel = {id, get: () => id};
            actions.refreshVectorTileLayerList({state, commit, rootGetters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setVectorTileLayerList", [
                {
                    id: "l1",
                    name: "Layer One"
                },
                {
                    id: "l2",
                    name: "Layer Two"
                }
            ]]);
            expect(commit.secondCall.args).to.eql(["setLayerModel", null]);
        });
    });
});

