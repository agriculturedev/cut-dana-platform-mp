<script>
import {generateColorRange, assignColors} from "../../../shared/js/utils/colorRange";
import ColorPicker from "../../../shared/modules/inputs/components/ColorPicker.vue";

/**
 * AttributeStyler
 * @module modules/AttributeStyler
 * @vue-data {Boolean} attributeSetter - Shows if the dropdown to select an attribute shall be displayed.
 * @vue-data {Array} featureAttributeValues - List of unique values of a given attribute of all features.
 * @vue-data {String} selectedColor - Hex representation of the selected color.
 * @vue-data {String} selectedAttribute - Selected attribute to use for styling the features.
 * @vue-computed {Arra} colorMappedValues - An array of objects of all unique values with a mapped color.
 */
export default {
    name: "AttributeStyler",
    components: {
        ColorPicker
    },
    props: {
        features: {
            type: Array,
            required: true,
            default: undefined
        },
        attributes: {
            type: Array,
            required: true,
            default: undefined
        }
    },
    emits: ["setAttributeStyles"],
    data () {
        return {
            attributeSetter: false,
            featureAttributeValues: undefined,
            selectedColor: "#f50000",
            selectedAttribute: undefined
        };
    },
    computed: {
        /**
         * Returns an array of objects of all unique values with a mapped color
         * @returns {Array} featureProperties of the layer config.
         */
        colorMappedValues () {
            if (!this.featureAttributeValues) {
                const mappedColorObject = {};

                mappedColorObject.attribute = "all";
                mappedColorObject.attributeValue = "none";
                mappedColorObject.attributeColor = this.selectedColor;

                return [mappedColorObject];
            }

            let colorRange;

            if (typeof this.featureAttributeValues[0] === "string") {
                colorRange = generateColorRange(this.selectedColor, this.featureAttributeValues.length);
            }
            else {
                colorRange = assignColors(this.featureAttributeValues, this.selectedColor);
            }

            const mappedAttributes = this.featureAttributeValues.map((attribute, index) => {
                const mappedColorObject = {};

                mappedColorObject.attribute = this.selectedAttribute;
                mappedColorObject.attributeValue = attribute;
                mappedColorObject.attributeColor = colorRange[index];

                return mappedColorObject;
            });

            return mappedAttributes;
        }
    },
    watch: {
        colorMappedValues () {
            this.$emit("setAttributeStyles", this.colorMappedValues);
        }
    },
    methods: {
        /**
         * Sets the selected color
         * @param {String} color hex color value
         * @returns {void}
         */
        setColor (color) {
            this.selectedColor = color;
        },
        /**
         * Toggles the attribute styling section
         * @returns {void}
         */
        toggleAttributeSetter () {
            this.attributeSetter = !this.attributeSetter;
        },
        /**
         * Gets the unique values of a given attribute of all features
         * @param {String} attribute the name of the attribute
         * @returns {void}
         */
        getAttributeValues (attribute) {
            const featureAttributeValues = this.features.map(feature => {
                return feature.properties[attribute];
            });

            this.featureAttributeValues = [...new Set(featureAttributeValues)];
        }
    }
};

</script>

<template>
    <div>
        <label
            id="attribute-styler-color-setter-label"
            for="attribute-styler-color-setter"
        >
            <input
                id="attribute-styler-color-setter"
                :value="attributeSetter"
                type="checkbox"
                @click="toggleAttributeSetter"
            >
            {{ $t("common:modules.fileImport.colorPerAttributes") }}
        </label>
        <div v-if="attributeSetter">
            <p>
                {{ $t("common:modules.fileImport.stylingAttributeDescription") }}
            </p>
            <select
                id="attribute-styler-attribute-select"
                ref="attribute-styler-attribute-select"
                v-model="selectedAttribute"
                class="form-select"
                @change="getAttributeValues($event.target.value)"
            >
                <option
                    v-for="(attribute, i) in attributes"
                    :key="'attribute-select' + i"
                    :value="attribute"
                >
                    {{ attribute }}
                </option>
            </select>
            <p>
                {{ $t("common:modules.fileImport.stylingColorDescription") }}
            </p>
        </div>
        <ColorPicker
            id="attribute-styler-color-picker"
            @color-changed="setColor($event)"
        />
    </div>
</template>

<style lang="scss" scoped>
    #attribute-styler-color-setter-label {
        margin-bottom: 20px;
    }

    #attribute-styler-attribute-select {
        margin: 0 0 10px 0;
    }

    #attribute-styler-color-picker {
        margin-bottom: 20px;
    }
</style>

