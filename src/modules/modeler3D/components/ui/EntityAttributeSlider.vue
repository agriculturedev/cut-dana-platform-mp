<script>
/**
 * The EntityAttributeSlider component.
 * @module modules/modeler3D/components/ui/EntityAttributeSlider
 * @vue-data {String} clickValue - The value of the steps that are made by the slider.
 * @vue-data {Number[]} dropdownValues - The values for the dropdown.
 * @vue-prop {String} title - The title of the slider.
 * @vue-prop {String} valueLabel - The label of the value.
 * @vue-prop {String} stepLabel - The label of the steps.
 * @vue-prop {String} value - The value of the slider.
 */
export default {
    name: "EntityAttributeSlider",
    props: {
        title: {
            type: String,
            required: true
        },
        valueLabel: {
            type: String,
            required: true
        },
        stepLabel: {
            type: String,
            default () {
                return i18next.t("common:modules.modeler3D.entity.captions.steps");
            },
            required: false
        },
        value: {
            type: String,
            required: true
        },
        buttons: {
            type: Boolean,
            default: true,
            required: false
        },
        min: {
            type: Number,
            default: 0,
            required: false
        },
        max: {
            type: Number,
            default: 100,
            required: false
        },
        unit: {
            type: String,
            default: "",
            required: false
        }
    },
    emits: ["input", "increment", "decrement"],
    data () {
        return {
            clickValue: 5,
            dropdownValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        };
    }
};
</script>

<template>
    <div class="container px-0 pt-0">
        <div class="form-group form-group-sm row ms-0">
            <div class="row ms-0 px-0 justify-content-between">
                <div class="col col-sm px-0">
                    <label
                        class="col col-form-label px-0"
                        :for="title + '-field'"
                    >
                        {{ valueLabel }}
                    </label>
                    <div class="col-5 px-0">
                        <input
                            :id="title + '-field'"
                            class="form-control form-control-sm"
                            :value="value"
                            @input="$emit('input', $event.target.value)"
                        >
                    </div>
                </div>
                <div class="col col-sm px-0">
                    <label
                        class="col col-form-label px-0"
                        :for="title + '-switch'"
                    >
                        {{ stepLabel }}
                    </label>
                    <div class="col-6 px-0">
                        <select
                            :id="title + '-switch'"
                            v-model="clickValue"
                            class="form-select form-select-sm"
                            aria-label="clickValue"
                        >
                            <option
                                v-for="val in dropdownValues"
                                :key="val"
                                :value="val"
                            >
                                {{ val }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="position-control px-0  py-4">
                <div>
                    <label
                        :for="title + '-slider-down'"
                        class="minmax-label left"
                    >
                        {{ min + unit }}
                    </label>
                    <button
                        class="btn btn-primary btn-sm"
                        @click="$emit('decrement', clickValue)"
                    >
                        <i
                            class="bi bi-arrow-left"
                        />
                    </button>
                </div>
                <input
                    :id="title + '-slider'"
                    :aria-label="title + '-slider'"
                    class="font-arial form-range"
                    type="range"
                    :min="min"
                    :max="max"
                    step="1"
                    :value="value"
                    @input="$emit('input', $event.target.value)"
                >
                <div>
                    <label
                        :for="title + '-slider-up'"
                        class="minmax-label right"
                    >
                        {{ max + unit }}
                    </label>
                    <button
                        class="btn btn-primary btn-sm"
                        @click="$emit('increment', clickValue)"
                    >
                        <i
                            class="bi bi-arrow-right"
                        />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";

    .position-control {
        position: relative;
        display: flex;
        gap: 0.25em;
    }

    .row {
        align-items: center;
    }

    .minmax-label {
        position: absolute;
        top: 4.5em;

        font-size: 0.9em;

        &.left {
            left: 3.5em;
        }

        &.right {
            right: 3.5em;
        }
    }
</style>
