<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import mutations from "../store/mutationsRouting";
import * as constantsRouting from "../store/constantsRouting";
import SpinnerItem from "../../../shared/modules/spinner/components/SpinnerItem.vue";
import store from "../../../app-store/index";

/**
 * RoutingTemplate
 * @module modules/RoutingTemplate
 * @vue-data {*} constantsRouting - The constants.
 *
 * @vue-computed {Object} activeRoutingToolOptionComponent - The current component for the active tab.
 */
export default {
    name: "RoutingTemplate",
    components: {
        SpinnerItem
    },
    data () {
        return {
            constantsRouting
        };
    },
    computed: {
        ...mapGetters("Modules/Routing", ["activeRoutingToolOption", "routingToolOptions", "taskHandler", "filteredRoutingToolOptions"]),
        ...mapGetters("Modules/Routing/Directions", ["isLoadingDirections"]),
        ...mapGetters("Modules/Routing/Isochrones", ["isLoadingIsochrones"]),
        /**
         * Computed value to get the current component for the active tab
         * @returns {Object} vue component to render
         */
        activeRoutingToolOptionComponent () {
            return this.filteredRoutingToolOptions.find(option => option.id === this.activeRoutingToolOption)?.component;
        }
    },
    async created () {
        await this.initRouting();
    },
    unmounted () {
        store.dispatch("Modules/Routing/Isochrones/closeIsochrones");
        store.dispatch("Modules/Routing/Directions/closeDirections");
    },
    methods: {
        ...mapMutations("Modules/Routing", Object.keys(mutations)),
        ...mapActions("Modules/Routing", ["initRouting"]),
        /**
         * Changes the active tab
         * Will not change the tab if a batch process is running
         * @param {String} option to change to
         * @returns {void}
         */
        changeActiveRoutingToolOption (option) {
            if (this.taskHandler) {
                return;
            }
            this.setActiveRoutingToolOption(option);
        }
    }
};
</script>

<template lang="html">
    <div id="routing">
        <div
            class="d-flex"
        >
            <button
                v-for="routingToolOption of filteredRoutingToolOptions"
                :key="routingToolOption.id"
                :style="{
                    width: `calc(100% / ${filteredRoutingToolOptions.length})`,
                }"
                :class="[
                    'routingtooltab d-flex justify-content-center py-3 pointer',
                    activeRoutingToolOption === routingToolOption.id ? 'active' : '',
                ]"
                @click="changeActiveRoutingToolOption(routingToolOption.id)"
                @keydown.enter="changeActiveRoutingToolOption(routingToolOption.id)"
            >
                <span>{{ $t("common:modules.routing.tabs." + routingToolOption.id) }}</span>
                <SpinnerItem
                    v-if="(routingToolOption.id === 'DIRECTIONS' && isLoadingDirections) || (routingToolOption.id === 'ISOCHRONES' && isLoadingIsochrones)"
                    :custom-class="'ms-2 spinner'"
                />
            </button>
        </div>

        <hr>

        <component :is="activeRoutingToolOptionComponent" />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

    .pointer {
        cursor: pointer;
    }

    .routingtooltab {
        border: none;
        background-color: $white;
    }

    .routingtooltab.active {
        background: #dbdbdb;
    }
    .bi-question-circle-fill {
        font-size: $font_size_huge;
    }
    .spinner {
        width: 1.3rem;
        height: 1.3rem;
    }
</style>
