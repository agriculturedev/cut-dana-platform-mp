<script>
import IconButton from "./IconButton.vue";

/**
 * Shared component that provides buttons for two-level selection of geometries and symbols.
 * @module shared/modules/draw/DrawTypes
 * @vue-prop {Object} [circleOptions={innerRadius: 100, interactive: true, outerRadius: 500}] - The circle Options.
 * @vue-prop {Object} currentLayout - The current layout for the styling.
 * @vue-prop {Object} [drawIcons={box: "bi-square", circle: "bi-circle", doubleCircle: "bi-record-circle", geometries: "bi-hexagon-fill", line: "bi-slash-lg", pen: "bi-pencil-fill", point: "bi-circle-fill", polygon: "bi-octagon", symbols: "bi-circle-square"}] - The icons for draw buttons.
 * @vue-prop {String[]} [drawTypes=["pen", "geometries", "symbols"]] - The drawing types.
 * @vue-prop {String} [selectedDrawType=""] - The selected draw type.
 * @vue-prop {String} [selectedDrawTypeMain=""] - The selected draw type main.
 * @vue-prop {Function} setSelectedDrawType - Setter for selected draw type.
 * @vue-prop {Function} [setSelectedDrawTypeMain=null] - Setter for selected draw type main.
 * @vue-prop {ol/source/Vector} source - The vector source for drawings.
 * @vue-data {ol/interaction/Draw} drawInteraction=null - The current draw interaction.
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
                    outerRadius: 0
                };
            }
        },
        currentLayout: {
            type: Object,
            required: true
        },
        drawIcons: {
            type: Object,
            default () {
                return {
                    line: "bi-slash-lg",
                    point: "bi-circle-fill",
                    polygon: "bi-octagon",
                    rectangle: "bi-square"
                };
            }
        },
        drawTypes: {
            type: Array,
            default () {
                return ["line", "polygon"];
            }
        },
        selectedDrawType: {
            type: String,
            default () {
                return "";
            }
        },
        setSelectedDrawType: {
            type: Function,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        /**
         * Regulate the interaction.
         * @param {String} drawType The current draw type.
         * @param {Number} idx The index of buttons.
         * @returns {void}
         */
        regulateInteraction (drawType, idx) {
            const toggleButton = this.$refs[`button${idx}`][0].$el.classList.contains("active");

            if (!toggleButton) {
                if (this.selectedDrawType !== drawType) {
                    if (this.selectedDrawType) {
                        this.$emit("stop-drawing");
                    }
                    this.setSelectedDrawType(drawType);
                }
                this.$emit("start-drawing");
            }
            else {
                this.$emit("stop-drawing");
            }
        }
    }
};
</script>

<template>
    <div class="d-flex mb-2 align-items-center">
        <IconButton
            v-for="(drawType, idx) in drawTypes"
            :id="'draw-' + drawType"
            :ref="'button' + idx"
            :key="drawType"
            :aria="$t('common:modules.tools.modeler3D.draw.geometries.' + drawType)"
            :class-array="[
                'btn-primary',
                'me-3',
                selectedDrawType === drawType ? 'active': ''
            ]"
            :interaction="() => regulateInteraction(drawType, idx)"
            :icon="drawIcons[drawType]"
            :disabled="disabled && selectedDrawType !== drawType "
        />
    </div>
</template>
