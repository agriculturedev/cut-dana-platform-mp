<script>
import IconButton from "./IconButton.vue";

/**
 * Shared component that provides buttons for two-level selection of ready to place 3D elements.
 * @module shared/modules/draw/DrawModels
 * @vue-prop {Object} [icons={box: "bi-square", circle: "bi-circle", doubleCircle: "bi-record-circle", geometries: "bi-hexagon-fill", line: "bi-slash-lg", pen: "bi-pencil-fill", point: "bi-circle-fill", polygon: "bi-octagon", symbols: "bi-circle-square"}] - The icons for draw buttons.
 * @vue-prop {String[]} [drawModelTypes=["line", "polygon", "rectangle"]] - The drawing types.
 * @vue-prop {String} [selectedDrawType=""] - The selected draw type.
 * @vue-prop {Function} setSelectedDrawType - Setter for selected draw type.
 */
export default {
    name: "DrawModels",
    components: {
        IconButton
    },
    props: {
        icons: {
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
        drawModelTypes: {
            type: Array,
            default () {
                return ["line", "polygon", "rectangle"];
            }
        },
        selectedDrawModelType: {
            type: String,
            default () {
                return "";
            }
        },
        setSelectedDrawModelType: {
            type: Function,
            required: true
        }
    },
    methods: {
        /**
         * Regulate the interaction.
         * @param {String} drawModelType The current draw type.
         * @returns {void}
         */
        regulateInteraction (drawModelType) {
            this.$emit("stop-placing");

            if (this.selectedDrawModelType !== drawModelType) {
                this.setSelectedDrawModelType(drawModelType);
            }

            this.$emit("start-placing");
        }
    }
};
</script>

<template>
    <div class="d-flex mb-2 align-items-center">
        <IconButton
            v-for="drawModelType in drawModelTypes"
            :id="'draw-' + drawModelType"
            :key="drawModelType"
            :aria="$t('common:modules.tools.modeler3D.draw.oneClicks.' + drawModelType)"
            :class-array="[
                'btn-primary',
                'me-3',
                selectedDrawModelType === drawModelType ? 'active': ''
            ]"
            :interaction="() => regulateInteraction(drawModelType)"
            :icon="icons[drawModelType]"
        />
    </div>
</template>
