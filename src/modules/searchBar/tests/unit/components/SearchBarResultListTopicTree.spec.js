import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarResultListTopicTreeComponent from "../../../components/SearchBarResultListTopicTree.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarResultListTopicTree.vue", () => {
    let activateActionsSpy,
        setSelectedSearchResultsSpy,
        store,
        wrapper;

    const searchResults = [
            {
                category: "Straße",
                id: "BeidemNeuenKrahnStraße",
                index: 0,
                name: "Bei dem Neuen Krahn",
                searchInterfaceId: "gazetteer",
                displayedInfo: "",
                icon: "bi-signpost",
                imagePath: "",
                toolTip: "",
                events: {
                    onClick: {
                        addLayerToTopicTree: {
                            layerid: "BeidemNeuenKrahnStraße",
                            source: {
                                abc: "def"
                            }
                        }
                    }
                }
            },
            {
                category: "Adresse",
                id: "BeidemNeuenKrahn2Adresse",
                index: 1,
                name: "Bei dem Neuen Krahn 2",
                searchInterfaceId: "gazetteer",
                displayedInfo: "",
                icon: "bi-signpost",
                imagePath: "",
                toolTip: "",
                events: {
                }
            },
            {
                category: "topicTree",
                id: "ABC",
                index: 1,
                name: "The topic",
                searchInterfaceId: "topicTree",
                displayedInfo: "",
                icon: "bi-signpost",
                imagePath: "",
                toolTip: "",
                events: {
                }
            }
        ],
        searchInput = "Neuenfelder",
        resultItems = searchResults;

    beforeEach(() => {
        activateActionsSpy = sinon.spy();
        setSelectedSearchResultsSpy = sinon.spy();

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        SearchBar: {
                            namespaced: true,
                            getters: {
                                searchInput: () => searchInput,
                                searchResults: () => searchResults,
                                selectedSearchResults: () => [searchResults[0]]
                            },
                            actions: {
                                activateActions: activateActionsSpy
                            },
                            mutations: {
                                setSelectedSearchResults: setSelectedSearchResultsSpy
                            }
                        }
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("test the rendering with different parameters", () => {
        it("renders the SearchBarResultListTopicTree with 3 SearchBarResultListTopicTreeItems", () => {
            wrapper = shallowMount(SearchBarResultListTopicTreeComponent, {
                props: {
                    resultItems
                },
                global: {
                    plugins: [store]
                },
                data () {
                    return {
                        items: []
                    };
                }
            });

            expect(wrapper.find(".results-topic-tree-container").exists()).to.be.true;
            expect(wrapper.findAll("search-bar-result-list-topic-tree-item-stub").length).to.equals(3);
        });
        it("renders the SearchBarResultListTopicTree with 3 SearchBarResultListTopicTreeItems", () => {
            const items = {
                "Straße": [
                    {
                        id: "BeidemNeuenKrahnStraße",
                        icon: "bi-signpost",
                        length: 1
                    }
                ],
                "Adresse": [
                    {
                        id: "BeidemNeuenKrahn2Adresse",
                        icon: "bi-signpost",
                        length: 1
                    }
                ],
                "topicTree": [
                    {
                        id: "ABC",
                        imgPath: "https://imgPath",
                        length: 1
                    }
                ]
            };

            wrapper = shallowMount(SearchBarResultListTopicTreeComponent, {
                props: {
                    resultItems
                },
                global: {
                    plugins: [store]
                },
                data () {
                    return {
                        items: items
                    };
                }
            });

            expect(wrapper.find(".results-topic-tree-container").exists()).to.be.true;
            expect(wrapper.findAll("search-bar-result-list-topic-tree-item-stub").length).to.equals(3);
            expect(wrapper.findAll("h5 > img").length).to.equals(1);
            expect(wrapper.findAll("h5 > i").length).to.equals(2);
        });
    });
    describe("methods", () => {
        it("sortByCategories with empty items", () => {
            const items = [];

            wrapper = shallowMount(SearchBarResultListTopicTreeComponent, {
                props: {
                    resultItems
                },
                global: {
                    plugins: [store]
                },
                data () {
                    return {
                        items: items
                    };
                }});
            wrapper.vm.sortByCategories(resultItems);
            expect(Object.keys(items).length).to.eql(3);
            expect(Object.keys(items)[0]).to.eql("Straße");
            expect(items["Straße"][0]).to.deep.equals(searchResults[0]);
            expect(Object.keys(items)[1]).to.eql("Adresse");
            expect(items.Adresse[0]).to.deep.equals(searchResults[1]);
            expect(Object.keys(items)[2]).to.eql("topicTree");
            expect(items.topicTree[0]).to.deep.equals(searchResults[2]);
        });
        it("sortByCategories - no duplicated entries", () => {
            const items =
                {
                    "Straße": [searchResults[0]]
                };

            wrapper = shallowMount(SearchBarResultListTopicTreeComponent, {
                props: {
                    resultItems
                },
                global: {
                    plugins: [store]
                },
                data () {
                    return {
                        items: items
                    };
                }});
            wrapper.vm.sortByCategories(resultItems);
            expect(Object.keys(items).length).to.eql(3);
            expect(Object.keys(items)[0]).to.eql("Straße");
            expect(items["Straße"][0]).to.deep.equals(searchResults[0]);
            expect(Object.keys(items)[1]).to.eql("Adresse");
            expect(items.Adresse[0]).to.deep.equals(searchResults[1]);
            expect(Object.keys(items)[2]).to.eql("topicTree");
            expect(items.topicTree[0]).to.deep.equals(searchResults[2]);
        });
    });
});
