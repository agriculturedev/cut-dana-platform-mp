import {expect} from "chai";
import changeCase from "../../changeCase";

describe("src/shared/js/utils/changeCase.js", () => {
    describe("upperFirst", () => {
        it("should reply to anything but a string with an empty string", () => {
            expect(changeCase.upperFirst(undefined)).to.be.a("string").and.to.be.empty;
            expect(changeCase.upperFirst(null)).to.be.a("string").and.to.be.empty;
            expect(changeCase.upperFirst(1234)).to.be.a("string").and.to.be.empty;
            expect(changeCase.upperFirst(false)).to.be.a("string").and.to.be.empty;
            expect(changeCase.upperFirst(true)).to.be.a("string").and.to.be.empty;
            expect(changeCase.upperFirst({})).to.be.a("string").and.to.be.empty;
            expect(changeCase.upperFirst([])).to.be.a("string").and.to.be.empty;
        });
        it("should upper the first char of the given string", () => {
            expect(changeCase.upperFirst("upperFirst")).to.equal("UpperFirst");
        });
    });

    describe("upperCaseKeys", () => {
        it("should return an object whose keys are in capital letters ", () => {
            const obj = {
                abc: "abc",
                Def: "def",
                xYZ: "xyz"
            };

            expect(changeCase.upperCaseKeys(obj)).to.be.an("object").to.deep.equals({
                ABC: "abc",
                DEF: "def",
                XYZ: "xyz"
            });
        });
    });
});
