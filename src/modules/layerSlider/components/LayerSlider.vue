<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import LayerSliderHandle from "./LayerSliderHandle.vue";
import LayerSliderPlayer from "./LayerSliderPlayer.vue";
import NavTab from "../../../shared/modules/tabs/components/NavTab.vue";

/**
 * Layer Slider
 * @module modules/LayerSlider
 */
export default {
    name: "LayerSlider",
    components: {
        LayerSliderHandle,
        LayerSliderPlayer,
        NavTab
    },
    computed: {
        ...mapGetters("Modules/LayerSlider", [
            "activeLayer",
            "layerIds",
            "sliderType",
            "title"
        ])
    },
    mounted () {
        this.checkIfAllLayersAvailable(this.layerIds);
        this.addIndexToLayerIds(this.layerIds);
    },
    unmounted () {
        this.setWindowsInterval(null);
        this.sendModification({layerId: this.activeLayer.layerId, visibility: false});
        this.resetActiveLayer();
    },
    methods: {
        ...mapMutations("Modules/LayerSlider", [
            "resetActiveLayer",
            "setWindowsInterval"
        ]),
        ...mapActions("Modules/LayerSlider", [
            "addIndexToLayerIds",
            "checkIfAllLayersAvailable",
            "sendModification"
        ])
    }
};
</script>

<template lang="html">
    <div id="module-layer-slider">
        <h5 class="my-4">
            {{ $t(title) }}
        </h5>
        <ul
            id="layer-slider-tabs"
            class="nav nav-tabs nav-justified"
            role="tablist"
        >
            <NavTab
                :id="'handle-tab'"
                :active="true"
                :target="'#handle-tab-pane'"
                :label="'common:modules.layerSlider.sliderTypeHandle'"
            />
            <NavTab
                :id="'player-tab'"
                :active="false"
                :target="'#player-tab-pane'"
                :label="'common:modules.layerSlider.sliderTypePlayer'"
            />
        </ul>
        <div
            id="myTabContent"
            class="tab-content"
        >
            <div
                id="handle-tab-pane"
                class="tab-pane fade show active"
                role="tabpanel"
                aria-labelledby="handle-tab"
                tabindex="0"
            >
                <LayerSliderHandle />
            </div>
            <div
                id="player-tab-pane"
                class="tab-pane fade"
                role="tabpanel"
                aria-labelledby="player-tab"
                tabindex="0"
            >
                <LayerSliderPlayer />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

#module-layer-slider {
    .form-check-input {
        width: 2.5rem;
        height: 1.5rem;
    }
}


</style>
