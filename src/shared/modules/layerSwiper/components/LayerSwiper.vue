<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersLayerSwiper";

export default {
    name: "LayerSwiper",
    props: {
    /**
     * The current time slider object.
     * @type {Object}
     * @default () => ({})
     */
        currentTimeSliderObject: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters("Modules/LayerSwiper", Object.keys(getters))
    },
    watch: {
        /**
         * Watcher for the split direction.
         * Calls the initializeSwiper method when the split direction changes.
         * @returns {void}
         */
        splitDirection () {
            this.initializeSwiper();
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.initializeSwiper();
        });
    },
    methods: {
        ...mapMutations("Modules/LayerSwiper", [
            "setLayerSwiperValueX",
            "setLayerSwiperValueY",
            "setLayerSwiperDomSwiper",
            "setCurrentTimeSliderObject",
            "setLayerSwiperStyleTop",
            "setLayerSwiperStyleLeft"
        ]),
        ...mapActions("Modules/LayerSwiper", ["moveSwiper", "updateMap"]),

        /**
         * Initializes the swiper by setting its position and style based on the split direction.
         * @returns {void}
         */
        initializeSwiper () {
            const mapSize = mapCollection.getMap(this.mode).getSize(),
                target = document.getElementById("layerSwiper-button");

            if (this.splitDirection === "vertical") {
                this.setLayerSwiperValueX(mapSize[0] / 2);
                target.style.left = `${mapSize[0] / 2}px`;
                target.style.top = "50%";
                target.style.removeProperty("height");
                target.style.width = "50px";
                target.style.cursor = "ew-resize";
            }
            else {
                this.setLayerSwiperValueY(mapSize[1] / 2);
                target.style.top = `${mapSize[1] / 2}px`;
                target.style.left = "50%";
                target.style.removeProperty("width");
                target.style.height = "50px";
                target.style.cursor = "ns-resize";
            }

            target.focus();
            this.setLayerSwiperDomSwiper(target);
            this.setCurrentTimeSliderObject(this.currentTimeSliderObject);
        },

        /**
         * Adds event listeners for mouse movement to move the swiper.
         * @returns {void}
         */
        mouseMovement () {
            window.addEventListener("mousemove", this.moveSwiper);
            window.addEventListener("mouseup", this.mouseMovementStopped);
        },

        /**
         * Removes event listeners for mouse movement.
         * @returns {void}
         */
        mouseMovementStopped () {
            window.removeEventListener("mousemove", this.moveSwiper);
            window.removeEventListener("mouseup", this.mouseMovementStopped);
        }
    }
};
</script>


<template>
    <button
        id="layerSwiper-button"
        class="btn"
        :class="splitDirection"
        :title="$t('common:modules.wmsTime.layerSwiper.title')"
        :aria-describedby="$t('common:modules.wmsTime.layerSwiper.description', { amount: currentTimeSliderObject.keyboardMovement })"
        :style="splitDirection === 'vertical' ? { cursor: 'ew-resize' } : { cursor: 'ns-resize' }"
        @keydown.left="moveSwiper"
        @keydown.right="moveSwiper"
        @keydown.up="moveSwiper"
        @keydown.down="moveSwiper"
        @mousedown="mouseMovement"
    />
</template>


<style lang="scss" scoped>
@import "~variables";

button {
    pointer-events: all;
    width: 50px;
    background-color: $light_grey;
    position: absolute;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);

    &.vertical {
        height: 30px;
        top: 50%;
        left: 50%;
        cursor: ew-resize;

        &:before {
            content: "";
            position: absolute;
            top: -5000px;
            bottom: -5000px;
            left: 50%;
            width: 4px;
            background: $light_grey_contrast;
            z-index: -1;
            transform: translate(-2px, 0);
            -webkit-transform: translate(-2px, 0);
        }
    }

    &.horizontal {
        height: 50px;
        width: 30px;
        left: 50%;
        top: 50%;
        cursor: ns-resize;

        &:before {
            content: "";
            position: absolute;
            left: -5000px;
            right: -5000px;
            top: 50%;
            height: 4px;
            background: $light_grey_contrast;
            z-index: -1;
            transform: translate(0, -2px);
            -webkit-transform: translate(0, -2px);
        }
    }
}
</style>

