<script>

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 * @module modules/controls/FreezeScreenUnfreeze
 * @vue-event {String} hideFreezeWin - Emit hiding the freeze window.
 */
export default {
    name: "FreezeScreenUnfreeze",
    emits: ["hideFreezeWin"],
    mounted () {
        this.$nextTick(() => {
            document.getElementById("masterportal-container").appendChild(this.$el);
            if (this.$refs.unfreeze) {
                this.$refs.unfreeze.focus();
            }
        });
    },
    methods: {
        /**
         * Emitting the function in parent Freeze Component to hide the freezed window.
         * @param {Event} event The dom event.
         * @returns {void}
         */
        hideFreezeWin (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.$emit("hideFreezeWin");
            }
        }
    }
};
</script>

<template>
    <div
        id="freeze-screen-unfreeze"
        @keydown.prevent.stop=""
    >
        <p
            ref="unfreeze"
            class="freeze-screen-unfreeze-button"
            :title="$t(`common:modules.controls.freeze.unfreeze`)"
            tabindex="0"
            role="button"
            @click="hideFreezeWin($event)"
            @keydown="hideFreezeWin($event)"
        >
            {{ $t(`common:modules.controls.freeze.unfreeze`) }}
        </p>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";

    #freeze-screen-unfreeze {
        z-index: 10000;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        .freeze-screen-unfreeze-button {
            z-index: 10001;
            cursor: pointer;
            position: absolute;
            border-radius: 12px;
            font-size: $font_size_huge;
            left: 30px;
            top: 30px;
            width: 600px;
            height: 60px;
            line-height: 60px;
            text-align: center;
            background-color: $dark_grey;
            color: $white;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.5);

            &:hover {
                background-color: lighten($dark_blue, 10%);
            }
        }
    }

</style>
