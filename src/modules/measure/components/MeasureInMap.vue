<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import VectorLayer from "ol/layer/Vector.js";
import MeasureInMapTooltip from "./MeasureInMapTooltip.vue";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import source from "../js/measureSource";
import getStyle from "../js/measureStyle";

/**
 * Measurement tool to measure lines and areas in the map.
 * @module modules/MeasureInMap
 * @vue-data {String} deleteIcon - The icon for the delete button.
 */
export default {
    name: "MeasureInMap",
    components: {
        MeasureInMapTooltip,
        FlatButton
    },
    data () {
        return {
            deleteIcon: "bi-trash"
        };
    },
    computed: {
        ...mapGetters("Modules/Measure", [
            "featureId",
            "tooltipCoord",
            "interaction",
            "color",
            "source",
            "layer",
            "lines",
            "polygons",
            "geometryValues",
            "lineStringUnits",
            "polygonUnits",
            "selectedGeometry",
            "selectedLineStringUnit",
            "selectedPolygonUnit",
            "currentUnits"
        ]),
        ...mapGetters(["uiStyle"]),
        ...mapGetters("Maps", ["mode"])
    },
    watch: {
        /**
         * Recreates draw interaction on geometry type update.
         * @returns {void}
         */
        selectedGeometry () {
            this.createDrawInteraction();
        }
    },
    created () {
        this.setLayer(new VectorLayer({
            source,
            id: "measureLayer",
            name: "measureLayer",
            style: getStyle(this.color),
            alwaysOnTop: true
        }));
        this.$store.dispatch("Maps/checkLayer", this.layer).then((layerExists) => {
            if (!layerExists) {
                this.$store.dispatch("Maps/addLayer", this.layer);
            }
        });

    },
    mounted () {
        this.createDrawInteraction();
        this.setFocusToFirstControl();
    },
    unmounted () {
        this.removeIncompleteDrawing();
        this.removeDrawInteraction();
    },
    methods: {
        ...mapMutations("Modules/Measure", ["setSelectedGeometry", "setSelectedLineStringUnit", "setSelectedPolygonUnit", "setLayer"]),
        ...mapActions("Modules/Measure", ["deleteFeatures", "createDrawInteraction", "removeIncompleteDrawing", "removeDrawInteraction"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["measure-tool-geometry-select"] && !this.$refs["measure-tool-geometry-select"].disabled) {
                    this.$refs["measure-tool-geometry-select"].focus();
                }
                else if (this.$refs["measure-tool-unit-select"]) {
                    this.$refs["measure-tool-unit-select"].focus();
                }
            });
        },
        /**
         * removes the last drawing if it has not been completed
         * @return {void}
         */
        removeIncompleteDrawing () {
            const feature = this.lines[this.featureId] || this.polygons[this.featureId];

            if (feature && feature.get("isBeingDrawn")) {
                const layerSource = this.layer.getSource();

                if (layerSource.getFeatures().length > 0) {
                    const actualFeature = layerSource.getFeatures().slice(-1)[0];

                    layerSource.removeFeature(actualFeature);
                }
            }
        },
        isDefaultStyle () {
            return this.uiStyle !== "SIMPLE" && this.uiStyle !== "TABLE";
        },
        is3DMode () {
            return this.mode === "3D";
        },
        setSelectedUnit (value) {
            if (this.selectedGeometry === "LineString") {
                this.setSelectedLineStringUnit(value);
            }
            else {
                this.setSelectedPolygonUnit(value);
            }
        }
    }
};
</script>

<template lang="html">
    <div id="measure">
        <MeasureInMapTooltip />
        <div class="form-floating mb-3">
            <select
                id="measure-tool-geometry-select"
                ref="measure-tool-geometry-select"
                class="form-select"
                aria-label="..."
                :disabled="is3DMode()"
                :value="selectedGeometry"
                @change="setSelectedGeometry($event.target.value)"
            >
                <option
                    v-for="geometryValue in geometryValues"
                    :key="'measure-tool-geometry-select-' + geometryValue"
                    :value="geometryValue"
                >
                    {{ is3DMode()
                        ? selectedGeometry
                        : $t("common:modules.measure." +
                            (geometryValue === "LineString" ? "stretch" : "area"))
                    }}
                </option>
            </select>
            <label for="measure-tool-geometry-select">
                {{ $t("common:modules.measure.geometry") }}
            </label>
        </div>

        <div class="form-floating">
            <select
                id="measure-tool-unit-select"
                ref="measure-tool-unit-select"
                class="form-select"
                aria-label="..."
                :value="selectedGeometry === 'LineString' ? selectedLineStringUnit : selectedPolygonUnit"
                @change="setSelectedUnit($event.target.value)"
            >
                <option
                    v-for="(unit, i) in currentUnits"
                    :key="'measure-tool-unit-select-' + i"
                    :value="i"
                >
                    {{ unit }}
                </option>
            </select>
            <label for="measure-tool-unit-select">
                {{ $t("common:modules.measure.measure") }}
            </label>
        </div>
        <div class="d-flex justify-content-center my-3">
            <FlatButton
                id="measure-delete"
                aria-label="$t('common:modules.measure.deleteMeasurements')"
                :interaction="deleteFeatures"
                :text="$t('common:modules.measure.deleteMeasurements')"
                :icon="deleteIcon"
            />
        </div>
        <div
            v-if="isDefaultStyle()"
        >
            <div
                id="accordionFlushExample"
                class="accordion accordion-flush"
            >
                <div class="accordion-item">
                    <h2
                        id="flush-headingOne"
                        class="accordion-header"
                    >
                        <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#flush-collapseOne"
                            aria-expanded="false"
                            aria-controls="flush-collapseOne"
                        >
                            <i class="bi-info-circle-fill me-2" />
                            {{ $t("common:modules.coordToolkit.info") }}
                        </button>
                    </h2>
                    <div
                        id="flush-collapseOne"
                        class="accordion-collapse collapse"
                        aria-labelledby="flush-headingOne"
                        data-bs-parent="#accordionFlushExample"
                    >
                        <div class="accordion-body inaccuracy-list">
                            {{ $t("common:modules.measure.influenceFactors") }}
                            <ul>
                                <li>{{ $t("common:modules.measure.scale") }}</li>
                                <li>{{ $t("common:modules.measure.resolution") }}</li>
                                <li>{{ $t("common:modules.measure.screenResolution") }}</li>
                                <li>{{ $t("common:modules.measure.inputAccuracy") }}</li>
                                <li>{{ $t("common:modules.measure.measureDistance") }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

</style>
