<script>
import {mapGetters, mapMutations} from "vuex";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector";

import DrawEdit from "../../../shared/modules/draw/components/DrawEdit.vue";
import DrawLayout from "../../../shared/modules/draw/components/DrawLayout.vue";
import DrawSettingsCircle from "../../../shared/modules/draw/components/DrawSettingsCircle.vue";
import DrawTypes from "../../../shared/modules/draw/components/DrawTypes.vue";

/**
 * Modules to make drawings.
 * @module modules/draw/components/DrawModule
 * @vue-data {ol/layer/Vector} layer - The vector layer for drawings.
 * @vue-data {ol/source/Vector} source - The vector source for drawings.
 */
export default {
    name: "DrawModule",
    components: {
        DrawEdit,
        DrawLayout,
        DrawSettingsCircle,
        DrawTypes
    },
    data () {
        return {
            layer: null,
            source: new VectorSource()
        };
    },
    computed: {
        ...mapGetters("Modules/Draw", [
            "circleOptions",
            "currentLayout",
            "currentLayoutOuterCircle",
            "drawEdits",
            "drawIcons",
            "drawTypesGeometrie",
            "drawTypesMain",
            "drawTypesSymbols",
            "name",
            "selectedDrawType",
            "selectedDrawTypeMain",
            "selectedInteraction",
            "strokeRange",
            "units"
        ]),
        ...mapGetters("Menu", [
            "currentComponentName",
            "mainExpanded",
            "secondaryExpanded"
        ])
    },
    mounted () {
        // Note: the layer handling still needs to be revised!
        const drawLayer = mapCollection.getMap("2D").getLayers().getArray().find(layer => layer.get("id") === "importDrawLayer");

        if (typeof drawLayer === "undefined") {
            this.layer = new VectorLayer({
                id: "importDrawLayer",
                name: "importDrawLayer",
                source: this.source,
                zIndex: 99999999999
            });

            mapCollection.getMap("2D").addLayer(this.layer);
        }
        else {
            this.layer = drawLayer;
            this.source = drawLayer.getSource();
        }
    },
    methods: {
        ...mapMutations("Modules/Draw", [
            "setCircleOptions",
            "setCurrentLayout",
            "setCurrentLayoutOuterCircle",
            "setSelectedDrawType",
            "setSelectedDrawTypeMain",
            "setSelectedInteraction"
        ])
    }
};
</script>

<template lang="html">
    <div
        id="modules-draw-module"
        class="d-flex flex-column"
    >
        <div
            id="draw-edit"
        >
            <DrawEdit
                v-if="layer !== null"
                :draw-edits="drawEdits"
                :draw-icons="drawIcons"
                :layer="layer"
                :selected-interaction="selectedInteraction"
                :set-selected-interaction="setSelectedInteraction"
            />
        </div>
        <div
            id="draw-types"
            class="mb-5"
        >
            <DrawTypes
                :circle-options="circleOptions"
                :current-layout="currentLayout"
                :current-layout-outer-circle="currentLayoutOuterCircle"
                :draw-icons="drawIcons"
                :draw-types="drawTypesMain"
                :selected-draw-type="selectedDrawType"
                :selected-draw-type-main="selectedDrawTypeMain"
                :selected-interaction="selectedInteraction"
                :set-selected-draw-type="setSelectedDrawType"
                :set-selected-draw-type-main="setSelectedDrawTypeMain"
                :set-selected-interaction="setSelectedInteraction"
                :source="source"
                :should-emit-events="false"
            />
            <DrawTypes
                v-if="selectedDrawTypeMain === 'geometries'"
                class="mt-4"
                :circle-options="circleOptions"
                :current-layout="currentLayout"
                :current-layout-outer-circle="currentLayoutOuterCircle"
                :draw-icons="drawIcons"
                :draw-types="drawTypesGeometrie"
                :selected-draw-type="selectedDrawType"
                :set-selected-draw-type="setSelectedDrawType"
                :source="source"
                :should-emit-events="false"
            />
            <DrawTypes
                v-else-if="selectedDrawTypeMain === 'symbols'"
                class="mt-4"
                :current-layout="currentLayout"
                :draw-icons="drawIcons"
                :draw-types="drawTypesSymbols"
                :selected-draw-type="selectedDrawType"
                :set-selected-draw-type="setSelectedDrawType"
                :source="source"
                :should-emit-events="false"
            />
        </div>
        <div
            id="draw-layouts"
            class="mb-5"
        >
            <DrawLayout
                v-if="selectedDrawType !== '' && selectedDrawTypeMain !== ''"
                :current-layout="currentLayout"
                :selected-draw-type="selectedDrawType"
                :set-current-layout="setCurrentLayout"
                :stroke-range="strokeRange"
            />
            <DrawLayout
                v-if="selectedDrawType === 'doubleCircle' && selectedDrawTypeMain !== ''"
                class="mt-4"
                :circle-type="'outerCircle'"
                :current-layout="currentLayoutOuterCircle"
                :selected-draw-type="selectedDrawType"
                :set-current-layout="setCurrentLayoutOuterCircle"
                :stroke-range="strokeRange"
            />
        </div>
        <div
            id="draw-settings"
        >
            <DrawSettingsCircle
                v-if="(selectedDrawType === 'circle' || selectedDrawType === 'doubleCircle') && selectedDrawTypeMain !== ''"
                :circle-options="circleOptions"
                :selected-draw-type="selectedDrawType"
                :set-circle-options="setCircleOptions"
                :units="units"
            />
        </div>
    </div>
</template>
