<script>
import {mapGetters} from "vuex";
import thousandsSeparator from "../../../shared/js/utils/thousandsSeparator";

/**
 * Scale Line
 * @module modules/ScaleLine
 */
export default {
    name: "ScaleLine",
    computed: {
        ...mapGetters("Modules/PortalFooter", [
            "scaleLineWidth"
        ]),
        ...mapGetters("Maps", [
            "mode",
            "scale"
        ])
    },
    methods: {
        /**
         * Returns a beautified state in format "1 : scale" where scale is rounded based on its value
         * @param {Number} scale A value (number) from computed scale 1:x.
         * @returns {String} Pretty-printed scale as "1 : scale".
         */
        scaleToOne (scale) {
            if (typeof scale !== "number" || scale <= 0) {
                return "1 : scale must be a positive number";
            }
            let result = Math.round(scale);

            if (result > 10000) {
                result = Math.round(result / 500) * 500;
            }
            else if (result > 1000) {
                result = Math.round(result / 50) * 50;
            }

            return "1 : " + thousandsSeparator(result);
        },

        /**
         * Returns the pretty-printed scale width in cm.
         * @param {Number} scale x from computed scale value 1:x
         * @param {Number} scaleLineWidth The scale line width in cm.
         * @returns {String} pretty-printed scale to scaleWidth in cm.
         */
        scaleWithUnit (scale, scaleLineWidth) {
            const scaleNumber = Math.round(scaleLineWidth * scale / 100);

            return scaleNumber >= 1000 ? `${Math.round(scaleNumber / 100) / 10} km` : `${scaleNumber} m`;
        }
    }
};
</script>

<template>
    <div
        v-if="mode === '2D'"
        id="modules-scales"
        :title="$t('common:modules.portalFooter.scale')"
    >
        <span class="scale-as-a-ratio px-3">
            {{ scaleToOne(scale) }}
        </span>
        <span
            class="scale-line d-inline-block"
            :style="{width: `${scaleLineWidth}cm`}"
        >
            {{ scaleWithUnit(scale, scaleLineWidth) }}
        </span>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    #modules-scales {
        display: none;

        @include media-breakpoint-up(sm)  {
            display: inline-block;
            text-align: center;

            .scale-line {
                border-bottom: 1px solid;
                border-left: 1px solid;
                border-right: 1px solid;
                // width: 3cm;
            }
        }
    }
</style>
