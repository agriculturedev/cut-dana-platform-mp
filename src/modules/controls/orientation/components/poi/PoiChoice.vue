<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/mutationsOrientation";

/**
 * Orientation control that allows the user to locate themselves on the map.
 * @module modules/controls/PoiChoice
 * @vue-computed {Object} choices - Object with two strings for position.
 * @vue-event {String} track - Triggers tracking.
 */
export default {
    name: "PoiChoice",
    emits: ["track"],
    computed: {
        ...mapGetters("Controls/Orientation", ["poiMode", "customPosition"]),
        choices () {
            return {
                "currentPosition": this.$t("common:modules.controls.orientation.poiChoiceCurrentPostion"),
                "customPosition": this.$t(this.customPosition)
            };
        }
    },
    mounted () {
        this.show();
        this.$nextTick(() => {
            if (this.$refs["close-icon"]) {
                this.$refs["close-icon"].focus();
            }
        });
    },
    methods: {
        ...mapMutations("Controls/Orientation", Object.keys(mutations)),
        ...mapActions("Maps", ["registerListener", "unregisterListener"]),

        /**
         * Callback when close icon has been clicked.
         * @param {Event} event the dom event
         * @returns {void}
         */
        closeIconTriggered (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.hidePoiChoice();
            }
        },
        /**
         * Hides the modal.
         * @returns {void}
         */
        hidePoiChoice () {
            this.setShowPoiChoice(false);
        },

        /**
         * Show the modal.
         * @returns {void}
         */
        show () {
            const el = document.querySelector(".modal.poi-choice"),
                backdrop = document.querySelector(".modal-backdrop");

            if (el) {
                el.style.display = "block";
                el.classList.add("show");
                el.classList.remove("fade");
                backdrop.style.display = "block";
                backdrop.classList.add("show");
                backdrop.classList.remove("fade");
            }
        },

        /**
         * Getting the poi option
         * @param {Object} evt click radio button event
         * @returns {void}
         */
        setPoiOption (evt) {
            this.setPoiMode(evt?.target?.value);
            this.setCurrentPositionEnabled(this.poiMode === "currentPosition");
        },

        /**
         * Confirm to track the poi
         * @returns {void}
         */
        triggerTrack () {
            this.$emit("track");
            this.hidePoiChoice(false);

            this.registerListener({
                type: "click",
                listener: this.mapClicked
            });
        },

        /**
         * Reacts when the map is clicked
         * @param {Object} evt the click event.
         * @returns {void}
         */
        mapClicked (evt) {
            this.setPosition(evt.coordinate);
            this.setShowPoi(true);
            this.unregisterListener({
                type: "click",
                listener: this.mapClicked
            });
        },

        /**
         * Stopping the poi track
         * @returns {void}
         */
        stopPoi () {
            this.unregisterListener({
                type: "click",
                listener: this.mapClicked
            });
            this.setPoiMode("currentPosition");
            this.setCurrentPositionEnabled(true);
            this.$store.dispatch("Maps/removePointMarker");
            this.hidePoiChoice();
            document.querySelector("#geolocatePOI").classList.remove("toggleButtonPressed");
        }
    }
};
</script>

<template>
    <div
        class="modal fade in poi-choice"
    >
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">
                        <span class="control-icon bootstrap-icon standalone">
                            <i class="bi-record-circle" />
                        </span>
                        {{ $t("common:modules.controls.orientation.titleGeolocatePOI") }}
                    </h4>
                    <span
                        ref="close-icon"
                        class="bootstrap-icon"
                        tabindex="0"
                        aria-hidden="true"
                        data-bs-dismiss="modal"
                        :title="$t('button.close')"
                        @click="closeIconTriggered($event)"
                        @keydown="closeIconTriggered($event)"
                    >
                        <i class="bi-x-lg" />
                    </span>
                </div>
                <div class="choice-content">
                    <div class="choice-title">
                        {{ $t("common:modules.controls.orientation.poiChoiceTitle") }}
                    </div>
                    <label
                        v-for="(val, key) in choices"
                        :key="val"
                        :class="key"
                    >
                        <input
                            type="radio"
                            name="poiChoice"
                            :value="key"
                            :checked="key === poiMode"
                            @change="setPoiOption"
                        >
                        {{ val }}
                    </label>
                    <hr>
                    <button
                        class="confirm btn btn-primary"
                        tabindex="0"
                        @click="triggerTrack"
                    >
                        {{ $t("common:modules.controls.orientation.poiChoiceConfirmation") }}
                    </button>
                    <button
                        class="stop btn btn-outline-default"
                        @click="stopPoi"
                    >
                        {{ $t("common:modules.controls.orientation.poiChoiceStop") }}
                    </button>
                </div>
            </div>
        </div>
        <button
            class="modal-backdrop fade in"
            @click="hidePoiChoice"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    .modal-backdrop{
        pointer-events: all;
        cursor: default;
    }
    .modal-backdrop:focus {
       background-color: lighten($dark_grey, 5%);
    }
    .poi-choice {
        color: $dark_grey;
        font-size: $font_size_big;
        .modal-header {
            padding: 0;
            > .bootstrap-icon {
                font-size: $font_size_icon_lg;
                padding: 12px;
                cursor: pointer;
            }
        }
        .modal-title {
            padding: 8px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            .bootstrap-icon {
                margin-right: 5px;
            }
        }
        .modal-dialog {
            z-index: 1051;
        }
        .choice-content{
            display: inline-block;
            width: 100%;
            padding: 10px;
            .choice-title {
                margin-bottom: 10px;
            }
            label {
                cursor: pointer;
                margin-right: 20px;
            }
            button {
                margin-left: 15px;
                margin-bottom: 10px;
                min-width: 60px;
                @include media-breakpoint-up(sm) {
                    margin-left: 0;
                    margin-bottom: 0;
                    width: 100%;
                    margin-top: 10px;
                }
            }
        }
    }
</style>

