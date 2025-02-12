<script>
import TableComponent from "../../../shared/modules/table/components/TableComponent.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import WfsSearchLiteral from "./WfsSearchLiteral.vue";
import {createUserHelp} from "../js/literalFunctions";
import requestProvider from "../js/requests";
import isObject from "../../../shared/js/utils/isObject";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";

/**
 * Wfs Search
 * @module modules/WfsSearch
 * @vue-props {Number} zoomLevelProp - Can be set if a zoom level (after succesfull parcel search) is required that is different from the configured one.
 * @vue-props {Boolean} showResetButton - Can be set to false to not render a reset button.
 * @vue-computed {Object} headers - The table headers für Search Results.
 * @vue-computed {Object} resultsForTable - The results in the right format for the table.
 * @vue-computed {String} geometryName - The name of the geometry.
 * @vue-computed {Boolean} showResults - Shows if results should be displayed.
 * @vue-computed {Object} tableData - Object for the TableComponent.
 */
export default {
    name: "WfsSearch",
    components: {
        WfsSearchLiteral,
        TableComponent,
        FlatButton
    },
    props: {
        zoomLevelProp: {
            type: Number,
            required: false,
            default: undefined
        },
        showResetButton: {
            type: Boolean,
            required: false,
            default: true
        },
        resetParcelSearch: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        ...mapGetters("Modules/WfsSearch", [
            "name",
            "instances",
            "userHelp",
            "results",
            "searched",
            "service",
            "showResultList",
            "zoomLevel",
            "resultsPerPage",
            "multiSelect",
            "currentInstance",
            "requiredFields"
        ]),
        ...mapGetters("Modules/Language", ["currentLocale"]),
        headers () {
            if (this.results.length === 0) {
                return null;
            }

            const {resultList} = this.currentInstance;

            if (isObject(resultList)) {
                const tableHeaders = [];

                Object.keys(resultList).forEach(result => {
                    const resultName = resultList[result];

                    tableHeaders.push({name: result, displayName: resultName, order: "origin"});
                });
                return tableHeaders;
            }
            if (resultList === "showAll") {
                const tableHeaders = [],
                    lengths = this.results.map(feature => Object.keys(feature.values_).length),
                    indexOfFeatureWithMostAttr = lengths.indexOf(Math.max(...lengths));

                Object.keys(this.results[indexOfFeatureWithMostAttr].values_)
                    .reduce((acc, curr) => {
                        const headerObj = {name: curr, order: "origin"};

                        tableHeaders.push(headerObj);

                        return tableHeaders;
                    }, {});
                return tableHeaders;
            }
            return null;
        },
        resultsForTable () {
            const resultArr = [];

            if (this.results.length > 0) {
                this.results.forEach((result) => {
                    resultArr.push(result.values_);
                });
                return resultArr;
            }
            return this.results;
        },
        geometryName () {
            return this.results[0].getGeometryName();
        },
        tableData () {
            return {
                "headers": this.headers,
                "items": this.resultsForTable
            };
        }
    },
    watch: {
        currentLocale () {
            if (this.userHelp !== "hide") {
                createUserHelp(this.currentInstance.literals);
            }
        },
        resetParcelSearch (val) {
            if (val) {
                this.resetUI();
            }
        }
    },
    created () {
        this.prepareModule();
    },
    unmounted () {
        this.resetModule(true);
    },
    methods: {
        ...mapMutations("Modules/WfsSearch", [
            "setSearched",
            "setResults",
            "setShowResultList",
            "setZoomLevel"
        ]),
        ...mapActions("Modules/WfsSearch", [
            "instanceChanged",
            "prepareModule",
            "resetModule",
            "resetResult"
        ]),
        ...mapActions("Maps", [
            "placingPointMarker",
            "placingPolygonMarker",
            "removePolygonMarker",
            "setCenter",
            "setZoom",
            "zoomToExtent"
        ]),
        /**
         * Resets the selection and inputs fields and the results.
         * @returns {void}
         */
        resetUI () {
            const inputFields = document.getElementsByClassName("module-wfsSearch-field-input");

            for (const input of inputFields) {
                input.value = "";
            }
            this.resetResult();
            this.setShowResultList(false);
            this.removePolygonMarker();
        },
        /**
         * Searches the configured service and shows adds the results to the List in the Modal.
         * @returns {Promise<void>} The returned promise isn't used any further as it resolves to nothing.
         */
        async search () {
            this.setSearched(true);
            const features = await requestProvider.searchFeatures(this.$store, this.currentInstance, this.service);

            this.setResults([]);
            features.forEach(feature => {
                this.results.push(feature);
            });

            if (this.currentInstance?.resultList !== undefined) {
                this.setShowResultList(true);
            }
            else if (features.length > 0) {
                this.markerAndZoom(features);
            }
        },

        /**
         * Sets a point or polygon marker for a feature and zoom to it.
         * @param {ol/Feature[]} features The feature with coordinates.
         * @returns {void}
         */
        async markerAndZoom (features) {
            const feature = await features[0],
                geometry = feature.getGeometry(),
                coordinates = geometry.getCoordinates();

            if (coordinates.length === 2 && !Array.isArray(coordinates[0])) {
                this.placingPointMarker(coordinates);
                this.setCenter(coordinates);
                this.setZoom(this.zoomLevelProp || this.zoomLevel);
            }
            else {
                this.placingPolygonMarker(feature);
                this.zoomToExtent({extent: geometry.getExtent()});
            }
        }
    }
};
</script>

<template>
    <div>
        <div>
            <form
                role="form"
                @submit.prevent="search"
            >
                <template
                    v-if="instances.length > 1"
                >
                    <div class="form-floating">
                        <select
                            id="module-wfsSearch-instances-select"
                            class="form-select"
                            @change="instanceChanged($event.currentTarget.value)"
                        >
                            <option
                                v-for="({title}, i) of instances"
                                :key="title + i"
                                :value="i"
                            >
                                {{ $t(title) }}
                            </option>
                        </select>
                        <label
                            id="module-wfsSearch-instances-select-label"
                            for="module-wfsSearch-instances-select"
                        >
                            {{ $t("common:modules.wfsSearch.instancesSelectLabel") }}
                        </label>
                    </div>
                </template>
                <div
                    v-if="userHelp !== 'hide'"
                    id="module-wfsSearch-userHelp"
                    class="justify-content-center mt-3"
                >
                    <i
                        id="module-wfsSearch-userHelp-icon"
                        class="col-md-1 bi-info-circle me-3"
                    />
                    <span
                        id="module-wfsSearch-userHelp-text"
                        class="col-md-11"
                        :aria-label="$t('common:modules.wfsSearch.userHelp.label')"
                        v-html="$t('common:modules.wfsSearch.userHelp.text', {userHelp})"
                    />
                </div>
                <div
                    v-for="(literal, i) of currentInstance.literals"
                    :key="'module-wfsSearch-clause' + i"
                >
                    <WfsSearchLiteral
                        :literal="literal"
                    />
                </div>
                <div class="row">
                    <div
                        :class="[showResetButton ? 'col-md-6' : 'col']"
                        class="d-flex justify-content-center"
                    >
                        <FlatButton
                            id="module-wfsSearch-button-search"
                            :type="'submit'"
                            :text="$t('common:modules.wfsSearch.searchButton')"
                            :icon="'bi-search'"
                            :disabled="requiredFields"
                        />
                    </div>
                    <div
                        v-if="showResetButton"
                        class="col-md-6 d-flex justify-content-center"
                    >
                        <FlatButton
                            id="module-wfsSearch-button-resetUI"
                            :interaction="resetUI"
                            :text="$t('common:modules.wfsSearch.resetButton')"
                            :icon="'bi-x'"
                            :secondary="true"
                        />
                    </div>
                </div>
            </form>
        </div>
        <div
            v-if="showResultList && results.length > 0"
            class="mt-5"
        >
            <span>
                <h5>{{ $t("common:modules.wfsSearch.showResultHeading") }}</h5>
            </span>
            <TableComponent
                :id="'resultTable'"
                :data="tableData"
                :sortable="true"
                table-class="tableHeight"
            />
        </div>
        <div v-else-if="showResultList && results.length === 0">
            {{ $t("common:modules.wfsSearch.noResults") }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    .btn {
        margin-top: 10px;
    }
    .form-group > span {
        display: inline-block;
    }
    .title {
            font-size: $font-size-base;
    }
</style>
