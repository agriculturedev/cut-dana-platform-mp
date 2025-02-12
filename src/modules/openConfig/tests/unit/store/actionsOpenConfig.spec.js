import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsOpenConfig";
import layerCollection from "../../../../../core/layers/js/layerCollection";
import {treeTopicConfigKey, treeBaselayersKey, treeSubjectsKey} from "../../../../../shared/js/utils/constants";

const {
    processConfigJsonOnload
} = actions;


describe("src/modules/openConfig/store/actionsOpenConfig.js", () => {
    let clearSpy,
        commit,
        dispatch,
        map;

    beforeEach(() => {
        mapCollection.clear();

        commit = sinon.spy();
        dispatch = sinon.spy();
        clearSpy = sinon.spy(layerCollection, "clear");

        map = {
            id: "ol",
            mode: "2D",
            removeLayer: () => sinon.spy()
        };

        mapCollection.addMap(map, "2D");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("processConfigJsonOnload", () => {
        it("should clear layerCollection, set portalConfig to the state and start extendLayers", () => {
            const event = {
                target: {
                    result: "{\r\n  \"portalConfig\": {},\r\n  \"" + treeTopicConfigKey + "\": {}\r\n}\r\n"
                }
            };

            processConfigJsonOnload({commit, dispatch}, event);

            expect(clearSpy.calledOnce).to.be.true;

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setPortalConfig");
            expect(commit.firstCall.args[1]).to.deep.equals({});

            // expect(commit.secondCall.args[0]).to.equals("setLayerConfigByParentKey");
            // expect(commit.secondCall.args[1]).to.deep.equals({});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("extendLayers");
            expect(dispatch.firstCall.args[1]).to.equals(null);
        });

        it("should clear layerCollection, set portalConfig, set Layerconfig to the state and start extendLayers", () => {
            const event = {
                target: {
                    result: "{\r\n  \"portalConfig\": {\r\n    \"mainMenu\": {\r\n      \"sections\": [\r\n        [\r\n          {\r\n            \"type\": \"openConfig\"\r\n          }\r\n        ]\r\n      ]\r\n    },\r\n    \"secondaryMenu\": {\r\n      \"expanded\": false,\r\n      \"sections\": [\r\n        [\r\n          {\r\n            \"type\": \"shareView\"\r\n          }\r\n        ]\r\n      ]\r\n    }\r\n  },\r\n  \"" + treeTopicConfigKey + "\": {\r\n    \"" + treeBaselayersKey + "\": {\r\n      \"elements\": [\r\n          {\r\n              \"id\": \"453\",\r\n              \"name\": \"Geobasiskarten (HamburgDE)\",\r\n              \"typ\": \"WMS\",\r\n              \"visibility\": true\r\n          }\r\n      ]\r\n    },\r\n    \"" + treeSubjectsKey + "\": {\r\n      \"elements\": [\r\n        {\r\n          \"id\": \"10220\",\r\n          \"name\": \"Dauerzählstellen (Rad) Hamburg\",\r\n          \"typ\": \"WMS\",\r\n          \"visibility\": true\r\n        },\r\n        {\r\n          \"id\": \"2426\",\r\n          \"name\": \"Bezirke\",\r\n          \"typ\": \"WMS\",\r\n          \"visibility\": true\r\n        }\r\n      ]\r\n    }\r\n  }\r\n}\r\n"
                }
            };

            processConfigJsonOnload({commit, dispatch}, event);

            expect(clearSpy.calledOnce).to.be.true;

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setPortalConfig");
            expect(commit.firstCall.args[1]).to.deep.equals({
                "mainMenu": {
                    "sections": [
                        [
                            {
                                "type": "openConfig"
                            }
                        ]
                    ]
                },
                "secondaryMenu": {
                    "expanded": false,
                    "sections": [
                        [
                            {
                                "type": "shareView"
                            }
                        ]
                    ]
                }
            });
            expect(commit.secondCall.args[0]).to.equals("setLayerConfigByParentKey");
            expect(commit.secondCall.args[1]).to.deep.equals({
                layerConfigs: {
                    "elements": [
                        {
                            "id": "453",
                            "name": "Geobasiskarten (HamburgDE)",
                            "typ": "WMS",
                            "visibility": true
                        }
                    ]
                },
                parentKey: treeBaselayersKey
            });
            expect(commit.thirdCall.args[0]).to.equals("setLayerConfigByParentKey");
            expect(commit.thirdCall.args[1]).to.deep.equals({
                layerConfigs: {
                    "elements": [
                        {
                            "id": "10220",
                            "name": "Dauerzählstellen (Rad) Hamburg",
                            "typ": "WMS",
                            "visibility": true
                        },
                        {
                            "id": "2426",
                            "name": "Bezirke",
                            "typ": "WMS",
                            "visibility": true
                        }
                    ]
                },
                parentKey: treeSubjectsKey
            });

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("extendLayers");
            expect(dispatch.firstCall.args[1]).to.equals(null);
        });
    });
});
