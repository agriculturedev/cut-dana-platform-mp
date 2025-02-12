import {expect} from "chai";
import mutations from "../../../store/mutationsRouting";

const {updateStateFromUrlParams} = mutations;

describe("src/modules/routing/store/mutationsRouting", () => {
    describe("updateStateFromUrlParams", () => {
        it("should overwrite params in the state", () => {
            const params = {
                    activeRoutingToolOption: "DIRECTIONS",
                    directionsSettings: {
                        speedProfile: "FOOT",
                        preference: "RECOMMENDED"
                    },
                    isochronesSettings: {
                        speedProfile: "WHEELCHAIR",
                        isochronesMethodOption: "TIME",
                        distanceValue: 115,
                        intervalValue: 10,
                        timeValue: 65
                    },
                    Directions: {
                        mapInteractionMode: "AVOID_AREAS",
                        routingAvoidFeaturesOptions: []
                    },
                    Isochrones: {
                        routingAvoidFeaturesOptions: []
                    }
                },
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

            updateStateFromUrlParams(state, params);

            expect(state).to.deep.equals(params);
        });
    });
});
