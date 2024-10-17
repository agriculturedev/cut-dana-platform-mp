<script>
import {mapGetters} from "vuex";
import getNestedValues from "../../../shared/js/utils/getNestedValues";
import Layer from "../../layerTree/components/LayerComponent.vue";
import SelectAllCheckBox from "./SelectAllCheckBox.vue";
import LightButton from "../../../shared/modules/buttons/components/LightButton.vue";

/**
 * Representation of a node in layertree containing folders or layers.
 * @module modules/LayerSelectionTreeNode
 * @vue-prop {Object} conf - The current configuration.
 * @vue-prop {Boolean} showSelectAllCheckBox - Shows if SelectAllCheckBox is rendered.
 * @vue-prop {Array} selectAllConfigs - The layer-configurations controlled by SelectAllCheckBox.
 * @vue-computed {Boolean} isFolder - Shows if configurated type is folder.
 * @vue-computed {Boolean} isLayer - Shows if configurated type is layer.
 */
export default {
    name: "LayerSelectionTreeNode",
    components: {
        Layer,
        LightButton,
        SelectAllCheckBox
    },
    props: {
        /** current configuration */
        conf: {
            type: Object,
            required: true
        },
        /** if true, SelectAllCheckBox is rendered */
        showSelectAllCheckBox: {
            type: Boolean,
            default: false
        },
        /** layer-confs controlled by SelectAllCheckBox */
        selectAllConfigs: {
            type: Array,
            default () {
                return [];
            }
        }
    },
    emits: ["showNode"],
    computed: {
        ...mapGetters("Maps", ["mode"]),
        isFolder () {
            return this.conf.type === "folder";
        },
        isLayer () {
            return this.conf.type === "layer";
        }
    },
    methods: {
        /**
         * Toggles a folder, changes data-property isOpen.
         * @returns {void}
         */
        folderClicked () {
            if (this.conf.elements) {
                this.$emit("showNode", this.conf.name, this.conf.elements);
            }
        },
        /**
         * Returns true, if folder shall be displayed.
         * @returns {Boolean} true, if folder shall be displayed.
         */
        showFolder () {
            const allConfigs = getNestedValues(this.conf, "elements", true).flat(Infinity);

            if (this.mode === "2D") {
                return this.isFolder && !allConfigs.every(conf => conf.is3DLayer);
            }

            return this.isFolder;
        }
    }
};
</script>

<template>
    <SelectAllCheckBox
        v-if="showSelectAllCheckBox"
        :confs="selectAllConfigs"
    />
    <div :id="'layer-selection-treenode-' + (conf.id ? conf.id : conf.name?.replace(/\s/g, ''))">
        <div v-if="showFolder()">
            <LightButton
                :interaction="folderClicked"
                :text="$t(conf.name)"
                icon="bi-folder"
                icon-end="bi-chevron-right"
                customclass="w-100 layer-selection-folder"
                :title="conf.name"
            />
        </div>
        <template
            v-else
        >
            <Layer
                v-if="isLayer"
                :conf="conf"
            />
        </template>
    </div>
</template>

<style>
.layer-selection-folder {
    flex-wrap: nowrap;
    padding-left: 0;
    padding-right: 0;
    justify-content: flex-start !important;
}

.layer-selection-folder > i {
    flex: none;
    width: unset;
    padding-right: 8px;
}
</style>
