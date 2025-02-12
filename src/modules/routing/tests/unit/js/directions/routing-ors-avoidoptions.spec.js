import store from "../../../../../../app-store";
import {expect} from "chai";
import routingOrsAvoidOption from "../../../../js/avoidoptions/routing-ors-avoidoptions";

describe("should routingOrsAvoidOptions", () => {
    it("should lowercase preferences from configJson", async () => {
        store.getters["Modules/Routing/directionsSettings"] = {
            customAvoidFeatures: {
                CYCLING: ["UNPAVEDROADS", "STEPS"]
            }
        };
        const result = routingOrsAvoidOption("UNPAVEDROADS", "CYCLING");

        expect(result).to.eql("unpavedroads");
    });
    it("should lowercase preferences without configJson", async () => {
        const result = routingOrsAvoidOption("STEPS", "CYCLING");

        expect(result).to.eql("steps");
    });
});
