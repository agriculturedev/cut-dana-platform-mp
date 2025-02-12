<script>
import {mapGetters} from "vuex";
import MenuContainerBodyRootItems from "./MenuContainerBodyRootItems.vue";

/**
 * Menu Folder
 * @module modules/MenuFolder
 * @vue-prop {String} side - Defines in which menu the component is being rendered.
 * @vue-computed {String} currentPath - The path to the current folder.
 */
export default {
    name: "MenuFolder",
    components: {
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
        ...mapGetters("Menu", ["currentComponentName", "currentFolderPath"]),

        currentPath () {
            return this.currentFolderPath(this.side);
        }
    }
};
</script>

<template>
    <div>
        <MenuContainerBodyRootItems
            :key="currentComponentName(side)"
            :id-appendix="side"
            :path="[...currentPath, 'elements']"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>
