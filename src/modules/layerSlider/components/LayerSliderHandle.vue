<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import SliderItem from "../../../shared/modules/slider/components/SliderItem.vue";

/**
 * Layer Slider Handle
 * @module modules/LayerSliderHandle
 */
export default {
    name: "LayerSliderHandle",
    components: {
        SliderItem
    },
    computed: {
        ...mapGetters("Modules/LayerSlider", [
            "sliderMax",
            "sliderMin",
            "sliderTicks",
            "layerIds"
        ])
    },
    created () {
        this.setActiveIndex(0);
    },
    mounted () {
        const sliderTicks = this.prepareSliderTicks(this.layerIds);

        this.setSliderMax(String((this.layerIds.length - 1) * 10));
        this.setSliderTicks(sliderTicks);
    },
    methods: {
        ...mapMutations("Modules/LayerSlider", [
            "setSliderMax",
            "setSliderTicks"
        ]),
        ...mapActions("Modules/LayerSlider", [
            "sendModification",
            "setActiveIndex"
        ]),

        /**
         * Prepares the slider ticks based on the layerIds array.
         * @param {Object[]} layerIds Layer ids.
         * @return {Number[]} Slider ticks configuration for the slider.
         */
        prepareSliderTicks: function (layerIds) {
            const sliderTicks = [];

            layerIds.forEach((layerId, index) => {
                sliderTicks.push(index * 10);
            });

            return sliderTicks;
        },

        /**
         * Drags the handle and shows the corresponding layer with its transparency.
         * @param {Event} event The event that contains the slider index.
         * @returns {void}
         */
        dragHandle: function (event) {
            const index = parseInt(event.target.value, 10),
                prevLayerId = this.getLayerIdFromIndex(index),
                nextLayerId = this.getLayerIdFromIndex(index, "next"),
                prevLayerTransparency = (index % 10) * 10,
                nextLayerTransparency = 100 - prevLayerTransparency;

            this.showLayer(prevLayerId, prevLayerTransparency, this.layerIds);
            this.showLayer(nextLayerId, nextLayerTransparency, this.layerIds);
        },

        /**
         * Gets the layerId from the given index.
         * @param {Number} index Index of handle position.
         * @param {String} mode The Mode. Indicates which layer should be taken.
         * @returns {String} The layerId.
         */
        getLayerIdFromIndex: function (index, mode) {
            const position = this.getPositionFromValue(index, mode),
                layerIds = this.layerIds[position],
                layerId = layerIds ? layerIds.layerId : {};

            return layerId;
        },

        /**
         * Calculates the position of the layer, based on the handle position.
         * @param {Number} index Index of handle position.
         * @param {String} mode The Mode. Indicates which layer should be taken.
         * @returns {Number} Position of layer in "layerIds"
         */
        getPositionFromValue: function (index, mode) {
            let position = Math.floor(Math.round(index) / 10);

            if (mode === "next") {
                ++position;
            }

            return position;
        },

        /**
         * Modificates the layers visibility and transparency based on the handle position.
         * @param {String} layerId The Layer id.
         * @param {Number} transparency transparency based on the handle position.
         * @param {Object[]} layerIds The configuration of the layers from config.json.
         * @returns {void}
         */
        showLayer: function (layerId, transparency, layerIds) {
            if (layerIds.filter(layer => layer.layerId === layerId).length > 0) {
                this.sendModification({
                    layerId: layerId,
                    visibility: transparency >= 0 && transparency <= 100,
                    transparency: transparency
                });
            }

            if (transparency === 0) {
                const filteredObj = layerIds.filter(obj => obj.layerId === layerId),
                    index = layerIds.indexOf(filteredObj[0]);

                this.setActiveIndex(index);
            }
        }
    }
};
</script>

<template lang="html">
    <div
        id="module-layer-slider-handle"
        class="d-flex flex-column px-3"
    >
        <SliderItem
            :aria="$t('common:modules.aria.sliderAria') + $t('common:modules.layerSlider.name')"
            :list="'ticks'"
            :min="sliderMin"
            :max="sliderMax"
            :interaction="dragHandle"
        />
        <datalist
            id="ticks"
            class="d-flex flex-column justify-content-between"
        >
            <option
                v-for="(tick, index) in sliderTicks"
                :key="index"
                :value="tick"
                class="p-0"
                :label="$t(layerIds[index]?.title)"
            />
        </datalist>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    #module-layer-slider-handle {
        accent-color: $secondary;

        datalist {
            writing-mode: vertical-lr;
        }
    }
</style>
