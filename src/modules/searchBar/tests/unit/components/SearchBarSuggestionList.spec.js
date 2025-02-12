import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarSuggestionListComponent from "../../../components/SearchBarSuggestionList.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarSuggestionList.vue", () => {
    let store,
        wrapper,
        showInTree,
        showAllResultsSearchInterfaceInstances,
        setNavigationCurrentComponentBySideSpy,
        setPlaceholderSpy,
        setCurrentAvailableCategoriesSpy,
        setShowAllResultsSearchInterfaceInstancesSpy,
        setCurrentComponentBySideSpy,
        setNavigationHistoryBySideSpy;

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
                availableCategories: ["Straße"],
                XcategoryProvider: [
                    "gazetteer"
                ],
                categoryProvider: {
                    "Straße": "gazetteer"
                },
                exampleCount: 1,
                exampleIcon: "bi-signpost-2"
            },
            currentShowAllList: searchResults
        };

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        showInTree = false;
        showAllResultsSearchInterfaceInstances = [];
        setNavigationCurrentComponentBySideSpy = sinon.spy();
        setPlaceholderSpy = sinon.spy();
        setCurrentAvailableCategoriesSpy = sinon.spy();
        setShowAllResultsSearchInterfaceInstancesSpy = sinon.spy();
        setCurrentComponentBySideSpy = sinon.spy();
        setNavigationHistoryBySideSpy = sinon.spy();
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
                                showAllResults: () => showAllResults,
                                showInTree: () => showInTree,
                                showAllResultsSearchInterfaceInstances: () => showAllResultsSearchInterfaceInstances
                            },
                            mutations: {
                                setShowAllResultsSearchInterfaceInstances: setShowAllResultsSearchInterfaceInstancesSpy,
                                setCurrentAvailableCategories: setCurrentAvailableCategoriesSpy,
                                setSearchResultsActive: sinon.stub(),
                                setShowAllResults: sinon.stub(),
                                setPlaceholder: setPlaceholderSpy
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

        it("not renders the SearchBarSuggestionList if showInTree is true", async () => {
            showInTree = true;
            wrapper = await mount(SearchBarSuggestionListComponent, {
                props: {
                    limitedSortedSearchResults
                },
                global: {
                    plugins: [store]
                }
            });
            expect(wrapper.find("#search-bar-suggestion-list").exists()).to.be.false;
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
        it("test the method prepareShowAllResults, showAllResultsSearchInterfaceInstances exists", async () => {
            showAllResultsSearchInterfaceInstances.push(
                {
                    id: "gazetteer",
                    searchCategory: "Straße"
                }
            );

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
            expect(setNavigationCurrentComponentBySideSpy.firstCall.args[1]).to.be.deep.equals({
                side: "mainMenu",
                newComponent: {props: {name: "modules.searchBar.searchResults - Straße"}, type: "searchbar"}
            });
            expect(setPlaceholderSpy.calledOnce).to.be.true;
            expect(setPlaceholderSpy.firstCall.args[1]).to.be.equals("modules.searchBar.placeholder.searchFor Straße");
            expect(setCurrentComponentBySideSpy.calledOnce).to.be.true;
            expect(setNavigationHistoryBySideSpy.calledOnce).to.be.true;
            expect(setShowAllResultsSearchInterfaceInstancesSpy.notCalled).to.be.true;
            expect(setCurrentAvailableCategoriesSpy.calledOnce).to.be.true;
            expect(setCurrentAvailableCategoriesSpy.firstCall.args[1]).to.equal("Straße");

            expect(wrapper.vm.searchResultsActive).to.be.true;
            expect(wrapper.vm.currentShowAllList[0]).to.deep.equal(searchResults[0]);
        });
        it("test the method prepareShowAllResults, showAllResultsSearchInterfaceInstances not exists", async () => {
            showAllResultsSearchInterfaceInstances.push(
                {
                    id: "elastic_0",
                    searchCategory: "Thema"
                }
            );
            const expected = [...showAllResultsSearchInterfaceInstances];

            expected.push(
                {
                    id: "gazetteer",
                    searchCategory: "Straße"
                }
            );

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
            expect(setNavigationCurrentComponentBySideSpy.firstCall.args[1]).to.be.deep.equals({
                side: "mainMenu",
                newComponent: {props: {name: "modules.searchBar.searchResults - Straße"}, type: "searchbar"}
            });
            expect(setPlaceholderSpy.calledOnce).to.be.true;
            expect(setPlaceholderSpy.firstCall.args[1]).to.be.equals("modules.searchBar.placeholder.searchFor Straße");
            expect(setCurrentComponentBySideSpy.calledOnce).to.be.true;
            expect(setNavigationHistoryBySideSpy.calledOnce).to.be.true;
            expect(setShowAllResultsSearchInterfaceInstancesSpy.calledOnce).to.be.true;
            expect(setShowAllResultsSearchInterfaceInstancesSpy.firstCall.args[1]).to.be.deep.equals(expected);
            expect(setCurrentAvailableCategoriesSpy.calledOnce).to.be.true;
            expect(setCurrentAvailableCategoriesSpy.firstCall.args[1]).to.equal("Straße");

            expect(wrapper.vm.searchResultsActive).to.be.true;
            expect(wrapper.vm.currentShowAllList[0]).to.deep.equal(searchResults[0]);
        });
    });
});
