<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import Multiselect from "vue-multiselect";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import getIconListFromLegendModule from "../utils/getIconListFromLegend.js";
import {getDefaultOperatorBySnippetType} from "../utils/getDefaultOperatorBySnippetType.js";
import splitListWithDelimiter from "../utils/splitListWithDelimiter.js";
import isObject from "../../../shared/js/utils/isObject";
import SnippetInfo from "./SnippetInfo.vue";
import localeCompare from "../../../shared/js/utils/localeCompare";
import openlayerFunctions from "../utils/openlayerFunctions.js";
import layerFactory from "../../../core/layers/js/layerFactory";
import layerCollection from "../../../core/layers/js/layerCollection";
import mutations from "../store/mutationsFilter";

/**
* Snippet Dropdown
* @module modules/SnippetDropdown
* @vue-prop {Object} api - The api.
* @vue-prop {String} attrName - The title and aria label.
* @vue-prop {Array} addSelectAll - (??).
* @vue-prop {Array} adjustment - The changes made by other snippets that change settings in this snippet. E.g. one snippet changes to "Grundschulen" and other snippets change their min value as a result of the adjustment.
* @vue-prop {Boolean} adjustOnlyFromParent - adjust only from parent snippet.
* @vue-prop {Boolean} allowEmptySelection - allows to remove all selected values.
* @vue-prop {Boolean} autoInit - Shows if automatic initilization is enabled.
* @vue-prop {Array} localeCompareParams - (???).
* @vue-prop {String} delimiter - (???).
* @vue-prop {Boolean} disabled - Shows if snippet is disabled.
* @vue-prop {String} display - Sets which dates should be displayed.
* @vue-prop {Number} filterId - The filter's id.
* @vue-prop {Boolean} hideSelected - Whether the selected item should be hidden in the dropdown list.
* @vue-prop {Array} info - The information for the SnippetInfo.
* @vue-prop {Boolean} isChild - Shows if element is child element.
* @vue-prop {Boolean} isParent - Shows if element is parent element.
* @vue-prop {Array} title - The label.
* @vue-prop {String} layerId - The layer's id.
* @vue-prop {Boolean} multiselect - Shows if multiselect is enabled.
* @vue-prop {String} operator - (???).
* @vue-prop {Number} optionsLimit - The limit for multiselect options.
* @vue-prop {String} placeholder - The placeholder for the multiselect.
* @vue-prop {String} prechecked - (???).
* @vue-prop {Array} renderIcons - The icons to be rendered from the legend.
* @vue-prop {Array} fixedRules - List of fixed rules.
* @vue-prop {Number} snippetId - The snippet's id.
* @vue-prop {Boolean} showAllValues - Shows if all values should be displayed.
* @vue-prop {String} value - The value for a date.
* @vue-prop {Boolean} visible - Shows if snippet is visible.
*
* @vue-data {Boolean} disable - Shows if snippet is disabled.
* @vue-data {Boolean} isInitializing - Shows if snippet is initializing.
* @vue-data {Boolean} isAdjusting - Shows if snippet is adjusting.
* @vue-data {Array} dropdownValue - The list of values for the dropdown.
* @vue-data {Array} dropdownSelected - The list of values selected.
* @vue-data {Object} styleModel - The style model.
* @vue-data {Array} legendsInfo - The list of information from the legend.
* @vue-data {Object} iconList - The icons from the legend.
* @vue-data {Boolean} allSelected - Shows if everything is selected.
* @vue-data {String} translationKey - The translation key.
* @vue-data {Array} operatorWhitelist - The operator white list.
* @vue-data {String} source - The source for the input data.
* @vue-data {Boolean} allValues - (???)
*
* @vue-event {Object} changeRule - Emits the current rule to whoever is listening.
* @vue-event {Number} deleteRule - Emits the delete rule function to whoever is listening.
* @vue-event {*} setSnippetPrechecked - Emits the setSnippetPrechecked event.
*/
export default {
    name: "SnippetDropdown",
    components: {
        Multiselect,
        SnippetInfo
    },
    props: {
        api: {
            type: Object,
            required: false,
            default: null
        },
        attrName: {
            type: [String, Array],
            required: false,
            default: ""
        },
        addSelectAll: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        adjustment: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        adjustOnlyFromParent: {
            type: Boolean,
            required: false,
            default: false
        },
        allowEmptySelection: {
            type: Boolean,
            required: false,
            default: true
        },
        autoInit: {
            type: Boolean,
            required: false,
            default: true
        },
        localeCompareParams: {
            type: [String, Object],
            required: false,
            default: undefined
        },
        delimiter: {
            type: String,
            required: false,
            default: undefined
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        display: {
            type: String,
            required: false,
            default: "default"
        },
        filterId: {
            type: Number,
            required: false,
            default: 0
        },
        filterGeometry: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        filterGeometryName: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        hideSelected: {
            type: Boolean,
            required: false,
            default: true
        },
        info: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        isChild: {
            type: Boolean,
            required: false,
            default: false
        },
        isParent: {
            type: Boolean,
            required: false,
            default: false
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        layerId: {
            type: String,
            required: false,
            default: undefined
        },
        multiselect: {
            type: Boolean,
            required: false,
            default: false
        },
        operatorForAttrName: {
            type: String,
            required: false,
            default: "AND"
        },
        operator: {
            type: String,
            required: false,
            default: undefined
        },
        optionsLimit: {
            type: Number,
            required: false,
            default: 20000
        },
        placeholder: {
            type: String,
            required: false,
            default: ""
        },
        prechecked: {
            type: [Array, String],
            required: false,
            default: undefined
        },
        renderIcons: {
            type: [String, Object],
            required: false,
            default: undefined
        },
        fixedRules: {
            type: Array,
            required: false,
            default: () => {
                return [];
            }
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        showAllValues: {
            type: Boolean,
            required: false,
            default: false
        },
        value: {
            type: Array,
            required: false,
            default: undefined
        },
        visible: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    emits: ["changeRule", "deleteRule", "setSnippetPrechecked"],
    data () {
        return {
            disable: true,
            isInitializing: true,
            isAdjusting: false,
            dropdownValue: [],
            dropdownSelected: [],
            styleModel: {},
            legendsInfo: [],
            iconList: {},
            allSelected: false,
            translationKey: "snippetDropdown",
            operatorWhitelist: [
                "EQ",
                "IN",
                "STARTSWITH",
                "ENDSWITH"
            ],
            source: "",
            allValues: false,
            noChangeCounter: 0
        };
    },
    computed: {
        ...mapGetters("Modules/Filter", ["preventAdjust"]),
        ariaLabelDropdown () {
            return this.$t("common:modules.filter.ariaLabel.dropdown", {param: this.attrName});
        },
        ariaLabelRadio () {
            return this.$t("common:modules.filter.ariaLabel.radio", {param: this.attrName});
        },
        ariaLabelCheckbox () {
            return this.$t("common:modules.filter.ariaLabel.checkbox", {param: this.attrName});
        },
        titleText () {
            if (this.title === true) {
                return this.attrName;
            }
            else if (typeof this.title === "string") {
                return this.translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        emptyList () {
            return this.$t("common:modules.filter.dropdown.emptyList");
        },
        noElements () {
            return this.$t("common:modules.filter.dropdown.noElements");
        },
        dropdownValueComputed () {
            let dropdownValue = [];

            if (!Array.isArray(this.value)) {
                if (Array.isArray(this.dropdownValue)) {
                    dropdownValue = [...this.dropdownValue];
                }
                dropdownValue.sort((a, b) => {
                    if (typeof this.localeCompareParams === "string") {
                        return localeCompare(a, b, this.localeCompareParams);
                    }
                    else if (isObject(this.localeCompareParams)) {
                        return localeCompare(a, b, this.localeCompareParams.locale, this.localeCompareParams.options);
                    }
                    return localeCompare(a, b);
                });
            }
            else {
                this.value.forEach(key => {
                    if (this.dropdownValue.includes(key)) {
                        dropdownValue.push(key);
                    }
                });
            }

            if (this.multiselect && this.addSelectAll) {
                return [{
                    selectAllTitle: this.selectAllTitle,
                    list: dropdownValue
                }];
            }
            return dropdownValue;
        },
        selectAllTitle () {
            return !this.allSelected ? this.$t("common:modules.filter.dropdown.selectAll") : this.$t("common:modules.filter.dropdown.deselectAll");
        },
        securedOperator () {
            if (!this.operatorWhitelist.includes(this.operator)) {
                return getDefaultOperatorBySnippetType("dropdown", typeof this.delimiter === "string" && this.delimiter);
            }
            return this.operator;
        }
    },
    watch: {
        dropdownSelected: {
            handler (value, oldValue) {
                const prechecked = this.getPrecheckedExistingInValue(this.prechecked, this.dropdownValue);

                if (
                    !this.isAdjusting
                    && (
                        !this.isInitializing
                        || this.isInitializing && (
                            Array.isArray(prechecked)
                            && prechecked.length
                            || this.prechecked === "all"
                        )
                    )
                ) {
                    if (typeof value === "string" && value || Array.isArray(value) && value.length) {
                        if (value?.toString() === oldValue?.toString()) {
                            this.noChangeCounter++;
                        }
                        else {
                            this.noChangeCounter = 0;
                        }
                        if (this.isChild && this.noChangeCounter >= 2) {
                            this.dropdownValue = value;
                        }
                        else {
                            this.emitCurrentRule(value, this.isInitializing && this.allowEmptySelection);
                        }
                    }
                    else if (Array.isArray(value) && !value.length && this.source !== "adjust") {
                        this.deleteCurrentRule();
                    }

                    if (!this.isParent && !this.adjustOnlyFromParent) {
                        this.setPreventAdjust(true);
                    }
                    else {
                        this.setPreventAdjust(false);
                    }
                }
                else if (this.adjustOnlyFromParent) {
                    this.setPreventAdjust(false);
                }
                this.allSelected = this.dropdownValue.length !== 0 && Array.isArray(this.dropdownSelected) && this.dropdownValue.length === this.dropdownSelected.length;
            },
            deep: true
        },
        adjustment (adjusting) {
            if (!isObject(adjusting) || this.visible === false || this.isParent || (this.adjustOnlyFromParent && this.preventAdjust)) {
                return;
            }
            this.$nextTick(() => {
                if (adjusting?.start) {
                    if (this.snippetId !== adjusting.snippetId && (!Array.isArray(adjusting.snippetId) || !adjusting.snippetId.includes(this.snippetId))) {
                        this.dropdownValue = [];
                    }
                    this.isAdjusting = true;
                }

                this.addDropdownValueForAdjustment(this.dropdownValue, this.value, adjusting?.adjust?.value, this.delimiter);

                if (adjusting?.finish) {
                    if (Array.isArray(this.allValues)) {
                        if (Array.isArray(adjusting?.adjust?.value)) {
                            adjusting.adjust.value.forEach(adjustedValue => {
                                if (!this.allValues.includes(adjustedValue)) {
                                    this.allValues.push(adjustedValue);
                                }
                            });
                        }
                        this.allValues.forEach(value => {
                            if (!this.dropdownValue.includes(value)) {
                                this.dropdownValue.push(value);
                            }
                        });
                    }
                    this.setDropdownSelectedAfterAdjustment(this.dropdownValue, this.dropdownSelected, selected => {
                        this.setCurrentSource("adjust");
                        this.dropdownSelected = selected;
                    });

                    this.$nextTick(() => {
                        this.isAdjusting = false;

                        if (this.delayedPrechecked === "all") {
                            this.dropdownSelected = this.dropdownValue;
                            this.delayedPrechecked = false;
                        }
                        else if (Array.isArray(this.delayedPrechecked) && this.delayedPrechecked.length) {
                            this.dropdownSelected = this.getPrecheckedExistingInValue(this.delayedPrechecked, this.dropdownValue);
                            this.delayedPrechecked = false;
                        }
                    });
                }
            });
        },
        disabled (value) {
            this.disable = typeof value === "boolean" ? value : true;
        },
        legendsInfo: {
            handler (value) {
                if (this.renderIcons === "fromLegend") {
                    this.iconList = getIconListFromLegendModule.getIconListFromLegend(value, this.styleModel);
                }
            },
            deep: true
        }
    },
    created () {
        this.delayedPrechecked = false;
    },
    mounted () {
        this.$nextTick(() => {
            this.initializeIcons();

            if (!this.visible) {
                this.dropdownValue = Array.isArray(this.prechecked) ? this.prechecked : [];
                this.dropdownSelected = this.getInitialDropdownSelected(this.prechecked, this.dropdownValue, this.multiselect);
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                    this.emitSnippetPrechecked();
                });
            }
            else if (Array.isArray(this.value)) {
                this.dropdownValue = this.value;
                this.dropdownSelected = this.getInitialDropdownSelected(this.prechecked, this.dropdownValue, this.multiselect);
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                    this.emitSnippetPrechecked(this.prechecked, this.snippetId, this.visible);
                });
            }
            else if (this.api && this.autoInit !== false) {
                this.$nextTick(() => {
                    this.api.getUniqueValues(this.attrName, list => {
                        this.$nextTick(() => {
                            this.dropdownValue = this.splitListWithDelimiter(list, this.delimiter);
                            this.dropdownSelected = this.getInitialDropdownSelected(this.prechecked, this.dropdownValue, this.multiselect);
                            this.$nextTick(() => {
                                this.isInitializing = false;
                                this.disable = false;
                                this.emitSnippetPrechecked(this.prechecked, this.snippetId, this.visible);
                                if (this.showAllValues && this.prechecked === "all") {
                                    this.allValues = this.dropdownSelected;
                                }
                            });
                        });
                    }, error => {
                        this.disable = false;
                        this.isInitializing = false;
                        this.emitSnippetPrechecked();
                        console.warn(error);
                    }, {rules: this.fixedRules, filterId: this.filterId, commands: {
                        filterGeometry: this.filterGeometry,
                        geometryName: this.filterGeometryName
                    }});
                });
            }
            else {
                this.dropdownValue = [];
                this.dropdownSelected = [];
                if (this.isChild && (Array.isArray(this.prechecked) && this.prechecked.length || this.prechecked === "all")) {
                    this.delayedPrechecked = this.prechecked;
                }
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                    this.emitSnippetPrechecked(this.prechecked, this.snippetId, this.visible);
                });
            }
        });
    },
    methods: {
        ...mapMutations("Modules/Filter", Object.keys(mutations)),
        ...mapActions("Maps", ["areLayerFeaturesLoaded", "addLayer"]),
        translateKeyWithPlausibilityCheck,
        splitListWithDelimiter,

        /**
         * Resets the values of this snippet.
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetSnippet (onsuccess) {
            this.isAdjusting = true;
            this.setCurrentSource("init");
            this.dropdownSelected = [];
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
                this.isAdjusting = false;
            });
        },
        /**
         * Emits the setSnippetPrechecked event.
         * @param {String[]|String} prechecked The prechecked values.
         * @param {Number} snippetId The snippet id to emit.
         * @param {Boolean} visible true if the snippet is visible, false if not.
         * @returns {void}
         */
        emitSnippetPrechecked (prechecked, snippetId, visible) {
            this.$emit("setSnippetPrechecked", visible && (Array.isArray(prechecked) && prechecked.length || prechecked === "all") ? snippetId : false);
        },
        /**
         * Returns the selected values based on prechecked.
         * @param {String[]|String} prechecked An array of prechecked values or the "all"-flag to select all.
         * @param {String[]} dropdownValue All available values.
         * @param {Boolean} multiselect true if multiselect is activated, false if not.
         * @returns {String[]} A list of preselected values.
         */
        getInitialDropdownSelected (prechecked, dropdownValue, multiselect) {
            if (!Array.isArray(dropdownValue)) {
                return [];
            }
            else if (Array.isArray(prechecked)) {
                return this.getPrecheckedExistingInValue(prechecked, dropdownValue);
            }
            else if (prechecked === "all" && multiselect) {
                return [...dropdownValue];
            }
            return [];
        },
        /**
         * Returns a list of prechecked values that exists in the given dropdown value.
         * @param {String[]|String} prechecked An array of prechecked values or the "all"-flag to select all.
         * @param {String[]} dropdownValue All available values.
         * @returns {String[]} A list of preselected values that exists in dropdown value.
         */
        getPrecheckedExistingInValue (prechecked, dropdownValue) {
            if (!Array.isArray(prechecked) || !Array.isArray(dropdownValue)) {
                return false;
            }
            const result = [],
                dropdownValueAssoc = {};

            dropdownValue.forEach(value => {
                dropdownValueAssoc[value] = true;
            });
            prechecked.forEach(value => {
                if (!Object.prototype.hasOwnProperty.call(dropdownValueAssoc, value)) {
                    return;
                }
                result.push(value);
            });
            return result;
        },
        /**
         * Initializes the icons if any.
         * @returns {void}
         */
        initializeIcons () {
            if (this.renderIcons === "fromLegend") {
                const layerConfig = openlayerFunctions.getLayerByLayerId(this.layerId);

                this.styleModel = getIconListFromLegendModule.getStyleModel(this.layerId);
                if (!layerCollection.getLayerById(this.layerId) && ["WFS", "OAF", "GeoJSON"].includes(layerConfig.typ)) {
                    const layer = layerFactory.createLayer(layerConfig);

                    if (mapCollection.getMap("2D").getLayers().getArray().find(aLayer => aLayer.get("id") === this.layerId) === undefined) {
                        this.addLayer(layer.getLayer());
                    }
                    else {
                        layer.getLayer().setVisible(true);
                    }
                    this.areLayerFeaturesLoaded(this.layerId).then(() => {
                        this.getLegendByStyleId(layer.get("styleId"), layer.getLayer(), () => {
                            layer.getLayer().setVisible(false);
                        });
                    });
                }
                else {
                    this.getLegendByStyleId(this.layerId);
                }
            }
            else if (isObject(this.renderIcons)) {
                this.iconList = this.renderIcons;
            }
        },
        /**
         * Returns the legend by styleId and sets it at data legendsInfo.
         * @param {String} styleId the styleId
         * @param {ol/layer} olLayer the openLayers layer
         * @param {Function} callback to execute after elegnd has returned
         * @returns {Array} the legend information
         */
        getLegendByStyleId (styleId, olLayer, callback) {
            createStyle.returnLegendByStyleId(styleId).then(legendInfos => {
                if (!this.styleModel || !legendInfos.legendInformation || !Array.isArray(legendInfos.legendInformation)) {
                    this.legendsInfo = [];
                }
                else {
                    this.legendsInfo = legendInfos.legendInformation;
                }
                if (callback) {
                    return callback(olLayer);
                }
                return this.legendsInfo;
            });
        },
        /**
         * Returns true if an icon path exists for the given value.
         * @param {String} value the value to check for
         * @returns {Boolean} true if there is an icon path, false if not
         */
        iconExists (value) {
            return Object.prototype.hasOwnProperty.call(this.iconList, value);
        },
        /**
         * Returns true if there are any icons to show.
         * @returns {Boolean} true if there are any icons, false if not
         */
        anyIconExists () {
            return Object.keys(this.iconList).length > 0;
        },
        /**
         * Returns the title to use in the gui.
         * @returns {String} the title to use
         */
        getTitle () {
            return this.title || this.attrName;
        },
        /**
         * Returns the computed dropdown value to display in the list.
         * @returns {String[]} An array of value to display.
         */
        getDropdownValueForList () {
            const dropdownValue = this.dropdownValueComputed;

            if (!Array.isArray(dropdownValue) || !dropdownValue.length) {
                return [];
            }
            else if (isObject(dropdownValue[0])) {
                return Array.isArray(dropdownValue[0].list) ? dropdownValue[0].list : [];
            }
            return dropdownValue;
        },
        /**
         * Emits the current rule to whoever is listening.
         * @param {*} value the value to put into the rule
         * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
         * @returns {void}
         */
        emitCurrentRule (value, startup = false) {
            let result = [];

            if (typeof value === "string") {
                result = value;
            }
            else if (Array.isArray(value)) {
                value.forEach(obj => {
                    if (typeof obj === "string") {
                        result.push(obj);
                    }
                    else if (isObject(obj) && obj.title) {
                        result.push(obj.title);
                    }
                });
            }
            this.$emit("changeRule", {
                snippetId: this.snippetId,
                startup,
                fixed: !this.visible,
                attrName: this.attrName,
                operatorForAttrName: this.operatorForAttrName,
                operator: this.securedOperator,
                delimiter: this.delimiter,
                value: result
            });
        },
        /**
         * Emits the delete rule function to whoever is listening.
         * @returns {void}
         */
        deleteCurrentRule () {
            this.$emit("deleteRule", this.snippetId);
        },
        /**
         * Select all items
         * @returns {void}
         */
        selectAll () {
            this.dropdownSelected = [...this.dropdownValue];
        },
        /**
         * Deselect all items
         * @returns {void}
         */
        deselectAll () {
            this.dropdownSelected = [];
        },
        /**
         * Adds a set of new value to dropdownValue.
         * @param {String[]} dropdownValue the current dropdownValue to adjust
         * @param {String[]} configValue the value set by configuration, if any
         * @param {String[]} adjustmentValue the value to adjust dropdownValue with
         * @param {String} [delimiter=false] the delimiter to use, false if not set
         * @returns {void}
         */
        addDropdownValueForAdjustment (dropdownValue, configValue, adjustmentValue, delimiter = false) {
            if (!Array.isArray(dropdownValue) || !Array.isArray(adjustmentValue)) {
                return;
            }
            const dropdownValueAssoc = {},
                configValueAssoc = {};

            dropdownValue.forEach(value => {
                dropdownValueAssoc[value] = true;
            });
            if (Array.isArray(configValue)) {
                configValue.forEach(value => {
                    configValueAssoc[value] = true;
                });
            }

            adjustmentValue.forEach(value => {
                if (delimiter && typeof value === "string" && value.indexOf(delimiter)) {
                    this.addDropdownValueForAdjustment(dropdownValue, configValue, value.split(delimiter), false);
                }
                else if (!dropdownValueAssoc[value] && (!Array.isArray(configValue) || Array.isArray(configValue) && configValueAssoc[value])) {
                    dropdownValueAssoc[value] = true;
                    this.dropdownValue.push(value);
                }
            });
        },
        /**
         * Setter by callback for dropdownSelected.
         * @param {String[]} dropdownValue the current dropdownValue with available data
         * @param {String[]} dropdownSelected all selected value from before the adjustment
         * @param {Function} setDropdownSelected a callback function(selected) to set dropdownSelected with
         * @returns {void}
         */
        setDropdownSelectedAfterAdjustment (dropdownValue, dropdownSelected, setDropdownSelected) {
            const selected = typeof dropdownSelected === "string" ? [dropdownSelected] : dropdownSelected,
                result = [],
                dropdownSelectedAssoc = {};

            if (typeof setDropdownSelected !== "function") {
                return;
            }
            else if (!Array.isArray(dropdownValue) || !Array.isArray(selected)) {
                setDropdownSelected([]);
                return;
            }

            selected.forEach(value => {
                dropdownSelectedAssoc[value] = true;
            });
            dropdownValue.forEach(value => {
                if (dropdownSelectedAssoc[value]) {
                    result.push(value);
                }
            });

            setDropdownSelected(result);
        },
        /**
         * Sets the current source for input data.
         * @param {String} source The type of source 'adjust' and 'dropdown'.
         * @returns {void}
         */
        setCurrentSource (source) {
            if (typeof source !== "string") {
                return;
            }
            this.source = source;
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetDropdownContainer"
    >
        <div
            v-if="info"
            class="right"
        >
            <SnippetInfo
                :info="info"
                :translation-key="translationKey"
            />
        </div>
        <div
            v-if="display === 'default'"
            class="snippetDefaultContainer"
        >
            <div
                v-if="title !== false"
                class="left"
            >
                <label
                    class="select-box-label"
                    :for="'snippetSelectBox-' + snippetId"
                >{{ titleText }}</label>
            </div>
            <div
                ref="selectBoxContainer"
                class="filter-select-box-container"
            >
                <Multiselect
                    :id="'snippetSelectBox-' + snippetId"
                    v-model="dropdownSelected"
                    :aria-label="ariaLabelDropdown"
                    :options="dropdownValueComputed"
                    name="select-box"
                    :disabled="disable"
                    :multiple="multiselect"
                    :placeholder="placeholder"
                    :show-labels="false"
                    open-direction="auto"
                    :options-limit="optionsLimit"
                    :hide-selected="hideSelected"
                    :allow-empty="allowEmptySelection"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :loading="disable"
                    :group-select="multiselect && addSelectAll"
                    :group-values="(multiselect && addSelectAll) ? 'list' : ''"
                    :group-label="(multiselect && addSelectAll) ? 'selectAllTitle' : ''"
                    @remove="setCurrentSource('dropdown')"
                >
                    <template #caret>
                        <div
                            class="multiselect__select"
                        >
                            <i class="bi bi-chevron-down" />
                        </div>
                    </template>

                    <template #noOptions>
                        <span>
                            {{ emptyList }}
                        </span>
                    </template>
                    <template #noResult>
                        <span>
                            {{ noElements }}
                        </span>
                    </template>
                </Multiselect>
            </div>
        </div>
        <div
            v-if="display === 'list'"
            class="snippetListContainer"
        >
            <div class="grid-container">
                <div
                    class="grid-item"
                >
                    {{ titleText }}
                </div>
                <div
                    v-if="multiselect && addSelectAll"
                    class="grid-item"
                >
                    <a
                        href="#"
                        class="link-dark"
                        @click="!allSelected ? selectAll() : deselectAll()"
                    >
                        {{ selectAllTitle }}
                    </a>
                </div>
                <div
                    v-for="val in getDropdownValueForList()"
                    :key="snippetId + '-' + val"
                    class="grid-item"
                >
                    <span
                        v-if="anyIconExists()"
                        class="subItem"
                    >
                        <label
                            :for="'snippetRadioCheckbox-' + snippetId + '-' + val"
                        >
                            <img
                                v-show="iconExists(val)"
                                class="snippetListContainerIcon"
                                :src="iconList[val]"
                                :alt="val"
                            >
                        </label>
                    </span>
                    <span
                        class="subItem"
                    >
                        <input
                            v-if="multiselect"
                            :id="'snippetRadioCheckbox-' + snippetId + '-' + val"
                            v-model="dropdownSelected"
                            :aria-label="ariaLabelCheckbox"
                            class="checkbox"
                            :disabled="disable"
                            type="checkbox"
                            :value="val"
                            tabindex="0"
                            @click="setCurrentSource('dropdown')"
                        >
                        <input
                            v-else
                            :id="'snippetRadioCheckbox-' + snippetId + '-' + val"
                            v-model="dropdownSelected[0]"
                            :aria-label="ariaLabelRadio"
                            class="radio"
                            :disabled="disable"
                            type="radio"
                            :value="val"
                            tabindex="0"
                            @click="setCurrentSource('dropdown')"
                        >
                    </span>
                    <span
                        class="subItem"
                    >
                        <label
                            class="check-box-label"
                            :for="'snippetRadioCheckbox-' + snippetId + '-' + val"
                        >{{ val }}</label>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style lang="scss">
    @import "~variables";
    .filter-select-box-container .multiselect, .filter-select-box-container .multiselect__input, .filter-select-box-container .multiselect__single {
        font-family: inherit;
        font-size: $font-size-base;
    }
    .filter-select-box-container .multiselect .multiselect__spinner:after, .multiselect__spinner:before {
        position: absolute;
        content: "";
        top: 50%;
        left: 50%;
        margin: 0px 0 0 0px;
        width: 16px;
        height: 16px;
        border-radius: 100%;
        border: 2px solid transparent;
        border-top-color: $dark_grey;
        box-shadow: 0 0 0 1px transparent;
    }
    .filter-select-box-container .multiselect:focus-within {
        border: 1px solid $form-check-input-checked-bg-color;
    }
    .filter-select-box-container .multiselect .multiselect__option {
        display: block;
        min-height: 16px;
        line-height: 8px;
        text-decoration: none;
        text-transform: none;
        position: relative;
        cursor: pointer;
        white-space: nowrap;
        padding: 10px 12px;
    }
    .filter-select-box-container .multiselect .multiselect__option--highlight {
        background: $secondary;
        outline: none;
        color: $white;
    }
    .filter-select-box-container .multiselect .option__image {
        width: 22px;
    }
    .filter-select-box-container .multiselect .multiselect__tag {
        position: relative;
        display: inline-block;
        padding: 4px 26px 4px 10px;
        border-radius: 10px;
        margin-right: 15px;
        color: $white;
        line-height: 1;
        background: $secondary;
        margin-bottom: 5px;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
    }
    .filter-select-box-container .multiselect .multiselect__tags:focus-within {
        border-color: $light_blue;
        outline: 0;
    }
    .filter-select-box-container .multiselect .multiselect__option--highlight:after {
        content: attr(data-select);
        background: $light_blue;
        color: $white;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon::after {
        content: "\D7";
        color: $light_grey;
        font-size: $font_size_big;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon:hover {
        background: $light_blue;
    }
    .filter-select-box-container .multiselect .multiselect__placeholder {
        color: $light_grey;
        display: inline-block;
        margin-bottom: 0;
        padding-top: 0;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon:focus, .multiselect__tag-icon:hover {
        background: $light_grey;
    }
    .filter-select-box-container .multiselect__select {
        transform: none;
    }
    .filter-select-box-container .multiselect__select::before {
        top: 64%;
        content: none;
    }
    .filter-select-box-container .multiselect__select i {
        color: #000000;
        font-size: $font_size_sm;
        -webkit-text-stroke: 1px;
        display: inline-block;
        padding-top: 60%;
    }
    .filter-select-box-container .multiselect--active {
        color: $black;
        background-color: $white;
        border-color: $light_blue;
        border-radius: 5px;
        outline: 0;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 0 0.25rem rgba(13, 110, 253, 0.05);
    }
    .filter-select-box-container .multiselect .multiselect__tags {
        min-height: 40px;
        font-size: $font-size-base;
        line-height: 40px;
        color: $dark_grey;
        background-color: $white;
        background-image: none;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
        transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
    }
    .multiselect__option--selected {
        font-family: $font_family_accent;
        background-color: $primary;
    }
    .multiselect__input, .multiselect__single {
        margin-bottom: 0px;
        line-height: inherit;
    }
</style>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";
    .snippetListContainer .check-box-label {
        margin: 0;
    }
    .snippetListContainer .subItem {
        padding: 0 5px 0 0;
        vertical-align: text-bottom;
    }
    .snippetListContainer .grid-container {
        display: grid;
        grid-template-columns: auto;
        padding: 5px;
    }
    .snippetListContainer .grid-item {
        padding: 5px;
        text-align: left;
    }
    .snippetListContainer .grid-container > div {
        text-align: left;
        padding: 5px 0;
    }
    select {
        box-sizing: border-box;
        outline: 0;
        position: relative;
        width: 100%;
        margin-bottom: 5px;
    }
    .disabled {
        border-color: $light_grey;
        background-color: $white;
    }
    .enabled {
        border-color: initial;
        background-color: initial;
    }
    .snippetDropdownContainer {
        height: auto;
    }
    .snippetDropdownContainer .radio, .snippetDropdownContainer .checkbox {
        display: inline-block;
    }
    .snippetDropdownContainer label {
        margin-bottom: 0;
    }
    .snippetListContainer .snippetListContainerIcon {
        width: 25px;
    }
    .snippetDropdownContainer select {
        clear: left;
        width: 100%;
    }
    .snippetDropdownContainer .bottom {
        clear: left;
        width: 100%;
    }
    .panel .snippetDropdownContainer .right, .snippetDropdownContainer .right {
        position: absolute;
        right: 0;
    }
</style>
