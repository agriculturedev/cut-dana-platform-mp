import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsBaselayerSwitcher";
import baselayerHandler from "../../../../layerSelection/js/handleSingleBaselayer";


describe("baselayerSwitcher/store/actionsBaselayerSwitcher", () => {

    let layerConfigs,
        dispatch,
        rootGetters,
        baselayerHandlerSpy;

    beforeEach(() => {

        layerConfigs = [
            {id: "453", visibility: true, baselayer: true, showInLayerTree: true, zIndex: 1}
        ];

        dispatch = sinon.spy();
        rootGetters = {
            layerConfigsByAttributes: () => layerConfigs,
            determineZIndex: () => layerConfigs[0].zIndex,
            isBaselayer: () => layerConfigs[0].baselayer
        };
        baselayerHandlerSpy = sinon.spy(baselayerHandler, "checkAndAdd");
    });


    it("updateLayerVisibilityAndZIndex", () => {
        const layerId = "453";

        rootGetters.singleBaselayer = false;
        rootGetters.visibleBaselayerConfigs = [];

        actions.updateLayerVisibilityAndZIndex({dispatch, rootGetters}, layerId);

        expect(baselayerHandlerSpy.calledOnce).to.be.true;
        expect(baselayerHandlerSpy.firstCall.args[0]).to.be.equals(false);
        expect(baselayerHandlerSpy.firstCall.args[1]).to.be.deep.equals([]);
        expect(baselayerHandlerSpy.firstCall.args[2]).to.be.deep.equals([
            {id: "453", layer: {id: "453", visibility: true, showInLayerTree: true, zIndex: 2}}
        ]);
        expect(dispatch.calledTwice).to.be.true;
        expect(dispatch.firstCall.args[0]).to.equal("updateLayerConfigZIndex");
        expect(dispatch.secondCall.args[0]).to.equal("replaceByIdInLayerConfig");
        expect(dispatch.firstCall.args[1].layerContainer[0].zIndex).to.equal(1);
        expect(dispatch.secondCall.args[1].layerConfigs).to.deep.equal([{id: "453", layer: {id: "453", visibility: true, showInLayerTree: true, zIndex: 2}}]);

    });
});
