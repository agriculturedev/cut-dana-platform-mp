<script>
import SliderItem from "../../../shared/modules/slider/components/SliderItem.vue";
/**
 * Shadow Tool Slider Input
 * @module modules/ShadowToolSliderInput
 * @vue-prop {String} label - The label.
 * @vue-prop {String} valuelabel - The value label.
 * @vue-prop {String} value - The value.
 * @vue-prop {String} value - The value.
 * @vue-prop {Number} min - The minimum for the silder.
 * @vue-prop {Number} max - The maximum for the silder.
 * @vue-prop {Number} step - The steps for the slider.
 * @vue-prop {String} unit - The unit for the slider.
 * @vue-prop {Boolean} disabled - Shows if slider is disabled.
 * @vue-event {Number} input - Emits the slider input.
 */
export default {
    name: "ShadowToolSliderInput",
    components: {
        SliderItem
    },
    props: {
        label: {
            type: String,
            required: false,
            default: ""
        },
        valuelabel: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
        step: {
            type: Number,
            required: false,
            default: 1
        },
        unit: {
            type: String,
            required: false,
            default: ""
        },
        disabled: {
            type: Boolean,
            required: true
        }
    },
    emits: ["input"]
};
</script>

<template>
    <div
        class="d-flex flex-column mt-2 slider-input"
    >
        <label :for="'shadow-slider-input-' + label">
            <h6>{{ label }}</h6>
        </label>
        <div class="d-flex justify-content-end">
            <span>{{ valuelabel }}</span>
        </div>

        <SliderItem
            :id="'shadow-slider-input-' + label"
            :aria="label === 'Wählen Sie eine Uhrzeit:' ? $t('common:modules.aria.sliderAria') + $t('common:modules.shadow.slideHour') :
                $t('common:modules.aria.sliderAria') + $t('common:modules.shadow.pickDate')"
            :value="value"
            :min="min"
            :max="max"
            :step="step"
            :disabled="disabled"
            :interaction="$event => $emit('input', Number($event.target.value))"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .slider-input {
        accent-color: $secondary;
    }

    h6 {
        font-size: $font-size-base;
}
</style>
