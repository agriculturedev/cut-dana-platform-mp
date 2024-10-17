import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsLayerClusterToggler";

describe("src/modules/layerClusterToggler/store/actionsLayerClusterToggler.js", () => {
    let commit,
        dispatch;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("toggleLayerVisibility", () => {
        it("should toggle the visibility of the layers from layerIdList to true", () => {
            const state = {
                isToggled: true,
                layerIdList: [
                    "123",
                    "abc.1",
                    "abc.2"
                ]
            };

            actions.toggleLayerVisibility({commit, dispatch, state});

            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerConfigs: [{
                    id: "123",
                    layer: {
                        visibility: state.isToggled
                    }
                }]
            });
            expect(dispatch.secondCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.secondCall.args[1]).to.deep.equals({
                layerConfigs: [{
                    id: "abc.1",
                    layer: {
                        visibility: state.isToggled
                    }
                }]
            });
            expect(dispatch.thirdCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.thirdCall.args[1]).to.deep.equals({
                layerConfigs: [{
                    id: "abc.2",
                    layer: {
                        visibility: state.isToggled
                    }
                }]
            });
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setIsToggled");
            expect(commit.firstCall.args[1]).to.be.false;
        });
    });
});
