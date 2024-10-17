<script>
import Multiselect from "vue-multiselect";
import {mapGetters, mapMutations} from "vuex";
import {rawLayerList} from "@masterportal/masterportalapi";
import getOAFFeature from "../../../shared/js/api/oaf/getOAFFeature";
import {getUniqueValuesFromFetchedFeatures as getUniqueValuesFromOAF} from "../../filter/utils/fetchAllOafProperties";
import FetchDataHandler from "../js/fetchData.js";
import {
    equalTo as equalToFilter,
    or as orFilter
} from "ol/format/filter";
import {getFeaturePOST} from "../../../shared/js/api/wfs/getFeature.js";
import WFS from "ol/format/WFS";
import sortBy from "../../../shared/js/utils/sortBy";
import isObject from "../../../shared/js/utils/isObject";

export default {
    name: "StatisticDashboardFilterRegions",
    components: {
        Multiselect
    },
    props: {
        regions: {
            type: Array,
            required: true
        },
        selectedLevel: {
            type: Object,
            required: false,
            default: () => {
                return {};
            }
        }
    },

    computed: {
        ...mapGetters("Maps", ["projection"])
    },

    methods: {
        ...mapMutations("Modules/StatisticDashboard", ["setSelectedRegions"]),

        /**
         * Checks whether the region has child.
         * @param {Object} region - The region to be checked.
         * @returns {Boolean} True if it has child otherwise false.
         */
        hasRegionChild (region) {
            return Object.prototype.hasOwnProperty.call(region, "child");
        },

        /**
         * Gets the regions sorted with the selected ones first.
         * @param {Object[]} regions The regions array.
         * @param {Object[]} selectedRegions The selected regions.
         * @returns {Object[]} the regions sorted.
         */
        getRegionsSorted (regions, selectedRegions) {
            if (!regions?.length || !Array.isArray(selectedRegions)) {
                return [];
            }
            const notSelectedRegions = sortBy(regions.filter(region => !selectedRegions.some(selectedRegion => selectedRegion.label === region.label)), "label");

            if (this.containsAllTag(selectedRegions)) {
                return [...selectedRegions, ...notSelectedRegions];
            }

            return [...selectedRegions, {label: i18next.t("common:modules.statisticDashboard.button.all")}, ...notSelectedRegions];
        },

        /**
         * Sets the selected value(s) to the region and updates the values of its child under certain conditions.
         * @param {Object[]} value - The value to select.
         * @param {Object} region - The region.
         * @param {Boolean} schemeRequest - Flag to decide wether the scheme schould be requested or not. Only for OAF.
         * @returns {void}
         */
        async setSelectedValuesToRegion (value, region, schemeRequest = false) {
            region.selectedValues = value;

            if (!this.hasRegionChild(region)) {
                this.setSelectedRegions(region.selectedValues);
            }
            else if (!region.selectedValues.length) {
                region.child.values = [];
                this.setSelectedValuesToRegion([], region.child);
            }
            else {
                const uniqueValues = await this.getValuesFromLayer(this.selectedLevel.layerId, region, schemeRequest || this.requestScheme(region, this.containsAllTag(value)));

                region.child.values = Object.keys(uniqueValues[region.child.attrName]).map(key => {
                    return {label: key, value: key};
                });

                if (region.child.selectedValues.length) {
                    const udpatedSelectedValues = this.updatesRegionSelectedValues(region.child.selectedValues, region.child.values);

                    this.setSelectedValuesToRegion(udpatedSelectedValues, region.child);
                }

            }
        },

        /**
         * Gets values from the layer. This function decides wether to get the values by oaf or wfs based on the given layerId.
         * @param {String} layerId The layer id.
         * @param {Object} region The region object.
         * @param {Boolean} schemeRequest Flag to decide if the data for the given region field should be requested via scheme oaf scheme.
         * @returns {Object} the values unified.
         */
        async getValuesFromLayer (layerId, region, schemeRequest = false) {
            const {url, collection, typ, featureType, featureNS} = rawLayerList.getLayerWhere({id: layerId});
            let uniqueValues = {};

            region.child.loadingDataCounter++;
            if (typ === "OAF") {
                if (schemeRequest) {
                    uniqueValues = await getOAFFeature.getUniqueValuesByScheme(url, collection, [region.child.attrName]);
                }
                else {
                    const filter = this.getFilterOAF(region.attrName, this.containsAllTag(region.selectedValues) ? region.values : region.selectedValues),
                        features = await getOAFFeature.getOAFFeatureGet(url, collection, 400, filter, this.selectedLevel.oafRequestCRS, this.selectedLevel.oafRequestCRS, [region.child.attrName], true),
                        fetchedProperties = features.map(feature => feature?.properties);

                    uniqueValues = getUniqueValuesFromOAF(fetchedProperties, [region.child.attrName], true);
                }
            }
            else {
                const payload = {
                        featureTypes: [featureType],
                        featureNS: featureNS,
                        srsName: this.projection.getCode(),
                        propertyNames: [region.child.attrName],
                        filter: this.getFilterWFS(region.attrName, region.selectedValues)
                    },
                    features = await getFeaturePOST(url, payload, error => {
                        console.error(error);
                    }),
                    olFeatures = new WFS().readFeatures(features),
                    attributesWithType = await FetchDataHandler.getAttributesWithType(url, [region.child.attrName], featureType);

                uniqueValues = FetchDataHandler.getUniqueValuesFromFeatures(olFeatures, attributesWithType);
            }
            region.child.loadingDataCounter--;
            return uniqueValues;
        },

        /**
         * Checks whether the selected values still exist in the value list.
         * If not, they are removed and an updated list is returned.
         * @param {Object[]} selectedValues - Current list of selected values.
         * @param {Object[]} values - The value list.
         * @returns {Object[]} Updated list of selected values.
         */
        updatesRegionSelectedValues (selectedValues, values) {
            const updatedSelectedValues = [];

            selectedValues.forEach(selectedValue => {
                const stillExist = values.findIndex(value => value.label === selectedValue.label);

                if (stillExist !== -1) {
                    updatedSelectedValues.push(selectedValue);
                }
            });

            return updatedSelectedValues;
        },

        /**
         * Updates the top level region selected values.
         * @param {Object} region - The top level region.
         * @param {Object} value - Value to add or remove.
         * @returns {void}
         */
        updatesTopLevelRegionSelectedValues (value, region) {
            const selectedValues = region.selectedValues,
                indexOfValue = selectedValues.map(selectedValue => selectedValue.value).indexOf(value.value);

            if (indexOfValue !== -1) {
                selectedValues.splice(indexOfValue, 1);
            }
            else {
                selectedValues.push(value);
            }

            this.setSelectedValuesToRegion(selectedValues, region);
        },

        /**
         * Gets an oaf filter for given list and property.
         * If given list has more than one entry the function returns an or Filter.
         * @param {String} propertyName - The propertyName to create a filter for.
         * @param {String[]} list - The list to create a filter for.
         * @returns {String} The oaf filter.
         */
        getFilterOAF (propertyName, list) {
            let filter = "";

            list.forEach((value, idx) => {
                filter += `${propertyName}='${value.value}'`;
                if (idx < list.length - 1) {
                    filter += " OR ";
                }
            });
            return filter;
        },

        /**
         * Gets a wfs filter for given list and property.
         * If given list has more than one entry the function returns an
         * Or Filter otherwise an EqualTo Filter.
         * @param {String} propertyName - The propertyName to create a filter for.
         * @param {String[]} list - The list to create a filter for.
         * @returns {ol/format/filter} The filter.
         */
        getFilterWFS (propertyName, list) {
            const filterArray = list.map(entry => equalToFilter(propertyName, entry.value));

            return filterArray.length > 1 ? orFilter(...filterArray) : filterArray[0];
        },

        /**
         * Sets or resets the "active-button" class if the given value is selected.
         * @param {Object} value - The value that is checked.
         * @param {Object[]} selectedValues - The selected values.
         * @returns {String} The css class.
         */
        toggleButtonActive (value, selectedValues) {
            const indexOfValue = selectedValues.map(selectedValue => selectedValue.value).indexOf(value.value);

            if (indexOfValue !== -1) {
                return "active-button";
            }
            return "";
        },

        /**
         * Select all the regions.
         * @param {Object} region - The top level region.
         * @returns {void}
         */
        selectAll (region) {
            if (!Array.isArray(region?.values)) {
                return;
            }

            if (region?.selectedValues.length === region?.values.length) {
                this.setSelectedValuesToRegion([], region);
                return;
            }

            region.values.forEach((value) => {
                const selectedValues = region?.selectedValues,
                    indexOfValue = selectedValues.map(selectedValue => selectedValue?.value).indexOf(value?.value);

                if (indexOfValue === -1) {
                    selectedValues.push(value);
                }
            });
            this.setSelectedValuesToRegion(region.selectedValues, region, true);
        },
        /**
         * Returns wether the scheme should be requested or not.
         * @param {Object} region The region.
         * @param {Boolean} allSelected true if the given region has "all" in selected values.
         * @returns {Boolean} true if the scheme should be requested for given region, false if not.
         */
        requestScheme (region, allSelected) {
            if (!isObject(region) || allSelected === false) {
                return false;
            }

            const tmpRegions = [...this.regions].reverse(),
                position = tmpRegions.findIndex(regionsRegion => regionsRegion.attrName === region.attrName);

            if (position === -1) {
                return true;
            }

            for (let i = position; i < tmpRegions.length; i++) {
                const nextRegion = tmpRegions[i];

                if (nextRegion.selectedValues.length !== nextRegion.values.length
                    && !this.containsAllTag(nextRegion.selectedValues)) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Checks if the given list contains the "all" tag.
         * @param {Object[]} values The list.
         * @returns {Boolean} true if all tag was found, false otherwise.
         */
        containsAllTag (values) {
            return values.some(val => val.label === i18next.t("common:modules.statisticDashboard.button.all"));
        }
    }
};
</script>

<template>
    <div>
        <div
            v-for="(region, index) in regions"
            :key="region.attrName"
            class="region-filter"
        >
            <div
                v-if="hasRegionChild(region) && index === 0"
                class="col-sm-12 mb-2"
            >
                <label
                    class="col-form-label-sm mb-1"
                    :for="'top-region-filter-' + index"
                >
                    {{ region.name }}
                </label>
                <br>
                <button
                    v-if="region?.values.length"
                    class="btn btn-sm btn-outline-secondary rounded-pill lh-1 me-2 mb-2 p-2"
                    @click="selectAll(region)"
                >
                    <i class="bi bi-toggles" />
                    {{ $t("common:modules.statisticDashboard.button.all") }}
                </button>
                <button
                    v-for="(value, idx) in region.values"
                    :id="'top-region-filter' + index"
                    :key="idx"
                    class="btn btn-sm btn-outline-secondary lh-1 rounded-pill me-2 mb-2 p-2"
                    :class="toggleButtonActive(value, region.selectedValues)"
                    @click="updatesTopLevelRegionSelectedValues(value, region)"
                >
                    {{ value.label }}
                </button>
            </div>
            <div
                v-else
                class="col-sm-12 mb-2"
            >
                <label
                    class="col-form-label-sm mb-1"
                    :for="'region-filter-' + index"
                >
                    {{ region.name }}
                </label>
                <Multiselect
                    :id="'region-filter' + index"
                    :model-value="region.selectedValues"
                    :multiple="true"
                    :options="getRegionsSorted(region.values, region.selectedValues)"
                    :searchable="true"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :show-labels="false"
                    :limit="3"
                    :limit-text="count => count + ' ' + $t('common:modules.statisticDashboard.label.more')"
                    :allow-empty="true"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    :loading="region.loadingDataCounter > 0"
                    :disabled="region.loadingDataCounter > 0"
                    label="label"
                    track-by="label"
                    @update:model-value="setSelectedValuesToRegion($event, region)"
                >
                    <template #clear>
                        <div class="multiselect__clear">
                            <i class="bi bi-search" />
                        </div>
                    </template>
                </Multiselect>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@import "~variables";
    .region-filter {
        .active-button {
            background: $light-blue;
            color: $black;
            border-color: $light-blue;
        }

        .multiselect .multiselect__spinner:after, .multiselect__spinner:before {
            position: absolute;
            content: "";
            top: 50%;
            left: 50%;
            margin: -8px 0 0 -8px;
            width: 16px;
            height: 16px;
            border-radius: 100%;
            border: 2px solid transparent;
            border-top-color: $dark_grey;
            box-shadow: 0 0 0 1px transparent;
        }
    }
</style>

