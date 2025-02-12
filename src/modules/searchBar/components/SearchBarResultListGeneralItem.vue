<script>
import {mapActions} from "vuex";
import ActionButton from "./ActionButton.vue";

/**
 * Searchbar - single item of a search suggestion.
 * @module modules/searchBar/components/SearchBarResultListGeneralItem
 * @vue-props {Object} searchResult - A single search result.
 */
export default {
    name: "SearchBarResultListGeneralItem",
    components: {
        ActionButton
    },
    props: {
        searchResult: {
            type: Object,
            required: true
        }
    },
    computed: {
        /**
         * Returns all actions stored in 'searchResult.events.buttons'.
         * @returns{Object} all actions to execute on click
         */
        actions () {
            return this.searchResult.events.buttons ? this.searchResult.events.buttons : [];
        }
    },
    methods: {
        ...mapActions("Modules/SearchBar", [
            "activateActions"
        ])
    }
};
</script>

<template lang="html">
    <div :id="'search-bar-result-list-general-item' + searchResult.id">
        <div class="d-flex flex-row bd-highlight bold">
            <button
                type="button"
                class="btn btn-light d-flex"
                :title="searchResult.toolTip ? searchResult.toolTip : searchResult.name"
                :aria-label="searchResult.toolTip ? searchResult.toolTip : searchResult.name"
                @click="activateActions({searchResult: searchResult, actionType: 'onClick'})"
                @keydown.enter="activateActions({searchResult: searchResult, actionType: 'onClick'})"
                @mouseover="activateActions({searchResult: searchResult, actionType: 'onHover'})"
                @focus="activateActions({searchResult: searchResult, actionType: 'onHover'})"
            >
                <span class="btn-title">
                    {{ searchResult.name }}
                </span>
            </button>
            <div class="ms-auto mt-1 d-flex">
                <div
                    v-for="(action, i) in Object.keys(actions)"
                    :key="i"
                >
                    <ActionButton
                        :action-name="action"
                        :action-args="actions[action]"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.btn {
    align-items: center;
    justify-content: left;
    white-space: nowrap;
    min-height: 2.5rem;
    width: 80%;

    .btn-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
