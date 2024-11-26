<script>
import escapeId from "../../../shared/js/utils/escapeId";
import {mapActions, mapGetters, mapMutations} from "vuex";
import layerCollection from "../../../core/layers/js/layerCollection.js";

/**
 * A Checkbox to select all layers at one time.
 * @module modules/SelectAllCheckBox
 * @vue-prop {Array} confs - The current layer configurations controlled by this checkbox.
 * @vue-data {Boolean} checked - Shows if checkbox is checked.
 */
export default {
    name: "SelectAllCheckBox",
    /** current layer configurations controlled by this checkbox */
    props: {
        confs: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            checked: false
        };
    },
    computed: {
        ...mapGetters("Modules/LayerSelection", ["encompassingBoundingBox"])
    },
    methods: {
        ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
        ...mapActions("Maps", ["zoomToExtent"]),
        ...mapMutations("Modules/LayerSelection", ["setEncompassingBoundingBox"]),

        /**
         * Listener for click on select all checkbox.
         * @returns {void}
         */
        clicked () {
            this.checked = !this.checked;

            this.confs.slice().reverse().forEach(conf => {
                this.changeVisibility({layerId: conf.id, value: this.checked});
                if (conf.fitCapabilitiesExtent === true) {
                    this.zoomToCapabilitiesExtent(conf);
                }
            });
        },
        /**
         * Differentiation according to which case should be zoomed to the bounding box of the capabilites.
         * @param {Object} conf current layer configuration.
         * @returns {void}
         */
        zoomToCapabilitiesExtent (conf) {
            let layer = layerCollection.getLayerById(conf.id),
                layerSource = layer?.getLayerSource();

            if ((layerSource || layerSource?.getFeatures().length > 0) && this.checked) {
                conf.encompassingBoundingBox = true;
                this.calculateEncompassingBoundingBox(conf);
            }
            else if (!this.checked) {
                conf.encompassingBoundingBox = false;
            }
            else if (this.checked) {
                this.$nextTick(() => {
                    layer = layerCollection.getLayerById(conf.id);
                    layerSource = layer?.getLayerSource();

                    conf.encompassingBoundingBox = true;
                    if (conf.typ === "WMS") {
                        layerSource.once("tileloadend", function () {
                            this.$nextTick(() => {
                                this.calculateEncompassingBoundingBox(conf);
                            });
                        }.bind(this));
                    }
                    else if (conf.typ === "WFS") {
                        layerSource.once("featuresloadend", function () {
                            this.calculateEncompassingBoundingBox(conf);
                        }.bind(this));
                    }
                });
            }
        },

        /**
         * Calculates the encompassing bounding box for all child model bounding boxes.
         * @param {Object} conf current layer configuration.
         * @returns {void}
         */
        calculateEncompassingBoundingBox (conf) {
            const layer = layerCollection.getLayerById(conf.id);
            let minX,
                minY,
                maxX,
                maxY;

            if (layer?.attributes?.boundingBox) {
                const bbox = layer.attributes.boundingBox,
                    [bottomLeft, topRight] = bbox;

                minX = Math.min(this.encompassingBoundingBox[0], bottomLeft[0]);
                minY = Math.min(this.encompassingBoundingBox[1], bottomLeft[1]);
                maxX = Math.max(this.encompassingBoundingBox[2], topRight[0]);
                maxY = Math.max(this.encompassingBoundingBox[3], topRight[1]);

                this.setEncompassingBoundingBox([minX, minY, maxX, maxY]);
                this.zoomToExtent({extent: this.encompassingBoundingBox});
            }
        },
        /**
         * Returns true, if all layer configs are visible.
         * @returns {Boolean} true,  if all layer configs are visible
         */
        isChecked () {
            this.checked = this.confs.every((conf) => {
                conf.encompassingBoundingBox = false;
                return conf.visibility === true;
            });
            return this.checked;
        },
        /**
         * Returns the ids of the ids all layer configs as String.
         * @returns {String} of the ids all layer configs
         */
        ids () {
            return this.confs.map(conf => escapeId(conf.id)).join("-");
        },
        /**
         * Returns label text for add all layers or remove all layers.
         * @returns {String} the label text
         */
        getLabelText () {
            if (this.isChecked()) {
                return i18next.t("common:modules.layerSelection.deselectAll");
            }
            return i18next.t("common:modules.layerSelection.selectAll");
        }
    }
};
</script>

<template lang="html">
    <button
        :id="'select-all-layers-' + ids()"
        class="btn d-flex w-100 layer-tree-select-all mt-3 pe-2 p-1 btn-light"
        @click="clicked()"
        @keydown.enter="clicked()"
    >
        <span
            :id="'select-all-checkbox-' + ids()"
            :class="[
                'ps-1 pe-3',
                {
                    'bi-check-square': isChecked(),
                    'bi-square': !isChecked()
                }
            ]"
        />
        <span
            class="layer-tree-layer-label mt-0 d-flex flex-column align-self-start"
            :for="'select-all-checkbox-' + ids()"
            tabindex="0"
            :aria-label="getLabelText()"
        >
            {{ getLabelText() }}
        </span>
    </button>
</template>

<style lang="scss" scoped>
    @import "~variables";
    @import "~mixins";
    .layer-tree-select-all {
        border-radius: 15px;
        &:hover {
            @include primary_action_hover;
        }
        &:focus {
            @include primary_action_focus;
        }
        margin-left: 0.7rem;
    }
    .layer-tree-layer-label {
        cursor: pointer;
    }

</style>
