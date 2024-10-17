<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";
import FreezeScreenUnfreeze from "./FreezeScreenUnfreeze.vue";

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 * @module modules/controls/FreezeScreen
 */
export default {
    name: "FreezeScreen",
    components: {
        FreezeScreenUnfreeze,
        ControlIcon
    },
    data: () => {
        return {
            isFreezed: false
        };
    },
    computed: {
        ...mapGetters("Controls/Freeze", ["icon"])
    },
    methods: {
        /**
         * Showing the freezed window.
         * @returns {void}
         */
        showFreezeWin () {
            this.isFreezed = true;
        },

        /**
         * Hiding the freezed window.
         * @returns {void}
         */
        hideFreezeWin () {
            this.isFreezed = false;
        }
    }
};
</script>

<template>
    <div id="freeze-screen-button">
        <ControlIcon
            :title="$t(`common:modules.controls.freeze.freeze`)"
            class="control"
            :icon-name="icon"
            :on-click="showFreezeWin"
        />
        <FreezeScreenUnfreeze
            v-if="isFreezed"
            @hide-freeze-win="hideFreezeWin"
        />
    </div>
</template>
