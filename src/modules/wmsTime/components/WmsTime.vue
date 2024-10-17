<script>
import {mapActions, mapGetters} from "vuex";
import LayerSwiper from "../../../shared/modules/layerSwiper/components/LayerSwiper.vue";
import TimeSlider from "./TimeSlider.vue";

export default {
    name: "WmsTime",
    components: {
        LayerSwiper,
        TimeSlider
    },
    computed: {
        ...mapGetters("Modules/WmsTime", ["currentTimeSliderObject", "layerAppendix", "minWidth", "timeSlider"]),
        ...mapGetters("Modules/LayerSwiper", {
            layerSwiperActive: "active"
        })
    },
    created () {
        window.addEventListener("resize", this.windowWidthChanged);
    },
    beforeUnmount () {
        window.removeEventListener("resize", this.windowWidthChanged);
    },
    methods: {
        ...mapActions("Modules/WmsTime", ["windowWidthChanged"])
    }
};
</script>

<template>
    <div
        id="wmsTime"
    >
        <TimeSlider
            v-if="timeSlider.active"
            :class="{'moveLeft': layerSwiperActive && minWidth}"
            :layer-id="currentTimeSliderObject.layerId"
        />
        <TimeSlider
            v-if="timeSlider.active && layerSwiperActive && minWidth"
            :class="{'moveRight': layerSwiperActive}"
            :layer-id="currentTimeSliderObject.layerId + layerAppendix"
        />
        <LayerSwiper
            v-if="layerSwiperActive && minWidth"
            :current-time-slider-object="currentTimeSliderObject"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    @mixin transform($value) {
        transform: translateX($value);
        transition: ease transform 250ms;
    }
    .timeSlider-wrapper {
        @include transform(-50%);
    }
    .moveLeft {
        @include transform(-110%);
    }
    .moveRight {
        @include transform(10%);
    }

    @include media-breakpoint-up(lg) {
        .moveLeft {
            @include transform(-150%);
        }
        .moveRight {
            @include transform(50%);
        }
    }
</style>
