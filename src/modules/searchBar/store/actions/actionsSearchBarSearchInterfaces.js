/**
 * Contains actions that communicate with the search interfaces.
 * @module modules/searchBar/store/actions/actionsSearchBarSearchInterfaces
 */
import SearchInterfaceBkg from "../../searchInterfaces/searchInterfaceBkg";
import SearchInterfaceElasticSearch from "../../searchInterfaces/searchInterfaceElasticSearch";
import SearchInterfaceGazetteer from "../../searchInterfaces/searchInterfaceGazetteer";
import SearchInterfaceKomootPhoton from "../../searchInterfaces/searchInterfaceKomootPhoton";
import SearchInterfaceLocationFinder from "../../searchInterfaces/searchInterfaceLocationFinder";
import SearchInterfaceOsmNominatim from "../../searchInterfaces/searchInterfaceOsmNominatim";
import SearchInterfaceTopicTree from "../../searchInterfaces/searchInterfaceTopicTree";
import SearchInterfaceSpecialWfs from "../../searchInterfaces/searchInterfaceSpecialWfs";
import SearchInterfaceVisibleVector from "../../searchInterfaces/searchInterfaceVisibleVector";

export default {
    /**
     * Instantiate the configured search interfaces
     * and stores them in the state.
     * @param {Object} param.commit the commit
     * @param {Object} param.state the state
     * @param {Object[]} [searchInterfaceAddons=[]] The search interface addons.
     * @returns {void}
     */
    instantiateSearchInterfaces: ({commit, state}, searchInterfaceAddons = []) => {
        const searchInterfacesMapper = {
            bkg: SearchInterfaceBkg,
            elasticSearch: SearchInterfaceElasticSearch,
            gazetteer: SearchInterfaceGazetteer,
            komootPhoton: SearchInterfaceKomootPhoton,
            locationFinder: SearchInterfaceLocationFinder,
            osmNominatim: SearchInterfaceOsmNominatim,
            topicTree: SearchInterfaceTopicTree,
            visibleVector: SearchInterfaceVisibleVector,
            specialWfs: SearchInterfaceSpecialWfs
        };

        Object.assign(searchInterfacesMapper, ...searchInterfaceAddons);
        commit("setSearchInterfaceInstances", []);
        commit("addMultipleSearchInterfaceIds");
        state.searchInterfaces.forEach(searchInterface => {
            const type = searchInterface.type;

            if (searchInterfacesMapper[type]) {
                commit("addSearchInterfaceInstances", new searchInterfacesMapper[type](searchInterface));
            }
            else {
                console.warn(`The searchInterface: "${type}" hasn't been implemented yet`);
            }
        });
    },
    /**
     * Starts the search in searchInterfaces, if min characters are introduced.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @returns {void}
     */
    startSearch: ({dispatch, state}) => {
        if (state.searchInput.length >= parseInt(state.minCharacters, 10)) {
            dispatch("search", {searchInput: state.searchInput});
        }
    },
    /**
     * Send search input to configured searchInterfaces
     * and push the response objects to the state attribute "searchResults".
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @param {Object} payload The payload.
     * @param {Object} payload.searchInput The search input.
     * @returns {void}
     */
    search: ({getters, commit, dispatch, state}, {searchInput}) => {
        dispatch("cleanSearchResults");
        let currentSearchInterfaceInstances = state.searchInterfaceInstances;

        if (getters.showAllResults) {
            currentSearchInterfaceInstances = state.searchInterfaceInstances.filter(instance => {
                let contained = false;

                getters.showAllResultsSearchInterfaceInstances.forEach(interfaceInstance => {
                    if (instance.searchInterfaceId === interfaceInstance.id) {
                        contained = true;
                    }
                });
                return contained;
            });
        }

        currentSearchInterfaceInstances.forEach(instance => {
            instance.clearSearchResults();
            instance.search(searchInput)
                .then(searchResults => {
                    commit("addSearchResults", {searchResults});
                })
                .catch(error => {
                    if (String(error) !== "AbortError: The user aborted a request." && error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
                        console.error(error);
                    }
                });
        });
    },

    /**
     * Clean the search results.
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    cleanSearchResults: ({commit}) => {
        commit("setSearchResults", []);
    }
};
