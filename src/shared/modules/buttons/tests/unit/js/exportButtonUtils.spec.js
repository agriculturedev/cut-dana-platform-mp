import {expect} from "chai";
import {
    createCsvBlob
} from "../../../js/exportButtonUtils.js";

describe("src/shared/modules/buttons/js/exportButtonUtils.js", () => {
    describe("createCsvBlob", () => {
        it("should create a blob object representing the given csv text", () => {
            const blob = createCsvBlob("csvText");

            expect(blob).to.be.an.instanceof(Blob);
            expect(blob.size).to.equal(10);
            expect(blob.type).to.equal("text/csv;charset=utf-8,%ef%bb%bf");
        });
    });
});
