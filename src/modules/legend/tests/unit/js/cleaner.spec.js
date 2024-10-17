import {expect} from "chai";
import cleaner from "../../../js/cleaner";

describe("src/modules/legend/js/cleaner.js", function () {
    describe("cleanUpLegend", () => {
        it("should set legends.length to 1 if all legend URLs are equal", () => {
            const legends = [
                "https://example.com/legend1",
                "https://example.com/legend1",
                "https://example.com/legend1"
            ];

            cleaner.cleanUpLegend(legends);

            expect(legends).to.have.lengthOf(1);
            expect(legends[0]).to.equal("https://example.com/legend1");
        });
        it("should not modify legends if all URLs are not equal", () => {
            const legends = [
                "https://example.com/legend1",
                "https://example.com/legend2",
                "https://example.com/legend3"
            ];

            cleaner.cleanUpLegend(legends);

            expect(legends).to.have.lengthOf(3);
        });
        it("should set legends.length to 1 if all legend URLs are objects and are equal", () => {
            const legends = [
                {graphic: "https://example.com/legend1"},
                {graphic: "https://example.com/legend1"},
                {graphic: "https://example.com/legend1"}
            ];

            cleaner.cleanUpLegend(legends);

            expect(legends).to.have.lengthOf(1);
            expect(legends[0].graphic).to.equal("https://example.com/legend1");
        });
        it("should not modify legends if all URLs are objects are not equal", () => {
            const legends = [
                {graphic: "https://example.com/legend1"},
                {graphic: "https://example.com/legend2"},
                {graphic: "https://example.com/legend3"}
            ];

            cleaner.cleanUpLegend(legends);

            expect(legends).to.have.lengthOf(3);
        });

    });
});
