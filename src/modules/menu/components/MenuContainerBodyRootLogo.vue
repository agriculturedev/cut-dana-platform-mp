<script>

/**
 * Menu Container Body Root Logo
 * @module modules/MenuContainerBodyRootLogo
 * @vue-prop {String} idAppendix - The appendix set on the id to make it unique.
 * @vue-prop {String} text - The name.
 * @vue-prop {String} link - The URL of an external website to link to.
 * @vue-prop {String} logo - The path to an external image file.
 * @vue-prop {String} toolTip - The text that is shown on hovering the name logo.
 */
export default {
    name: "MenuContainerBodyRootLogo",
    props: {
        /** Appendix set on the id to make it unique. Needed, as the menu can be rendered multiple times. */
        idAppendix: {
            type: String,
            required: true
        },
        /** name text */
        text: {
            type: String,
            required: false,
            default: ""
        },
        /** URL of an external website to link to */
        link: {
            type: String,
            default: ""
        },
        /** Path to an external image file */
        logo: {
            type: String,
            default: ""
        },
        /** Shown on hovering the name logo */
        toolTip: {
            type: String,
            default: ""
        }
    }
};
</script>

<template>
    <a
        :id="'mp-menu-logo-' + idAppendix"
        :href="link ? link : '#'"
        :target="link ? '_blank' : '_self'"
        :title="toolTip"
        class="mp-menu-logo"
    >

        <img
            v-if="logo"
            :src="logo"
            :alt="toolTip || text"
        >
        <h1>{{ $t(text) }}</h1>
    </a>
</template>

<style lang="scss" scoped>
@import "~variables";

.mp-menu-logo {
        padding: 0 $padding 0 $padding;
        width: 100%;
        display: flex;
        justify-content: space-around;
        overflow-wrap: break-word;

        img {
            max-height: 30px;
            flex-grow: 0;
            flex-shrink: 0;
        }

        h1 {
            color: $dark_blue;
            font-size: $font_size_huge;
            flex-grow: 1;
            margin-left: 20px;
        }
    }

@include media-breakpoint-up(sm)  {
    .mp-menu-logo {

        img {
            max-height: 40px;
        }

    }
}

</style>
