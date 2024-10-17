import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {addAdditional, getAndMergeAllRawLayers, getAndMergeRawLayer, resetZIndex} from "../../../js/getAndMergeRawLayer.js";
import {treeBaselayersKey, treeSubjectsKey} from "../../../../shared/js/utils/constants";
import layerFactory from "../../../../core/layers/js/layerFactory";
import {expect} from "chai";
import sinon from "sinon";

describe("src/app-store/js/getAndMergeRawLayer.js", () => {
    let layerConfig,
        warnSpy;

    before(() => {
        sinon.stub(layerFactory, "getLayerTypes3d").returns(["TERRAIN3D"]);
    });

    beforeEach(() => {
        warnSpy = sinon.spy();
        sinon.stub(console, "warn").callsFake(warnSpy);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("getAndMergeRawLayer", () => {
        it("should return undefined if no param is given", () => {
            expect(Array.isArray(getAndMergeRawLayer())).to.be.true;
            expect(getAndMergeRawLayer().length).to.be.equals(0);
        });
        it("layer not in services.json and without name", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function () {
                return undefined;
            });
            const layers = getAndMergeRawLayer({id: "notExisting"}),
                expected = {
                    id: "notExisting",
                    name: "WARN: Layer with id notExisting was not found in services.json and has no name! ",
                    type: "layer",
                    showInLayerTree: false,
                    is3DLayer: false
                };

            expect(layers[0]).to.be.deep.equals(expected);
            expect(warnSpy.calledOnce).to.be.true;
        });
        it("should return a simple raw layer", () => {
            const simpleLayerList = [
                {
                    id: "453",
                    name: "layer453"
                },
                {
                    id: "452",
                    name: "layer453"
                },
                {
                    id: "1132",
                    name: "layer1132"
                },
                {
                    id: "10220",
                    name: "layer10220"
                }
            ];
            let result = null;

            layerConfig = {
                [treeBaselayersKey]: {
                    elements: [
                        {
                            id: "453",
                            visibility: true,
                            type: "layer"
                        }
                    ]
                }
            };
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);

            result = getAndMergeRawLayer(layerConfig[treeBaselayersKey].elements[0]);

            expect(Array.isArray(result)).to.be.true;
            expect(result.length).to.be.equals(1);
            expect(result[0].id).to.be.equals("453");
            expect(result[0].name).to.be.equals("layer453");
            expect(result[0].visibility).to.be.true;
            expect(warnSpy.notCalled).to.be.true;
        });


        it("should return a merged raw layer, if ids are in an array - NOT typ GROUP", () => {
            layerConfig = {
                [treeBaselayersKey]: {
                    elements: [
                        {
                            id: [
                                "717",
                                "718",
                                "719"
                            ],
                            visibility: true,
                            name: "Geobasiskarten (farbig)",
                            type: "layer"
                        }
                    ]
                }
            };
            const simpleLayerList = [
                {
                    id: "453",
                    name: "layer453"
                },
                {
                    id: "717",
                    name: "name717",
                    layers: "layer717",
                    maxScale: "10000",
                    minScale: "10",
                    url: "url",
                    typ: "WMS"
                },
                {
                    id: "718",
                    name: "name718",
                    layers: "layer718",
                    maxScale: "30000",
                    minScale: "30",
                    url: "url",
                    typ: "WMS"
                },
                {
                    id: "719",
                    name: "name719",
                    layers: "layer719",
                    maxScale: "20000",
                    minScale: "20",
                    url: "url",
                    typ: "WMS"
                }
            ];
            let result = null;

            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);

            result = getAndMergeRawLayer(layerConfig[treeBaselayersKey].elements[0]);

            expect(Array.isArray(result)).to.be.true;
            expect(result.length).to.be.equals(1);
            expect(result[0].id).to.be.equals("717");
            expect(result[0].name).to.be.equals("Geobasiskarten (farbig)");
            expect(result[0].layers).to.be.equals("layer717,layer718,layer719");
            expect(result[0].maxScale).to.be.equals(30000);
            expect(result[0].minScale).to.be.equals(10);
            expect(result[0].visibility).to.be.true;
        });

        it("should respect layerIDsToStyle with more than one style", () => {
            const simpleLayerList = [
                    {
                        id: "1935",
                        name: "Normalfahrplan1935",
                        layers: "geofox_workspace:geofoxdb_strecken_normal"
                    }
                ],
                layerIDsToStyle = [
                    {
                        id: "1935",
                        styles: [
                            "geofox_Faehre",
                            "geofox-bahn",
                            "geofox-bus",
                            "geofox_BusName"
                        ],
                        name: [
                            "Fährverbindungen",
                            "Bahnlinien",
                            "Buslinien",
                            "Busliniennummern"
                        ],
                        legendURL: [
                            "https://legendURL/hvv-faehre.png",
                            "https://legendURL/hvv-bahn.png",
                            "https://legendURL/hvv-bus.png",
                            "https://legendURL/hvv-bus.png"
                        ]
                    }
                ],
                layers = [
                    {
                        id: "1935",
                        typ: "WMS",
                        visibility: true,
                        styles: [
                            "geofox_Faehre",
                            "geofox-bahn",
                            "geofox-bus",
                            "geofox_BusName"
                        ],
                        name: [
                            "Fährverbindungen",
                            "Bahnlinien",
                            "Buslinien",
                            "Busliniennummern"
                        ],
                        legendURL: [
                            "https://legendURL/hvv-faehre.png",
                            "https://legendURL/hvv-bahn.png",
                            "https://legendURL/hvv-bus.png",
                            "https://legendURL/hvv-bus.png"
                        ]
                    }
                ];
            let result = null;

            layerConfig = {
                [treeSubjectsKey]: {
                    elements: layers
                }
            };
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);
            result = getAndMergeRawLayer(layerConfig[treeSubjectsKey].elements[0], true, layerIDsToStyle);

            expect(Array.isArray(result)).to.be.true;
            expect(result.length).to.be.equals(4);
            for (let i = 0; i < result.length; i++) {
                const layer = result[i];

                expect(layer.id).to.be.equals(layers[0].id + layers[0].styles[i]);
                expect(layer.name).to.be.equals(layers[0].name[i]);
                expect(layer.style).to.be.equals(layers[0].styles[i]);
                expect(layer.styles).to.be.equals(layers[0].styles[i]);
                expect(layer.legendURL).to.be.equals(layers[0].legendURL[i]);
            }
        });
        it("should respect layerIDsToStyle with one style", () => {
            const simpleLayerList = [
                    {
                        id: "1933",
                        name: "Haltestellen1933",
                        layers: "geofox_workspace:geofoxdb_stations"
                    }
                ],
                layerIDsToStyle = [
                    {
                        id: "1933",
                        styles: "geofox_stations",
                        name: "Haltestellen",
                        legendURL: "https://legendURL/hvv-bus.png"
                    }
                ],
                layers = [
                    {
                        id: "1933",
                        typ: "WMS",
                        showInLayerTree: true,
                        styles: [
                            "geofox_stations"
                        ],
                        name: [
                            "Haltestellen"
                        ],
                        legendURL: [
                            "https://legendURL/hvv-bus.png"
                        ]
                    }
                ];
            let result = null;

            layerConfig = {
                [treeSubjectsKey]: {
                    elements: layers
                }
            };
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);
            result = getAndMergeRawLayer(layerConfig[treeSubjectsKey].elements[0], true, layerIDsToStyle);

            expect(Array.isArray(result)).to.be.true;
            expect(result.length).to.be.equals(1);
            for (let i = 0; i < result.length; i++) {
                const layer = result[i];

                expect(layer.id).to.be.equals(layers[0].id);
                expect(layer.name).to.be.equals(layers[0].name[i]);
                expect(layer.styles).to.be.equals(layers[0].styles[i]);
                expect(layer.legendURL).to.be.equals(layers[0].legendURL[i]);
            }
        });

        it("should return a merged raw layer, if layer is grouped", () => {
            layerConfig = {
                [treeSubjectsKey]: {
                    elements: [
                        {
                            name: "Gruppenlayer",
                            type: "folder",
                            elements: [
                                {
                                    id: ["682", "1731"],
                                    typ: "GROUP",
                                    name: "Kita und Krankenhäuser",
                                    styleId: "styleId"
                                }
                            ]
                        }
                    ]
                }
            };
            const simpleLayerList = [
                {
                    id: "682",
                    name: "name682",
                    layers: "layerA,layerB",
                    maxScale: "10000",
                    minScale: "100"
                },
                {
                    id: "1731",
                    name: "name1731",
                    layers: "layer1731",
                    maxScale: "20000"
                }
            ];
            let result = null;

            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);

            result = getAndMergeRawLayer(layerConfig[treeSubjectsKey].elements[0].elements[0]);

            expect(Array.isArray(result)).to.be.true;
            expect(result.length).to.be.equals(1);
            expect(result[0].id).to.be.equals("682-1731");
            expect(result[0].name).to.be.equals("Kita und Krankenhäuser");
            expect(result[0].typ).to.be.equals("GROUP");
            expect(result[0].maxScale).to.be.equals(20000);
            expect(result[0].minScale).to.be.equals(100);
            expect(result[0].children).to.be.an("array");
            expect(result[0].children.length).to.be.equals(2);
            expect(result[0].children[0].id).to.be.equals("682");
            expect(result[0].children[0].name).to.be.equals("name682");
            expect(result[0].children[0].styleId).to.be.equals("styleId");
            expect(result[0].children[1].id).to.be.equals("1731");
            expect(result[0].children[1].name).to.be.equals("name1731");
            expect(result[0].children[1].styleId).to.be.equals("styleId");
            expect(result[0].children[1].layers).to.be.equals("layer1731");
        });
    });

    describe("addAdditional", () => {
        before(() => {
            resetZIndex();
        });

        it("should set showInLayerTree to true, if showAllLayerInTree is true", () => {
            const rawLayer = {
                    id: "1"
                },
                showAllLayerInTree = true;

            expect(addAdditional(rawLayer, showAllLayerInTree)).to.deep.equals({
                id: "1",
                showInLayerTree: true,
                type: "layer",
                zIndex: 1,
                is3DLayer: false
            });
        });

        it("should set showInLayerTree to false, if showAllLayerInTree is false", () => {
            const rawLayer = {
                    id: "2"
                },
                showAllLayerInTree = false;

            expect(addAdditional(rawLayer, showAllLayerInTree)).to.deep.equals({
                id: "2",
                showInLayerTree: false,
                type: "layer",
                is3DLayer: false
            });
        });

        it("should set showInLayerTree to true, if showAllLayerInTree is false and visibility is true", () => {
            const rawLayer = {
                    id: "3",
                    visibility: true
                },
                showAllLayerInTree = false;

            expect(addAdditional(rawLayer, showAllLayerInTree)).to.deep.equals({
                id: "3",
                showInLayerTree: true,
                visibility: true,
                type: "layer",
                zIndex: 2,
                is3DLayer: false
            });
        });

        it("should set showInLayerTree to true, if showAllLayerInTree is false and visibility is true", () => {
            const rawLayer = {
                    id: "4",
                    visibility: true
                },
                showAllLayerInTree = false;

            expect(addAdditional(rawLayer, showAllLayerInTree)).to.deep.equals({
                id: "4",
                showInLayerTree: true,
                visibility: true,
                type: "layer",
                zIndex: 3,
                is3DLayer: false
            });
        });

        it("should set showInLayerTree to true, if showAllLayerInTree is false and visibility is false and showInLayerTree is true", () => {
            const rawLayer = {
                    id: "5",
                    showInLayerTree: true,
                    visibility: false
                },
                showAllLayerInTree = false;


            expect(addAdditional(rawLayer, showAllLayerInTree)).to.deep.equals({
                id: "5",
                showInLayerTree: true,
                visibility: false,
                type: "layer",
                zIndex: 4,
                is3DLayer: false
            });
        });

        it("should set showInLayerTree to true, if showAllLayerInTree is false and visibility is true and showInLayerTree is false", () => {
            const rawLayer = {
                    id: "6",
                    showInLayerTree: false,
                    visibility: true,
                    typ: "WMS"
                },
                showAllLayerInTree = false;


            expect(addAdditional(rawLayer, showAllLayerInTree)).to.deep.equals({
                id: "6",
                showInLayerTree: true,
                visibility: true,
                type: "layer",
                zIndex: 5,
                typ: "WMS",
                is3DLayer: false
            });
        });

        it("should set is3DLayer to true, if layrs typ is 3D-type", () => {
            const rawLayer = {
                id: "6",
                showInLayerTree: false,
                visibility: true,
                typ: "terrain3D"
            };


            expect(addAdditional(rawLayer, true)).to.deep.equals({
                id: "6",
                showInLayerTree: true,
                visibility: true,
                type: "layer",
                zIndex: 6,
                typ: "terrain3D",
                is3DLayer: true
            });
        });
    });

    describe("getAndMergeAllRawLayers", () => {
        let treeConfig,
            simpleLayerList,
            layerList;

        beforeEach(() => {
            simpleLayerList = [
                {
                    id: "453",
                    name: "name453",
                    typ: "WMS",
                    datasets: [{
                        md_id: "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                        md_name: "md_name_453"
                    }
                    ]
                },
                {
                    id: "452",
                    name: "name452",
                    typ: "WMS",
                    datasets: [{
                        md_id: "B6A59A2B-2D40-4676-9094-efg",
                        md_name: "md_name_452"
                    }
                    ]
                },
                {
                    id: "1132",
                    name: "name1132",
                    typ: "SENSORTHINGS",
                    datasets: [{
                        md_id: "B6A59A2B-2D40-4676-9094-abc",
                        md_name: "md_name_1132"
                    }
                    ]
                },
                {
                    id: "10220",
                    name: "layer10220",
                    typ: "WFS",
                    datasets: [{
                        md_id: "B6A59A2B-2D40-4676-9094-hghghg",
                        md_name: "md_name_10220"
                    }
                    ]
                },
                {
                    id: "451",
                    name: "name451",
                    typ: "WFS"
                }
            ];
            treeConfig = {addLayerButton: {active: false}};
            layerList = [
                {
                    id: "453",
                    name: "layer453",
                    typ: "WMS",
                    datasets: [{
                        md_id: "md_id_453",
                        md_name: "md_name_453"
                    }]
                },
                {
                    id: "452",
                    name: "layer452",
                    typ: "WMS",
                    datasets: [{
                        md_id: "md_id_452",
                        md_name: "md_name_452"
                    }]
                },
                {
                    id: "1132",
                    name: "layer1132",
                    foo: "bar",
                    typ: "WMS",
                    gfiAttributes: "ignore",
                    layers: "layer1",
                    maxScale: "1000",
                    minScale: "10",
                    datasets: [{
                        md_id: "md_id_1132",
                        md_name: "md_name_1132"
                    }]
                },
                {
                    id: "10220",
                    name: "layer10220",
                    typ: "WMS",
                    datasets: [{
                        md_id: "md_id_10220",
                        md_name: "md_name_10220"
                    }]
                }
            ];
        });

        afterEach(() => {
            sinon.restore();
        });

        it("should filter by typ, datasets and layerContainer", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);
            const result = getAndMergeAllRawLayers(treeConfig);

            expect(result).to.be.an("array");
            expect(result.length).to.be.equals(3);
            expect(result[0]).to.be.deep.equals(simpleLayerList[0]);
            expect(result[1]).to.be.deep.equals(simpleLayerList[1]);
            expect(result[2]).to.be.deep.equals(simpleLayerList[2]);
        });

        it("should filter by typ, datasets and layerContainer but only typ WMS", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);
            const result = getAndMergeAllRawLayers({validLayerTypesAutoTree: ["WMS"]}, false);

            expect(result).to.be.an("array");
            expect(result.length).to.be.equals(2);
            expect(result[0]).to.be.deep.equals(simpleLayerList[0]);
            expect(result[1]).to.be.deep.equals(simpleLayerList[1]);
        });

        it("should create new raw layer if datasets contains more than one entry", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return simpleLayerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(simpleLayerList);
            let result = null;

            simpleLayerList[1].datasets.push(
                {
                    md_id: "B6A59A2B-2D40-4676-9094-kjkjkjk",
                    md_name: "md_name_10220"
                }
            );
            result = getAndMergeAllRawLayers(treeConfig);

            expect(result).to.be.an("array");
            expect(result.length).to.be.equals(4);
            expect(result[0].id).to.be.deep.equals("453");
            expect(result[3]).to.be.deep.equals(simpleLayerList[2]);
            expect(result[1].id).to.be.deep.equals("452_0");
            expect(result[1].name).to.be.deep.equals(simpleLayerList[1].name);
            expect(result[1].datasets[0].md_id).to.be.deep.equals("B6A59A2B-2D40-4676-9094-efg");
            expect(result[2].id).to.be.deep.equals("452_1");
            expect(result[2].name).to.be.deep.equals(simpleLayerList[1].name);
            expect(result[2].datasets[0].md_id).to.be.deep.equals("B6A59A2B-2D40-4676-9094-kjkjkjk");
        });

        it("layers contained in layerIDsToIgnore should be removed from layerlist", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            let result = null;

            treeConfig.layerIDsToIgnore = ["453", "452"];
            result = getAndMergeAllRawLayers(treeConfig, true);
            expect(result.length).to.be.equals(2);
        });
        it("layers not contained in layerIDsToIgnore should not removed from layerlist", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            let result = null;

            treeConfig.layerIDsToIgnore = ["45333", "45222"];
            result = getAndMergeAllRawLayers(treeConfig, true);
            expect(result.length).to.be.equals(4);
        });
        it("layers contained in metaIDsToIgnore should be removed from layerlist", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            let result = null;

            treeConfig.metaIDsToIgnore = ["md_id_453", "md_id_452"];
            result = getAndMergeAllRawLayers(treeConfig, true);
            expect(result.length).to.be.equals(2);
        });
        it("layers not contained in metaIDsToIgnore should not removed from layerlist", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            let result = null;

            treeConfig.metaIDsToIgnore = ["md_id_45333", "md_id_45222"];
            result = getAndMergeAllRawLayers(treeConfig, true);
            expect(result.length).to.be.equals(4);
        });
        it("WMS layers contained in metaIDsToMerge should be merged", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            const layerConf = {
                id: "11322",
                name: "layer11322",
                typ: "WMS",
                gfiAttributes: {
                    "name": "Name"
                },
                layers: "layer2",
                maxScale: "5000",
                minScale: "50",
                datasets: [{
                    md_id: "md_id_1132",
                    md_name: "md_name_1132"
                }]
            };
            let result = null,
                filteredResult = null;

            layerList.push(layerConf);
            treeConfig.metaIDsToMerge = ["md_id_1132"];

            result = getAndMergeAllRawLayers(treeConfig, true);
            filteredResult = result.filter(layer => layer.name === "layer11322");
            expect(result.length).to.be.equals(4);
            expect(filteredResult.length).to.be.equals(0);
            expect(result[result.length - 1].id).to.be.equals("1132");
            expect(result[result.length - 1].foo).to.be.equals("bar");
            expect(result[result.length - 1].name).to.be.equals("md_name_1132");
            expect(result[result.length - 1].gfiAttributes).to.be.deep.equals({
                "name": "Name"
            });
            expect(result[result.length - 1].layers).to.be.equals("layer1,layer2");
            expect(result[result.length - 1].maxScale).to.be.equals(5000);
            expect(result[result.length - 1].minScale).to.be.equals(10);
        });
        it("WMS layers contained in metaIDsToMerge should be merged - merged layer should have gfiAttributes from first layer in list", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            const layerConf = {
                id: "11322",
                name: "layer11322",
                typ: "WMS",
                gfiAttributes: {
                    "name": "Name"
                },
                datasets: [{
                    md_id: "md_id_1132",
                    md_name: "md_name_1132"
                }]
            };
            let result = null;

            layerList[2].gfiAttributes = {
                "foo": "bar"
            };
            layerList.push(layerConf);
            treeConfig.metaIDsToMerge = ["md_id_1132"];

            result = getAndMergeAllRawLayers(treeConfig);
            expect(result.length).to.be.equals(4);
            expect(result[result.length - 1].id).to.be.equals("1132");
            expect(result[result.length - 1].foo).to.be.equals("bar");
            expect(result[result.length - 1].name).to.be.equals("md_name_1132");
            expect(result[result.length - 1].gfiAttributes).to.be.deep.equals({
                "foo": "bar"
            });
        });
        it("WMS layers contained in layerIDsToStyle should be extended or splitted", () => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
                return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
            });
            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            const legendUrls = ["https://legendURL/hvv-faehre.png", "https://legendURL/hvv-bahn.png", "https://legendURL/hvv-bus.png", "https://legendURL/hvv-bus.png"],
                names = ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                styles = ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                layerIDsToStyle = [{
                    id: "10220",
                    styles: "geofox_stations",
                    name: "Haltestellen",
                    legendURL: "https://legendURL/hvv-bus.png"
                },
                {
                    id: "452",
                    styles: styles,
                    name: names,
                    legendURL: legendUrls
                }];
            let result = null,
                filteredResult = null;

            treeConfig.layerIDsToStyle = layerIDsToStyle;

            result = getAndMergeAllRawLayers(treeConfig, true);
            filteredResult = result.filter(layer => layer.name === "452");
            expect(result.length).to.be.equals(7);
            expect(filteredResult.length).to.be.equals(0);
            for (let index = 0; index < 4; index++) {
                expect(result[index + 1].id).to.be.equals("452" + styles[index]);
                expect(result[index + 1].style).to.be.equals(styles[index]);
                expect(result[index + 1].legendURL).to.be.equals(legendUrls[index]);
                expect(result[index + 1].name).to.be.equals(names[index]);
                expect(result[index + 1].styles).to.be.equals(styles[index]);
            }

            expect(result[result.length - 1].id).to.be.equals("10220");
            expect(result[result.length - 1].legendURL).to.be.equals("https://legendURL/hvv-bus.png");
            expect(result[result.length - 1].name).to.be.equals("Haltestellen");
            expect(result[result.length - 1].styles).to.be.equals("geofox_stations");
        });
    });
});
