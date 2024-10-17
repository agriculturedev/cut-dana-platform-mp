/**
 * Contains global actions of the search bar.
 * @module modules/searchBar/store/actions/actionsSearchBar
 */
import actionsSearchBarResultList from "./actionsSearchBarResultList";
import actionsSearchBarSearchInterfaces from "./actionsSearchBarSearchInterfaces";
import actionsSearchBarSearchResult from "./actionsSearchBarSearchResult";
import SearchInterface from "../../searchInterfaces/searchInterface";

export default {
    ...actionsSearchBarResultList,
    ...actionsSearchBarSearchInterfaces,
    ...actionsSearchBarSearchResult,

    /**
     * Overwrite default values in search interface.
     * @param {Object} param.state the state
     * @returns {void}
     */
    overwriteDefaultValues: ({state}) => {
        SearchInterface.prototype.timeout = state.timeout;
    },
    /**
     * Handles the switch from the single result view to the search overview and updates the menu navigation values.
     * @param {Object} param.getters the getters
     * @param {Object} param.commit the commit
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} side the menu side of the search
     * @returns {void}
     */
    updateSearchNavigation: ({getters, commit, rootGetters}, side) => {
        const type = rootGetters["Menu/currentComponent"](side).type;

        if (getters.showAllResults === true && side === getters.currentSide && getters.currentActionEvent === "") {
            if (type !== "searchbar") {
                commit("setShowAllResults", false);
                commit("Menu/switchToPreviousComponent", side, {root: true});
            }
            else {
                commit("setShowAllResults", false);
                commit("Menu/setCurrentComponentPropsName", {side: side, name: "common:modules.searchBar.searchResultList"}, {root: true});
                commit("Menu/setNavigationHistoryBySide", {side: side, newHistory: [{type: "root", props: []}]}, {root: true});
            }
        }
        if (side !== getters.currentSide) {
            commit("Menu/switchToPreviousComponent", side, {root: true});
        }
        if (getters.currentSearchInputValue !== "" && getters.currentActionEvent !== "") {
            commit("Modules/SearchBar/setShowAllResults", true, {root: true});
            commit("Modules/SearchBar/setSearchInput", getters.currentSearchInputValue, {root: true});
            commit("Modules/SearchBar/setCurrentSearchInputValue", "", {root: true});
            commit("Modules/SearchBar/setCurrentActionEvent", "", {root: true});
        }
    },
    /**
     * Handles the switch from the single result view to the search overview and updates the menu navigation values.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.commit the commit
     * @param {Object} side the menu side of the search
     * @returns {void}
     */
    startLayerSelectionSearch: ({dispatch, commit}, side) => {
        commit("setShowAllResults", true);
        dispatch("Menu/clickedMenuElement", {
            name: "common:modules.searchBar.searchResultList",
            side: side,
            type: "searchbar"
        }, {root: true});
        commit("Menu/setCurrentComponent", {type: "layerSelection", side: side, props: []}, {root: true});
        commit("Menu/setCurrentComponentPropsName", {side: side, name: "common:modules.searchBar.searchResults"}, {root: true});
        commit("Menu/setNavigationHistoryBySide", {side: side, newHistory: [{type: "root", props: []}, {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}}, {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}}]}, {root: true});
    },
    /**
     * Checks for addlayer search configuration (instance and topic)
     * @param {Object} param.commit the commit
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} param.rootState the rootState
     * @returns {void}
     */
    checkLayerSelectionSearchConfig: ({commit, rootGetters, rootState}) => {
        const searchBar = rootState.portalConfig?.tree?.addLayerButton?.searchBar;

        if (rootGetters.showLayerAddButton === true && searchBar && searchBar?.active !== undefined) {
            if (searchBar.searchInterfaceInstances) {
                const searchInterfaceInstances = [];

                searchBar.searchInterfaceInstances.forEach(searchInterfaceInstance => {
                    if (searchInterfaceInstance.searchCategory) {
                        searchInterfaceInstances.push(searchInterfaceInstance);
                    }
                });
                commit("setShowAllResultsSearchInterfaceInstances", searchInterfaceInstances);
            }
            /**
             * @deprecated in the next major-release!
             * showAllResultsSearchInterfaceInstance
             * showAllResultsSearchCategory
             */
            else if (searchBar.searchInterfaceInstanceId || searchBar.searchCategory) {
                if (searchBar.searchCategory && searchBar?.searchInterfaceInstanceId) {
                    const instance = {
                        "id": searchBar.searchInterfaceInstanceId,
                        "searchCategory": searchBar.searchCategory
                    };

                    commit("setShowAllResultsSearchInterfaceInstances", [instance]);
                }
                else {
                    console.warn("Please check the searchBar configuration at tree.addLayerButton");
                }
            }
            if (typeof searchBar.active === "boolean") {
                commit("setAddLayerButtonSearchActive", searchBar.active);
            }
        }
        else {
            commit("setAddLayerButtonSearchActive", false);
        }
    }
};
