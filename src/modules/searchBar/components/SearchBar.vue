<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import SearchBarSuggestionList from "./SearchBarSuggestionList.vue";
import SearchBarResultList from "./SearchBarResultList.vue";

/**
 * Searchbar to access search results.
 * @module modules/searchBar/components/SearchBar
 * @vue-computed {String} searchInputValue - The v-bind of search input value.
 * @vue-computed {Object} limitedSortedSearchResults - Results the limited and sorted search results.
 */
export default {
    name: "SearchBar",
    components: {
        SearchBarResultList,
        SearchBarSuggestionList
    },
    props: {
        clickAction: {
            type: Function,
            default: undefined,
            required: false
        }
    },
    data: function () {
        return {
            currentComponentSide: undefined,
            currentSearchInput: this.searchInput,
            layerSelectionPlaceHolder: this.placeholder
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", [
            "configPaths",
            "minCharacters",
            "placeholder",
            "searchInput",
            "searchInterfaceInstances",
            "searchResults",
            "showAllResults",
            "suggestionListLength",
            "addLayerButtonSearchActive",
            "type",
            "currentSide"
        ]),
        ...mapGetters("Menu",
            {menuCurrentComponent: "currentComponent", previousNavigationEntryText: "previousNavigationEntryText"}
        ),
        ...mapGetters([
            "portalConfig"
        ]),
        /**
         * v-bind of search input value.
         */
        searchInputValue: {
            get () {
                return this.searchInput;
            },
            set (searchInput) {
                this.setSearchInput(searchInput);
            }
        },
        /**
         * Check if search should be activated.
         * @returns {Boolean} True if search should be executed.
         */
        searchActivated () {
            return this.searchInputValue?.length >= parseInt(this.minCharacters, 10);
        },
        /**
         * Updates the categories to unique categories.
         * @returns {Object} The searchresults with unique categories.
         */
        searchResultsWithUniqueCategories () {
            if (this.searchInterfaceInstances.every(searchInterfaceInstance => searchInterfaceInstance.searchState !== "running")) {
                const categories = [...new Set(this.searchResults.map(searchResult => searchResult.category))];

                categories.forEach(category => {
                    const searchResultsByCategory = this.searchResults.filter(searchResult => searchResult.category === category),
                        searchInterfaceIds = [...new Set(searchResultsByCategory.map(searchResult => searchResult.searchInterfaceId))];

                    if (searchInterfaceIds.length > 1) {
                        let count = 0;

                        searchInterfaceIds.forEach(searchInterfaceId => {
                            searchResultsByCategory.forEach(searchResult => {
                                if (searchResult.searchInterfaceId === searchInterfaceId) {
                                    searchResult.category = searchResult.category + "_" + count;
                                }
                            });

                            ++count;
                        });
                    }
                });
            }

            return this.searchResults;
        },

        /**
         * Sorts the results according the configured search providers and prepare the suggestionlist with the limit of suggestionListLength, updates searchSuggestions
         * Prepares currentShowAllList (used to show all results of a category).
         * @returns {Object} results the limited and sorted search results.
         */
        limitedSortedSearchResults () {
            const results = {},
                currentShowAllList = [];

            results.categoryProvider = {};
            this.setSearchSuggestions([]);
            results.availableCategories = [];
            this.searchInterfaceInstances.forEach(searchInterfaceInstance => {
                for (const [index, value] of Object.entries(this.searchResultsWithUniqueCategories)) {
                    if (value.searchInterfaceId === searchInterfaceInstance.searchInterfaceId) {
                        results[value.category + "Count"] = results[value.category + "Count"] === undefined ? 1 : ++results[value.category + "Count"];


                        if (results.availableCategories.includes(value.category) === false) {
                            results.availableCategories.push(value.category);
                            results.categoryProvider[value.category] = value.searchInterfaceId;
                        }

                        currentShowAllList.push(value);

                        if (results[value.category + "Count"] <= this.suggestionListLength) {
                            results[index] = value;
                            this.addSuggestionItem(value);
                        }
                        if (value.imgPath) {
                            results[value.category + "ImgPath"] = value.imgPath;
                        }
                        if (value.icon) {
                            results[value.category + "Icon"] = value.icon;
                        }
                    }
                }
            });

            return {results: results, currentShowAllList: currentShowAllList};
        }
    },
    watch: {
        /**
        * Watcher to check the current component
        */
        currentComponentSide: {
            handler (newVal) {
                if (newVal === "root" || (newVal === "layerSelection" && this.addLayerButtonSearchActive === true)) {
                    this.$refs?.searchInput.blur();
                    if (newVal === "root") {
                        this.setSearchResultsActive(false);
                        this.navigateBack(this.currentSide);
                    }
                }
                if (newVal === "layerSelection" && this.addLayerButtonSearchActive === true) {
                    this.layerSelectionPlaceHolder = "common:modules.searchBar.search";
                }
                else {
                    this.layerSelectionPlaceHolder = this.placeholder;
                }
                this.setGlobalPlaceholder(this.layerSelectionPlaceHolder);
            },
            deep: true
        },
        /**
        * Watcher to check the searchInputValue for layerSelection module
        */
        searchInputValue: {
            handler (value) {
                if (value === "") {
                    this.removePointMarker();
                    this.removePolygonMarker();
                }
                else {
                    this.checkCurrentComponent(this.currentComponentSide);
                }
            },
            deep: true
        },
        /**
         * Watcher for value of placeholder.
         */
        placeholder (newValue) {
            this.layerSelectionPlaceHolder = newValue;
        }
    },
    mounted () {
        this.checkLayerSelectionSearchConfig();
        this.setCurrentSide(this.portalConfig?.mainMenu?.searchBar !== undefined ? "mainMenu" : "secondaryMenu");
        this.currentComponentSide = this.menuCurrentComponent(this.currentSide).type;
        this.initializeModule({configPaths: this.configPaths, type: this.type});
        this.overwriteDefaultValues();
        this.instantiateSearchInterfaces(this.$searchInterfaceAddons);
        this.focusInput();
    },
    methods: {
        ...mapActions(["initializeModule"]),
        ...mapActions("Maps", ["removePointMarker", "removePolygonMarker"]),
        ...mapActions("Modules/SearchBar", [
            "instantiateSearchInterfaces",
            "overwriteDefaultValues",
            "activateActions",
            "startLayerSelectionSearch",
            "checkLayerSelectionSearchConfig",
            "search"
        ]),
        ...mapActions("Menu", [
            "navigateBack"
        ]),
        ...mapMutations("Modules/SearchBar", [
            "setGlobalPlaceholder",
            "addSuggestionItem",
            "setSearchInput",
            "setSearchResultsActive",
            "setSearchSuggestions",
            "setCurrentSide"
        ]),
        ...mapMutations("Menu", [
            "switchToRoot",
            "switchToPreviousComponent",
            "setCurrentComponentBySide",
            "setNavigationHistoryBySide",
            "setCurrentComponentPropsName"
        ]),
        /**
         * Starts the search in searchInterfaces, if min characters are introduced, updates the result list.
         * @param {String} currentComponentSide Current component type
         * @returns {void}
         */
        startSearch (currentComponentSide) {
            if (this.searchActivated) {
                if (currentComponentSide === "root") {
                    this.clickAction();
                }
                this.setSearchResultsActive(true);
                this.search({searchInput: this.searchInputValue});
            }
        },
        /**
         * Sets the focus to the searchbar input.
         * @returns {void}
         */
        focusInput () {
            this.$refs.searchInput.focus();
        },
        /**
         * Handles the input action behavior of the search
         * @param {String} currentComponentType Current component type
         * @returns {void}
         */
        checkCurrentComponent (currentComponentType) {
            if (currentComponentType === "root") {
                this.clickAction();
            }
            else if (currentComponentType === "layerSelection") {
                if (this.searchInputValue?.length === 0) {
                    this.navigateBack(this.currentSide);
                    this.startLayerSelectionSearch(this.currentSide);
                    this.startSearch();
                }
                if (this.searchInputValue.length >= this.minCharacters) {
                    this.startLayerSelectionSearch(this.currentSide);
                    this.startSearch();
                }
            }
            else {
                this.startSearch();
            }
        },
        /**
         * Zooms to and sets a marker at the given search result
         * @param {String} searchInputValue the input value
         * @returns {void}
         */
        zoomToAndMarkSearchResult (searchInputValue) {
            if (searchInputValue !== undefined) {
                this.removePointMarker();
                this.searchResults.forEach(searchResult => {
                    if (searchResult.category.startsWith("Adresse") || searchResult.category.startsWith("Straße")) {
                        if (searchInputValue.toLowerCase() === searchResult.name.toLowerCase()) {
                            this.activateActions({searchResult, actionType: "onClick"});
                        }
                    }
                });
            }
        }
    }
};
</script>

<template lang="html">
    <div id="search-bar">
        <div class="input-group mb-3">
            <input
                id="searchInput"
                ref="searchInput"
                v-model="searchInputValue"
                type="search"
                class="form-control"
                :placeholder="$t(layerSelectionPlaceHolder)"
                :aria-label="$t(layerSelectionPlaceHolder)"
                @keydown.enter="zoomToAndMarkSearchResult(searchInputValue), startSearch(currentComponentSide)"
            >
            <button
                id="search-button"
                class="btn btn-primary"
                :disabled="!searchActivated"
                :aria-label="$t(placeholder)"
                type="button"
                @click="zoomToAndMarkSearchResult(searchInputValue), startSearch(currentComponentSide)"
            >
                <i
                    class="bi-search"
                    role="img"
                />
            </button>
        </div>
        <SearchBarSuggestionList
            v-if="!showAllResults"
            :limited-sorted-search-results="limitedSortedSearchResults"
        />
        <SearchBarResultList
            v-else-if="showAllResults"
            :limited-sorted-search-results="limitedSortedSearchResults"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    #search-bar {
        #search-button {
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
        }
        .input-label {
            color: $placeholder-color;
        }
    }
    .overflowHidden{
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>

