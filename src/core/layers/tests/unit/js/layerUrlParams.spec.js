import layerUrlParams from "../../../js/layerUrlParams";
import store from "../../../../../app-store";
import {expect} from "chai";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import sinon from "sinon";

describe("src/core/layers/js/layerUrlParams.js", () => {
    let dispatchCalls = [],
        zIndex;

    beforeEach(() => {
        zIndex = 1;
        dispatchCalls = [];

        store.dispatch = (actionName, payload) => {
            return new Promise((resolve) => {
                const dispatchCall = {};

                dispatchCall[actionName] = payload !== undefined ? payload : "called";
                dispatchCalls.push(dispatchCall);
                resolve(true);
            });
        };

        store.getters = {
            layerConfigsByAttributes: () => {
                return [];
            },
            layerConfigById: () => true
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("setLayers", () =>{
        it("should replace the layers from the params", () => {
            const params = {
                LAYERS: "[{\"id\": \"2426\"},{\"id\":\"1711\",\"visibility\":false},{\"id\":\"452\",\"visibility\":true,\"transparency\":50}]"
            };

            layerUrlParams.setLayers(params);

            expect(dispatchCalls.length).to.equals(3);
            expect(dispatchCalls[0].addOrReplaceLayer).to.deep.equals({
                layerId: "2426",
                visibility: true,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 0
            });
            expect(dispatchCalls[1].addOrReplaceLayer).to.deep.equals({
                layerId: "1711",
                visibility: false,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 1
            });
            expect(dispatchCalls[2].addOrReplaceLayer).to.deep.equals({
                layerId: "452",
                visibility: true,
                transparency: 50,
                showInLayerTree: true,
                zIndex: 2
            });
        });
    });

    describe("setLayerIds", () =>{
        it("should replace the layers from the params", () => {
            const params = {
                "MAP/LAYERIDS": "452,1711",
                TRANSPARENCY: "50,0",
                VISIBILITY: "true,false"
            };

            layerUrlParams.setLayerIds(params);

            expect(dispatchCalls.length).to.equals(2);
            expect(dispatchCalls[0].addOrReplaceLayer).to.deep.equals({
                layerId: "452",
                visibility: true,
                transparency: "50",
                showInLayerTree: true,
                zIndex: 0
            });
            expect(dispatchCalls[1].addOrReplaceLayer).to.deep.equals({
                layerId: "1711",
                visibility: false,
                transparency: "0",
                showInLayerTree: true,
                zIndex: 1
            });
        });
        it("should replace the grouped layerId with all ids of group from the params", () => {
            const params = {
                "MAP/LAYERIDS": "717,1711",
                TRANSPARENCY: "50,0",
                VISIBILITY: "true,false"
            };

            store.getters = {
                layerConfigsByAttributes: (attr) => {
                    if (attr.baselayer) {
                        return [
                            {
                                "id": "717-718-719"
                            }
                        ];
                    }

                    return [];


                }
            };

            layerUrlParams.setLayerIds(params);
            expect(dispatchCalls.length).to.equals(2);
            expect(dispatchCalls[0].addOrReplaceLayer).to.deep.equals({
                layerId: "717-718-719",
                visibility: true,
                transparency: "50",
                showInLayerTree: true,
                zIndex: 0
            });
            expect(dispatchCalls[1].addOrReplaceLayer).to.deep.equals({
                layerId: "1711",
                visibility: false,
                transparency: "0",
                showInLayerTree: true,
                zIndex: 1
            });
        });
    });

    describe("setLayersByMetadataId", () =>{
        beforeEach(() => {
            store.getters = {
                allLayerConfigs: [
                    {
                        id: "2425",
                        datasets: [
                            {
                                md_id: "F35EAC11-C236-429F-B1BF-751C0C18E8B7"
                            }
                        ]
                    },
                    {
                        id: "2426",
                        datasets: [
                            {
                                md_id: "F35EAC11-C236-429F-B1BF-751C0C18E8B7"
                            }
                        ]
                    }
                ],
                determineZIndex: () => zIndex++,
                layerConfigsByAttributes: () => {
                    return [
                        {
                            id: "452"
                        }
                    ];
                },
                layerConfigById: () => true
            };
        });

        it("should replace the layers from the params", () => {
            const params = {
                MDID: "F35EAC11-C236-429F-B1BF-751C0C18E8B7"
            };

            layerUrlParams.setLayersByMetadataId(params);

            expect(dispatchCalls.length).to.equals(4);
            expect(dispatchCalls[0].replaceByIdInLayerConfig).to.deep.equals({
                layerConfigs: [
                    {
                        id: "452",
                        layer: {
                            id: "452",
                            showInLayerTree: false,
                            visibility: false
                        }
                    }
                ]
            });
            expect(dispatchCalls[1].addOrReplaceLayer).to.deep.equals({
                layerId: "452",
                visibility: true,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 0
            });
            expect(dispatchCalls[2].addOrReplaceLayer).to.deep.equals({
                layerId: "2425",
                visibility: true,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 1
            });
            expect(dispatchCalls[3].addOrReplaceLayer).to.deep.equals({
                layerId: "2426",
                visibility: true,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 2
            });
        });
    });

    describe("removeCurrentLayerFromLayerTree", () => {
        beforeEach(() => {
            store.getters = {
                layerConfigsByAttributes: () => {
                    return [
                        {
                            id: "123"
                        },
                        {
                            id: "452"
                        }
                    ];
                }
            };
        });

        it("should set all layers invisible and remove from layer tree", () => {
            layerUrlParams.removeCurrentLayerFromLayerTree();

            expect(dispatchCalls.length).to.equals(2);
            expect(dispatchCalls[0].replaceByIdInLayerConfig).to.deep.equals({
                layerConfigs: [
                    {
                        id: "123",
                        layer: {
                            id: "123",
                            showInLayerTree: false,
                            visibility: false
                        }
                    }
                ]
            });
            expect(dispatchCalls[1].replaceByIdInLayerConfig).to.deep.equals({
                layerConfigs: [
                    {
                        id: "452",
                        layer: {
                            id: "452",
                            showInLayerTree: false,
                            visibility: false
                        }
                    }
                ]
            });
        });
    });

    describe("addLayerToLayerTree", () => {
        it("should add all layers", () => {
            const layers = [
                {
                    id: "123",
                    visibility: true,
                    transparency: 0
                },
                {
                    id: "456",
                    visibility: true,
                    transparency: 0
                }
            ];

            layerUrlParams.addLayerToLayerTree(layers);

            expect(dispatchCalls.length).to.equals(2);
            expect(dispatchCalls[0].addOrReplaceLayer).to.deep.equals({
                layerId: "123",
                visibility: true,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 0
            });
            expect(dispatchCalls[1].addOrReplaceLayer).to.deep.equals({
                layerId: "456",
                visibility: true,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 1
            });
        });
        it("should add a layer that isn't in the config.json", () => {
            store.getters = {
                layerConfigById: () => false
            };
            const layers = [
                {
                    id: "123"
                }
            ];

            sinon.stub(rawLayerList, "getLayerWhere").returns({
                id: "123",
                showInLayerTree: true,
                type: "layer",
                visibility: true,
                zIndex: 0
            });

            layerUrlParams.addLayerToLayerTree(layers);

            expect(dispatchCalls.length).to.equals(1);
            expect(dispatchCalls[0].addOrReplaceLayer).to.deep.equals({
                layerId: "123",
                visibility: true,
                transparency: 0,
                showInLayerTree: true,
                zIndex: 0
            });
        });
    });
});
