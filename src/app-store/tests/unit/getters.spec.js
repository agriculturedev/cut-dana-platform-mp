import {expect} from "chai";
import {treeBaselayersKey, treeSubjectsKey} from "../../../shared/js/utils/constants";
import getNestedValues from "../../../shared/js/utils/getNestedValues";
import getters from "../../getters";
import stateAppStore from "../../state";
import sinon from "sinon";

describe("src/app-store/getters.js", () => {
    let warn;

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("allConfigsLoaded", () => {
        it("should return true, if all configs are loaded", () => {
            const state = {
                loadedConfigs: {
                    configJson: true,
                    restServicesJson: true,
                    servicesJson: true
                }
            };

            expect(getters.allConfigsLoaded(stateAppStore)).to.be.false;
            expect(getters.allConfigsLoaded(state)).to.be.true;
        });
    });

    describe("allLayerConfigs", () => {
        it("should returns the configs of all layers", () => {
            const state = {
                layerConfig: {
                    [treeSubjectsKey]: {
                        elements: [
                            {
                                id: 1
                            },
                            {
                                id: 2,
                                visibility: true
                            }
                        ]
                    },
                    [treeBaselayersKey]: {
                        elements: [
                            {
                                id: 100,
                                visibility: true
                            },
                            {
                                id: 200
                            }
                        ]
                    }
                }
            };

            expect(getters.allLayerConfigs(stateAppStore)).to.be.an("array").that.is.empty;
            expect(getters.allLayerConfigs(state)).to.be.an("array").to.deep.equals([
                {
                    id: 1
                },
                {
                    id: 2,
                    visibility: true
                },
                {
                    id: 100,
                    visibility: true
                },
                {
                    id: 200
                }
            ]);
        });
    });

    describe("visibleLayerConfigs", () => {
        it("should return all visible layers", () => {
            const greenLayer = {
                    id: "1132",
                    name: "100 Jahre Stadtgruen POIs",
                    visibility: true
                },
                layerConfig = {
                    [treeBaselayersKey]: {
                        elements: [
                            {
                                id: "453",
                                visibility: true
                            },
                            {
                                id: "452"
                            }
                        ]
                    },
                    [treeSubjectsKey]: {
                        elements: [
                            greenLayer,
                            {
                                id: "10220"
                            }
                        ]
                    }
                },
                myGetters = {
                    allLayerConfigs: getNestedValues(layerConfig, "elements", true).flat(Infinity)// layerConfig[treeSubjectsKey].elements
                };

            expect(getters.visibleLayerConfigs(null, myGetters)).to.be.an("array");
            expect(getters.visibleLayerConfigs(null, myGetters).length).to.be.equals(2);
            expect(getters.visibleLayerConfigs(null, myGetters)[0].id).to.be.equals("453");
            expect(getters.visibleLayerConfigs(null, myGetters)[0].visibility).to.be.true;
            expect(getters.visibleLayerConfigs(null, myGetters)[1]).to.be.equals(greenLayer);
        });

        it("should return all visible layers - ids as array", () => {
            const layer = {
                    "id": [
                        "717",
                        "718",
                        "719",
                        "720",
                        "13712",
                        "13709",
                        "13714",
                        "13716"
                    ],
                    visibility: true,
                    name: "Geobasiskarten (farbig)"
                },
                layerConfig = {
                    [treeBaselayersKey]: {
                        elements: [
                            layer,
                            {
                                id: "453"
                            }
                        ]
                    }
                },
                myGetters = {
                    allLayerConfigs: layerConfig[treeBaselayersKey].elements
                };

            expect(getters.visibleLayerConfigs(null, myGetters)).to.be.an("array");
            expect(getters.visibleLayerConfigs(null, myGetters).length).to.be.equals(1);
            expect(getters.visibleLayerConfigs(null, myGetters)[0]).to.be.equals(layer);
        });

        it("should return all visible layers - grouped layer", () => {
            const layerConfig = {
                    name: "Gruppenlayer",
                    type: "group",
                    elements: [
                        {
                            id: "xyz",
                            children: [
                                {
                                    id: "682"
                                },
                                {
                                    id: "1731"
                                }
                            ],
                            visibility: true,
                            name: "Kita und Krankenhäuser"
                        }
                    ]
                },
                myGetters = {
                    allLayerConfigs: layerConfig.elements
                };

            expect(getters.visibleLayerConfigs(null, myGetters)).to.be.an("array");
            expect(getters.visibleLayerConfigs(null, myGetters)[0].children.length).to.be.equals(2);
            expect(getters.visibleLayerConfigs(null, myGetters)[0].children[0].id).to.be.equals("682");
            expect(getters.visibleLayerConfigs(null, myGetters)[0].children[1].id).to.be.equals("1731");
            expect(getters.visibleLayerConfigs(null, myGetters)[0].id).to.be.equals("xyz");
            expect(getters.visibleLayerConfigs(null, myGetters)[0].visibility).to.be.true;
            expect(getters.visibleLayerConfigs(null, myGetters)[0].name).to.be.equals("Kita und Krankenhäuser");
        });
    });

    describe("visibleBaselayerConfigs", () => {
        it("should return all visible baselayers", () => {
            const greenLayer = {
                    id: "1132",
                    name: "100 Jahre Stadtgruen POIs",
                    visibility: true
                },
                layerConfig = {
                    [treeBaselayersKey]: {
                        elements: [
                            {
                                id: "453",
                                visibility: true
                            },
                            {
                                id: "452"
                            }
                        ]
                    },
                    [treeSubjectsKey]: {
                        elements: [
                            greenLayer,
                            {
                                id: "10220",
                                visibility: true
                            }
                        ]
                    }
                },
                myGetters = {
                    allBaselayerConfigs: layerConfig[treeBaselayersKey].elements
                };

            expect(getters.visibleBaselayerConfigs(null, myGetters)[0]).to.deep.equal(layerConfig[treeBaselayersKey].elements[0]);
            expect(getters.visibleBaselayerConfigs(null, myGetters)[0].id).to.deep.equal("453");
        });
    });

    describe("allLayerConfigsStructured, allLayerConfigsByParentKey, allFolders and folderById", () => {
        let state,
            layerConfig,
            layersWithFolder;

        beforeEach(() => {
            layersWithFolder = [
                {
                    name: "Titel Ebene 1",
                    type: "folder",
                    id: "folder-1",
                    elements: [
                        {
                            name: "Titel Ebene 2",
                            type: "folder",
                            id: "folder-2",
                            parentId: "folder-1",
                            elements: [{
                                "id": "1",
                                parentId: "folder-2"
                            },
                            {
                                id: "2",
                                parentId: "folder-2"
                            },
                            {
                                name: "Titel Ebene 3",
                                type: "folder",
                                id: "folder-3",
                                parentId: "folder-2",
                                elements: [{
                                    id: "3",
                                    parentId: "folder-3"
                                }]
                            }]
                        }
                    ]
                }];
            layerConfig = {
                [treeBaselayersKey]: {
                    elements: [
                        {
                            id: "453",
                            visibility: true
                        },
                        {
                            id: "452"
                        }
                    ]
                },
                [treeSubjectsKey]: {
                    elements: layersWithFolder
                }
            };
            state = {
                layerConfig: layerConfig
            };
        });
        it("should return all folders", () => {
            const folders = getters.allFolders(state);

            expect(folders).to.be.an("array");
            expect(folders.length).to.be.equals(3);
            expect(folders[0].id).to.be.equals("folder-1");
            expect(folders[1].id).to.be.equals("folder-2");
            expect(folders[2].id).to.be.equals("folder-3");
        });
        it("should return folder by id", () => {
            const myGetters = {
                allFolders: layersWithFolder
            };
            let folder = getters.folderById(null, myGetters)("folder-1");

            expect(folder).to.be.an("object");
            expect(folder.id).to.be.equals("folder-1");
            expect(folder.name).to.be.equals("Titel Ebene 1");

            folder = getters.folderById(null, myGetters)("folder-x");
            expect(folder).to.be.undefined;
        });
        it("should return all layerConfigs of first level", () => {
            const configs = getters.allLayerConfigsStructured(state)();

            expect(configs).to.be.an("array");
            expect(configs.length).to.be.equals(3);
            expect(configs[0].id).to.be.equals("453");
            expect(configs[1].id).to.be.equals("452");
            expect(configs[2].type).to.be.equals("folder");
            expect(configs[2].name).to.be.equals("Titel Ebene 1");
            expect(configs[2].elements.length).to.be.equals(1);
            expect(configs[2].elements).to.be.deep.equals(layersWithFolder[0].elements);
        });

        it("should return all layerConfigs of first level by key 'subjectlayer'", () => {
            const configs = getters.allLayerConfigsStructured(state)(treeSubjectsKey);

            expect(configs).to.be.an("array");
            expect(configs.length).to.be.equals(1);
            expect(configs[0].type).to.be.equals("folder");
            expect(configs[0].name).to.be.equals("Titel Ebene 1");
            expect(configs[0].elements.length).to.be.equals(1);
            expect(configs[0].elements).to.be.deep.equals(layersWithFolder[0].elements);
        });
        it("should return all layerConfigs of first level by key 'baselayer'", () => {
            const configs = getters.allLayerConfigsStructured(state)(treeBaselayersKey);

            expect(configs).to.be.an("array");
            expect(configs.length).to.be.equals(2);
            expect(configs[0].id).to.be.equals("453");
            expect(configs[1].id).to.be.equals("452");
        });

        it("allLayerConfigsByParentKey should return all layerConfigs key 'baselayer'", () => {
            const configs = getters.allLayerConfigsByParentKey(state)(treeBaselayersKey);

            expect(configs).to.be.an("array");
            expect(configs.length).to.be.equals(2);
            expect(configs[0].id).to.be.equals("453");
            expect(configs[1].id).to.be.equals("452");
        });

        it("allLayerConfigsByParentKey should return all layerConfigs key 'subjectlayer'", () => {
            const configs = getters.allLayerConfigsByParentKey(state)(treeSubjectsKey);

            expect(configs).to.be.an("array");
            expect(configs.length).to.be.equals(3);
            expect(configs[0].id).to.be.equals("1");
            expect(configs[1].id).to.be.equals("2");
            expect(configs[2].id).to.be.equals("3");
        });
    });

    describe("layerConfigsByAttributes", () => {
        it("should return the layers for requested attributes", () => {
            const greenLayer = {
                    id: "1132",
                    name: "100 Jahre Stadtgruen POIs",
                    visibility: true
                },
                bgLayer = {
                    id: "453",
                    gfiAttributes: {
                        "standort": "Standort",
                        "adresse": "Adresse"
                    },
                    visibility: true
                },
                layerConfig = {
                    [treeBaselayersKey]: {
                        elements: [
                            bgLayer,
                            {
                                id: "452"
                            }
                        ]
                    },
                    [treeSubjectsKey]: {
                        elements: [
                            greenLayer,
                            {
                                id: "10220"
                            }
                        ]
                    }
                },
                myGetters = {
                    allLayerConfigs: layerConfig[treeBaselayersKey].elements.concat(layerConfig[treeSubjectsKey].elements)
                };

            expect(getters.layerConfigsByAttributes(null, myGetters)(undefined)).to.be.an("array");
            expect(getters.layerConfigsByAttributes(null, myGetters)({id: "1132"})).to.be.an("array");
            expect(getters.layerConfigsByAttributes(null, myGetters)({id: "1132"}).length).to.be.equals(1);
            expect(getters.layerConfigsByAttributes(null, myGetters)({id: "1132"})[0]).to.be.deep.equals(greenLayer);
            expect(getters.layerConfigsByAttributes(null, myGetters)({visibility: true}).length).to.be.equals(2);
            expect(getters.layerConfigsByAttributes(null, myGetters)({visibility: true})).to.be.deep.equals([bgLayer, greenLayer]);
            expect(getters.layerConfigsByAttributes(null, myGetters)({visibility: true, id: "1132"}).length).to.be.equals(1);
            expect(getters.layerConfigsByAttributes(null, myGetters)({visibility: true, id: "453"}).length).to.be.equals(1);
            // @todo testen
            // expect(getters.layerConfigsByAttributes(state)({ gfiAttributes : {
            //     "standort" : "Standort",
            //     "adresse" : "Adresse"
            // },}).length).to.be.equals(1);
        });
    });

    describe("layerUrlParams", () => {
        it("should return the layers in tree for url params", () => {
            const myGetters = {
                layerConfigsByAttributes: () => [{
                    id: "1",
                    showInLayerTree: true,
                    visibility: true,
                    a: "b"
                },
                {
                    id: "2",
                    showInLayerTree: true,
                    visibility: false
                },
                {
                    id: "100",
                    transparency: "50",
                    showInLayerTree: true,
                    visibility: true
                }
                ]
            };

            expect(getters.layerUrlParams(null, myGetters)).to.deep.equals([
                {
                    id: "1",
                    visibility: true
                },
                {
                    id: "2",
                    visibility: false
                },
                {
                    id: "100",
                    transparency: "50",
                    visibility: true
                }
            ]);
        });
    });

    describe("determineZIndex", () => {
        let layerConfig, myGetters,
            maxZIndex = -1;

        beforeEach(() => {
            layerConfig = [
                {
                    id: "453",
                    baselayer: true,
                    zIndex: 0
                },
                {
                    id: "452",
                    baselayer: true
                },
                {
                    id: "451",
                    baselayer: true
                },
                {
                    id: "1132",
                    name: "100 Jahre Stadtgruen POIs",
                    visibility: true
                },
                {
                    id: "10220",
                    baselayer: false
                }
            ];
            myGetters = {
                maxZIndexOfLayerConfigsByParentKey: () => maxZIndex,
                layerConfigById: (id) => layerConfig.find((config) => config.id === id)
            };
        });
        it("determineZIndex for unknown layer", () => {
            expect(getters.determineZIndex(null, myGetters)("unknown")).to.be.null;
        });
        it("determineZIndex for first layer with zIndex under parentKey", () => {
            expect(getters.determineZIndex(null, myGetters)("10220")).to.be.equals(0);
        });
        it("determineZIndex for second layer with zIndex under parentKey", () => {
            maxZIndex = 0;
            expect(getters.determineZIndex(null, myGetters)("452")).to.be.equals(1);
        });
        it("determineZIndex for third layer with zIndex under parentKey", () => {
            maxZIndex = 1;
            layerConfig[1].zIndex = 1;
            expect(getters.determineZIndex(null, myGetters)("451")).to.be.equals(2);
        });
        it("determineZIndex for layer with existing zIndex", () => {
            maxZIndex = 100;
            layerConfig[0].zIndex = 100;
            expect(getters.determineZIndex(null, myGetters)("453")).to.be.equals(100);
        });
    });

    describe("maxZIndexOfLayerConfigsByParentKey", () => {
        let layerConfig, myGetters;

        beforeEach(() => {
            layerConfig = {
                [treeBaselayersKey]: {
                    elements: [
                        {
                            id: "452",
                            baselayer: true,
                            zIndex: 0
                        },
                        {
                            id: "452",
                            baselayer: true,
                            zIndex: 1
                        },
                        {
                            id: "451",
                            baselayer: true
                        }
                    ]
                },
                [treeSubjectsKey]: {
                    elements: [
                        {
                            id: "10220",
                            zIndex: 2
                        },
                        {
                            id: "10221",
                            zIndex: 3
                        }
                    ]
                }
            };
            myGetters = {
                allLayerConfigsByParentKey: (key) => layerConfig[key]?.elements
            };
        });
        it("maxZIndexOfLayerConfigsByParentKey for basedata", () => {
            expect(getters.maxZIndexOfLayerConfigsByParentKey(null, myGetters)(treeBaselayersKey)).to.be.equals(1);
        });
        it("maxZIndexOfLayerConfigsByParentKeyfor basedata with no zIndex", () => {
            layerConfig[treeBaselayersKey].elements[0].zIndex = undefined;
            layerConfig[treeBaselayersKey].elements[1].zIndex = undefined;
            expect(getters.maxZIndexOfLayerConfigsByParentKey(null, myGetters)(treeBaselayersKey)).to.be.equals(-1);
        });
        it("maxZIndexOfLayerConfigsByParentKeyfor basedata with no elements", () => {
            layerConfig[treeBaselayersKey].elements = [];
            expect(getters.maxZIndexOfLayerConfigsByParentKey(null, myGetters)(treeBaselayersKey)).to.be.equals(-1);
        });
        it("maxZIndexOfLayerConfigsByParentKey for subjectdata", () => {
            expect(getters.maxZIndexOfLayerConfigsByParentKey(null, myGetters)(treeSubjectsKey)).to.be.equals(3);
        });
        it("maxZIndexOfLayerConfigsByParentKeyfor subjectdata with no zIndex", () => {
            layerConfig[treeSubjectsKey].elements[0].zIndex = undefined;
            layerConfig[treeSubjectsKey].elements[1].zIndex = undefined;
            expect(getters.maxZIndexOfLayerConfigsByParentKey(null, myGetters)(treeSubjectsKey)).to.be.equals(-1);
        });
        it("maxZIndexOfLayerConfigsByParentKeyfor subjectdata with no elements", () => {
            layerConfig[treeSubjectsKey].elements = [];
            expect(getters.maxZIndexOfLayerConfigsByParentKey(null, myGetters)(treeSubjectsKey)).to.be.equals(-1);
        });
    });

    describe("invisibleBaselayerConfigs", () => {
        it("should return all invisible baselayers", () => {
            const layerConfig = {
                    [treeBaselayersKey]: {
                        elements: [
                            {
                                id: "453",
                                visibility: true
                            },
                            {
                                id: "452"
                            },
                            {
                                id: "1132",
                                name: "Luftbild",
                                visibility: false
                            }
                        ]
                    },
                    [treeSubjectsKey]: {
                        elements: [
                            {
                                id: "10220"
                            }
                        ]
                    }
                },
                myGetters = {
                    allBaselayerConfigs: layerConfig[treeBaselayersKey].elements
                };

            expect(getters.invisibleBaselayerConfigs(null, myGetters)).to.be.an("array");
            expect(getters.invisibleBaselayerConfigs(null, myGetters).length).to.be.equals(2);
            expect(getters.invisibleBaselayerConfigs(null, myGetters)[0].id).to.be.equals("452");
            expect(getters.invisibleBaselayerConfigs(null, myGetters)[1].id).to.be.equals("1132");
        });
    });
    describe("isModuleAvailable", () => {
        it("should return true, if module is configured in config.json by type and false if not", () => {
            const state = {
                portalConfig: {
                    mainMenu: {
                        expanded: true,
                        title: {
                            text: "Basic 3 alpha"
                        },
                        sections: [
                            [
                                {
                                    type: "fileImport"
                                },
                                {
                                    type: "openConfig"
                                },
                                {
                                    type: "contact",
                                    serviceId: "80001",
                                    includeSystemInfo: true,
                                    from: [
                                        {
                                            email: "lgvgeoportal-hilfe@gv.hamburg.de",
                                            name: "LGVGeoportalHilfe"
                                        }
                                    ],
                                    to: [
                                        {
                                            email: "lgvgeoportal-hilfe@gv.hamburg.de",
                                            name: "LGVGeoportalHilfe"
                                        }
                                    ]
                                },
                                {
                                    type: "language"
                                }
                            ]
                        ]
                    }
                }
            };

            expect(getters.isModuleAvailable(state)("language")).to.be.true;
            expect(getters.isModuleAvailable(state)("contact")).to.be.true;
            expect(getters.isModuleAvailable(state)("routing")).to.be.false;
            expect(getters.isModuleAvailable(state)()).to.be.false;

        });
    });

    describe("configuredModules", () => {
        let portalConfig, myGetters;
        const section1 = [
                {
                    type: "fileImport"
                },
                {
                    type: "openConfig"
                },
                {
                    type: "contact",
                    serviceId: "80001",
                    includeSystemInfo: true,
                    from: [
                        {
                            email: "lgvgeoportal-hilfe@gv.hamburg.de",
                            name: "LGVGeoportalHilfe"
                        }
                    ],
                    to: [
                        {
                            email: "lgvgeoportal-hilfe@gv.hamburg.de",
                            name: "LGVGeoportalHilfe"
                        }
                    ]
                },
                {
                    type: "language"
                }
            ],
            section2 = [
                {
                    type: "print"
                },
                {
                    type: "draw"
                }
            ];

        beforeEach(() => {
            portalConfig = {
                mainMenu: {
                    expanded: true,
                    title: {
                        text: "Title"
                    },
                    sections: []
                },
                secondaryMenu: {}
            };
            myGetters = {
                menuFromConfig: (menuName) => portalConfig[menuName],
                controlsConfig: {}
            };
        });

        it("configuredModules no sections in mainMenu", () => {
            expect(getters.configuredModules(null, myGetters).length).to.be.equals(0);
        });
        it("configuredModules only mainMenu", () => {
            portalConfig.mainMenu.sections.push(section1);
            expect(getters.configuredModules(null, myGetters).length).to.be.equals(4);
            expect(getters.configuredModules(null, myGetters)[0].type).to.be.equals("fileImport");
            expect(getters.configuredModules(null, myGetters)[1].type).to.be.equals("openConfig");
            expect(getters.configuredModules(null, myGetters)[2].type).to.be.equals("contact");
            expect(getters.configuredModules(null, myGetters)[3].type).to.be.equals("language");
        });
        it("configuredModules only mainMenu with 2 sections", () => {
            portalConfig.mainMenu.sections.push(section1);
            portalConfig.mainMenu.sections.push(section2);
            expect(getters.configuredModules(null, myGetters).length).to.be.equals(6);
            expect(getters.configuredModules(null, myGetters)[0].type).to.be.equals("fileImport");
            expect(getters.configuredModules(null, myGetters)[1].type).to.be.equals("openConfig");
            expect(getters.configuredModules(null, myGetters)[2].type).to.be.equals("contact");
            expect(getters.configuredModules(null, myGetters)[3].type).to.be.equals("language");
            expect(getters.configuredModules(null, myGetters)[4].type).to.be.equals("print");
            expect(getters.configuredModules(null, myGetters)[5].type).to.be.equals("draw");
        });
        it("configuredModules mainMenu with 2 sections and secondary menu with one section", () => {
            portalConfig.mainMenu.sections.push(section1);
            portalConfig.mainMenu.sections.push(section2);
            portalConfig.secondaryMenu = {};
            portalConfig.secondaryMenu.sections = [];
            portalConfig.secondaryMenu.sections.push(section1);
            expect(getters.configuredModules(null, myGetters).length).to.be.equals(10);
            expect(getters.configuredModules(null, myGetters)[0].type).to.be.equals("fileImport");
            expect(getters.configuredModules(null, myGetters)[1].type).to.be.equals("openConfig");
            expect(getters.configuredModules(null, myGetters)[2].type).to.be.equals("contact");
            expect(getters.configuredModules(null, myGetters)[3].type).to.be.equals("language");
            expect(getters.configuredModules(null, myGetters)[4].type).to.be.equals("print");
            expect(getters.configuredModules(null, myGetters)[5].type).to.be.equals("draw");
            expect(getters.configuredModules(null, myGetters)[6].type).to.be.equals("fileImport");
            expect(getters.configuredModules(null, myGetters)[7].type).to.be.equals("openConfig");
            expect(getters.configuredModules(null, myGetters)[8].type).to.be.equals("contact");
            expect(getters.configuredModules(null, myGetters)[9].type).to.be.equals("language");
        });
        it("configuredModules mainMenu with 2 sections and secondary menu with 2 section", () => {
            portalConfig.mainMenu.sections.push(section1);
            portalConfig.mainMenu.sections.push(section2);
            portalConfig.secondaryMenu = {};
            portalConfig.secondaryMenu.sections = [];
            portalConfig.secondaryMenu.sections.push(section1);
            portalConfig.secondaryMenu.sections.push(section2);
            expect(getters.configuredModules(null, myGetters).length).to.be.equals(12);
            expect(getters.configuredModules(null, myGetters)[0].type).to.be.equals("fileImport");
            expect(getters.configuredModules(null, myGetters)[1].type).to.be.equals("openConfig");
            expect(getters.configuredModules(null, myGetters)[2].type).to.be.equals("contact");
            expect(getters.configuredModules(null, myGetters)[3].type).to.be.equals("language");
            expect(getters.configuredModules(null, myGetters)[4].type).to.be.equals("print");
            expect(getters.configuredModules(null, myGetters)[5].type).to.be.equals("draw");
            expect(getters.configuredModules(null, myGetters)[6].type).to.be.equals("fileImport");
            expect(getters.configuredModules(null, myGetters)[7].type).to.be.equals("openConfig");
            expect(getters.configuredModules(null, myGetters)[8].type).to.be.equals("contact");
            expect(getters.configuredModules(null, myGetters)[9].type).to.be.equals("language");
            expect(getters.configuredModules(null, myGetters)[10].type).to.be.equals("print");
            expect(getters.configuredModules(null, myGetters)[11].type).to.be.equals("draw");
        });
        it("configuredModules only mainMenu with 2 sections and startModule", () => {
            portalConfig.mainMenu.sections.push(section1);
            portalConfig.mainMenu.sections.push(section2);
            myGetters.controlsConfig = {
                startModule: {
                    mainMenu: [{
                        "type": "test"
                    }],
                    secondaryMenu: [{
                        "type": "vcOblique"
                    }]
                }
            };
            expect(getters.configuredModules(null, myGetters).length).to.be.equals(8);
            expect(getters.configuredModules(null, myGetters)[0].type).to.be.equals("fileImport");
            expect(getters.configuredModules(null, myGetters)[1].type).to.be.equals("openConfig");
            expect(getters.configuredModules(null, myGetters)[2].type).to.be.equals("contact");
            expect(getters.configuredModules(null, myGetters)[3].type).to.be.equals("language");
            expect(getters.configuredModules(null, myGetters)[4].type).to.be.equals("print");
            expect(getters.configuredModules(null, myGetters)[5].type).to.be.equals("draw");
            expect(getters.configuredModules(null, myGetters)[6].type).to.be.equals("test");
            expect(getters.configuredModules(null, myGetters)[7].type).to.be.equals("vcOblique");
        });
    });
    describe("showLayerAddButton", () => {
        let state;

        beforeEach(() => {
            state = {
                portalConfig: {
                    tree: {
                        addLayerButton: {
                            active: true
                        }
                    }
                }
            };
        });

        it("showLayerAddButton tree not configured", () => {
            state.portalConfig.tree = undefined;
            expect(getters.showLayerAddButton(state)).to.be.false;
        });
        it("showLayerAddButton addLayerButton not configured", () => {
            state.portalConfig.tree.addLayerButton = undefined;
            expect(getters.showLayerAddButton(state)).to.be.false;
        });
        it("showLayerAddButton addLayerButton active is true", () => {
            expect(getters.showLayerAddButton(state)).to.be.true;
        });
        it("showLayerAddButton addLayerButton active is false", () => {
            state.portalConfig.tree.addLayerButton.active = false;
            expect(getters.showLayerAddButton(state)).to.be.false;
        });
        it("showLayerAddButton addLayerButton not configured, but tree-type 'auto'", () => {
            state.portalConfig.tree.addLayerButton = undefined;
            state.portalConfig.tree.type = "auto";
            expect(getters.showLayerAddButton(state)).to.be.true;
        });
        it("showLayerAddButton addLayerButton not configured, but tree-type not defined", () => {
            state.portalConfig.tree.addLayerButton = undefined;
            expect(getters.showLayerAddButton(state)).to.be.false;
        });

    });
    describe("showFolderPath", () => {
        let state;

        beforeEach(() => {
            state = {
                portalConfig: {
                    tree: {
                        showFolderPath: true
                    }
                }
            };
        });

        it("tree not configured", () => {
            state.portalConfig.tree = undefined;
            expect(getters.showFolderPath(state)).to.be.false;
        });
        it("showFolderPath not configured", () => {
            state.portalConfig.tree.showFolderPath = undefined;
            expect(getters.showFolderPath(state)).to.be.false;
        });
        it("showFolderPath is false", () => {
            state.portalConfig.tree.showFolderPath = false;
            expect(getters.showFolderPath(state)).to.be.false;
        });
        it("showFolderPath is true", () => {
            expect(getters.showFolderPath(state)).to.be.true;
        });
    });
});
