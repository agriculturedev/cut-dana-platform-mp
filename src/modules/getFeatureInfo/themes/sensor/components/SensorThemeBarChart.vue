<script>
import Chart from "chart.js/auto";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";

import {shallowRef} from "vue";

dayjs.extend(localeData);

import {calculateWorkloadForOneWeekday} from "../js/calculateWorkloadForOneWeekday";
import {calculateArithmeticMean} from "../js/mathematicalOperations";

/**
 * The bar chart for sensor theme of the get feature info.
 * @module modules/getFeatureInfo/themes/sensor/components/SensorThemeBarChart
 * @vue-prop {Boolean} show - Show the chart.
 * @vue-prop {Object} chartValue - The chart value.
 * @vue-prop {String} targetValue - The target value.
 * @vue-prop {Object} chartsParams - The charts parameters.
 * @vue-prop {Number} periodLength - The period length.
 * @vue-prop {String} periodUnit - The unit of the period length.
 * @vue-prop {String} processedHistoricalDataByWeekday - The unit of the period length.
 * @vue-data {String} [momentLocale=null] - The locale.
 * @vue-data {Number} [weekdayIndex=0] - The weekday index.
 * @vue-data {Object} [chart=null] - The chart.
 * @vue-data {String} [hoverBackgroundColor="rgba(0, 0, 0, 0.8)"] - the background color by hover.
 * @vue-data {String} [chartColor="rgba(0, 0, 0, 1)"] - The chart color.
 * @vue-data {Number} [barPercentage=1.0] - The bar percentage.
 * @vue-data {String} [titleText=""] - The title text.
 * @vue-data {String} [noticeText=""] - The notice text.
 * @vue-data {Number} [maxValue=1] - The max value
 * @vue-computed {String} weekday - Gets the weekday using the index, which is between 0 and 6.
 */
export default {
    name: "SensorThemeBarChart",
    props: {
        show: {
            type: Boolean,
            required: true
        },
        chartValue: {
            type: Object,
            required: true
        },
        targetValue: {
            type: String,
            required: true
        },
        chartsParams: {
            type: Object,
            required: true
        },
        periodLength: {
            type: Number,
            required: true
        },
        periodUnit: {
            type: String,
            required: true
        },
        processedHistoricalDataByWeekday: {
            type: Array,
            required: true
        }
    },
    data: () => {
        return {
            momentLocale: null,
            weekdayIndex: 0,
            chart: null,
            hoverBackgroundColor: "rgba(0, 0, 0, 0.8)",
            chartColor: "rgba(0, 0, 0, 1)",
            barPercentage: 1.0,
            titleText: "",
            noticeText: "",
            maxValue: 1
        };
    },
    computed: {
        /**
         * Gets the weekday using the index, which is between 0 and 6.
         * Today has the index 0.
         * @returns {String} The weekday.
         */
        weekday: function () {
            return this.momentLocale.localeData().weekdays(dayjs().add(this.weekdayIndex, "day"));
        }
    },
    watch: {
        show (show) {
            if (!show) {
                this.destroyChart();
            }
        }
    },
    created () {
        this.momentLocale = dayjs().locale(this.$i18next.language);
        this.hoverBackgroundColor = this.chartsParams?.hoverBackgroundColor || this.hoverBackgroundColor;
        this.barPercentage = this.chartsParams?.barPercentage || this.barPercentage;
        this.chartColor = this.chartValue?.color || this.chartColor;
        this.noticeText = this.chartValue?.noticeText || this.noticeText;
    },
    mounted () {
        this.momentLocale.locale(this.$i18next.language);
    },
    updated () {
        this.initialize();
    },
    methods: {
        /**
         * Starts the calculation of the historical data and the drawing of the chart.
         * @returns {void}
         */
        initialize () {
            if (this.show) {
                this.$nextTick(() => {
                    if (this.chart === null) {
                        this.createChart();
                    }
                    this.drawChart(this.calculateDataForOneWeekday(), this.maxValue);
                });
            }
        },

        /**
         * Calculates the data for one weekday and the arithmetic mean of this.
         * @returns {Object} The calculated data for one weekday.
         */
        calculateDataForOneWeekday () {
            const processedData = calculateWorkloadForOneWeekday(this.targetValue, this.processedHistoricalDataByWeekday[this.weekdayIndex]);

            this.titleText = [
                this.$t(this.chartValue?.title || ""),
                `${this.$t("common:modules.getFeatureInfo.themes.sensor.sensorBarChart.chartTitleAverage")} `
                + this.$t(`common:modules.getFeatureInfo.themes.sensor.sensorBarChart.${this.periodUnit}`, {count: this.periodLength}),
                this.$t(this.noticeText)
            ];

            return calculateArithmeticMean(processedData);
        },

        /**
         * Destroys the current chart if exists.
         * @returns {void}
         */
        destroyChart () {
            if (this.chart instanceof Chart) {
                this.chart.destroy();
                this.chart = null;
            }
        },

        /**
         * Creates the bar chart with chartsJs.
         * @returns {void}
         */
        createChart () {
            const ctx = this.$refs[`sensorChart_${this.targetValue}`];

            Chart.defaults.font.family = "'MasterPortalFont', 'Arial Narrow', 'Arial', 'sans-serif'";
            Chart.defaults.color = "#000000";

            this.chart = shallowRef(
                new Chart(ctx, {
                    type: "bar"
                })
            );
        },

        /**
         * Creates the bar chart with chartsJs.
         * If a chart is already drawn, it will be destroyed.
         * @param {Object} calculatedData The calculated data.
         * @param {Number} maxValue The max value.
         * @returns {void}
         */
        drawChart (calculatedData, maxValue) {
            this.chart.data = this.createChartData(calculatedData);
            this.chart.options = {
                layout: this.createChartLayout(),
                plugins: {
                    title: this.createChartTitle(),
                    legend: this.createChartLegend(),
                    tooltip: this.createChartTooltip(maxValue)
                },
                responsive: true,
                scales: this.createChartScales(maxValue)
            };

            this.chart.update();
        },

        /**
         * Creates the data for the chart.
         * @param {Object} calculatedData The calculated data.
         * @returns {Object} The chart data.
         */
        createChartData (calculatedData) {
            return {
                labels: calculatedData.map(data => data.hour),
                datasets: [{
                    backgroundColor: this.chartColor,
                    data: calculatedData.map(data => data.result),
                    barPercentage: this.barPercentage,
                    hoverBackgroundColor: this.hoverBackgroundColor
                }]
            };
        },

        /**
         * Creates the title for the chart.
         * @returns {Object} The chart title.
         */
        createChartTitle () {
            return {
                display: true,
                position: "bottom",
                text: this.titleText
            };
        },

        /**
         * Creates the legend for the chart.
         * @returns {Object} The chart legend.
         */
        createChartLegend () {
            return {
                display: false
            };
        },

        /**
         * Creates the tooltip for the chart.
         * @param {Number} maxValue The max value for the y-axis.
         * @returns {Object} The chart tooltip.
         */
        createChartTooltip (maxValue) {
            return {
                callbacks: {
                    label: tooltipItem => (tooltipItem.raw / maxValue * 100).toFixed(0) + "%",
                    title: () => false
                }
            };
        },

        /**
         * Creates the scales for the chart.
         * @param {Number} maxValue The max value for the y-axis.
         * @returns {Object} The chart scales.
         */
        createChartScales (maxValue) {
            return {
                x: {
                    min: 0,
                    max: 23,
                    ticks: {
                        callback: value => {
                            return value % 2 ? "" : this.$t(
                                "common:modules.getFeatureInfo.themes.sensor.sensorBarChart.clock", {value}
                            );
                        }
                    }
                },
                y: {
                    min: 0,
                    max: maxValue,
                    ticks: {
                        callback: value => {
                            return (value / maxValue * 100).toFixed(0) + "%";
                        }
                    }

                }
            };
        },

        /**
         * Creates the layout for the chart.
         * @returns {Object} The chart layout.
         */
        createChartLayout () {
            return {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 0
                }
            };
        },

        /**
         * Decrements the weekday index.
         * @returns {void}
         */
        showPreviousWeekDay () {
            this.weekdayIndex -= 1;

            if (this.weekdayIndex < 0) {
                this.weekdayIndex = 6;
            }
        },

        /**
         * Increments the weekday index.
         * @returns {void}
         */
        showNextWeekDay () {
            this.weekdayIndex += 1;

            if (this.weekdayIndex > 6) {
                this.weekdayIndex = 0;
            }
        }
    }
};
</script>

<template>
    <div v-if="show">
        <div class="sensor-button-container">
            <button
                id="left"
                type="button"
                class="leftButton kat btn"
                :title="$t('common:modules.getFeatureInfo.themes.sensor.sensorBarChart.previousWeekday')"
                @click="showPreviousWeekDay"
            >
                <span class="bootstrap-icon">
                    <i class="bi-chevron-left" />
                </span>
            </button>
            <span class="day">{{ weekday }}</span>
            <button
                id="right"
                type="button"
                class="rightButton kat btn"
                :title="$t('common:modules.getFeatureInfo.themes.sensor.sensorBarChart.nextWeekday')"
                @click="showNextWeekDay"
            >
                <span class="bootstrap-icon">
                    <i class="bi-chevron-right" />
                </span>
            </button>
        </div>
        <div class="sensor-chart-container">
            <canvas
                :id="`sensorChart_${targetValue}`"
                :ref="`sensorChart_${targetValue}`"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .sensor-button-container {
        text-align: center;
        .leftButton {
            float: left;
            background-color: $white;
            padding: 1px 6px;
            outline: none;
            box-shadow: none;
        }
        .rightButton {
            float: right;
            background-color: $white;
            padding: 1px 6px;
            outline: none;
            box-shadow: none;
        }
        .day {
            padding-top: 8px;
            font-weight: bold;
        }
    }
</style>
