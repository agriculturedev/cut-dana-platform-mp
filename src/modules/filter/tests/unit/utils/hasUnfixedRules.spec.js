import {expect} from "chai";
import {hasUnfixedRules} from "../../../utils/hasUnfixedRules.js";
import {isRule} from "../../../utils/isRule.js";
import sinon from "sinon";

describe("hasUnfixedRules", () => {
    it("should return false if anything but an array is given", () => {
        expect(hasUnfixedRules(undefined)).to.be.false;
        expect(hasUnfixedRules(null)).to.be.false;
        expect(hasUnfixedRules({})).to.be.false;
        expect(hasUnfixedRules(1234)).to.be.false;
        expect(hasUnfixedRules("1234")).to.be.false;
        expect(hasUnfixedRules(true)).to.be.false;
        expect(hasUnfixedRules(false)).to.be.false;
    });
    it("should return false if there are no rules with fixed=false", () => {
        const rules = {
            snippetId: 1,
            startup: false,
            fixed: true,
            attrName: "test",
            operator: "EQ"
        };

        expect(hasUnfixedRules(rules)).to.be.false;
    });
    it("should return true if there are rules with fixed=false in the rules", () => {
        const rules = [
            {
                snippetId: 1,
                startup: false,
                fixed: true,
                attrName: "test",
                operator: "EQ"
            },
            {
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            }
        ];

        sinon.stub(isRule);
        expect(hasUnfixedRules(rules)).to.be.true;
        sinon.restore();
    });
});
