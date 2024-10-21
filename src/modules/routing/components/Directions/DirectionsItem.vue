<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import IconButton from "../../../../shared/modules/buttons/components/IconButton.vue";
import RoutingCoordinateInput from "../RoutingCoordinateInput.vue";
import RoutingDistanceDisplay from "../RoutingDistanceDisplay.vue";
import RoutingDurationDisplay from "../RoutingDurationDisplay.vue";
import DirectionsItemBatchProcessing from "./DirectionsItemBatchProcessing.vue";
import RoutingBatchProcessingCheckbox from "../RoutingBatchProcessingCheckbox.vue";
import RoutingDownload from "../RoutingDownload.vue";
import RoutingSpeedProfileIcon from "../RoutingSpeedProfileIcon.vue";
import RoutingAvoidFeatures from "../RoutingAvoidFeatures.vue";
import * as constants from "../../store/directions/constantsDirections";
import * as constantsRouting from "../../store/constantsRouting";


/**
 * DirectionsItem
 * @module modules/DirectionsItem
 * @vue-data {*} constants - The constants direction.
 * @vue-data {*} constantsRouting - The constants routing.
 * @vue-computed {Boolean} isMapInteractionModeAvoidAreasEdit - Shows if current map mode is "AVOID_AREAS".
 * @vue-computed {Boolean} isMapInteractionModeAvoidAreasDelete - Shows if current map mode is "DELETE_AVOID_AREAS".
 */
export default {
    name: "DirectionsItem",
    components: {
        IconButton,
        RoutingCoordinateInput,
        RoutingDistanceDisplay,
        RoutingDurationDisplay,
        RoutingDownload,
        DirectionsItemBatchProcessing,
        RoutingBatchProcessingCheckbox,
        RoutingAvoidFeatures: RoutingAvoidFeatures,
        RoutingSpeedProfileIcon
    },
    data () {
        return {
            constants,
            constantsRouting,
            preferencesFromConfig: null
        };
    },
    computed: {
        ...mapGetters("Modules/Routing/Directions", [
            "directionsRouteSource",
            "directionsAvoidSource",
            "isInputDisabled",
            "mapInteractionMode",
            "routingAvoidFeaturesOptions",
            "routingDirections",
            "settings",
            "waypoints",
            "keepRoutes"
        ]),
        ...mapGetters("Modules/Routing", ["directionsSettings"]),
        /**
         * Checks if current map mode is "AVOID_AREAS"
         * @returns {Boolean} true if mode is "AVOID_AREAS"
         */
        isMapInteractionModeAvoidAreasEdit () {
            return this.mapInteractionMode === "AVOID_AREAS";
        },
        /**
         * Checks if current map mode is "DELETE_AVOID_AREAS"
         * @returns {Boolean} true if mode is "DELETE_AVOID_AREAS"
         */
        isMapInteractionModeAvoidAreasDelete () {
            return this.mapInteractionMode === "DELETE_AVOID_AREAS";
        }
    },
    async created () {
        this.initDirections();
        this.preferencesFromConfig = this.directionsSettings?.customPreferences;
    },
    beforeUnmount () {
        this.closeDirections();
    },
    methods: {
        ...mapMutations("Modules/Routing/Directions", [
            "setRoutingDirections",
            "setMapInteractionMode",
            "setKeepRoutes"
        ]),
        ...mapActions("Modules/Routing/Directions", [
            "findDirections",
            "unHighlightRoute",
            "highlightRoute",
            "zoomToRoute",
            "initDirections",
            "createInteractionFromMapInteractionMode",
            "closeDirections",
            "addWaypoint",
            "removeWaypoint",
            "moveWaypointDown",
            "moveWaypointUp"
        ]),

        /**
         * Changes the current speed profile and requests directions after
         * @param {String} speedProfileId from constantsRouting
         * @returns {void}
         */
        changeSpeedProfile (speedProfileId) {
            if (this.isInputDisabled) {
                return;
            }
            this.settings.speedProfile = speedProfileId;
            this.findDirections();
        },
        /**
         * Changes the current preference and requests directions after
         * @param {String} preferenceId from constantsDirections
         * @returns {void}
         */
        changePreference (preferenceId) {
            this.settings.preference = preferenceId;
            this.findDirections();
        },
        /**
         * Toggles the current map mode between "AVOID_AREAS" and "WAYPOINTS"
         * @returns {void}
         */
        changeMapInteractionModeAvoidAreasEdit () {
            if (this.mapInteractionMode === "AVOID_AREAS") {
                this.setMapInteractionMode("WAYPOINTS");
            }
            else {
                this.setMapInteractionMode("AVOID_AREAS");
            }
            this.createInteractionFromMapInteractionMode();
        },
        /**
         * Toggles the current map mode between "DELETE_AVOID_AREAS" and "WAYPOINTS"
         * @returns {void}
         */
        changeMapInteractionModeAvoidAreasDelete () {
            if (this.mapInteractionMode === "DELETE_AVOID_AREAS") {
                this.setMapInteractionMode("WAYPOINTS");
            }
            else {
                this.setMapInteractionMode("DELETE_AVOID_AREAS");
            }
            this.createInteractionFromMapInteractionMode();
        },
        /**
         * Resets the current settings, including waypoints and avoid areas.
         * @returns {void}
         */
        reset () {
            for (let i = this.waypoints.length - 1; i >= 0; i--) {
                this.removeWaypoint({index: this.waypoints[i].index});
            }
            this.directionsRouteSource.getFeatures().forEach(feature => feature.getGeometry().setCoordinates([]));
            this.setRoutingDirections(null);
            this.directionsAvoidSource.clear();
        },
        /**
         * Adds a new option to avoid when requesting directions afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onAddAvoidOption (optionId) {
            this.routingAvoidFeaturesOptions.push(optionId);
            this.findDirections();
        },
        /**
         * Removes an option to avoid when requesting directions afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onRemoveAvoidOption (optionId) {
            const index = this.routingAvoidFeaturesOptions.findIndex(
                (opt) => opt === optionId
            );

            this.routingAvoidFeaturesOptions.splice(index, 1);
            this.findDirections();
        },
        /**
         * Changes the setting to display batch processing
         * @param {Boolean} input new value
         * @returns {void}
         */
        onBatchProcessingCheckboxInput (input) {
            this.directionsSettings.batchProcessing.active = input;
        }
    }
};
</script>

<template>
    <div id="routing-directions">
        <RoutingSpeedProfileIcon
            v-for="option in constantsRouting.speedProfileOptions"
            :key="option"
            :interaction="() => changeSpeedProfile(option)"
            :class="['pointer mr-4 ', isInputDisabled ? 'opacity-05' : '']"
            :speed-profile-id="option"
            :fill-color="option === settings.speedProfile ? '#0077ff' : '#000000'"
            :tooltip="$t('common:modules.routing.speedprofiles.' + option)"
        />

        <hr>
        <input
            id="routing-delete-routes-input"
            type="checkbox"
            :checked="keepRoutes"
            @change="setKeepRoutes($event.target.checked)"
        >
        <span class="ms-2">{{ $t('common:modules.routing.directions.keepRoutesAfterClose') }}</span>

        <hr>
        <template v-if="directionsSettings.batchProcessing.enabled">
            <RoutingBatchProcessingCheckbox
                :batch-processing="directionsSettings.batchProcessing"
                @input="onBatchProcessingCheckboxInput($event)"
            />

            <hr>
        </template>

        <template v-if="directionsSettings.batchProcessing.enabled && directionsSettings.batchProcessing.active">
            <DirectionsItemBatchProcessing :settings="settings" />
        </template>
        <template v-else>
            <form
                id="routing-directions-coordinate-input-form"
                class="form-horizontal"
                role="form"
            >
                <div
                    class="helptext mb-3"
                >
                    <span>{{ $t('common:modules.routing.coordinateInputHelp') }}</span>
                </div>
                <RoutingCoordinateInput
                    v-for="(waypoint, index) of waypoints"
                    :key="index"
                    :count-waypoints="waypoints.length"
                    :waypoint="waypoint"
                    @move-waypoint-up="moveWaypointUp(waypoint.index)"
                    @move-waypoint-down="moveWaypointDown(waypoint.index)"
                    @remove-waypoint="removeWaypoint({index: waypoint.index, reload: true})"
                    @search-result-selected="findDirections()"
                />
            </form>

            <div class="d-flex justify-content-between mt-4">
                <div class="d-flex">
                    <span> {{ $t('common:modules.routing.directions.restrictedAreas') }}:</span>

                    <button
                        class="m-1 btn-icon"
                        @click="changeMapInteractionModeAvoidAreasEdit()"
                        @keydown.enter="changeMapInteractionModeAvoidAreasEdit()"
                    >
                        <svg
                            width="20px"
                            height="20px"
                            viewBox="0 0 30 30"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            xml:space="preserve"
                            xmlns:serif="http://www.serif.com/"
                            fill-rule="evenodd"
                        >
                            <title>{{ $t('common:modules.routing.directions.editRestrictedAreas') }}</title>
                            <path
                                :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                d="M3,0c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                d="M27,4c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                d="M27,20c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                d="M3,24c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                d="M3,6l0,18"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                stroke-width="1px"
                            /><path
                                d="M27,10l0,10"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                stroke-width="1px"
                            /><path
                                d="M24,23l-18,4"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                stroke-width="1px"
                            /><path
                                d="M24,7l-18,-4"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                                stroke-width="1px"
                            />
                        </svg>
                    </button>
                    <button
                        class="m-1 btn-icon"
                        @click="changeMapInteractionModeAvoidAreasDelete()"
                        @keydown.enter="changeMapInteractionModeAvoidAreasDelete()"
                    >
                        <svg
                            width="20px"
                            height="20px"
                            viewBox="0 0 30 30"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            xml:space="preserve"
                            xmlns:serif="http://www.serif.com/"
                            fill-rule="evenodd"
                        >
                            <title>{{ $t('common:modules.routing.directions.deleteRestrictedAreas') }}</title>
                            <path
                                :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                d="M3,0c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                d="M27,4c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                d="M27,20c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                d="M3,24c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                            />
                            <path
                                d="M3,6l0,18"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                stroke-width="1px"
                            /><path
                                d="M27,10l0,10"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                stroke-width="1px"
                            /><path
                                d="M24,23l-18,4"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                stroke-width="1px"
                            /><path
                                d="M24,7l-18,-4"
                                fill="none"
                                :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                                stroke-width="1px"
                            /><path
                                d="M23.044,19.067l-15.588,-9l-0.5,0.866l15.588,9l0.5,-0.866Z"
                                fill="#f00"
                            /><path
                                d="M22.544,10.067l-15.588,9l0.5,0.866l15.588,-9l-0.5,-0.866Z"
                                fill="#f00"
                            />
                        </svg>
                    </button>
                </div>

                <div class="d-flex">
                    <IconButton
                        id="button-up"
                        :aria="$t('common:modules.routing.resetSettings')"
                        :class-array="['btn-light']"
                        :icon="'bi-trash fs-6'"
                        :interaction="() => reset()"
                    />
                    <button
                        class="bootstrap-icon m-2 btn-icon"
                        :title="$t('common:modules.routing.addWaypoint')"
                        @click="addWaypoint({index: waypoints.length -1})"
                        @keydown.enter="addWaypoint({index: waypoints.length -1})"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="currentColor"
                            class="bi bi-plus-lg"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                                stroke="black"
                                stroke-width="2"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </template>

        <hr>

        <label
            for="routing-directions-preference"
            class="routing-directions-preference-label"
        >
            {{ $t("common:modules.routing.directions.preferenceLabel") }}
        </label>
        <select
            id="routing-directions-preference"
            class="form-select form-select-sm"
            @change="changePreference($event.target.value)"
        >
            <option
                v-for="option in preferencesFromConfig?.hasOwnProperty(settings.speedProfile) ? preferencesFromConfig[settings.speedProfile] : constants.preferenceOptions"
                :id="option"
                :key="'routing-directions-preference-' + option"
                :value="option"
                :selected="option === settings.preference"
                :disabled="isInputDisabled"
            >
                {{ $t('common:modules.routing.directions.preference.' + option) }}
            </option>
        </select>

        <hr>

        <RoutingAvoidFeatures
            :settings="settings"
            :active-avoid-features-options="routingAvoidFeaturesOptions"
            :disabled="isInputDisabled"
            @add-avoid-option="onAddAvoidOption($event)"
            @remove-avoid-option="onRemoveAvoidOption($event)"
        />

        <template v-if="!(directionsSettings.batchProcessing.enabled && directionsSettings.batchProcessing.active)">
            <hr>

            <div
                v-if="routingDirections"
                id="routing-directions-result-directions"
            >
                <div
                    class="d-flex justify-content-between"
                >
                    <RoutingSpeedProfileIcon
                        :speed-profile-id="settings.speedProfile"
                        fill-color="#000000"
                        :tooltip="$t('common:modules.routing.speedprofiles.' + settings.speedProfile)"
                        :class="['none-pointer-events ']"
                    />
                    <RoutingDurationDisplay :duration="routingDirections.duration" />
                    <RoutingDistanceDisplay :distance="routingDirections.distance" />
                </div>

                <hr class="mb-0">

                <template
                    v-for="(segment, segmentIndex) of routingDirections.segments"
                    :key="'segment_header_' + segmentIndex"
                >
                    <button
                        class="d-flex step pl-2 py-4 btn-directions"
                        @mouseover="highlightRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                        @focus="highlightRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                        @mouseout="unHighlightRoute()"
                        @blur="unHighlightRoute()"
                    >
                        <button
                            class="d-flex btn-icon"
                            @click="segment.displayDetails = !segment.displayDetails"
                            @keydown.enter="segment.displayDetails = !segment.displayDetails"
                        >
                            <span>{{ segmentIndex === 0 ? 'A' : segmentIndex }}</span>

                            <b>
                                <span v-if="segment.displayDetails">
                                    <i class="bi-chevron-down" />
                                </span>
                                <span v-else>
                                    <i class="bi-chevron-right" />
                                </span>
                            </b>
                        </button>

                        <button
                            class="d-flex flex-column ms-2 w-100 btn-directions"
                            @click="zoomToRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                            @keydown.enter="zoomToRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                        >
                            <b>{{ waypoints[segmentIndex].getDisplayName() }}</b>
                            <div
                                class="d-flex justify-content-between"
                            >
                                <RoutingDurationDisplay :duration="segment.duration" />
                                <RoutingDistanceDisplay :distance="segment.distance" />
                            </div>
                        </button>
                    </button>

                    <hr
                        class="m-0"
                    >

                    <div
                        v-if="segment.displayDetails"
                    >
                        <template
                            v-for="(step, stepIndex) of segment.steps"
                            :key="stepIndex"
                        >
                            <button
                                v-if="stepIndex !== segment.steps.length - 1"
                                v-bind="step"
                                class="ms-4 d-flex flex-column btn-directions"
                                @mouseover="highlightRoute({coordsIndex: step.getWaypoints()})"
                                @focus="highlightRoute({coordsIndex: step.getWaypoints()})"
                                @mouseout="unHighlightRoute()"
                                @blur="unHighlightRoute()"
                                @click="zoomToRoute({coordsIndex: step.getWaypoints()})"
                                @keydown.enter="zoomToRoute({coordsIndex: step.getWaypoints()})"
                            >
                                <div class="ms-0 d-flex flex-column pl-2 py-4 step">
                                    <span>{{ step.instruction }}</span>
                                    <div
                                        class="d-flex justify-content-between"
                                    >
                                        <RoutingDurationDisplay :duration="step.duration" />
                                        <RoutingDistanceDisplay :distance="step.distance" />
                                    </div>
                                </div>
                                <hr class="w-100 m-0">
                            </button>
                        </template>
                    </div>
                </template>

                <button
                    class="d-flex step pl-2 py-4 btn-directions"
                    @mouseover="highlightRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                    @focus="highlightRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                    @mouseout="unHighlightRoute()"
                    @blur="unHighlightRoute()"
                    @click="zoomToRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                    @keydown.enter="zoomToRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                >
                    <span>B</span>
                    <b class="ms-2">{{ waypoints[waypoints.length - 1].getDisplayName() }}</b>
                </button>

                <hr class="mt-0">

                <RoutingDownload />
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.test {
    background-color: yellow;
}
.btn-icon {
    border: none;
    background-color: $white;
}
.btn-directions {
    border: none;
    padding-left: 0px;
    margin-left: 0px;
    background-color: $white;
}

.btn-directions:focus-visible {
    outline: none;
    border-left: 2px solid rgb(255, 44, 0);
}

.btn-directions:active {
    border: none;
}

#routing-directions {
  min-width: 350px;
}
.helptext {
    max-width: calc(350px - 3rem);
}
.pointer {
  cursor: pointer;
}
.step {
    border-left: 2px solid transparent;
}
.step:hover {
    border-left: 2px solid rgb(255, 44, 0);
}
.opacity-05 {
    opacity: 0.5;
}
.routing-directions-preference-label {
    padding: 0 0 5px 0;
}
.none-pointer-events {
    pointer-events: none;
}
</style>
