<script>
import definitionsGraphicalSelect from "../js/definitionsGraphicalSelect";
import {mapGetters, mapActions, mapMutations} from "vuex";
import Draw, {createBox} from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Circle} from "ol/geom.js";

export default {
    name: "GraphicalSelect",
    props: {
        // The used template element for graphical selection
        selectElement: {
            type: String,
            required: false,
            default: "Dropdown"

        },
        // preselected draw modus
        selectedOption: {
            type: String,
            required: false,
            default: "Box"

        },
        // The keys corresponds to the ol draw modus
        // and the values to the elements text content.
        options: {
            type: Object,
            required: false,
            default: undefined
        },
        // if focus should be set to this component when it is created
        focusOnCreation: {
            type: Boolean,
            default: false,
            required: false
        },
        // The label of the select
        label: {
            type: String,
            required: true
        },
        // The description over the select
        description: {
            type: String,
            default: "",
            required: false
        }
    },
    data () {
        return {
            selectedOptionData: this.selectedOption,
            circleOverlay: definitionsGraphicalSelect.circleOverlay,
            tooltipOverlay: definitionsGraphicalSelect.tooltipOverlay,
            drawInteraction: definitionsGraphicalSelect.drawInteraction
        };
    },
    computed: {
        ...mapGetters("Modules/GraphicalSelect", [
            "active",
            "geographicValues",
            "selectionElements"

        ]),
        optionsValue: function () {
            return this.options ? this.options : {
                "Box": this.$t("common:shared.modules.graphicalSelect.selectBySquare"),
                "Circle": this.$t("common:shared.modules.graphicalSelect.selectByCircle"),
                "Polygon": this.$t("common:shared.modules.graphicalSelect.selectByPolygon")
            };
        }
    },

    /**
     * Mounted hook:
     * @returns {void}
     */
    mounted () {
        this.setActive(true);
        this.selectedOptionData = this.selectedOption;
        this.createDomOverlay({id: "sdp-circle-overlay", overlay: this.circleOverlay});
        this.createDomOverlay({id: "sdp-tooltip-overlay", overlay: this.tooltipOverlay});
        this.createDrawInteraction();
        this.checkOptions();
        this.setDefaultSelection(this.selectedOptionData);
    },
    unmounted () {
        this.setActive(false);
        this.resetView();
    },

    methods: {
        ...mapMutations("Modules/GraphicalSelect", [
            "setDefaultSelection",
            "setActive",
            "setCurrentValue"
        ]),
        ...mapActions("Modules/GraphicalSelect", [
            "createDomOverlay",
            "showTooltipOverlay",
            "toggleOverlay",
            "updateDrawInteractionListener"
        ]),
        ...mapActions("Maps", [
            "addLayer",
            "addInteraction",
            "removeInteraction",
            "registerListener"
        ]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Handles (de-)activation of this Module
         * @param {Boolean} value flag if module is active
         * @todo Replace if removeOverlay is available in vue
         * @returns {void}
         */
        setStatus: function (value) {
            if (value) {
                this.createDrawInteraction();
            }
            else {
                if (typeof this.drawInteraction === "object") {
                    this.drawInteraction.setActive(false);
                }
                mapCollection.getMap("2D").removeOverlay(this.circleOverlay);
                mapCollection.getMap("2D").removeOverlay(this.tooltipOverlay);
            }
        },

        /**
         * Sets the selection of the dropdown to the default value
         * @returns {void}
         */
        resetGeographicSelection: function () {
            this.selectedOptionData = Object.keys(this.optionsValue)[0];
        },

        /**
         * Check the provided configuration of the graphicalSelect element
         * @returns {void}
         */
        checkOptions: function () {
            if (!this.geographicValues.every(key => Object.keys(this.optionsValue).includes(key))) {
                this.addSingleAlert({
                    "content": this.$t("common:shared.modules.graphicalSelect.alert.notSupportedOption") + this.geographicValues
                });
            }

            if (!this.geographicValues.includes(this.selectedOption)) {
                this.addSingleAlert({
                    "content": this.$t("common:shared.modules.graphicalSelect.alert.notSupportedSelection") + this.geographicValues
                });
            }

            if (!this.selectionElements.includes(this.selectElement)) {
                this.addSingleAlert({
                    "content": this.$t("common:shared.modules.graphicalSelect.alert.notSupportedElement") + this.selectionElements
                });
            }
        },

        /**
         * Reset the map view by clearing geometries and removing overlays and interactions.
         * This method clears the vector source, removes the layer from the map,
         * removes the draw interaction, and clears the content of the overlays.
         * @returns {void}
         */
        async resetView () {
            const map = mapCollection.getMap("2D");

            if (this.layer) {
                this.layer.getSource().clear();
                map.removeLayer(this.layer);
            }

            if (this.draw) {
                this.removeInteraction(this.draw);
            }

            if (this.circleOverlay && this.circleOverlay.element) {
                this.circleOverlay.element.innerHTML = "";
            }

            map.removeOverlay(this.circleOverlay);
            map.removeOverlay(this.tooltipOverlay);
        },

        /**
         * Rounds the circle radius.
         * @param {Number} radius circle radius
         * @return {String} the rounded radius
         */
        roundRadius: function (radius) {
            if (radius > 500) {
                return (Math.round(radius / 1000 * 100) / 100) + " km";
            }
            return (Math.round(radius * 10) / 10) + " m";
        },

        /**
         * Calculates the circle radius and places the circle overlay on geometry change.
         * @param {Number} radius - circle radius
         * @param {Number[]} coords - point coordinate
         * @returns {void}
         */
        showOverlayOnSketch: function (radius, coords) {
            const circleOverlay = this.circleOverlay;

            circleOverlay.element.innerHTML = this.roundRadius(radius);
            circleOverlay.setPosition(coords);
        },

        /**
         * Rounds the given number with the given precision.
         * @param {Number} number to round
         * @param {Number} precision exponent
         * @returns {Number} the rounded number
         */
        precisionRound: function (number, precision) {
            const factor = Math.pow(10, precision);

            return Math.round(number * factor) / factor;
        },

        /**
         * If drawtype == "Circle" set the radius to the circle-geometry
         * @param {*} coordinates array of coordinates to get the radius from
         * @param {*} opt_geom optional existing geometry
         * @returns {*} the optional existing geometry or a circle geometry
         */
        snapRadiusToInterval: function (coordinates, opt_geom) {
            let radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2));

            radius = this.precisionRound(radius, -1);
            const geometry = opt_geom || new Circle(coordinates[0]);

            geometry.setRadius(radius);

            this.showOverlayOnSketch(radius, coordinates[1]);
            return geometry;
        },

        /**
         * Create the draw interaction Box |Circle |Polygon
         * @todo Replace if removeOverlay and pointermove is available in vue
         * @returns {void}
         */
        createDrawInteraction: function () {
            const geometryFunction = createBox(),
                drawtype = this.selectedOptionData;

            if (this.layer) {
                this.resetView(this.layer);
            }
            else {
                this.layer = new VectorLayer({
                    id: "geometry_selection_layer",
                    name: "Geometry-Selection",
                    source: new VectorSource(),
                    alwaysOnTop: true
                });
            }

            // createBox() and type: 'Circle' return a box instead of a circle geometry
            this.draw = new Draw({
                source: this.layer.getSource(),
                type: drawtype === "Box" ? "Circle" : drawtype,
                geometryFunction: drawtype === "Polygon" ? undefined : (coordinates, opt_geom) => {
                    if (drawtype === "Box") {
                        return geometryFunction(coordinates, opt_geom);
                    }
                    return this.snapRadiusToInterval(coordinates, opt_geom);
                }
            });

            this.addInteraction(this.draw);
            this.setCurrentValue(drawtype);
            this.toggleOverlay({type: drawtype, overlayCircle: this.circleOverlay, overlayTool: this.tooltipOverlay});
            this.updateDrawInteractionListener({interaction: this.draw, layer: this.layer, vm: this});
            this.drawInteraction = this.draw;
            this.registerListener({type: "pointermove", listener: this.showTooltipOverlay});
            if (!mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === this.layer.get("id"))) {
                this.addLayer(this.layer);
            }
        }
    }
};
</script>

<template>
    <label
        v-if="description !== ''"
        for="graphicalSelect"
        class="form-floating mb-2"
    >
        {{ $t(description) }}
    </label>
    <div class="form-floating mb-3">
        <select
            id="graphicalSelect"
            class="form-select"
            :aria-label="label"
            @change="selectedOptionData=$event.target.value;createDrawInteraction()"
        >
            <option
                v-for="(value, i) in optionsValue"
                :key="i"
                :value="i"
                :selected="optionsValue[0]"
            >
                {{ value }}
            </option>
        </select>
        <label for="graphicalSelect">
            {{ $t(label) }}
        </label>
    </div>
</template>

<style lang="scss" scoped>
 @import "~variables";
</style>
