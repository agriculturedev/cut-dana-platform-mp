<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";

/**
 * TiltView adds two controls that allow you to tilt the 3d map up or down.
 * @module modules/controls/TiltView
 */
export default {
    name: "TiltView",
    components: {
        ControlIcon
    },
    computed: {
        ...mapGetters("Controls/TiltView", ["tiltDownIcon", "tiltUpIcon"])
    },
    methods: {
        /**
         * Tilts the camera down.
         * @returns {void}
         */
        tiltDown () {
            this.getCamera()?.lookDown();
        },

        /**
         * Tilts the camera up.
         * @returns {void}
         */
        tiltUp () {
            this.getCamera()?.lookUp();
        },

        /**
         * Returns the camera from Cesium Scene
         * @returns {Object} The camera.
         */
        getCamera () {
            return mapCollection.getMap("3D")?.getCesiumScene()?.camera;
        }
    }
};
</script>

<template>
    <div id="tilt-view-button">
        <ControlIcon
            id="tilt-view-up"
            class="tilt-view-up-button"
            :title="$t('common:modules.controls.tiltView.upButton')"
            :icon-name="tiltUpIcon"
            :on-click="tiltUp"
        />
        <ControlIcon
            id="tilt-view-down"
            class="tilt-view-down-button"
            :title="$t('common:modules.controls.tiltView.downButton')"
            :icon-name="tiltDownIcon"
            :on-click="tiltDown"
        />
    </div>
</template>
