<script>
import deepAssign from "../../../shared/js/utils/deepAssign";
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import BarchartItem from "../../../shared/modules/charts/components/BarchartItem.vue";

/**
* Snippet Chart
* @module modules/SnippetChart
* @vue-data {Boolean} isVisible - true if the component should be rendered.
* @vue-data {Boolean} isEmpty - true if the data contain only zeroes or no data available.
* @vue-prop {Object} api - The api.
* @vue-prop {String|Boolean} title - The title of the chart.
* @vue-prop {Array} filteredItems - The list of filtered items (ol features).
* @vue-prop {Object} chartConfig - The config for the chart.
* @vue-prop {String} alternativeTextForEmptyChart - The text to show if the chart is empty.
* @vue-prop {Array} subtitle - Array of strings and data keys used to display additional data in the subtitle of the chart.
* @vue-prop {String} tooltipUnit - String containing unit symbol to append to numbers in tooltip.
*/
export default {
    name: "SnippetChart",
    components: {
        BarchartItem
    },
    props: {
        api: {
            type: Object,
            required: false,
            default: null
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        alternativeTextForEmptyChart: {
            type: String,
            required: false,
            default: ""
        },
        filteredItems: {
            type: Array,
            required: false,
            default: () => []
        },
        chartConfig: {
            type: Object,
            required: true
        },
        infoText: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        subtitle: {
            type: Array,
            required: false,
            default: undefined
        },
        tooltipUnit: {
            type: String,
            required: false,
            default: undefined
        }
    },
    data () {
        return {
            isVisible: false,
            isEmpty: false
        };
    },
    computed: {
        titleText () {
            if (typeof this.title === "string") {
                return translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        alternativeText () {
            return translateKeyWithPlausibilityCheck(this.alternativeTextForEmptyChart, key => this.$t(key));
        }
    },
    watch: {
        filteredItems: {
            handler (items) {
                this.isVisible = false;
                this.isEmpty = true;
                if (items.length && this.api !== null) {
                    this.api.filter({
                        rules: [{
                            attrName: this.api.service.filter.attrName,
                            operator: this.api.service.filter.operator,
                            value: items[0].get(this.api.service.filter.attrName)
                        }]
                    },
                    this.addChartData,
                    error => {
                        console.warn(error);
                    });
                }
                this.setTooltipUnit(this.tooltipUnit, this.chartConfig);
                this.isVisible = true;
            },
            deep: true
        }
    },
    methods: {
        /**
         * Adds the data for the chart to the chart config.
         * Afterwards the chart is set to visible.
         * @param {Object} filterAnswer - The resulting filterAnswer
         * @returns{void}
         */
        addChartData (filterAnswer) {
            const feature = filterAnswer.items[0];

            if (feature) {
                this.chartConfig.data.datasets.forEach(dataset => {
                    dataset.data = [];

                    dataset.featureAttributes.forEach(attr => {
                        dataset.data.push(feature.get(attr));
                        if (this.isEmpty && feature.get(attr) > 0) {
                            this.isEmpty = false;
                        }
                    });
                });
                this.updateSubtitle(this.subtitle, feature, this.chartConfig.options);
            }
        },

        /**
         * Sets the configured subtitle.
         * @param {Array} subtitle - Array of strings and string arrays to set text and data.
         * @param {Object} feature - The feature containing the data to be included in the subtitle.
         * @param {Object} options - The chartConfig options in which to insert the generated subtitle.
         * @returns{void}
         */
        updateSubtitle (subtitle, feature, options) {
            if (!Array.isArray(subtitle) || !options.plugins?.subtitle) {
                return;
            }

            let text = "";

            subtitle.forEach(element => {
                if (typeof element === "string") {
                    text += element;
                }
                else if (Array.isArray(element)) {
                    element.forEach(attr => {
                        text += feature.get(attr);
                    });
                }
            });
            options.plugins.subtitle.text = text;
        },

        /**
         * Sets the configured unit shown in tooltip.
         * @param {String} tooltipUnit - The unit to be appended to the numbers (no blank space added by default).
         * @param {Object} chartConfig - The chartConfig in which to insert the tooltip unit.
         * @returns{void}
         */
        setTooltipUnit (tooltipUnit, chartConfig) {
            if (typeof tooltipUnit !== "string") {
                return;
            }

            const configWithLabel = {
                options: {
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label (context) {
                                    return context.parsed.y + tooltipUnit;
                                }
                            }
                        }
                    }
                }
            };

            deepAssign(chartConfig, configWithLabel);
        }

    }
};
</script>

<template>
    <div
        v-if="isVisible"
    >
        <h6 v-if="title">
            {{ titleText }}
        </h6>
        <BarchartItem
            v-if="chartConfig.type === 'bar' && !isEmpty"
            :given-options="chartConfig.options"
            :data="chartConfig.data"
        />
        <div
            v-if="infoText && !isEmpty"
            class="row info mb-4 mt-2"
        >
            <span class="col-1 info-icon d-flex align-items-center justify-content-center">
                <i class="bi-info-circle" />
            </span>
            <div class="col info-text">
                {{ infoText }}
            </div>
        </div>
        <span
            v-if="isEmpty"
        >
            {{ alternativeText }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

.info-icon i {
    font-size: $icon_length_small;
}
.info-text {
    font-size: $font_size_sm;
    margin-top: 15px;
}
</style>
