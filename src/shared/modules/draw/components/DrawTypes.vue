<script>
import drawInteraction from "@masterportal/masterportalapi/src/maps/interactions/drawInteraction";
import {mapActions, mapGetters} from "vuex";
import IconButton from "../../buttons/components/IconButton.vue";
import {nextTick} from "vue";

/**
 * Shared component that provides buttons for two-level selection of geometries and symbols.
 * @module shared/modules/draw/DrawTypes
 * @vue-prop {Object} [circleOptions={innerRadius: 100, interactive: true, outerRadius: 500, unit: "m"}] - The circle Options.
 * @vue-prop {Object} currentLayout - The current layout for the styling.
 * @vue-prop {Object} [currentLayoutOuterCircle={}] - The current layout for styling the outer circle. Only used for double circle.
 * @vue-prop {Object} [drawIcons={box: "bi-square", circle: "bi-circle", doubleCircle: "bi-record-circle", geometries: "bi-hexagon-fill", line: "bi-slash-lg", pen: "bi-pencil-fill", point: "bi-circle-fill", polygon: "bi-octagon", symbols: "bi-circle-square"}] - The icons for draw buttons.
 * @vue-prop {String[]} [drawTypes=["pen", "geometries", "symbols"]] - The drawing types.
 * @vue-prop {String} [selectedDrawType=""] - The selected draw type.
 * @vue-prop {String} [selectedDrawTypeMain=""] - The selected draw type main.
 * @vue-prop {String} [selectedInteraction="draw"] - The selected interaction.
 * @vue-prop {Function} setSelectedDrawType - Setter for selected draw type.
 * @vue-prop {Function} [setSelectedDrawTypeMain=null] - Setter for selected draw type main.
 * @vue-prop {Function} [setSelectedInteraction=null] - Setter for selected interaction.
 * @vue-prop {ol/source/Vector} source - The vector source for drawings.
 * @vue-prop {Boolean} [shouldEmitEvents =false] - Flag to indicate if in modeler3D mode.
 * @vue-data {ol/interaction/Draw} currentDrawInteraction - The current draw interaction.
 */
export default {
    name: "DrawTypes",
    components: {
        IconButton
    },
    props: {
        circleOptions: {
            type: Object,
            default () {
                return {
                    innerRadius: 0,
                    interactive: true,
                    outerRadius: 0,
                    unit: "m"
                };
            }
        },
        currentLayout: {
            type: Object,
            required: true
        },
        currentLayoutOuterCircle: {
            type: Object,
            default () {
                return {};
            }
        },
        drawIcons: {
            type: Object,
            default () {
                return {
                    box: "bi-square",
                    circle: "bi-circle",
                    doubleCircle: "bi-record-circle",
                    geometries: "bi-hexagon-fill",
                    line: "bi-slash-lg",
                    pen: "bi-pencil-fill",
                    point: "bi-circle-fill",
                    polygon: "bi-octagon",
                    symbols: "bi-circle-square"
                };
            }
        },
        drawTypes: {
            type: Array,
            default () {
                return ["pen", "geometries", "symbols"];
            }
        },
        selectedDrawType: {
            type: String,
            default () {
                return "";
            }
        },
        selectedDrawTypeMain: {
            type: String,
            default () {
                return "";
            }
        },
        selectedInteraction: {
            type: String,
            default () {
                return "draw";
            }
        },
        setSelectedDrawType: {
            type: Function,
            required: true
        },
        setSelectedDrawTypeMain: {
            type: Function,
            default () {
                return null;
            }
        },
        setSelectedInteraction: {
            type: Function,
            default () {
                return null;
            }
        },
        source: {
            type: Object,
            required: true
        },
        shouldEmitEvents: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            currentDrawInteraction: null
        };
    },
    computed: {
        ...mapGetters("Maps", ["projection"])
    },
    watch: {
        "circleOptions.interactive" () {
            if (this.selectedDrawType === "circle" || this.selectedDrawType === "doubleCircle") {
                if (this.currentDrawInteraction !== null) {
                    this.removeInteraction(this.currentDrawInteraction);
                    this.regulateDrawInteraction(this.selectedDrawType);
                }
            }
        },
        currentLayout (currentLayout) {
            drawInteraction.setStyleObject(currentLayout);
        },
        currentLayoutOuterCircle (currentLayoutOuterCircle) {
            drawInteraction.setStyleObject(currentLayoutOuterCircle, true);
        },
        selectedInteraction (selectedInteraction) {
            if (selectedInteraction !== "draw") {
                if (typeof this.setSelectedDrawTypeMain === "function") {
                    this.setSelectedDrawTypeMain("");
                    this.setSelectedDrawType("");
                    this.removeInteraction(this.currentDrawInteraction);
                    this.currentDrawInteraction = null;
                }
            }
        }
    },
    mounted () {
        drawInteraction.setStyleObject(this.currentLayout);
        if (Object.keys(this.currentLayoutOuterCircle).length > 0) {
            drawInteraction.setStyleObject(this.currentLayoutOuterCircle, true);
        }

        this.startDrawingInitial();
    },
    unmounted () {
        this.removeInteraction(this.currentDrawInteraction);
    },
    methods: {
        ...mapActions("Maps", ["addInteraction", "removeInteraction"]),

        /**
         * Start drawing initial, if a selectedDrawType is specified.
         * @returns {void}
         */
        startDrawingInitial () {
            if (this.selectedDrawType !== "") {
                if (this.selectedDrawTypeMain === "") {
                    const selectedDrawType = this.selectedDrawType;

                    this.setSelectedDrawType("");

                    nextTick(() => {
                        this.regulateInteraction(selectedDrawType);
                    });
                }
                else if (this.selectedDrawType === this.selectedDrawTypeMain) {
                    this.regulateDrawInteraction(this.selectedDrawType);
                }
            }
        },

        /**
         * Regulate the interaction.
         * @param {String} drawType The current draw type.
         * @returns {void}
         */
        regulateInteraction (drawType) {
            if (typeof this.setSelectedInteraction === "function") {
                this.setSelectedInteraction("draw");
            }

            if (typeof this.setSelectedDrawTypeMain === "function" && this.drawTypes.includes(drawType)) {
                this.setSelectedDrawTypeMain(this.selectedDrawTypeMain !== drawType ? drawType : "");
                this.setSelectedDrawType("");
            }

            this.removeInteraction(this.currentDrawInteraction);

            if (this.selectedDrawType === drawType) {
                this.setSelectedDrawType("");
            }
            else {
                this.regulateDrawInteraction(drawType);
            }

            if (this.shouldEmitEvents) {
                this.$emit("stop-drawing");

                if (this.selectedDrawType !== drawType) {
                    this.setSelectedDrawType(drawType);
                }

                this.$emit("start-drawing");
            }
            else if (this.selectedDrawType !== drawType) {
                this.setSelectedDrawType(drawType);
            }
        },

        /**
         * Regulate the draw interaction for valid draw types.
         * @param {String} drawType The current draw type.
         * @returns {void}
         */
        regulateDrawInteraction (drawType) {
            this.currentDrawInteraction = drawInteraction.createDrawInteraction(drawType, this.source);

            if (this.currentDrawInteraction !== null) {
                if (drawType === "circle" || drawType === "doubleCircle") {
                    this.regulateStaticCircleInteraction(drawType);
                }

                this.addInteraction(this.currentDrawInteraction);
                this.setSelectedDrawType(drawType);
            }
        },

        /**
         * Regulate the draw interactions for static circles.
         * @param {String} drawType The current draw type.
         * @returns {void}
         */
        regulateStaticCircleInteraction (drawType) {
            drawInteraction.drawCircle(this.currentDrawInteraction, drawType, this.projection, this.source, this.circleOptions);
        }
    }
};
</script>

<template>
    <div class="d-flex align-items-center">
        <IconButton
            v-for="drawType in drawTypes"
            :id="'draw-' + drawType"
            :key="drawType"
            :aria="$t('common:shared.modules.draw.drawTypes.' + drawType)"
            :class-array="[
                'btn-primary',
                'me-3',
                selectedDrawType === drawType || selectedDrawTypeMain === drawType ? 'active': ''
            ]"
            :interaction="(event) => regulateInteraction(drawType)"
            :icon="drawIcons[drawType]"
        />
    </div>
</template>
