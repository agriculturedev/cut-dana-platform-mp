<script>
import SliderItem from "../../../shared/modules/slider/components/SliderItem.vue";
/**
 * RoutingSliderInput
 * @module modules/RoutingSliderInput
 * @vue-prop {String} label - The label for the input.
 * @vue-prop {String} value - The value for the input.
 * @vue-prop {Number} min - The min value for the inputrange.
 * @vue-prop {Number} max - The max value for the inputrange.
 * @vue-prop {Number} step - The steps for the inputrange.
 * @vue-prop {String} unit - The unit for the inputrange label.
 * @vue-prop {Boolean} disabled - Shows wether the input is disabled.
 * @vue-event {Number} input - Emits the @input change event.
 */
export default {
    name: "RoutingSliderInput",
    components: {
        SliderItem
    },
    props: {
        label: {
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
            required: true
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
    <div class="d-flex flex-column mt-2">
        <label :for="'routing-slider-input-' + label">
            <h6>{{ label }}</h6>
        </label>
        <div class="d-flex justify-content-between">
            <span>{{ min }} {{ unit }}</span>
            <span>
                <b>{{ value }}</b> <span>{{ unit }}</span>
            </span>
            <span>{{ max }} {{ unit }}</span>
        </div>

        <SliderItem
            :id="'routing-slider-input-' + label"
            :aria="label === 'Maximale Reisedauer'?
                $t('common:modules.aria.sliderAria') + $t('common:modules.routing.isochrones.maxTraveltime') :
                $t('common:modules.aria.sliderAria') + $t('common:modules.routing.isochrones.interval')"
            :value="value"
            :min="min"
            :max="max"
            :step="step"
            :disabled="disabled"
            :interaction="$event=> $emit('input', Number($event.target.value))"
        />
    </div>
</template>
