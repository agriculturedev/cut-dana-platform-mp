<script>
import {mapActions, mapGetters} from "vuex";

/**
 * Module to load a config.json to runtime.
 * @module modules/OpenConfig
 */
export default {
    name: "OpenConfig",
    computed: {
        ...mapGetters("Modules/OpenConfig", ["icon"])
    },
    mounted () {
        this.$nextTick(() => {
            this.setFocusToFirstControl();
        });
    },
    methods: {
        ...mapActions("Modules/OpenConfig", ["processConfigJsonOnload"]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["file-upload-label"]) {
                    this.$refs["file-upload-label"].focus();
                }
            });
        },

        /**
         * Triggers the file input.
         * @param {Event} event The keyboard event.
         * @returns {void}
         */
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["file-upload-input"].click();
            }
        },

        /**
         * Loads the config.json file
         * @param {Event} event The file input event.
         * @returns {void}
         */
        loadFile (event) {
            const targetFile = event.target.files[0];

            if (targetFile?.type === "application/json") {
                const reader = new FileReader();

                reader.onload = (evt) => {
                    this.processConfigJsonOnload(evt);
                    this.addSingleAlert({
                        category: "succes",
                        content: this.$t("common:modules.openConfig.loadFileSuccess", {targetFileName: targetFile?.name})
                    });
                };
                reader.readAsText(event.target.files[0]);
            }
            else {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.openConfig.loadFileFailed", {targetFileName: targetFile?.name, targetFileFormat: targetFile?.name.split(".")[1]})
                });
            }
        }
    }
};
</script>

<template lang="html">
    <div id="open-config">
        <p class="mb-4">
            {{ $t("common:modules.openConfig.explanation") }}
        </p>
        <div
            id="open-config-input-button"
            class="d-flex justify-content-center"
        >
            <button
                class="btn-transparent"
                @keydown="triggerClickOnFileInput"
            >
                <label
                    ref="file-upload-label"
                    class="btn btn-secondary btn-icon"
                >
                    <input
                        ref="file-upload-input"
                        type="file"
                        @change="loadFile"
                    >
                    <span
                        aria-hidden="true"
                    >
                        <i :class="icon" />
                    </span>
                    {{ $t("common:modules.openConfig.openFile") }}
                </label>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    p {
        color: $black;
        font-size: $font-size-base
    }

    input[type="file"] {
        display: none;
    }

    .btn-transparent{
        background-color: transparent;
        border: none;
    }

</style>
