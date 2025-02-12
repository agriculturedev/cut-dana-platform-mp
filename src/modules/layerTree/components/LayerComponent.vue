<script>
import {mapGetters} from "vuex";
import layerFactory from "../../../core/layers/js/layerFactory";
import thousandsSeparator from "../../../shared/js/utils/thousandsSeparator";
import LayerCheckBox from "./LayerCheckBox.vue";
import LayerComponentIconInfo from "./LayerComponentIconInfo.vue";
import LayerComponentIconSubMenu from "./LayerComponentIconSubMenu.vue";
import LayerComponentSubMenu from "./LayerComponentSubMenu.vue";
import layerCollection from "../../../core/layers/js/layerCollection";

/**
 * Representation of a layer in layerTree.
 * @module modules/layerTree/components/LayerComponent
 * @vue-prop {Object} conf - The current layer configuration.
 * @vue-data {String} tooltipText - Contains information about scales, when the layer shall be disabled and is not shown in the map.
 */
export default {
    name: "LayerComponent",
    components: {
        LayerCheckBox,
        LayerComponentIconInfo,
        LayerComponentIconSubMenu,
        LayerComponentSubMenu
    },
    props: {
        /** current layer configuration */
        conf: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            tooltipText: ""
        };
    },
    computed: {
        ...mapGetters("Maps", ["mode", "scale", "scales"])
    },
    mounted () {
        if (this.conf.maxScale && this.conf.minScale) {
            let minScale = parseInt(this.conf.minScale, 10);

            if (minScale === 0) {
                minScale = this.scales[this.scales.length - 1];
            }
            this.tooltipText = this.$t("common:modules.layerTree.invisibleLayer", {
                minScale: "1: " + thousandsSeparator(minScale),
                maxScale: "1: " + thousandsSeparator(parseInt(this.conf.maxScale, 10), ".")
            });
        }
        else if (this.conf.maxScale || this.conf.minScale) {
            this.tooltipText = this.$t("common:modules.layerTree.invisibleLayerNoScale");
        }
    },
    methods: {
        /**
         * Returns true, if layer configuration shall be shown in tree in current map mode.
         * Filteres by attribute 'showInLayerTree' and respects 'isNeverVisibleInTree' is not true.
         * @returns {Boolean} true, if layer configuration shall be shown in tree
         */
        show () {
            const showLayerTyp = this.mode === "2D" ? !layerFactory.getLayerTypes3d().includes(this.conf.typ?.toUpperCase()) : !layerFactory.getLayerTypesNotVisibleIn3d().includes(this.conf.typ?.toUpperCase());

            if (this.isLayerTree()) {
                return this.conf.showInLayerTree === true && showLayerTyp && this.conf.isNeverVisibleInTree !== true;
            }
            return showLayerTyp && this.conf.isNeverVisibleInTree !== true;
        },
        /**
         * Returns true, if this parent is a 'LayerTreeNode' in layer-tree and false if parent is 'LayerSelectionTreeNode' in layer-selection.
         * @returns {Boolean} true, if this parent is a 'LayerTreeNode' in layer-tree
         */
        isLayerTree () {
            return this.$parent.$options.name !== "LayerSelectionTreeNode";
        },
        /**
         * Returns true, if this layer is not visible in the maps current scale. Returns false, if this is not the layerTree or mode is '3D'.
         * @returns {Boolean}  true, if this layer is not visible in the maps current scale
         */
        scaleIsOutOfRange () {
            if (!this.isLayerTree() || this.conf.maxScale === undefined) {
                return false;
            }
            if (this.mode === "3D" && this.conf.visibility === true && (this.scale > parseInt(this.conf.maxScale, 10) || this.scale < parseInt(this.conf.minScale, 10))) {
                const layer = layerCollection.getLayerById(this.conf.id).layer;

                layer.setVisible(false);
            }
            else if (this.mode === "3D" && this.conf.visibility === true) {
                const layer = layerCollection.getLayerById(this.conf.id).layer;

                layer.setVisible(true);
            }

            return this.scale > parseInt(this.conf.maxScale, 10) || this.scale < parseInt(this.conf.minScale, 10);
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="show()"
        :id="'layer-tree-layer-' + conf.id"
        :class="['layer-tree-layer', 'd-flex', 'flex-column', 'justify-content-between', !isLayerTree() ? 'layer-selection': '']"
    >
        <div class="d-flex justify-content-between align-items-center handle-layer-component-drag">
            <span
                class="layer-checkbox-tooltip"
                :data-bs-toggle="scaleIsOutOfRange() ? 'tooltip' : null"
                data-bs-placement="bottom"
                data-bs-custom-class="custom-tooltip"
                :title="scaleIsOutOfRange() ? tooltipText : ''"
            >
                <LayerCheckBox
                    :conf="conf"
                    :disabled="scaleIsOutOfRange()"
                    :is-layer-tree="isLayerTree()"
                />
            </span>
            <div
                class="d-flex"
            >
                <LayerComponentIconSubMenu
                    v-if="isLayerTree()"
                    :layer-conf="conf"
                />
                <LayerComponentIconInfo
                    :is-layer-tree="isLayerTree()"
                    :layer-conf="conf"
                />
            </div>
        </div>
        <div
            v-if="isLayerTree()"
            :id="'collapse-sub-menu-' + conf.id.split('.').join('_')"
            class="collapse"
        >
            <LayerComponentSubMenu :layer-conf="conf" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    @import "~mixins";

    .layer-checkbox-tooltip {
        overflow: hidden;
        display: block;
        width: 100%;
    }
    .layer-tree-layer {
        font-size: 0.9rem;

    }
    .layer-selection{
        margin-left: 0.7rem;
    }
</style>
