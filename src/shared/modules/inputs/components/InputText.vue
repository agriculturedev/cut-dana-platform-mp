<script>
export default {
    name: "InputText",
    props: {
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        placeholder: {
            type: String,
            required: true
        },
        value: {
            type: String,
            default: null,
            required: false
        },
        model: {
            type: String,
            default: null,
            required: false
        },
        type: {
            type: String,
            default: null,
            required: false
        },
        maxLength: {
            type: String,
            default: null,
            required: false
        },
        input: {
            type: Function,
            default: null,
            required: false
        },
        change: {
            type: Function,
            default: null,
            required: false
        },
        disabled: {
            type: Boolean,
            default: false,
            required: false
        },
        readonly: {
            type: Boolean,
            default: false,
            required: false
        },
        classObj: {
            type: Object,
            default: null,
            required: false
        }
    }
};
</script>

<template>
    <div class="form-floating mb-3">
        <input
            :id="id"
            :type="type"
            :v-model="model"
            class="form-control"
            :class="classObj"
            :placeholder="placeholder"
            :aria-label="placeholder"
            :value="value"
            :readonly="readonly"
            :maxLength="maxLength"
            :disabled="disabled"
            @input="event => input?.(event.target.value)"
            @change="event => change?.(event.target.value)"
        >
        <label
            class="input-label"
            :for="id"
        >{{ $t(label) }}</label>
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.form-control:focus ~ label {
    color: $secondary;
}
.input-label {
    color: $placeholder-color;
}
</style>
