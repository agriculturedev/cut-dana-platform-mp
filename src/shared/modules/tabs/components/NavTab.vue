<script>
export default {
    name: "NavTab",
    props: {
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            required: true
        },
        target: {
            type: String,
            required: true
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
    <li
        class="nav-item"
        role="presentation"
    >
        <button
            :id="id"
            class="nav-link"
            :class="active ? 'active' : ''"
            data-bs-toggle="tab"
            :data-bs-target="target"
            type="button"
            role="tab"
            :aria-controls="target"
            aria-selected="true"
            :aria-label="label"
            @click="interaction"
        >
            {{ $t(label) }}
        </button>
    </li>
</template>

<style lang="scss" scoped>
@import "~variables";
    .nav-tabs {
        border: none;
        .nav-link.active {
            border-top: none;
            border-left: none;
            border-right: none;
            border-bottom: 3px solid $dark_blue;
            font-family: $font_family_accent;
        }
        .nav-link {
            color: $black;
            border: none;
        }
        .nav-link:hover {
            border-radius: 0;
            background-color: $light_blue;
        }
    }
</style>
