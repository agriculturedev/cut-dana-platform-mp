<script>
import SwitchInput from "../../checkboxes/components/SwitchInput.vue";

/**
 * Shared Component that provides settings for circle drawing.
 * @module shared/modules/draw/DrawSettingsCircle
 * @vue-prop {Object} [circleOptions={innerRadius: 0, interactive: true, outerRadius: 100, unit: "m"}] - The circle Options.
 * @vue-prop {String} [selectedDrawType=""] - The selected draw type.
 * @vue-prop {Function} setCircleOptions - Setter for circle options.
 * @vue-prop {String[]} [units=["m", "km"]] - The units.
 * @vue-computed {String} currentUnit - The current unit.
 * @vue-computed {String[]} radii - The radii.
 */
export default {
    name: "DrawSettingsCircle",
    components: {
        SwitchInput
    },
    props: {
        circleOptions: {
            type: Object,
            default () {
                return {
                    innerRadius: 0,
                    interactive: true,
                    outerRadius: 100,
                    unit: "m"
                };
            }
        },
        selectedDrawType: {
            type: String,
            default () {
                return "";
            }
        },
        setCircleOptions: {
            type: Function,
            required: true
        },
        units: {
            type: Array,
            default () {
                return ["m", "km"];
            }
        }
    },
    computed: {
        currentUnit: {
            get () {
                return this.circleOptions.unit;
            },
            set (value) {
                this.setCircleOptions({unit: value});
            }
        },
        /**
         * Returns the radii.
         * @returns {String[]} The radii.
         */
        radii () {
            if (this.selectedDrawType === "doubleCircle") {
                return ["innerRadius", "outerRadius"];
            }

            return ["radius"];
        }
    },
    methods: {
        /**
         * Updates a radius in circle options.
         * @param {String} value The new value of the radius.
         * @param {String} radius The radius type.
         * @returns {void}
         */
        updateRadiusInCircleOptions (value, radius) {
            const optionsKey = radius === "outerRadius" ? "outerRadius" : "innerRadius";

            this.setCircleOptions({[optionsKey]: parseInt(value, 10)});
        }
    }
};
</script>

<template>
    <div>
        <div class="mb-3">
            <span>{{ $t("common:shared.modules.draw.drawSettingsCircle.settings." + selectedDrawType) }}</span>
        </div>
        <div
            v-if="selectedDrawType === 'circle'"
            class="form-check form-switch mb-3"
        >
            <SwitchInput
                :id="'draw-settings-circle-interactive-' + selectedDrawType"
                :aria="$t('common:shared.modules.draw.drawSettingsCircle.interactive')"
                :interaction="(event) => setCircleOptions({interactive: event.target.checked})"
                :label="$t('common:shared.modules.draw.drawSettingsCircle.interactive')"
                :checked="circleOptions.interactive"
            />
        </div>
        <div v-if="!circleOptions.interactive || selectedDrawType === 'doubleCircle'">
            <div class="form-floating mb-3">
                <select
                    :id="'draw-circle-settings-' + selectedDrawType"
                    :ref="'draw-circle-settings-' + selectedDrawType"
                    v-model="currentUnit"
                    class="form-select"
                >
                    <option
                        v-for="unit in units"
                        :key="unit"
                        :value="unit"
                        :selected="unit === currentUnit"
                    >
                        {{ unit }}
                    </option>
                </select>
                <label :for="'draw-circle-settings-' + selectedDrawType">
                    {{ $t("common:shared.modules.draw.drawSettingsCircle.unit") }}
                </label>
            </div>
            <div
                v-for="radius in radii"
                :key="radius"
                class="d-flex flex-row mb-3"
            >
                <div class="form-floating input-radius">
                    <input
                        :id="'draw-circle-settings-' + radius"
                        :value="radius === 'outerRadius' ? circleOptions.outerRadius : circleOptions.innerRadius"
                        type="number"
                        class="form-control"
                        min="0"
                        step="1"
                        @input="updateRadiusInCircleOptions($event.target.value, radius)"
                    >
                    <label :for="'draw-circle-settings-' + radius">
                        {{ $t("common:shared.modules.draw.drawSettingsCircle.radii." + radius) }}
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.input-radius {
    width: 100%;
}

</style>
