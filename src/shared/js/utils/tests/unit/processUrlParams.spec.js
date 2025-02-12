import {expect} from "chai";
import sinon from "sinon";
import processUrlParams from "../../processUrlParams";
import store from "../../../../../app-store";

describe("src/shared/js/utils/processUrlParams.js", () => {
    let spyMenu;

    beforeEach(() => {
        spyMenu = sinon.spy();

        store.getters = {
            getUrlParamValue: () => "draw"
        };
    });

    it("should start the function of MENU param", () => {
        const params = {
                MENU: spyMenu
            },
            legacyParams = {};

        processUrlParams(params, legacyParams);

        expect(spyMenu.called).to.be.true;
        expect(spyMenu.firstCall.args[0]).to.deep.equals({MENU: "draw"});
    });
});
