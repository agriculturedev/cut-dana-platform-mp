<script>
import {mapActions, mapMutations, mapGetters} from "vuex";
import LayerTreeNode from "./LayerTreeNode.vue";
import {treeBaselayersKey, treeSubjectsKey} from "../../../shared/js/utils/constants";
import sortBy from "../../../shared/js/utils/sortBy";
import ElevatedButton from "../../../shared/modules/buttons/components/ElevatedButton.vue";

/**
 * Module to display the layers in menu.
 * @module modules/layerTree/components/LayerTree
 */
export default {
    name: "LayerTree",
    components: {
        ElevatedButton,
        LayerTreeNode
    },
    computed: {
        ...mapGetters(["allLayerConfigsStructured", "showLayerAddButton", "portalConfig"]),
        ...mapGetters("Modules/LayerTree", ["menuSide"]),
        ...mapGetters("Modules/LayerSelection", {layerSelectionType: "type", layerSelectionName: "name"}),

        /**
         * Returns the title of button.
         * @returns {String} the button title.
         */
        title () {
            if (typeof this.portalConfig?.tree?.addLayerButton?.buttonTitle === "string" && this.portalConfig?.tree?.addLayerButton?.buttonTitle !== "") {
                return this.portalConfig?.tree?.addLayerButton?.buttonTitle;
            }

            return "common:modules.layerTree.addLayer";
        }
    },
    methods: {
        ...mapActions("Modules/LayerSelection", ["navigateForward"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),
        ...mapMutations("Modules/LayerSelection", {setLayerSelectionVisible: "setVisible"}),
        /**
         * Sorts the configs by type: first folder, then layer.
         * @param {Array} configs list of layer and folder configs
         * @returns {Array} the sorted configs
         */
        sort (configs) {
            return sortBy(configs, (conf) => conf.type !== "folder");
        },
        /**
         * Shows the component LayerSelection and sets it visible.
         * @returns {void}
         */
        showLayerSelection () {
            const subjectDataLayerConfs = this.sort(this.allLayerConfigsStructured(treeSubjectsKey)),
                baselayerConfs = this.allLayerConfigsStructured(treeBaselayersKey);

            this.changeCurrentComponent({type: this.layerSelectionType, side: this.menuSide, props: {name: this.layerSelectionName}});
            this.navigateForward({lastFolderName: "root", subjectDataLayerConfs, baselayerConfs});
            this.setLayerSelectionVisible(true);
        }
    }
};
</script>

<template lang="html">
    <div
        id="layer-tree"
        class="layer-tree"
    >
        <LayerTreeNode />
        <div
            v-if="showLayerAddButton"
            class="mt-4 d-flex justify-content-center sticky"
        >
            <ElevatedButton
                id="add-layer-btn"
                :aria-label="$t(title)"
                :interaction="showLayerSelection"
                :text="$t(title)"
                :icon="'bi-plus-circle'"
            />
        </div>
    </div>
    <hr>
</template>

<style lang="scss" scoped>
@import "~variables";
    .layer-tre {
        padding-left: $padding;
        font-size: $font-size-base;
        max-height: 350px;
    }

    .sticky {
        position : sticky;
        bottom: 2rem;
    }
</style>
