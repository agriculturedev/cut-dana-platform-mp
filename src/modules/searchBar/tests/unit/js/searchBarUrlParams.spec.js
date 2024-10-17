import searchBarUrlParams from "../../../js/searchBarUrlParams";
import store from "../../../../../app-store";
import {expect} from "chai";

describe("src/modules/searchBar/js/searchBarUrlParams.js", () => {
    const commitCalls = {},
        dispatchCalls = {};

    beforeEach(() => {
        store.commit = (arg1, arg2) => {
            commitCalls[arg1] = arg2 !== undefined ? arg2 : "called";
        };
        store.dispatch = (arg1, arg2) => {
            dispatchCalls[arg1] = arg2 !== undefined ? arg2 : "called";
        };
    });

    describe("setQueryToSearchInput", () => {
        it("should set query to searchInput and start search with QUERY", () => {
            const params = {
                QUERY: "abc-straße"
            };

            searchBarUrlParams.setQueryToSearchInput(params);

            expect(Object.keys(commitCalls).length).to.equals(1);
            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(commitCalls["Modules/SearchBar/setSearchInput"]).to.equals("abc-straße");
            expect(dispatchCalls["Modules/SearchBar/startSearch"]).to.equals("abc-straße");
        });

        it("should set query to searchInput and start search with SEARCH/QUERY", () => {
            const params = {
                "SEARCH/QUERY": "xyz-straße"
            };

            searchBarUrlParams.setQueryToSearchInput(params);

            expect(Object.keys(commitCalls).length).to.equals(1);
            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(commitCalls["Modules/SearchBar/setSearchInput"]).to.equals("xyz-straße");
            expect(dispatchCalls["Modules/SearchBar/startSearch"]).to.equals("xyz-straße");
        });
    });
});
