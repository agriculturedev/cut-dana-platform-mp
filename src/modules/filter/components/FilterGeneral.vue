<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersFilter";
import mutations from "../store/mutationsFilter";
import LayerFilterSnippet from "./LayerFilterSnippet.vue";
import MapHandler from "../utils/mapHandler.js";
import FilterApi from "../js/interfaces/filter.api.js";
import {compileLayers} from "../utils/compileLayers.js";
import openlayerFunctions from "../utils/openlayerFunctions.js";
import FilterList from "./FilterList.vue";
import isObject from "../../../shared/js/utils/isObject.js";
import GeometryFilter from "./GeometryFilter.vue";
import {getFeaturesOfAdditionalGeometries} from "../utils/getFeaturesOfAdditionalGeometries.js";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {getFeatureGET} from "../../../shared/js/api/wfs/getFeature";
import {WFS} from "ol/format.js";
import UrlHandler from "../utils/urlHandler.js";
import Cluster from "ol/source/Cluster";
import layerCollection from "../../../core/layers/js/layerCollection";
import {Toast} from "bootstrap";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import {hasUnfixedRules} from "../utils/hasUnfixedRules.js";

/**
 * Filter General
 * @module modules/FilterGeneral
 * @vue-data {Object} mapHandler - The MapHandler Object.
 * @vue-data {Array} layerConfigs - List of layer configurations.
 * @vue-data {Array} selectedLayerGroups - List of selected layer groups.
 * @vue-data {Array} preparedLayerGroups - List of prepared layer groups.
 * @vue-data {Array} flattenPreparedLayerGroups - List of prepared, flattened layer groups.
 * @vue-data {Object} layerLoaded - The loaded layer.
 * @vue-data {String} layerFilterSnippetPostKey - The layer filter snippet post key.
 */
export default {
    name: "FilterGeneral",
    components: {
        GeometryFilter,
        LayerFilterSnippet,
        FilterList,
        IconButton
    },
    data () {
        return {
            mapHandler: new MapHandler({
                getLayerByLayerId: openlayerFunctions.getLayerByLayerId,
                showFeaturesByIds: openlayerFunctions.showFeaturesByIds,
                zoomToFilteredFeatures: openlayerFunctions.zoomToFilteredFeatures,
                zoomToExtent: openlayerFunctions.zoomToExtent,
                changeLayerVisibility: openlayerFunctions.changeLayerVisibility,
                setParserAttributeByLayerId: openlayerFunctions.setParserAttributeByLayerId,
                getLayers: openlayerFunctions.getLayers
            }),
            layerConfigs: [],
            preparedLayerGroups: [],
            flattenPreparedLayerGroups: [],
            layerLoaded: {},
            layerFilterSnippetPostKey: "",
            urlHandler: new UrlHandler(this.mapHandler),
            alreadyWatching: null,
            mapMoveListeners: {},
            mapMoveRegistered: false
        };
    },
    computed: {
        ...mapGetters("Modules/Filter", Object.keys(getters)),
        ...mapGetters({appStoreUrlParams: "urlParams"}),

        currentURL () {
            const url = new URL(window.location.href);

            url.searchParams.set("MENU", "{\""
                + (this.menuSide === "mainMenu" ? "main" : "secondary")
                + "\":{\"currentComponent\":\"filter\"}}"
            );
            url.searchParams.set(this.type.toUpperCase(), this.urlParams);
            return url;
        },

        console: () => console,
        filters () {
            return this.layerConfigs.layers.filter(layer => {
                return isObject(layer);
            });
        }
    },
    created () {
        getFeaturesOfAdditionalGeometries(this.geometrySelectorOptions.additionalGeometries).then(additionalGeometries => {
            if (!Array.isArray(additionalGeometries) || !additionalGeometries.length) {
                return;
            }
            this.setAdditionalGeometries({additionalGeometries});
        });
    },
    mounted () {
        this.layerConfigs = compileLayers(this.layerGroups, this.layers, FilterApi);

        if (Array.isArray(this.layerConfigs.groups) && this.layerConfigs.groups.length > 0) {
            this.layerConfigs.groups.forEach(layerGroup => {
                if (isObject(layerGroup)) {
                    this.preparedLayerGroups.push(layerGroup);
                }
            });
            if (Array.isArray(this.preparedLayerGroups) && this.preparedLayerGroups.length > 0) {
                this.preparedLayerGroups.forEach(group => {
                    group.layers.forEach(layer => {
                        this.flattenPreparedLayerGroups.push(layer);
                    });
                });
            }
        }

        if (Array.isArray(this.layerConfigs?.layers) && this.layerConfigs.layers.length > 0) {
            const selectedFilterIds = [];

            this.layerConfigs.layers.forEach(config => {
                if (typeof config?.active === "boolean" && config.active && typeof config?.filterId !== "undefined") {
                    selectedFilterIds.push(config.filterId);
                }
            });
            if (selectedFilterIds.length > 0) {
                this.setSelectedAccordions(this.transformLayerConfig(this.layerConfigs.layers, selectedFilterIds));
            }
        }
        this.urlHandler.readFromUrlParams(this.appStoreUrlParams?.[this.type.toUpperCase()], this.layerConfigs, this.mapHandler, params => {
            this.handleStateForAlreadyActiveLayers(params);
            this.deserializeState({...params, setLateActive: true});
            this.addWatcherToWriteUrl();
        });
        this.addWatcherToWriteUrl();
    },
    beforeUnmount () {
        if (this.mapMoveRegistered) {
            this.unregisterMapMoveListeners();
        }
    },
    methods: {
        ...mapMutations("Modules/Filter", Object.keys(mutations)),
        ...mapActions("Modules/Filter", [
            "initialize",
            "updateRules",
            "deleteAllRules",
            "updateFilterHits",
            "deserializeState",
            "setRulesArray"
        ]),
        ...mapActions("Maps", ["registerListener", "unregisterListener"]),
        hasUnfixedRules,
        /**
         * Handles the state for already activated layers by given params.
         * The given params are set for the matching layer if it is already active but has no features loaded yet.
         * This function edits the given param and removes the rules and
         * accordions out of the arrays for the matching layers and leaves only the others.
         * @param {Object} params The params object. It will be edited if there is any matching layer.
         * @param {Object[]} params.rulesOfFilters The rules array.
         * @param {Object[]} params.selectedAccordions The selected accordions to find the layer for.
         * @returns {void}
         */
        handleStateForAlreadyActiveLayers (params) {
            if (!isObject(params) || !Object.prototype.hasOwnProperty.call(params, "selectedAccordions")
                || !Object.prototype.hasOwnProperty.call(params, "rulesOfFilters")) {
                return;
            }
            let selecetedAccordionsLen = Array.isArray(params?.selectedAccordions) ? params.selectedAccordions.length : 0;

            while (selecetedAccordionsLen--) {
                const accordion = params.selectedAccordions[selecetedAccordionsLen],
                    rulesOfAccordeon = params.rulesOfFilters[accordion?.filterId];
                let layerModel = null,
                    layerConfig = null,
                    layerSource = null;

                layerModel = layerCollection.getLayerById(accordion?.layerId);
                layerConfig = openlayerFunctions.getLayerByLayerId(accordion?.layerId);
                if (!layerModel) {
                    continue;
                }
                layerSource = layerModel.layer.getSource() instanceof Cluster ? layerModel.layer.getSource().getSource() : layerModel.layer.getSource();
                if (!layerSource) {
                    continue;
                }
                if (layerConfig?.visibility && ((
                    typeof layerSource?.getFeatures === "function"
                    && layerSource.getFeatures().length === 0)
                    || (typeof layerModel?.getFeatures === "function"
                    && layerModel.getFeatures().length === 0))) {
                    (layerConfig?.typ === "SensorThings" ? layerModel : layerSource).once("featuresloadend", async () => {
                        const rulesOfFiltersTmp = [...this.rulesOfFilters],
                            selectedAccordionsTmp = [...this.selectedAccordions];

                        rulesOfFiltersTmp[accordion.filterId] = rulesOfAccordeon;
                        selectedAccordionsTmp.push(accordion);
                        await this.setRulesArray({rulesOfFilters: rulesOfFiltersTmp});
                        this.setSelectedAccordions(selectedAccordionsTmp);
                    });
                    params.selectedAccordions.splice(selecetedAccordionsLen, 1);
                    params.rulesOfFilters[accordion.filterId] = null;
                }
            }
        },
        /**
         * Adds a watcher on the Filter module and pass the 'writeUrlParams' function as handler.
         * Only adds a watcher if there is no watcher set - checked by 'alreadyWatching' property.
         * @returns {void}
         */
        addWatcherToWriteUrl () {
            if (this.saveTo === "url") {
                if (typeof this.alreadyWatching === "function") {
                    return;
                }
                this.alreadyWatching = this.$watch("$store.state.Modules.Filter", this.writeUrlParams, {
                    deep: true
                });
            }
        },
        /**
         * Gets the features of the additional geometries by the given layer id.
         * @param {Object[]} additionalGeometries - The additional geometries.
         * @param {String} additionalGeometries[].layerId - The id of the layer.
         * @returns {void}
         */
        async getFeaturesOfAdditionalGeometries (additionalGeometries) {
            if (additionalGeometries) {
                const wfsReader = new WFS();

                for (const additionalGeometry of additionalGeometries) {
                    const rawLayer = rawLayerList.getLayerWhere({id: additionalGeometry.layerId}),
                        features = await getFeatureGET(rawLayer.url, {version: rawLayer.version, featureType: rawLayer.featureType});

                    additionalGeometry.features = wfsReader.readFeatures(features);
                }
            }
        },
        /**
         * Update selected layer group.
         * @param {Number} layerGroupIndex index of the layer group
         * @returns {void}
         */
        updateSelectedGroups (layerGroupIndex) {
            const selectedGroups = JSON.parse(JSON.stringify(this.selectedGroups)),
                index = selectedGroups.indexOf(layerGroupIndex);

            if (index >= 0) {
                selectedGroups.splice(index, 1);
            }
            else {
                selectedGroups.push(layerGroupIndex);
            }
            this.setSelectedGroups(selectedGroups);
        },
        /**
         * Update selectedAccordions array in groups.
         * @param {Number} filterId id which should be added or removed
         * @returns {void|undefined} returns undefinied, if filterIds is not an array and not a number.
         */
        updateSelectedAccordions (filterId) {
            const selectedGroups = JSON.parse(JSON.stringify(this.selectedGroups)),
                filterIdsOfAccordions = [];
            let selectedFilterIds = [],
                selectedAccordionIndex = -1;

            if (!this.multiLayerSelector) {
                selectedFilterIds = this.selectedAccordions.some(accordion => accordion.filterId === filterId) ? [] : [filterId];
                this.setSelectedAccordions(this.transformLayerConfig([...this.layerConfigs.layers, ...this.flattenPreparedLayerGroups], selectedFilterIds));

                return;
            }
            this.preparedLayerGroups.forEach((layerGroup, groupIdx) => {
                if (layerGroup.layers.some(layer => layer.filterId === filterId) && !this.selectedGroups.includes(groupIdx)) {
                    selectedGroups.push(groupIdx);
                }
            });
            this.setSelectedGroups(selectedGroups);

            selectedAccordionIndex = this.selectedAccordions.findIndex(accordion => accordion.filterId === filterId);

            this.selectedAccordions.forEach(accordion => filterIdsOfAccordions.push(accordion.filterId));
            if (selectedAccordionIndex >= 0) {
                filterIdsOfAccordions.splice(selectedAccordionIndex, 1);
            }
            else {
                filterIdsOfAccordions.push(filterId);
            }
            this.setSelectedAccordions(this.transformLayerConfig([...this.layerConfigs.layers, ...this.flattenPreparedLayerGroups], filterIdsOfAccordions));
        },
        /**
         * Transform given layer config to an lightweight array of layerIds and filterIds.
         * @param {Object[]} configs The layer configs.
         * @param {String[]} filterIds The filter ids.
         * @returns {Object[]} array of lightweight filter objects which includes filterId and layerId.
         */
        transformLayerConfig (configs, filterIds) {
            const layers = [];

            configs.forEach(layerConfig => {
                if (Array.isArray(filterIds) && filterIds.includes(layerConfig.filterId)) {
                    layers.push({
                        layerId: layerConfig.layerId,
                        filterId: layerConfig.filterId
                    });
                }
            });
            return layers;
        },
        /**
         * Check if layer filter should be displayed.
         * @param {String} filterId filterId to check
         * @returns {Boolean} true if should be displayed false if not
         */
        isLayerFilterSelected (filterId) {
            if (!Array.isArray(this.selectedAccordions)) {
                return false;
            }
            if (!this.layerSelectorVisible) {
                return true;
            }

            let selected = false;

            this.selectedAccordions.forEach(selectedLayer => {
                if (selectedLayer.filterId === filterId) {
                    if (!this.layerLoaded[filterId]) {
                        this.setLayerLoaded(filterId);
                    }
                    selected = true;
                }
            });

            return selected;
        },
        /**
         * Setting the layer loaded true if the layer is clicked from the filter Id
         * @param {String} filterId filterId to check
         * @returns {void}
         */
        setLayerLoaded (filterId) {
            this.layerLoaded[filterId] = true;
        },
        /**
         * Sets the geometry/area to filter in.
         * @param {ol/geom/Geometry|Boolean} geometry The geometry (polygon, cycle, etc.) or false.
         * @returns {void}
         */
        updateFilterGeometry (geometry) {
            this.setFilterGeometry(geometry);
        },
        /**
         * Sets the geometry feature
         * @param {ol/Feature} feature The geometry feature.
         * @returns {void}
         */
        updateGeometryFeature (feature) {
            this.setGeometryFeature(feature);
        },
        /**
         * Sets the geometry selector options
         * @param {Object} options The geometry select options
         * @returns {void}
         */
        updateGeometrySelectorOptions (options) {
            this.setGeometrySelectorOptions(Object.assign({}, this.geometrySelectorOptions, options));
        },
        /**
         * Checks if the geometry selector should be visible.
         * @returns {Boolean} true if the geometry selector should be visible.
         */
        isGeometrySelectorVisible () {
            return isObject(this.geometrySelectorOptions) && this.geometrySelectorOptions.visible !== false;
        },
        /**
         * Resets the jumpToId state property.
         * @returns {void}
         */
        resetJumpToId () {
            this.setJumpToId(undefined);
        },
        /**
         * Writes the given state to the url.
         * @calls urlHandler.getParamsFromState
         * @param {Object} newState The state.
         * @returns {void}
         */
        writeUrlParams (newState) {
            const params = this.urlHandler.getParamsFromState(newState, this.neededUrlParams),
                generatedParams = JSON.stringify(params);

            this.setUrlParams(generatedParams);
        },
        /**
         * Registering a map moveend, loadend and loadstart listener.
         * @returns {void}
         */
        registerMapMoveListeners () {
            this.registerListener({type: "loadstart", listener: this.executeListeners.bind(this)});
            this.registerListener({type: "loadend", listener: this.executeListeners.bind(this)});
            this.registerListener({type: "moveend", listener: this.executeListeners.bind(this)});
        },
        /**
         * Unregistering this moveend, loadend and loadstart listener.
         * @returns {void}
         */
        unregisterMapMoveListeners () {
            this.unregisterListener({type: "loadstart", listener: this.executeListeners.bind(this)});
            this.unregisterListener({type: "loadend", listener: this.executeListeners.bind(this)});
            this.unregisterListener({type: "moveend", listener: this.executeListeners.bind(this)});
        },
        /**
         * Adds given listener callback to the mapMoveListeners list.
         * @param {Object} options The payload.
         * @param {Number} options.filterId The filterId to ensure that only one callback is added for the given filterId.
         * @param {Function|Boolean} options.listener The callback to execute on mapmove. Set to false to remove the listener.
         * @returns {void}
         */
        addToMapMoveListeners (options) {
            if (!isObject(options) || !Object.prototype.hasOwnProperty.call(options, "filterId") || !Object.prototype.hasOwnProperty.call(options, "listener")) {
                return;
            }
            this.mapMoveListeners[options.filterId] = options.listener;
            if (!this.mapMoveRegistered) {
                this.mapMoveRegistered = true;
                this.registerMapMoveListeners();
            }
        },
        /**
         * Executes the listener for each LayerFilterSnippet that has registered to mapMoveListeners.
         * @param {Object} evt - Openlayers MapEvent.
         * @returns {void}
         */
        executeListeners (evt) {
            Object.values(this.mapMoveListeners).forEach(mapMoveListener => {
                if (typeof mapMoveListener === "function") {
                    mapMoveListener(evt);
                }
            });
        },

        /**
         * Copies the url to the clipboard.
         * @returns {void}
         */
        copyToClipboard () {
            const toast = new Toast(this.$refs.copyToast);

            toast.show();
            navigator.clipboard.writeText(this.currentURL);
        },

        /**
         * Resets the snippets and rules.
         * @param {Number} id The filter id.
         * @returns {void}
         */
        resetSnippetsAndRules (id) {
            const layerFilterComp = this.$refs[`filter-${id}`];

            if (Array.isArray(layerFilterComp) && typeof layerFilterComp[0]?.resetsSnippetsAndRules === "function") {
                layerFilterComp[0].resetsSnippetsAndRules();
            }
            else if (typeof layerFilterComp?.resetsSnippetsAndRules === "function") {
                layerFilterComp.resetsSnippetsAndRules();
            }
        }
    }
};
</script>

<template lang="html">
    <div
        id="filter"
    >
        <GeometryFilter
            v-if="isGeometrySelectorVisible()"
            :circle-sides="geometrySelectorOptions.circleSides"
            :default-buffer="geometrySelectorOptions.defaultBuffer"
            :geometries="geometrySelectorOptions.geometries"
            :additional-geometries="geometrySelectorOptions.additionalGeometries"
            :invert-geometry="geometrySelectorOptions.invertGeometry"
            :fill-color="geometrySelectorOptions.fillColor"
            :stroke-color="geometrySelectorOptions.strokeColor"
            :stroke-width="geometrySelectorOptions.strokeWidth"
            :filter-geometry="filterGeometry"
            :geometry-feature="geometryFeature"
            :init-selected-geometry-index="geometrySelectorOptions.selectedGeometry"
            @update-filter-geometry="updateFilterGeometry"
            @update-geometry-feature="updateGeometryFeature"
            @update-geometry-selector-options="updateGeometrySelectorOptions"
        />
        <div v-if="Array.isArray(layerGroups) && layerGroups.length && layerSelectorVisible">
            <div
                v-for="(layerGroup, key) in layerGroups"
                :key="key"
                class="layerGroupContainer"
            >
                <div class="panel panel-default">
                    <div class="panel-body">
                        <h2
                            class="panel-title"
                        >
                            <a
                                role="button"
                                data-toggle="collapse"
                                data-parent="#accordion"
                                tabindex="0"
                                @click="updateSelectedGroups(layerGroups.indexOf(layerGroup))"
                                @keydown.enter="updateSelectedGroups(layerGroups.indexOf(layerGroup))"
                            >
                                {{ layerGroup.title ? layerGroup.title : key }}
                                <span
                                    v-if="!selectedGroups.includes(layerGroups.indexOf(layerGroup))"
                                    class="bi bi-chevron-down float-end"
                                />
                                <span
                                    v-else
                                    class="bi bi-chevron-up float-end"
                                />
                            </a>
                        </h2>
                        <div
                            role="tabpanel"
                            :class="['accordion-collapse', 'collapse', selectedGroups.includes(layerGroups.indexOf(layerGroup)) ? 'show' : '']"
                        >
                            <FilterList
                                v-if="Array.isArray(preparedLayerGroups) && preparedLayerGroups.length && layerSelectorVisible"
                                class="layerSelector"
                                :filters="preparedLayerGroups[layerGroups.indexOf(layerGroup)].layers"
                                :selected-layers="selectedAccordions"
                                :multi-layer-selector="multiLayerSelector"
                                :jump-to-id="jumpToId"
                                :rules-of-filters="rulesOfFilters"
                                @delete-all-rules="(filterId) => resetSnippetsAndRules(filterId)"
                                @reset-jump-to-id="resetJumpToId"
                                @selected-accordions="updateSelectedAccordions"
                                @set-layer-loaded="setLayerLoaded"
                            >
                                <template
                                    #default="slotProps"
                                >
                                    <div
                                        :class="['accordion-collapse', 'collapse', isLayerFilterSelected(slotProps.layer.filterId) ? 'show' : '']"
                                        role="tabpanel"
                                    >
                                        <LayerFilterSnippet
                                            v-if="isLayerFilterSelected(slotProps.layer.filterId)"
                                            :ref="'filter-' + slotProps.layer.filterId"
                                            :key="slotProps.layer"
                                            :api="slotProps.layer.api"
                                            :is-layer-filter-selected="isLayerFilterSelected(slotProps.layer.filterId)"
                                            :layer-config="slotProps.layer"
                                            :layer-selector-visible="layerSelectorVisible"
                                            :map-handler="mapHandler"
                                            :min-scale="minScale"
                                            :open-multiple-accordeons="multiLayerSelector"
                                            :live-zoom-to-features="liveZoomToFeatures"
                                            :filter-rules="rulesOfFilters[slotProps.layer.filterId]"
                                            :filter-hits="filtersHits[slotProps.layer.filterId]"
                                            :filter-geometry="filterGeometry"
                                            :close-gfi="closeGfi"
                                            @update-rules="updateRules"
                                            @delete-all-rules="deleteAllRules"
                                            @update-filter-hits="updateFilterHits"
                                            @register-map-move-listener="addToMapMoveListeners"
                                        />
                                    </div>
                                </template>
                            </FilterList>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="(Array.isArray(layerConfigs.layers) && layerConfigs.layers.length) || (Array.isArray(layerConfigs.groups) && layerConfigs.groups.length)">
            <div
                v-for="(layerGroup, key) in layerGroups"
                :key="key"
            >
                <div>
                    <h2
                        v-for="(layerConfig, indexLayer) in preparedLayerGroups[layerGroups.indexOf(layerGroup)].layers"
                        :key="'layer-title' + key + indexLayer + layerFilterSnippetPostKey"
                    >
                        <u class="text-break">{{ layerConfig.title }}</u>
                        <div
                            v-if="layerConfig.initialStartupReset && hasUnfixedRules(rulesOfFilters[layerConfig.filterId])"
                            class="d-flex justify-content-end"
                        >
                            <IconButton
                                icon="bi bi-arrow-counterclockwise bi-xs"
                                :class-array="['custom-reset', 'btn-light']"
                                :aria="$t('common:modules.filter.resetButton')"
                                :title="$t('common:modules.filter.resetButton')"
                                :interaction="() => resetSnippetsAndRules(layerConfig.filterId)"
                            />
                        </div>
                    </h2>
                    <LayerFilterSnippet
                        v-for="(layerConfig, indexLayer) in preparedLayerGroups[layerGroups.indexOf(layerGroup)].layers"
                        :key="'layer-' + key + indexLayer + layerFilterSnippetPostKey"
                        :ref="'filter-' + layerConfig.filterId"
                        :api="layerConfig.api"
                        :is-layer-filter-selected="true"
                        :layer-config="layerConfig"
                        :layer-selector-visible="layerSelectorVisible"
                        :map-handler="mapHandler"
                        :min-scale="minScale"
                        :open-multiple-accordeons="multiLayerSelector"
                        :live-zoom-to-features="liveZoomToFeatures"
                        :filter-rules="rulesOfFilters[layerConfig.filterId]"
                        :filter-hits="filtersHits[layerConfig.filterId]"
                        :filter-geometry="filterGeometry"
                        :close-gfi="closeGfi"
                        @update-rules="updateRules"
                        @delete-all-rules="deleteAllRules"
                        @update-filter-hits="updateFilterHits"
                        @register-map-move-listener="addToMapMoveListeners"
                    />
                </div>
            </div>
        </div>
        <FilterList
            v-if="(Array.isArray(layerConfigs.layers) && layerConfigs.layers.length) && layerSelectorVisible || (Array.isArray(layerConfigs.groups) && layerConfigs.groups.length) && layerSelectorVisible"
            class="layerSelector"
            :filters="filters"
            :selected-layers="selectedAccordions"
            :multi-layer-selector="multiLayerSelector"
            :jump-to-id="jumpToId"
            :rules-of-filters="rulesOfFilters"
            @delete-all-rules="(filterId) => resetSnippetsAndRules(filterId)"
            @reset-jump-to-id="resetJumpToId"
            @selected-accordions="updateSelectedAccordions"
            @set-layer-loaded="setLayerLoaded"
        >
            <template
                #default="slotProps"
            >
                <div
                    :class="['accordion-collapse', 'collapse', isLayerFilterSelected(slotProps.layer.filterId) ? 'show' : '']"
                    role="tabpanel"
                >
                    <LayerFilterSnippet
                        v-if="isLayerFilterSelected(slotProps.layer.filterId) || layerLoaded[slotProps.layer.filterId]"
                        :key="slotProps.layer"
                        :ref="'filter-' + slotProps.layer.filterId"
                        :api="slotProps.layer.api"
                        :is-layer-filter-selected="isLayerFilterSelected"
                        :layer-config="slotProps.layer"
                        :layer-selector-visible="layerSelectorVisible"
                        :map-handler="mapHandler"
                        :min-scale="minScale"
                        :open-multiple-accordeons="multiLayerSelector"
                        :live-zoom-to-features="liveZoomToFeatures"
                        :filter-rules="rulesOfFilters[slotProps.layer.filterId]"
                        :filter-hits="filtersHits[slotProps.layer.filterId]"
                        :filter-geometry="filterGeometry"
                        :close-gfi="closeGfi"
                        @update-rules="updateRules"
                        @delete-all-rules="deleteAllRules"
                        @update-filter-hits="updateFilterHits"
                        @register-map-move-listener="addToMapMoveListeners"
                    />
                </div>
            </template>
        </FilterList>
        <div v-else-if="(Array.isArray(layerConfigs.layers) && layerConfigs.layers.length) || (Array.isArray(layerConfigs.groups) && layerConfigs.groups.length)">
            <div
                v-for="(layerConfig, indexLayer) in filters"
                :key="'layer-title' + indexLayer + layerFilterSnippetPostKey"
            >
                <h2 class="d-flex flex-row justify-content-between align-items-center">
                    <u>{{ layerConfig.title }}</u>
                    <div
                        v-if="layerConfig.initialStartupReset && hasUnfixedRules(rulesOfFilters[layerConfig.filterId])"
                        class="d-flex"
                    >
                        <IconButton
                            icon="bi bi-arrow-counterclockwise bi-xs"
                            :class-array="['custom-reset', 'btn-light']"
                            :aria="$t('common:modules.filter.resetButton')"
                            :title="$t('common:modules.filter.resetButton')"
                            :interaction="() => resetSnippetsAndRules(layerConfig.filterId)"
                        />
                    </div>
                </h2>
                <LayerFilterSnippet
                    :key="layerConfig"
                    :ref="'filter-' + layerConfig.filterId"
                    :api="layerConfig.api"
                    :is-layer-filter-selected="true"
                    :layer-config="layerConfig"
                    :layer-selector-visible="layerSelectorVisible"
                    :map-handler="mapHandler"
                    :min-scale="minScale"
                    :open-multiple-accordeons="multiLayerSelector"
                    :live-zoom-to-features="liveZoomToFeatures"
                    :filter-rules="rulesOfFilters[layerConfig.filterId]"
                    :filter-hits="filtersHits[layerConfig.filterId]"
                    :filter-geometry="filterGeometry"
                    :close-gfi="closeGfi"
                    @update-rules="updateRules"
                    @delete-all-rules="deleteAllRules"
                    @update-filter-hits="updateFilterHits"
                    @register-map-move-listener="addToMapMoveListeners"
                />
            </div>
        </div>
        <div class="link-section">
            <div class="toast-container p-3">
                <div
                    ref="copyToast"
                    class="toast align-items-center"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div class="d-flex">
                        <div class="toast-body">
                            {{ $t("common:modules.shareView.linkCopied") }}
                        </div>
                        <button
                            type="button"
                            class="btn-close me-2 m-auto"
                            data-bs-dismiss="toast"
                            aria-label="Close"
                        />
                    </div>
                </div>
            </div>
            <a
                v-if="typeof linkText === 'string' && linkText !== ''"
                :href="currentURL"
                :title="$t('common:modules.filter.distributionMapLinkTextTitle')"
                class="link-text"
                @click.prevent="copyToClipboard"
            >
                <i
                    class="bi-link"
                    role="img"
                />
                {{ $t(linkText) }}
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    .layerGroupContainer {
        background-color: #f5f5f5;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
    }
    .link-section {
        position: relative;
        .toast-container {
            min-width: 320px;
            bottom: 10px;
            .toast {
                background: $primary;
            }
        }
        .link-text {
            i {
                font-size: 14px;
            }
        }
    }
</style>
