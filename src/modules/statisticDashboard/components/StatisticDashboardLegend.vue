<script>
import {mapGetters, mapMutations} from "vuex";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import InputText from "../../../shared/modules/inputs/components/InputText.vue";
import {convertColor} from "../../../shared/js/utils/convertColor";
export default {
    name: "StatisticDashboardLegend",
    components: {
        FlatButton,
        InputText
    },
    emits: ["changeLegendView"],
    computed: {
        ...mapGetters("Modules/StatisticDashboard", [
            "classificationMode",
            "allowPositiveNegativeClasses",
            "minNumberOfClasses",
            "maxNumberOfClasses",
            "numberOfClasses",
            "selectableColorPalettes",
            "selectedColorPaletteIndex",
            "opacity",
            "stepValues",
            "colorPalette"
        ]),

        /**
         * Checks if the current step values are numbers in ascending order.
         * @returns {Boolean} True if stepValues are ascending, false if not.
         */
        areStepValuesAscending () {
            return this.stepValues.every((v, i, a) => a[i] > a[i - 1] || i === 0);
        }
    },
    methods: {
        ...mapMutations("Modules/StatisticDashboard", [
            "setClassificationMode",
            "setAllowPositiveNegativeClasses",
            "setNumberOfClasses",
            "setSelectedColorPaletteIndex",
            "setOpacity",
            "setStepValues",
            "setColorPalette"
        ]),
        convertColor: convertColor,

        /**
         * Changes a single value in step values.
         * @param {Number} index - The index in stepValues the value at which is to be changed.
         * @param {Number} value - The new value to be set.
         * @returns {void}
         */
        changeStepValues (index, value) {
            const number = parseFloat(value),
                values = [...this.stepValues];

            if (!Number.isFinite(number)) {
                return;
            }
            values[index] = number;
            this.setStepValues(values);
        },

        /**
         * Changes a single color in the color palette.
         * @param {Number} index - The index in colorPalette the value at which is to be changed.
         * @param {Number} value - The new color value to be set.
         * @returns {void}
         */
        changeOneColor (index, value) {
            const palette = [...this.colorPalette];

            palette[index] = value;
            this.setColorPalette(palette);
        },

        /**
         * Event handler for reset event.
         * Sets step values and colors to the values they would have in quantile mode, but leaves classification as custom.
         */
        reset () {
            this.setClassificationMode("quantiles");
            setTimeout(() => this.setClassificationMode("custom"));
        }
    }
};
</script>

<template>
    <div>
        <h5 class="mb-5">
            {{ $t('common:modules.statisticDashboard.legend.editClassification') }}
        </h5>
        <div class="form-floating mb-5">
            <select
                id="classification"
                class="form-select"
                @change="setClassificationMode($event.target.value)"
            >
                <option
                    value="quantiles"
                    :selected="classificationMode === 'quantiles'"
                >
                    {{ $t("common:modules.statisticDashboard.legend.quantile") }}
                </option>
                <option
                    value="equalIntervals"
                    :selected="classificationMode === 'equalIntervals'"
                >
                    {{ $t("common:modules.statisticDashboard.legend.equalIntervals") }}
                </option>
                <option
                    value="custom"
                    :selected="classificationMode === 'custom'"
                >
                    {{ $t("common:modules.statisticDashboard.legend.customized") }}
                </option>
            </select>
            <label for="classification">
                {{ $t('common:modules.statisticDashboard.legend.classification') }}
            </label>
        </div>
        <div class="mb-5">
            <label
                for="class-range"
                class="form-label"
            >{{ $t('common:modules.statisticDashboard.legend.numberOfClasses') + ': ' + numberOfClasses }} </label>
            <input
                id="class-range"
                type="range"
                class="form-range"
                :min="minNumberOfClasses"
                :max="maxNumberOfClasses"
                list="numbers"
                :value="numberOfClasses"
                @input="setNumberOfClasses(parseInt($event.target.value))"
            >
            <datalist id="numbers">
                <option
                    :key="minNumberOfClasses"
                    :label="minNumberOfClasses"
                />
                <option
                    :key="maxNumberOfClasses"
                    :label="maxNumberOfClasses"
                />
            </datalist>
        </div>
        <div v-if="classificationMode !== 'custom'">
            <div class="form-check">
                <input
                    id="allowPosNegMix"
                    class="form-check-input"
                    type="checkbox"
                    :checked="allowPositiveNegativeClasses"
                    @change="setAllowPositiveNegativeClasses($event.target.checked)"
                >
                <label
                    class="form-check-label"
                    for="allowPosNegMix"
                >
                    Klassen mit positiven und negativen Werten zulassen
                </label>
            </div>
            <div class="form-floating mb-5">
                <select
                    id="custom-color-palette"
                    class="form-select"
                    :value="selectedColorPaletteIndex"
                    @change="setSelectedColorPaletteIndex(parseInt($event.target.value))"
                >
                    <option
                        v-for="(scheme, i) in selectableColorPalettes"
                        :key="i"
                        :value="i"
                        :selected="i === selectedColorPaletteIndex"
                    >
                        {{ scheme.label }}
                    </option>
                </select>
                <label for="custom-color-palette">
                    {{ $t('common:modules.statisticDashboard.legend.colorPalette') }}
                </label>
            </div>
        </div>
        <div
            v-else
            class="mb-5"
        >
            <div
                v-for="index in numberOfClasses"
                id="value-ranges"
                :key="index"
                class="row"
            >
                <InputText
                    :id="'value-range' + index"
                    :label="$t('common:modules.statisticDashboard.legend.range') + ' ' + index"
                    :class="['col', 'col-3']"
                    :placeholder="$t('common:modules.statisticDashboard.legend.range')"
                    type="number"
                    :disabled="index > stepValues.length + 1"
                    :value="stepValues[index - 1]?.toString()"
                    :change="value => changeStepValues(index - 1, value)"
                />
                <div
                    class="col col-auto align-self-center my-0"
                >
                    {{ index === numberOfClasses ?
                        $t('common:modules.statisticDashboard.legend.andAbove') :
                        $t('common:modules.statisticDashboard.legend.betweenValues')
                    }}
                </div>
                <InputText
                    v-if="index !== numberOfClasses"
                    :id="'value-range2' + index"
                    :label="$t('common:modules.statisticDashboard.legend.range') + ' ' + index"
                    :class="['col', 'col-3']"
                    :placeholder="$t('common:modules.statisticDashboard.legend.range')"
                    type="number"
                    :disabled="index > stepValues.length"
                    :value="stepValues[index]?.toString()"
                    :change="value => changeStepValues(index, value)"
                />
                <InputText
                    :id="'color-range' + index"
                    :label="$t('common:modules.statisticDashboard.legend.color')"
                    :class="['col-3', 'ms-md-auto']"
                    :placeholder="$t('common:modules.statisticDashboard.legend.color')"
                    type="color"
                    :disabled="index > stepValues.length"
                    :value="convertColor(colorPalette?.[index - 1], 'hex')"
                    :input="value => changeOneColor(index - 1, convertColor(value, 'rgb'))"
                />
            </div>
            <div
                v-if="!areStepValuesAscending"
                class="alert alert-danger"
                role="alert"
            >
                {{ $t('common:modules.statisticDashboard.legend.invalidCustomStepsAlert') }}
            </div>
        </div>
        <div class="form-floating mb-5">
            <select
                id="opacity"
                class="form-select"
                @change="setOpacity(parseFloat($event.target.value))"
            >
                <option
                    v-for="v in [0.5, 0.6, 0.7, 0.8, 0.9, 1]"
                    :key="v"
                    :value="v"
                    :selected="v === opacity"
                >
                    {{ v.toLocaleString("de-DE", {style: "percent"}) }}
                </option>
            </select>
            <label for="color-palette">
                {{ $t('common:modules.statisticDashboard.legend.opacity') }}
            </label>
        </div>
        <div class="d-flex justify-content-center">
            <FlatButton
                id="back-to-dashboard"
                :aria-label="$t('common:modules.statisticDashboard.button.done')"
                :text="$t('common:modules.statisticDashboard.button.done')"
                :icon="'bi bi-check-lg'"
                :class="''"
                :interaction="() => $emit('changeLegendView')"
                :disabled="!areStepValuesAscending"
            />
        </div>
        <div class="d-flex justify-content-center">
            <FlatButton
                id="reset-legend"
                :aria-label="$t('common:modules.statisticDashboard.legend.reset')"
                :text="$t('common:modules.statisticDashboard.legend.reset')"
                :icon="'bi bi-x-circle'"
                :interaction="reset"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#class-range {
    accent-color:  $secondary;
    width: 100%;
    appearance: auto;
}
datalist#numbers {
    display: flex;
    justify-content: space-between;
}

</style>
