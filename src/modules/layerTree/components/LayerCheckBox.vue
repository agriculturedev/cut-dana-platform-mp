<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import LayerPreview from "../../../shared/modules/layerPreview/components/LayerPreview.vue";
import baselayerHandler from "../../layerSelection/js/handleSingleBaselayer";
import escapeId from "../../../shared/js/utils/escapeId";

/**
 * Displays a checkbox to select a layer in layertree.
 * @module modules/layerTree/components/LayerCheckBox
 * @vue-prop {Object} conf - The current layer configuration.
 * @vue-prop {Boolean} isLayerTree - Shows if parent is layer tree (true) or layer selection (false).
 * @vue-prop {Boolean} [disabled=false] - Set to true, layer shall be disabled.
 * @vue-computed {Boolean} isLayerVisible - Returns the value of layerConf's attribute visibility.
 */
export default {
    name: "LayerCheckBox",
    components: {
        LayerPreview
    },
    props: {
        /** current layer configuration */
        conf: {
            type: Object,
            required: true
        },
        /** true, if parent is layer tree and false if parent is layer selection */
        isLayerTree: {
            type: Boolean,
            required: true
        },
        /** true, if layer shall be disabled. Default is false. */
        disabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ...mapGetters(["singleBaselayer", "visibleBaselayerConfigs"]),
        ...mapGetters("Modules/LayerSelection", ["layersToAdd", "highlightLayerId"]),

        /**
         * Returns the value of layerConf's attribute visibility
         * @returns {Boolean} the value of layerConf's attribute visibility
         */
        isLayerVisible () {
            return typeof this.conf.visibility === "boolean" ? this.conf.visibility : false;
        },
        /**
         * Returns true, if layer is visible or state property 'boldLayerId' contains this confs id.
         * @returns {Boolean} true, if layers name shall be displayed bold
         */
        isBold () {
            return this.isLayerVisible || this.highlightLayerId === this.conf.id;
        }
    },
    mounted () {
        if (this.highlightLayerId === this.conf.id) {
            const el = document.querySelector("#layer-selection-treenode-" + escapeId(this.highlightLayerId));

            if (el) {
                this.$nextTick(() => {
                    el.scrollIntoView({block: "nearest", behavior: "smooth"});
                });
            }
        }
    },
    methods: {
        ...mapActions(["replaceByIdInLayerConfig"]),
        ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
        ...mapMutations("Modules/LayerSelection", ["addSelectedLayer", "removeSelectedLayer"]),
        escapeId,

        /**
         * Replaces the value of current conf's visibility in state's layerConfig
         * @param {Boolean} value visible or not
         * @returns {void}
         */
        visibilityInLayerTreeChanged (value) {
            const layerConfigs = [];

            layerConfigs.push({
                id: this.conf.id,
                layer: {
                    id: this.conf.id,
                    visibility: value
                }
            });
            if (this.conf.baselayer) {
                baselayerHandler.checkAndAdd(this.singleBaselayer, this.visibleBaselayerConfigs, layerConfigs);
            }
            this.replaceByIdInLayerConfig({layerConfigs});
        },
        /**
         * Listener for click on layer checkbox.
         * @returns {void}
         */
        clicked () {
            const value = !this.isLayerVisible;

            if (this.isLayerTree) {
                this.visibilityInLayerTreeChanged(value);
            }
            else {
                this.changeVisibility({layerId: this.conf.id, value: value});
            }

        }
    }
};
</script>

<template lang="html">
    <div
        v-if="conf.baselayer && !isLayerTree"
        class="w-100 p-1"
    >
        <LayerPreview
            :id="'layer-tree-layer-preview-' + conf.id"
            :layer-id="conf.id"
            :checkable="true"
            :checked="isLayerVisible"
            :zoom-level="typeof conf.preview?.zoomLevel === 'number'? conf.preview?.zoomLevel : null"
            :radius="conf.preview?.radius ? conf.preview?.radius : null"
            :center="conf.preview?.center ? conf.preview?.center : null"
            :custom-class="conf.preview?.customClass ? conf.preview?.customClass : null"
            @preview-clicked="clicked()"
        />
        <label
            :class="['pt-4']"
            :for="'layer-tree-layer-preview-' + conf.id"
            tabindex="0"
            :aria-label="$t(conf.name)"
        >
            <span
                v-if="conf.shortname"
            >
                {{ $t(conf.shortname) }}
            </span>
            <span
                v-else
            >
                {{ $t(conf.name) }}
            </span>
        </label>
    </div>
    <button
        v-else
        :id="'layer-checkbox-' + escapeId(conf.id)"
        :disabled="disabled"
        class="btn d-flex w-100 layer-tree-layer-title pe-2 p-1 btn-light"
        :title="conf.shortname ? conf.shortname : conf.name"
        @click="clicked()"
        @keydown.enter="clicked()"
    >
        <span
            :id="'layer-tree-layer-checkbox-' + conf.id"
            :class="[
                'layer-tree-layer-checkbox ps-1 pe-3',
                {
                    'bi-check-square': !(conf.baselayer && singleBaselayer) && isLayerVisible,
                    'bi-square': !(conf.baselayer && singleBaselayer) && !isLayerVisible,
                    'bi-check-circle': conf.baselayer && singleBaselayer && isLayerVisible,
                    'bi-circle': conf.baselayer && singleBaselayer && !isLayerVisible
                }
            ]"
        />
        <i
            v-if="conf.isSecured"
            class="bi-lock-fill pe-1"
        />
        <span
            :class="['layer-tree-layer-label', 'mt-0 d-flex flex-column align-self-start', isBold ? 'font-bold' : '']"
            :for="'layer-tree-layer-checkbox-' + conf.id"
            tabindex="0"
            :aria-label="$t(conf.name)"
        >
            <span
                v-if="conf.shortname"
            >
                {{ $t(conf.shortname) }}
            </span>
            <span
                v-else
            >
                {{ $t(conf.name) }}
            </span>
        </span>
    </button>
</template>

<style lang="scss" scoped>
    @import "~variables";
    @import "~mixins";
    .layer-tree-layer-title {
        overflow: hidden;
    }
    .layer-tree-layer-label {
        overflow: hidden;
        span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

</style>
