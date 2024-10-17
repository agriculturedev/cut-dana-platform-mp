import {expect} from "chai";
import degreesToRadians from "../../degreesToRadians";

describe("src/utils/degreesToRadians.js", () => {
    describe("degreesToRadians", () => {
        it("degreesToRadians", () => {
            expect(degreesToRadians(0)).to.eql(0);
            expect(degreesToRadians(180)).to.eql(Math.PI);
            expect(degreesToRadians(360)).to.eql(2 * Math.PI);
            expect(degreesToRadians(90)).to.eql(Math.PI / 2);

            expect(degreesToRadians(-180)).to.eql(-Math.PI);
            expect(degreesToRadians(-360)).to.eql(-2 * Math.PI);
            expect(degreesToRadians(-90)).to.eql(Math.PI / -2);
        });
    });
});
