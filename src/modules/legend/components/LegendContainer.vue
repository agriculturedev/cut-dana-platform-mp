<script>
import {mapActions, mapGetters} from "vuex";
import LegendSingleLayer from "./LegendSingleLayer.vue";
import layerCollection from "../../../core/layers/js/layerCollection";

/**
 * Legend Container
 * @module modules/LegendContainer
 */
export default {
    name: "LegendContainer",
    components: {
        LegendSingleLayer
    },
    computed: {
        ...mapGetters("Modules/Legend", [
            "legends"
        ]),
        ...mapGetters(["uiStyle", "visibleLayerConfigs"])
    },
    watch: {
        visibleLayerConfigs: {
            handler (newLayerConfigs, oldLayerConfigs) {
                this.$nextTick(() => {
                    newLayerConfigs.forEach(newConfig => {
                        const oldConfig = oldLayerConfigs.find(config => config.id === newConfig.id),
                            existingLegend = this.legends.find(legendConf => legendConf.id === newConfig.id);

                        if (!oldConfig || existingLegend && existingLegend.position !== newConfig.zIndex) {
                            const layer = layerCollection.getLayerById(newConfig.id);

                            this.toggleLayerInLegend({layer: layer, visibility: newConfig.visibility});
                        }
                    });
                    oldLayerConfigs.forEach(oldConfig => {
                        const newConfig = newLayerConfigs.find(config => config.id === oldConfig.id);

                        if (!newConfig) {
                            const layer = layerCollection.getLayerById(oldConfig.id);

                            this.toggleLayerInLegend({layer: layer, visibility: false});
                        }
                    });
                });
            },
            deep: true
        }
    },
    methods: {
        ...mapActions("Modules/Legend", ["toggleLayerInLegend"]),

        /**
         * Generates an id using the layername and replacing all non alphanumerics with an underscore.
         * @param {String} layerName The name of the layer.
         * @returns {String} - An id consisting of the alphanumeric layername.
         */
        generateId (layerName) {
            let name = layerName;

            if (Array.isArray(layerName)) {
                name = layerName[0];
            }
            return name ? "legend_" + name.replace(/[\W_]+/g, "_") : undefined;
        }
    }
};
</script>

<template>
    <div id="legend">
        <div
            v-for="(legendObj, index) in legends"
            :key="index"
        >
            <div class="font-bold mt-3">
                <span>{{ legendObj.name }}</span>
            </div>
            <LegendSingleLayer
                :id="generateId(legendObj.name)"
                :legend-obj="legendObj"
            />
            <hr
                v-if="index < legends.length - 1"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
</style>
