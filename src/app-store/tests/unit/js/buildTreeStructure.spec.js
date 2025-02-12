import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import buildTreeStructure from "../../../js/buildTreeStructure.js";
import {getAndMergeRawLayer, getAndMergeAllRawLayers} from "../../../js/getAndMergeRawLayer.js";
import getNestedValues from "../../../../shared/js/utils/getNestedValues";
import {treeBaselayersKey, treeSubjectsKey} from "../../../../shared/js/utils/constants";
import {expect} from "chai";
import sinon from "sinon";

describe("src/app-store/js/buildTreeStructure.js", () => {
    const categories = [
            {
                "key": "kategorie_opendata",
                "name": "Opendata",
                "active": true
            },
            {
                "key": "kategorie_inspire",
                "name": "Inspire"
            },
            {
                "key": "kategorie_organisation",
                "name": "Behörde"
            }
        ],
        layers3D = {
            "name": "3D Daten",
            "type": "folder",
            "elements": [
                {
                    "name": "3D-Basisdaten",
                    "type": "folder",
                    "elements": [
                        {
                            "id": "12883",
                            "name": "Digitales Geländemodell (DGM)",
                            "visibility": true
                        },
                        {
                            "id": "12884",
                            "name": "3D-Gebäudemodell (LoD2- DE)",
                            "visibility": false
                        }
                    ]
                }
            ]
        };

    let layerList,
        layerConfig;

    before(() => {
        const fs = require("fs");

        layerList = fs.readFileSync("src/app-store/tests/unit/js/servicesMasterAuto.json", "utf8");
        layerList = JSON.parse(layerList);

    });

    beforeEach(() => {
        layerConfig = {
            [treeBaselayersKey]: {
                elements: [
                    {
                        "id": "452",
                        "name": "Luftbilder DOP 20 (DOP 40 mit Umland)",
                        "visibility": true
                    },
                    {
                        "id": "453"
                    }
                ]
            },
            [treeSubjectsKey]: {
                elements: [
                    {
                        id: "21999",
                        name: "Quartiere",
                        typ: "WMS",
                        visibility: false,
                        showInLayerTree: true,
                        gfiTheme: "overwritten"
                    },
                    {
                        id: "22000",
                        name: "Stadtbereiche",
                        typ: "WMS",
                        visibility: true
                    }
                ]
            }
        };
    });
    afterEach(() => {
        sinon.restore();
    });

    describe("build", () => {
        it("should return the unchanged layerlist if no param is given", () => {
            const shortList = [{
                "id": "452",
                "name": "Luftbilder DOP 20 (DOP 40 mit Umland)",
                "visibility": true
            },
            {
                "id": "453"
            }];

            expect(buildTreeStructure.build(shortList)).to.be.deep.equals(shortList);
        });


        it("should return tree structured for active category and respect subject data layer configuration", () => {
            let result = null,
                filteredResult = null,
                firstFolders = null,
                secondFolders = null,
                layersInFirstFolders = null,
                layersInSecondFolders = null;

            sinon.stub(rawLayerList, "getLayerList").returns(layerList);

            result = buildTreeStructure.build(getAndMergeAllRawLayers(), layerConfig, categories[0], layerConfig[treeSubjectsKey].elements);

            layerConfig[treeSubjectsKey].elements.forEach(layerConf => {
                getAndMergeRawLayer(layerConf, true);
            });
            filteredResult = getNestedValues(result, "id").flat(Infinity);

            firstFolders = result.elements[0].elements.filter(el => el.type === "folder");
            secondFolders = result.elements[1].elements.filter(el => el.type === "folder");
            layersInFirstFolders = result.elements[0].elements.filter(el => el.type === "layer");
            layersInSecondFolders = result.elements[1].elements.filter(el => el.type === "layer");

            expect(result).to.be.an("object");
            expect(filteredResult.indexOf("452")).to.be.equals(-1);
            expect(filteredResult.indexOf("453")).to.be.equals(-1);

            expect(result.elements).to.be.an("array").to.have.lengthOf(2);
            expect(result.elements[0].name).to.be.equals(result.elements[0].elements[0].datasets[0].kategorie_opendata[0]);
            expect(result.elements[0].id).include("folder-");
            expect(result.elements[0].parentId).to.be.undefined;
            expect(result.elements[1].name).to.be.equals(result.elements[1].elements[0].datasets[0].kategorie_opendata[0]);
            expect(result.elements[1].id).include("folder-");
            expect(result.elements[1].parentId).to.be.undefined;
            expect(firstFolders).to.be.an("array").to.have.lengthOf(1);
            expect(firstFolders[0].id).include("folder-");
            expect(firstFolders[0].parentId).to.be.equals(result.elements[0].id);
            expect(firstFolders[0].name).to.be.equals(firstFolders[0].elements[1].datasets[0].md_name);
            expect(firstFolders[0].elements).to.be.an("array").to.have.lengthOf(2);
            expect(firstFolders[0].elements[0].id).to.be.equals("21999");
            expect(firstFolders[0].elements[0].gfiTheme).to.be.equals("overwritten");
            expect(firstFolders[0].elements[0].parentId).to.be.equals(firstFolders[0].id);
            expect(firstFolders[0].elements[0].showInLayerTree).to.be.true;
            expect(firstFolders[0].elements[0].type).to.be.equals("layer");
            expect(firstFolders[0].elements[0].name).not.to.be.equals(firstFolders[0].elements[0].datasets[0].md_name);
            expect(firstFolders[0].elements[1].id).to.be.equals("22000");
            expect(firstFolders[0].elements[1].parentId).to.be.equals(firstFolders[0].id);
            expect(firstFolders[0].elements[1].showInLayerTree).to.be.true;
            expect(firstFolders[0].elements[1].name).not.to.be.equals(firstFolders[0].elements[1].datasets[0].md_name);
            expect(layersInFirstFolders).to.be.an("array").to.have.lengthOf(2);
            expect(layersInFirstFolders[0].id).to.be.equals("22799");
            expect(layersInFirstFolders[0].parentId).to.be.equals(result.elements[0].id);
            expect(layersInFirstFolders[0].name).to.be.equals(layersInFirstFolders[0].datasets[0].md_name);
            expect(layersInFirstFolders[1].id).to.be.equals("7887");
            expect(layersInFirstFolders[1].parentId).to.be.equals(result.elements[0].id);
            expect(layersInFirstFolders[1].name).to.be.equals(layersInFirstFolders[1].datasets[0].md_name);

            expect(secondFolders).to.be.an("array").to.have.lengthOf(2);
            expect(secondFolders[0].id).include("folder-");
            expect(secondFolders[0].parentId).to.be.equals(result.elements[1].id);
            expect(secondFolders[0].name).to.be.equals(secondFolders[0].elements[1].datasets[0].md_name);
            expect(secondFolders[0].elements).to.be.an("array").to.have.lengthOf(2);
            expect(secondFolders[0].elements[0].id).to.be.equals("96");
            expect(secondFolders[0].elements[0].parentId).to.be.equals(secondFolders[0].id);
            expect(secondFolders[0].elements[0].name).not.to.be.equals(secondFolders[0].elements[0].datasets[0].md_name);
            expect(secondFolders[0].elements[1].id).to.be.equals("95");
            expect(secondFolders[0].elements[1].parentId).to.be.equals(secondFolders[0].id);
            expect(secondFolders[0].elements[1].name).not.to.be.equals(secondFolders[0].elements[1].datasets[0].md_name);
            expect(secondFolders[0].name).to.be.equals(secondFolders[0].elements[1].datasets[0].md_name);
            expect(secondFolders[1].id).include("folder-");
            expect(secondFolders[1].parentId).to.be.equals(result.elements[1].id);
            expect(secondFolders[1].name).to.be.equals(secondFolders[1].elements[1].datasets[0].md_name);
            expect(secondFolders[1].elements[0].id).to.be.equals("1102");
            expect(secondFolders[1].elements[0].parentId).to.be.equals(secondFolders[1].id);
            expect(secondFolders[1].elements[0].name).not.to.be.equals(secondFolders[1].elements[0].datasets[0].md_name);
            expect(secondFolders[1].elements[1].id).to.be.equals("1103");
            expect(secondFolders[1].elements[1].parentId).to.be.equals(secondFolders[1].id);
            expect(secondFolders[1].elements[1].name).not.to.be.equals(secondFolders[1].elements[1].datasets[0].md_name);

            expect(layersInSecondFolders).to.be.an("array").to.have.lengthOf(2);
            expect(layersInSecondFolders[0].id).to.be.equals("685");
            expect(layersInSecondFolders[0].parentId).to.be.equals(result.elements[1].id);
            expect(layersInSecondFolders[0].name).to.be.equals(layersInSecondFolders[0].datasets[0].md_name);
            expect(layersInSecondFolders[1].id).to.be.equals("182");
            expect(layersInSecondFolders[1].parentId).to.be.equals(result.elements[1].id);
            expect(layersInSecondFolders[1].name).to.be.equals(layersInSecondFolders[1].datasets[0].md_name);
        });

        it("should return tree structured for active category containing 3D Layers, layers configured in config.json shall be respected", () => {
            let result = null,
                filteredResult = null;

            sinon.stub(rawLayerList, "getLayerWhere").callsFake((searchAttributes) =>{
                if (searchAttributes.id === "12883") {
                    return {
                        "id": "12883",
                        "name": "Gelaende",
                        "url": "https://daten-hamburg.de/gdi3d/datasource-data/Gelaende",
                        "typ": "Terrain3D"
                    };

                }
                if (searchAttributes.id === "12884") {
                    return {
                        "id": "12884",
                        "name": "3D-Gebäudemodell (LoD2- DE)",
                        "url": "https://daten-hamburg.de/gdi3d/datasource-data/LoD2",
                        "typ": "TileSet3D"
                    };
                }
                const keys = Object.keys(searchAttributes);

                return layerList.find(entry => keys.every(key => entry[key] === searchAttributes[key])) || null;
            });
            layerConfig[treeSubjectsKey].elements.push(layers3D);

            result = buildTreeStructure.build(layerList, layerConfig, categories[0]);

            filteredResult = getNestedValues(result, "id").flat(Infinity);
            expect(result).to.be.an("object");
            expect(filteredResult.indexOf("452")).to.be.equals(-1);
            expect(filteredResult.indexOf("453")).to.be.equals(-1);
            expect(filteredResult.indexOf("12883")).not.to.be.equals(-1);
            expect(filteredResult.indexOf("12884")).not.to.be.equals(-1);
            expect(result.elements[0].name).to.be.equals("3D Daten");
            expect(result.elements[0].elements).to.be.an("array").to.have.lengthOf(1);
            expect(result.elements[0].elements[0].elements).to.be.an("array").to.have.lengthOf(2);
            expect(result.elements[0].elements[0].elements[0].id).to.be.equals("12883");
            expect(result.elements[0].elements[0].elements[1].id).to.be.equals("12884");
            expect(result.elements[1].name).to.be.equals("Sonstiges");
            expect(result.elements[2].name).to.be.equals("Umwelt und Klima");
            expect(result.elements[1].elements[2].elements[0].id).to.be.equals("21999");
            expect(result.elements[1].elements[2].elements[0].gfiTheme).to.be.equals("overwritten");
        });

        it("should return tree structured for active category containing a wms-time layer", () => {
            const wmsTimeLayer = {
                    "id": "23555",
                    "name": "Satellitenbilder Sentinel-2 CIR",
                    "typ": "WMS",
                    "datasets": [
                        {
                            "md_id": "98A63379-C7EC-4F78-919D-1DFD311C566F",
                            "md_name": "Satellitenbilder Sentinel-2 Hamburg",
                            "kategorie_opendata": [
                                "Umwelt"
                            ],
                            "kategorie_inspire": [
                                "Gebäude"
                            ],
                            "kategorie_organisation": "Landesbetrieb Geoinformation und Vermessung"
                        }
                    ],
                    "time": true
                },
                layerListWithMWSTime = layerList.concat([wmsTimeLayer]);
            let result = null,
                filteredResult = null;

            result = buildTreeStructure.build(layerListWithMWSTime, layerConfig, categories[0]);
            filteredResult = getNestedValues(result, "id").flat(Infinity);

            expect(result).to.be.an("object");
            expect(filteredResult.indexOf("452")).to.be.equals(-1);
            expect(filteredResult.indexOf("453")).to.be.equals(-1);
            expect(filteredResult.indexOf("23555")).not.to.be.equals(-1);
            expect(result.elements[1].elements).to.be.an("array").to.have.lengthOf(1);
            expect(result.elements[1].elements[0].id).to.be.equals("23555");
            expect(result.elements[1].elements[0].time).to.be.true;
            expect(result.elements[1].elements[0].name).to.be.equals(result.elements[1].elements[0].datasets[0].md_name);
        });

        it("should return tree structured for second category", () => {
            let result = null,
                filteredResult = null,
                folders = null,
                firstFolders = null,
                thirdFolders = null,
                secondFolders = null,
                layersInFirstFolders = null,
                layersInSecondFolders = null,
                layersInThirdFolders = null;

            sinon.stub(rawLayerList, "getLayerList").returns(layerList);

            result = buildTreeStructure.build(getAndMergeAllRawLayers(), layerConfig, categories[1]);
            filteredResult = getNestedValues(result, "id").flat(Infinity);
            folders = result.elements.filter(el => el.type === "folder");
            firstFolders = result.elements[0].elements.filter(el => el.type === "folder");
            secondFolders = result.elements[1].elements.filter(el => el.type === "folder");
            thirdFolders = result.elements[2].elements.filter(el => el.type === "folder");
            layersInFirstFolders = result.elements[0].elements.filter(el => el.type === "layer");
            layersInSecondFolders = result.elements[1].elements.filter(el => el.type === "layer");
            layersInThirdFolders = result.elements[2].elements.filter(el => el.type === "layer");

            expect(result).to.be.an("object");
            expect(filteredResult.indexOf("452")).to.be.equals(-1);
            expect(filteredResult.indexOf("453")).to.be.equals(-1);
            expect(result.elements).to.be.an("array").to.have.lengthOf(3);

            expect(folders[0].name).to.be.equals(firstFolders[0].elements[0].datasets[0].kategorie_inspire[0]);
            expect(folders[0].id).include("folder-");
            expect(folders[0].parentId).to.be.undefined;
            expect(folders[1].name).to.be.equals(secondFolders[0].elements[0].datasets[0].kategorie_inspire[0]);
            expect(folders[1].id).include("folder-");
            expect(folders[1].parentId).to.be.undefined;
            expect(folders[2].name).to.be.equals(thirdFolders[0].elements[0].datasets[0].kategorie_inspire[0]);
            expect(folders[2].id).include("folder-");
            expect(folders[2].parentId).to.be.undefined;

            expect(firstFolders).to.be.an("array").to.have.lengthOf(1);
            expect(firstFolders[0].id).include("folder-");
            expect(firstFolders[0].parentId).to.be.equals(result.elements[0].id);
            expect(firstFolders[0].name).to.be.equals(firstFolders[0].elements[1].datasets[0].md_name);
            expect(layersInFirstFolders).to.be.an("array").to.have.lengthOf(0);
            expect(firstFolders[0].elements).to.be.an("array").to.have.lengthOf(2);
            expect(firstFolders[0].elements[0].id).to.be.equals("1102");
            expect(firstFolders[0].elements[0].parentId).to.be.equals(firstFolders[0].id);
            expect(firstFolders[0].elements[0].name).not.to.be.equals(firstFolders[0].elements[0].datasets[0].md_name);
            expect(firstFolders[0].elements[1].id).to.be.equals("1103");
            expect(firstFolders[0].elements[1].parentId).to.be.equals(firstFolders[0].id);
            expect(firstFolders[0].elements[1].name).not.to.be.equals(firstFolders[0].elements[1].datasets[0].md_name);

            expect(secondFolders).to.be.an("array").to.have.lengthOf(1);
            expect(secondFolders[0].id).include("folder-");
            expect(secondFolders[0].parentId).to.be.equals(result.elements[1].id);
            expect(secondFolders[0].name).to.be.equals(secondFolders[0].elements[1].datasets[0].md_name);
            expect(layersInSecondFolders).to.be.an("array").to.have.lengthOf(0);
            expect(secondFolders[0].elements).to.be.an("array").to.have.lengthOf(2);
            expect(secondFolders[0].elements[0].id).to.be.equals("96");
            expect(secondFolders[0].elements[0].parentId).to.be.equals(secondFolders[0].id);
            expect(secondFolders[0].elements[0].name).not.to.be.equals(secondFolders[0].elements[0].datasets[0].md_name);
            expect(secondFolders[0].elements[1].id).to.be.equals("95");
            expect(secondFolders[0].elements[1].parentId).to.be.equals(secondFolders[0].id);
            expect(secondFolders[0].elements[1].name).not.to.be.equals(secondFolders[0].elements[1].datasets[0].md_name);

            expect(thirdFolders).to.be.an("array").to.have.lengthOf(1);
            expect(thirdFolders[0].name).to.be.equals(thirdFolders[0].elements[0].datasets[0].md_name);
            expect(thirdFolders[0].id).include("folder-");
            expect(thirdFolders[0].parentId).to.be.equals(result.elements[2].id);
            expect(layersInThirdFolders).to.be.an("array").to.have.lengthOf(4);
            expect(thirdFolders[0].elements).to.be.an("array").to.have.lengthOf(2);
            expect(thirdFolders[0].elements[0].id).to.be.equals("21999");
            expect(thirdFolders[0].elements[0].parentId).to.be.equals(thirdFolders[0].id);
            expect(thirdFolders[0].elements[0].name).not.to.be.equals(thirdFolders[0].elements[0].datasets[0].md_name);
            expect(thirdFolders[0].elements[1].id).to.be.equals("22000");
            expect(thirdFolders[0].elements[1].parentId).to.be.equals(thirdFolders[0].id);
            expect(thirdFolders[0].elements[1].name).not.to.be.equals(thirdFolders[0].elements[1].datasets[0].md_name);
            expect(layersInThirdFolders[0].id).to.be.equals("22799");
            expect(layersInThirdFolders[0].parentId).to.be.equals(result.elements[2].id);
            expect(layersInThirdFolders[0].name).to.be.equals(layersInThirdFolders[0].datasets[0].md_name);
            expect(layersInThirdFolders[1].id).to.be.equals("685");
            expect(layersInThirdFolders[1].parentId).to.be.equals(result.elements[2].id);
            expect(layersInThirdFolders[1].name).to.be.equals(layersInThirdFolders[1].datasets[0].md_name);
            expect(layersInThirdFolders[2].id).to.be.equals("7887");
            expect(layersInThirdFolders[2].parentId).to.be.equals(result.elements[2].id);
            expect(layersInThirdFolders[2].name).to.be.equals(layersInThirdFolders[2].datasets[0].md_name);
            expect(layersInThirdFolders[3].id).to.be.equals("182");
            expect(layersInThirdFolders[3].parentId).to.be.equals(result.elements[2].id);
            expect(layersInThirdFolders[3].name).to.be.equals(layersInThirdFolders[3].datasets[0].md_name);
        });

        it("should return tree structured for third category", () => {
            let result = null,
                filteredResult = null,
                folders = null,
                firstFolders = null,
                secondFolders = null,
                thirdFolders = null,
                fourthFolders = null,
                layersInFirstFolders = null,
                layersInSecondFolders = null,
                layersInThirdFolders = null,
                layersInFourthFolders = null;

            sinon.stub(rawLayerList, "getLayerList").returns(layerList);

            result = buildTreeStructure.build(getAndMergeAllRawLayers(), layerConfig, categories[2]);
            filteredResult = getNestedValues(result, "id").flat(Infinity);
            folders = result.elements.filter(el => el.type === "folder");
            firstFolders = result.elements[0].elements.filter(el => el.type === "folder");
            secondFolders = result.elements[1].elements.filter(el => el.type === "folder");
            thirdFolders = result.elements[2].elements.filter(el => el.type === "folder");
            fourthFolders = result.elements[3].elements.filter(el => el.type === "folder");
            layersInFirstFolders = result.elements[0].elements.filter(el => el.type === "layer");
            layersInSecondFolders = result.elements[1].elements.filter(el => el.type === "layer");
            layersInThirdFolders = result.elements[2].elements.filter(el => el.type === "layer");
            layersInFourthFolders = result.elements[3].elements[0].elements.filter(el => el.type === "layer");

            expect(result).to.be.an("object");
            expect(filteredResult.indexOf("452")).to.be.equals(-1);
            expect(filteredResult.indexOf("453")).to.be.equals(-1);
            expect(folders).to.be.an("array").to.have.lengthOf(4);

            expect(folders[0].name).to.be.equals(layersInFirstFolders[0].datasets[0].kategorie_organisation);
            expect(folders[0].id).include("folder-");
            expect(folders[0].parentId).to.be.undefined;
            expect(folders[1].name).to.be.equals(layersInSecondFolders[0].datasets[0].kategorie_organisation);
            expect(folders[1].id).include("folder-");
            expect(folders[1].parentId).to.be.undefined;
            expect(folders[2].name).to.be.equals(layersInThirdFolders[0].datasets[0].kategorie_organisation);
            expect(folders[2].id).include("folder-");
            expect(folders[2].parentId).to.be.undefined;
            expect(folders[3].name).to.be.equals(layersInFourthFolders[0].datasets[0].kategorie_organisation);
            expect(folders[3].id).include("folder-");
            expect(folders[3].parentId).to.be.undefined;

            expect(firstFolders).to.be.an("array").to.have.lengthOf(2);
            expect(firstFolders[0].name).to.be.equals(firstFolders[0].elements[0].datasets[0].md_name);
            expect(firstFolders[0].id).include("folder-");
            expect(firstFolders[0].parentId).to.be.equals(result.elements[0].id);
            expect(layersInFirstFolders).to.be.an("array").to.have.lengthOf(2);
            expect(firstFolders[0].elements).to.be.an("array").to.have.lengthOf(2);
            expect(firstFolders[0].elements[0].id).to.be.equals("96");
            expect(firstFolders[0].elements[0].parentId).to.be.equals(firstFolders[0].id);
            expect(firstFolders[0].elements[0].name).not.to.be.equals(firstFolders[0].elements[0].datasets[0].md_name);
            expect(firstFolders[0].elements[1].id).to.be.equals("95");
            expect(firstFolders[0].elements[0].parentId).to.be.equals(firstFolders[0].id);
            expect(firstFolders[0].elements[1].name).not.to.be.equals(firstFolders[0].elements[1].datasets[0].md_name);
            expect(layersInFirstFolders[0].id).to.be.equals("685");
            expect(layersInFirstFolders[0].parentId).to.be.equals(result.elements[0].id);
            expect(layersInFirstFolders[0].name).to.be.equals(layersInFirstFolders[0].datasets[0].md_name);
            expect(layersInFirstFolders[1].id).to.be.equals("182");
            expect(layersInFirstFolders[1].parentId).to.be.equals(result.elements[0].id);
            expect(layersInFirstFolders[1].name).to.be.equals(layersInFirstFolders[1].datasets[0].md_name);

            expect(firstFolders[1].elements).to.be.an("array").to.have.lengthOf(2);
            expect(firstFolders[1].elements[0].id).to.be.equals("1102");
            expect(firstFolders[1].elements[0].parentId).to.be.equals(firstFolders[1].id);
            expect(firstFolders[1].elements[0].name).not.to.be.equals(firstFolders[1].elements[0].datasets[0].md_name);
            expect(firstFolders[1].elements[1].id).to.be.equals("1103");
            expect(firstFolders[1].elements[1].parentId).to.be.equals(firstFolders[1].id);
            expect(firstFolders[1].elements[1].name).not.to.be.equals(firstFolders[1].elements[1].datasets[0].md_name);

            expect(secondFolders).to.be.an("array").to.have.lengthOf(0);
            expect(layersInSecondFolders).to.be.an("array").to.have.lengthOf(1);
            expect(layersInSecondFolders[0].id).to.be.equals("22799");
            expect(layersInSecondFolders[0].parentId).to.be.equals(result.elements[1].id);
            expect(layersInSecondFolders[0].name).to.be.equals(layersInSecondFolders[0].datasets[0].md_name);

            expect(thirdFolders).to.be.an("array").to.have.lengthOf(0);
            expect(layersInThirdFolders).to.be.an("array").to.have.lengthOf(1);
            expect(layersInThirdFolders[0].id).to.be.equals("7887");
            expect(layersInThirdFolders[0].parentId).to.be.equals(result.elements[2].id);
            expect(layersInThirdFolders[0].name).to.be.equals(layersInThirdFolders[0].datasets[0].md_name);

            expect(fourthFolders).to.be.an("array").to.have.lengthOf(1);
            expect(fourthFolders[0].name).to.be.equals(layersInFourthFolders[0].datasets[0].md_name);
            expect(fourthFolders[0].id).include("folder-");
            expect(fourthFolders[0].parentId).to.be.equals(result.elements[3].id);
            expect(result.elements[3].elements.filter(el => el.type === "layer")).to.be.an("array").to.have.lengthOf(0);
            expect(layersInFourthFolders).to.be.an("array").to.have.lengthOf(2);
            expect(layersInFourthFolders[0].id).to.be.equals("21999");
            expect(layersInFourthFolders[0].parentId).to.be.equals(result.elements[3].elements[0].id);
            expect(layersInFourthFolders[0].name).not.to.be.equals(layersInFourthFolders[0].datasets[0].md_name);
            expect(layersInFourthFolders[1].id).to.be.equals("22000");
            expect(layersInFourthFolders[1].parentId).to.be.equals(result.elements[3].elements[0].id);
            expect(layersInFourthFolders[1].name).not.to.be.equals(layersInFourthFolders[1].datasets[0].md_name);
        });
    });
    describe("setIdsAtFolders", () => {
        it("should set ids and parentIds", () => {
            const folderConfig = {
                "name": "Emissionen",
                "type": "folder",
                "elements": [
                    {
                        "name": "Lärmschutzbereiche Flughafen Hamburg (FluLärmHmbV)",
                        "type": "folder",
                        "elements": [
                            {
                                "id": "2431",
                                "visibility": false
                            },
                            {
                                "id": "2430",
                                "visibility": false
                            },
                            {
                                "id": "2429"
                            },
                            {
                                "name": "Überschwemmungsgebiete",
                                "type": "folder",
                                "elements": [
                                    {
                                        "id": "1103",
                                        "visibility": false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            sinon.stub(rawLayerList, "getLayerList").returns(layerList);
            buildTreeStructure.setIdsAtFolders([folderConfig]);
            expect(folderConfig.id).include("folder-");
            expect(folderConfig.elements[0].id).include("folder-");
            expect(folderConfig.elements[0].parentId).to.be.equals(folderConfig.id);
            expect(folderConfig.elements[0].elements[0].id).to.be.equals("2431");
            expect(folderConfig.elements[0].elements[0].parentId).to.be.equals(folderConfig.elements[0].id);
            expect(folderConfig.elements[0].elements[1].id).to.be.equals("2430");
            expect(folderConfig.elements[0].elements[1].parentId).to.be.equals(folderConfig.elements[0].id);
            expect(folderConfig.elements[0].elements[2].id).to.be.equals("2429");
            expect(folderConfig.elements[0].elements[2].parentId).to.be.equals(folderConfig.elements[0].id);
            expect(folderConfig.elements[0].elements[3].id).include("folder-");
            expect(folderConfig.elements[0].elements[3].parentId).to.be.equals(folderConfig.elements[0].id);
            expect(folderConfig.elements[0].elements[3].elements[0].id).to.be.equals("1103");
            expect(folderConfig.elements[0].elements[3].elements[0].parentId).to.be.equals(folderConfig.elements[0].elements[3].id);
        });
    });

});

