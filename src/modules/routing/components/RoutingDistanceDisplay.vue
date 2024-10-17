<script>
import thousandsSeparator from "../../../shared/js/utils/thousandsSeparator";

/**
 * RoutingDistanceDisplay
 * @module modules/RoutingDistanceDisplay
 * @vue-prop {Number} distance - The distance.
 *
 * @vue-data {String} mText - The unit text for meter.
 * @vue-data {String} kmText - The unit text for kilometer.
 *
 * @vue-computed {Number} roundedDistance - The rounded distance.
 * @vue-computed {Number} kmDistance - The distance in km.
 */
export default {
    name: "RoutingDistanceDisplay",
    props: {
        distance: {
            type: Number,
            required: true
        }
    },
    data () {
        return {
            mText: " m",
            kmText: " km"
        };
    },
    computed: {
        /**
         * Computed value for the rounded distance
         * @returns {Number} rounded distance
         */
        roundedDistance () {
            return Math.floor(this.distance);
        },
        /**
         * Computed value to return the distance in kilometer
         * @returns {Number} kilometer distance
         */
        kmDistance () {
            return thousandsSeparator(Math.floor((this.roundedDistance / 1000) * 10) / 10);
        }
    }
};
</script>

<template>
    <span v-if="roundedDistance < 1000"><b>{{ roundedDistance }}</b>{{ mText }}</span>
    <span v-else><b>{{ kmDistance }}</b>{{ kmText }}</span>
</template>
