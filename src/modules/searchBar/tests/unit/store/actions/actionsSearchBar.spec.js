import actions from "../../../../store/actions/actionsSearchBar";
import {expect} from "chai";
import sinon from "sinon";

const {
    updateSearchNavigation,
    startLayerSelectionSearch,
    checkLayerSelectionSearchConfig

} = actions;

describe("src/modules/searchBar/store/actions/actionsSearchBar.js", () => {
    let commit,
        dispatch,
        getters,
        rootGetters,
        rootState;

    beforeEach(() => {
        rootGetters = {};
        rootState = {};
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    describe("updateSearchNavigation", () => {
        it("it updates the search navigation", () => {
            getters = {
                currentSide: "mainMenu",
                currentActionEvent: "",
                searchInput: "Test",
                minCharacters: "3",
                showAllResults: true,
                searchResultsActive: undefined
            };
            rootGetters["Menu/currentComponent"] = () => {
                return {
                    type: "searchbar"
                };
            };

            updateSearchNavigation({getters, rootGetters, commit}, "mainMenu");

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setShowAllResults");
            expect(commit.firstCall.args[1]).to.be.false;
            expect(commit.secondCall.args[0]).to.eql("Menu/setCurrentComponentPropsName");
            expect(commit.secondCall.args[1]).to.deep.eql({side: "mainMenu", name: "common:modules.searchBar.searchResultList"});
            expect(commit.thirdCall.args[0]).to.eql("Menu/setNavigationHistoryBySide");
            expect(commit.thirdCall.args[1]).to.deep.eql({side: "mainMenu", newHistory: [{type: "root", props: []}]});
        });
        it("other side: it switches to previous component", () => {
            getters = {
                currentSide: "NotMainMenu",
                currentActionEvent: "",
                searchInput: "Test",
                minCharacters: "3",
                showAllResults: true,
                searchResultsActive: undefined
            };
            rootGetters["Menu/currentComponent"] = () => {
                return {
                    type: "searchbar"
                };
            };

            updateSearchNavigation({getters, rootGetters, commit}, "mainMenu");

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("Menu/switchToPreviousComponent");
            expect(commit.firstCall.args[1]).to.eql("mainMenu");
        });

        it("currentComponent is not searchbar, side is mainMenu: it switches to previous component", () => {
            getters = {
                currentSide: "mainMenu",
                currentActionEvent: "",
                searchInput: "Test",
                minCharacters: "3",
                showAllResults: true,
                searchResultsActive: undefined
            };
            rootGetters["Menu/currentComponent"] = () => {
                return {
                    type: "layerSelection"
                };
            };

            updateSearchNavigation({getters, rootGetters, commit}, "mainMenu");

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setShowAllResults");
            expect(commit.firstCall.args[1]).to.eql(false);
            expect(commit.secondCall.args[0]).to.eql("Menu/switchToPreviousComponent");
            expect(commit.secondCall.args[1]).to.eql("mainMenu");
        });
    });
    describe("startLayerSelectionSearch", () => {
        it("it updates the search navigation", () => {

            startLayerSelectionSearch({dispatch, commit}, "mainMenu");

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.eql("Menu/clickedMenuElement");
            expect(dispatch.firstCall.args[1]).to.be.deep.eql({name: "common:modules.searchBar.searchResultList", side: "mainMenu", type: "searchbar"});

            expect(commit.callCount).to.equal(4);
            expect(commit.firstCall.args[0]).to.eql("setShowAllResults");
            expect(commit.firstCall.args[1]).to.be.true;
            expect(commit.secondCall.args[0]).to.eql("Menu/setCurrentComponent");
            expect(commit.secondCall.args[1]).to.deep.eql({type: "layerSelection", side: "mainMenu", props: []});
            expect(commit.thirdCall.args[0]).to.eql("Menu/setCurrentComponentPropsName");
            expect(commit.thirdCall.args[1]).to.deep.eql({side: "mainMenu", name: "common:modules.searchBar.searchResults"});
            expect(commit.args[3][0]).to.equal("Menu/setNavigationHistoryBySide");
            expect(commit.args[3][1]).to.deep.equal({side: "mainMenu", newHistory: [{type: "root", props: []}, {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}}, {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}}]});
        });
    });
    describe("checkLayerSelectionSearchConfig", () => {
        it("it updates searchInterfaceInstanceIds, searchCategory, addLayerButton", () => {
            const searchInterfaceInstances = [
                {
                    id: "elasticSearch_0",
                    searchCategory: "Thema (externe Fachdaten)"
                },
                {
                    id: "topicTree",
                    searchCategory: "Thema"
                }
            ];

            rootGetters = {
                showLayerAddButton: true
            };
            rootState = {
                portalConfig: {
                    tree: {
                        addLayerButton: {
                            active: true,
                            searchBar: {
                                active: true,
                                searchInterfaceInstances
                            }
                        }
                    }
                }
            };

            checkLayerSelectionSearchConfig({commit, rootGetters, rootState});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setShowAllResultsSearchInterfaceInstances");
            expect(commit.firstCall.args[1]).to.be.deep.equals(searchInterfaceInstances);
            expect(commit.secondCall.args[0]).to.eql("setAddLayerButtonSearchActive");
            expect(commit.secondCall.args[1]).to.be.true;
        });

        it("it updates searchInterfaceInstanceIds, searchCategory, addLayerButton - with deprecated config", () => {
            const searchInterfaceInstances = [
                {
                    id: "elasticSearch_0",
                    searchCategory: "Thema"
                }
            ];

            rootGetters = {
                showLayerAddButton: true
            };
            rootState = {
                portalConfig: {
                    tree: {
                        addLayerButton: {
                            active: true,
                            searchBar: {
                                active: true,
                                searchInterfaceInstanceId: "elasticSearch_0",
                                searchCategory: "Thema"
                            }
                        }
                    }
                }
            };

            checkLayerSelectionSearchConfig({commit, rootGetters, rootState});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setShowAllResultsSearchInterfaceInstances");
            expect(commit.firstCall.args[1]).to.be.deep.equals(searchInterfaceInstances);
            expect(commit.secondCall.args[0]).to.eql("setAddLayerButtonSearchActive");
            expect(commit.secondCall.args[1]).to.be.true;
        });
    });
});
