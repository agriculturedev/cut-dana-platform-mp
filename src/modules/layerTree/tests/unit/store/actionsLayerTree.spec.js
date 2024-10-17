import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../store/actionsLayerTree";

const {removeLayer, updateTransparency, replaceByIdInLayerConfig} = actions;

describe("src/modules/layerTree/store/actionsLayerTree", function () {
    let dispatch;

    beforeEach(() => {
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("removeLayer", function () {
        it("removeLayer", function () {
            const layerConfig =
            {
                id: "1",
                visibility: true,
                showInLayerTree: true,
                attribute: "test"
            },
                expectedArg =
                    {
                        id: "1",
                        visibility: false,
                        showInLayerTree: false,
                        attribute: "test",
                        zIndex: null
                    };

            removeLayer({dispatch}, layerConfig);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(expectedArg);
            expect(dispatch.secondCall.args[0]).to.be.equals("updateAllZIndexes");
        });
    });

    describe("updateTransparency", function () {
        it("updateTransparency", function () {
            const layerConf =
                {
                    id: "1",
                    visibility: true,
                    showInLayerTree: true,
                    attribute: "test"
                },
                transparency = 50,
                expectedArg =
                {
                    id: "1",
                    visibility: true,
                    showInLayerTree: true,
                    attribute: "test",
                    transparency: transparency
                };

            updateTransparency({dispatch}, {layerConf, transparency});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(expectedArg);
        });
    });

    describe("replaceByIdInLayerConfig", function () {
        it("replaceByIdInLayerConfig", function () {
            const layerConf =
                {
                    id: "1",
                    visibility: true,
                    showInLayerTree: true,
                    attribute: "test"
                },
                expectedArg = {
                    layerConfigs: [
                        {
                            layer: layerConf,
                            id: "1"
                        }
                    ]};

            replaceByIdInLayerConfig({dispatch}, layerConf);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(expectedArg);
            expect(dispatch.firstCall.args[2]).to.be.deep.equals({root: true});
        });
    });
});
