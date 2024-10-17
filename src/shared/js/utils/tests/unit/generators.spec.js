import {expect} from "chai";
import {generateSimpleGetters, generateSimpleMutations} from "../../generators";

describe("src/shared/js/utils/generators.js", () => {
    describe("generateSimpleGetters", () => {
        it("should generate two simple getters as functions", () => {
            const state = {
                    abc: 123,
                    coordinates: [0, 10]
                },
                simpleGetters = generateSimpleGetters(state);

            expect(typeof simpleGetters.abc).equals("function");
            expect(typeof simpleGetters.coordinates).equals("function");
        });
    });

    describe("generateSimpleMutations", () => {
        it("should generate two simple mutations as functions", () => {
            const state = {
                    abc: 123,
                    coordinates: [0, 10]
                },
                simpleMutations = generateSimpleMutations(state);

            expect(typeof simpleMutations.setAbc).equals("function");
            expect(typeof simpleMutations.setCoordinates).equals("function");
        });
    });
});
