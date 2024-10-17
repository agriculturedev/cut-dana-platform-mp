import {expect} from "chai";
import getPosition from "../../../utils/getPosition";

describe("src/shared/modules/layerSwiper/utils/getPosition.js", () => {
    const keyboardMovement = 5;
    let currentPos,
        event;

    beforeEach(() => {
        currentPos = 750;
        event = {clientX: "", clientY: "", type: "mousemove", key: ""};
    });

    it("should calculate and return the horizontal position according to the event type keydown", () => {
        event.type = "keydown";
        event.key = "ArrowLeft";

        expect(getPosition(event, currentPos, keyboardMovement, "horizontal")).to.eql(745);
    });

    it("should calculate and return the vertical position according to the event type keydown", () => {
        event.type = "keydown";
        event.key = "ArrowUp";

        expect(getPosition(event, currentPos, keyboardMovement, "vertical")).to.eql(745);
    });

    it("should calculate and return the horizontal position according to the event type mousemove", () => {
        event.clientX = 730;

        expect(getPosition(event, currentPos, keyboardMovement, "horizontal")).to.eql(730);
    });

    it("should calculate and return the vertical position according to the event type mousemove", () => {
        event.clientY = 730;

        expect(getPosition(event, currentPos, keyboardMovement, "vertical")).to.eql(730);
    });

    it("should return 0 if the new horizontal position would be further to the left than the window width", () => {
        event.clientX = -10;

        expect(getPosition(event, currentPos, keyboardMovement, "horizontal")).to.eql(0);
    });

    it("should return 0 if the new vertical position would be further to the top than the window height", () => {
        event.clientY = -10;

        expect(getPosition(event, currentPos, keyboardMovement, "vertical")).to.eql(0);
    });

    it("should return the inner width of the window if the new horizontal position would be further to the right than the window width", () => {
        event.clientX = 1200;

        expect(getPosition(event, currentPos, keyboardMovement, "horizontal")).to.eql(window.innerWidth);
    });

    it("should return the inner height of the window if the new vertical position would be further to the bottom than the window height", () => {
        event.clientY = 1200;

        expect(getPosition(event, currentPos, keyboardMovement, "vertical")).to.eql(window.innerHeight);
    });
});
