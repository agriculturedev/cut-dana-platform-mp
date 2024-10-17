<script>
/**
 * ControlIcon component to be used by controls to display
 * clickable control buttons.
 * @module modules/ControlIcon
 * @vue-prop {String} iconName - Name of the bootstrap icon, with or without prefix 'bi-'.
 * @vue-prop {Boolean} disabled - Whether the icon is currently clickable or marked disabled.
 * @vue-prop {String} title - The tooltip text.
 * @vue-prop {Function} onClick - The click-function of the Control-Button.
 * @vue-prop {String} buttonTitle - The text for the Control-Button.
 * @vue-computed {String} iconClass - The icon name with added prefix 'bi-' if it was missing.
 */
export default {
    name: "ControlIcon",
    props: {
        /** Name of the bootstrap icon, with or without prefix 'bi-' */
        iconName: {
            type: String,
            default: ""
        },
        /** Whether the icon is currently clickable or marked disabled */
        disabled: {
            type: Boolean,
            default: false
        },
        /** Tooltip text */
        title: {
            type: String,
            required: true
        },
        /** onClick function of the button element */
        onClick: {
            type: Function,
            default: () => console.warn("No onClick function was defined on this ControlIcon.")
        },
        buttonTitle: {
            type: String,
            default: ""
        }
    },
    computed: {
        /**
         * @returns {String} icon url or classname with added prefix 'bi-' if it was missing
         */
        iconClassOrSrc () {
            if (this.iconName.startsWith("http")) {
                return this.iconName;
            }

            return this.iconName === "" || this.iconName.startsWith("bi-") ? this.iconName : `bi-${this.iconName}`;
        }
    }
};
</script>

<template>
    <button
        type="button"
        :tabindex="disabled ? '-1' : '0'"
        :class="['control-icon-controls', 'bootstrap-icon', 'btn', 'my-2', 'control-button-controls', 'btn-light', 'px-1']"
        :title="title"
        :disabled="disabled"
        @click.stop="onClick"
        @keyup.space.stop.prevent="onClick"
    >
        <!-- children should usually be placed absolutely in relation to ControlIcon -->
        <i
            v-if="!iconClassOrSrc.includes('masterportal') && !iconClassOrSrc.includes('http')"
            :class="iconClassOrSrc"
        />
        <img
            v-else-if="iconClassOrSrc.includes('http')"
            :src="iconClassOrSrc"
            :alt="title"
            class="icon-img"
        >
        <p
            v-else-if="buttonTitle !== ''"
        >
            {{ title }}
        </p>
        <slot />
    </button>
</template>

<style lang="scss">
    @import "~variables";

    .control-button-controls {
        display: block;
        text-align: center;
        top: auto;

        font-size: calc(#{$icon_length} - 0.35 * #{$icon_length});
        height: $icon_length;
        width: $icon_length;
    }

    .control-icon-controls {
        pointer-events: all;
        cursor: pointer;
        border: solid $white 1px;
        border-radius: 50%;

        /* position icon in center of button */
        > i {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            // adjust line-height to use same height as ::before Element
            line-height: 0;
        }

        > p {
            color: $black;
            font-family: $font_family_accent;
            font-size: 17px;
            padding: .25rem 0 0 0
        }

        .icon-img {
            vertical-align: top;
            height: 100%;
        }
    }
</style>
