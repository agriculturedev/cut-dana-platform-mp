import testAction from "../../../../../../devtools/tests/VueTestUtils";
import getCswRecordById from "../../../../../shared/js/api/getCswRecordById";
import sinon from "sinon";
import actions from "../../../store/actionsAbout";

const {initializeAboutInfo} = actions;

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
                {type: "setVersion", payload: undefined, commit: true}
            ], {}, done, rootGetters);
        });


    });
});
