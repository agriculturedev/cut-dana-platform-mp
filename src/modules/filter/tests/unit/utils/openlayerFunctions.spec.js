import {expect} from "chai";
import store from "../../../../../app-store";
import sinon from "sinon";
import openlayerFunctions from "../../../utils/openlayerFunctions";

describe("src/modules/filter/utils/openlayerFunctions.js", () => {
    describe("setParserAttributeByLayerId", () => {
        let stub = null;

        beforeEach(() => {
            stub = sinon.stub();
            store.dispatch = stub;
        });

        afterEach(() => {
            sinon.restore();
        });

        it("should do nothing if no layer with given id is found", () => {

            store.getters = {
                layerConfigById: () => null
            };

            openlayerFunctions.setParserAttributeByLayerId("filterId");
            expect(stub.called).to.be.false;
        });
        it("should call expected action", () => {
            store.getters = {
                layerConfigById: () => {
                    return {
                        "id": "filterId",
                        "type": "layer",
                        "showInLayerTree": false,
                        "visibility": true
                    };
                }
            };
            openlayerFunctions.setParserAttributeByLayerId("filterId");
            expect(stub.called).to.be.true;
        });
        it("should call expected action with expected result", () => {
            const lightModel = {
                    "id": "filterId",
                    "type": "layer",
                    "showInLayerTree": false,
                    "visibility": true
                },
                expectedModel = {
                    "id": "filterId",
                    "type": "layer",
                    "showInLayerTree": false,
                    "visibility": true,
                    "foo": "bar"
                },
                expected = {
                    layerConfigs: [{
                        id: "filterId",
                        layer: expectedModel
                    }]
                };

            store.getters = {
                layerConfigById: () => lightModel
            };
            openlayerFunctions.setParserAttributeByLayerId("filterId", "foo", "bar");
            expect(stub.calledWith("replaceByIdInLayerConfig", expected)).to.be.true;
        });
    });
});
