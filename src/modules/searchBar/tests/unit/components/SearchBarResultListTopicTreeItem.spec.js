import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarResultListTopicTreeItemComponent from "../../../components/SearchBarResultListTopicTreeItem.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarResultListTopicTreeItem.vue", () => {
    let addLayerToTopicTreeSpy,
        removeLayerFromTopicTreeSpy,
        selectedSearchResults,
        store,
        visibleLayerConfigs,
        wrapper,
        searchResults;

    const resultOne =
    {
        category: "Straße",
        id: "BeidemNeuenKrahnStraße",
        index: 0,
        name: "Bei dem Neuen Krahn",
        searchInterfaceId: "gazetteer",
        displayedInfo: "",
        icon: "bi-signpost",
        imagePath: "",
        toolTip: "toolTipAvailable",
        events: {
            onClick: {
                activateLayerInTopicTree: {
                    layerId: "123"
                }
            },
            buttons: {
                activateLayerInTopicTree: {
                    layerId: "123"
                }
            }
        }
    },
        resultTwo =
        {
            category: "Adresse",
            id: "BeidemNeuenKrahn2Adresse",
            index: 1,
            name: "Bei dem Neuen Krahn 2",
            searchInterfaceId: "gazetteer",
            displayedInfo: "",
            icon: "bi-signpost",
            imagePath: "",
            toolTip: undefined,
            events: {
            }
        },
        resultThree =
    {
        category: "Straße",
        id: "BeidemNeuenKrahnStraße",
        index: 2,
        name: "Bei dem Neuen Krahn",
        searchInterfaceId: "topicTree",
        displayedInfo: "",
        icon: "bi-signpost",
        imagePath: "",
        toolTip: "toolTipAvailable",
        events: {
            onClick: {
                addLayerToTopicTree: {
                    layerId: "123"
                }
            },
            buttons: {
                addLayerToTopicTree: {
                    layerId: "123"
                }
            }
        }
    };

    beforeEach(() => {
        searchResults = [resultOne, resultTwo, resultThree];
        visibleLayerConfigs = [];
        selectedSearchResults = [];
        addLayerToTopicTreeSpy = sinon.spy();
        removeLayerFromTopicTreeSpy = sinon.spy();

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        SearchBar: {
                            namespaced: true,
                            getters: {
                                selectedSearchResults: () => selectedSearchResults
                            },
                            actions: {
                                addLayerToTopicTree: addLayerToTopicTreeSpy,
                                removeLayerFromTopicTree: removeLayerFromTopicTreeSpy
                            }
                        }
                    }
                }
            },
            getters: {
                visibleLayerConfigs: () => visibleLayerConfigs
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("render elements", () => {
        it("should render result list topic tree item and check actionButtons", () => {
            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            expect(wrapper.find("#search-bar-result-list-topic-tree-item-BeidemNeuenKrahnStraße").exists()).to.be.true;
            expect(wrapper.find("span#search-bar-result-list-topic-tree-item-checkbox-BeidemNeuenKrahnStraße").exists()).to.be.true;
            expect(wrapper.find("span.search-bar-result-list-topic-tree-item-label").exists()).to.be.true;
            expect(wrapper.find("span.search-bar-result-list-topic-tree-item-label > span").exists()).to.be.true;
            expect(wrapper.find("span.search-bar-result-list-topic-tree-item-label > span").text()).to.equals("Bei dem Neuen Krahn");
            expect(wrapper.findAll("action-button-stub").length).to.be.equals(1);
            expect(wrapper.find("action-button-stub").attributes("actionname")).to.be.equals("activateLayerInTopicTree");
        });

        it("should render result list topic tree item and no actionButtons", () => {
            delete searchResults[0].events.buttons;
            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            expect(wrapper.find("#search-bar-result-list-topic-tree-item-BeidemNeuenKrahnStraße").exists()).to.be.true;
            expect(wrapper.find("span#search-bar-result-list-topic-tree-item-checkbox-BeidemNeuenKrahnStraße").exists()).to.be.true;
            expect(wrapper.find("span.search-bar-result-list-topic-tree-item-label").exists()).to.be.true;
            expect(wrapper.find("span.search-bar-result-list-topic-tree-item-label > span").exists()).to.be.true;
            expect(wrapper.find("span.search-bar-result-list-topic-tree-item-label > span").text()).to.equals("Bei dem Neuen Krahn");
            expect(wrapper.findAll("action-button-stub").length).to.be.equals(0);
        });
    });

    describe("isChecked", () => {
        it("should return false, if no layer is visible", () => {
            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            expect(wrapper.vm.isChecked).to.be.false;
        });

        it("should return true, if layer is visible", () => {
            visibleLayerConfigs = [{
                id: "123"
            }];

            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            expect(wrapper.vm.isChecked).to.be.true;
        });
    });

    describe("addOrRemoveLayer", () => {
        it("should add a layer to selectedSearchResults, action activateLayerInTopicTree", () => {
            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            wrapper.vm.addOrRemoveLayer();

            expect(addLayerToTopicTreeSpy.calledOnce).to.be.true;
            expect(addLayerToTopicTreeSpy.firstCall.args[1]).to.deep.equals({layerId: "123"});
            expect(removeLayerFromTopicTreeSpy.notCalled).to.be.true;
        });

        it("should add a layer to selectedSearchResults, action addLayerToTopicTree", () => {
            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[2]
                }
            });

            wrapper.vm.addOrRemoveLayer();

            expect(addLayerToTopicTreeSpy.calledOnce).to.be.true;
            expect(addLayerToTopicTreeSpy.firstCall.args[1]).to.deep.equals({layerId: "123"});
            expect(removeLayerFromTopicTreeSpy.notCalled).to.be.true;
        });

        it("should remove a layer from selectedSearchResults, action activateLayerInTopicTree", () => {
            selectedSearchResults = [searchResults[0]];

            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            wrapper.vm.addOrRemoveLayer();

            expect(removeLayerFromTopicTreeSpy.calledOnce).to.be.true;
            expect(removeLayerFromTopicTreeSpy.firstCall.args[1]).to.deep.equals({layerId: "123"});
            expect(addLayerToTopicTreeSpy.notCalled).to.be.true;
        });

        it("should remove a layer from selectedSearchResults, action addLayerToTopicTree", () => {
            selectedSearchResults = [searchResults[2]];

            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[2]
                }
            });

            wrapper.vm.addOrRemoveLayer();

            expect(removeLayerFromTopicTreeSpy.calledOnce).to.be.true;
            expect(removeLayerFromTopicTreeSpy.firstCall.args[1]).to.deep.equals({layerId: "123"});
            expect(addLayerToTopicTreeSpy.notCalled).to.be.true;
        });
    });
});
