import {expect} from "chai";
import mutations from "../../../store/mutationsStartModule";

const {
    addConfiguredModel
} = mutations;


describe("src/modules/controls/startModule/store/mutationsStartModule.js", () => {
    describe("addConfiguredModel", () => {
        it("should add a module to the state attribute configuredModuleStates", () => {
            const state = {
                    configuredModuleStates: []
                },
                module = {
                    type: "abc"
                };

            addConfiguredModel(state, module);

            expect(state.configuredModuleStates).to.includes(module);
        });
    });
});
