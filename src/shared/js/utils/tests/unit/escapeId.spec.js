import {expect} from "chai";
import escapeId from "../../escapeId";

describe("src/utils/escapeId.js", () => {
    describe("escapeId", () => {
        it("should return a string no matter what no-string input is given", () => {
            expect(escapeId(undefined)).to.be.undefined;
            expect(escapeId(null)).to.be.null;
            expect(escapeId("1234-4")).to.be.equals("1234-4");
            expect(escapeId("1234.4")).to.be.equals("1234-4");
            expect(escapeId("1.2.3.4.")).to.be.equals("1-2-3-4-");

        });
    });
});
