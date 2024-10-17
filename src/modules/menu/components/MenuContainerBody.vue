<script>
import MenuContainerBodyRoot from "./MenuContainerBodyRoot.vue";
import MenuNavigation from "./MenuNavigation.vue";
import {mapActions, mapGetters} from "vuex";
import GetFeatureInfo from "../../getFeatureInfo/components/GetFeatureInfo.vue";

/**
 * @module modules/MenuContainerBody
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 * @vue-computed {Object} menu - The menu configuration for the given menu.
 * @vue-computed {Object} currentComponent - Returns the currently visible component.
 */
export default {
    name: "MenuContainerBody",
    components: {
        GetFeatureInfo,
        MenuContainerBodyRoot,
        MenuNavigation
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
        ...mapGetters("Menu", [
            "defaultComponent",
            "mainMenu",
            "secondaryMenu",
            "mainExpanded",
            "secondaryExpanded"
        ]),
        ...mapGetters("Modules", ["componentMap"]),
        ...mapGetters("Modules/GetFeatureInfo", {
            gfiMenuSide: "menuSide"
        }),

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
            let current = this.menu.navigation.currentComponent.type;

            if (current !== "root" && current !== this.defaultComponent) {
                current = this.componentMap[current];
            }
            return current;
        }
    },
    mounted () {
        this.menu?.sections?.forEach((elements, indexElements) => {
            const configPath = `${this.menu.configPaths}.${indexElements}`;

            this.initializeModuleConfig(elements, configPath);
        });
    },
    methods: {
        ...mapActions(["initializeModule"]),

        /**
         * Starts initializeModule for every configured module in menu.
         * @param {Object[]} elements The menu elements.
         * @param {String} configPath The path to elements
         * @returns {void}
         */
        initializeModuleConfig (elements, configPath) {
            elements.forEach((module, indexModule) => {
                const path = `${configPath}.${indexModule}`;

                if (module.type === "folder") {
                    this.initializeModuleConfig(module.elements, `${path}.elements`);
                }
                else if (module.type !== "customMenuElement") {
                    this.initializeModule({configPaths: [path], type: module.type});
                }
            });
        }
    }
};
</script>

<template>
    <div
        :id="'mp-body-' + side"
        class="mp-menu-body flex-grow-1"
        :class="
            {'mp-menu-body-collapsed': !mainExpanded && side === 'mainMenu' || !secondaryExpanded && side === 'secondaryMenu'}
        "
    >
        <MenuNavigation :side="side" />
        <GetFeatureInfo
            v-if="side === gfiMenuSide"
            v-show="currentComponent === 'getFeatureInfo'"
        />

        <component
            :is="currentComponent"
            v-if="currentComponent !== 'root' && currentComponent !== 'getFeatureInfo'"

            class="menu-body-component"
        />

        <MenuContainerBodyRoot
            v-show="currentComponent === 'root'"
            :side="side"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    .mp-menu-body {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 0 $padding $padding $padding;
        font-size: $font-size-base;
        overflow-y: auto;
        max-height: 100%;

        &-collapsed {
            padding: 0;
            display: none;
        }
        div:first-child {
            padding-top: $padding;
        }

        .menu-body-component {
            /* Hide scrollbar for Firefox */
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        /* Hide scrollbar for Chrome, Edge, Safari and Opera */
        .menu-body-component::-webkit-scrollbar {
            display: none;
        }
    }

    @include media-breakpoint-up(sm)  {
        #mp-body-mainMenu {
            margin-right: .5rem;
        }

        #mp-body-secondaryMenu {
            overflow-y: auto;
        }
        .mp-menu-body-collapsed {
            display: flex;
        }

    }
</style>
