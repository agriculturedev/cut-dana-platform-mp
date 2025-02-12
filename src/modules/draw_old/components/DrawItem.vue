<script>
import * as constants from "../store/constantsDraw";
import DownloadItem from "../components/DownloadItem.vue";
import DrawItemFeaturesFilter from "./DrawItemFeaturesFilter.vue";
import DrawItemAttributes from "./DrawItemAttributes.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import layerCollection from "../../../core/layers/js/layerCollection.js";
import main from "../js/main";
import SwitchInput from "../../../shared/modules/checkboxes/components/SwitchInput.vue";
import VectorSource from "ol/source/Vector";
import {Vector as VectorLayer} from "ol/layer";

/**
 * DrawItem
 * @module modules/DrawItem
 * @vue-data {String} mapElement - The hmtml-String for the map.
 * @vue-data {String} storePath - Path to the draw store.
 * @vue-data {Object} constants - Constants for Dropdowns.
 * @vue-data {Boolean} draing - Shows if drawing is true.
 * @vue-computed {Boolean} drawHTMLElements - Enables or disables all the select or input elements depending on if the currentInteraction is "draw".
 * @vue-computed {Boolean} drawHTMLElementsModifyFeature - Enables or disables the select- or input-boxes depending on the state of currentInteraction and selectedFeature.
 * @vue-computed {Boolean} drawCircleMethods - Enables the input for the radius if the circleMethod is "defined", for interaction "modify" the rule of drawHTMLElementsModifyFeature takes place.
 * @vue-computed {Number} circleRadiusComputed - The circle radius of the current drawType.
 * @vue-computed {Number} circleOuterRadiusComputed - The outer circle radius of the current drawType.
 * @vue-computed {String} circleMethodComputed - The circleMethod of the current drawType.
 * @vue-computed {Number} unitComputed - The unit of the current drawType.
 * @vue-computed {String} textComputed - The text of the current drawType.
 * @vue-computed {Number} fontSizeComputed - The font-size of the current drawType.
 * @vue-computed {String} fontComputed - The font-family of the current drawType.
 * @vue-computed {Number} strokeWidthComputed - The stroke-width of the current drawType.
 * @vue-computed {Number} opacityComputed - The opacity of the current drawType.
 * @vue-computed {Number} opacityContourComputed - The opacity of the contour of the current drawType.
 * @vue-computed {Number[]} colorContourComputed - The color of the contour of the current drawType.
 * @vue-computed {Number[]} outerColorContourComputed - The outer color of a double circle.
 * @vue-computed {Number[]} colorComputed - The color of the current drawType.
 * @vue-computed {String} colorContourLabelComputed - The label for the normal colorContour - in case this is a double circle.
 * @vue-computed {String} innerRadiusLabelComputed - The label for the normal innerRadius - in case this is a double circle.
 * @vue-computed {Boolean} isFilterListValid - Shows if filter list is valid.
 * @vue-computed {Boolean} isFromDrawTool - Shows if there are visible features from draw tool.
 * @vue-computed {Object} featuresFromDrawTool - Features that are set from the draw tool.
 */
export default {
    name: "DrawItem",
    components: {
        DrawItemFeaturesFilter,
        DrawItemAttributes,
        DownloadItem,
        SwitchInput
    },
    data () {
        return {
            mapElement: document.getElementById("map"),
            storePath: this.$store.state.Draw_old,
            constants: constants,
            drawing: true
        };
    },
    computed: {
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters("Modules/Draw_old", [
            "id",
            "type",
            "name",
            "enableAttributesSelector",
            "selectedFeature",
            "iconList",
            "symbol",
            "layer",
            "styleSettings",
            "download",
            "filterList",
            "hasMouseMapInteractions",
            "drawLayerVisible",
            "currentInteraction",
            "formerInteraction",
            "deactivatedDrawInteractions",
            "drawInteraction",
            "drawType",
            "modifyInteraction",
            "attributesKeyList",
            "outerBorderColor",
            "innerBorderColor"
        ]),
        /**
         * Enables or disables all the select or input elements depending on if the currentInteraction is "draw".
         * @returns {Boolean} currentInteraction === "draw": return false and activate the HTML elements, else: return true and deactivate the HTML elements.
         */
        drawHTMLElements () {
            // remember: true means disable, false means enable
            return !this.drawLayerVisible || this.currentInteraction !== "draw";
        },
        /**
         * Enables or disables the select- or input-boxes depending on the state of currentInteraction and selectedFeature.
         * @returns {Boolean} false activates the elements, true deactivates the elements
         */
        drawHTMLElementsModifyFeature () {
            if (this.selectedFeature !== null && this.currentInteraction === "modify") {
                return false;
            }
            // remember: true means disable, false means enable
            return !this.drawLayerVisible || this.currentInteraction !== "draw";
        },
        /**
         * Enables the input for the radius if the circleMethod is "defined", for interaction "modify" the rule of drawHTMLElementsModifyFeature takes place.
         * @returns {Boolean} returns true to disable the input, false to enable the input
         */
        drawCircleMethods () {
            if (this.currentInteraction === "draw") {
                // remember: true means disable, false means enable
                return !this.drawLayerVisible || this.styleSettings?.circleMethod !== "defined";
            }
            return this.drawHTMLElementsModifyFeature;
        },

        circleRadiusComputed: {
            /**
             * getter for the computed property circleRadius of the current drawType
             * @info the internal representation of circleRadius is always in meters
             * @returns {Number} the current radius
             */
            get () {
                if (this.styleSettings?.unit === "km") {
                    return this.styleSettings?.circleRadius / 1000;
                }
                return this.styleSettings?.circleRadius;
            },
            /**
             * setter for the computed property circleRadius of the current drawType
             * @info the internal representation of circleRadius is always in meters
             * @param {Number} value the value to set the target to
             * @returns {void}
             */
            set (value) {
                if (this.styleSettings?.unit === "km") {
                    this.setCircleRadius(parseInt(value, 10) * 1000);
                }
                else {
                    this.setCircleRadius(parseInt(value, 10));
                }
            }
        },
        circleOuterRadiusComputed: {
            /**
             * getter for the computed property circleOuterRadius of the current drawType
             * @info the internal representation of circleOuterRadius is always in meters
             * @returns {Number} the current radius
             */
            get () {
                if (this.styleSettings?.unit === "km") {
                    return this.styleSettings?.circleOuterRadius / 1000;
                }
                return this.styleSettings?.circleOuterRadius;
            },
            /**
             * setter for the computed property circleOuterRadius of the current drawType
             * @info the internal representation of circleOuterRadius is always in meters
             * @param {Number} value the value to set the target to
             * @returns {void}
             */
            set (value) {
                if (this.styleSettings?.unit === "km") {
                    this.setCircleOuterRadius(parseInt(value, 10) * 1000);
                }
                else {
                    this.setCircleOuterRadius(parseInt(value, 10));
                }
            }
        },
        /**
         * computed property for circleMethod of the current drawType
         * @returns {String} "defined" or "interactive"
         */
        circleMethodComputed () {
            return this.styleSettings?.circleMethod;
        },
        /**
         * computed property for the unit of the current drawType
         * @returns {String} "m" or "km"
         */
        unitComputed () {
            return this.styleSettings?.unit;
        },
        /**
         * computed property for the text of the current drawType
         * @returns {String} the current text
         */
        textComputed () {
            return this.styleSettings?.text;
        },
        /**
         * computed property for the font-size of the current drawType
         * @returns {Number} the current font-size as number
         */
        fontSizeComputed () {
            return this.styleSettings?.fontSize;
        },
        /**
         * computed property for the font family of the current drawType
         * @returns {Number} the current font family
         */
        fontComputed () {
            return this.styleSettings?.font;
        },
        /**
         * computed property for the stroke width of the current drawType
         * @returns {Number} the current width as number
         */
        strokeWidthComputed () {
            return this.styleSettings?.strokeWidth;
        },
        /**
         * computed property for the opacity linked to color of the current drawType
         * @returns {Number} the current opacity as css range [0..1] - this is the value, not the caption (!)
         */
        opacityComputed () {
            return this.styleSettings?.opacity;
        },
        /**
         * computed property for the opacity linked to colorContour of the current drawType
         * @returns {Number} the current opacity (of colorContour) as css range [0..1] - this is the value, not the caption (!)
         */
        opacityContourComputed () {
            return this.styleSettings?.opacityContour;
        },
        /**
         * computed property for the color of the current drawType
         * @returns {Number[]} the current color as array of numbers - e.g. [0, 0, 0, 1]
         */
        colorContourComputed () {
            return this.styleSettings?.colorContour;
        },
        /**
         * computed property for the outer color of a double circle
         * @returns {Number[]} the current color as array of numbers - e.g. [0, 0, 0, 1]
         */
        outerColorContourComputed () {
            return this.styleSettings?.outerColorContour;
        },
        /**
         * computed property for the color of the current drawType
         * @returns {Number[]} the current color as array of numbers - e.g. [0, 0, 0, 1]
         */
        colorComputed () {
            return this.styleSettings?.color;
        },
        /**
         * computed property of the label for the normal colorContour - in case this is a double circle
         * @returns {String} the label to use for the normal colorContour
         */
        colorContourLabelComputed () {
            if (this.drawType.id === "drawDoubleCircle" && this.currentInteraction !== "modify") {
                return this.$t("common:modules.draw_old.innerColorContour");
            }
            return this.$t("common:modules.draw_old.colorContour");
        },
        /**
         * computed property of the label for the normal innerRadius - in case this is a double circle
         * @returns {String} the label to use for the normal innerRadius
         */
        innerRadiusLabelComputed () {
            if (this.drawType.id === "drawDoubleCircle" && this.currentInteraction !== "modify") {
                return this.$t("common:modules.draw_old.innerRadius");
            }
            return this.$t("common:modules.draw_old.radius");
        },

        /**
         * Checks if the filter list is valid.
         * @returns {Boolean} True if valid.
         */
        isFilterListValid () {
            if (this.filterList === null) {
                return false;
            }
            if (!Array.isArray(this.filterList) || !this.filterList.length) {
                console.warn(this.filterList, "Die Konfiguration für den Filter ist nicht valide.");
                return false;
            }
            return true;
        },

        /**
         * Checks if there are visible features from draw tool.
         *
         * @returns {Boolean} True if there are visible features otherwise false.
         */
        isFromDrawTool () {
            const visibleFeatures = this.layer?.getSource()?.getFeatures()?.filter(feature => feature.get("masterportal_attributes").fromDrawTool &&
                feature.get("masterportal_attributes").isVisible
            );

            return visibleFeatures?.length > 0;
        },

        /**
         * Returns the features are set from drawTool
         * @returns {module:ol/Feature[]} The features from drawTool
         */
        featuresFromDrawTool () {
            return this.layer.getSource().getFeatures().filter(feature => feature.get("masterportal_attributes").fromDrawTool);
        }
    },
    created () {
        let importDrawLayer = mapCollection.getMap(this.mode).getLayers().getArray().find(layer => layer.get("id") === "importDrawLayer");

        if (importDrawLayer === undefined) {
            importDrawLayer = new VectorLayer({
                source: new VectorSource(),
                id: "importDrawLayer",
                name: "importDrawLayer",
                alwaysOnTop: true
            });
        }
        this.checkLayer(importDrawLayer).then((layerExists) => {
            if (!layerExists) {
                this.addLayer(importDrawLayer);
                this.setLayer(importDrawLayer);
            }
        });
        main.getApp().config.globalProperties.$layer = importDrawLayer;
    },
    mounted () {
        this.startInteractions();
        this.setCanvasCursorByInteraction(this.currentInteraction);
        this.setFocusToFirstControl();
    },
    unmounted () {
        this.resetModule();
        this.resetCanvasCursor();
    },
    methods: {
        ...mapMutations("Modules/Draw_old", [
            "setDownloadDataString",
            "setDownloadEnabled",
            "setDownloadFeatures",
            "setDownloadFile",
            "setDownloadFileName",
            "setDownloadFileUrl",
            "setDownloadSelectedFormat",
            "addSymbol",
            "setDrawSymbolSettings",
            "setDrawCurveSettings",
            "setDrawLineSettings",
            "setDrawAreaSettings",
            "setDrawCircleSettings",
            "setLayer",
            "setAttributesKeyList"
        ]),
        ...mapActions("Modules/Draw_old", [
            "undoLastStep",
            "redoLastStep",
            "clearLayer",
            "setDrawType",
            "setOpacity",
            "setStrokeWidth",
            "setColorContour",
            "setColor",
            "setFontSize",
            "setFont",
            "setSymbol",
            "setText",
            "setCircleRadius",
            "setCircleMethod",
            "setCircleOuterRadius",
            "setOuterColorContour",
            "addSymbolIfNotExists",
            "addDrawStateToFeature",
            "startInteractions",
            "setFocusToFirstControl",
            "resetModule",
            "resetCanvasCursor",
            "toggleInteraction",
            "removeInteraction",
            "manipulateInteraction",
            "deactivateDrawInteractions",
            "saveAsCurrentFeatureAndApplyStyleSettings",
            "updateDrawLayerVisible"
        ]),
        ...mapActions("Maps", [
            "addLayer",
            "checkLayer"
        ]),

        /**
         * Adds all symbols found in layerModels to the iconList.
         * @param {Object[]} layerConfigs The vsisible layer configs.
         * @returns {void}
         */
        addSymbolsByLayerModels (layerConfigs) {
            if (!Array.isArray(layerConfigs)) {
                return;
            }
            layerConfigs.forEach(layerConfig => {
                if (!layerConfig?.id) {
                    return;
                }
                const layerModel = layerCollection.getLayerById(layerConfig.id),
                    legend = layerModel?.get("legend");

                if (layerModel === undefined) {
                    return;
                }
                if (typeof layerModel?.get !== "function") {
                    return;
                }

                if (!Array.isArray(legend)) {
                    return;
                }
                legend.forEach(legendInfo => {
                    if (
                        typeof legendInfo?.styleObject?.get !== "function"
                        || typeof legendInfo.styleObject.get("imageScale") !== "number"
                        || typeof legendInfo.styleObject.get("imagePath") !== "string"
                        || !legendInfo.styleObject.get("imageName")
                    ) {
                        return;
                    }
                    const icon = {
                        "id": legendInfo.label || legendInfo.styleObject.get("imageName"),
                        "type": "image",
                        "scale": legendInfo.styleObject.get("imageScale"),
                        "value": legendInfo.styleObject.get("imagePath") + legendInfo.styleObject.get("imageName")
                    };

                    this.addSymbolIfNotExists(icon);
                });
            });
        },
        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["tool-draw-drawType"]) {
                    this.$refs["tool-draw-drawType"].focus();
                }
            });
        },
        /**
         * checks if both given arrays have the same number at their first 3 positions
         * note: the opacity (4th number) will be ignored - this is only about color
         * @param {Number[]} a a "color"-array e.g. white: [255, 255, 255, 1] or [255, 255, 255]
         * @param {Number[]} b another "color"-array to compare with
         * @returns {Boolean} true: the values at the first 3 positions of the given color arrays are identical
         */
        isEqualColorArrays (a, b) {
            if (Array.isArray(a) && Array.isArray(b) && a.length >= 3 && b.length >= 3) {
                return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
            }
            return false;
        },

        resetCanvasCursor () {
            this.mapElement.style.cursor = "";
            this.mapElement.onmousedown = undefined;
            this.mapElement.onmouseup = undefined;
        },

        setCanvasCursor (cursorType) {
            this.mapElement.style.cursor = cursorType;
            this.mapElement.onmousedown = this.onMouseDown;
            this.mapElement.onmouseup = this.onMouseUp;
        },

        setCanvasCursorByInteraction (interaction) {
            if (interaction === "modify" || interaction === "delete" || interaction === "modifyAttributes") {
                this.setCanvasCursor("pointer");
            }
            else {
                this.setCanvasCursor("crosshair");
            }
        },

        onMouseDown () {
            if (this.mapElement.style.cursor === "pointer") {
                this.mapElement.style.cursor = "grabbing";
            }
        },

        onMouseUp () {
            if (this.mapElement.style.cursor === "grabbing") {
                this.mapElement.style.cursor = "pointer";
            }
        },

        getIconLabelKey (option) {
            if (option && option.id) {
                if (i18next.exists(option.id)) {
                    return option.id;
                }
                else if (i18next.exists("common:modules.draw_old.iconList." + option.id)) {
                    return "common:modules.draw_old.iconList." + option.id;
                }
                // need to fake the return here for now, as long as exists doesn't work
                return "common:modules.draw_old.iconList." + option.id;
            }
            return "noName";
        },

        /**
         * Shows/hides the draw layer and enables/disables the tools of the draw tool.
         * @param {Boolean} value: the value of the switch
         * @returns {void}
         */
        switchDrawLayerVisible (value) {
            if (value) {
                this.setCanvasCursorByInteraction(this.currentInteraction);
            }
            else {
                this.resetCanvasCursor();
            }
            this.updateDrawLayerVisible(value);
        },
        /**
         * Updates the attributes' key list.
         * @param {String[]} keyList The attributes' key list
         * @returns {void}
         */
        updateAttributesKeyList (keyList) {
            this.setAttributesKeyList(keyList);
        }
    }
};
</script>

<template lang="html">
    <div>
        <div class="form-check form-switch mb-3 d-flex align-items-center">
            <div class="col-md-7">
                <SwitchInput
                    :id="'tool-draw-drawLayerVisible'"
                    :checked="drawLayerVisible"
                    :aria="$t('common:modules.print.withLegendLabel')"
                    :interaction="($event) => switchDrawLayerVisible($event.target.checked)"
                    :label="$t('common:modules.draw_old.drawLayerVisible')"
                />
            </div>
        </div>
        <div
            v-if="currentInteraction !== 'modifyAttributes'"
            class="form-group form-group-sm"
        >
            <hr>
            <div class="row">
                <label
                    for="tool-draw-drawType"
                    class="col-md-5 col-form-label"
                >
                    {{ $t("common:modules.draw_old.geometry") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-drawType"
                        ref="tool-draw-drawType"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElements"
                        @change="setDrawType"
                    >
                        <option
                            v-for="option in constants.drawTypeOptions"
                            :id="option.id"
                            :key="'draw-drawType-' + option.id"
                            :value="option.geometry"
                            :selected="option.id === drawType.id"
                        >
                            {{ $t("common:modules.draw_old.drawTypeOptions." + option.id) }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
        <hr>
        <template
            v-if="isFromDrawTool && isFilterListValid"
        >
            <DrawItemFeaturesFilter
                :filter-list="filterList"
                :features="featuresFromDrawTool"
            />
        </template>
        <template
            v-if="enableAttributesSelector && currentInteraction === 'modifyAttributes'"
        >
            <DrawItemAttributes
                :selected-feature="selectedFeature"
                :layer="layer"
                :attributes-key-list="attributesKeyList"
                @update-attributes-key-list="updateAttributesKeyList"
            />
        </template>
        <form
            v-if="currentInteraction !== 'modifyAttributes'"
            class="form-horizontal"
            role="form"
            @submit.prevent
        >
            <div
                v-if="drawType.id === 'drawCircle' && currentInteraction !== 'modify'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-circleMethod"
                >
                    {{ $t("common:modules.draw_old.method") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-circleMethod"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setCircleMethod"
                    >
                        <option
                            value="interactive"
                            :selected="circleMethodComputed === 'interactive'"
                        >
                            {{ $t("common:modules.draw_old.interactive") }}
                        </option>
                        <option
                            value="defined"
                            :selected="circleMethodComputed === 'defined'"
                        >
                            {{ $t("common:modules.draw_old.defined") }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id === 'drawCircle' || drawType.id === 'drawDoubleCircle'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-circleRadius"
                >
                    {{ innerRadiusLabelComputed }}
                </label>
                <div class="col-md-7">
                    <input
                        id="tool-draw-circleRadius"
                        v-model="circleRadiusComputed"
                        class="form-control form-control-sm"
                        :style="{borderColor: innerBorderColor}"
                        type="number"
                        step="1"
                        :placeholder="$t('common:modules.draw_old.doubleCirclePlaceholder')"
                        :disabled="drawCircleMethods"
                        min="0"
                    >
                </div>
            </div>
            <div
                v-if="drawType.id === 'drawDoubleCircle'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-circleOuterRadius"
                >
                    {{ $t("common:modules.draw_old.outerRadius") }}
                </label>
                <div class="col-md-7">
                    <input
                        id="tool-draw-circleOuterRadius"
                        v-model="circleOuterRadiusComputed"
                        class="form-control form-control-sm"
                        :style="{borderColor: outerBorderColor}"
                        type="number"
                        :placeholder="$t('common:modules.draw_old.doubleCirclePlaceholder')"
                        :disabled="drawCircleMethods"
                        min="0"
                    >
                </div>
            </div>
            <div
                v-if="drawType.id === 'drawCircle' || drawType.id === 'drawDoubleCircle'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-circleUnit"
                >
                    {{ $t("common:modules.draw_old.unit") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-circleUnit"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setUnit"
                    >
                        <option
                            v-for="option in constants.unitOptions"
                            :key="'draw-fontSize-' + option.value"
                            :selected="option.value === unitComputed"
                            :value="option.value"
                        >
                            {{ option.caption }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id === 'writeText'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-text"
                >
                    {{ $t("common:modules.draw_old.text") }}
                </label>
                <div class="col-md-7">
                    <input
                        id="tool-draw-text"
                        class="form-control form-control-sm"
                        type="text"
                        :placeholder="$t('common:modules.draw_old.clickToPlaceText')"
                        :disabled="drawHTMLElementsModifyFeature"
                        :value="textComputed"
                        @input="setText"
                    >
                </div>
            </div>
            <div
                v-if="drawType.id === 'writeText'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-fontSize"
                >
                    {{ $t("common:modules.draw_old.fontSize") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-fontSize"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setFontSize"
                    >
                        <option
                            v-for="option in constants.fontSizeOptions"
                            :key="'draw-fontSize-' + option.value"
                            :selected="option.value === fontSizeComputed"
                            :value="option.value"
                        >
                            {{ option.caption }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id === 'writeText'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-font"
                >
                    {{ $t("common:modules.draw_old.fontName") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-font"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setFont"
                    >
                        <option
                            v-for="option in constants.fontOptions"
                            :key="'draw-font-' + option.value"
                            :value="option.value"
                            :selected="option.value === fontComputed"
                        >
                            {{ option.caption }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id === 'drawSymbol'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-symbol"
                >
                    {{ $t("common:modules.draw_old.symbol") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-symbol"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setSymbol"
                    >
                        <option
                            v-for="option in iconList"
                            :key="'draw-icon-' + (option.id)"
                            :value="(option.id)"
                            :selected="option.id === symbol.id"
                        >
                            {{ $t(getIconLabelKey(option)) }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id !== 'drawSymbol' && drawType.id !== 'writeText'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-strokeWidth"
                >
                    {{ $t("common:modules.draw_old.lineWidth") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-strokeWidth"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setStrokeWidth"
                    >
                        <option
                            v-for="option in constants.strokeOptions"
                            :key="'draw-stroke-' + option.value"
                            :value="option.value"
                            :selected="option.value === strokeWidthComputed"
                        >
                            {{ option.caption }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve'&& drawType.id !== 'drawSymbol'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-opacity"
                >
                    {{ $t("common:modules.draw_old.transparency") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-opacity"
                        :key="`tool-draw-opacity-select`"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setOpacity"
                    >
                        <option
                            v-for="option in constants.transparencyOptions"
                            :key="'draw-opacity-option-' + option.value"
                            :selected="option.value === opacityComputed"
                            :value="option.value"
                        >
                            {{ option.caption }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id === 'drawLine' || drawType.id === 'drawCurve'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-opacityContour"
                >
                    {{ $t("common:modules.draw_old.transparencyOutline") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-opacityContour"
                        :key="`tool-draw-opacityContour-select`"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setOpacityContour"
                    >
                        <option
                            v-for="option in constants.transparencyOptions.slice(0, constants.transparencyOptions.length -1)"
                            :key="'draw-opacityContour-option-' + option.value"
                            :selected="option.value === opacityContourComputed"
                            :value="option.value"
                        >
                            {{ option.caption }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id !== 'drawSymbol' && drawType.id !== 'writeText'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-colorContour"
                >
                    {{ colorContourLabelComputed }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-colorContour"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setColorContour"
                    >
                        <option
                            v-for="option in constants.colorContourOptions"
                            :key="'draw-colorContour-' + option.color"
                            :value="option.value"
                            :selected="isEqualColorArrays(option.value, colorContourComputed)"
                        >
                            {{ $t("common:modules.draw_old.colors." + option.color) }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id === 'drawDoubleCircle'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-outerColorContour"
                >
                    {{ $t("common:modules.draw_old.outerColorContour") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-outerColorContour"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setOuterColorContour"
                    >
                        <option
                            v-for="option in constants.colorContourOptions"
                            :key="'draw-outerColorContour-' + option.color"
                            :value="option.value"
                            :selected="isEqualColorArrays(option.value, outerColorContourComputed)"
                        >
                            {{ $t("common:modules.draw_old.colors." + option.color) }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id === 'drawSymbol' && symbol.id === 'iconPoint'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-pointColor"
                >
                    {{ $t("common:modules.draw_old.color") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-pointColor"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setColor"
                    >
                        <option
                            v-for="option in constants.colorOptions"
                            :key="'draw-color-' + option.color"
                            :value="option.value"
                            :selected="isEqualColorArrays(option.value, colorComputed)"
                        >
                            {{ $t("common:modules.draw_old.colors." + option.color) }}
                        </option>
                    </select>
                </div>
            </div>
            <div
                v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve' && drawType.id !== 'drawSymbol'"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-pointColor"
                >
                    {{ $t("common:modules.draw_old.color") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-pointColor"
                        class="form-select form-select-sm"
                        :disabled="drawHTMLElementsModifyFeature"
                        @change="setColor"
                    >
                        <option
                            v-for="option in constants.colorOptions"
                            :key="'draw-color-' + option.color"
                            :value="option.value"
                            :selected="isEqualColorArrays(option.value, colorComputed)"
                        >
                            {{ $t("common:modules.draw_old.colors." + option.color) }}
                        </option>
                    </select>
                </div>
            </div>
        </form>
        <hr>
        <div
            class="form-horizontal"
            role="form"
        >
            <div class="form-group form-group-sm row">
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-draw-drawInteraction"
                        class="btn btn-sm"
                        :class="currentInteraction === 'draw' ? 'btn-primary' : ''"
                        :disabled="!drawLayerVisible || currentInteraction === 'draw'"
                        @click="toggleInteraction('draw'); setCanvasCursorByInteraction('draw')"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-pencil-fill" />
                        </span>
                        {{ $t("common:modules.draw_old.button.draw") }}
                    </button>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-draw-undoInteraction"
                        class="btn btn-sm"
                        :disabled="!drawLayerVisible"
                        @click="undoLastStep"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-arrow-counterclockwise" />
                        </span>
                        {{ $t("common:modules.draw_old.button.undo") }}
                    </button>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-draw-redoInteraction"
                        class="btn btn-sm"
                        :disabled="!drawLayerVisible"
                        @click="redoLastStep"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-arrow-clockwise" />
                        </span>
                        {{ $t("common:modules.draw_old.button.redo") }}
                    </button>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-draw-editInteraction"
                        class="btn btn-sm"
                        :class="currentInteraction === 'modify' ? 'btn-primary' : ''"
                        :disabled="!drawLayerVisible || currentInteraction === 'modify'"
                        @click="toggleInteraction('modify'); setCanvasCursorByInteraction('modify')"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-wrench" />
                        </span>
                        {{ $t("common:modules.draw_old.button.edit") }}
                    </button>
                </div>
            </div>
            <div
                v-if="enableAttributesSelector"
                class="form-group form-group-sm row"
            >
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-draw-editInteraction-attributes"
                        class="btn btn-sm"
                        :class="currentInteraction === 'modifyAttributes' ? 'btn-primary' : ''"
                        :disabled="!drawLayerVisible || currentInteraction === 'modifyAttributes'"
                        @click="toggleInteraction('modifyAttributes'); setCanvasCursorByInteraction('modifyAttributes')"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-wrench" />
                        </span>
                        {{ $t("common:modules.draw_old.button.editAttributes") }}
                    </button>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-draw-deleteInteraction"
                        class="btn btn-sm"
                        :class="currentInteraction === 'delete' ? 'btn-primary' : ''"
                        :disabled="!drawLayerVisible || currentInteraction === 'delete'"
                        @click="toggleInteraction('delete'); setCanvasCursorByInteraction('delete')"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-trash" />
                        </span>
                        {{ $t("common:modules.draw_old.button.delete") }}
                    </button>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-draw-deleteAllInteraction"
                        class="btn btn-sm"
                        :disabled="!drawLayerVisible"
                        @click="clearLayer"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-trash" />
                        </span>
                        {{ $t("common:modules.draw_old.button.deleteAll") }}
                    </button>
                </div>
            </div>
            <DownloadItem v-if="drawLayerVisible && download.enabled" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.no-cursor {
    cursor: none;
}
.cursor-crosshair {
    cursor: crosshair;
}
.btn-sm {
    font-size: $font-size-base;
}
</style>
