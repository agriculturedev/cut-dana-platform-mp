<script>
import Multiselect from "vue-multiselect";
import isObject from "../../../shared/js/utils/isObject";
import {mapGetters, mapMutations} from "vuex";
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import sortBy from "../../../shared/js/utils/sortBy";
import StatisticDashboardFilterRegions from "./StatisticDashboardFilterRegions.vue";

export default {
    name: "StatisticDashboardFilter",
    components: {
        Multiselect,
        AccordionItem,
        FlatButton,
        StatisticDashboardFilterRegions
    },
    props: {
        categories: {
            type: Array,
            required: false,
            default: () => []
        },
        areCategoriesGrouped: {
            type: Boolean,
            required: false,
            default: false
        },
        timeStepsFilter: {
            type: Array,
            required: false,
            default: () => []
        },
        statistics: {
            type: [Array, Boolean],
            required: false,
            default: false
        },
        regions: {
            type: Object,
            required: false,
            default: () => {
                return {};
            }
        },
        selectedLevel: {
            type: Object,
            required: false,
            default: () => {
                return {};
            }
        }
    },

    emits: ["changeCategory", "changeFilterSettings", "resetStatistics", "toggleFilter"],
    data () {
        return {
            sortedCategories: [],
            sortedStatisticNames: [],
            sortedSelectedStatistics: [],
            sortedDates: []
        };
    },

    computed: {
        ...mapGetters("Maps", ["projection"]),
        ...mapGetters("Modules/StatisticDashboard", [
            "flattenedRegions",
            "selectedCategories",
            "selectedRegions",
            "selectedRegionsValues",
            "selectedDates",
            "selectedDatesValues",
            "selectedStatistics",
            "selectedReferenceData"
        ]),

        /**
         * Check if all the input options are chosen.
         * @returns {Boolean} true if all the input are not empty.
         */
        validated () {
            if (this.getSelectedStatisticNames(this.selectedStatistics).length && this.selectedRegions.length && this.selectedDates.length) {
                return true;
            }

            return false;
        }
    },
    watch: {
        /**
         * Resets the statistics if no category is selected and emits the names of the selected categories or an empty array.
         * @param {Object[]} newValue - The selected categories.
         * @returns {void}
         */
        selectedCategories: {
            handler (newValue) {
                if (newValue.length === 0) {
                    this.setSelectedStatistics({});
                }
                this.$emit("changeCategory", newValue);
                this.sortedCategories = this.getCategoriesSorted(this.categories, newValue);
            },
            deep: true
        },

        statistics: {
            handler (val) {
                this.sortedStatisticNames = this.getStatisticNamesSorted(val, this.selectedStatistics);
                this.sortedSelectedStatistics = this.getSelectedStatisticNames(this.selectedStatistics);
            },
            deep: true
        },

        selectedStatistics: {
            handler (newValue) {
                this.emitFilterSettings(newValue, this.selectedRegionsValues, this.selectedDatesValues);
                this.sortedStatisticNames = this.getStatisticNamesSorted(this.statistics, this.selectedStatistics);
                this.sortedSelectedStatistics = this.getSelectedStatisticNames(this.selectedStatistics);
            },
            deep: true
        },
        selectedDates: {
            handler () {
                this.emitFilterSettings(this.selectedStatistics, this.selectedRegionsValues, this.selectedDatesValues);
                this.sortedDates = this.getDatesSorted(this.timeStepsFilter, this.selectedDates);
            },
            deep: true
        },
        selectedRegions: {
            handler () {
                this.emitFilterSettings(this.selectedStatistics, this.selectedRegionsValues, this.selectedDatesValues);
            },
            deep: true
        }
    },

    mounted () {
        this.emitFilterSettings(this.selectedStatistics, this.selectedRegionsValues, this.selectedDatesValues);
        this.sortedCategories = this.getCategoriesSorted(this.categories, this.selectedCategories);
        this.sortedStatisticNames = this.getStatisticNamesSorted(this.statistics, this.selectedStatistics);
        this.sortedSelectedStatistics = this.getSelectedStatisticNames(this.selectedStatistics);
        this.sortedDates = this.getDatesSorted(this.timeStepsFilter, this.selectedDates);
    },

    methods: {
        ...mapMutations("Modules/StatisticDashboard", [
            "setSelectedCategories",
            "setSelectedRegions",
            "setSelectedDates",
            "setSelectedStatistics"
        ]),

        /**
         * Gets the categories sorted.
         * @param {Object[]} categories The categories.
         * @param {Object[]} selectedCategories The selected categories.
         * @returns {Object[]} a sorted list of categories with selected ones first.
         */
        getCategoriesSorted (categories, selectedCategories) {
            if (!Array.isArray(categories) || !Array.isArray(selectedCategories)) {
                return [];
            }
            const nonSelectedCategories = [{name: i18next.t("common:modules.statisticDashboard.button.all")}, ...categories].filter(category => !selectedCategories.some(selectedCategory => selectedCategory.name === category.name)),
                result = [...selectedCategories, ...nonSelectedCategories];

            return result;
        },
        /**
         * Gets the statistic names sorted.
         * @param {Object[]} statistics All statistics.
         * @param {Object} selectedStatisticsObject The selected statistics object.
         * @returns {Object[]} a list of all statistics sorted by selected ones first.
         */
        getStatisticNamesSorted (statistics, selectedStatisticsObject) {
            if (!Array.isArray(statistics) || !isObject(selectedStatisticsObject)) {
                return [];
            }
            const allStatistics = [],
                selectedStatistics = [],
                selectedStatisticsKeys = Object.keys(selectedStatisticsObject).sort((a, b) => selectedStatisticsObject[a].selectedOrder - selectedStatisticsObject[b].selectedOrder);
            let notSelectedStatistics = [],
                result = [];

            statistics.forEach(stat => {
                Object.keys(stat).forEach(key => {
                    allStatistics.push({
                        key: key,
                        name: stat[key]?.name,
                        category: stat[key]?.category
                    });
                });
            });

            notSelectedStatistics = allStatistics.filter(statistic => !Object.prototype.hasOwnProperty.call(selectedStatisticsObject, statistic.key));
            selectedStatisticsKeys.forEach(key => selectedStatistics.push(allStatistics.find(stat => stat.key === key)));
            result = sortBy([...selectedStatistics, ...notSelectedStatistics], "name");

            return result;
        },
        /**
         * Gets the selected statistic names by given selected statistics object.
         * @param {Object} selectedStatistics The selected statistic object.
         * @returns {Object[]} the selected statistics as array of objects.
         */
        getSelectedStatisticNames (selectedStatistics) {
            if (!isObject(selectedStatistics)) {
                return [];
            }
            return Object.keys(selectedStatistics).map(key => {
                return {
                    key: key,
                    name: selectedStatistics[key]?.name,
                    category: selectedStatistics[key]?.category
                };
            });
        },
        /**
         * Gets the dates sorted with the selected ones first.
         * @param {Object[]} timeStepsFilter The timesteps filter array.
         * @param {Object[]} selectedDates The selected dates.
         * @returns {Object[]} the sorted array.
         */
        getDatesSorted (timeStepsFilter, selectedDates) {
            if (!timeStepsFilter.length) {
                return [];
            }
            if (!Array.isArray(selectedDates) || !selectedDates.length) {
                return timeStepsFilter;
            }
            const notSelectedDates = timeStepsFilter.filter(timeStep => !selectedDates.some(selectedStep => selectedStep.label === timeStep.label)),
                sortedDates = [...selectedDates, ...notSelectedDates];

            return sortedDates;
        },

        /**
         * Checks if all filter settings are selected.
         * @param {Object[]} statistics - The selected statistics.
         * @param {String[]} regions - The names of the selected regions.
         * @param {Object[]} dates - The selected dates.
         * @return {Number} 1 if true otherwise 0.
         */
        allFilterSettingsSelected (statistics, regions, dates) {
            return isObject(statistics) && Object.keys(statistics).length && regions.length && dates.length;
        },

        /**
         * Emits the filter settings if all are selected.
         * @param {Object[]} statistics - The selected statistics.
         * @param {String[]} regions - The names of the selected regions.
         * @param {Object[]} dates - The selected dates.
         * @return {void}
         */
        emitFilterSettings (statistics, regions, dates) {
            if (this.allFilterSettingsSelected(statistics, regions, dates)) {
                this.$emit("changeFilterSettings", regions, dates, this.selectedReferenceData);
            }
            else {
                this.$emit("resetStatistics");
            }
        },

        /**
         * Adds the given statistics.
         * @param {Object[]} statistics - The statistics to add.
         * @returns {void}
         */
        addStatisticsToSelect (statistics) {
            this.setSelectedStatistics({});
            [...statistics].forEach((statistic, selectIdx) => {
                statistic.selectedOrder = selectIdx;
                this.selectedStatistics[statistic?.key] = statistic;
            });
        },

        /**
         * Removes the statistics if their category is deselected.
         * If the category "alle" is still selected, no statistics will be removed.
         * @param {Object} category - The deselected category.
         * @returns {void}
         */
        removeSelectedStatsByCategory (category) {
            const selectedStatisticsCopy = {...this.selectedStatistics},
                isCategoryAllSelected = this.selectedCategories.filter(selectedCategory => selectedCategory.name === i18next.t("common:modules.statisticDashboard.button.all")).length,
                statsToDelete = this.sortedSelectedStatistics.filter(statistic => statistic.category === category.name);

            if (category.name !== i18next.t("common:modules.statisticDashboard.button.all") && isCategoryAllSelected) {
                return;
            }

            statsToDelete.forEach(statistic => {
                delete selectedStatisticsCopy[statistic.key];
            });
            this.setSelectedStatistics(selectedStatisticsCopy);
        }
    }
};
</script>

<template>
    <div>
        <h5 class="mb-1">
            {{ $t("common:modules.statisticDashboard.headings.addFilter") }}
        </h5>
        <AccordionItem
            id="filter-accordion-statistic"
            title="Statistiken"
            :is-open="true"
            :font-size="'font-size-base'"
            :coloured-header="true"
        >
            <div class="col-sm-12">
                <label
                    class="col-form-label-sm"
                    for="categoryfilter"
                >
                    {{ $t("common:modules.statisticDashboard.label.category") }}</label>
                <Multiselect
                    id="categoryfilter"
                    :model-value="selectedCategories"
                    :options="sortedCategories"
                    :searchable="true"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :show-labels="false"
                    :allow-empty="true"
                    :multiple="true"
                    :group-values="areCategoriesGrouped ? 'categories' : ''"
                    :group-label="areCategoriesGrouped ? 'name' : ''"
                    :group-select="false"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    track-by="name"
                    label="name"
                    @update:model-value="setSelectedCategories"
                    @remove="removeSelectedStatsByCategory"
                >
                    <template #clear>
                        <div class="multiselect__clear">
                            <i class="bi bi-search" />
                        </div>
                    </template>
                </Multiselect>
            </div>
            <div class="col-sm-12">
                <label
                    class="col-form-label-sm"
                    for="dropdownButton"
                >
                    {{ $t("common:modules.statisticDashboard.label.statistics") }}
                </label>
                <Multiselect
                    id="statisticfilter"
                    :model-value="sortedSelectedStatistics"
                    :options="sortedStatisticNames"
                    :searchable="true"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :show-labels="false"
                    :allow-empty="true"
                    :multiple="true"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    :limit="3"
                    :limit-text="count => count + ' ' + $t('common:modules.statisticDashboard.label.more')"
                    track-by="key"
                    label="name"
                    @update:model-value="addStatisticsToSelect"
                >
                    <template #clear>
                        <div class="multiselect__clear">
                            <i class="bi bi-search" />
                        </div>
                    </template>
                </Multiselect>
            </div>
        </AccordionItem>
        <AccordionItem
            id="filter-accordion-region"
            :title="$t('common:modules.statisticDashboard.label.geographical')"
            :is-open="true"
            :font-size="'font-size-base'"
            :coloured-header="true"
        >
            <StatisticDashboardFilterRegions
                :regions="flattenedRegions"
                :selected-level="selectedLevel"
            />
        </AccordionItem>
        <AccordionItem
            id="filter-accordion-date"
            :title="$t('common:modules.statisticDashboard.label.time')"
            :is-open="true"
            :font-size="'font-size-base'"
            :coloured-header="true"
        >
            <div class="col-sm-12">
                <label
                    class="col-form-label-sm"
                    for="timefilter"
                >
                    {{ $t("common:modules.statisticDashboard.label.year") }}</label>
                <Multiselect
                    id="timefilter"
                    :model-value="selectedDates"
                    :multiple="true"
                    :options="sortedDates"
                    :searchable="true"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :show-labels="false"
                    :limit="3"
                    :limit-text="count => count + ' ' + $t('common:modules.statisticDashboard.label.more')"
                    :allow-empty="true"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    label="label"
                    track-by="label"
                    @update:model-value="setSelectedDates"
                >
                    <template #clear>
                        <div class="multiselect__clear">
                            <i class="bi bi-search" />
                        </div>
                    </template>
                </Multiselect>
            </div>
        </AccordionItem>
        <div class="col-md-12 d-flex justify-content-center mt-2">
            <FlatButton
                :aria-label="$t('common:modules.statisticDashboard.button.done')"
                :interaction="() => $emit('toggleFilter')"
                :text="$t('common:modules.statisticDashboard.button.done')"
                :icon="'bi-check2'"
                :disabled="!validated"
            />
        </div>
    </div>
</template>

<style lang="scss">
@import "~variables";

.static-dashboard .multiselect, .static-dashboard .multiselect__tags {
    font-family: inherit;
    font-size: 11px;
}

.static-dashboard .multiselect__strong{
    font-family: "MasterPortalFont Bold";
}

.static-dashboard .multiselect__tags {
    padding-left: 25px;
}

.static-dashboard .multiselect__tag {
        border-radius: 25px;
        padding-top: 5px;
        color: $black;
}
.static-dashboard .multiselect__tag-icon::after {
    color: $black;
}

.static-dashboard .multiselect__clear {
    position: absolute;
    font-size: 12px;
    top: 12px;
    left: 9px;
}
.multiselect__tag-icon:focus, .multiselect__tag-icon:hover{
  background: $secondary;
  color: $white;
}
.multiselect__tag-icon:focus:after,
.multiselect__tag-icon:hover:after {
    color: $white;
}
.static-dashboard .multiselect__option--selected.multiselect__option--highlight,
.static-dashboard .multiselect__option--selected.multiselect__option--highlight:after,
.static-dashboard .multiselect__option:after,
.static-dashboard .multiselect__option--selected,
.static-dashboard .multiselect__option--selected:after,
.static-dashboard .multiselect__tag {
  background: $light-blue;
  color: $black;
  font-weight: normal;
}

.static-dashboard .multiselect__option--highlight,
.static-dashboard .multiselect__option--highlight:after {
    background: $secondary;
}

.static-dashboard .multiselect__select {
    height: 30px;
}
</style>
