<script>
export default {
    name: "ElevatedButton",
    props: {
        text: {
            type: String,
            required: true
        },
        interaction: {
            type: Function,
            required: true
        },
        icon: {
            type: String,
            default: null,
            required: false
        }
    }
};
</script>

<template>
    <button
        class="btn btn-primary d-flex align-items-center shadow"
        type="button"
        :aria-label="text"
        @click="interaction"
        @keydown.enter="interaction"
    >
        <i
            v-if="icon !== null"
            :class="icon"
            role="img"
        />
        {{ $t(text) }}
    </button>
</template>

<style lang="scss" scoped>
@import "~variables";
@import "~mixins";

.btn {
    display: flex;
    justify-content: center;
    white-space: nowrap;
    height: 3.5rem;
    min-width: 5rem;
    width: fit-content;
    padding-right: 1.5rem;
    padding-left: 1rem;

    i {
        font-size: 1.5rem;
        padding-right: .5rem;
    }
}
</style>
