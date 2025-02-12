<script>
import {mapActions, mapGetters} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";

/**
 * Button to activate 3D-mode.
 * @module modules/controls/Button3dItem
 */
export default {
    name: "Button3dItem",
    components: {
        ControlIcon
    },
    computed: {
        ...mapGetters("Controls/Button3d", ["icon2d", "icon3d"]),
        ...mapGetters("Maps", ["mode"]),

        /**
         * Returns the button title depending on the current map mode.
         * @returns {String} The current button title.
         */
        buttonTitle () {
            return this.$t(this.mode === "2D" ? "common:modules.controls.button3d.buttonTitle3d" : "common:modules.controls.button3d.buttonTitle2d");
        },

        /**
         * Returns the button title depending on the current map mode.
         * @returns {String} The current button title.
         */
        buttonIcon () {
            return this.mode === "2D" ? this.icon3d : this.icon2d;
        }
    },
    methods: {
        ...mapActions("Maps", ["changeMapMode"]),

        /**
         * Triggers the change of the map from 2D to 3D and vice versa.
         * @returns {void}
         */
        triggerChangeMapMode () {
            const targetMode = this.mode === "2D" ? "3D" : "2D";

            this.changeMapMode(targetMode);
        }
    }
};
</script>

<template>
    <div id="button-3d-button">
        <ControlIcon
            :title="buttonTitle"
            :on-click="triggerChangeMapMode"
            :button-title="buttonTitle"
            :icon-name="buttonIcon"
        />
    </div>
</template>
