import {createStore} from "vuex";
import {config, shallowMount, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import LayerSelectionComponent from "../../../components/LayerSelection.vue";
import LayerSelection from "../../../store/indexLayerSelection";

config.global.mocks.$t = key => key;

describe("src/modules/layerSelection/components/LayerSelection.vue", () => {
    let addLayerButtonSearchActive,
        categories,
        changeCategorySpy,
        lastFolderNames,
        layerBG_1,
        layerBG_2,
        layerBG_3,
        layer2D_1,
        layer2D_2,
        layer2D_3,
        layersBG,
        layersWithFolder,
        mapMode,
        searchInput,
        showAllResults,
        showInTree,
        store,
        subjectDataLayers,
        wrapper;

    beforeEach(() => {
        lastFolderNames = [];
        searchInput = "Neuenfelder";
        mapMode = "2D";
        showAllResults = true;
        categories = [
            {
                "key": "kategorie_opendata",
                "name": "common:modules.layerTree.categoryOpendata",
                "active": true
            },
            {
                "key": "kategorie_inspire",
                "name": "common:modules.layerTree.categoryInspire"
            },
            {
                "key": "kategorie_organisation",
                "name": "common:modules.layerTree.categoryOrganisation"
            }
        ];
        changeCategorySpy = sinon.spy();
        layer2D_1 = {
            id: "1",
            name: "layer2D_1",
            typ: "WMS",
            type: "layer",
            visibility: true,
            showInLayerTree: true
        };
        layer2D_2 = {
            id: "2",
            name: "layer2D_2",
            typ: "WFS",
            type: "layer",
            visibility: false
        };
        layer2D_3 = {
            id: "2D_3",
            name: "layer2D_3",
            typ: "WFS",
            type: "layer",
            visibility: false
        };
        layerBG_1 = {
            id: "11",
            name: "layerBG_1",
            typ: "WMS",
            type: "layer",
            visibility: true
        };
        layerBG_2 = {
            id: "12",
            name: "layerBG_2",
            typ: "WFS",
            type: "layer",
            visibility: false
        };
        layerBG_3 = {
            id: "13",
            name: "layerBG_3",
            typ: "VectorTile",
            type: "layer",
            visibility: false
        };
        layersBG = [
            layerBG_1,
            layerBG_2
        ];
        layersWithFolder = [
            {
                name: "Titel Ebene 1",
                type: "folder",
                elements: [
                    {
                        name: "Titel Ebene 2",
                        type: "folder",
                        elements: [layer2D_1, layer2D_2,
                            {
                                name: "Titel Ebene 3",
                                type: "folder",
                                elements: [layer2D_3]
                            }]
                    }
                ]
            }];
        subjectDataLayers = layersWithFolder;
        addLayerButtonSearchActive = true;
        showInTree = false;
        LayerSelection.actions.navigateForward = sinon.spy();
        LayerSelection.actions.navigateBack = sinon.spy();
        LayerSelection.actions.changeVisibility = sinon.spy();
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        LayerSelection,
                        SearchBar: {
                            namespaced: true,
                            getters: {
                                searchInput: () => searchInput,
                                searchInterfaceInstances: () => [],
                                searchResults: () => [],
                                addLayerButtonSearchActive: () => addLayerButtonSearchActive,
                                showAllResults: () => showAllResults,
                                searchResultsActive: () => true,
                                currentSide: () => {
                                    return "mainMenu";
                                },
                                minCharacters: () => 3,
                                placeholder: () => "",
                                configPaths: () => "",
                                showInTree: () => showInTree,
                                type: () => ""

                            },
                            mutations: {
                                setSearchSuggestions: () => "",
                                setCurrentSide: () => ""
                            },
                            actions: {
                                checkLayerSelectionSearchConfig: () => "",
                                overwriteDefaultValues: () => "",
                                instantiateSearchInterfaces: () => ""
                            }
                        }
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        currentComponent: () => () => "root"
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => mapMode
                    }
                }
            },
            getters: {
                invisibleBaselayerConfigs: sinon.stub(),
                activeOrFirstCategory: () => categories ? categories[0] : undefined,
                allCategories: () => categories,
                portalConfig: () => {
                    return {
                        tree: {
                            addLayerButton: {active: false},
                            categories: categories,
                            hideBackgroundsHeader: false,
                            backgroundsHeaderText: "custom backgrounds header text in test",
                            hideDatalayerHeader: false,
                            datalayerHeaderText: "custom datalayers text in test"
                        }
                    };
                }
            },
            actions: {
                changeCategory: changeCategorySpy,
                initializeModule: () => ""
            }
        });
        LayerSelection.state.visible = true;

        store.commit("Modules/LayerSelection/setSubjectDataLayerConfs", subjectDataLayers);
        store.commit("Modules/LayerSelection/setBaselayerConfs", layersBG);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("do not render the LayerSelection if visible is false", () => {
        LayerSelection.state.visible = false;
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.false;
    });
    it("renders the LayerSelection without layers", () => {
        searchInput = "";
        store.commit("Modules/LayerSelection/setSubjectDataLayerConfs", []);
        store.commit("Modules/LayerSelection/setBaselayerConfs", []);
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.true;
        expect(wrapper.findAll("layer-selection-tree-node-stub").length).to.be.equals(0);
        expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(0);
    });

    it("renders the LayerSelection with folder-buttons and checkboxes for background-layers", async () => {
        showAllResults = false;
        searchInput = "";
        wrapper = await shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.true;
        expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(2);
        expect(wrapper.findAll("layer-selection-tree-node-stub").length).to.be.equals(1);
    });

    it("renders the LayerSelection without categories", () => {
        categories = undefined;
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.true;
        expect(wrapper.find("#select_category").exists()).to.be.false;
        expect(wrapper.findAll("option").length).to.be.equals(0);
    });

    it("renders the LayerSelection - check categories list", () => {
        showAllResults = false;
        LayerSelection.state.lastFolderNames = ["root"];
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.true;
        expect(wrapper.find("div.layer-selection-category-list").exists()).to.be.true;
        expect(wrapper.find("#layer-selection-category-btn").exists()).to.be.true;
        expect(wrapper.findAll("div.layer-selection-category-list div").length).to.be.equals(3);

        const listResult = wrapper.findAll("div.layer-selection-category-list div");

        expect(listResult.at(0).text()).to.be.equals("common:modules.layerTree.categoryOpendata");
        expect(listResult.at(1).text()).to.be.equals("common:modules.layerTree.categoryInspire");
        expect(listResult.at(2).text()).to.be.equals("common:modules.layerTree.categoryOrganisation");
    });


    it("checks for custom headlines for LayerSelection", () => {
        showAllResults = false;
        LayerSelection.state.lastFolderNames = ["root"];
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        const listResult = wrapper.findAll("h5");

        expect(listResult.length).to.be.equals(2);
        expect(listResult.at(0).text()).to.be.equals("custom backgrounds header text in test");
        expect(listResult.at(1).text()).to.be.equals("custom datalayers text in test");
    });


    it("checks for default headlines for LayerSelection", () => {
        showAllResults = false;
        LayerSelection.state.lastFolderNames = ["root"];

        store.getters.portalConfig.tree.backgroundsHeaderText = null;
        store.getters.portalConfig.tree.datalayerHeaderText = "";

        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }
        });

        const listResult = wrapper.findAll("h5");

        expect(listResult.length).to.be.equals(2);
        expect(listResult.at(0).text()).to.be.equals("common:modules.layerSelection.backgrounds");
        expect(listResult.at(1).text()).to.be.equals("common:modules.layerSelection.datalayer");
    });


    it("checks for a disabled headline for backgrounds", () => {
        showAllResults = false;
        LayerSelection.state.lastFolderNames = ["root"];
        store.getters.portalConfig.tree.hideBackgroundsHeader = true;
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }
        });

        const listResult = wrapper.findAll("h5");

        expect(listResult.length).to.be.equals(1);
        // the other one of two h5 elem. exists:
        expect(listResult.at(0).text()).to.be.equals("custom datalayers text in test");
    });


    it("checks for a disabled headline for datalayer", () => {
        showAllResults = false;
        LayerSelection.state.lastFolderNames = ["root"];
        store.getters.portalConfig.tree.hideDatalayerHeader = true;
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }
        });

        const listResult = wrapper.findAll("h5");

        expect(listResult.length).to.be.equals(1);
        // the other one of two h5 elem. exists:
        expect(listResult.at(0).text()).to.be.equals("custom backgrounds header text in test");
    });


    it("renders the LayerSelection with all levels of folder-buttons without bg-layers ", async () => {
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.true;

        wrapper.vm.folderClicked(subjectDataLayers[0].elements);
        await wrapper.vm.$nextTick();

        expect(LayerSelection.actions.navigateForward.calledOnce).to.be.true;
    });

    it("navigateStepsBack shall call action navigateBack", async () => {
        const provideSelectAllPropsSpy = sinon.spy(LayerSelectionComponent.methods, "provideSelectAllProps");

        lastFolderNames = ["root", "Titel Ebene 1", "Titel Ebene 2"];
        store.commit("Modules/LayerSelection/setLastFolderNames", lastFolderNames);
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.true;

        wrapper.vm.navigateStepsBack(0);
        await wrapper.vm.$nextTick();

        expect(LayerSelection.actions.navigateBack.calledTwice).to.be.true;
        await wrapper.vm.$nextTick();
        // called on created and here
        expect(provideSelectAllPropsSpy.calledTwice).to.be.true;
    });

    it("renders the LayerSelection with breadcrumbs ", async () => {
        let breadCrumbsA = null,
            breadcrumbsNoLink = null;
        const navigateStepsBackSpy = sinon.spy(LayerSelectionComponent.methods, "navigateStepsBack");

        showAllResults = false;
        lastFolderNames = ["root", "Titel Ebene 1", "Titel Ebene 2"];
        store.commit("Modules/LayerSelection/setLastFolderNames", lastFolderNames);
        wrapper = shallowMount(LayerSelectionComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-selection").exists()).to.be.true;

        breadCrumbsA = wrapper.findAll("a");
        expect(breadCrumbsA.length).to.be.equals(2);
        expect(breadCrumbsA.at(0).text()).to.be.equals("common:modules.layerSelection.datalayer");
        expect(breadCrumbsA.at(1).text()).to.be.equals("Titel Ebene 1");
        breadcrumbsNoLink = wrapper.findAll(".no-link");
        expect(breadcrumbsNoLink.length).to.be.equals(1);
        expect(breadcrumbsNoLink.at(0).text()).to.be.equals("Titel Ebene 2");
        breadCrumbsA.at(0).trigger("click");
        await wrapper.vm.$nextTick();
        expect(navigateStepsBackSpy.calledOnce).to.be.true;
        expect(navigateStepsBackSpy.firstCall.args[0]).to.equals(0);
    });

    describe("render SearchBar", () => {
        it("render the SearchBar, if showInTree = true and addLayerButtonSearchActive = false", () => {
            showInTree = true;
            addLayerButtonSearchActive = false;

            wrapper = mount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("#layer-selection").exists()).to.be.true;
            expect(wrapper.find("#search-bar").exists()).to.be.true;
            expect(wrapper.findAll("layer-selection-tree-node-stub").length).to.be.equals(0);
            expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(0);
        });

        it("render the SearchBar, if showInTree = false and addLayerButtonSearchActive = true", () => {
            showInTree = false;
            addLayerButtonSearchActive = true;

            wrapper = mount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("#layer-selection").exists()).to.be.true;
            expect(wrapper.find("#search-bar").exists()).to.be.true;
            expect(wrapper.findAll("layer-selection-tree-node-stub").length).to.be.equals(0);
            expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(0);
        });

        it("render the SearchBar, if showInTree = true and addLayerButtonSearchActive = true", () => {
            showInTree = true;
            addLayerButtonSearchActive = true;

            wrapper = mount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("#layer-selection").exists()).to.be.true;
            expect(wrapper.find("#search-bar").exists()).to.be.true;
            expect(wrapper.findAll("layer-selection-tree-node-stub").length).to.be.equals(0);
            expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(0);
        });

        it("don't render the SearchBar, if showInTree = false and addLayerButtonSearchActive = false", () => {
            showInTree = false;
            addLayerButtonSearchActive = false;

            wrapper = mount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("#layer-selection").exists()).to.be.true;
            expect(wrapper.find("#search-bar").exists()).to.be.false;
            expect(wrapper.findAll("layer-selection-tree-node-stub").length).to.be.equals(0);
            expect(wrapper.findAll("layer-check-box-stub").length).to.be.equals(0);
        });
    });

    describe("methods", () => {
        it("test method sort", () => {
            let sorted = [];
            const toSort = subjectDataLayers[0].elements[0].elements;

            wrapper = shallowMount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            expect(toSort[0].type).not.to.be.equals("folder");
            sorted = wrapper.vm.sort(toSort);

            expect(sorted.length).to.be.equals(toSort.length);
            expect(sorted[0].type).to.be.equals("folder");
            expect(sorted[1].type).to.be.equals("layer");
            expect(sorted[2].type).to.be.equals("layer");
        });

        it("test method categorySelected", () => {
            wrapper = shallowMount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            wrapper.vm.categorySelected(categories[1].key);

            expect(changeCategorySpy.calledOnce).to.be.true;
            expect(changeCategorySpy.firstCall.args[1]).to.deep.equals(categories[1]);
        });

        it("test method filterBaseLayer 3D", () => {
            mapMode = "3D";
            layersBG.push(layerBG_3);
            wrapper = shallowMount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            const filtered = wrapper.vm.filterBaseLayer();

            expect(filtered.length).to.be.equals(2);
            expect(filtered[0]).to.deep.equals(layerBG_1);
            expect(filtered[1]).to.deep.equals(layerBG_2);
        });

        it("test method filterBaseLayer 2D", () => {
            mapMode = "2D";
            layersBG.push(layerBG_3);
            wrapper = shallowMount(LayerSelectionComponent, {
                global: {
                    plugins: [store]
                }});

            const filtered = wrapper.vm.filterBaseLayer();

            expect(filtered.length).to.be.equals(3);
            expect(filtered[0]).to.deep.equals(layerBG_1);
            expect(filtered[1]).to.deep.equals(layerBG_2);
            expect(filtered[2]).to.deep.equals(layerBG_3);
        });
    });
});
