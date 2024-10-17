<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import TableComponent from "../../../shared/modules/table/components/TableComponent.vue";
import isObject from "../../../shared/js/utils/isObject";
import getters from "../store/gettersStatisticDashboard";
import GridComponent from "./StatisticGridComponent.vue";
import Controls from "./StatisticDashboardControls.vue";
import StatisticFilter from "./StatisticDashboardFilter.vue";
import LegendComponent from "./StatisticDashboardLegend.vue";
import FetchDataHandler from "../js/fetchData.js";
import StatisticsHandler from "../js/handleStatistics.js";
import FeaturesHandler from "../js/handleFeatures.js";
import StatisticSwitcher from "./StatisticDashboardSwitcher.vue";
import {rawLayerList} from "@masterportal/masterportalapi";
import {getFeaturePOST} from "../../../shared/js/api/wfs/getFeature.js";
import ChartProcessor from "../js/chartProcessor.js";
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import Multiselect from "vue-multiselect";

import {
    and as andFilter,
    equalTo as equalToFilter,
    or as orFilter
} from "ol/format/filter";
import dayjs from "dayjs";
import WFS from "ol/format/WFS";
import sortBy from "../../../shared/js/utils/sortBy";

export default {
    name: "StatisticDashboard",
    components: {
        TableComponent,
        GridComponent,
        Controls,
        StatisticFilter,
        StatisticSwitcher,
        LegendComponent,
        AccordionItem,
        FlatButton,
        Multiselect,
        IconButton
    },
    data () {
        return {
            tableData: [],
            chosenTableData: [],
            testFixedData: {
                items: []
            },
            selectMode: "column",
            showHeader: true,
            sortable: true,
            categories: [],
            statisticsByCategory: false,
            loadedFilterData: false,
            loadedReferenceData: false,
            loadedFeatures: [],
            timeStepsFilter: [],
            regions: [],
            allRegions: [],
            selectedLevelRegionNameAttribute: [],
            areCategoriesGrouped: false,
            dates: [],
            sortedRows: [],
            currentChart: {},
            chartCounts: 0,
            showGrid: false,
            referenceData: undefined,
            referenceFeatures: {},
            selectedColumn: undefined,
            colorArrayDifference: ["#E28574", "#89C67F"],
            legendValue: [],
            showNoLegendData: false,
            showFilter: false,
            showAllHiddenTags: false,
            showLegendView: false,
            showLimitView: false,
            selectedFilteredRegions: [],
            allFilteredRegions: [],
            numberOfColouredBars: 3,
            diagramType: undefined,
            sideMenuWidth: undefined,
            canvasSize: undefined,
            statisticsData: undefined,
            noDataInColumn: undefined
        };
    },
    computed: {
        ...mapGetters("Modules/StatisticDashboard", [
            "selectedRegions",
            "selectedDates",
            "selectedStatistics",
            "selectedCategories",
            "data",
            "chartTableToggle",
            "chosenStatisticName",
            "selectedRegionsValues",
            "selectedReferenceData",
            "flattenedRegions",
            "selectedDatesValues",
            "numberOfClasses",
            "allowPositiveNegativeClasses",
            "classificationMode",
            "stepValues",
            "legendData",
            "selectedLevel",
            "minNumberOfClasses",
            "maxNumberOfClasses",
            "selectableColorPalettes",
            "selectedColorPaletteIndex",
            "colorPalette",
            "opacity",
            "colorScheme",
            "lineLimit",
            "barLimit",
            "levelTitle",
            "subtitle",
            "addTotalCount"
        ]),
        ...mapGetters("Maps", ["projection"]),

        /**
         * Gets the names of the selected filters.
         * @returns {String[]} The names.
         */
        selectedFilters () {
            const selectedRegions = this.selectedRegions.map(region => region.label),
                selectedDates = this.selectedDates.map(dates => dates.label);

            return [...new Set([...this.selectedStatisticsNames, ...selectedRegions, ...selectedDates])];
        },
        /**
         * Returns true or false, depending on the number of selected filters.
         * @returns {Boolean} True if the number of filters are more than five.
         */
        countSelectedFilters () {
            return this.selectedFilters.length > 5;
        },
        /**
         * Gets the names of the selected statistics.
         * @returns {String[]} The names.
         */
        selectedStatisticsNames () {
            return Object.values(this.selectedStatistics).map(statistic => statistic?.name);
        },
        /**
         * Gets the Descriptions of the selected statistics.
         * @returns {Object[]} The Descriptions.
         */
        controlDescription () {
            if (!this.hasDescription(this.selectedStatistics)) {
                return [];
            }
            return this.setDescriptionsOfSelectedStatistics(this.selectedStatistics);
        },
        /**
         * Gets the buttons with group regions
         * @returns {Object[]} The button group regions
         */
        buttonGroupRegions () {
            if (!Array.isArray(this.data) || !this.data.length) {
                return [];
            }

            return this.data.map(value => {
                return {name: value?.levelName};
            });
        },
        /**
         * Checks if the chart should be shown.
         * @returns {Boolean} true if it should shows the chart, false otherwise.
         */
        showChart () {
            return this.chartTableToggle === "chart";
        },
        /**
         * Checks if the table should be shown.
         * @returns {Boolean} true if it should shows the table, false otherwise.
         */
        showTable () {
            return this.chartTableToggle === "table";
        },
        /**
         * Returns the statisticName of chart.
         * @returns {String[]} the statistic name.
         */
        statisticNameOfChart () {
            return typeof this.chosenStatisticName === "string" && this.chosenStatisticName !== "" ? [this.chosenStatisticName] : this.selectedStatisticsNames;
        }
    },
    watch: {
        selectedReferenceData () {
            if (this.selectedRegionsValues.length && this.selectedDates.length) {
                this.checkFilterSettings(this.selectedRegionsValues, getters.selectedDatesValues(null, {selectedDates: this.selectedDates}), this.selectedReferenceData);
            }
        },
        selectedDatesValues () {
            if (this.showLimitView) {
                this.updateLimitedData();
            }
        },
        selectedRegionsValues () {
            if (this.flattenedRegions?.length) {
                this.flattenedRegions[this.flattenedRegions.length - 1].selectedValues = this.selectedRegions;
            }

            if (this.showLimitView) {
                this.updateLimitedData();
            }
        },
        chosenStatisticName (val) {
            this.$nextTick(() => {
                this.chosenTableData = this.getTableData(this.statisticsData, val);
                this.handleChartData(
                    this.statisticNameOfChart,
                    this.selectedRegionsValues,
                    this.selectedDatesValues,
                    this.statisticsData,
                    this.selectedReferenceData?.type
                );
            });
        },
        selectedStatisticsNames (val, oldVal) {
            if (Array.isArray(oldVal) && oldVal.length > 1 && Array.isArray(val) && val.length === 1 && !val.includes(this.chosenStatisticName)) {
                this.setChosenStatisticName(val[0]);
                this.selectedFilteredRegions = this.selectedFilteredRegions.filter(name => this.selectedRegionsValues.includes(name));
            }

            if (!val.length) {
                this.chosenTableData = [];
                this.setChosenStatisticName("");
            }
            this.handleChartData(
                this.statisticNameOfChart,
                this.selectedRegionsValues,
                this.selectedDatesValues,
                this.statisticsData,
                this.selectedReferenceData?.type
            );

        },
        statisticsData (val) {
            this.chosenTableData = this.getTableData(val, this.chosenStatisticName);
            this.handleChartData(
                this.statisticNameOfChart,
                this.selectedRegionsValues,
                this.selectedDatesValues,
                this.statisticsData,
                this.selectedReferenceData?.type
            );
        },
        legendData: {
            handler (val) {
                this.legendValue = FeaturesHandler.getLegendValue(val);
            },
            deep: true
        },

        classificationMode (val) {
            if (val === "custom") {
                return;
            }
            this.setStepValues(
                FeaturesHandler.getStepValue(
                    this.statisticsData[this.selectedStatisticsNames[0]],
                    this.numberOfClasses,
                    this.selectedColumn,
                    val,
                    this.allowPositiveNegativeClasses
                ));
            this.setColorPalette(this.createColorPalette());
        },

        allowPositiveNegativeClasses (val) {
            this.setStepValues(
                FeaturesHandler.getStepValue(
                    this.statisticsData[this.selectedStatisticsNames[0]],
                    this.numberOfClasses,
                    this.selectedColumn,
                    this.classificationMode,
                    val
                )
            );
        },

        numberOfClasses (val, oldVal) {
            if (this.classificationMode === "custom" && val > oldVal) {
                return;
            }
            else if (this.classificationMode === "custom") {
                this.setStepValues(this.stepValues.slice(0, val));
                return;
            }
            this.setStepValues(FeaturesHandler.getStepValue(
                this.statisticsData[this.selectedStatisticsNames[0]],
                val,
                this.selectedColumn,
                this.classificationMode,
                this.allowPositiveNegativeClasses
            ));
            this.setColorPalette(this.createColorPalette());
        },

        selectedColorPaletteIndex () {
            this.setColorPalette(this.createColorPalette());
        },

        opacity () {
            this.updateAfterLegendChange();
        },

        stepValues () {
            this.updateAfterLegendChange();
        },

        colorPalette () {
            this.updateAfterLegendChange();
        },
        chartTableToggle (val) {
            if (val === "table" && isObject(this.statisticsData) && Object.keys(this.statisticsData).length && this.chosenStatisticName === "") {
                this.chosenTableData = this.getTableData(this.statisticsData, this.chosenStatisticName);
            }
        }
    },
    async created () {
        this.layer = await this.addNewLayerIfNotExists({layerName: "statistic-dashboard"});
        this.filterMap = {
            "Or": "OR",
            "And": "AND",
            "PropertyIsEqualTo": "=",
            "PropertyIsNotEqualTo": "<>",
            "PropertyIsLessThan": "<",
            "PropertyIsLessThanOrEqualTo": "<=",
            "PropertyIsGreaterThan": ">",
            "PropertyIsGreaterThanOrEqualTo": ">="
        };
    },
    mounted () {
        this.sideMenuWidth = document.getElementById("mp-menu-secondaryMenu").style.width;
        document.getElementById("mp-menu-secondaryMenu").style.width = "47vw";

        if (typeof this.selectedLevel === "undefined") {
            this.setSelectedLevel(this.data[0]);
        }
        this.initializeData(this.selectedLevel);
        if (this.minNumberOfClasses < 2) {
            this.setMinNumberOfClasses(2);
        }
        if (this.maxNumberOfClasses < 3 || this.maxNumberOfClasses <= this.minNumberOfClasses) {
            this.setMaxNumberOfClasses(Math.max(3, this.minNumberOfClasses + 1));
        }
        if (this.numberOfClasses < this.minNumberOfClasses) {
            this.setNumberOfClasses(this.minNumberOfClasses);
        }
        else if (this.numberOfClasses > this.maxNumberOfClasses) {
            this.setNumberOfClasses(this.maxNumberOfClasses);
        }
    },
    unmounted () {
        document.getElementById("mp-menu-secondaryMenu").style.width = this.sideMenuWidth;
    },
    methods: {
        ...mapMutations("Modules/StatisticDashboard", [
            "setLegendData",
            "setDescriptionsOfSelectedStatistics",
            "setChosenStatisticName",
            "setStepValues",
            "setColorPalette",
            "setSelectedLevel",
            "setMinNumberOfClasses",
            "setMaxNumberOfClasses",
            "setNumberOfClasses",
            "setSelectedReferenceValueTag",
            "setChartTableToggle",
            "setLevelTitle",
            "setStatisticsByCategories",
            "setFlattenedRegions",
            "setSelectedCategories",
            "setSelectedRegions",
            "setSelectedDates",
            "setSelectedReferenceData",
            "setSelectedStatistics",
            "setSelectableColorPalettes"
        ]),
        ...mapActions("Maps", ["addNewLayerIfNotExists"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),

        /**
         * Prepares and downloads the statistic data.
         * @param {Function} onsuccess The function which is called when the data is ready to download.
         * @returns {void}
         */
        downloadData (onsuccess) {
            if (typeof onsuccess !== "function") {
                return;
            }

            if (!isObject(this.statisticsData)) {
                onsuccess(null);
                return;
            }

            const csv = {},
                csvHeader = [""],
                csvSubHeader = ["Gebiet"];
            let elements = [];

            Object.entries(this.statisticsData).forEach(([statisticName, statisticValues]) => {
                const statisticAreaNames = Object.keys(statisticValues),
                    statisticTimeLabels = Object.keys(statisticValues[statisticAreaNames[0]]).reverse(),
                    amount = statisticTimeLabels.length;

                csvSubHeader.push(...statisticTimeLabels);
                for (let i = 0; i < amount; i++) {
                    csvHeader.push(statisticName);
                }
                statisticAreaNames.forEach(statisticAreaName => {
                    if (!Array.isArray(csv[statisticAreaName])) {
                        csv[statisticAreaName] = [];
                    }
                    const statisticTimeValues = Object.values(statisticValues[statisticAreaName]).reverse();

                    csv[statisticAreaName].push(...statisticTimeValues);
                });
            });
            elements = Object.entries(csv).map(([area, values]) => [area, ...values]);

            onsuccess([csvHeader, csvSubHeader, ...elements]);
        },

        /**
         * Performs necessary updates after the user has made changes in legend settings.
         * @returns {void}
         */
        updateAfterLegendChange () {
            if (this.selectedStatisticsNames?.length === 1) {
                this.updateFeatureStyle(
                    this.selectedColumn,
                    typeof this.selectedReferenceData !== "undefined",
                    this.selectedReferenceData);
            }
        },

        /**
         * Gets the unique values for the inputs of the filter for the given level.
         * @param {Object} level The level to get the unique values for.
         * @param {Object} level.mappingFilter The mapping object which holds the configuration of the time attribute and region name attribute.
         * @param {Object} level.timeAttribute The config object for the time attribute.
         * @param {String} level.timeAttribute.attrName The attrName of the time attribute.
         * @param {String} level.timeAttribute.inputFormat The format of the incoming date.
         * @param {String} level.timeAttribute.outputFormat The format in which the date should be displayed to the user.
         * @param {Object} level.regionNameAttribute The config object of the region name attribute.
         * @param {String} level.regionNameAttribute.attrName The attrName of the region name attribute.
         * @returns {Object} An object with the time and region attrName as key and an unique value list as value.
         */
        async getUniqueValuesForLevel (level) {
            if (!isObject(level) || !isObject(level.mappingFilter) || !isObject(level.mappingFilter.timeAttribute) || !isObject(level.mappingFilter.regionNameAttribute)) {
                return {};
            }
            const layerId = level.layerId,
                timeAttribute = level.mappingFilter.timeAttribute.attrName,
                timeInputFormat = level.mappingFilter.timeAttribute.inputFormat,
                timeOutputFormat = level.mappingFilter.timeAttribute.outputFormat,
                regionNameAttribute = level.mappingFilter.regionNameAttribute.attrName;
            let uniqueValues = null;

            uniqueValues = await FetchDataHandler.getUniqueValues(layerId, [timeAttribute, regionNameAttribute], timeInputFormat, timeOutputFormat);

            return uniqueValues;
        },

        /**
         * Gets the time steps for the filter. It will merge the unique list with the given
         * configured time steps if they are configured.
         * @param {Object} timeSteps The time steps object with {Number: Label}.
         * @param {Object} uniqueList The list as object with {value: true}.
         * @param {String} inputFormat The input format for the date.
         * @param {String} outputFormat The format to transform the date to.
         * @returns {Object[]} The merged time steps.
         */
        getTimestepsMerged (timeSteps, uniqueList, inputFormat, outputFormat) {
            let result = [],
                uniqueListAsArray = [];

            if (isObject(uniqueList)) {
                uniqueListAsArray = Object.keys(uniqueList);
                uniqueListAsArray.forEach(uniqueTime => {
                    result.push({value: uniqueTime, label: dayjs(uniqueTime, inputFormat).format(outputFormat)});
                });
            }
            if (isObject(timeSteps)) {
                Object.entries(timeSteps).forEach(([key, value]) => {
                    const uniqueTime = key === "all" ? uniqueListAsArray : uniqueListAsArray.slice(Number(`-${key}`));

                    if (Array.isArray(uniqueTime) && uniqueTime.length) {
                        result.push({value: uniqueTime, label: value});
                    }
                });
            }

            result = sortBy(result, "label").reverse();

            return result;
        },
        /**
         * Get the direction of the bar chart.
         * @param {String[]} regions - The selected regions for the statistic(s).
         * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
         * @returns {String} horizontal or vertical.
         */
        getChartDirection (regions, differenceMode) {
            const regionsLength = differenceMode === false ? regions.length : regions.length - 1,
                chartDirectionValue = this.selectedLevel?.chartDirectionValue ? this.selectedLevel?.chartDirectionValue : 5;

            return regionsLength < chartDirectionValue ? "vertical" : "horizontal";
        },

        /**
         * Gets all regions list with all option
         * @param {String[]} regions The regions.
         * @returns {Object[]} All regions
         */
        getAllRegions (regions) {
            const result = [];

            if (!Array.isArray(regions) || !regions.length) {
                return [];
            }

            result.push({value: regions, label: "Alle Gebiete"});

            regions.forEach(region => {
                result.push({value: region, label: region});
            });

            return result;
        },

        /**
         * Sets the statistics selected in the filter.
         * If the category "alle" is selected, all statistics are added.
         * @param {Object[]} categories - The categories.
         * @returns {void}
         */
        setStatisticsByCategories (categories) {
            const statistics = [];

            if (categories.some(category => category.name === i18next.t("common:modules.statisticDashboard.button.all"))) {
                this.categories.forEach(category => {
                    statistics.push(StatisticsHandler.getStatisticsByCategory(category.name, this.getSelectedLevelStatisticsAttributes(this.selectedLevel)));
                });
            }
            else {
                categories.forEach(category => {
                    statistics.push(StatisticsHandler.getStatisticsByCategory(category.name, this.getSelectedLevelStatisticsAttributes(this.selectedLevel)));
                });
            }
            this.statisticsByCategory = statistics;
        },

        /**
         * Sets the sorted rows.
         * @param {Array[]} value - An array of arrays of sorted rows.
         * @returns {void}
         */
        setSortedRows (value) {
            this.sortedRows = value;
        },

        /**
         * Checks if there is a reference value for the regions or dates and merges them.
         * @param {String[]} regions - The selected regions for the statistic(s).
         * @param {String[]} dates - The selected dates for the statistic(s).
         * @param {Object} referenceData - The selected reference data.
         * @returns {void}
         */
        checkFilterSettings (regions, dates, referenceData) {
            if (!isObject(referenceData)) {
                this.handleFilterSettings(regions, dates, false);
                return;
            }
            if (typeof referenceData.value === "string") {
                if (!regions.includes(referenceData.value)) {
                    regions.push(referenceData.value);
                }
                this.handleFilterSettings([...new Set(regions)], dates, "region");
            }
            else if (isObject(referenceData.value) && typeof referenceData.value.label === "string") {
                dates.push(referenceData.value.value);
                this.handleFilterSettings(regions, [...new Set(dates)], "date");
            }
        },

        /**
         * Returns the color palette for choropleth map and legend.
         * @returns {Number[][]} - An array of rgb arrays containing the color palette.
         */
        createColorPalette () {
            const color = this.selectableColorPalettes?.[this.selectedColorPaletteIndex]?.baseColor,
                r = color?.[0],
                g = color?.[1],
                b = color?.[2],
                palette = [];

            let baseColor;

            if (typeof r === "number" && r >= 0 && r <= 255 &&
                typeof g === "number" && g >= 0 && g <= 255 &&
                typeof b === "number" && b >= 0 && b <= 255) {

                baseColor = [r, g, b];
            }
            else {
                baseColor = [0, 0, 0];
            }

            for (let i = 0; i < this.numberOfClasses; i++) {
                const newColor = baseColor.map(v => Math.floor(v + i * (255 - v) / this.numberOfClasses));

                palette.unshift(newColor);
            }

            return palette;
        },

        /**
         * Updates the features displayed on the map and their styles.
         * @param {String} date - The chosen date from the column.
         * @param {Boolean} differenceMode - true if difference mode is on otherwise false.
         * @param {Object} [selectedReferenceData] - The selected reference data.
         * @returns {void}
         */
        updateFeatureStyle (date, differenceMode, selectedReferenceData) {
            this.layer.getSource().clear();

            const regionNameAttribute = this.getSelectedLevelRegionNameAttributeInDepth(this.selectedLevel?.mappingFilter?.regionNameAttribute).attrName,
                selectedLevelDateAttribute = this.getSelectedLevelDateAttribute(this.selectedLevel);

            let filteredFeatures;

            if (typeof date === "undefined" || typeof selectedLevelDateAttribute.attrName === "undefined") {
                filteredFeatures = this.loadedFeatures;
            }
            else {
                filteredFeatures = FeaturesHandler.filterFeaturesByKeyValue(this.loadedFeatures, selectedLevelDateAttribute.attrName, date);
            }

            this.layer.getSource().addFeatures(filteredFeatures);

            FeaturesHandler.styleFeaturesByStatistic(
                filteredFeatures,
                this.statisticsData[this.selectedStatisticsNames[0]],
                this.colorPalette.map(v => [...v, this.opacity]),
                date,
                regionNameAttribute,
                this.stepValues
            );
            this.setLegendData({
                "color": this.colorPalette.map(v => [...v, this.opacity]),
                "value": this.stepValues
            });

            if (differenceMode && selectedReferenceData?.type === "region") {
                const referenceFeature = filteredFeatures.find(feature => feature.get(regionNameAttribute) === selectedReferenceData.value);

                FeaturesHandler.styleFeature(referenceFeature, this.colorScheme.referenceRegion);
            }
        },

        /**
         * Updates the created reference tag.
         * @param {String} date the selected date
         * @param {Object} selectedLevel the selected level
         * @param {Object} referenceFeatures the selected region reference
         * @returns {void}
         */
        updateReferenceTag (date, selectedLevel, referenceFeatures) {
            if (typeof date !== "undefined" && isObject(selectedLevel) && isObject(referenceFeatures)) {
                const selectedLevelDateAttribute = this.getSelectedLevelDateAttribute(selectedLevel);

                if (isObject(selectedLevelDateAttribute)) {
                    Object.entries(referenceFeatures).forEach(([key, val]) => {
                        const formattedDate = dayjs(key).format(selectedLevelDateAttribute.outputFormat);

                        if (formattedDate === date) {
                            this.setSelectedReferenceValueTag(val);
                        }
                    });
                }
            }
        },

        /**
         * Set the selected table column.
         * @param {String} value - The selected column (date).
         * @returns {void}
         */
        setSelectedColumn (value) {
            if (this.selectedReferenceData?.type === "region") {
                this.updateReferenceTag(value, this.selectedLevel, this.referenceFeatures);
            }

            this.selectedColumn = value;
            this.noDataInColumn = undefined;

            if (this.classificationMode === "custom") {
                this.noDataInColumn =
                    FeaturesHandler.getStatisticValuesByDate(this.statisticsData[this.selectedStatisticsNames[0]], this.selectedColumn).length === 0;
                this.updateAfterLegendChange();
                return;
            }

            this.setStepValues(
                FeaturesHandler.getStepValue(
                    this.statisticsData[this.selectedStatisticsNames[0]],
                    this.numberOfClasses,
                    this.selectedColumn,
                    this.classificationMode,
                    this.allowPositiveNegativeClasses
                )
            );
        },

        /**
         * Formats the filter expression based on if isDateAttribute is true.
         * @param {String|Number} expression The expression to format.
         * @param {Boolean} isDateAttribute The flag to decide wether formatted as date or not.
         * @returns {String} the formatted expression.
         */
        formatFilterExpression (expression, isDateAttribute) {
            if (typeof expression === "undefined" || typeof isDateAttribute !== "boolean") {
                return expression;
            }
            let formattedExpression = "";

            if (isDateAttribute) {
                formattedExpression = `DATE('${expression}')`;
            }
            else {
                formattedExpression = typeof expression === "string" ? `'${expression}'` : `${expression}`;
            }
            return formattedExpression;
        },
        /**
         * Parses an existing ol filter into an OAF filter string.
         * @param {ol/format/Filter} filter The filter to parse.
         * @param {Object} filterMap The map to parse conditions from ol format to OAF format.
         * @returns {String} The parsed oaf filter string.
         */
        parseOLFilterToOAF (filter, filterMap) {
            if (!filter || !isObject(filterMap)) {
                return "";
            }
            const operator = filterMap[filter?.tagName_],
                dateAttributeName = this.getSelectedLevelDateAttribute(this.selectedLevel)?.attrName;
            let parsedFilter = "";

            if (!Array.isArray(filter?.conditions)) {
                if (filter?.expression && filter?.propertyName && operator) {
                    return `${filter.propertyName} ${operator} ${this.formatFilterExpression(filter.expression, filter.propertyName === dateAttributeName)}`;
                }
                return parsedFilter;
            }
            filter.conditions.forEach((condition, idx) => {
                if (Object.prototype.hasOwnProperty.call(condition, "conditions")) {
                    parsedFilter += `(${this.parseOLFilterToOAF(condition, filterMap)})`;
                    if (idx < filter.conditions.length - 1) {
                        parsedFilter += ` ${operator} `;
                    }
                    return;
                }
                parsedFilter += `${condition.propertyName} ${filterMap[condition.tagName_]} `;
                parsedFilter += this.formatFilterExpression(condition.expression, condition.propertyName === dateAttributeName);
                if (idx < filter.conditions.length - 1) {
                    parsedFilter += ` ${operator} `;
                }
            });
            return parsedFilter;
        },

        /**
         * Handles the filter settings and starts a POST request based on given settings.
         * @param {String[]} regions - The selected regions for the statistic(s).
         * @param {String[]} dates - The selected dates for the statistic(s).
         * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
         * @returns {void}
         */
        async handleFilterSettings (regions, dates, differenceMode) {
            const statsKeys = Object.keys(this.selectedStatistics),
                selectedLayer = this.getRawLayerByLayerId(this.selectedLevel.layerId),
                selectedLevelRegionNameAttribute = this.getSelectedLevelRegionNameAttributeInDepth(this.selectedLevel.mappingFilter.regionNameAttribute),
                selectedLevelDateAttribute = this.getSelectedLevelDateAttribute(this.selectedLevel),
                payload = {
                    featureTypes: [selectedLayer.featureType],
                    featureNS: selectedLayer.featureNS,
                    srsName: this.projection.getCode(),
                    propertyNames: [...statsKeys, selectedLevelRegionNameAttribute.attrName, selectedLevelDateAttribute.attrName, this.selectedLevel.geometryAttribute],
                    filter: this.getFilter(regions, dates)
                };
            let response = null;

            if (selectedLayer.typ === "WFS") {
                response = await getFeaturePOST(selectedLayer.url, payload, error => {
                    console.error(error);
                });
                this.loadedFeatures = new WFS().readFeatures(response);
            }
            else if (selectedLayer.typ === "OAF") {
                payload.propertyNames.splice(payload.propertyNames.indexOf(this.selectedLevel.geometryAttribute), 1);
                this.loadedFeatures = await FetchDataHandler.getOAFFeatures(
                    selectedLayer.url,
                    selectedLayer.collection,
                    payload.propertyNames,
                    this.projection.getCode(),
                    this.selectedLevel.oafRequestCRS,
                    this.selectedLevel.oafDataProjectionCode,
                    this.parseOLFilterToOAF(payload.filter, this.filterMap),
                    this.selectedLevel.oafRequestCRS,
                    400
                );
            }

            if (differenceMode) {
                this.referenceFeatures = {};
            }

            this.statisticsData = this.prepareStatisticsData(this.loadedFeatures, this.selectedStatisticsNames, regions, dates, selectedLevelDateAttribute, selectedLevelRegionNameAttribute, differenceMode);
            this.tableData = this.getTableData(this.statisticsData);
            this.chosenTableData = this.getTableData(this.statisticsData, this.chosenStatisticName);
            this.chartCounts = this.selectedStatisticsNames.length;

            this.handleChartData(this.statisticNameOfChart, regions, dates, this.statisticsData, differenceMode);

            if (this.selectedStatisticsNames.length === 1 && this.classificationMode !== "custom") {
                this.setStepValues(
                    FeaturesHandler.getStepValue(
                        this.statisticsData[this.selectedStatisticsNames[0]],
                        this.numberOfClasses,
                        this.selectedColumn || this.timeStepsFilter.find(v => v.value === dates[0])?.label,
                        this.classificationMode,
                        this.allowPositiveNegativeClasses
                    )
                );
                this.setColorPalette(this.createColorPalette());
            }
            else if (this.selectedStatisticsNames.length === 1) {
                this.updateFeatureStyle(
                    this.selectedColumn,
                    typeof this.selectedReferenceData !== "undefined",
                    this.selectedReferenceData);
            }
            else {
                this.layer.getSource().clear();
                const filteredFeatures = FeaturesHandler.filterFeaturesByKeyValue(this.loadedFeatures, selectedLevelDateAttribute.attrName, this.selectedColumn || dates[0]);

                this.layer.getSource().addFeatures(filteredFeatures);

                filteredFeatures.map(feature => {
                    return FeaturesHandler.styleFeature(feature);
                });
            }
            this.showNoLegendData = this.selectedStatisticsNames.length !== 1;
            if (this.selectedColumn) {
                this.$nextTick(() => {
                    this.updateReferenceTag(this.selectedColumn, this.selectedLevel, this.referenceFeatures);
                });
            }
        },

        /**
         * Handles chart data and resets the showGrid property.
         * @param {String[]} filteredStatistics The statistics.
         * @param {String[]} regions The regions.
         * @param {String[]} dates The dates.
         * @param {Object} preparedData The prepared data.
         * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
         * @returns {void}
         */
        handleChartData (filteredStatistics, regions, dates, preparedData, differenceMode) {
            const directionBarChart = this.getChartDirection(regions, differenceMode);

            this.showGrid = false;
            if (filteredStatistics.length > 1) {
                this.prepareGridCharts(filteredStatistics, preparedData, directionBarChart, differenceMode, dates.length >= 2 && !differenceMode || dates.length >= 3 || dates.length === 2 && differenceMode === "region");
            }

            else if (regions.length >= 1 && preparedData?.[filteredStatistics[0]]) {
                this.$nextTick(() => {
                    if (dates.length >= 2 && !differenceMode || dates.length >= 3 || dates.length === 2 && differenceMode === "region") {
                        this.prepareChartData(filteredStatistics[0], preparedData[filteredStatistics[0]], undefined, "line", differenceMode);
                        return;
                    }
                    this.prepareChartData(filteredStatistics[0], preparedData[filteredStatistics[0]], undefined, "bar", directionBarChart, differenceMode);
                });
            }
        },
        /**
         * Prepares the charts for the grid and also creates canvas elements for each chart to render on.
         * @param {String[]} filteredStatistics The statistics.
         * @param {Object} preparedData The prepared data.
         * @param {String[]} direction - Direction of bar chart.
         * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
         * @param {Boolean} renderAsLine Flag to render line charts. Default is false.
         * @returns {void}
         */
        prepareGridCharts (filteredStatistics, preparedData, direction, differenceMode, renderAsLine = false) {
            this.showGrid = true;

            this.$nextTick(() => {
                filteredStatistics.forEach((statistic, idx) => {
                    const ctx = document.createElement("canvas"),
                        chartContainer = this.$refs[`chart${idx + 1}`];

                    if (!chartContainer) {
                        return;
                    }

                    if (chartContainer.hasChildNodes()) {
                        chartContainer.childNodes[0].remove();
                    }
                    chartContainer.appendChild(ctx);

                    if (renderAsLine) {
                        this.prepareChartData(statistic, preparedData[statistic], ctx, "line", undefined, differenceMode, true);
                        return;
                    }
                    this.prepareChartData(statistic, preparedData[statistic], ctx, "bar", direction, differenceMode, true);
                });
            });
        },
        /**
         * Prepares the chart and also handles the destruction of previous charts.
         * @param {String} topic The topic of the chart.
         * @param {Object} preparedData The data.
         * @param {HTMLElement} canvas The canvas to render the chart on.
         * @param {String} type The type. Can be bar or line.
         * @param {String} direction The direction of the bar chart.
         * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
         * @param {Boolean} renderSimple true if should be rendered as simple chart because its in the grid. Default is false.
         * @param {Boolean} renderToModal true if chart is rendered in modal. Default is false
         * @returns {void}
         */
        prepareChartData (topic, preparedData, canvas, type, direction, differenceMode, renderSimple = false, renderToModal = false) {
            const canvasTmp = canvas || document.createElement("canvas"),
                uniqueTopic = renderToModal ? `modal-${topic}` : topic;

            if (!canvas && this.$refs.chartContainer) {
                if (this.$refs.chartContainer.hasChildNodes()) {
                    this.$refs.chartContainer.childNodes[0].remove();
                }
                this.$refs.chartContainer.style.height = typeof this.canvasSize !== "undefined" && type === "bar" ? this.canvasSize : "";
                this.$refs.chartContainer.appendChild(canvasTmp);
            }
            this.diagramType = type;
            this.currentChart[uniqueTopic] = {};
            if (type === "line") {
                if (this.lineLimit !== null && preparedData && Object.keys(preparedData)?.length > this.lineLimit) {
                    if (!this.showLimitView) {
                        this.currentChart[uniqueTopic].chart = ChartProcessor.createLineChart(topic, this.limitingDataForChart(preparedData, 3), canvasTmp, this.colorScheme.lineCharts, renderSimple);
                    }
                    else {
                        this.currentChart[uniqueTopic].chart = ChartProcessor.createLineChart(topic, this.getNewLimitedData(this.selectedFilteredRegions, preparedData), canvasTmp, this.colorScheme.lineCharts, renderSimple);
                    }

                }
                else {
                    this.showLimitView = false;
                    this.currentChart[uniqueTopic].chart = ChartProcessor.createLineChart(topic, preparedData, canvasTmp, this.colorScheme.lineCharts, renderSimple);
                }
            }
            else if (type === "bar") {
                if (this.barLimit !== null && preparedData && Object.keys(preparedData)?.length > this.barLimit) {
                    if (typeof differenceMode === "string") {
                        this.currentChart[uniqueTopic].chart = ChartProcessor.createBarChart(topic, !this.showLimitView ? this.limitingDataForChart(preparedData, this.barLimit) : this.getNewLimitedData(this.allFilteredRegions, preparedData), direction, canvasTmp, differenceMode, false, renderSimple, this.colorArrayDifference);
                    }
                    else {
                        this.currentChart[uniqueTopic].chart = ChartProcessor.createBarChart(topic, !this.showLimitView ? this.limitingDataForChart(preparedData, this.barLimit) : this.getNewLimitedData(this.allFilteredRegions, preparedData), direction, canvasTmp, differenceMode, this.numberOfColouredBars, renderSimple, ["#DCE2F3", "#d3d3d3"]);
                    }
                }
                else {
                    this.showLimitView = false;
                    if (typeof differenceMode === "string") {
                        this.currentChart[uniqueTopic].chart = ChartProcessor.createBarChart(topic, preparedData, direction, canvasTmp, differenceMode, false, renderSimple, this.colorArrayDifference);
                    }
                    else {
                        this.currentChart[uniqueTopic].chart = ChartProcessor.createBarChart(topic, preparedData, direction, canvasTmp, differenceMode, false, renderSimple);
                    }
                }
            }
        },
        /**
         * Limiting the number of data for charts.
         * @param {Object} data The data.
         * @param {Number} number Number of data in the chart.
         * @returns {Object} The trimmed data.
         */
        limitingDataForChart (data, number) {
            const limitData = Object.fromEntries(Object.entries(data).slice(0, number));

            this.selectedFilteredRegions = this.diagramType === "line" ? Object.keys(limitData) : Object.keys(limitData).slice(0, 3);
            this.allFilteredRegions = Object.keys(limitData);
            this.showLimitView = true;

            return limitData;
        },
        /**
         * Adds the selected region to chart data.
         * @param {Array} region The selected region.
         * @returns {void}
         */
        addSelectedFilteredRegions (region) {
            if (this.allFilteredRegions.length > this.barLimit && this.diagramType === "bar") {
                this.updateChartSize();
            }

            this.selectedFilteredRegions.unshift(region);
            this.allFilteredRegions = this.allFilteredRegions.filter(item => item !== region);
            this.allFilteredRegions.unshift(region);
            this.numberOfColouredBars = this.selectedFilteredRegions.length;
            this.handleChartData(this.statisticNameOfChart, this.diagramType === "line" ? this.selectedFilteredRegions : this.allFilteredRegions, this.selectedDatesValues, this.statisticsData, this.selectedReferenceData?.type);
        },
        /**
         * Increases the canvas size by 45 pixels.
         * @returns {void}
         */
        updateChartSize () {
            const chart = document.querySelector(".chart-container"),
                totalBars = this.allFilteredRegions.length,
                chartHeight = 400,
                newHeight = (totalBars - this.barLimit) * 45 + chartHeight;

            this.canvasSize = chart.style.height = newHeight + "px";
        },
        /**
         * Remove the selected region.
         * @param {String} region The selected region.
         * @returns {void}
         */
        removeRegion (region) {
            if (this.diagramType === "line") {
                this.selectedFilteredRegions = this.selectedFilteredRegions.filter(item => item !== region);
                this.handleChartData(this.statisticNameOfChart, this.selectedFilteredRegions, this.selectedDatesValues, this.statisticsData, this.selectedReferenceData?.type);
            }
            else if (this.diagramType === "bar") {
                const index = this.allFilteredRegions.indexOf(region);

                this.selectedFilteredRegions = this.selectedFilteredRegions.filter(item => item !== region);
                this.allFilteredRegions.push(this.allFilteredRegions.splice(index, 1)[0]);
                this.numberOfColouredBars = this.selectedFilteredRegions.length;
                this.handleChartData(this.statisticNameOfChart, this.allFilteredRegions, this.selectedDatesValues, this.statisticsData, this.selectedReferenceData?.type);
            }
        },
        /**
         * Returns only the data from the selected regions.
         * @param {String} region The selected region.
         * @param {String} preparedData The data.
         * @returns {Object} The new data.
         */
        getNewLimitedData (selectedRegions, preparedData) {
            const limitedData = selectedRegions.filter(key => Object.keys(preparedData).includes(key)).reduce((obj, key) => {
                obj[key] = preparedData[key];
                return obj;
            }, {});

            return limitedData;
        },
        /**
         * Update limit view when the filter settings change.
         * @returns {void}
         */
        updateLimitedData () {
            this.selectedFilteredRegions = this.selectedFilteredRegions.filter(name => this.selectedRegionsValues.includes(name));
            this.numberOfColouredBars = this.selectedFilteredRegions.length;
        },
        /**
         * Gets the filter based on given regions and dates array.
         * Gets an Or Filter if one of them has more than one entry.
         * Gets an And Filter if both of them has entries.
         * Gets an EqualTo Filter if one of them has only one entry.
         * @param {String[]} regions The regions.
         * @param {String[]} dates The dates.
         * @returns {ol/format/filter} The filter.
         */
        getFilter (regions, dates) {
            if (!Array.isArray(regions) || !Array.isArray(dates)) {
                return undefined;
            }
            const regionAttrName = this.getSelectedLevelRegionNameAttributeInDepth(this.selectedLevel?.mappingFilter?.regionNameAttribute)?.attrName,
                dateAttrName = this.getSelectedLevelDateAttribute(this.selectedLevel)?.attrName,
                tmpFlattenedRegions = [...this.flattenedRegions].reverse(),
                allRegions = this.flattenedRegions.find(region => !Object.prototype.hasOwnProperty.call(region, "child"))?.values;

            if (regions.length === allRegions.length) {
                if (dates.length === this.dates.length) {
                    return undefined;
                }
                if (tmpFlattenedRegions.length <= 1) {
                    return this.getFilterForList(dates, dateAttrName);
                }
                for (let i = 0; i < tmpFlattenedRegions.length; i++) {
                    const nextRegion = tmpFlattenedRegions[i];

                    if (!nextRegion.selectedValues.some(selectedValue => selectedValue.label === i18next.t("common:modules.statisticDashboard.button.all"))) {
                        return andFilter(this.getFilterForList(dates, dateAttrName), this.getFilterForList(nextRegion.selectedValues.map(selectedValue => selectedValue.label), nextRegion.attrName));
                    }
                }
            }
            else if (dates.length === this.dates.length) {
                return this.getFilterForList(regions, regionAttrName);
            }
            return andFilter(this.getFilterForList(dates, dateAttrName), this.getFilterForList(regions, regionAttrName));
        },
        /**
         * Gets the filter for given list and property.
         * If given list has more than one entry the function returns an
         * Or Filter otherwise an EqualTo Filter.
         * @param {String[]} list The list to create a filter for.
         * @param {String} propertyName The propertyName to create a filter for.
         * @returns {ol/format/filter} The filter.
         */
        getFilterForList (list, propertyName) {
            if (!Array.isArray(list) || typeof propertyName !== "string") {
                return undefined;
            }

            const filterArray = list.map(entry => equalToFilter(propertyName, entry));

            return filterArray.length > 1 ? orFilter(...filterArray) : filterArray[0];
        },

        /**
         * Gets the data for the table from the prepared statistics.
         * @param {Object} statisticsData - Prepared statistical data.
         * @param {undefined|String|String[]} statisticName - The chosen statistic name.
         * @returns {Object[]} Data for table with header and items or empty array.
         */
        getTableData (statisticsData, statisticName = undefined) {
            const headers = [],
                data = [];

            if (typeof statisticName !== "undefined" && !isObject(statisticsData) || !Object.keys(statisticsData).length) {
                return [];
            }

            if (statisticName === "" && Object.keys(statisticsData).length && this.chartTableToggle === "table") {
                this.setChosenStatisticName(Object.keys(statisticsData)[0]);
            }

            Object.keys(statisticsData).forEach(statData => {
                const items = [];

                if (typeof statisticName === "string" && statisticName !== "" && statData !== statisticName) {
                    return;
                }

                Object.entries(statisticsData[statData]).forEach(([region, years]) => {
                    if (headers.length === 0) {
                        headers.push({name: "Gebiet", index: 0});
                        Object.keys(years).reverse().forEach((year, idx) => {
                            headers.push({name: year, index: idx + 1});
                        });
                    }

                    items.push({Gebiet: region, ...years});

                });

                data.push({
                    headers,
                    items
                });
            });

            return data;
        },

        /**
         * Prepares the statistical data from the features.
         * @param {ol/Feature[]} features - The features.
         * @param {String[]} statistics - The key to the statistic whose value is being looked for.
         * @param {String[]} regions - The regions of the statistic wanted.
         * @param {String[]} dates - The dates of the statistic wanted.
         * @param {String} dateAttribute - The configured date attribute.
         * @param {String} regionAttribute - The configured region attribute.
         * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
         * @returns {Object} The prepared statistical data.
         */
        prepareStatisticsData (features, statistics, regions, dates, dateAttribute, regionAttribute, differenceMode) {
            const data = {};

            statistics.forEach(stat => {
                const statsKey = StatisticsHandler.getStatsKeysByName(this.statisticsByCategory, [stat])[0];

                data[stat] = {};
                regions.forEach(region => {
                    if (region === this.selectedReferenceData?.value) {
                        return;
                    }
                    data[stat][region] = {};
                    dates.forEach(date => {
                        if (date === this.selectedReferenceData?.value?.value || typeof date === "undefined") {
                            return;
                        }
                        const formatedDate = dayjs(date).format(dateAttribute.outputFormat),
                            regionKey = regionAttribute.attrName,
                            dateKey = dateAttribute.attrName;

                        data[stat][region][formatedDate] = this.getStatisticValue(features, statsKey, region, regionKey, date, dateKey, differenceMode);
                    });
                });
            });

            return data;
        },

        /**
         * Finds the feature based on the region and the date.
         * Returns the corresponding value of the passed statistic from the feature.
         * @param {ol/Feature[]} features - The features.
         * @param {String[]} statisticKey - The key to the statistic whose value is being looked for.
         * @param {String} region - The region of the statistic wanted.
         * @param {String} regionKey - The key to the region.
         * @param {String} date - The date of the statistic wanted.
         * @param {String} dateKey - The key to the date.
         * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
         * @returns {String} The value of the given statistic.
         */
        getStatisticValue (features, statisticKey, region, regionKey, date, dateKey, differenceMode) {
            const foundFeature = this.findFeatureByDateAndRegion(features, region, regionKey, date, dateKey);
            let refFeature = null,
                value = NaN;

            if (differenceMode !== "date" && differenceMode !== "region" || !this.selectedReferenceData) {
                return parseFloat(foundFeature?.get(statisticKey)) || "-";
            }

            if (differenceMode === "date") {
                refFeature = this.findFeatureByDateAndRegion(features, region, regionKey, this.selectedReferenceData.value.value, dateKey);
                value = Number((parseFloat(foundFeature?.get(statisticKey)) - parseFloat(refFeature?.get(statisticKey))).toFixed(2));
                this.setSelectedReferenceValueTag("");

                return isNaN(value) ? "-" : value;
            }
            refFeature = this.findFeatureByDateAndRegion(features, this.selectedReferenceData.value, regionKey, date, dateKey);
            value = Number((parseFloat(foundFeature?.get(statisticKey)) - parseFloat(refFeature?.get(statisticKey))).toFixed(2));

            this.referenceFeatures[date] = Number(parseFloat(refFeature?.get(statisticKey)).toFixed(2));
            this.setSelectedReferenceValueTag(Number(parseFloat(refFeature?.get(statisticKey)).toFixed(2)));

            return isNaN(value) ? "-" : value;
        },

        /**
         * Finds a feature by the given region and date.
         * @param {ol/Feature[]} features - The features.
         * @param {String} region - The region value.
         * @param {String} regionKey - The key to the region.
         * @param {String} date - The date value.
         * @param {String} dateKey - The key to the date.
         * @returns {ol/Feature} The found feature.
         */
        findFeatureByDateAndRegion (features, region, regionKey, date, dateKey) {
            return features.find(feature => {
                return feature.get(regionKey) === region && feature.get(dateKey) === date;
            });
        },

        /**
         * Gets the currently selected layer by the given level.
         * @param {String} layerId The layer id.
         * @returns {Object} The layer.
         */
        getRawLayerByLayerId (layerId) {
            return rawLayerList.getLayerWhere({id: layerId}) || {};
        },

        /**
         * Gets the region attribute object by the given level.
         * @param {Object} level The level object.
         * @returns {Object} The region attribute object.
         */
        getSelectedLevelRegionNameAttribute (level) {
            return level?.mappingFilter?.regionNameAttribute || {};
        },

        /**
         * Gets the last child object in the region hierarchy.
         * @param {Object} region - The region hierarchy.
         * @returns {Object} The deepest child.
         */
        getSelectedLevelRegionNameAttributeInDepth (region) {
            let child;

            if (!Object.prototype.hasOwnProperty.call(region, "child")) {
                child = region;
            }
            if (Object.prototype.hasOwnProperty.call(region, "child")) {
                child = this.getSelectedLevelRegionNameAttributeInDepth(region.child);
            }
            return child;
        },

        /**
         * Gets the date attribute by the given level.
         * @param {Object} level The level object.
         * @returns {Object} The time attribute object.
         */
        getSelectedLevelDateAttribute (level) {
            return level?.mappingFilter?.timeAttribute || {};
        },

        /**
         * Gets the statistic attributes by the given level.
         * @param {Object} level The level object.
         * @returns {Object} The statistics attribute object.
         */
        getSelectedLevelStatisticsAttributes (level) {
            return level?.mappingFilter.statisticsAttributes || {};
        },

        /**
         * Toggles between chart and table.
         * @returns {void}
         */
        toggleChartTable () {
            this.setChartTableToggle(this.chartTableToggle === "table" ? "chart" : "table");
        },

        /**
         * Reset tables and charts.
         * @returns {void}
         */
        handleReset () {
            this.layer?.getSource()?.clear();
            this.tableData = [];

            if (this.$refs.chartContainer && this.$refs.chartContainer.hasChildNodes()) {
                this.$refs.chartContainer.childNodes[0].remove();
            }

            this.currentChart = {};
            this.showGrid = false;
            this.legendValue = [];
            this.showNoLegendData = false;
            this.showLimitView = false;
            this.diagramType = undefined;
            this.selectedFilteredRegions = [];
            this.chosenTableData = [];
            this.statisticsData = undefined;
            this.canvasSize = undefined;
            this.numberOfColouredBars = 3;
        },
        /**
         * Checks if at least one description is present in the statistics.
         * @param {Object} statistics - The selected statistics.
         * @returns {Boolean} true if a description is present.
         */
        hasDescription (statistics) {
            let isDescriptionAvailable = false;

            Object.values(statistics).forEach(stat => {
                if (Object.prototype.hasOwnProperty.call(stat, "description")) {
                    isDescriptionAvailable = true;
                }
            });
            return isDescriptionAvailable;
        },
        /**
         * Sets the title and the content of the descriptions of the selected statistics.
         * @param {Object} statistics - The selected statistics.
         * @returns {Object[]} The descriptions.
         */
        setDescriptionsOfSelectedStatistics (statistics) {
            const descriptions = [];

            Object.values(statistics).map(statistic => {
                return descriptions.push({"title": statistic?.name, "content": statistic?.description !== undefined ? statistic?.description : "Diese Satistik enthält keine Beschreibung."});
            });
            return descriptions;
        },
        /**
         * Gets the metadata link.
         * @returns {String} Empty if no metadata was found - otherwise it returns the url.
         */
        getMetadataLink () {
            if (!isObject(this.selectedLevel)) {
                return "";
            }
            const currentLayer = this.getRawLayerByLayerId(this.selectedLevel.layerId);

            if (!isObject(currentLayer) || !Array.isArray(currentLayer.datasets) || !isObject(currentLayer.datasets[0])
                || !currentLayer.datasets[0].show_doc_url || typeof currentLayer.datasets[0].md_id === "undefined") {
                return "";
            }

            return `${currentLayer.datasets[0].show_doc_url}${currentLayer.datasets[0].md_id}`;
        },
        /**
         * Opens the metadata in a new tab.
         * @returns {void}
         */
        openMetadata () {
            const metadataUrl = this.getMetadataLink();

            if (!metadataUrl) {
                return;
            }
            window.open(metadataUrl, "_blank");
        },
        /**
         * Initializes the data from selected level.
         * @param {Object} selectedLevel - The selected level object
         * @returns {void}
         */
        async initializeData (selectedLevel) {
            if (!isObject(selectedLevel)) {
                return;
            }

            this.setLevelTitle(selectedLevel.levelTitle
                ?? this.getRawLayerByLayerId(selectedLevel.layerId)?.datasets?.[0]?.md_name);

            const uniqueValues = await this.getUniqueValuesForLevel(selectedLevel),
                selectedLevelDateAttribute = this.getSelectedLevelDateAttribute(selectedLevel);

            this.selectedLevelRegionNameAttribute = this.getSelectedLevelRegionNameAttribute(selectedLevel);
            if (uniqueValues[this.selectedLevelRegionNameAttribute?.attrName] && uniqueValues[selectedLevelDateAttribute?.attrName]) {
                this.regions = Object.keys(uniqueValues[this.selectedLevelRegionNameAttribute.attrName]).sort((a, b) => b - a);
                this.selectedLevelRegionNameAttribute.values = this.regions.map(val => {
                    return {
                        value: val,
                        label: val
                    };
                });
                this.allRegions = this.getAllRegions(this.regions);
                this.dates = Object.keys(uniqueValues[selectedLevelDateAttribute.attrName]);
                this.timeStepsFilter = this.getTimestepsMerged(selectedLevel?.timeStepsFilter, uniqueValues[selectedLevelDateAttribute.attrName], selectedLevelDateAttribute.inputFormat, selectedLevelDateAttribute.outputFormat);
            }

            this.areCategoriesGrouped = StatisticsHandler.hasOneGroup(this.getSelectedLevelStatisticsAttributes(selectedLevel));
            this.categories = sortBy(StatisticsHandler.getCategoriesFromStatisticAttributes(this.getSelectedLevelStatisticsAttributes(selectedLevel), this.areCategoriesGrouped), "name");
            this.setStatisticsByCategories(this.selectedCategories);
            this.loadedFilterData = true;
            this.loadedReferenceData = true;
            this.referenceData = {
                "date": this.getTimestepsMerged(undefined, uniqueValues[selectedLevelDateAttribute.attrName], selectedLevelDateAttribute.inputFormat, selectedLevelDateAttribute.outputFormat),
                "region": this.regions
            };

            if (!this.flattenedRegions.length) {
                this.flattenRegionHierarchy(this.selectedLevelRegionNameAttribute);
            }
        },

        /**
         * For the template flats the region hierarchy into a list of objects.
         * In addition, the attributes 'values' and 'selectedValues' are set on the region objects.
         * @param {Object} regions - Represents the hierarchy of the regions.
         * @returns {void}
         */
        flattenRegionHierarchy (region) {
            region.selectedValues = [];
            region.loadingDataCounter = 0;
            this.flattenedRegions.push(region);

            if (Object.prototype.hasOwnProperty.call(region, "child")) {
                region.child.values = [];
                this.flattenRegionHierarchy(region.child);
            }
        },
        /**
         * Gets the current level object.
         * @param {String} name - The toggled level name.
         * @returns {void}
         */
        toggleLevel (name) {
            if (typeof name !== "string") {
                return;
            }

            this.resetLevel();

            this.setSelectedLevel(this.data.find(val=> {
                return val?.levelName === name;
            }));

            this.initializeData(this.selectedLevel);
        },
        /**
         * Resets to the original status
         * @returns {void}
         */
        resetLevel () {
            this.loadedFilterData = false;
            this.loadedReferenceData = false;
            this.statisticsByCategory = false;
            this.regions = [];
            this.allRegions = [];
            this.dates = [];
            this.timeStepsFilter = [];
            this.showLimitView = false;
            this.diagramType = undefined;
            this.selectedFilteredRegions = [];
            this.showLineLimitView = false;
            this.setFlattenedRegions([]);
            this.setSelectedCategories([]);
            this.setSelectedRegions([]);
            this.setSelectedDates([]);
            this.setSelectedReferenceData(undefined);
            this.setSelectedStatistics({});
            this.handleReset();
        },

        /**
         * Toggles the show filter flag.
         * @returns {void}
         */
        toggleFilter () {
            this.showFilter = !this.showFilter;
        },

        /**
         * Toggle the legend view.
         * @returns {void}
         */
        changeLegendView () {
            this.showLegendView = !this.showLegendView;
        },

        /**
         * Removes the given the filter.
         * @param {String} filter - Filter to remove.
         * @returns {void}
         */
        removeFilter (filter) {
            const isFilterDate = this.selectedDates.filter(date => date.label !== filter),
                isFilterRegion = this.selectedRegions.filter(date => date.label !== filter),
                isFilterStatistic = Object.values(this.selectedStatistics).filter(statistic => statistic?.name !== filter);

            if (isFilterDate.length !== this.selectedDates.length) {
                this.setSelectedDates(isFilterDate);
            }
            else if (isFilterRegion.length !== this.selectedRegions.length) {
                this.setSelectedRegions(isFilterRegion);
            }
            else if (isFilterStatistic.length !== Object.values(this.selectedStatistics).length) {
                const keyToDelete = Object.keys(this.selectedStatistics).find(key => this.selectedStatistics[key]?.name === filter);

                delete this.selectedStatistics[keyToDelete];
            }
        },

        /**
         * Gets the total prop.
         * @param {Boolean} addTotalCount - if the total count should be added.
         * @returns {Object} the total props for table component.
         */
        getTotalProp (addTotalCount) {
            return {
                enabled: addTotalCount,
                rowTitle: true,
                hintText: this.$t("common:modules.statisticDashboard.totalHint")
            };
        },

        /**
         * Resets all the filter
         * @returns {void}
         */
        resetAll () {
            this.setSelectedCategories([]);
            this.setSelectedRegions([]);
            this.setSelectedDates([]);
            this.setSelectedReferenceData(undefined);
            this.setSelectedStatistics({});
            this.setFlattenedRegions([]);
            this.flattenRegionHierarchy(this.selectedLevelRegionNameAttribute);
            this.handleReset();
        }
    }
};
</script>

<template lang="html">
    <div
        id="modules-statisticDashboard"
        class="static-dashboard"
    >
        <template v-if="loadedFilterData">
            <StatisticFilter
                v-show="showFilter"
                :categories="categories"
                :are-categories-grouped="areCategoriesGrouped"
                :statistics="statisticsByCategory"
                :time-steps-filter="timeStepsFilter"
                :regions="selectedLevelRegionNameAttribute"
                :selected-level="selectedLevel"
                @change-category="setStatisticsByCategories"
                @change-filter-settings="checkFilterSettings"
                @reset-statistics="handleReset"
                @toggle-filter="toggleFilter"
            />
        </template>
        <template v-if="showLegendView">
            <LegendComponent
                class="mt-3"
                @change-legend-view="changeLegendView"
            />
        </template>
        <div v-show="!showFilter && !showLegendView">
            <div class="row justify-content-between">
                <div class="col-md-12 d-flex align-items-center">
                    <h5 class="m-0">
                        {{ $t(levelTitle ?? subtitle) }}
                    </h5>
                    <IconButton
                        v-if="getMetadataLink()"
                        :aria="$t('common:modules.statisticDashboard.headings.mrhstatisticsTooltip')"
                        :title="$t('common:modules.statisticDashboard.headings.mrhstatisticsTooltip')"
                        icon="bi-info-circle"
                        :interaction="() => openMetadata()"
                        class="info btn btn-light btn-sm ms-1 mt-0"
                    />
                </div>
                <div
                    v-if="buttonGroupRegions.length > 1"
                    class="col-md-auto mt-2"
                >
                    <StatisticSwitcher
                        :buttons="buttonGroupRegions"
                        :pre-checked-value="selectedLevel?.levelName"
                        group="regions"
                        class="level-switch"
                        @show-view="toggleLevel"
                    />
                </div>
            </div>
            <AccordionItem
                v-if="loadedFilterData"
                id="filter-accordion"
                title="Filter"
                icon="bi bi-sliders"
                :is-open="true"
            >
                <button
                    id="add-filter-button"
                    type="button"
                    class="btn btn-sm btn-secondary rounded-pill lh-1 me-2 mb-2"
                    @click="toggleFilter"
                >
                    <i class="bi bi-plus fs-6 pe-2" />{{ $t("common:modules.statisticDashboard.button.add") }}
                </button>
                <button
                    v-for="(tag, index) in selectedFilters"
                    :key="index"
                    class="btn btn-sm btn-outline-secondary lh-1 rounded-pill me-2 mb-2 btn-pb"
                    :class="index > 4 && !showAllHiddenTags ? 'more-statistics' : ''"
                    @click="removeFilter(tag)"
                >
                    {{ tag }}
                    <i class="bi bi-x fs-6 align-middle" />
                </button>
                <button
                    v-if="selectedFilters.length"
                    id="reset-button"
                    type="button"
                    class="btn btn-sm btn-secondary rounded-pill lh-1 me-2 mb-2"
                    @click="resetAll"
                >
                    <i class="bi bi-x-circle fs-6 pe-2" />
                    {{ $t("common:modules.statisticDashboard.button.reset") }}
                </button>
                <button
                    v-if="countSelectedFilters"
                    id="more-button"
                    type="button"
                    class="btn btn-link btn-sm p-0"
                    @click="showAllHiddenTags = !showAllHiddenTags"
                >
                    {{ !showAllHiddenTags ? $t("common:modules.statisticDashboard.button.showMore") : $t("common:modules.statisticDashboard.button.showLess") }}
                </button>
            </AccordionItem>
            <div
                v-else
                class="d-flex justify-content-center"
            >
                <div
                    class="spinner-border spinner-color"
                    role="status"
                >
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <hr
                v-if="Array.isArray(legendValue) && legendValue.length && !noDataInColumn || showNoLegendData"
                class="mb-0"
            >
            <AccordionItem
                v-show="Array.isArray(legendValue) && legendValue.length && !noDataInColumn || showNoLegendData"
                id="legend-accordion"
                :title="$t('common:modules.statisticDashboard.legend.legend')"
                icon="bi bi-map"
                is-open
            >
                <div
                    id="legend-content"
                >
                    <div class="legend-body ps-0 py-0">
                        <div
                            v-if="!showNoLegendData"
                            class="container"
                        >
                            <div class="row my-0">
                                <div class="col-6 mt-2">
                                    {{ selectedStatisticsNames[0] }}
                                </div>
                                <div class="col-6">
                                    <FlatButton
                                        id="edit-legend"
                                        aria-label="$t('common:modules.statisticDashboard.legend.edit')"
                                        :text="$t('common:modules.statisticDashboard.legend.edit')"
                                        icon="bi bi-gear"
                                        class="float-end btn-sm"
                                        :interaction="() => changeLegendView()"
                                    />
                                </div>
                            </div>
                            <div class="row">
                                <div
                                    v-for="legendObj in legendValue"
                                    :key="legendObj.name"
                                    class="row layer"
                                >
                                    <div class="col">
                                        <img
                                            :alt="legendObj.name"
                                            :src="legendObj.graphic"
                                            class="col-3 col-xs px-0 left"
                                        >
                                        <span
                                            class="col col-xs legend-names px-0 ms-1"
                                        >
                                            {{ legendObj.name }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            {{ $t("common:modules.statisticDashboard.legend.nodata") }}
                        </div>
                    </div>
                </div>
            </AccordionItem>
            <hr class="mb-0">
            <Controls
                v-if="loadedReferenceData"
                :descriptions="controlDescription"
                :reference-data="referenceData"
                :enable-download="tableData.length > 0"
                class="mb-3"
                @show-chart-table="toggleChartTable"
                @download="downloadData"
            />
            <div v-show="showTable">
                <TableComponent
                    v-for="(data, index) in chosenTableData"
                    :key="index"
                    :title="tableData.length <= 1 ? chosenStatisticName : ''"
                    :data="data"
                    :fixed-data="testFixedData"
                    :total-prop="getTotalProp(addTotalCount, chosenStatisticName)"
                    :select-mode="selectMode"
                    :show-header="showHeader"
                    :dynamic-column-table="true"
                    :font-size="'small'"
                    :sortable="sortable"
                    :enable-settings="true"
                    :max-decimal-places="2"
                    sort-by-numeric-value
                    @set-sorted-rows="setSortedRows"
                    @column-selected="setSelectedColumn"
                />
            </div>
            <div v-show="showChart">
                <div
                    v-if="showLimitView"
                    class="filtered-areas"
                >
                    <div
                        class="row info mb-4 mt-2"
                    >
                        <span class="col-1 info-icon d-flex align-items-center justify-content-center">
                            <i class="bi-info-circle" />
                        </span>
                        <div class="col info-text">
                            {{ $t("common:modules.statisticDashboard.infoText") }}
                        </div>
                    </div>
                    <div class="row justify-content-center mb-4 mx-4">
                        <label
                            class="col-form-label-sm"
                            for="line-limit-search"
                        >
                            {{ $t("common:modules.statisticDashboard.label.area") }}
                        </label>
                        <Multiselect
                            id="line-limit-search"
                            :model-value="selectedFilteredRegions"
                            :multiple="true"
                            :options="selectedRegionsValues"
                            :searchable="true"
                            :close-on-select="false"
                            :clear-on-select="true"
                            class="col col-12"
                            :show-labels="false"
                            :limit="3"
                            :limit-text="count => count + ' ' + $t('common:modules.statisticDashboard.label.more')"
                            :allow-empty="false"
                            :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                            @select="addSelectedFilteredRegions"
                            @remove="removeRegion"
                        >
                            <template #clear>
                                <div class="multiselect__clear">
                                    <i class="bi bi-search" />
                                </div>
                            </template>
                        </Multiselect>
                    </div>
                </div>
                <div
                    v-if="!showGrid"
                    ref="chartContainer"
                    class="chart-container"
                />
                <GridComponent
                    v-else
                    :charts-count="chartCounts"
                    :titles="selectedStatisticsNames"
                >
                    <template
                        #chartContainers="props"
                    >
                        <div
                            :id="'chart' + props.chartId"
                            :ref="'chart' + props.chartId"
                        />
                    </template>
                </GridComponent>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

hr {
    clear: both;
}

.btn-pb {
    padding-bottom: 2px;
}

img {
    width: 30px;
}
.more-statistics {
    display: none;
}
.legend-names {
    font-size: 12px;
}
.info-icon i {
    font-size: $icon_length_small;
}
.info-text {
    font-size: $font_size_sm;
    margin-top: 15px;
}
.chart-container {
    min-height: 60vh;

}
</style>
<style lang="scss" scoped>
@import "~variables";
.static-dashboard .multiselect__tags {
    padding-left: 25px;
}
.static-dashboard .multiselect__clear {
    position: absolute;
    top: 12px;
    left:20px;
}

</style>
