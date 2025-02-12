import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarResultListComponent from "../../../components/SearchBarResultList.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarResultList.vue", () => {
    let currentAvailableCategories,
        store,
        wrapper,
        addLayerButtonSearchActive;

    const searchResults = [
            {
                "category": "Straße",
                "id": "BeidemNeuenKrahnStraße",
                "index": 0,
                "name": "Bei dem Neuen Krahn",
                "searchInterfaceId": "gazetteer",
                "displayedInfo": "",
                "icon": "bi-signpost",
                "imagePath": "",
                "toolTip": "",
                "events": {
                }

            },
            {
                "category": "Adresse",
                "id": "BeidemNeuenKrahn2Adresse",
                "index": 1,
                "name": "Bei dem Neuen Krahn 2",
                "searchInterfaceId": "gazetteer",
                "displayedInfo": "",
                "icon": "bi-signpost",
                "imagePath": "",
                "toolTip": "",
                "events": {
                }
            },
            {
                "category": "topicTree",
                "id": "ABC",
                "index": 1,
                "name": "The topic",
                "searchInterfaceId": "topicTree",
                "displayedInfo": "",
                "icon": "bi-signpost",
                "imagePath": "",
                "toolTip": "",
                "events": {
                }
            }
        ],
        searchInterfaceInstances = [
            {
                searchInterfaceId: "gazetteer",
                hitTemplate: "default"
            },
            {
                searchInterfaceId: "topicTree",
                hitTemplate: "layer"
            }
        ],
        minCharacters = 3,
        searchInput = "Neuenfelder",
        limitedSortedSearchResults = {
            results: {
                0: searchResults[0],
                1: searchResults[0],
                availableCategories: ["example"],
                categoryProvider: {
                    example: "exampleSearch"
                },
                exampleCount: 1,
                exampleIcon: "bi-signpost-2"
            },
            currentShowAllList: searchResults
        },
        currentComponent = {type: "test"};


    beforeEach(() => {
        addLayerButtonSearchActive = false;
        currentAvailableCategories = "Adresse";

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        SearchBar: {
                            namespaced: true,
                            getters: {
                                currentAvailableCategories: () => currentAvailableCategories,
                                minCharacters: () => minCharacters,
                                searchInput: () => searchInput,
                                searchResults: () => searchResults,
                                searchInterfaceInstances: () => searchInterfaceInstances,
                                currentSide: () => {
                                    return "mainMenu";
                                },
                                searchResultsActive: () => {
                                    return true;
                                },
                                addLayerButtonSearchActive: () => addLayerButtonSearchActive
                            },
                            mutations: {
                                setSearchResultsActive: sinon.stub()
                            }
                        }
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        currentComponent: () => () => currentComponent
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("test the rendering with different parameters", () => {
        it("renders the SearchBarResultList", async () => {
            wrapper = await shallowMount(SearchBarResultListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });
            expect(wrapper.find(".results-container").exists()).to.be.true;
            expect(wrapper.find("#search-bar-result-list").exists()).to.be.true;
        });
    });

    describe("render result lists", () => {
        it("should render the result list general", async () => {
            wrapper = await shallowMount(SearchBarResultListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("search-bar-result-list-general-stub").exists()).to.be.true;
            expect(wrapper.find("#search-bar-result-heading").exists()).to.be.true;
        });

        it("should render the result list topic tree", async () => {
            currentAvailableCategories = "topicTree";

            wrapper = await shallowMount(SearchBarResultListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("search-bar-result-list-topic-tree-stub").exists()).to.be.true;
            expect(wrapper.find("#search-bar-result-heading").exists()).to.be.true;
        });
        it("should render category header, if not addLayerButtonSearchActive", async () => {
            addLayerButtonSearchActive = true;
            wrapper = await shallowMount(SearchBarResultListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("search-bar-result-list-general-stub").exists()).to.be.true;
            expect(wrapper.find("#search-bar-result-heading").exists()).to.be.false;
        });
    });

    describe("resultItems", () => {
        it("should return result items", async () => {
            wrapper = await shallowMount(SearchBarResultListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.resultItems).to.deep.equals([
                {
                    "category": "Adresse",
                    "id": "BeidemNeuenKrahn2Adresse",
                    "index": 1,
                    "name": "Bei dem Neuen Krahn 2",
                    "searchInterfaceId": "gazetteer",
                    "displayedInfo": "",
                    "icon": "bi-signpost",
                    "imagePath": "",
                    "toolTip": "",
                    "events": {
                    }
                }
            ]);
        });
        it("should return result items with type layerSelection", async () => {
            wrapper = await shallowMount(SearchBarResultListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.resultItems).to.deep.equals([
                {
                    "category": "Adresse",
                    "id": "BeidemNeuenKrahn2Adresse",
                    "index": 1,
                    "name": "Bei dem Neuen Krahn 2",
                    "searchInterfaceId": "gazetteer",
                    "displayedInfo": "",
                    "icon": "bi-signpost",
                    "imagePath": "",
                    "toolTip": "",
                    "events": {
                    }
                }
            ]);
        });
    });

    describe("hitTemplate", () => {
        it("should return the hitTemplate", async () => {
            wrapper = await shallowMount(SearchBarResultListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.hitTemplate).to.equals("default");
        });
    });
});
