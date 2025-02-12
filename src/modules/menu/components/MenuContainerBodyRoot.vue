<script>
import LayerTree from "../../layerTree/components/LayerTree.vue";
import MenuContainerBodyRootItems from "./MenuContainerBodyRootItems.vue";
import {mapGetters} from "vuex";

/**
 * @module modules/MenuContainerBodyRoot
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 * @vue-computed {Object} menu - The menu configuration for the given menu.
 */
export default {
    name: "MenuContainerBodyRoot",
    components: {
        LayerTree,
        MenuContainerBodyRootItems
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
            "mainMenu",
            "secondaryMenu",
            "titleBySide"
        ]),

        /**
         * @returns {Object} Menu configuration for the given menu.
         */
        menu () {
            return this.side === "mainMenu" ? this.mainMenu : this.secondaryMenu;
        }
    },
    methods: {
        /**
         * Returns the path for a section inside the menu this component is rendered in.
         * @param {Number} sectionIndex Index inside of a section of a menu.
         * @returns {Array} Contains the path for a section.
         */
        path (sectionIndex) {
            return [this.side, "sections", sectionIndex];
        }
    }
};
</script>

<template>
    <div
        :id="'mp-body-root-'+side"
    >
        <LayerTree v-if="side === 'mainMenu'" />
        <template
            v-for="(_, key) in menu.sections"
            :key="key"
        >
            <MenuContainerBodyRootItems
                :id-appendix="side"
                :side="side"
                :path="path(key)"
            />
            <hr>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

</style>
