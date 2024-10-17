import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarSuggestionListItemComponent from "../../../components/SearchBarSuggestionListItem.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarSuggestionListItem.vue", () => {
    let store,
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
            toolTip: "toolTipAvailable",
            events: {
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
            toolTip: undefined,
            events: {
            }
        }
    ];

    beforeEach(() => {
        store = createStore({});
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("test the result item", () => {
        it("shows toolTip if available", () => {
            wrapper = mount(SearchBarSuggestionListItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchSuggestion: searchResults[0]
                }
            });
            wrapper.vm.$nextTick();
            expect(wrapper.find("button").html()).to.contain("toolTipAvailable");
        });

        it("shows name if tooltip is undefined", () => {
            wrapper = mount(SearchBarSuggestionListItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchSuggestion: searchResults[1]
                }
            });
            wrapper.vm.$nextTick();
            expect(wrapper.find("button").html()).to.contain("Bei dem Neuen Krahn 2");
        });
    });
});
