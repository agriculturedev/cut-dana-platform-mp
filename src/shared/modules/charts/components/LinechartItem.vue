<script>
import Chart from "chart.js/auto";
import deepAssign from "../../../js/utils/deepAssign.js";
import thousandsSeparator from "../../../js/utils/thousandsSeparator.js";

export default {
    name: "LinechartItem",
    props: {
        /**
         * the options to override the default options with
         * be reminded to check the behavior of src/utils/deepAssign.js
         */
        givenOptions: {
            type: Object,
            required: false,
            default: null
        },
        /**
         * the data for the linechart to hand over to chartJS data attribute
         * @see https://www.chartjs.org/docs/latest/charts/line.html
         */
        data: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            defaultOptions: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            precision: 0,
                            beginAtZero: true,
                            callback: (value) => {
                                return thousandsSeparator(value);
                            }
                        }
                    }
                },
                tooltips: {
                    callbacks: {
                        // use label callback to return the desired label
                        label: (tooltipItem, data) => {
                            return data.datasets[tooltipItem.datasetIndex].label + ": " + thousandsSeparator(tooltipItem.value);
                        }
                    }
                }
            },
            chart: null
        };
    },
    watch: {
        data (newData) {
            this.resetChart(newData);
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.resetChart(this.data);
        });
    },
    methods: {
        /**
         * destroys the old charts and creates a new chart+
         * @param {Object} data the data for diagram
         * @pre the old chart is shown or no chart is initialized
         * @post the chart based on current data and props is shown
         * @returns {void}  -
         */
        resetChart (data) {
            const ctx = this.$el.getContext("2d"),
                config = {
                    type: "line",
                    data: data,
                    options: this.getChartJsOptions(this.defaultOptions, this.givenOptions)
                };

            if (this.chart instanceof Chart) {
                this.destroyChart();
            }

            this.chart = new Chart(ctx, config);
        },

        /**
         * replace default options with given options on hand deepAssign method and returns the options for chart js
         * @param {Object} defaultOptions an object with the default options following chartJS options (see https://www.chartjs.org/docs/latest/general/options.html)
         * @param {Object} givenOptions an object with given options following chartJS options (see https://www.chartjs.org/docs/latest/general/options.html)
         * @returns {Object} an object to use as options for chartjs
         */
        getChartJsOptions (defaultOptions, givenOptions) {
            if (typeof defaultOptions !== "object" || defaultOptions === null) {
                return typeof givenOptions === "object" && givenOptions !== null ? givenOptions : {};
            }
            return deepAssign(defaultOptions, givenOptions);
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
        }
    }
};
</script>

<template>
    <canvas />
</template>
