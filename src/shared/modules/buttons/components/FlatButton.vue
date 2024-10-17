<script>
import SpinnerItem from "../../spinner/components/SpinnerItem.vue";

export default {
    name: "FlatButton",
    components: {SpinnerItem},
    props: {
        text: {
            type: String,
            required: true
        },
        interaction: {
            type: Function,
            required: false,
            default: () => {
                return true;
            }
        },
        icon: {
            type: String,
            default: null,
            required: false
        },
        spinnerTrigger: {
            type: Boolean,
            default: false,
            required: false
        },
        type: {
            type: String,
            required: false,
            default: "button"
        },
        customclass: {
            type: String,
            default: null,
            required: false
        },
        secondary: {
            type: Boolean,
            default: false,
            required: false
        }
    }
};
</script>

<template>
    <button
        class="flat-button btn btn-secondary d-flex align-items-center mb-3"
        :class="[
            customclass,
            secondary ? 'btn-scnd' : ''
        ]"
        :type="type"
        :aria-label="text"
        @click="interaction"
        @keydown.enter="interaction"
    >
        <i
            v-if="icon !== null && !spinnerTrigger "
            :class="icon"
            role="img"
        />
        <SpinnerItem
            v-if="spinnerTrigger"
            :custom-class="'p-2'"
        />
        <span class="btn-texts">
            {{ $t(text) }}
        </span>
    </button>
</template>

<style lang="scss" scoped>
@import "~variables";
@import "~mixins";

.btn {
    display: flex;
    justify-content: center;
    white-space: nowrap;
    min-height: 2.5rem;
    max-width: fit-content;
    padding-right: 1.5rem;
    padding-left: 1rem;

    i {
        font-size: 1.125rem;
        padding-right: .5rem;
        position: relative;
        top: 2px;
    }
    .btn-texts {
        white-space: normal;
        margin-left: .5rem;
    }
}

.btn-scnd {
    background-color: $light-blue;
    border-color: $light-blue;
    color: $black;
}
</style>
