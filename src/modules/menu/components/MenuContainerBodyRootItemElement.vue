<script>
import {mapActions, mapGetters} from "vuex";
import visibilityChecker from "../../../shared/js/utils/visibilityChecker";
import LightButton from "../../../shared/modules/buttons/components/LightButton.vue";

/**
 * Menu Container Body Root Item Element
 * @module modules/MenuContainerBodyRootItemElement
 * @vue-prop {String} name - The text displayed inside the element.
 * @vue-prop {String} description - The description used as it's name and aria-label.
 * @vue-prop {String} icon - The icon displayed inside the element.
 * @vue-prop {Boolean} showDescription - Shows whether the description should be displayed alongside the element.
 * @vue-prop {Array} path - The path to find the element inside the store structure.
 * @vue-prop {Object} properties - All properties of the module to show in menu.
 * @vue-computed {Object} menu - The menu configuration for the given menu.
 * @vue-computed {Boolean} showIcon - Shows wether icon will be displayed.
 * @vue-computed {String} side - The menu side.
 * @vue-computed {String} type - The type of the component.
 */
export default {
    name: "MenuContainerBodyRootItemElement",
    components: {LightButton},
    props: {
        /** Text displayed inside the element. */
        name: {
            type: String,
            required: true,
            validator: value => value !== ""
        },
        /** Description used as it's name and aria-label. May be displayed alongside the element. */
        description: {
            type: String,
            default: ""
        },
        /** Icon displayed inside the element. */
        icon: {
            type: String,
            default: "",
            validator: value => value.startsWith("bi-")
        },
        /** Path to find the element inside the store structure. */
        path: {
            type: Array,
            default: () => []
        },
        /** All properties of the module to show in menu. */
        properties: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters(["deviceMode", "portalConfig"]),
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu",
            "showDescription"
        ]),

        /**
         * @returns {Object} Menu configuration for the given menu.
         */
        menu () {
            return this.side === "mainMenu" ? this.mainMenu : this.secondaryMenu;
        },

        /**
         * @returns {Boolean} Depending on whether the icon is given it is decided whether on is shown.
         */
        showIcon () {
            return typeof this.icon === "string" && this.icon.length > 0;
        },

        /**
         * @returns {String} The menu side.
         */
        side () {
            return this.path[0];
        },

        /**
         * @returns {String} The type of the component.
         */
        type () {
            return this.properties.type;
        }
    },
    /**
     * Lifecycle-Hook: Sets the configured current component.
     * @returns {void}
     */
    created () {
        if (this.type === this.menu.currentComponent && this.type !== "folder") {
            this.clickedMenuElement({
                name: this.name,
                path: this.path,
                side: this.side,
                type: this.type
            });
        }
    },
    methods: {
        ...mapActions("Menu", ["clickedMenuElement", "resetMenu"]),

        /**
         * Checks if the module is to be applied in the map- and device mode.
         * If current visible component does not support the map- and device mode, it is destroyed.
         * @returns {Boolean} The module is shown.
         */
        checkIsVisible () {
            const supportedMapModes = this.properties.supportedMapModes,
                supportedDevices = this.properties.supportedDevices,
                supportedTreeTypes = this.properties.supportedTreeTypes,
                showModule = visibilityChecker.isModuleVisible(this.mode, this.deviceMode, this.portalConfig?.tree?.type, supportedMapModes, supportedDevices, supportedTreeTypes);

            if (!showModule && this.menu.currentComponent === this.type) {
                this.resetMenu(this.side);
            }
            return showModule;
        }
    }

};
</script>

<template>
    <div>
        <LightButton
            v-if="checkIsVisible()"
            :interaction="() => clickedMenuElement({name, path, side, type, properties})"
            :text="name"
            :icon="showIcon ? icon : null"
            :description="showDescription(side) ? description : null"
            customclass="w-100 justify-content-start mp-menu-root-element"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.mp-menu-root-element {
    min-height: 2.3rem;
}

</style>
