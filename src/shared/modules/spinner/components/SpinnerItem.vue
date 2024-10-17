<script>
export default {
    name: "SpinnerItem",
    props: {
        customClass: {
            type: String,
            required: false,
            default: ""
        }
    }
};
</script>

<template>
    <div
        class="spinner-border"
        :class="customClass"
        role="status"
    >
        <span class="visually-hidden">Loading...</span>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.spinner-border {
    border: 3px solid $dark_blue;
    border-top: 3px solid $primary;
    width: 1.5rem;
    height: 1.5rem;
}
</style>
