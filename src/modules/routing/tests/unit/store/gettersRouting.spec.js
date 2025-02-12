import {expect} from "chai";
import gettersRouting from "../../../store/gettersRouting";

describe("src/modules/routing/store/gettersRouting.js", () => {
    let state;

    describe("filteredRoutingToolOptions", () => {
        it("should return all routingToolOptions", () => {
            expect(gettersRouting.filteredRoutingToolOptions({routingToolOptions: []}).length).equal(2);
        });

        it("should return only one valid routingToolOptions", () => {
            expect(gettersRouting.filteredRoutingToolOptions({routingToolOptions: ["DIRECTIONS", "TEST"]}).length).equal(1);
        });
    });

    describe("urlParams", () => {
        beforeEach(() => {
            state = {
                activeRoutingToolOption: "DIRECTIONS",
                directionsSettings: {
                    speedProfile: "CAR",
                    preference: "RECOMMENDED"
                },
                isochronesSettings: {
                    speedProfile: "CAR",
                    isochronesMethodOption: "TIME",
                    distanceValue: 30,
                    intervalValue: 15,
                    timeValue: 30
                },
                Directions: {
                    mapInteractionMode: "AVOID_AREAS",
                    routingAvoidFeaturesOptions: []
                },
                Isochrones: {
                    routingAvoidFeaturesOptions: []
                }
            };
        });

        it("should return the routing params with attributes as a string", () => {
            const params = gettersRouting.urlParams(state);

            expect(params).to.equals("{\"activeRoutingToolOption\":\"DIRECTIONS\",\"directionsSettings\":{\"speedProfile\":\"CAR\",\"preference\":\"RECOMMENDED\"},\"isochronesSettings\":{\"speedProfile\":\"CAR\",\"isochronesMethodOption\":\"TIME\",\"distanceValue\":30,\"intervalValue\":15,\"timeValue\":30},\"Directions\":{\"mapInteractionMode\":\"AVOID_AREAS\",\"routingAvoidFeaturesOptions\":[]},\"Isochrones\":{\"routingAvoidFeaturesOptions\":[]}}");
        });
    });

});
