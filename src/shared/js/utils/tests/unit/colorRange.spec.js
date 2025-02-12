import {expect} from "chai";
import {generateColorRange, getLighterShade, normalizeValues, assignColors} from "../../colorRange.js";

describe("src/shared/js/utils/colorRange.js", () => {
    it("should not generate a range of colors if the starting color is not a hex value", () => {
        expect(generateColorRange("abc")).to.equal(false);
        expect(generateColorRange(1234)).to.equal(false);
        expect(generateColorRange([123, 244, 200])).to.equal(false);
    });

    it("should generate a range of 5 colors starting from #f50000", () => {
        expect(generateColorRange("#f50000")).to.be.an("array");
        expect(generateColorRange("#f50000").length).to.equal(5);
        expect(generateColorRange("#f50000")).to.deep.equal(["#f50000", "#c4f500", "#00f562", "#0062f5", "#c400f5"]);
    });

    it("should not generate a lighter shade if starting color is not a hex value", () => {
        expect(getLighterShade("5000", 0.9852492836509342)).to.equal(false);
        expect(getLighterShade([123, 233, 134], 0.9852492836509342)).to.equal(false);
    });

    it("should generate a lighter shade of #f50000", () => {
        expect(getLighterShade("#f50000", 0.9852492836509342)).to.be.an("string");
        expect(getLighterShade("#f50000", 0.9852492836509342)).to.equal("#fefbfb");
    });

    it("should not generate an array with normalized values if the input values are not numbers", () => {
        expect(normalizeValues(["6", "7", "8", "9", "10", "13"])).to.equal(false);
    });

    it("should generate an array with normalized values", () => {
        expect(normalizeValues([6, 7, 8, 9, 10, 13])).to.be.an("array");
        expect(normalizeValues([6, 7, 8, 9, 10, 13])).to.deep.equal([0, 0.14285714285714285, 0.2857142857142857, 0.42857142857142855, 0.5714285714285714, 1]);
    });

    it("should not generate an array with colors if the start color is not a hex value", () => {
        expect(assignColors([6, 7, 8, 9, 10, 13], "5000")).to.equal(false);
        expect(assignColors([6, 7, 8, 9, 10, 13], [123, 234, 211])).to.equal(false);
    });

    it("should generate an array with colors ranging from #f50000 to a lighter shade", () => {
        expect(assignColors([6, 7, 8, 9, 10, 13], "#f50000")).to.be.an("array");
        expect(assignColors([6, 7, 8, 9, 10, 13], "#f50000")).to.deep.equal(["#ffffff", "#fddada", "#fcb6b6", "#fa9191", "#f96d6d", "#f50000"]);
    });
});

