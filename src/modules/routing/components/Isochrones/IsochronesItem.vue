<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import actions from "../../store/isochrones/actionsIsochrones";
import mutations from "../../store/isochrones/mutationsIsochrones";
import * as constants from "../../store/isochrones/constantsIsochrones";
import * as constantsRouting from "../../store/constantsRouting";
import RoutingCoordinateInput from "../RoutingCoordinateInput.vue";
import RoutingSliderInput from "../RoutingSliderInput.vue";
import RoutingDownload from "../RoutingDownload.vue";
import IsochronesItemBatchProcessing from "./IsochronesItemBatchProcessing.vue";
import RoutingBatchProcessingCheckbox from "../RoutingBatchProcessingCheckbox.vue";
import RoutingSpeedProfileIcon from "../RoutingSpeedProfileIcon.vue";
import RoutingAvoidFeatures from "../RoutingAvoidFeatures.vue";

/**
 * DirectionsItemBatchProcessing
 * @module modules/DirectionsItemBatchProcessing
 * @vue-data {*} constants - The constants isochrones.
 * @vue-data {*} constantsRouting - The constants routing.
 * @vue-computed {Number} currentValue - The distance/time value for the current active slider.
 * @vue-computed {Number} maxIntervalValue - The maximum value for the interval slider.
 * @vue-computed {Number} minIntervalValue - The minimum value for the interval slider.
 */
export default {
    name: "IsochronesItem",
    components: {
        RoutingCoordinateInput,
        RoutingSliderInput,
        RoutingDownload,
        IsochronesItemBatchProcessing,
        RoutingBatchProcessingCheckbox,
        RoutingAvoidFeatures: RoutingAvoidFeatures,
        RoutingSpeedProfileIcon
    },
    data () {
        return {
            constants,
            constantsRouting
        };
    },
    computed: {
        ...mapGetters("Modules/Routing/Isochrones", ["isInputDisabled", "isochronesPointDrawInteraction", "isochronesPointModifyInteraction", "waypoint", "routingIsochrones", "routingAvoidFeaturesOptions", "settings"]),
        ...mapGetters("Modules/Routing/", ["isochronesSettings"]),
        /**
         * Computed distance/time value for the current active slider
         * @returns {Number} value for the current active slider
         */
        currentValue () {
            return this.settings.isochronesMethodOption === "DISTANCE" ? this.settings.distanceValue : this.settings.timeValue;
        },
        /**
         * Computed maximum value for the interval slider
         * @returns {Number} maximum value for the interval slider
         */
        maxIntervalValue () {
            return this.currentValue < this.settings.maxInterval ? this.currentValue : this.settings.maxInterval;
        },

        /**
         * Computed minimum value for the interval slider
         * @returns {Number} minimum value for the interval slider
         */
        minIntervalValue () {
            return this.settings.minInterval;
        }
    },

    async created () {
        this.initIsochrones();
    },

    beforeUnmount () {
        this.closeIsochrones();
    },

    methods: {
        ...mapMutations("Modules/Routing/Isochrones", Object.keys(mutations)),
        ...mapActions("Modules/Routing/Isochrones", Object.keys(actions)),
        /**
         * Changes the speed profile
         * @param {String} speedProfileId to change
         * @returns {void}
         */
        changeSpeedProfile (speedProfileId) {
            if (this.isInputDisabled) {
                return;
            }

            this.settings.speedProfile = speedProfileId;
        },
        /**
         * Changes the isochrones method and checks the interval value
         * @param {String} methodOptionId to change
         * @returns {void}
         */
        changeMethodOption (methodOptionId) {
            this.settings.isochronesMethodOption = methodOptionId;
            if (this.currentValue < this.settings.intervalValue) {
                this.setIntervalValue(this.currentValue);
            }
        },
        /**
         * Sets the distance value and checks the interval value
         * @param {Number} distanceValue to set
         * @returns {void}
         */
        setDistanceValue (distanceValue) {
            this.settings.distanceValue = distanceValue;
            if (distanceValue < this.settings.intervalValue) {
                this.setIntervalValue(distanceValue);
            }
        },
        /**
         * Sets the time value and checks the interval value
         * @param {Number} timeValue to set
         * @returns {void}
         */
        setTimeValue (timeValue) {
            this.settings.timeValue = timeValue;
            if (timeValue < this.settings.intervalValue) {
                this.setIntervalValue(timeValue);
            }
        },
        /**
         * Sets the interval value
         * @param {Number} intervalValue to set
         * @returns {void}
         */
        setIntervalValue (intervalValue) {
            if (intervalValue > this.minIntervalValue) {
                this.settings.intervalValue = intervalValue;
            }
            else {
                this.settings.intervalValue = this.minIntervalValue;
            }
        },
        /**
         * Resets the input waypoint and the displayed map features
         * @returns {void}
         */
        onRemoveWaypoint () {
            this.waypoint.reset();
            this.createIsochronesPointDrawInteraction();
            this.resetIsochronesResult();
        },
        /**
         * Adds an option to avoid when requesting isochrones afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onAddAvoidOption (optionId) {
            this.routingAvoidFeaturesOptions.push(optionId);
        },
        /**
         * Removes an option to avoid when requesting isochrones afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onRemoveAvoidOption (optionId) {
            const index = this.routingAvoidFeaturesOptions.findIndex(
                (opt) => opt === optionId
            );

            this.routingAvoidFeaturesOptions.splice(index, 1);
        },
        /**
         * Changes the setting to display batch processing
         * @param {Boolean} input new value
         * @returns {void}
         */
        onBatchProcessingCheckboxInput (input) {
            this.isochronesSettings.batchProcessing.active = input;
        }
    }
};
</script>

<template>
    <div id="routing-isochrones">
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

        <template v-if="isochronesSettings.batchProcessing.enabled">
            <RoutingBatchProcessingCheckbox
                :batch-processing="isochronesSettings.batchProcessing"
                @input="onBatchProcessingCheckboxInput($event)"
            />

            <hr>
        </template>

        <template v-if="isochronesSettings.batchProcessing.enabled && isochronesSettings.batchProcessing.active">
            <IsochronesItemBatchProcessing :settings="isochronesSettings" />
        </template>
        <template v-else>
            <h6>{{ $t('common:modules.routing.isochrones.startpoint') }}</h6>

            <form
                id="routing-isochrones-coordinate-input-form"
                class="form-horizontal"
                role="form"
            >
                <div
                    class="helptext mb-3"
                >
                    <span>{{ $t('common:modules.routing.coordinateInputHelp') }}</span>
                </div>
                <RoutingCoordinateInput
                    :count-waypoints="1"
                    :waypoint="waypoint"
                    @remove-waypoint="onRemoveWaypoint()"
                    @search-result-selected="zoomOnWaypoint()"
                />
            </form>
        </template>

        <hr>

        <label
            class="routing-isochrones-methodoption-lable"
            for="routing-isochrones-methodoption"
        >
            {{ $t('common:modules.routing.isochrones.optimizeHeader') }}
        </label>
        <select
            id="routing-isochrones-methodoption"
            class="form-select form-select-sm"
            @change="changeMethodOption($event.target.value)"
        >
            <option
                v-for="option in constants.isochronesMethodeOptions"
                :id="option"
                :key="'routing-isochrones-methodoption-' + option"
                :value="option"
                :selected="option === settings.isochronesMethodOption"
                :disabled="isInputDisabled"
            >
                {{ $t('common:modules.routing.isochrones.optimization.' + option) }}
            </option>
        </select>


        <template v-if="settings.isochronesMethodOption === 'DISTANCE'">
            <RoutingSliderInput
                :label="$t('common:modules.routing.isochrones.maxDistance')"
                :value="settings.distanceValue"
                :min="settings.minDistance"
                :max="settings.maxDistance"
                :disabled="isInputDisabled"
                unit="km"
                @input="setDistanceValue($event)"
            />
        </template>

        <template v-else-if="settings.isochronesMethodOption === 'TIME'">
            <RoutingSliderInput
                :label="$t('common:modules.routing.isochrones.maxTraveltime')"
                :value="settings.timeValue"
                :min="settings.minTime"
                :max="settings.maxTime"
                :disabled="isInputDisabled"
                unit="min"
                @input="setTimeValue($event)"
            />
        </template>

        <RoutingSliderInput
            :label="$t('common:modules.routing.isochrones.interval')"
            :value="settings.intervalValue"
            :min="minIntervalValue"
            :max="maxIntervalValue"
            :unit="settings.isochronesMethodOption ==='DISTANCE' ? 'km' : 'min'"
            :disabled="isInputDisabled"
            @input="setIntervalValue($event)"
        />

        <hr>

        <RoutingAvoidFeatures
            :settings="settings"
            :active-avoid-features-options="routingAvoidFeaturesOptions"
            :disabled="isInputDisabled"
            @add-avoid-option="onAddAvoidOption($event)"
            @remove-avoid-option="onRemoveAvoidOption($event)"
        />

        <template v-if="!(isochronesSettings.batchProcessing.enabled && isochronesSettings.batchProcessing.active)">
            <hr>

            <div class="d-flex flex-column">
                <div class="col-12 d-grid gap-2">
                    <button
                        class="btn btn-primary"
                        type="button"
                        :disabled="waypoint.getCoordinates().length === 0 || isInputDisabled"
                        @click="findIsochrones()"
                    >
                        {{ $t('common:modules.routing.isochrones.calculate') }}
                    </button>
                </div>

                <div
                    v-if="routingIsochrones"
                    id="routing-isochrones-result-isochrones"
                >
                    <hr class="w-100">

                    <span class="mb-2">{{ $t('common:modules.routing.isochrones.legend') }}</span>
                    <div
                        v-for="(area, index) of routingIsochrones.getAreas()"
                        :key="'result-area-' + index"
                        class="d-flex mb-2 ms-2"
                    >
                        <div
                            class="legend-container px-2"
                            :style="{backgroundColor: area.getColorRgbString()}"
                        >
                            <span>{{ area.getDisplayValue() }}</span>
                            <span>{{ area.getOptimization() === 'DISTANCE' ? 'km' : 'min' }}</span>
                        </div>
                    </div>

                    <hr class="w-100">

                    <RoutingDownload hide-gpx />
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#routing-isochrones {
  min-width: 350px;
}
.helptext {
    max-width: calc(350px - 3rem);
}
.legend-container {
    width: 56px;
    text-align: center;
}
.pointer {
  cursor: pointer;
}
.opacity-05 {
    opacity: 0.5;
}
h6 {
    font-size: $font-size-base;
}
.routing-isochrones-methodoption-lable {
    padding: 0 0 5px 0;
}
</style>
