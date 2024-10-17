<script>
export default {
    name: "SliderItem",
    props: {
        aria: {
            type: String,
            required: true
        },
        id: {
            type: String,
            default: "shared-slider",
            required: false
        },
        label: {
            type: String,
            default: null,
            required: false
        },
        list: {
            type: String,
            default: null,
            required: false
        },
        min: {
            type: [String, Number],
            default: null,
            required: false
        },
        max: {
            type: [String, Number],
            default: null,
            required: false
        },
        step: {
            type: Number,
            default: null,
            required: false
        },
        value: {
            type: [String, Number],
            default: "0",
            required: false
        },
        disabled: {
            type: Boolean,
            default: false,
            required: false
        },
        interaction: {
            type: Function,
            default: () => {
                return true;
            },
            required: false
        },
        classArray: {
            type: Array,
            required: false,
            default: null
        }
    }
};
</script>

<template>
    <input
        :id="id"
        type="range"
        class="slider my-2 me-2"
        :class="classArray"
        :list="list"
        :value="value"
        :aria-label="aria"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @input="interaction"
    >
    <label
        :for="id"
        class="my-2"
    >
        {{ label }}
    </label>
</template>

<style lang="scss" scoped>
@import "~variables";

input{
    accent-color:  $secondary;
    width: 100%;
    appearance: auto;
}
</style>
