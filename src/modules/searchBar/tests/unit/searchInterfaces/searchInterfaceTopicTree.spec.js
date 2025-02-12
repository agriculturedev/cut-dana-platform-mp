import {expect} from "chai";
import sinon from "sinon";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceTopicTree from "../../../searchInterfaces/searchInterfaceTopicTree.js";
import store from "../../../../../app-store";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceTopicTree.js", () => {
    let SearchInterface1 = null,
        checkConfigSpy;

    before(() => {
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceTopicTree();

        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceTopicTree should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["activateLayerInTopicTree", "showInTree", "showLayerInfo"]);
        });
    });

    describe("createRegExp", () => {
        it("should create a regular expression from searchInput", () => {
            const searchInput = "Überschwemmungsgebiete (alkis)";

            expect(String(SearchInterface1.createRegExp(searchInput))).to.equals(String(/Überschwemmungsgebiete\(alkis\)/i));
        });
    });

    describe("searchInLayers", () => {
        describe("map mode 2D", () => {
            beforeEach(() => {
                store.getters = {
                    "Maps/mode": "2D"
                };
            });

            it("should search in layers and return found layers only 2D-layers", () => {
                const searchInput = "Überschwemmungsgebiete",
                    layerConfigs = [
                        {
                            id: "1",
                            name: "Überschwemmungsgebiete",
                            typ: "WMS",
                            datasets: [{
                                md_name: "Überschwemmungsgebiete (alkis)"
                            }]
                        },
                        {
                            id: "2",
                            name: "Krankenhäuser",
                            typ: "WMS"
                        },
                        {
                            id: "3",
                            name: "Überschwemmungsgebiete 3D",
                            typ: "TILESET3D"
                        }
                    ],
                    searchInputRegExp = SearchInterface1.createRegExp(searchInput);

                expect(SearchInterface1.searchInLayers(layerConfigs, searchInputRegExp)).to.deep.equals([
                    {
                        category: "modules.searchBar.type.topic",
                        events: {
                            onClick: {
                                activateLayerInTopicTree: {
                                    layerId: "1"
                                }
                            },
                            buttons: {
                                showInTree: {
                                    layerId: "1"
                                },
                                showLayerInfo: {
                                    layerId: "1"
                                }
                            }
                        },
                        icon: "bi-stack",
                        id: "1",
                        name: "Überschwemmungsgebiete",
                        toolTip: "Überschwemmungsgebiete (alkis)"
                    }
                ]);
            });
        });

        describe("map mode 3D", () => {
            beforeEach(() => {
                store.getters = {
                    "Maps/mode": "3D"
                };
            });

            it("should search in layers and return found layers also 3D-layers", () => {
                const searchInput = "Überschwemmungsgebiete",
                    layerConfigs = [
                        {
                            id: "1",
                            name: "Überschwemmungsgebiete",
                            typ: "WMS",
                            datasets: [{
                                md_name: "Überschwemmungsgebiete (alkis)"

                            }]
                        },
                        {
                            id: "2",
                            name: "Krankenhäuser",
                            typ: "WMS"
                        },
                        {
                            id: "3",
                            name: "Überschwemmungsgebiete 3D",
                            typ: "TILESET3D"
                        }
                    ],
                    searchInputRegExp = SearchInterface1.createRegExp(searchInput);

                expect(SearchInterface1.searchInLayers(layerConfigs, searchInputRegExp)).to.deep.equals([
                    {
                        category: "modules.searchBar.type.topic",
                        events: {
                            onClick: {
                                activateLayerInTopicTree: {
                                    layerId: "1"
                                }
                            },
                            buttons: {
                                showInTree: {
                                    layerId: "1"
                                },
                                showLayerInfo: {
                                    layerId: "1"
                                }
                            }
                        },
                        icon: "bi-stack",
                        id: "1",
                        name: "Überschwemmungsgebiete",
                        toolTip: "Überschwemmungsgebiete (alkis)"
                    },
                    {
                        category: "modules.searchBar.type.topic",
                        events: {
                            onClick: {
                                activateLayerInTopicTree: {

                                    layerId: "3"
                                }
                            },
                            buttons: {
                                showInTree: {
                                    layerId: "3"
                                },
                                showLayerInfo: {
                                    layerId: "3"
                                }
                            }
                        },
                        icon: "bi-stack",
                        id: "3",
                        name: "Überschwemmungsgebiete 3D",
                        toolTip: ""
                    }
                ]);
            });
        });
    });

    describe("normalizeLayerResult", () => {
        it("should normalize layer result", () => {
            const layer = {
                    id: "1",
                    name: "Überschwemmungsgebiete",
                    typ: "WMS",
                    datasets: [{
                        md_name: "Überschwemmungsgebiete (alkis)"
                    }]
                },
                datasetsExist = true;

            expect(SearchInterface1.normalizeLayerResult(layer, datasetsExist)).to.deep.equals(
                {
                    category: "modules.searchBar.type.topic",
                    events: {
                        onClick: {
                            activateLayerInTopicTree: {
                                layerId: "1"
                            }
                        },
                        buttons: {
                            showInTree: {
                                layerId: "1"
                            },
                            showLayerInfo: {
                                layerId: "1"
                            }
                        }
                    },
                    icon: "bi-stack",
                    id: "1",
                    name: "Überschwemmungsgebiete",
                    toolTip: "Überschwemmungsgebiete (alkis)"
                }
            );
        });
    });

    describe("searchInFolders", () => {
        it("should search in folders and return found folders", () => {
            const searchInput = "Überschwemmungsgebiete",
                layerConfig = {
                    subjectlayer: {
                        elements: [
                            {
                                id: "100",
                                name: "Krankenhäuser",
                                typ: "WMS"
                            },
                            {
                                name: "folder first",
                                type: "folder",
                                id: "this ID is not awesome",
                                elements: [
                                    {
                                        name: "Überschwemmungsgebiete",
                                        type: "folder",
                                        id: "this ID is awesome",
                                        elements: [
                                            {
                                                id: "1",
                                                name: "Überschwemmungsgebiete",
                                                typ: "WMS",
                                                datasets: [{
                                                    md_name: "Überschwemmungsgebiete (alkis)"
                                                }]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    baselayer: {
                        elements: [
                            {
                                id: "500",
                                name: "Geobasisdaten",
                                typ: "WMS"
                            }
                        ]
                    }
                },
                searchInputRegExp = SearchInterface1.createRegExp(searchInput);

            expect(SearchInterface1.searchInFolders(layerConfig, searchInputRegExp)).to.deep.equals([
                {
                    category: "modules.searchBar.type.folder",
                    events: {
                        onClick: {
                        },
                        buttons: {}
                    },
                    icon: "bi-folder",
                    id: "this ID is awesome",
                    name: "Überschwemmungsgebiete"
                }
            ]);
        });
    });

    describe("searchInFolder", () => {
        it("should add recursive folder and subFolders to foundFolders", () => {
            const folder = {
                    name: "folder first",
                    type: "folder",
                    elements: [
                        {
                            name: "Überschwemmungsgebiete",
                            type: "folder",
                            elements: [
                                {
                                    id: "1",
                                    name: "Überschwemmungsgebiete",
                                    typ: "WMS",
                                    datasets: [{
                                        md_name: "Überschwemmungsgebiete (alkis)"
                                    }]
                                }
                            ]
                        }
                    ]
                },
                folders = [];

            SearchInterface1.searchInFolder(folder, folders);

            expect(folders).to.deep.equals([
                {
                    name: "Überschwemmungsgebiete",
                    type: "folder",
                    elements: [{
                        id: "1",
                        name: "Überschwemmungsgebiete",
                        typ: "WMS",
                        datasets: [{
                            md_name: "Überschwemmungsgebiete (alkis)"
                        }]
                    }]
                }
            ]);
        });
    });

    describe("normalizeFolderResult", () => {
        it("should normalize folder result", () => {
            const folder = {
                name: "Überschwemmungsgebiete",
                type: "folder",
                id: "best ID ever",
                elements: [{
                    id: "1",
                    name: "Überschwemmungsgebiete",
                    typ: "WMS",
                    datasets: [{
                        md_name: "Überschwemmungsgebiete (alkis)"
                    }]
                }]
            };

            expect(SearchInterface1.normalizeFolderResult(folder)).to.deep.equals(
                {
                    category: "modules.searchBar.type.folder",
                    events: {
                        onClick: {
                        },
                        buttons: {
                        }
                    },
                    icon: "bi-folder",
                    id: "best ID ever",
                    name: "Überschwemmungsgebiete"
                }
            );
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from layer search result", () => {
            const searchResult = {
                id: "1",
                name: "Überschwemmungsgebiete",
                typ: "WMS",
                datasets: [{
                    md_name: "Überschwemmungsgebiete (alkis)"
                }]
            };

            expect(SearchInterface1.createPossibleActions(searchResult)).to.deep.equals(
                {
                    activateLayerInTopicTree: {
                        layerId: "1"
                    },
                    showInTree: {
                        layerId: "1"
                    },
                    showLayerInfo: {
                        layerId: "1"
                    }
                }
            );
        });

        it("should create possible events from folder search result", () => {
            const searchResult = {
                name: "Überschwemmungsgebiete",
                type: "folder",
                elements: [{
                    id: "1",
                    name: "Überschwemmungsgebiete",
                    typ: "WMS",
                    datasets: [{
                        md_name: "Überschwemmungsgebiete (alkis)"
                    }]
                }]
            };

            expect(SearchInterface1.createPossibleActions(searchResult)).to.deep.equals({});
        });
    });

    describe("searchInTreeWithEmptyFolder", () => {
        it("should run over empty folder and find following folder", () => {
            const searchInput = "Überschwemmungsgebiete",
                layerConfig = {
                    subjectlayer: {
                        elements: [
                            {
                                name: "empty Folder",
                                type: "folder"
                            },
                            {
                                name: "Überschwemmungsgebiete",
                                type: "folder",
                                id: "klara",
                                elements: [
                                    {
                                        id: "1",
                                        name: "Überschwemmungsgebiete",
                                        typ: "WMS",
                                        datasets: [{
                                            md_name: "Überschwemmungsgebiete (alkis)"
                                        }]
                                    }
                                ]
                            }
                        ]
                    },
                    baselayer: {
                        elements: [
                            {
                                id: "500",
                                name: "Geobasisdaten",
                                typ: "WMS"
                            }
                        ]
                    }
                },
                searchInputRegExp = SearchInterface1.createRegExp(searchInput);

            expect(SearchInterface1.searchInFolders(layerConfig, searchInputRegExp)).to.deep.equals([
                {
                    category: "modules.searchBar.type.folder",
                    events: {
                        onClick: {
                        },
                        buttons: {}
                    },
                    icon: "bi-folder",
                    id: "klara",
                    name: "Überschwemmungsgebiete"
                }
            ]);
        });
    });
});
