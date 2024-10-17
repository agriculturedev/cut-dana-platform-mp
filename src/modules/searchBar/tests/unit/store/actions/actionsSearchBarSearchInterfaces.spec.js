import actions from "../../../../store/actions/actionsSearchBarSearchInterfaces";
import {expect} from "chai";
import sinon from "sinon";

const {
    cleanSearchResults,
    instantiateSearchInterfaces,
    startSearch,
    search
} = actions;

describe("src/modules/searchBar/store/actions/actionsSearchBarSearchInterfaces.js", () => {
    let commit,
        dispatch;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    describe("instantiateSearchInterfaces", () => {
        it("should instantiate the gazetteer search interface", () => {
            const state = {
                searchInterfaces: [
                    {
                        type: "gazetteer",
                        serviceId: "8",
                        searchAddress: true,
                        searchStreets: true,
                        searchHouseNumbers: true,
                        searchDistricts: true,
                        searchParcels: true,
                        searchStreetKey: true
                    }
                ]
            };

            instantiateSearchInterfaces({state, commit});

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).includes("setSearchInterfaceInstances");
            expect(commit.secondCall.args[0]).includes("addMultipleSearchInterfaceIds");
            expect(commit.thirdCall.args[0]).includes("addSearchInterfaceInstances");
        });

        it("should instantiate the gazetter and addons search interfaces", () => {
            const state = {
                    searchInterfaces: [
                        {
                            type: "abc",
                            serviceid: "100"
                        },
                        {
                            type: "gazetteer",
                            serviceId: "8",
                            searchAddress: true,
                            searchStreets: true,
                            searchHouseNumbers: true,
                            searchDistricts: true,
                            searchParcels: true,
                            searchStreetKey: true
                        }
                    ]
                },
                searchInterfaceAddons = [{
                    abc: sinon.stub()
                }];

            instantiateSearchInterfaces({state, commit}, searchInterfaceAddons);

            expect(commit.callCount).to.equal(4);
            expect(commit.firstCall.args[0]).includes("setSearchInterfaceInstances");
            expect(commit.secondCall.args[0]).includes("addMultipleSearchInterfaceIds");
            expect(commit.thirdCall.args[0]).includes("addSearchInterfaceInstances");
            expect(commit.getCall(3).args[0]).includes("addSearchInterfaceInstances");
        });
    });
    describe("startSearch", () => {
        it("should start search to abc-straße", () => {
            const state = {
                searchInput: "abc-straße",
                minCharacters: 3
            };

            startSearch({dispatch, state});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("search");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                searchInput: "abc-straße"
            });
        });
    });
    describe("search", () => {
        it("should search in configured search instances", async () => {
            const state = {
                    searchInterfaceInstances: [{
                        clearSearchResults: sinon.spy(),
                        search: async (searchInput) => [searchInput]
                    }]
                },
                getters = {
                    showAllResults: false
                },
                searchInput = "Test";

            await search({getters, commit, dispatch, state}, {searchInput});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).equals("addSearchResults");
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).equals("cleanSearchResults");
        });
        it("should search in configured search instances for topic tree search with one interface", async () => {
            const state = {
                    searchInterfaceInstances: [
                        {
                            clearSearchResults: sinon.spy(),
                            searchInterfaceId: "elasticSearch_0",
                            search: async (searchInput) => [searchInput + "elasticSearch_0"]
                        },
                        {
                            clearSearchResults: sinon.spy(),
                            searchInterfaceId: "elasticSearch_1",
                            search: async (searchInput) => [searchInput + "elasticSearch_1"]
                        }
                    ]
                },
                getters = {
                    showAllResults: true,
                    showAllResultsSearchInterfaceInstances:
                         [{
                             id: "elasticSearch_0",
                             searchCategory: "Thema (externe Fachdaten)"
                         }]

                },
                searchInput = "Test";

            await search({getters, commit, dispatch, state}, {searchInput});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).equals("addSearchResults");
            expect(commit.firstCall.args[1]).deep.equals({searchResults: [searchInput + "elasticSearch_0"]});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).equals("cleanSearchResults");
        });
        it("should search in configured search instances for topic tree search with 2 interfaces", async () => {
            const state = {
                    searchInterfaceInstances: [
                        {
                            clearSearchResults: sinon.spy(),
                            searchInterfaceId: "elasticSearch_0",
                            search: async (searchInput) => [searchInput + "_elasticSearch_0"]
                        },
                        {
                            clearSearchResults: sinon.spy(),
                            searchInterfaceId: "elasticSearch_1",
                            search: async (searchInput) => [searchInput]
                        },
                        {
                            clearSearchResults: sinon.spy(),
                            searchInterfaceId: "topicTree",
                            search: async (searchInput) => [searchInput + "_topicTree"]
                        }
                    ]
                },
                getters = {
                    showAllResults: true,
                    showAllResultsSearchInterfaceInstances:
                         [
                             {
                                 id: "elasticSearch_0",
                                 searchCategory: "Thema (externe Fachdaten)"
                             },
                             {
                                 id: "topicTree",
                                 searchCategory: "Thema"
                             }
                         ]

                },
                searchInput = "Test";

            await search({getters, commit, dispatch, state}, {searchInput});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).equals("addSearchResults");
            expect(commit.firstCall.args[1]).deep.equals({searchResults: [searchInput + "_elasticSearch_0"]});
            expect(commit.secondCall.args[0]).equals("addSearchResults");
            expect(commit.secondCall.args[1]).deep.equals({searchResults: [searchInput + "_topicTree"]});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).equals("cleanSearchResults");
        });
        it("should filter out searchInterfaceInstances with not matching searchInterfaceId", async () => {
            const state = {
                    searchInterfaceInstances: [{
                        searchInterfaceId: "MatchID",
                        clearSearchResults: sinon.spy(),
                        search: async (searchInput) => [searchInput + "MatchID"]
                    },
                    {
                        searchInterfaceId: "MatchNotID",
                        clearSearchResults: sinon.spy(),
                        search: async (searchInput) => [searchInput]
                    }]
                },
                getters = {
                    showAllResults: () => true,
                    showAllResultsSearchInterfaceInstances:
                    [
                        {
                            id: "MatchID",
                            searchCategory: "Thema MatchID"
                        }
                    ]

                },
                searchInput = "Test",
                searchType = "result";

            await search({getters, commit, dispatch, state}, {searchInput, searchType});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).equals("addSearchResults");
            expect(commit.firstCall.args[1]).deep.equals({searchResults: [searchInput + "MatchID"]});
        });
    });

    describe("cleanSearchResults", () => {
        it("should set the searchResults to empty arrays", () => {
            cleanSearchResults({commit});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).equals("setSearchResults");
            expect(commit.firstCall.args[1]).to.be.an("array").that.is.empty;
        });
    });
});
