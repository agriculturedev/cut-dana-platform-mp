import {expect} from "chai";
import getters from "../../../store/gettersLayerClusterToggler";
import state from "../../../store/stateLayerClusterToggler";

describe("src/modules/layerClusterToggler/store/gettersLayerClusterToggler.js", () => {
    describe("layerNames", () => {
        it("should return an array with the layer names", () => {
            const localState = {
                    layerIdList: [
                        "123",
                        "111.222"
                    ]
                },
                rootGetters = {
                    layerConfigById: (id) => {
                        return id === "123" ? {name: "first name"} : {name: "last name"};
                    }
                };

            expect(getters.layerNames(localState, null, null, rootGetters)).to.deep.equals([
                "first name",
                "last name"
            ]);
            expect(getters.layerNames(state, null, null, rootGetters)).to.be.an("array").that.is.empty;
        });
    });
});
