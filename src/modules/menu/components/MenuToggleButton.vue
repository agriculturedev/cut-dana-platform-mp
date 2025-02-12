<script>
import {mapActions, mapGetters} from "vuex";

/**
 * Menu Toggle Button
 * @module modules/MenuToggleButton
 * @vue-prop {String} side - Defines in which menu the component is being rendered.
 * @vue-computed {String} iconClass - The icon class depending on the side this button is used for.
 */
export default {
    name: "MenuToggleButton",
    props: {
        side: {
            type: String,
            default: "mainMenu",
            validator: value => value === "mainMenu" || value === "secondaryMenu"
        }
    },
    computed: {
        ...mapGetters("Menu", ["mainExpanded", "secondaryExpanded", "mainToggleButtonIcon", "secondaryToggleButtonIcon"]),
        /**
         * @returns {String} iconClass to be used depending on the side this button is used for.
         */
        iconClass () {
            let icon;

            if (this.side === "mainMenu") {
                icon = this.mainExpanded ? "bi-chevron-left" : this.mainToggleButtonIcon;
            }
            else {
                icon = this.secondaryExpanded ? "bi-chevron-right" : this.secondaryToggleButtonIcon;
            }

            return icon;
        }
    },
    methods: {
        ...mapActions("Menu", ["toggleMenu"])
    }
};
</script>

<template>
    <button
        :id="side + '-toggle-button'"
        class="btn btn-light bootstrap-icon shadow menu-toggle-button"
        :class="[
            'toggle-button-' + side,
            {'expanded': mainExpanded && side === 'mainMenu' || secondaryExpanded && side === 'secondaryMenu'}
        ]
        "
        type="button"
        :aria-label="$t('common:modules.menu.ariaLabelOpen')"
        @click="toggleMenu(side)"
    >
        <i :class="iconClass" />
    </button>
</template>

<style lang="scss" scoped>
@import "~variables";


.menu-toggle-button {
        border-radius: 50%;
        right: 20px;
        position: fixed;
        font-size: $icon_length;
        height: calc(#{$icon_length} * 1.75);
        width: calc(#{$icon_length} * 1.75);
        flex-grow: 0;
        flex-shrink: 0;
        z-index: 1;
    }
    .toggle-button-mainMenu {
        top:60%;
        left: auto;
    }

    .toggle-button-secondaryMenu {
        top:calc(60% + #{$icon_length} * 1.75 + 10px);
    }

    .expanded {
        display: none;
    }

@include media-breakpoint-down(sm) {
    .toggle-button-mainMenu {
        bottom: 8rem;
        top: unset;
    }
    .toggle-button-secondaryMenu {
        bottom: 3rem;
        top: unset;
    }
}
@include media-breakpoint-up(sm) {

    .menu-toggle-button {
        top: 15px;
        font-size: $icon_length;
        height: $icon_length *  1.5 ;
        width: $icon_length * 1.5;
        position: relative;
        border-width: 1px;
        border-color: $light-grey;

        i {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            line-height: 0;
        }
    }

    .toggle-button-mainMenu {
        left: 0;
        border-top-right-radius: 50%;
        border-bottom-right-radius: 50%;
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        &.expanded {
            display: block;
        }
    }

    .toggle-button-secondaryMenu {
        right: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 50%;
        border-top-left-radius: 50%;

        &.expanded {
            display: block;
        }
    }
}
</style>
