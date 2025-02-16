<script>
import {mapGetters} from "vuex";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import {Polygon, LineString, Point} from "ol/geom.js";
import Feature from "ol/Feature.js";
import {uniqueId} from "../../../shared/js/utils/uniqueId.js";

/**
 * Tooltip shown in the map to indicate measurement results and deviance.
 * @module modules/MeasureInMapTooltip
 * @vue-data {String} currentTextPoint - The current text point.
 */
export default {
    name: "MeasureInMapTooltip",
    data: () => {
        return {
            currentTextPoint: null
        };
    },
    computed: {
        ...mapGetters("Modules/Measure", [
            "layer",
            "featureId",
            "tooltipCoord",
            "polygons",
            "lines",
            "polygonAreas",
            "lineLengths",
            "color"
        ])
    },
    watch: {
        featureId (value) {
            this.currentTextPoint = this.generateTextPoint(value);
            this.layer.getSource().addFeature(this.currentTextPoint);
        },
        polygonAreas (value) {
            this.setValueAtTooltipLayer(value);
        },
        lineLengths (value) {
            this.setValueAtTooltipLayer(value);
        }
    },
    methods: {
        /**
         * Sets the measured values at all tooltip-layer.
         * @param {Object} measureValues containes the measured values by featureId
         * @returns {void}
         */
        setValueAtTooltipLayer (measureValues) {
            if (Object.values(measureValues).length > 0 &&
                Object.values(measureValues).findIndex((value) => value === "0") === -1) {
                if (this.currentTextPoint) {
                    this.currentTextPoint.getGeometry().setCoordinates(this.tooltipCoord);
                }

                Object.keys(measureValues).forEach(featureId => {
                    const feature = this.lines[featureId] || this.polygons[featureId],
                        styles = this.generateTextStyles(feature, measureValues[featureId]);

                    this.layer.getSource().forEachFeature(aFeature => {
                        if (aFeature.get("featureId") === feature.ol_uid) {
                            aFeature.setStyle(styles);
                        }
                    });
                });
            }
        },
        /**
         * generates text for points
         * @param {String} featureId - id of the current feature
         * @returns {this} pointFeature
         */
        generateTextPoint (featureId) {
            const feature = this.lines[featureId] || this.polygons[featureId];
            let geom = null,
                coord = null,
                pointFeature = null;

            if (feature !== undefined) {
                geom = feature.getGeometry();
            }
            if (geom instanceof Polygon) {
                coord = geom.getCoordinates()[0][geom.getCoordinates()[0].length - 2];
            }
            else if (geom instanceof LineString) {
                coord = geom.getLastCoordinate();
            }
            pointFeature = new Feature({
                geometry: new Point(coord)
            });
            pointFeature.setStyle(this.generateTextStyles(feature));
            // this styleId is important for printing, else lines and polygons are not printed
            pointFeature.set("styleId", uniqueId("measureStyle"));
            pointFeature.set("featureId", feature.ol_uid);
            return pointFeature;
        },
        /**
         * generates style for text in 2D view
         * @param {Object} feature - geometry feature
         * @param {String} newValue - new measured value
         * @returns {Object} styles
         */
        generateTextStyles (feature, newValue = "0") {
            const fill = new Fill({
                    color: [0, 0, 0, 1]
                }),
                stroke = new Stroke({
                    color: this.color,
                    width: 1
                }),
                backgroundFill = new Fill({
                    color: this.color
                });

            return [
                new Style({
                    text: new Text({
                        text: newValue,
                        textAlign: "left",
                        font: "14px sans-serif",
                        fill: fill,
                        stroke: stroke,
                        offsetY: -10,
                        offsetX: 10,
                        backgroundFill: backgroundFill,
                        padding: [5, 0, 5, 0]
                    })
                }),
                new Style({
                    text: new Text({
                        text: feature.get("isBeingDrawn") ? this.$t("common:modules.measure.finishWithDoubleClick") : "",
                        textAlign: "left",
                        font: "12px sans-serif",
                        fill: fill,
                        stroke: stroke,
                        offsetY: 10,
                        offsetX: 10,
                        backgroundFill: backgroundFill,
                        padding: [5, 0, 5, 0]
                    })
                })
            ];
        }
    }
};
</script>

<template lang="html">
    <div />
</template>
