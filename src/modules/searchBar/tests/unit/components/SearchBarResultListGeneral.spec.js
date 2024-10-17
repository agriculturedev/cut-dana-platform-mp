import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarResultListGeneralComponent from "../../../components/SearchBarResultListGeneral.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarResultListGeneral.vue", () => {
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
        searchInput = "Neuenfelder",
        resultItems = searchResults;

    beforeEach(() => {
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
                                selectedSearchResults: () => []
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
        it("renders the SearchBarResultListGeneral with 3 SearchBarResultListGeneralItem", async () => {
            wrapper = await shallowMount(SearchBarResultListGeneralComponent, {
                props: {
                    resultItems
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".results-general-container").exists()).to.be.true;
            expect(wrapper.findAll("search-bar-result-list-general-item-stub").length).to.equals(3);
        });
    });
});
