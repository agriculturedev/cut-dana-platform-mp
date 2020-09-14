import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../actionsTools";
import sinon from "sinon";

const {
    controlActivationOfTools,
    setToolActive,
    languageChanged,
    addTool,
    activateByUrlParam,
    setToolActiveByConfig
} = actions;

describe("src/modules/tools/actionsTools.js", () => {
    describe("setToolActive", () => {
        const state = {
            ScaleSwitcher: {
                id: "scaleSwitcher"
            }
        };

        it("setToolActive set one tool to active", done => {
            const payload = {
                id: "scaleSwitcher",
                active: true
            };

            testAction(setToolActive, payload, state, {}, [
                {type: Object.keys(state)[0] + "/setActive", payload: payload.active, dispatch: true}
            ], {}, done);
        });
        it("setToolActive deactivate a tool", done => {
            const payload = {
                id: "scaleSwitcher",
                active: false
            };

            testAction(setToolActive, payload, state, {}, [
                {type: Object.keys(state)[0] + "/setActive", payload: payload.active, dispatch: true}
            ], {}, done);
        });
        it("setToolActive no tool is active by payload.id is not defined", done => {
            const payload = {
                id: "otherTool",
                active: true
            };

            testAction(setToolActive, payload, state, {}, [], {}, done);
        });
    });

    describe("languageChanged", () => {
        const state = {
            ScaleSwitcher: {
                id: "scaleSwitcher"
            }
        };

        it("languageChanged", done => {
            const payload = {
                id: "scaleSwitcher",
                name: "Scale switcher"
            };

            testAction(languageChanged, payload, state, {}, [
                {type: Object.keys(state)[0] + "/setName", payload: payload.name}
            ], {}, done);
        });
    });

    describe("addTool", () => {
        it("addTool", done => {
            const tool = {
                    default: {
                        name: "VueAddon"
                    }
                },
                state = {
                    componentMap: {
                        scaleSwitcher: sinon.stub()
                    }
                };

            testAction(addTool, tool, state, {}, [
                {type: "setComponentMap", payload: Object.assign(state.componentMap, {[tool.default.name]: tool.default})}
            ], {}, done);
        });
    });

    describe("controlActivationOfTools", () => {
        it("controlActivationOfTools activeTool = SupplyCoord", done => {
            const state = {
                    Draw: {
                        active: true
                    },
                    ScaleSwitcher: {
                        active: true
                    },
                    SupplyCoord: {
                        active: false
                    }
                },
                activeToolName = "SupplyCoord";

            testAction(controlActivationOfTools, activeToolName, state, {}, [
                {type: "Draw/setActive", payload: false},
                {type: "ScaleSwitcher/setActive", payload: false},
                {type: "SupplyCoord/setActive", payload: true}
            ], {
                getConfiguredToolNames: ["Draw", "ScaleSwitcher", "SupplyCoord"],
                getActiveToolNames: ["Draw", "ScaleSwitcher"]
            }, done);
        });
    });

    describe("activateByUrlParam", () => {
        it("activateByUrlParam  isinitopen=scaleSwitcher", done => {
            const rootState = {
                    queryParams: {
                        "isinitopen": "scaleSwitcher"
                    }
                },
                toolName = "ScaleSwitcher";

            testAction(activateByUrlParam, toolName, {}, rootState, [
                {type: "controlActivationOfTools", payload: toolName, dispatch: true}
            ], {}, done);
        });
        it("activateByUrlParam no isinitopen", done => {
            const rootState = {
                    queryParams: {
                    }
                },
                toolName = "ScaleSwitcher";

            testAction(activateByUrlParam, toolName, {}, rootState, [], {}, done);
        });
    });

    describe("setToolActiveByConfig", () => {
        it("activate a tool with active = true", done => {
            const state = {
                ScaleSwitcher: {
                    active: true
                }
            };

            testAction(setToolActiveByConfig, {}, state, {}, [
                {type: "controlActivationOfTools", payload: "ScaleSwitcher", dispatch: true}
            ], {
                getActiveToolNames: ["ScaleSwitcher"]
            }, done);

        });
        it("activate only the first tool with active = true", done => {
            const state = {
                SupplyCoord: {
                    active: true
                },
                ScaleSwitcher: {
                    active: true
                },
                FileImport: {
                    active: true
                }
            };

            testAction(setToolActiveByConfig, {}, state, {}, [
                {type: "controlActivationOfTools", payload: "SupplyCoord", dispatch: true}
            ], {
                getActiveToolNames: ["SupplyCoord", "ScaleSwitcher", "FileImport"]
            }, done);
        });
    });
});
