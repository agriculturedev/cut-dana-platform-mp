import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../controls-store/actionsControls";

const {
    mergeControlState
} = actions;


describe("src/modules/controls/controls-store/actionsControls.js", () => {
    let commit;

    beforeEach(() => {
        commit = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("mergeControlState", () => {
        it("should commit values to control state", () => {
            const controlKey = "exampleControl",
                controlValues = {
                    icon: "example-icon",
                    abc: "test"
                };

            mergeControlState({commit}, {controlKey, controlValues});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("ExampleControl/setIcon");
            expect(commit.firstCall.args[1]).to.equals("example-icon");
            expect(commit.secondCall.args[0]).to.equals("ExampleControl/setAbc");
            expect(commit.secondCall.args[1]).to.equals("test");
        });
    });
});
