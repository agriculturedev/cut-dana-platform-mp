<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import MenuContainerBody from "./MenuContainerBody.vue";
import ResizeHandle from "../../../shared/modules/resize/components/ResizeHandle.vue";
import MenuContainerBodyRootLogo from "./MenuContainerBodyRootLogo.vue";
import SearchBar from "../../searchBar/components/SearchBar.vue";

/**
 * @module modules/MenuContainer
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 * @vue-computed {String} handlePosition - Defines whether the ResizeHandle should be displayed on the right or left side.
 * @vue-computed {Boolean} expanded - Shows if the menu is expanded.
 */
export default {
    name: "MenuContainer",
    components: {
        MenuContainerBody,
        MenuContainerBodyRootLogo,
        ResizeHandle,
        SearchBar
    },
    props: {
        /** Defines in which menu the component is being rendered */
        side: {
            type: String,
            default: "mainMenu",
            validator: value => value === "mainMenu" || value === "secondaryMenu"
        }
    },
    computed: {
        ...mapGetters([
            "menuFromConfig",
            "isMobile",
            "uiStyle"
        ]),
        ...mapGetters("Modules", ["componentMap"]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu",
            "currentMenuWidth",
            "mainExpanded",
            "secondaryExpanded",
            "titleBySide",
            "currentComponent",
            "defaultComponent"
        ]),
        /**
         * @returns {Object} Menu configuration for the given menu.
         */
        menu () {
            return this.side === "mainMenu" ? this.mainMenu : this.secondaryMenu;
        },

        /**
         * @returns {Object} Returns the currently visible Component.
         */
        currentComponent () {
            let current = this.menu?.navigation?.currentComponent?.type;

            if (current !== "root" && current !== this.defaultComponent) {
                current = this.componentMap[current];
            }

            return current;
        },
        /**
         * @returns {String} Defines whether the ResizeHandle should be displayed on the right or left side depending on the menu this component is rendered in.
         */
        handlePosition () {
            return this.side === "mainMenu" ? "right" : "left";
        },

        expanded () {
            return this.side === "mainMenu" ? this.mainExpanded : this.secondaryExpanded;
        }
    },
    watch: {
        mainMenu (mainMenu) {
            this.mergeMenuState({menu: mainMenu, side: "mainMenu"});
        },
        secondaryMenu (secondaryMenu) {
            this.mergeMenuState({menu: secondaryMenu, side: "secondaryMenu"});
        },
        isMobile (isMobile) {
            if (isMobile) {
                this.collapseMenues();
                this.setCurrentMenuWidth({side: this.side, width: "100%"});
            }
            else {
                this.setCurrentMenuWidth({side: this.side, width: "25%"});
            }
        }
    },
    created () {
        this.mergeMenuState({menu: this.menuFromConfig(this.side), side: this.side});
        if (this.isMobile) {
            this.collapseMenues();
            this.setCurrentMenuWidth({side: this.side, width: "100%"});
        }
    },
    methods: {
        ...mapMutations("Menu", [
            "collapseMenues",
            "mergeMenuState",
            "setCurrentMenuWidth"
        ]),
        ...mapActions("Menu", ["clickedMenuElement", "toggleMenu", "closeMenu"]),
        /**
         * Opens the searchbar module.
         * @returns {void}
         */
        openSearchBar () {
            this.clickedMenuElement({
                name: "common:modules.searchBar.searchResultList",
                side: this.side,
                type: "searchbar"
            });
        }
    }
};
</script>

<template>
    <div
        :id="'mp-menu-' + side"
        class="mp-menu shadow d-flex"
        :class="[
            'mp-' + side,
            {
                'mp-menu-table': uiStyle === 'TABLE',
                'mp-secondaryMenu-expanded': secondaryExpanded && side === 'secondaryMenu'
            }
        ]"
        tabindex="-1"
        :style="expanded ? 'width:' + currentMenuWidth(side) : 'width:0'"
        :aria-label="titleBySide(side) ? titleBySide(side).text : null"
    >
        <div
            :id="'mp-header-' + side"
            class="mp-menu-header"
            :class="
                {'mp-menu-header-collapsed': !mainExpanded && side === 'mainMenu' || !secondaryExpanded && side === 'secondaryMenu'}
            "
        >
            <button
                :id="'mp-menu-header-close-button-' + side"
                type="button"
                class="btn-close p-2 mp-menu-header-close-button"
                :aria-label="$t('common:modules.menu.ariaLabelClose')"
                @click="closeMenu(side)"
            />
            <div
                v-if="(currentComponent ==='root') && titleBySide(side)"
                :id="'mp-subHeader-' + side"
                class="mp-menu-subHeader"
                :class="
                    {'mp-menu-subHeader-collapsed': !mainExpanded && side === 'mainMenu' || !secondaryExpanded && side === 'secondaryMenu'}
                "
            >
                <MenuContainerBodyRootLogo
                    class="mb-5 mt-4"
                    v-bind="titleBySide(side)"
                />
                <SearchBar
                    :click-action="openSearchBar"
                />
            </div>
        </div>
        <MenuContainerBody
            :side="side"
        />
        <ResizeHandle
            v-if="!isMobile"
            :id="'mp-resize-handle-' + side"
            class="mp-menu-container-handle"
            :handle-position="handlePosition"
            :mutation="setCurrentMenuWidth"
            :min-width="0"
            :max-width="0.6"
            :min-height="1"
        >
            &#8942;
        </ResizeHandle>
    </div>
</template>

<style lang="scss">
@import "~variables";
.mp-menu {
    height: 100%;
    position: fixed;
    background-color: $menu-background-color;
    transition: width 0.3s ease;
    z-index: 2;
    flex-direction: column
}

.mp-mainMenu {
    left: 0px;
}

.mp-secondaryMenu {
    border-radius: 15px 15px 0 0;
    height: 0;
    position: absolute;
    top: 100%;
    transition: top 0.3s ease;
    &-expanded {
        height: 100%;
        top: 70%;
    }
}


.mp-menu-header{
    display: flex;
    &-collapsed {
        padding: 0;
        display: none;
    }

    .mp-menu-subHeader{
        display: flex;
        flex-direction: column;
        align-items: stretch;
        font-size: $font-size-base;
        padding: $padding $padding 0 $padding;
        width:100%;

        &-collapsed {
            padding: 0;
            display: none;
        }
    }
}

.mp-menu-header-close-button {
    display: block;
    position: absolute;
    right: 10px;
    top: 10px;
}


@include media-breakpoint-up(sm)  {
    .mp-menu {
        top: 0px;
        min-width: 0%;
        flex-grow: 0;
        flex-shrink: 0;
        position: relative;
    }

    .mp-mainMenu {
        left: 0;
        overflow-x: hidden;
    }

    .mp-secondaryMenu {
       border-radius: 0;
       right:0;
       width: unset;
       transition: width 0.3s ease;
    }

    .mp-menu-container-handle {
        display: flex;
        width: 9px;
        align-items: center;
        justify-content: center;
        top: 0rem;
        font-size: 2rem;

        &:hover {
            background-color: $light_grey_active;
        }
    }
}

@include media-breakpoint-up(md) {
    .mp-menu-header-close-button {
        display: none;
    }
}

.mp-menu-table {
    height: 200px;
    position: fixed;
    left: calc(50% - 200px);
    top: calc(100% - 250px);
}
</style>
