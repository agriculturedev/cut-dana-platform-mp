<script>
import {mapGetters, mapMutations} from "vuex";
import SearchBarResultListGeneral from "./SearchBarResultListGeneral.vue";
import SearchBarResultListTopicTree from "./SearchBarResultListTopicTree.vue";

/**
 * Searchbar result list to show the categorized overview or single search results.
 * @module modules/searchBar/components/SearchBarResultList
 * @vue-props {Object} limitedSortedSearchResults - Results the limited and sorted search results.
 * @vue-data {Array} currentShowAllList - Array of the single search results to show from the 'show all' button.
 */
export default {
    name: "SearchBarResultList",
    components: {
        SearchBarResultListGeneral,
        SearchBarResultListTopicTree
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
            "currentAvailableCategories",
            "showAllResultsSearchInterfaceInstance",
            "minCharacters",
            "searchInput",
            "searchInterfaceInstances",
            "searchResults",
            "searchResultsActive",
            "currentSide",
            "addLayerButtonSearchActive"
        ]),
        ...mapGetters("Menu", [
            "currentComponent"
        ]),

        /**
         * Returns the result items for the current available categories.
         * @returns {Object[]} The result items.
         */
        resultItems () {
            if (this.currentComponent(this.currentSide).type === "layerSelection") {
                return this.limitedSortedSearchResults?.currentShowAllList;
            }

            return this.limitedSortedSearchResults?.currentShowAllList.filter(item => this.currentAvailableCategories.startsWith(item.category));
        },

        /**
         * Returns the name of the hit template for result items.
         * @returns {String} The hit template name.
         */
        hitTemplate () {
            if (this.resultItems) {
                return this.searchInterfaceInstances.find(instance => instance.searchInterfaceId === this.resultItems[0]?.searchInterfaceId)?.hitTemplate;
            }
            return undefined;
        }
    },
    methods: {
        ...mapMutations("Modules/SearchBar", [
            "setSearchResultsActive"
        ])
    }
};
</script>

<template lang="html">
    <div
        v-if="searchInput?.length >= minCharacters && searchResultsActive && searchResults?.length > 0"
        class="results-container"
    >
        <div id="search-bar-result-list">
            <h5
                v-if="!addLayerButtonSearchActive"
                id="search-bar-result-heading"
                class="bold mb-4 mt-4"
                :title="$t('common:modules.searchBar.searchResultsFrom') + limitedSortedSearchResults?.results.categoryProvider[currentAvailableCategories] + '-' + $t('common:modules.searchBar.search')"
            >
                <img
                    v-if="limitedSortedSearchResults?.results[currentAvailableCategories + 'ImgPath']"
                    alt="search result image"
                    src="searchResult.imgPath"
                >
                <i
                    v-if="!limitedSortedSearchResults?.results[currentAvailableCategories + 'ImgPath']"
                    :class="limitedSortedSearchResults?.results[currentAvailableCategories + 'Icon']"
                />
                {{ currentAvailableCategories + ": " + limitedSortedSearchResults?.results[currentAvailableCategories + "Count"] + "    " + $t("common:modules.searchBar.searchResults") }}
            </h5>
            <SearchBarResultListTopicTree
                v-if="hitTemplate === 'layer'"
                :result-items="resultItems"
            />
            <SearchBarResultListGeneral
                v-else
                :result-items="resultItems"
            />
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
.results-container {
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
