import {expect} from "chai";
import mutations from "../../../controls-store/mutationsControls";

const {registerControl} = mutations;

describe("src/modules/controls/controls-store/mutationsControls.js", () => {
    describe("registerControl", () => {
        it("add control to state", () => {
            const state = {
                    addonControls: []
                },
                control = {
                    name: "name",
                    template: "<span />"
                };

            registerControl(state, {name: "name", control});

            expect(Object.keys(state.addonControls).length).to.equals(1);
            expect(state.addonControls.Name).to.deep.equals(control);
        });
    });
});
