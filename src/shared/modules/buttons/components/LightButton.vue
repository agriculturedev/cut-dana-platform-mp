<script>
import decodeHtmlEntites from "../../../js/utils/htmlEntities";

export default {
    name: "LightButton",
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
        },
        iconEnd: {
            type: String,
            default: null,
            required: false
        },
        customclass: {
            type: String,
            default: null,
            required: false
        },
        description: {
            type: String,
            default: null,
            required: false
        }
    },
    methods: {
        decodeHtmlEntites
    }
};
</script>

<template>
    <button
        type="button"
        class="btn btn-light d-flex align-items-center btn-description mp-btn-light"
        :class="[
            customclass
        ]"
        :aria-label=" decodeHtmlEntites($t(text))"
        @click="interaction"
        @keydown.enter="interaction"
    >
        <i
            v-if="icon !== null"
            :class="[
                icon, 'col-2'
            ]"
            role="img"
        />
        <span
            class="col lh-1 btn-texts row py-2"
        >
            <span class="btn-title">
                {{ decodeHtmlEntites($t(text)) }}
            </span>
            <span
                v-if="description"
                class="btn-description text-wrap col-12 pt-2"
            >
                {{ $t(description) }}
            </span>
        </span>
        <i
            v-if="iconEnd !== null"
            :class="[
                iconEnd, 'col-2'
            ]"
            class="align-self-end flex-direction"
            role="img"
        />
    </button>
</template>

<style lang="scss" scoped>
@import "~variables";

.btn {
    display: flex;
    justify-content: center;
    white-space: nowrap;
    min-height: 2.5rem;
    padding-right: 1rem;
    padding-left: 1rem;
    max-width: 100%;

    i {
        font-size: 1.3rem;
    }
    i:last-child {
        padding-left: .5rem;
        padding-right: 0;
    }
    .btn-texts {
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .btn-description {
            font-size: $font-size-sm;
        }
    }
    .btn-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        // Padding, so the Ü dots are visible
        padding-top: 2px;
    }
}
.btn-description {
    border-radius: 25px;
}

.mp-btn-light {
    margin-left: 0;
    margin-right: 0;
}
</style>
