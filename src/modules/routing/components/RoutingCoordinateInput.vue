<script>
import {mapActions, mapGetters} from "vuex";
import {RoutingGeosearchResult} from "../js/classes/routing-geosearch-result";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";

/**
 * RoutingCoordinateInput
 * @module modules/RoutingCoordinateInput
 * @vue-prop {Object} waypoint - The waypoints.
 * @vue-prop {Number} countWaypoints - The number of waypoints.
 *
 * @vue-data {String} search - The waypoints display name.
 * @vue-data {Boolean} awaitingSearch - Shows if search is awaited.
 * @vue-data {Array} searchResults - The list of search results.
 * @vue-data {Boolean} ignoreNextSearchChange - Shows if the next change of the search should be ignored.
 * @vue-data {Boolean} isFocused - Shows if input is focused.
 *
 * @vue-computed {String} waypointDisplayName - The waypoint display name.
 *
 * @vue-event {String} moveWaypointDown - Emits function to move waypoint down.
 * @vue-event {String} moveWaypointUp - Emits function to move waypoint up.
 * @vue-event {String} searchResultSelected - Emits function to select search result.
 * @vue-event {Boolean} removeWaypoint - Emits function to remove waypoint.
 */
export default {
    name: "RoutingCoordinateInput",
    components: {IconButton},
    props: {
        waypoint: {
            type: Object,
            required: true
        },
        countWaypoints: {
            type: Number,
            required: true
        }
    },
    emits: [
        "moveWaypointDown",
        "moveWaypointUp",
        "searchResultSelected",
        "removeWaypoint"
    ],
    data () {
        return {
            search: this.waypoint.getDisplayName()
                ? this.waypoint.getDisplayName()
                : "",
            awaitingSearch: false,
            searchResults: [],
            ignoreNextSearchChange: false,
            isFocused: false
        };
    },
    computed: {
        ...mapGetters("Modules/Routing/Directions", ["waypoints"]),
        /**
         * Computed value for the waypoint display name to watch for changes
         * @returns {String} the display name for the waypoint
         */
        waypointDisplayName () {
            return this.waypoint.getDisplayName();
        }
    },
    watch: {
        /**
         * Resets the input text string and makes sure that no additional request is made if the waypoint display name changes
         * @param {String} val new display name
         * @return {void}
         */
        waypointDisplayName: function (val) {
            this.ignoreNextSearchChange = true;
            this.search = !val ? "" : val;
        },

        waypoints: {
            /**
             * If lastWaypoints are null, means first time waypoints are set
             * and a waypoint from extern is found (property 'fromExtern' is true) the external waypoint is set as start point.
             * @param {Array} waypoints new waypoints
             * @param {Array} lastWaypoints last waypoints
             * @returns {void}
             */
            handler (waypoints, lastWaypoints) {
                if (lastWaypoints === null) {
                    const externWayPoints = waypoints.filter(
                        (waypoint) => waypoint.fromExtern === true
                    );

                    if (externWayPoints && externWayPoints.length > 0) {
                        this.search = externWayPoints[0].displayName;
                    }
                }
            },
            deep: true
        },

        /**
         * Starts a request if no new input comes after a short delay.
         * @returns {void}
         */
        search: function () {
            if (this.ignoreNextSearchChange) {
                this.ignoreNextSearchChange = false;
                return;
            }
            if (!this.awaitingSearch) {
                setTimeout(async () => {
                    this.awaitingSearch = false;
                    const isWgs84Coordinate = this.isInputtextWgs84Coordinate(
                        this.search
                    );

                    if (isWgs84Coordinate) {
                        await this.selectWgs84Coordinate(isWgs84Coordinate);
                    }
                    else {
                        this.searchResults = await this.fetchCoordinatesByText({
                            search: this.search
                        });
                    }
                }, 1000);
            }
            this.awaitingSearch = true;
        }
    },
    methods: {
        ...mapActions("Modules/Routing", [
            "fetchCoordinatesByText",
            "transformCoordinatesWgs84ToLocalProjection"
        ]),
        /**
         * Selects a result from the external service provider.
         * @param {RoutingGeosearchResult} searchResult which was selected by the user
         * @returns {void}
         */
        selectSearchResult (searchResult) {
            if (!(searchResult instanceof RoutingGeosearchResult)) {
                return;
            }
            this.waypoint.setFromGeosearchResult(searchResult);
            this.ignoreNextSearchChange = true;
            this.search = searchResult.getDisplayName();
            this.searchResults = [];
            this.$emit("searchResultSelected");
        },
        /**
         * Passes the input wgs84 coordinate to the waypoint
         * @param {Array<{Number, Number}>} wgs84Coordinate which was entered in the input text
         * @returns {void}
         */
        async selectWgs84Coordinate (wgs84Coordinate) {
            this.waypoint.setCoordinates(
                await this.transformCoordinatesWgs84ToLocalProjection(
                    wgs84Coordinate
                )
            );
            this.waypoint.setDisplayName(this.search);
            this.searchResults = [];
            this.$emit("searchResultSelected");
        },
        /**
         * Resets all input by the user and clears the search results.
         * @returns {void}
         */
        resetInput () {
            this.ignoreNextSearchChange = true;
            this.searchResults = [];
            if (this.waypoint.getDisplayName()) {
                this.search = this.waypoint.getDisplayName();
            }
            else {
                this.search = "";
            }
        },
        /**
         * Checks if the current input text string is in the lat, lng format
         * @returns {Boolean} true if current input text is in the lat, lng format in the wgs84 range
         */
        isInputtextWgs84Coordinate () {
            if (typeof this.search !== "string") {
                return false;
            }
            const [latString, lngString] = this.search.split(", "),
                lat = Number(latString),
                lng = Number(lngString);

            if (!latString || !lngString) {
                return false;
            }
            if (
                !isFinite(lat) ||
                Math.abs(lat) > 90 ||
                !isFinite(lng) ||
                Math.abs(lng) > 180
            ) {
                return false;
            }

            return [lat, lng];
        },
        /**
         * Creates placeholder text for the input field
         * @returns {String} placeholder text
         */
        getPlaceholder () {
            if (this.waypoint.index === 0) {
                return this.$t("common:modules.routing.startpoint");
            }
            else if (this.waypoint.index === this.countWaypoints - 1) {
                return this.$t("common:modules.routing.endpoint");
            }
            return this.$t("common:modules.routing.waypoint");
        }
    }
};
</script>

<template>
    <div class="form-group-sm mx-0 mb-4">
        <div class="d-flex justify-content-between">
            <label
                :id="'routingCoordinateLabel_' + waypoint.index"
                :for="'routingCoordinateInput_' + waypoint.index"
                class="d-flex flex-row pr-0 pl-0"
            >
                <input
                    :id="'routingCoordinateInput_' + waypoint.index"
                    v-model="search"
                    type="text"
                    class="col-md-11 form-control form-control-sm"
                    :placeholder="getPlaceholder()"
                    autocomplete="off"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                >
                <button
                    v-if="search.length > 0 && search !== waypointDisplayName"
                    class="btn-icon input-icon reset-button"
                    @click="resetInput()"
                    @keydown.enter="resetInput()"
                >
                    <i class="bi-x-lg fs-6" />
                </button>
            </label>
            <div class="d-flex">
                <div class="justify-content-between">
                    <div
                        v-show="waypoint.index !== 0"
                        class="h-50"
                    >
                        <IconButton
                            class="button-up"
                            :aria="$t('common:modules.routing.moveWaypointUp')"
                            :class-array="['btn-light', 'btn-up-down']"
                            :icon="'bi-chevron-up fs-6'"
                            :interaction="() => $emit('moveWaypointUp')"
                        />
                    </div>
                    <div
                        v-show="waypoint.index !== countWaypoints - 1"
                        class="h-50"
                    >
                        <IconButton
                            :aria="
                                $t('common:modules.routing.moveWaypointDown')
                            "
                            :class-array="['btn-light', 'btn-up-down']"
                            :icon="'bi-chevron-down fs-6'"
                            :interaction="() => $emit('moveWaypointDown')"
                        />
                    </div>
                </div>
                <IconButton
                    :aria="$t('common:modules.routing.deleteWaypoint')"
                    :class-array="['btn-light', 'm-1']"
                    :icon="'bi-x-lg fs-6'"
                    :interaction="() => $emit('removeWaypoint')"
                />
            </div>
        </div>
        <ul
            v-show="searchResults.length > 0 && isFocused"
            class="list-group dropdown-menu-search dropdown-menu-left"
        >
            <li
                v-for="(searchResult, index) of searchResults"
                :key="index"
                class="list-group-item"
            >
                <button
                    class="btn-icon search-result-button"
                    @mousedown="selectSearchResult(searchResult)"
                >
                    {{ searchResult.displayName }}
                </button>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.btn-up-down {
    margin-left: 5px;
}
.btn-icon {
    background-color: rgba(0, 0, 0, 0);
    border: none;
    padding: 5px 0 0 10px;
}
.input-icon {
    margin-left: -37px;
}

label {
    width: 300px;
    margin-bottom: 0;
}

li:hover {
    cursor: pointer;
    background: $light-grey;
    font-size: $font-size-base;
}

.list-group {
    position: absolute;
    z-index: 999;
}

.dropdown-menu-search {
    height: 200px;
    overflow: auto;
    width: 300px;
    top: unset;
    left: 20px;
}
</style>
