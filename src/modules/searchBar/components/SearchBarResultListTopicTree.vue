<script>
import {mapGetters} from "vuex";
import SearchBarResultListTopicTreeItem from "./SearchBarResultListTopicTreeItem.vue";

/**
 * Searchbar result list to show search results for topic tree.
 * @module modules/searchBar/components/SearchBarResultListTopicTree
 * @vue-props {Object[]} resultItems - The result items.
 * @vue-data {Object} items - All result items by category.
 * @vue-data {Boolean} watchFirstTime - is set to true, if watched first time at prop resultItems
 */
export default {
    name: "SearchBarResultListTopicTree",
    components: {
        SearchBarResultListTopicTreeItem
    },
    props: {
        resultItems: {
            type: Array,
            required: true
        }
    },
    data: () => {
        return {
            items: {}
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", [
            "searchInput",
            "searchResults",
            "selectedSearchResults"
        ])
    },
    watch: {
        resultItems: {
            /**
             * New search results is added to items.
             * @param {Array} newSearchResult new search result
             * @returns {void}
             */
            handler (newSearchResult) {
                this.sortByCategories(newSearchResult);
            },
            deep: true
        }
    },
    created () {
        this.sortByCategories(this.resultItems);
    },
    methods: {
        /**
         * Sorts the search results by category and fills items.
         * @param {Array} searchResults the searchResults
         * @returns {void}
         */
        sortByCategories (searchResults) {
            searchResults.forEach(searchResult => {
                if (this.items[searchResult.category] === undefined) {
                    this.items[searchResult.category] = [searchResult];
                }
                else if (!this.items[searchResult.category].find(result => result.id === searchResult.id)) {
                    this.items[searchResult.category].push(searchResult);
                }
            });
        }
    }
};
</script>

<template lang="html">
    <div class="results-topic-tree-container">
        <div
            v-for="(category, index) in Object.keys(items)"
            :key="category + '-' + index"
        >
            <h5
                class="bold mb-4 mt-4"
                :title="$t('common:modules.searchBar.searchResultsFrom') + category + '-' + $t('common:modules.searchBar.search')"
            >
                <img
                    v-if="items[category][0]?.imgPath"
                    alt="search result image"
                    src="items[category][0].imgPath"
                >
                <i
                    v-if="!items[category][0]?.imgPath"
                    :class="items[category][0]?.icon"
                />
                {{ category + ": " + items[category].length + "    " + $t("common:modules.searchBar.searchResults") }}
            </h5>
            <div
                v-for="(item, idx) in items[category]"
                :key="item.id + '-' + idx"
            >
                <span :id="'searchInputLi' + idx">
                    <SearchBarResultListTopicTreeItem
                        :search-result="item"
                    />
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.results-topic-tree-container {
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
