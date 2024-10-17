<script>
import {mapGetters, mapMutations} from "vuex";
import ProgressBar from "./ProgressBar.vue";
import SnippetCheckbox from "./SnippetCheckbox.vue";
import SnippetCheckboxFilterInMapExtent from "./SnippetCheckboxFilterInMapExtent.vue";
import SnippetDate from "./SnippetDate.vue";
import SnippetDateRange from "./SnippetDateRange.vue";
import SnippetDropdown from "./SnippetDropdown.vue";
import SnippetInput from "./SnippetInput.vue";
import SnippetSlider from "./SnippetSlider.vue";
import SnippetSliderRange from "./SnippetSliderRange.vue";
import SnippetTag from "./SnippetTag.vue";
import SnippetFeatureInfo from "./SnippetFeatureInfo.vue";
import SnippetChart from "./SnippetChart.vue";
import SnippetDownload from "./SnippetDownload.vue";
import isObject from "../../../shared/js/utils/isObject";
import FilterApi from "../js/interfaces/filter.api.js";
import MapHandler from "../utils/mapHandler.js";
import {compileSnippets} from "../utils/compileSnippets.js";
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import {getSnippetAdjustments} from "../utils/getSnippetAdjustments.js";
import openlayerFunctions from "../utils/openlayerFunctions";
import {isRule} from "../utils/isRule.js";
import {hasUnfixedRules} from "../utils/hasUnfixedRules.js";
import VectorTileLayer from "ol/layer/VectorTile";
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";

/**
 * Layer Filter Snippet
 * @module modules/LayerFilterSnippet
 * @vue-prop {FilterApi} api - The Filter API.
 * @vue-prop {Object} LayerConfig - The layer configuration.
 * @vue-prop {MapHandler} mapHandler - The map handler.
 * @vue-prop {Boolean} liveZoomToFeatures - Shows if zooming to feature is enabled.
 * @vue-prop {Number} minScale - The minimal scale.
 * @vue-prop {Array} filterRules - The filter rules.
 * @vue-prop {Array} filterHits - The filter hits.
 * @vue-prop {Array} filterGeometry - The filter geometry.
 * @vue-prop {Boolean} isLayerFilterSelected - Shows if the layer filter is selected.
 *
 * @vue-event {Object} updateFilterHits - Emit update of filter hits.
 * @vue-event {Object} updateRules - Emit update of filter rules.
 * @vue-event {Object} deleteAllRules - Emit delete all rules.
 *
 * @vue-data {Object} paging - The page and the page total.
 * @vue-data {Boolean} disabled - Shows if it is disabled.
 * @vue-data {Boolean} showStop - Shows if terminate button is visible.
 * @vue-data {Boolean} searchInMapExtent - Shows if search in map extend is enabled.
 * @vue-data {Array} snippets - Array of all the snippets.
 * @vue-data {String} postSnippetKey - The post snippet key.
 * @vue-data {Boolean} autoRefreshSet - Shows if auto refresh is set.
 * @vue-data {Boolean} isRefreshing - Shows if it is refreshing.
 * @vue-data {Boolean} amountOfFilteredItems - Shows ???
 * @vue-data {Array} precheckedSnippets - Array of prechecked snippets.
 * @vue-data {Array} filteredItems - Array of filtered items.
 * @vue-data {Boolean} isLockedHandleActiveStrategy - Shows if active strategy handling is locked.
 * @vue-data {Boolean} filterButtonDisabled - Shows if filter button is disabled.
 *
 * @vue-computed {String} labelFilterButton - The label for the filter button.
 * @vue-computed {String} snippetTagsResetAllText - The text for the reset tags.
 * @vue-computed {Object} fixedRules - The fixed rules.
 */
export default {
    name: "LayerFilterSnippet",
    components: {
        SnippetCheckbox,
        SnippetCheckboxFilterInMapExtent,
        SnippetDate,
        SnippetDateRange,
        SnippetDropdown,
        SnippetInput,
        SnippetSlider,
        SnippetSliderRange,
        SnippetTag,
        SnippetFeatureInfo,
        SnippetChart,
        SnippetDownload,
        ProgressBar,
        AccordionItem
    },
    props: {
        api: {
            type: FilterApi,
            required: false,
            default: undefined
        },
        layerConfig: {
            type: Object,
            required: true
        },
        layerSelectorVisible: {
            type: Boolean,
            required: true
        },
        mapHandler: {
            type: MapHandler,
            required: false,
            default: undefined
        },
        liveZoomToFeatures: {
            type: Boolean,
            required: false,
            default: false
        },
        minScale: {
            type: Number,
            required: false,
            default: 0
        },
        filterRules: {
            type: Array,
            required: false,
            default: () => []
        },
        filterHits: {
            type: [Number, Boolean],
            required: false,
            default: undefined
        },
        filterGeometry: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        isLayerFilterSelected: {
            type: [Function, Boolean],
            required: false,
            default: false
        },
        openMultipleAccordeons: {
            type: Boolean,
            required: false,
            default: true
        },
        closeGfi: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    emits: ["registerMapMoveListener", "updateFilterHits", "updateRules", "deleteAllRules"],
    data () {
        return {
            paging: {
                page: 0,
                total: 0
            },
            disabled: false,
            showStop: false,
            searchInMapExtent: false,
            snippets: [],
            postSnippetKey: "",
            autoRefreshSet: false,
            isRefreshing: false,
            amountOfFilteredItems: false,
            precheckedSnippets: [],
            filteredItems: [],
            isLockedHandleActiveStrategy: false,
            filterButtonDisabled: false,
            isLoading: false,
            outOfZoom: false,
            gfiFirstActive: false,
            visibleSnippet: false
        };
    },
    computed: {
        ...mapGetters("Maps", ["scale"]),
        labelFilterButton () {
            if (typeof this.layerConfig.labelFilterButton === "string") {
                return translateKeyWithPlausibilityCheck(this.layerConfig.labelFilterButton, key => this.$t(key));
            }
            return this.$t("common:modules.filter.filterButton");
        },
        snippetTagsResetAllText () {
            return this.$t("common:modules.filter.snippetTags.resetAll");
        },
        fixedRules () {
            return this.filterRules.filter(rule => rule?.fixed);
        }
    },
    watch: {
        filterRules: {
            handler (rules) {
                if (this.isStrategyActive()) {
                    return;
                }
                if (this.hasUnfixedRules(rules)) {
                    this.enableFilterButton();
                    return;
                }
                if (this.layerConfig?.filterButtonDisabled === true) {
                    this.disableFilterButton();
                }
            },
            deep: true
        },
        paging (val) {
            if (val.page >= val.total) {
                this.setFormDisable(false);
                if (!this.isRefreshing && !this.getSearchInMapExtent() && this.liveZoomToFeatures) {
                    if (this.filterGeometry) {
                        this.mapHandler.zoomToGeometry(this.filterGeometry, this.minScale, error => {
                            console.warn(error);
                        });
                    }
                    else {
                        this.mapHandler.zoomToFilteredFeature(this.layerConfig?.filterId, this.minScale, error => {
                            console.warn(error);
                        });
                    }
                }
                this.isRefreshing = false;
            }
        },
        precheckedSnippets: {
            handler (val) {
                if (this.isStrategyActive() && val.length === this.snippets.length) {
                    const snippetIds = [];

                    val.forEach(value => {
                        if (value !== false) {
                            snippetIds.push(value);
                        }
                    });

                    if (snippetIds.length) {
                        this.handleActiveStrategy(snippetIds);
                    }
                }
            },
            deep: true
        },
        amountOfFilteredItems (val) {
            if (this.isStrategyActive()) {
                return;
            }
            let amount = val;

            if (typeof val !== "number") {
                amount = false;
            }
            this.$emit("updateFilterHits", {
                filterId: this.layerConfig?.filterId,
                hits: amount
            });
        },
        filterGeometry () {
            if (this.isLayerFilterSelected === true) {
                this.handleActiveStrategy();
            }
        },
        outOfZoom: {
            handler (val) {
                this.setIsLoading(!val);
            },
            immediate: true
        }
    },
    created () {
        const filterId = this.layerConfig.filterId,
            layerId = this.getLayerId(filterId, this.layerConfig?.layerId, this.layerConfig?.service?.layerId);

        if (this.api instanceof FilterApi && this.mapHandler instanceof MapHandler) {
            this.mapHandler.initializeLayer(filterId, layerId, this.isExtern(), error => {
                console.warn(error);
            });
            this.$nextTick(() => {
                this.api.setServiceByLayerModel(layerId, this.mapHandler.getLayerModelByFilterId(filterId), this.isExtern(), error => {
                    console.warn(error);
                });
            });

            this.$nextTick(() => {
                if (!this.mapHandler.getLayerModelByFilterId(filterId)) {
                    console.warn(new Error("Please check your filter configuration: The given layerId does not exist in your config.json."));
                }
            });
        }
        this.filterButtonDisabled = typeof this.layerConfig?.filterButtonDisabled === "boolean" ? this.layerConfig.filterButtonDisabled : false;
    },
    mounted () {
        this.$nextTick(() => {
            const filterId = this.layerConfig.filterId,
                layerConfig = this.mapHandler.getLayerModelByFilterId(filterId);

            if (layerConfig.typ === "VectorTile" && this.mapHandler.isLayerActivated(filterId) === false) {
                this.setIsLoading(true);
                this.mapHandler.activateLayer(filterId, this.onMounted);
            }
            else {
                this.onMounted();
            }
        });
    },
    beforeUnmount () {
        if (this.layerConfig.filterOnMove === true && !this.openMultipleAccordeons && this.layerConfig?.strategy === "active") {
            this.$emit("registerMapMoveListener", {
                filterId: this.layerConfig.filterId,
                listener: false
            });
            if (this.mapHandler.getLayerModelByFilterId(this.layerConfig.filterId) instanceof VectorTileLayer) {
                this.mapHandler.clearLayer(this.layerConfig.filterId, this.isExtern());
            }
        }
    },
    methods: {
        ...mapMutations("Modules/GetFeatureInfo", {
            setGfiVisible: "setVisible"
        }),
        isRule,
        hasUnfixedRules,
        translateKeyWithPlausibilityCheck,

        /**
         * Outsourced logic that is called in the mounted hook.
         * @returns {void}
         */
        onMounted () {
            this.setIsLoading(false);
            compileSnippets(this.layerConfig.snippets, this.api, FilterApi, snippets => {
                this.snippets = snippets;
                this.setSnippetValueByState(this.filterRules);
                if (this.layerSelectorVisible && this.layerConfig.filterOnOpen && this.layerConfig.strategy === "active") {
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            this.$nextTick(() => {
                                this.handleActiveStrategy();
                            });
                        });
                    });
                }
            }, error => {
                console.warn(error);
            });
            if (typeof this.filterHits === "number" && !this.isStrategyActive()) {
                this.amountOfFilteredItems = this.filterHits;
            }
            if (!this.mapHandler.isLayerActivated(this.layerConfig.filterId)
                && isObject(this.filterGeometry)
                && this.isLayerFilterSelected === true) {
                this.handleActiveStrategy();
            }
            if (typeof this.layerConfig.minZoom === "number" || typeof this.layerConfig.maxZoom === "number") {
                this.checkZoomLevel(this.layerConfig.minZoom, this.layerConfig.maxZoom);
            }
            if (this.layerConfig.filterOnMove === true && !this.openMultipleAccordeons && this.layerConfig?.strategy === "active") {
                this.$watch("$store.state.Tools.Gfi.gfiFeatures", (newVal, oldVal) => {
                    if (Array.isArray(oldVal) && !oldVal.length) {
                        this.gfiFirstActive = true;
                    }
                    else {
                        this.gfiFirstActive = false;
                    }
                });

                this.$emit("registerMapMoveListener", {
                    filterId: this.layerConfig.filterId,
                    listener: evt => this.updateSnippets(evt)
                });
                this.$nextTick(() => {
                    if (!this.outOfZoom) {
                        this.isLockedHandleActiveStrategy = false;
                        this.handleActiveStrategy();
                    }
                });
            }
        },
        /**
         * Set the prechecked value for each snippet by state data.
         * @param {Object[]} rules an array of rules
         * @returns {void}
         */
        setSnippetValueByState (rules) {
            if (!Array.isArray(rules)) {
                return;
            }

            rules.forEach((rule) => {
                if (!this.isRule(rule)) {
                    return;
                }

                if (!Array.isArray(rule?.value)
                    && (this.snippets[rule.snippetId]?.type === "dropdown"
                    || this.snippets[rule.snippetId]?.type === "sliderRange"
                    || this.snippets[rule.snippetId]?.type === "dateRange"
                    )
                ) {
                    this.snippets[rule.snippetId].prechecked = [rule?.value];
                    return;
                }
                this.snippets[rule.snippetId].prechecked = rule?.value;
            });
        },
        /**
         * Getter for a snippet configuration by snippetId.
         * @param {Number} snippetId the id to return the snippet for
         * @returns {Object} the snippet
         */
        getSnippetById (snippetId) {
            return this.snippets[snippetId];
        },
        /**
         * Checks if the snippet of the given snippetId is a parent snippet.
         * @param {Number} snippetId the id to check
         * @returns {Boolean} true if this is a parent snippet, false if not
         */
        isParentSnippet (snippetId) {
            const snippet = this.getSnippetById(snippetId);

            return isObject(snippet) && Array.isArray(snippet.children);
        },
        /**
         * Checks if the snippet of the given snippetId is only adjusted from parent snippet.
         * @param {Number} snippetId the id to check
         * @returns {Boolean} true if this snippet is only adjusted from parent snippet.
         */
        isOnlyAdjustFromParent (snippetId) {
            const snippet = this.getSnippetById(snippetId);

            return isObject(snippet) && snippet.adjustOnlyFromParent === true;
        },
        /**
         * Checks if the snippet of the given snippetId has a parent snippet.
         * @param {Number} snippetId the id to check
         * @returns {Boolean} true if this snippet has a parent snippet, false if not
         */
        hasParentSnippet (snippetId) {
            const snippet = this.getSnippetById(snippetId);

            return isObject(snippet) && isObject(snippet.parent);
        },
        /**
         * Checks if this layer is supposed to use external filtering.
         * @returns {Boolean} true if the layer should filter external
         */
        isExtern () {
            return this.layerConfig?.extern;
        },
        /**
         * Checks if the strategy of this layer is set to active.
         * @returns {Boolean} true if the strategy is active, false if not
         */
        isStrategyActive () {
            return this.layerConfig?.strategy === "active";
        },
        /**
         * Checking if the snippet type exists.
         * @param {Object} snippet the snippet configuration
         * @param {String} type the type
         * @returns {Boolean} true if the snippet type is the expected type
         */
        hasThisSnippetTheExpectedType (snippet, type) {
            return isObject(snippet) && typeof snippet.type === "string" && snippet.type === type;
        },
        /**
         * Getter for searchInMapExtent.
         * @returns {Boolean} the value of searchInMapExtent
         */
        getSearchInMapExtent () {
            return this.searchInMapExtent;
        },
        /**
         * Changes the internal value for searchInMapExtent.
         * @param {Boolean} value the value to change to
         * @returns {void}
         */
        setSearchInMapExtent (value) {
            this.searchInMapExtent = value;

            if (value === true && this.layerConfig?.searchInMapExtentProactive !== false && !this.layerConfig?.searchInMapExtentPreselected && this.isStrategyActive()) {
                this.handleActiveStrategy();
            }
        },
        /**
         * Resets a snippet by its snippetId.
         * @param {Number} snippetId the snippetId of the snippet to reset
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetSnippet (snippetId, onsuccess) {
            const comp = this.$refs["snippet-" + snippetId];

            if (Array.isArray(comp) && typeof comp[0]?.resetSnippet === "function") {
                comp[0].resetSnippet(onsuccess);
            }
            else if (typeof onsuccess === "function") {
                onsuccess();
            }
        },
        /**
         * Resets all snippets and deletes rules.
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetAllSnippets (onsuccess) {
            let resetCount = this.snippets.length;

            this.snippets.forEach(snippet => {
                this.resetSnippet(snippet.snippetId, () => {
                    resetCount--;
                    if (resetCount <= 0 && typeof onsuccess === "function") {
                        onsuccess();
                    }
                });
            });
        },
        /**
         * Handles the active strategy.
         * @param {Number|Number[]} snippetId the snippet Id(s)
         * @param {Boolean|undefined} [reset=undefined] true if filtering should reset the layer (fuzzy logic)
         * @returns {void}
         */
        handleActiveStrategy (snippetId, reset = undefined) {
            if (this.isLockedHandleActiveStrategy) {
                return;
            }

            // Please use the true or false check otherwise the fuzzy logic (true, false, undefined) wouldn't work anymore
            const rules = reset === true ? [] : false,
                adjust = reset !== true,
                alterMap = reset !== false,
                onfinish = reset === true ? () => this.handleActiveStrategy(snippetId, false) : false;

            this.filter(snippetId, filterAnswer => {
                const adjustments = getSnippetAdjustments(this.snippets, filterAnswer?.items, filterAnswer?.paging?.page, filterAnswer?.paging?.total),
                    start = typeof adjustments?.start === "boolean" ? adjustments.start : false,
                    finish = typeof adjustments?.finish === "boolean" ? adjustments.finish : false;

                this.snippets.forEach(snippet => {
                    snippet.adjustment = {
                        snippetId,
                        start,
                        finish,
                        adjust: isObject(adjustments[snippet.snippetId]) ? adjustments[snippet.snippetId] : false
                    };
                });
            }, onfinish, adjust, alterMap, rules, reset);
        },
        /**
         * Snippets with prechecked values are pushing their snippetId on startup, others are pushing false.
         * @info Pushing false is necessary to trigger actions only if snippet rules are finalized.
         * @param {Number|Boolean} snippetId The snippetId of a prechecked snippet or false for others.
         * @returns {void}
         */
        setSnippetPrechecked (snippetId) {
            this.precheckedSnippets.push(snippetId);
        },
        /**
         * Sets the visibility for components to true or false.
         * @param {Boolean} isVisible the value for showing components
         * @returns {void}
         */
        setSnippetVisible (isVisible) {
            this.visibleSnippet = isVisible;
        },
        /**
         * Triggered when a rule changed at a snippet.
         * @param {Object} rule the rule to set
         * @returns {void}
         */
        changeRule (rule) {
            if (this.isRule(rule)) {
                this.$emit("updateRules", {
                    filterId: this.layerConfig.filterId,
                    snippetId: rule.snippetId,
                    rule
                });
                this.deleteRulesOfChildren(this.getSnippetById(rule.snippetId));
                this.deleteRulesOfParallelSnippets(this.getSnippetById(rule.snippetId));
                if (!rule.startup && (this.isStrategyActive() || this.isParentSnippet(rule.snippetId))) {
                    this.$nextTick(() => {
                        this.handleActiveStrategy(rule.snippetId);
                    });
                }
            }
        },
        /**
         * Removes a rule by its snippetId.
         * @param {Number} snippetId the snippetId of the rule to delete
         * @returns {void}
         */
        deleteRule (snippetId) {
            if (typeof snippetId !== "number") {
                return;
            }
            this.$emit("updateRules", {
                filterId: this.layerConfig.filterId,
                snippetId,
                rule: false
            });
            this.deleteRulesOfChildren(this.getSnippetById(snippetId));
            this.deleteRulesOfParallelSnippets(this.getSnippetById(snippetId));
            if (this.isStrategyActive() || this.isParentSnippet(snippetId)) {
                this.$nextTick(() => {
                    this.handleActiveStrategy(snippetId, !this.hasUnfixedRules(this.filterRules) && this.layerConfig.resetLayer && !this.layerConfig.clearAll ? true : undefined);
                });
            }
        },
        /**
         * Deletes all rules set by its children.
         * @info triggers no active strategy
         * @param {Object} parent the snippet to remove the rules of its children from
         * @returns {void}
         */
        deleteRulesOfChildren (parent) {
            if (!isObject(parent) || !Array.isArray(parent.children)) {
                return;
            }
            parent.children.forEach(child => {
                if (typeof child?.snippetId !== "number") {
                    return;
                }
                this.$emit("updateRules", {
                    filterId: this.layerConfig.filterId,
                    snippetId: child.snippetId,
                    rule: false
                });
                this.deleteRulesOfChildren(child);
            });
        },
        /**
         * Deletes all rules set by its parallel snippets with the same parent snippet.
         * @param {Object} snippet the snippet to remove the rules of its parallel snippets.
         * @returns {void}
         */
        deleteRulesOfParallelSnippets (snippet) {
            if (!snippet?.adjustOnlyFromParent || !isObject(snippet?.parent) || !Array.isArray(snippet?.parent.children)) {
                return;
            }

            snippet.parent.children.forEach(child => {
                if (typeof child?.snippetId !== "number" || child.snippetId === snippet.snippetId) {
                    return;
                }
                this.$emit("updateRules", {
                    filterId: this.layerConfig.filterId,
                    snippetId: child.snippetId,
                    rule: false
                });
                this.deleteRulesOfParallelSnippets(child);
            });
        },
        /**
         * Removes all rules.
         * @returns {void}
         */
        deleteAllRules () {
            this.isLockedHandleActiveStrategy = this.isStrategyActive();

            this.$emit("deleteAllRules", {
                filterId: this.layerConfig.filterId
            });

            if (this.isStrategyActive()) {
                this.$nextTick(() => {
                    this.isLockedHandleActiveStrategy = false;
                    this.handleActiveStrategy(
                        undefined,
                        this.layerConfig.resetLayer || this.layerConfig.initialStartupReset && !this.layerConfig.clearAll ? true : undefined
                    );
                });
            }
        },
        /**
         * Returns an array where every entry is a rule.
         * @returns {Object[]} an array of rules, no other values included like false or empty.
         */
        getCleanArrayOfRules () {
            const result = [];

            this.filterRules.forEach(rule => {
                if (!this.isRule(rule)) {
                    return;
                }
                result.push(rule);
            });
            return result;
        },
        /**
         * Checks if the rules are only rules of parents.
         * @returns {Boolean} true if only parents have rules left in rules.
         */
        hasOnlyParentRules () {
            if (!Array.isArray(this.filterRules)) {
                return false;
            }
            const len = this.filterRules.length;
            let hasAnyRules = false;

            for (let i = 0; i < len; i++) {
                if (this.isRule(this.filterRules[i])) {
                    hasAnyRules = true;
                    if (!this.isParentSnippet(this.filterRules[i].snippetId)) {
                        return false;
                    }
                }

            }
            return hasAnyRules;
        },
        /**
         * Set the post snippet key to rerender the snippet
         * @param {String} value the post snippet key
         * @returns {void}
         */
        setPostSnippetKey (value) {
            this.postSnippetKey = value;
        },
        /**
         * Sets the disabled flag
         * @param {Boolean} disable true/false to en/disable form
         * @returns {void}
         */
        setFormDisable (disable) {
            this.disabled = disable;
        },
        /**
         * Showing or not Showing terminate button
         * @param {Boolean} value true/false to en/disable to show terminate button
         * @returns {void}
         */
        showStopButton (value) {
            this.showStop = value;
        },
        /**
         * Returns the layerId based on the given parameters.
         * @param {Number} filterId the unique id of the internal layer filter
         * @param {String} layerId the layer id from configuration (root scope)
         * @param {Object} serviceLayerId the id given by service, may also be a layerId
         * @returns {String} the layerId to use resulting from input params
         */
        getLayerId (filterId, layerId, serviceLayerId) {
            if (typeof layerId === "string" && layerId) {
                return layerId;
            }
            else if (typeof serviceLayerId === "string" && serviceLayerId) {
                return serviceLayerId;
            }
            return "Filter-" + filterId;
        },
        /**
         * Filters the layer with the current snippet rules.
         * @param {Number|Number[]} [snippetId=false] the id(s) of the snippet that triggered the filtering
         * @param {Function} [onsuccess=false] a function to call on success
         * @param {Function} [onfinish=false] a function to call when filtering is finished
         * @param {Boolean} adjustment true if the filter should adjust
         * @param {Boolean} alterLayer true if the layer should alter the layer items
         * @param {Object[]} rules array of rules
         * @param {Boolean} resetFilter true if the filter should not filter at all and just clean the layer.
         * @returns {void}
         */
        filter (snippetId = false, onsuccess = false, onfinish = false, adjustment = true, alterLayer = true, rules = false, resetFilter = false) {
            const filterId = this.layerConfig.filterId,
                filterQuestion = {
                    filterId,
                    snippetId: typeof snippetId === "number" || Array.isArray(snippetId) ? snippetId : false,
                    commands: {
                        paging: this.layerConfig?.paging ? this.layerConfig.paging : 1000,
                        searchInMapExtent: this.getSearchInMapExtent(),
                        geometryName: this.layerConfig.geometryName,
                        filterGeometry: this.filterGeometry
                    },
                    rules: Array.isArray(rules) ? rules : this.getCleanArrayOfRules()
                };

            this.setFormDisable(true);
            this.showStopButton(true);
            if (this.closeGfi) {
                this.setGfiVisible(!this.closeGfi);
            }

            if (this.api instanceof FilterApi && this.mapHandler instanceof MapHandler) {
                this.mapHandler.activateLayer(filterId, () => {
                    if (Object.prototype.hasOwnProperty.call(this.layerConfig, "wmsRefId")) {
                        this.mapHandler.toggleWMSLayer(this.layerConfig.wmsRefId, !this.hasUnfixedRules(filterQuestion.rules) && !filterQuestion.commands.filterGeometry);
                        this.mapHandler.toggleWFSLayerInTree(filterId, this.hasUnfixedRules(filterQuestion.rules) || filterQuestion.commands.filterGeometry);
                    }
                    this.api.filter(filterQuestion, filterAnswer => {
                        this.paging = filterAnswer.paging;
                        if (typeof onsuccess === "function" && !alterLayer) {
                            this.amountOfFilteredItems = false;
                            if (adjustment) {
                                onsuccess(filterAnswer);
                            }
                            return;
                        }

                        if (this.paging?.page === 1) {
                            this.filteredItems = [];
                            this.mapHandler.clearLayer(filterId, this.isExtern());
                        }

                        if (!this.isParentSnippet(snippetId) && !this.hasOnlyParentRules() && !this.isOnlyAdjustFromParent(snippetId)) {
                            if (
                                !this.hasUnfixedRules(filterQuestion.rules)
                                && (
                                    this.layerConfig.clearAll || this.layerConfig.initialStartupReset || Object.prototype.hasOwnProperty.call(this.layerConfig, "wmsRefId")
                                )
                                && !filterQuestion.commands.filterGeometry
                            ) {
                                if (this.layerConfig.clearAll && Object.prototype.hasOwnProperty.call(this.layerConfig, "wmsRefId")) {
                                    this.mapHandler.toggleWMSLayer(this.layerConfig.wmsRefId, false, false);
                                }
                                this.amountOfFilteredItems = false;
                                if (typeof onsuccess === "function") {
                                    onsuccess(filterAnswer);
                                }
                                return;
                            }

                            this.mapHandler.addItemsToLayer(filterId, filterAnswer.items, this.isExtern());

                            if (!Object.prototype.hasOwnProperty.call(this.layerConfig, "showHits") || this.layerConfig.showHits) {
                                this.amountOfFilteredItems = this.mapHandler.getAmountOfFilteredItemsByFilterId(filterId);
                            }

                            if (this.isExtern()) {
                                this.mapHandler.addExternalLayerToTree(filterId);
                            }
                            if (!this.autoRefreshSet && this.mapHandler.hasAutoRefreshInterval(filterId)) {
                                this.autoRefreshSet = true;
                                this.mapHandler.setObserverAutoInterval(filterId, () => {
                                    this.isRefreshing = true;
                                    if (this.isStrategyActive()) {
                                        this.handleActiveStrategy();
                                    }
                                    else {
                                        this.filter();
                                    }
                                });
                            }
                            if (Array.isArray(filterAnswer?.items) && filterAnswer?.items.length > 0) {
                                this.filteredItems = this.filteredItems.concat(filterAnswer.items);
                            }
                        }
                        else {
                            this.amountOfFilteredItems = false;
                        }
                        if (typeof onsuccess === "function" && adjustment) {
                            onsuccess(filterAnswer);
                        }
                        if (typeof onfinish === "function" && this.paging?.total && this.paging?.page === this.paging?.total) {
                            onfinish();
                        }
                        if (this.paging?.total && this.paging?.page === this.paging?.total) {
                            this.mapHandler.createLegend(this.layerConfig.layerId);
                        }
                    }, error => {
                        console.warn(error);
                    }, this.hasChildSnippets(this.snippets) && resetFilter);
                });
            }
        },
        /**
         * Registering a zoom listener.
         * @param {Number} minZoom The min zoom level of the layer
         * @param {Number} maxZoom The max zoom level of the layer
         * @returns {void}
         */
        checkZoomLevel (minZoom, maxZoom) {
            let currentScale = this.scale,
                zoomLevel = mapCollection.getMapView("2D").getZoom();

            this.outOfZoom = this.checkOutOfZoomLevel(minZoom, maxZoom, zoomLevel);

            this.$store.watch((state, getters) => getters["Maps/scale"], scale => {
                if (scale > currentScale) {
                    zoomLevel = zoomLevel - 1;
                }
                else {
                    zoomLevel = zoomLevel + 1;
                }

                currentScale = scale;

                this.outOfZoom = this.checkOutOfZoomLevel(minZoom, maxZoom, zoomLevel);
            });
        },
        /**
         * Checks if the current zoom level is out of zoom range.
         * @param {Number} minZoom The min zoom level of the layer
         * @param {Number} maxZoom The max zoom level of the layer
         * @param {Number} zoomLevel The current zoom level of the layer
         * @returns {Boolean} true if the zoom level is out of the range.
         */
        checkOutOfZoomLevel (minZoom, maxZoom, zoomLevel) {
            if (typeof minZoom === "number" && typeof maxZoom === "number") {
                return zoomLevel < minZoom || zoomLevel > maxZoom;
            }
            else if (typeof minZoom === "number" && typeof maxZoom !== "number") {
                return zoomLevel < minZoom;
            }
            else if (typeof minZoom !== "number" && typeof maxZoom === "number") {
                return zoomLevel > maxZoom;
            }

            return false;
        },
        /**
         * Setter for isLoading.
         * @param {Boolean} value - The value for isLoading.
         * @returns {void}
         */
        setIsLoading (value) {
            this.isLoading = value;
        },
        /**
         * Update the snippets with adjustment
         * @param {Object} evt - Openlayers MapEvent.
         * @returns {void}
         */
        updateSnippets (evt) {
            if (this.gfiFirstActive) {
                return;
            }
            if (evt.type === "moveend" && !evt.map.loaded_) {
                return;
            }
            if (evt.type === "loadstart") {
                this.setIsLoading(!this.outOfZoom);
                return;
            }
            if (evt.type === "loadend") {
                this.setIsLoading(false);
            }
            this.$nextTick(() => {
                if (!this.outOfZoom) {
                    this.isLockedHandleActiveStrategy = false;
                    this.setSnippetValueByState(this.filterRules);
                    this.handleActiveStrategy();
                }
                else {
                    this.amountOfFilteredItems = 0;
                    this.stopFilter();
                }
            });
        },
        /**
         * Terminating the filter process by terminating every snippet
         * @returns {void}
         */
        stopFilter () {
            if (!(this.api instanceof FilterApi)) {
                return;
            }
            this.api.stop(() => {
                this.showStopButton(false);
                this.setFormDisable(false);
            },
            err => {
                console.warn(err);
            });
        },
        /**
         * Get the title or if no title is set get the matching gfiAttribute.
         * @param {Object} snippet the snippet to fetch the title for
         * @param {Number} layerId the layerId
         * @returns {String|Boolean} the title - true if no title is set and no gfiAttribute is found
         */
        getTitle (snippet, layerId) {
            if (!isObject(snippet) || typeof layerId === "undefined") {
                return true;
            }
            if (Object.prototype.hasOwnProperty.call(snippet, "title")) {
                return snippet.title;
            }
            const model = openlayerFunctions.getLayerByLayerId(layerId),
                title = isObject(model) && isObject(model.gfiAttributes) ? model.gfiAttributes[
                    Array.isArray(snippet.attrName) ? snippet.attrName[0] : snippet.attrName
                ] : undefined;

            if (typeof title !== "undefined") {
                return title;
            }
            return true;
        },
        /**
         * Getting the tag title from rule
         * @param {Object} rule the rule to set
         * @returns {String} the tag title
         */
        getTagTitle (rule) {
            if (Object.prototype.hasOwnProperty.call(rule, "tagTitle")) {
                return String(rule.tagTitle);
            }

            return String(rule.value);
        },
        /**
         * Returns the api for the given snippet.
         * @param {Object} snippet the snippet to return the api for
         * @returns {FilterApi} the api
         */
        getSnippetApi (snippet) {
            if (!isObject(snippet) || this.hasParentSnippet(snippet.snippetId)) {
                return null;
            }
            else if (snippet.api instanceof FilterApi) {
                return snippet.api;
            }
            return this.api;
        },
        /**
         * Download handler for csv export.
         * @param {Function} onsuccess The function to hand over the data.
         * @returns {void}
         */
        getDownloadHandler (onsuccess) {
            const result = [],
                features = this.filteredItems,
                model = openlayerFunctions.getLayerByLayerId(this.layerConfig.layerId),
                gfiAttributes = isObject(model) && typeof model.get === "function" && isObject(model.get("gfiAttributes")) ? model.get("gfiAttributes") : {};

            if (!Array.isArray(features)) {
                onsuccess([]);
                return;
            }
            features.forEach(item => {
                if (!isObject(item) || typeof item.getProperties !== "function" || !isObject(item.getProperties())) {
                    return;
                }
                const properties = {},
                    geometryName = typeof item.getGeometryName === "function" ? item.getGeometryName() : false;

                Object.entries(item.getProperties()).forEach(([attrName, value]) => {
                    if (attrName === geometryName) {
                        return;
                    }
                    else if (Object.prototype.hasOwnProperty.call(gfiAttributes, attrName)) {
                        properties[gfiAttributes[attrName]] = value;
                        return;
                    }
                    properties[attrName] = value;
                });

                result.push(properties);
            });
            onsuccess(result);
        },
        /**
         * Returns the timeout for the input.
         * @param {Object} snippet The snippet to get the timeout from.
         * @returns {Number} The timeout for the input or undefined if missing.
         */
        getTimeoutInput (snippet) {
            return snippet?.timeouts?.input ? snippet.timeouts.input : undefined;
        },
        /**
         * Returns the timeout for the slider.
         * @param {Object} snippet The snippet to get the timeout from.
         * @returns {Number} The timeout for the slider or undefined if missing.
         */
        getTimeoutSlider (snippet) {
            return snippet?.timeouts?.slider ? snippet.timeouts.slider : undefined;
        },
        disableFilterButton () {
            this.filterButtonDisabled = true;
        },
        enableFilterButton () {
            this.filterButtonDisabled = false;
        },
        /**
         * Checks if the given snippets has any child snippets configured.
         * @param {Object[]} snippets A list of snippets.
         * @returns {Boolean} true if given snippets does have childs, false if not.
         */
        hasChildSnippets (snippets) {
            return Array.isArray(snippets) ?
                snippets.some(snippet => isObject(snippet) && Object.hasOwn(snippet, "children"))
                : false;
        },
        /**
         * Resets the snippets and the rules.
         * Currently only called by FilterGeneral to get rid of rules deleting bug for children snippets.
         * @returns {void}
         */
        resetsSnippetsAndRules () {
            this.resetAllSnippets(() => this.deleteAllRules());
        }
    }
};
</script>

<template>
    <div
        :class="['panel-body', outOfZoom ? 'disabled' : '']"
    >
        <div
            v-if="outOfZoom"
            class="diabled-overlayer"
        >
            <div class="info">
                <span>
                    <i class="bi bi-exclamation-circle-fill" />
                    {{ $t("common:modules.filter.filterResult.disabledInfo") }}
                </span>
            </div>
        </div>
        <div
            v-if="isLoading"
            class="d-flex justify-content-center"
        >
            <div
                class="spinner-border spinner-color"
                role="status"
            >
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <template v-else>
            <div
                v-if="layerConfig.description"
                class="layerInfoText"
            >
                {{ translateKeyWithPlausibilityCheck(layerConfig.description, key => $t(key)) }}
            </div>
            <div
                v-if="layerConfig.snippetTags !== false && !outOfZoom"
                class="snippetTags"
            >
                <div
                    v-show="hasUnfixedRules(filterRules)"
                    class="snippetTagsWrapper"
                >
                    <div
                        class="snippetTagText"
                    >
                        {{ $t("common:modules.filter.snippetTags.selectionText") }}
                    </div>
                    <SnippetTag
                        :is-reset-all="true"
                        :value="snippetTagsResetAllText"
                        @reset-all-snippets="resetAllSnippets"
                        @delete-all-rules="deleteAllRules"
                    />
                </div>
                <div
                    v-for="(rule, ruleIndex) in filterRules"
                    :key="'rule-' + ruleIndex"
                    class="snippetTagsWrapper"
                >
                    <SnippetTag
                        v-if="isRule(rule) && rule.fixed === false"
                        :snippet-id="rule.snippetId"
                        :value="getTagTitle(rule)"
                        @reset-snippet="resetSnippet"
                        @delete-rule="deleteRule"
                    />
                </div>
            </div>
            <div
                v-if="layerConfig.showHits !== false && typeof amountOfFilteredItems === 'number'&& !outOfZoom"
                class="filter-result"
            >
                <span>
                    {{ $t("common:modules.filter.filterResult.label") }}
                </span>
                <span>
                    {{ $t("common:modules.filter.filterResult.unit", {amountOfFilteredItems}) }}
                </span>
            </div>
            <div
                v-if="Object.prototype.hasOwnProperty.call(layerConfig, 'searchInMapExtent') && layerConfig.searchInMapExtent"
                class="form-group"
            >
                <SnippetCheckboxFilterInMapExtent
                    :info="layerConfig.searchInMapExtentInfo"
                    :filter-id="layerConfig.filterId"
                    :preselected="layerConfig.searchInMapExtentPreselected"
                    @command-changed="setSearchInMapExtent"
                />
            </div>
            <div
                v-for="(snippet, indexSnippet) in snippets"
                :key="'snippet-' + indexSnippet + postSnippetKey"
            >
                <div
                    v-if="hasThisSnippetTheExpectedType(snippet, 'checkbox')"
                    class="snippet"
                >
                    <SnippetCheckbox
                        :ref="'snippet-' + snippet.snippetId"
                        :attr-name="snippet.attrName"
                        :disabled="disabled"
                        :info="snippet.info"
                        :title="getTitle(snippet, layerConfig.layerId)"
                        :operator-for-attr-name="snippet.operatorForAttrName"
                        :operator="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :value="snippet.value"
                        :visible="snippet.visible"
                        @change-rule="changeRule"
                        @delete-rule="deleteRule"
                        @set-snippet-prechecked="setSnippetPrechecked"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'dropdown')"
                    class="snippet"
                >
                    <SnippetDropdown
                        :ref="'snippet-' + snippet.snippetId"
                        :api="getSnippetApi(snippet)"
                        :attr-name="snippet.attrName"
                        :add-select-all="snippet.addSelectAll"
                        :adjustment="snippet.adjustment"
                        :adjust-only-from-parent="snippet.adjustOnlyFromParent"
                        :allow-empty-selection="snippet.allowEmptySelection"
                        :auto-init="snippet.autoInit"
                        :delimiter="snippet.delimiter"
                        :disabled="disabled"
                        :display="snippet.display"
                        :filter-id="layerConfig.filterId"
                        :hide-selected="snippet.hideSelected"
                        :info="snippet.info"
                        :is-child="hasParentSnippet(snippet.snippetId)"
                        :is-parent="isParentSnippet(snippet.snippetId)"
                        :title="getTitle(snippet, layerConfig.layerId)"
                        :layer-id="layerConfig.layerId"
                        :multiselect="snippet.multiselect"
                        :operator-for-attr-name="snippet.operatorForAttrName"
                        :operator="snippet.operator"
                        :placeholder="snippet.placeholder"
                        :prechecked="snippet.prechecked"
                        :render-icons="snippet.renderIcons"
                        :fixed-rules="fixedRules"
                        :snippet-id="snippet.snippetId"
                        :show-all-values="snippet.showAllValues"
                        :value="snippet.value"
                        :visible="snippet.visible"
                        :options-limit="snippet.optionsLimit"
                        :locale-compare-params="snippet.localeCompareParams"
                        :filter-geometry="filterGeometry"
                        :filter-geometry-name="layerConfig.geometryName"
                        @change-rule="changeRule"
                        @delete-rule="deleteRule"
                        @set-snippet-prechecked="setSnippetPrechecked"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'text')"
                    class="snippet"
                >
                    <SnippetInput
                        :ref="'snippet-' + snippet.snippetId"
                        :attr-name="snippet.attrName"
                        :disabled="disabled"
                        :info="snippet.info"
                        :title="getTitle(snippet, layerConfig.layerId)"
                        :operator-for-attr-name="snippet.operatorForAttrName"
                        :operator="snippet.operator"
                        :placeholder="snippet.placeholder"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        @change-rule="changeRule"
                        @delete-rule="deleteRule"
                        @set-snippet-prechecked="setSnippetPrechecked"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'date')"
                    class="snippet"
                >
                    <SnippetDate
                        :ref="'snippet-' + snippet.snippetId"
                        :api="getSnippetApi(snippet)"
                        :adjustment="snippet.adjustment"
                        :attr-name="snippet.attrName"
                        :disabled="disabled"
                        :info="snippet.info"
                        :format="snippet.format"
                        :filter-id="layerConfig.filterId"
                        :is-parent="isParentSnippet(snippet.snippetId)"
                        :title="getTitle(snippet, layerConfig.layerId)"
                        :max-value="snippet.maxValue"
                        :min-value="snippet.minValue"
                        :operator-for-attr-name="snippet.operatorForAttrName"
                        :operator="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :fixed-rules="fixedRules"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        :filter-geometry="filterGeometry"
                        :filter-geometry-name="layerConfig.geometryName"
                        @change-rule="changeRule"
                        @delete-rule="deleteRule"
                        @set-snippet-prechecked="setSnippetPrechecked"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'dateRange')"
                    class="snippet"
                >
                    <SnippetDateRange
                        :ref="'snippet-' + snippet.snippetId"
                        :api="getSnippetApi(snippet)"
                        :adjustment="snippet.adjustment"
                        :attr-name="snippet.attrName"
                        :disabled="disabled"
                        :display="snippet.display"
                        :info="snippet.info"
                        :format="snippet.format"
                        :filter-id="layerConfig.filterId"
                        :is-parent="isParentSnippet(snippet.snippetId)"
                        :title="getTitle(snippet, layerConfig.layerId)"
                        :sub-titles="snippet.subTitles"
                        :value="snippet.value"
                        :operator="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :fixed-rules="fixedRules"
                        :snippet-id="snippet.snippetId"
                        :timeout-slider="getTimeoutSlider(snippet)"
                        :visible="snippet.visible"
                        :filter-geometry="filterGeometry"
                        :filter-geometry-name="layerConfig.geometryName"
                        @change-rule="changeRule"
                        @delete-rule="deleteRule"
                        @set-snippet-prechecked="setSnippetPrechecked"
                        @disable-filter-button="disableFilterButton"
                        @enable-filter-button="enableFilterButton"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'slider')"
                    class="snippet"
                >
                    <SnippetSlider
                        :ref="'snippet-' + snippet.snippetId"
                        :api="getSnippetApi(snippet)"
                        :adjustment="snippet.adjustment"
                        :attr-name="snippet.attrName"
                        :decimal-places="snippet.decimalPlaces"
                        :disabled="disabled"
                        :filter-id="layerConfig.filterId"
                        :info="snippet.info"
                        :is-parent="isParentSnippet(snippet.snippetId)"
                        :title="getTitle(snippet, layerConfig.layerId)"
                        :min-value="snippet.minValue"
                        :max-value="snippet.maxValue"
                        :operator-for-attr-name="snippet.operatorForAttrName"
                        :operator="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :fixed-rules="fixedRules"
                        :snippet-id="snippet.snippetId"
                        :timeout-slider="getTimeoutSlider(snippet)"
                        :timeout-input="getTimeoutInput(snippet)"
                        :visible="snippet.visible"
                        :filter-geometry="filterGeometry"
                        :filter-geometry-name="layerConfig.geometryName"
                        @change-rule="changeRule"
                        @delete-rule="deleteRule"
                        @set-snippet-prechecked="setSnippetPrechecked"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'sliderRange')"
                    class="snippet"
                >
                    <SnippetSliderRange
                        :ref="'snippet-' + snippet.snippetId"
                        :api="getSnippetApi(snippet)"
                        :adjustment="snippet.adjustment"
                        :attr-name="snippet.attrName"
                        :decimal-places="snippet.decimalPlaces"
                        :disabled="disabled"
                        :filter-id="layerConfig.filterId"
                        :info="snippet.info"
                        :is-parent="isParentSnippet(snippet.snippetId)"
                        :title="getTitle(snippet, layerConfig.layerId)"
                        :min-value="snippet.minValue"
                        :prechecked="snippet.prechecked"
                        :fixed-rules="fixedRules"
                        :snippet-id="snippet.snippetId"
                        :timeout-slider="getTimeoutSlider(snippet)"
                        :timeout-input="getTimeoutInput(snippet)"
                        :operator-for-attr-name="snippet.operatorForAttrName"
                        :operator="snippet.operator"
                        :visible="snippet.visible"
                        :value="snippet.value"
                        :filter-geometry="filterGeometry"
                        :filter-geometry-name="layerConfig.geometryName"
                        @change-rule="changeRule"
                        @delete-rule="deleteRule"
                        @set-snippet-prechecked="setSnippetPrechecked"
                        @disable-filter-button="disableFilterButton"
                        @enable-filter-button="enableFilterButton"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'featureInfo')"
                    class="snippet"
                >
                    <AccordionItem
                        v-show="visibleSnippet"
                        id="snippet-feature-info"
                        :title="snippet.title"
                        icon="bi bi-list-ul"
                        :is-open="true"
                    >
                        <SnippetFeatureInfo
                            :ref="'snippet-' + snippet.snippetId"
                            :attr-name="snippet.attrName"
                            :adjustment="snippet.adjustment"
                            :layer-id="layerConfig.layerId"
                            :snippet-id="snippet.snippetId"
                            :filtered-items="filteredItems"
                            :universal-search="snippet.universalSearch"
                            :beautified-attr-name="snippet.beautifiedAttrName"
                            @set-snippet-prechecked="setSnippetPrechecked"
                            @set-snippet-visible="setSnippetVisible"
                        />
                    </AccordionItem>
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'chart')"
                    class="snippet"
                >
                    <AccordionItem
                        v-show="visibleSnippet"
                        id="snippet-chart"
                        :title="snippet.title"
                        icon="bi bi-bar-chart"
                        :is-open="true"
                    >
                        <SnippetChart
                            :ref="'snippet-' + snippet.snippetId"
                            :api="getSnippetApi(snippet)"
                            :filtered-items="filteredItems"
                            :info-text="snippet.infoText"
                            :chart-config="snippet.chartConfig"
                            :subtitle="snippet.subtitle"
                            :tooltip-unit="snippet.tooltipUnit"
                            :alternative-text-for-empty-chart="snippet.alternativeTextForEmptyChart"
                        />
                    </AccordionItem>
                </div>
            </div>
            <div class="snippet">
                <button
                    v-if="!isStrategyActive()"
                    class="btn btn-primary btn-sm"
                    :disabled="filterButtonDisabled || disabled"
                    @click="filter()"
                >
                    {{ labelFilterButton }}
                </button>
                <button
                    v-if="paging.page < paging.total && showStop"
                    class="btn btn-secondary btn-sm"
                    @click="stopFilter()"
                >
                    {{ $t("common:modules.filter.button.stop") }}
                </button>
                <ProgressBar
                    :paging="paging"
                />
                <div v-if="layerConfig.download && Array.isArray(filteredItems) && filteredItems.length">
                    <SnippetDownload
                        :filtered-items="filteredItems"
                        :layer-id="layerConfig.layerId"
                    />
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";
    .win-body-vue {
        padding: 0;
    }
    .panel-body {
        padding: 0 5px;
         position: relative;
        &.disabled {
            padding: 50px 5px 0;
        }
        .diabled-overlayer {
            position: absolute;
            z-index: 1;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgba(227, 227, 227, 0.4);
            .info {
                font-family: $font_family_accent;
                font-size: $font-size-lg;
                color: $light_red;
                margin-top: 10px;
                display: inline-block;
                width: 100%;
            }
        }
    }
    .panel-heading {
        padding: 5px;
    }
    .filter-result {
        font-size: $font-size-lg;
        color: $light_red;
        margin-top: 10px;
        display: inline-block;
        width: 100%;
        span {
            width: 50%;
            display: inline-block;
            &:last-child {
                text-align: right;
                padding-right: 10px;
            }
        }
    }
    .snippet {
        display: inline-block;
        margin-bottom: 20px;
        position: relative;
        &:last-child {
            margin-bottom: 10px;
        }
        width: 100%;
        b {
            display: block;
        }
    }
    .snippetTags {
        display: flow-root;
        margin: 8px 0;
        max-height: 200px;
        overflow-y: auto;
    }
    .snippetTagText {
        font-size: $font-size-base;
        float: left;
        padding: 6px 4px 0 0;
    }
    .form-group {
        clear: both;
    }
    .table-filter-container {
        #tool-general-filter {
            .panel-body {
                max-height: 480px;
                overflow-y: auto;
                .snippet {
                    max-width: 288px;
                }
            }
        }
    }
    .spinner-color {
        color: $light_grey_inactive;
    }
</style>
