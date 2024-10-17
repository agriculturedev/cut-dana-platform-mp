
<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";

/**
 * ZoomInAndOut adds a control that lets the user zoom in and out of the map.
 * @module modules/controls/ZoomInAndOut
 */
export default {
    name: "ZoomInAndOut",
    components: {
        ControlIcon
    },
    computed: {
        ...mapGetters("Controls/Zoom", ["iconIn", "iconOut"]),
        ...mapGetters("Maps", ["isMaxZoomDisplayed", "isMinZoomDisplayed"])
    },
    methods: {
        ...mapActions("Maps", ["decreaseZoom", "increaseZoom"])
    }
};
</script>

<template>
    <div id="zoom-in-and-out-buttons">
        <ControlIcon
            :title="$t(`common:modules.controls.zoom.zoomIn`)"
            :icon-name="iconIn"
            :disabled="isMaxZoomDisplayed"
            :on-click="increaseZoom"
        />
        <ControlIcon
            :title="$t(`common:modules.controls.zoom.zoomOut`)"
            :icon-name="iconOut"
            :disabled="isMinZoomDisplayed"
            :on-click="decreaseZoom"
        />
    </div>
</template>
