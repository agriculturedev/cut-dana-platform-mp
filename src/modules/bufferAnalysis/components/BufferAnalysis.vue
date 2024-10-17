<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import {ResultType} from "../store/enums";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import SliderItem from "../../../shared/modules/slider/components/SliderItem.vue";

/**
 * Tool to check if a subset of features associated to a target layer are located within or outside an applied radius to all features of a source layer.
 * @module modules/BufferAnalysis
 * @vue-data {Object} resultTypeEnum - Enum of result Types.
 * @vue-computed {Object} selectedSourceLayer - Currently selected source layer.
 * @vue-computed {Object} selectedTargetLayer - Currently selected target layer.
 * @vue-computed {Object} resultType - Currently selected result type.
 * @vue-computed {Object} inputBufferRadius - Current radius.
 */
export default {
    name: "BufferAnalysis",
    components: {
        FlatButton,
        SliderItem
    },
    data: () => ({resultTypeEnum: ResultType}),
    computed: {
        ...mapGetters("Modules/BufferAnalysis", ["bufferRadius", "selectOptions", "savedUrl"]),
        selectedSourceLayer: {
            /**
             * getter for the computed property selectedSourceLayer
             * @returns {Object} the current selected source layer
             */
            get () {
                return this.$store.state.Modules.BufferAnalysis.selectedSourceLayer;
            },
            /**
             * setter for the computed property selectedSourceLayer
             * @param {Object} newLayerSelection the new selected source layer
             * @returns {void}
             */
            set (newLayerSelection) {
                this.applySelectedSourceLayer(newLayerSelection);
            }
        },
        selectedTargetLayer: {
            /**
             * getter for the computed property selectedTargetLayer
             * @returns {Object} the current selected target layer
             */
            get () {
                return this.$store.state.Modules.BufferAnalysis.selectedTargetLayer;
            },
            /**
             * setter for the computed property selectedTargetLayer
             * @param {Object} newLayerSelection the new selected target layer
             * @returns {void}
             */
            set (newLayerSelection) {
                this.applySelectedTargetLayer(newLayerSelection);
            }
        },
        resultType: {
            /**
             * getter for the computed property resultType
             * @returns {ResultType} the current selected result type
             */
            get () {
                return this.$store.state.Modules.BufferAnalysis.resultType;
            },
            /**
             * setter for the computed property resultType
             * @param {ResultType} newType the new selected result type
             * @returns {void}
             */
            set (newType) {
                this.setResultType(newType);
            }
        },
        inputBufferRadius: {
            get () {
                return this.$store.state.Modules.BufferAnalysis.inputBufferRadius;
            },
            set (newRadius) {
                this.setInputBufferRadius(newRadius);
            }
        }
    },
    watch: {
        /**
         * Watches the value of inputBufferRadius
         * debounces the input values to prevent unnecessary calculations
         * @param {Number} newBufferRadius the new selected buffer radius
         * @returns {void}
         */
        inputBufferRadius (newBufferRadius) {
            clearTimeout(this.timerId);
            this.setTimerId(setTimeout(() => {
                this.applyBufferRadius(newBufferRadius);
            }, 500));
        }
    },
    /**
     * Lifecycle hook:
     * - initializes the JSTS parser
     * - loads available options for selections
     * @returns {void}
     */
    created () {
        this.initJSTSParser();
        this.loadSelectOptions();
    },
    mounted () {
        this.setFocusToFirstControl();
        this.setSelectOptions([]);
        this.loadSelectOptions();
        this.$nextTick(() => {
            this.applyValuesFromSavedUrlBuffer();
        });
    },
    unmounted () {
        this.removeGeneratedLayers();
        this.resetModule();
    },
    methods: {
        ...mapMutations("Modules/BufferAnalysis", ["setSelectOptions", "setInputBufferRadius", "setTimerId", "setResultType", "setSelectedTargetLayer"]),
        ...mapActions("Modules/BufferAnalysis", ["applyValuesFromSavedUrlBuffer", "applySelectedSourceLayer", "applyBufferRadius", "applySelectedTargetLayer", "buildUrlFromToolState", "initJSTSParser", "loadSelectOptions", "resetModule", "removeGeneratedLayers"]),
        ...mapActions("Map", ["toggleLayerVisibility"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["tool-bufferAnalysis-selectSourceInput"]) {
                    this.$refs["tool-bufferAnalysis-selectSourceInput"].focus();
                }
            });
        },
        /**
         * Lets you build and then copy the url to the clipboard.
         * ToDo: add "link copied" Hinweis
         * @returns {void}
         */
        buildAndCopyUrl () {
            this.buildUrlFromToolState();
            navigator.clipboard.writeText(this.savedUrl);
        },
        /**
         * Sets the new selected buffer radius
         * @param {Number} value the new selected buffer radius
         * @returns {void}
         */
        setNewInputBufferRadius (value) {
            this.setInputBufferRadius(value);
        }
    }
};
</script>

<template lang="html">
    <div id="tool-bufferAnalysis">
        <div class="form-floating mb-3">
            <select
                id="tool-bufferAnalysis-selectSourceInput"
                ref="tool-bufferAnalysis-selectSourceInput"
                v-model="selectedSourceLayer"
                class="form-select"
                :aria-label="$t('common:modules.bufferAnalysis.sourceSelectLabel')"
            >
                <option
                    v-for="layer in selectOptions"
                    :key="layer.id"
                    :value="layer"
                    :selected="selectOptions[0].name"
                >
                    {{ layer.name }}
                </option>
            </select>
            <label for="tool-bufferAnalysis-selectSourceInput">
                {{ $t("common:modules.bufferAnalysis.sourceSelectLabel") }}
            </label>
        </div>

        <div class="form-floating ">
            <input
                id="tool-bufferAnalysis-radiusTextInput"
                v-model="inputBufferRadius"
                :disabled="!selectedSourceLayer || selectedTargetLayer"
                min="0"
                max="3000"
                step="10"
                class="form-control"
                type="number"
            >
            <label
                for="tool-bufferAnalysis-radiusTextInput"
            >{{ $t("common:modules.bufferAnalysis.rangeLabel") }}</label>
        </div>
        <SliderItem
            id="tool-bufferAnalysis-radiusRangeInput"
            :class-array="['mb-3']"
            :value="inputBufferRadius"
            :aria=" $t('common:modules.aria.sliderAria') + $t('common:modules.bufferAnalysis.rangeLabel')"
            :min="'0'"
            :max="'3000'"
            :step="10"
            :disabled="(selectedSourceLayer === null) || !(selectedTargetLayer === null)"
            :interaction="event => setNewInputBufferRadius(event.target.value)"
        />

        <div class="form-floating mb-3">
            <select
                id="tool-bufferAnalysis-resultTypeInput"
                v-model="resultType"
                class="form-select"
                :aria-label="$t('common:modules.bufferAnalysis.resultTypeLabel')"
                :disabled="!selectedSourceLayer || !bufferRadius || selectedTargetLayer"
            >
                <option
                    :value="resultTypeEnum.WITHIN"
                >
                    {{ $t("common:modules.bufferAnalysis.overlapping") }}
                </option>
                <option
                    :value="resultTypeEnum.OUTSIDE"
                >
                    {{ $t("common:modules.bufferAnalysis.notOverlapping") }}
                </option>
            </select>
            <label for="tool-bufferAnalysis-resultTypeInput">
                {{ $t("common:modules.bufferAnalysis.resultTypeLabel") }}
            </label>
        </div>

        <div class="form-floating mb-3">
            <select
                id="tool-bufferAnalysis-selectTargetInput"
                v-model="selectedTargetLayer"
                class="form-select"
                :aria-label="$t('common:modules.bufferAnalysis.targetSelectLabel')"
                :disabled="!selectedSourceLayer || !bufferRadius || selectedTargetLayer"
            >
                <option
                    v-for="layer in selectOptions"
                    :key="layer.id"
                    :value="layer"
                >
                    {{ layer.name }}
                </option>
            </select>
            <label for="tool-bufferAnalysis-selectTargetInput">
                {{ $t("common:modules.bufferAnalysis.targetSelectLabel") }}
            </label>
        </div>

        <div class="mb-3 d-flex justify-content-center">
            <FlatButton
                id="tool-bufferAnalysis-resetButton"
                :aria-label="$t('common:modules.bufferAnalysis.clearButton')"
                :interaction="resetModule"
                :text="$t('common:modules.bufferAnalysis.clearButton')"
                :icon="'bi-x-circle'"
            />
        </div>
        <div class="d-flex justify-content-center row form-floating">
            <FlatButton
                id="tool-bufferAnalysis-saveButton"
                :aria-label="$t('common:modules.bufferAnalysis.saveButton')"
                :interaction="buildAndCopyUrl"
                :disabled="!selectedSourceLayer || !selectedTargetLayer || !bufferRadius"
                :text="$t('common:modules.bufferAnalysis.saveButton')"
                :icon="'bi-clipboard'"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
</style>
