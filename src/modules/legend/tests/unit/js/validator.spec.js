import {expect} from "chai";
import validator from "../../../js/validator";

describe("src/modules/legend/js/validator.js", function () {
    describe("isValidLegendObj", () => {
        it("returns false if legend is false", () => {
            const legendObj = {
                id: "1",
                name: "layer_1",
                legend: false,
                position: 1
            };


            expect(validator.isValidLegendObj(legendObj)).to.be.equals(false);
        });
        it("returns false if legend is true", () => {
            const legendObj = {
                id: "1",
                name: "layer_1",
                legend: true,
                position: 1
            };


            expect(validator.isValidLegendObj(legendObj)).to.be.equals(false);
        });
        it("returns false if legend is undefined", () => {
            const legendObj = {
                id: "1",
                name: "layer_1",
                position: 1
            };


            expect(validator.isValidLegendObj(legendObj)).to.be.equals(false);
        });
        it("returns false if legend is empty array", () => {
            const legendObj = {
                id: "1",
                name: "layer_1",
                legend: [],
                position: 1
            };


            expect(validator.isValidLegendObj(legendObj)).to.be.equals(false);
        });
        it("returns true if position is positive and legend is string or not empty array", () => {
            const legendObj = {
                id: "1",
                name: "layer_1",
                legend: ["link_to_legend"],
                position: 1
            };


            expect(validator.isValidLegendObj(legendObj)).to.be.equals(true);
        });
    });
});
