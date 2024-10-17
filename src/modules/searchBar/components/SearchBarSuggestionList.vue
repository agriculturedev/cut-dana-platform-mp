<script>
import {mapGetters, mapMutations} from "vuex";
import SearchBarSuggestionListItem from "./SearchBarSuggestionListItem.vue";

/**
 * Searchbar result list to show the categorized overview or single search results.
 * @module modules/searchBar/components/SearchBarSuggestionList
 * @vue-props {Object} limitedSortedSearchResults - Results the limited and sorted search results.
 * @vue-data {Array} currentShowAllList - Array of the single search results to show from the 'show all' button.
 */
export default {
    name: "SearchBarSuggestionList",
    components: {
        SearchBarSuggestionListItem
    },
    props: {
        limitedSortedSearchResults: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            currentShowAllList: []
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", [
            "minCharacters",
            "searchInput",
            "searchResults",
            "searchResultsActive",
            "showAllResults",
            "currentSide"
        ]),
        ...mapGetters("Menu", [
            "menuBySide"
        ]),
        ...mapGetters([
            "portalConfig"
        ])
    },
    methods: {
        ...mapMutations("Modules/SearchBar", [
            "setCurrentAvailableCategories",
            "setSearchResultsActive",
            "setShowAllResults",
            "setShowAllResultsSearchInterfaceInstances"
        ]),
        ...mapMutations("Menu", [
            "setNavigationCurrentComponentBySide",
            "setNavigationHistoryBySide",
            "setCurrentComponent",
            "setCurrentComponentBySide"
        ]),
        /**
         * Prepares the all results list of one category and adapts the navigation history
         * @param {String} categoryItem the category of the results
         * @returns {void}
         */
        prepareShowAllResults (categoryItem) {
            const side = this.currentSide;

            this.setShowAllResultsSearchInterfaceInstances(this.limitedSortedSearchResults.results.categoryProvider[categoryItem]);
            if (this.menuBySide(side)) {
                this.setNavigationCurrentComponentBySide({side: side, newComponent: {props: {name: "common:modules.searchBar.searchResults"}, type: "searchbar"}});
                this.setCurrentComponentBySide({side: side, type: "searchbar"});
                this.setNavigationHistoryBySide({side: side, newHistory: [{type: "root", props: []}, {type: "searchBar", props: {name: "modules.searchBar.searchBar"}}, {type: "searchBar", props: {name: "modules.searchBar.searchResultList"}}]});
            }
            this.setCurrentAvailableCategories(categoryItem);
            this.currentShowAllList = this.limitedSortedSearchResults.currentShowAllList.filter(value => {
                return value.category === categoryItem;
            });

            this.setShowAllResults(true);
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="searchInput?.length >= minCharacters && searchResultsActive && searchResults?.length > 0"
        class="suggestions-container"
    >
        <div
            v-for="categoryItem in limitedSortedSearchResults.results.availableCategories"
            id="search-bar-suggestion-list"
            :key="categoryItem"
        >
            <h5
                id="search-bar-suggestion-heading"
                class="bold mb-4 mt-4"
                :title="$t('common:modules.searchBar.searchResultsFrom') + limitedSortedSearchResults.results.categoryProvider[categoryItem] + '-' + $t('common:modules.searchBar.search')"
            >
                <img
                    v-if="limitedSortedSearchResults.results[categoryItem + 'ImgPath']"
                    alt="search result image"
                    src="searchResult.imgPath"
                >
                <i
                    v-if="!limitedSortedSearchResults.results[categoryItem + 'ImgPath']"
                    :class="limitedSortedSearchResults.results[categoryItem + 'Icon']"
                />

                {{ categoryItem +": " + limitedSortedSearchResults.results[categoryItem+"Count"] + "    " + $t("common:modules.searchBar.searchResults") }}
            </h5>
            <div
                v-for="(item, index) in showAllResults===false ? limitedSortedSearchResults.results : limitedSortedSearchResults.currentShowAllList"
                :key="item.id + '-' + index"
            >
                <p
                    v-if="item.category===categoryItem"
                    :id="'suggestion_searchInputLi' + index"
                    class="mb-0"
                >
                    <SearchBarSuggestionListItem
                        :search-suggestion="item"
                    />
                </p>
            </div>
            <div class="showAllSection">
                <button
                    type="button"
                    class="btn btn-light d-flex text-left"
                    :title="$t('common:modules.searchBar.showAllResults')"
                    @click="prepareShowAllResults(categoryItem)"
                >
                    {{ $t("common:modules.searchBar.showAll") }}
                    <span class="bi-chevron-right" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
button {
    span {
        margin-top: .1rem;
        margin-left: .25rem;
    }
}
.suggestions-container {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 70vH;
}
.showAllSection {
    display: flex;
    justify-content: right;
    align-items: right;
}
</style>
