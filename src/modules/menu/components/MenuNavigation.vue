<script>
import {mapActions, mapGetters} from "vuex";

/**
 * Menu Navigation
 * @module modules/MenuNavigation
 * @vue-prop {String} side - Defines in which menu the component is being rendered.
 * @vue-computed {String} previousNavigation - The previous navigation entry.
 * @vue-computed {String} currentTitle - The current components name.
 */
export default {
    name: "MenuNavigation",
    props: {
        /** Defines in which menu the component is being rendered */
        side: {
            type: String,
            required: true,
            validator: value => value === "mainMenu" || value === "secondaryMenu"
        }
    },
    computed: {
        ...mapGetters("Menu", ["previousNavigationEntryText", "currentComponentName"]),
        ...mapGetters(["isMobile"]),

        previousNavigation () {
            return this.previousNavigationEntryText(this.side);
        },

        currentTitle () {
            return this.currentComponentName(this.side);
        }
    },
    methods: {
        ...mapActions("Menu", ["navigateBack", "resetMenu"])
    }
};
</script>

<template>
    <div
        v-if="previousNavigation"
        :id="'mp-menu-navigation-' + side"
    >
        <div
            class="mp-menu-navigation"
        >
            <a
                :id="'mp-navigation-' + side"
                class="pt-2 mp-menu-navigation-link"
                href="#"
                @click="navigateBack(side)"
                @keypress="navigateBack(side)"
            >
                <h6 class="mp-menu-navigation-link-text mb-1"><p class="bi-chevron-left me-2" />{{ previousNavigation }}</h6>
            </a>
            <button
                v-if="!isMobile"
                :id="'mp-menu-navigation-reset-button-' + side"
                type="button"
                class="btn-close mp-menu-navigation-reset-button"
                :aria-label="$t('common:modules.menu.ariaLabelClose')"
                @click="resetMenu(side)"
            />
        </div>
        <h4
            v-if="currentTitle !== 'none'"
            class="mp-menu-navigation-moduletitle mb-4"
        >
            {{ currentTitle }}
        </h4>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.mp-menu-navigation{
    display: flex;
    justify-content: space-between;

    &-link {
        display: flex;
        color: $black;

        &-text{
        display: flex;
    }
    }
}

.mp-menu-navigation-moduletitle{
    display: flex;
}

</style>
