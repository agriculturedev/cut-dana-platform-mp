<script>
import DifferenceModal from "./StatisticDashboardDifference.vue";
import StatisticSwitcher from "./StatisticDashboardSwitcher.vue";
import isObject from "../../../shared/js/utils/isObject";
import {mapGetters, mapMutations} from "vuex";
import ExportButtonCSV from "../../../shared/modules/buttons/components/ExportButtonCSV.vue";

export default {
    name: "StatisticDashboardControls",
    components: {
        DifferenceModal,
        StatisticSwitcher,
        ExportButtonCSV
    },
    props: {
        descriptions: {
            type: Array,
            required: false,
            default: () => []
        },
        referenceData: {
            type: Object,
            required: true
        },
        enableDownload: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    emits: ["showChartTable", "download"],
    data () {
        return {
            currentDescriptionIndex: 0,
            showDifferenceModal: false,
            referenceLabel: undefined,
            buttonGroupControls: [{
                name: "Tabelle",
                icon: "bi bi-table pe-2"
            },
            {
                name: "Diagramm",
                icon: "bi bi-bar-chart pe-2"
            }],
            switchValue: "",
            referenceTag: undefined,
            indexSelectedStatistics: 0
        };
    },
    computed: {
        ...mapGetters("Modules/StatisticDashboard", [
            "chartTableToggle",
            "selectedStatistics",
            "chosenStatisticName",
            "selectedReferenceValueTag",
            "selectedReferenceData",
            "selectedDatesValues",
            "selectedRegionsValues",
            "downloadFilename"
        ]),

        /**
         * Checks if there is at least one description
         * @returns {Boolean} True if there is one otherwise false.
         */
        hasDescription () {
            if (this.descriptions.length === 0) {
                return false;
            }
            return true;
        },
        /**
         * Gets the title of the current description.
         * @returns {void}
         */
        titleDescription () {
            return this.descriptions[this.currentDescriptionIndex].title;
        },
        /**
         * Gets the content of the current description.
         * @returns {void}
         */
        contentDescription () {
            return this.descriptions[this.currentDescriptionIndex].content;
        },
        precheckedViewSwitcher () {
            if (this.chartTableToggle === "table") {
                return this.buttonGroupControls[0].name;
            }
            return this.buttonGroupControls[1].name;
        },
        isStatisticsSelected () {
            return this.selectedDatesValues.length > 0 && this.selectedRegionsValues.length > 0 && Object.keys(this.selectedStatistics)?.length > 1;
        },
        showStatisticnameInChart () {
            return this.isStatisticsSelected && typeof this.chosenStatisticName === "string" && this.chosenStatisticName !== "" && this.chartTableToggle === "chart";
        },
        showStatisticnameInTable () {
            return this.isStatisticsSelected && this.chartTableToggle === "table";
        }
    },
    watch: {
        switchValue () {
            this.$emit("showChartTable");
        },
        selectedReferenceData (val) {
            this.handleReferenceTag(val);
        },
        selectedReferenceValueTag (val) {
            if (typeof this.referenceTag !== "undefined") {
                if (this.referenceTag.split(":").length - 1 === 1) {
                    this.referenceTag = this.referenceTag.split(":")[0];
                }
                if (typeof val === "number" && !isNaN(val)) {
                    this.referenceTag = this.referenceTag + ": " + val;
                }
            }
        }
    },
    mounted () {
        if (typeof this.selectedReferenceValueTag !== "undefined") {
            this.referenceTag = this.selectedReferenceValueTag;
        }
        else if (this.selectedReferenceData) {
            this.handleReferenceTag(this.selectedReferenceData);
        }
    },
    beforeUnmount () {
        this.setSelectedReferenceValueTag(this.referenceTag);
    },
    methods: {
        ...mapMutations("Modules/StatisticDashboard", [
            "setChartTableToggle",
            "setChosenStatisticName",
            "setData",
            "setSelectedDates",
            "setSelectedReferenceData",
            "setSelectedReferenceValueTag",
            "setSelectedRegions",
            "setSelectedStatistics"
        ]),
        /**
         * Handles the referenceTag value for given property.
         * @param {String|Object} val The value to handle.
         * @returns {void}
         */
        handleReferenceTag (val) {
            if (typeof val?.value === "string") {
                this.referenceTag = val.value + ": ";
            }
            if (isObject(val?.value) && typeof val.value.label === "string") {
                this.referenceTag = val.value.label;
            }
            else if (typeof val === "undefined") {
                this.referenceTag = undefined;
            }
        },
        /**
         * Sets the description index one higher.
         * If the index reaches the end of the descriptions,it is set back to the beginning.
         * @returns {void}
         */
        nextDescription () {
            if (this.currentDescriptionIndex < this.descriptions.length - 1) {
                this.currentDescriptionIndex++;
            }
            else {
                this.currentDescriptionIndex = 0;
            }
        },
        /**
         * Sets the description index one lower.
         * If the index reaches the beginning of the descriptions, it is set to the end again.
         * @returns {void}
         */
        prevDescription () {
            if (this.currentDescriptionIndex > 0) {
                this.currentDescriptionIndex--;
            }
            else {
                this.currentDescriptionIndex = this.descriptions.length - 1;
            }
        },
        /**
         * Sets chart or table view
         * @param {String} value - The name of clicked button.
         * @returns {void}
         */
        handleView (value) {
            this.switchValue = value;
        },

        /**
         * Removes the reference data
         * @returns {void}
         */
        removeReference () {
            this.setSelectedReferenceData(undefined);
        },
        /**
         * Sets indexSelectedStatistics after clicking previous arrow.
         * @param {Number} index - The current indexSelectedStatistics.
         * @param {Object} selectedStatistics - The selected statistics.
         * @returns {void}
         */
        prevStatistic (index, selectedStatistics) {
            if (!isObject(selectedStatistics) || !Object.keys(selectedStatistics).length) {
                return;
            }


            this.indexSelectedStatistics = index - 1 >= 0 ? index - 1 : Object.keys(selectedStatistics).length + index - 1;
            this.setChosenStatisticName(selectedStatistics[Object.keys(selectedStatistics)[this.indexSelectedStatistics]]?.name);
        },
        /**
         * Sets indexSelectedStatistics after clicking next arrow.
         * @param {Number} index - The current indexSelectedStatistics.
         * @param {Object} selectedStatistics - The selected statistics.
         * @returns {void}
         */
        nextStatistic (index, selectedStatistics) {
            if (!isObject(selectedStatistics) || !Object.keys(selectedStatistics).length) {
                return;
            }

            this.indexSelectedStatistics = index + 1 < Object.keys(selectedStatistics).length ? index + 1 : index - Object.keys(selectedStatistics).length + 1;
            this.setChosenStatisticName(selectedStatistics[Object.keys(selectedStatistics)[this.indexSelectedStatistics]]?.name);
        }
    }
};
</script>

<template>
    <div class="d-flex flex-row flex-wrap align-items-center justify-content-between mb-3 dashboard-controls">
        <!-- Descriptions -->
        <div
            v-if="hasDescription"
            class="flex-grow-1 pb-1 description"
        >
            <div class="hstack gap-1">
                <button
                    class="p-2 fs-5 lh-1 border-0 bg-transparent description-icons"
                    @click="prevDescription"
                    @keydown="prevDescription"
                >
                    <i class="bi bi-chevron-left" />
                </button>
                <p class="pe-2 fs-6 description-content">
                    {{ titleDescription }}<br>{{ contentDescription }}
                </p>
                <button
                    class="p-2 fs-5 lh-1 border-0 bg-transparent description-icons"
                    @click="nextDescription"
                    @keydown="nextDescription"
                >
                    <i class="bi bi-chevron-right" />
                </button>
            </div>
        </div>
        <div
            v-else
            class="flex-grow-1 pb-1 descriptions-placeholder"
        >
            <div
                class="gap-1 empty"
            />
        </div>
        <!-- Controls -->
        <div class="container">
            <div class="btn-toolbar row">
                <StatisticSwitcher
                    :buttons="buttonGroupControls"
                    :pre-checked-value="precheckedViewSwitcher"
                    class="col col-md btn-table-diagram mb-2 p-0"
                    group="dataViews"
                    @show-view="handleView"
                />
                <div
                    class="col col-md-auto mt-0 p-0 pe-1"
                >
                    <div
                        class="difference-button mt-0 float-right text-right"
                        data-toggle="tooltip"
                        data-placement="top"
                        :title="$t('common:modules.statisticDashboard.reference.description')"
                    >
                        <button
                            :aria-label="$t('common:modules.statisticDashboard.button.difference')"
                            icon="bi bi-intersect"
                            class="btn btn-light btn-sm px-3 py-2 dropdown-toggle text-right"
                            :class="typeof referenceTag === 'string' ? 'active' : ''"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-bs-auto-close="outside"
                        >
                            <i
                                class="bi bi-intersect pe-2"
                            />
                            {{ $t('common:modules.statisticDashboard.button.difference') }}
                        </button>
                        <div
                            class="dropdown-menu p-4"
                        >
                            <DifferenceModal
                                class="difference-modal"
                                :reference-data="referenceData"
                            />
                        </div>
                    </div>
                </div>
                <div
                    class="col col-md-auto mt-0 p-0"
                >
                    <ExportButtonCSV
                        id="download-button"
                        :handler="onsuccesss => $emit('download', onsuccesss)"
                        :filename="downloadFilename"
                        :disabled="!enableDownload"
                        use-semicolon
                        class="text-nowrap btn-light btn-sm px-3 py-2 dropdown-toggle text-right"
                    >
                        <i class="bi bi-cloud-arrow-down-fill" />
                        {{ $t("common:modules.statisticDashboard.button.download") }}
                    </ExportButtonCSV>
                </div>
                <div
                    v-if="typeof referenceTag === 'string'"
                    class="reference-tag row justify-content-end"
                >
                    <div class="col col-auto align-self-end ">
                        <div class="col-form-label-sm pb-0">
                            {{ $t("common:modules.statisticDashboard.reference.tagLabel") }}:
                        </div>
                        <button
                            class="btn btn-sm btn-outline-secondary lh-1 rounded-pill shadow-none me-2 btn-pb"
                            aria-label="Close"
                            @click="removeReference()"
                            @keydown.enter="removeReference()"
                        >
                            {{ referenceTag }}
                            <i class="bi bi-x fs-5 align-middle" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="showStatisticnameInChart"
            class="back-overview"
            role="button"
            tabindex="0"
            @click="setChosenStatisticName('')"
            @keydown="setChosenStatisticName('')"
        >
            <button
                class="p-2 fs-5 lh-1 border-0 bg-transparent"
            >
                <i class="bi bi-chevron-left" />
            </button>
            <span>
                {{ $t('common:modules.statisticDashboard.backToOverview') }}
            </span>
        </div>
        <div
            v-if="showStatisticnameInTable"
            class="container static-name"
        >
            <button
                class="p-2 fs-5 lh-1 border-0 bg-transparent"
                @click="prevStatistic(indexSelectedStatistics, selectedStatistics)"
                @keydown.enter="prevStatistic(indexSelectedStatistics, selectedStatistics)"
            >
                <i class="bi bi-chevron-left" />
            </button>
            <div>
                {{ chosenStatisticName }}
            </div>
            <button
                class="p-2 fs-5 lh-1 border-0 bg-transparent"
                @click="nextStatistic(indexSelectedStatistics, selectedStatistics)"
                @keydown.enter="nextStatistic(indexSelectedStatistics, selectedStatistics)"
            >
                <i class="bi bi-chevron-right" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.dashboard-controls {
    .description {
        margin-top: 25px;
        .description-content {
            width: 350px;
        }
        .description-icons {
            opacity: 0.5;
        }
        .description-icons:hover {
            opacity: 1;
        }
    }
    .descriptions-placeholder {
         margin-top: 10px;
        .empty {
            width: 350px;
        }
    }
}

.btn-table-diagram {
    margin-top: 25px;
}

.difference-button {
    display: inline-block;
}

.dropdown-menu {
    width: 60%;
    --bs-dropdown-zindex: 1100;
}

.btn-light {
    background-color: $light_grey;
    color: $light_grey_inactive_contrast;
    border-color: $light_grey;
}
.btn-light:hover {
    background-color: $primary;
    color: $black;
    border-color: $primary;
}
.active, .btn.show {
    background-color: $secondary;
    color: $white;
    border-color: $secondary;
    box-shadow: none;
}
.reference-tag button {
    color: $secondary;
    &:hover {
        color: $white;
    }
 }

.back-overview {
    margin-top: 20px;
    font-size: 12px;
    cursor: pointer;
}

.static-name {
    margin-top: 20px;
    display: flex;
    div {
        width: calc(100% - 64px);
        text-align: center;
        padding-top: 6px;
    }
}
</style>
