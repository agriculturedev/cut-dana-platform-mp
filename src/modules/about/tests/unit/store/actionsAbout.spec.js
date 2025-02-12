import testAction from "../../../../../../devtools/tests/VueTestUtils";
import getCswRecordById from "../../../../../shared/js/api/getCswRecordById";
import sinon from "sinon";
import actions from "../../../store/actionsAbout";
import packageJson from "../../../../../../package.json";

const {initializeAboutInfo, currentMasterportalVersionNumber} = actions;

describe("src/modules/layerInformation/store/actionsAbout.js", () => {
    describe("initialize the store", () => {
        it("should show the about module in menu", done => {
            const state = {
                    metaId: "portalId",
                    cswUrl: "test.de"
                },
                rootGetters = {
                    isMobile: false,
                    "Menu/expanded": () => true
                },
                cswReturn = {
                    getTitle: () => "name",
                    getAbstract: () => "abstract",
                    getContact: () => "contact"
                };

            sinon.stub(getCswRecordById, "getRecordById").returns(cswReturn);

            testAction(initializeAboutInfo, {}, state, {}, [
                {type: "setTitle", payload: "name"},
                {type: "setAbstractText", payload: "abstract", commit: true},
                {type: "setContact", payload: "contact", commit: true},
                {type: "currentMasterportalVersionNumber", payload: undefined, dispatch: true}
            ], {}, done, rootGetters);
        });

        it("should set the masterportal version from state, if version is a string", done => {
            const state = {
                version: "3.4.0"
            };

            testAction(currentMasterportalVersionNumber, {}, state, {}, [
                {type: "setVersion", payload: "3.4.0", commit: true}
            ], {}, done, {});
        });

        it("should set the masterportal version from package.json, if version is true", done => {
            const state = {
                version: true
            };

            testAction(currentMasterportalVersionNumber, {}, state, {}, [
                {type: "setVersion", payload: packageJson.version, commit: true}
            ], {}, done, {});
        });
    });
});
