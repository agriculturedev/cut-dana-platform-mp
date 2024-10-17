import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarSuggestionListComponent from "../../../components/SearchBarSuggestionList.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarSuggestionList.vue", () => {
    let store,
        wrapper;

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
            }
        ],
        minCharacters = 3,
        searchInput = "Neuenfelder",
        showAllResults = false,
        limitedSortedSearchResults = {
            results: {
                0: searchResults[0],
                1: searchResults[0],
                availableCategories: ["example"],
                categoryProvider: [
                    "exampleSearch"
                ],
                exampleCount: 1,
                exampleIcon: "bi-signpost-2"
            },
            currentShowAllList: searchResults
        },
        setNavigationCurrentComponentBySideSpy = sinon.spy(),
        setCurrentComponentBySideSpy = sinon.spy(),
        setNavigationHistoryBySideSpy = sinon.spy();

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        SearchBar: {
                            namespaced: true,
                            actions: {
                                addSelectedSearchResultToTopicTree: sinon.stub()
                            },
                            getters: {
                                currentSide: () => "mainMenu",
                                minCharacters: () => minCharacters,
                                searchInput: () => searchInput,
                                searchResults: () => searchResults,
                                searchResultsActive: () => {
                                    return true;
                                },
                                showAllResults: () => showAllResults
                            },
                            mutations: {
                                setShowAllResultsSearchInterfaceInstances: sinon.stub(),
                                setCurrentAvailableCategories: sinon.stub(),
                                setSearchResultsActive: sinon.stub(),
                                setShowAllResults: sinon.stub()
                            }
                        }
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        currentComponent: () => () => "root",
                        menuBySide: () => () => true
                    },
                    mutations: {
                        setNavigationCurrentComponentBySide: setNavigationCurrentComponentBySideSpy,
                        setCurrentComponentBySide: setCurrentComponentBySideSpy,
                        setNavigationHistoryBySide: setNavigationHistoryBySideSpy
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("test the rendering with different parameters", () => {
        it("renders the SearchBarSuggestionList", async () => {
            wrapper = await mount(SearchBarSuggestionListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });
            expect(wrapper.find("#search-bar-suggestion-list").exists()).to.be.true;
        });

        it("shows the showAll button", async () => {
            wrapper = await mount(SearchBarSuggestionListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.find(".showAllSection").exists()).to.be.true;
            expect(wrapper.find(".btn.btn-light.d-flex.text-left").exists()).to.be.true;
        });
    });

    describe("test the method prepareShowAllResults", () => {
        it("test the method prepareShowAllResults", async () => {
            wrapper = await mount(SearchBarSuggestionListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.vm.prepareShowAllResults("Straße");
            wrapper.vm.$nextTick();

            expect(setNavigationCurrentComponentBySideSpy.calledOnce).to.be.true;
            expect(setCurrentComponentBySideSpy.calledOnce).to.be.true;
            expect(setNavigationHistoryBySideSpy.calledOnce).to.be.true;

            expect(wrapper.vm.searchResultsActive).to.be.true;
            expect(wrapper.vm.currentShowAllList[0]).to.deep.equal(searchResults[0]);
        });
    });
});
