<script>
export default {
    name: "SwitchInput",
    props: {
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        aria: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean,
            default: null,
            required: false
        },
        checked: {
            type: Boolean,
            default: null,
            required: false
        },
        interaction: {
            type: Function,
            required: false,
            default: () => {
                return true;
            }
        }
    }
};
</script>

<template>
    <div>
        <input
            :id="id"
            type="checkbox"
            role="switch"
            aria-checked="mixed"
            :aria-label="aria"
            class="form-check-input"
            :disabled="disabled"
            :checked="checked"
            @change="interaction"
        >
        <label
            class="form-check-label ps-2 pt-1 me-2"
            :for="id"
        >
            {{ $t(label) }}
        </label>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.form-check-input {
        width: 2.5rem;
        height: 1.5rem;
}
</style>
