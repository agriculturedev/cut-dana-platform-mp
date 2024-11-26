<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../store/mutationsCompareMaps";
import SpinnerItem from "../../../shared/modules/spinner/components/SpinnerItem.vue";

export default {
    name: "CompareMaps",
    components: SpinnerItem,
    data () {
        return {
            splitDirection: "vertical",
            selectedLayer1: null,
            selectedLayer2: null,
            spinnerActive: false,
            visibleLayers: []
        };
    },
    computed: {
        ...mapGetters(["visibleLayerConfigs"]),
        ...mapGetters("Modules/CompareMaps", [
            "layerNames",
            "initialBaseLayer",
            "selectedLayer1Id",
            "selectedLayer2Id"
        ])
    },
    watch: {
        /**
        /**
         * Watcher for the visible layers.
         * @param {Object} newValue - The new value of the visible layers.
         * @returns {void}
         */
        visibleLayerConfigs: {
            handler (newValue) {
                if (newValue) {
                    this.updateVisibleLayers(newValue);

                    const comparisonLayer = newValue.filter(
                        layerConfig => layerConfig.id === this.selectedLayer1Id || layerConfig.id === this.selectedLayer2Id
                    );

                    if (this.selectedLayer1Id && !comparisonLayer.some(layer => layer.id === this.selectedLayer1Id)) {
                        this.resetSelection();
                    }

                    if (this.selectedLayer2Id && !comparisonLayer.some(layer => layer.id === this.selectedLayer2Id)) {
                        this.resetSelection();
                    }
                }
            },
            deep: true
        },
        /**
         * Watcher for the first selected layer.
         * @param {Object} newValue - The new value of the selected layer.
         * @returns {void}
         */
        selectedLayer1 (newValue) {
            if (newValue) {
                this.setSelectedLayer1Id(newValue.id);
                if (this.selectedLayer2) {
                    this.handleLoadend();
                }
            }
        },
        /**
         * Watcher for the second selected layer.
         * @param {Object} newValue - The new value of the selected layer.
         * @returns {void}
         */
        selectedLayer2 (newValue) {
            if (newValue) {
                this.setSelectedLayer2Id(newValue.id);

                this.handleLoadend();
            }
        },
        /**
         * Watcher for the split direction.
         * @param {String} newValue - The new value of the split direction.
         * @returns {void}
         */
        splitDirection (newValue) {
            if (newValue) {
                this.setLayerSwiperSplitDirection(newValue);
                this.updateMap();
            }
        }
    },
    mounted () {
        this.initialize();
        this.setActive(true);
        this.updateVisibleLayers(this.visibleLayerConfigs);

        mapCollection.getMap("2D").on("moveend", this.handleMapMove);
    },
    unmounted () {
        mapCollection.getMap("2D").un("moveend", this.handleMapMove);
        this.resetSelection();
        this.setActive(false);
    },
    methods: {
        ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
        ...mapMutations("Modules/LayerSwiper", {
            setLayerSwiperActive: "setActive",
            setLayerSwiperSourceLayer: "setLayerSwiperSourceLayer",
            setLayerSwiperTargetLayer: "setLayerSwiperTargetLayer",
            setLayerSwiperSplitDirection: "setSplitDirection"
        }),
        ...mapActions("Modules/LayerSwiper", ["updateMap"]),
        ...mapMutations("Modules/CompareMaps", Object.keys(mutations)),
        ...mapActions("Modules/CompareMaps", ["initialize", "activateSwiper"]),

        /**
         * Updates the visible layers based on the provided configurations.
         * @param {Array} layerConfigs - The layer configurations to filter and map.
         * @returns {void}
         */
        updateVisibleLayers (layerConfigs) {
            const visibleLayers = layerConfigs.filter(layerConfig => layerConfig.typ === "WMS" || layerConfig.typ === "WFS");

            this.visibleLayers = visibleLayers.map(layerConfig => ({name: layerConfig.name, id: layerConfig.id}));

            this.selectedLayer1 = this.visibleLayers.find(layer => layer.id === this.selectedLayer1Id) || null;
            this.selectedLayer2 = this.visibleLayers.find(layer => layer.id === this.selectedLayer2Id) || null;
        },

        /**
         * Resets the layer selection and deactivates the swiper.
         * @returns {void}
         */
        resetSelection () {
            this.changeVisibility({layerId: this.initialBaseLayer.id, value: true});

            this.selectedLayer1 = null;
            this.selectedLayer2 = null;
            this.setSelectedLayer1Id("");
            this.setSelectedLayer2Id("");
            this.setLayerSwiperActive(false);
            this.setLayerSwiperSourceLayer(null);
            this.setLayerSwiperTargetLayer(null);
        },
        /**
         * Handle map move event to trigger spinner and layer updates
         * @returns {void}
         */
        handleMapMove () {
            if (this.selectedLayer2) {
                this.setLayerSwiperActive(false);
                this.spinnerActive = true;
                this.handleLoadend();
            }
        },
        /**
         * Handle the loadend event of the map to deactivate the spinner, activate the swiper and update the map.
         * @returns {void}
         */
        handleLoadend () {
            this.updateMap();
            mapCollection.getMap("2D").once("loadend", () => {
                this.spinnerActive = false;
                this.activateSwiper();
                this.updateMap();
            });
        }
    }
};
</script>

<template>
    <div
        id="compare-maps"
        class="p-3"
    >
        <div
            v-if="spinnerActive"
            class="overlay"
        >
            <div class="d-flex justify-content-center align-items-center h-100">
                <span class="loading-text">{{ $t("common:modules.compareMaps.loadingWait") }}</span>
                <div class="spinner-border ms-2" />
            </div>
        </div>

        <div :class="{ 'blurred': spinnerActive }">
            <div class="toggle-buttons mb-4">
                <span class="me-2">{{ $t("common:modules.compareMaps.splitDirection") }}</span>
                <div class="form-check form-check-inline">
                    <input
                        id="module-compareMaps-vertical"
                        v-model="splitDirection"
                        type="radio"
                        value="vertical"
                        class="form-check-input"
                    >
                    <label
                        class="form-check-label"
                        for="vertical"
                    >{{ $t("common:modules.compareMaps.vertical") }}</label>
                </div>
                <div class="form-check form-check-inline">
                    <input
                        id="module-compareMaps-horizontal"
                        v-model="splitDirection"
                        type="radio"
                        value="horizontal"
                        class="form-check-input"
                    >
                    <label
                        class="form-check-label"
                        for="horizontal"
                    >{{ $t("common:modules.compareMaps.horizontal") }}</label>
                </div>
            </div>

            <hr>

            <div class="layer-selectors mb-4">
                <div class="form-floating mb-3">
                    <select
                        id="module-compareMaps-select-layer1"
                        v-model="selectedLayer1"
                        class="form-select"
                    >
                        <option
                            v-for="layer in visibleLayers"
                            :key="layer.name"
                            :value="layer"
                        >
                            {{ layer.name }}
                        </option>
                    </select>
                    <label
                        id="module-compareMaps-select-label"
                        for="module-compareMaps-select-layer1"
                    >
                        {{ $t("common:modules.compareMaps.firstLayer") }}
                    </label>
                </div>
                <div class="form-floating mb-3">
                    <select
                        id="module-compareMaps-select-layer2"
                        v-model="selectedLayer2"
                        class="form-select"
                        :disabled="!selectedLayer1"
                    >
                        <option
                            v-for="layer in visibleLayers"
                            :key="layer.name"
                            :value="layer"
                        >
                            {{ layer.name }}
                        </option>
                    </select>
                    <label
                        id="module-compareMaps-select-label"
                        for="module-compareMaps-select-layer2"
                    >
                        {{ !selectedLayer1 ? $t("common:modules.compareMaps.selectLayerOneFirst") : $t("common:modules.compareMaps.secondLayer") }}
                    </label>
                </div>
            </div>

            <hr>

            <button
                type="button"
                class="btn btn-primary w-100"
                @click="resetSelection"
            >
                {{ $t("common:modules.compareMaps.reset") }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#compare-maps {
    position: relative;
    padding: 1rem;

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(0.5px);
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .blurred {
        filter: blur(0.5px);
    }

    .toggle-buttons {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;

        .form-check {
            margin-right: 1rem;
        }
    }

    .layer-selectors {
        .form-floating {
            margin-bottom: 1.5rem;
        }
    }

    .spinner-border {
        width: 25px;
        height: 25px;
        border: 4px solid #D6E3FF;
        border-top: 4px solid #151C27;
        border-radius: 50%;
        aspect-ratio: 1 / 1;
    }

    .loading-text {
        font-size: 1.2rem;
        margin-right: 0.5rem;
    }
}
</style>
