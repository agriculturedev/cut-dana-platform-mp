import {expect} from "chai";
import getters from "../../../store/gettersSelectFeatures";
import stateSelectFeatures from "../../../store/stateSelectFeatures";


const {
    type,
    name,
    icon} = getters;

describe("src/modules/selectFeatures/store/gettersSelectFeatures", function () {
    it("returns the type from state", function () {
        expect(type(stateSelectFeatures)).to.equals("selectFeatures");
    });

    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(stateSelectFeatures)).to.be.equals("common:modules.selectFeatures.name");
        });
        it("returns the icon default value from state", function () {
            expect(icon(stateSelectFeatures)).to.equals("bi-hand-index");
        });
    });
});
