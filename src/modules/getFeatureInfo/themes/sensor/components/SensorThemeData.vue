<script>
import beautifyKey from "../../../../../shared/js/utils/beautifyKey.js";
import {isWebLink} from "../../../../../shared/js/utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../../shared/js/utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../../shared/js/utils/isEmailAddress.js";

/**
 * The bar chart for sensor theme of the get feature info.
 * @module modules/getFeatureInfo/themes/sensor/components/SensorThemeData
 * @vue-prop {Object} feature - The required feature.
 * @vue-prop {Boolean} show - Show the chart.
 * @vue-data {String} [columnHeaderAttribute="dataStreamName"] - The data stream name.
 * @vue-computed {String} firstColumnHeaderName - Gets the firstColumnHeaderName.
 * @vue-computed {Object} splittedMappedProperties - Splits the mappepd properties attribute using the "|" parameter.
 * @vue-computed {String[]} columnHeaders - Get the column headers.
 */
export default {
    name: "SensorThemeData",
    props: {
        feature: {
            type: Object,
            required: true
        },
        show: {
            type: Boolean,
            required: true
        }
    },
    data: function () {
        return {
            columnHeaderAttribute: "dataStreamName"
        };
    },
    computed: {
        /**
         * Gets the firstColumnHeaderName.
         * @returns {String} Th firstColumnHeaderName.
         */
        firstColumnHeaderName: function () {
            return this.feature.getTheme()?.params?.data?.firstColumnHeaderName ||
                this.$t("common:modules.getFeatureInfo.themes.sensor.sensorData.firstColumnHeaderName");
        },

        /**
         * Splits the mappepd properties attribute using the "|" parameter.
         * @returns {Object} mappedProperties with splitted values as array.
         */
        splittedMappedProperties: function () {
            const properties = this.feature.getMappedProperties();

            Object.entries(properties).forEach(([key, value]) => {
                const splittedValue = typeof value === "string" ? value.split(" | ") : value;

                properties[key] = Array.isArray(splittedValue) ? splittedValue : [splittedValue];
            });

            return properties;
        },

        /**
         * Get the column headers.
         * @returns {String[]} The column headers.
         */
        columnHeaders: function () {
            return this.feature.getProperties()[this.columnHeaderAttribute]?.split(" | ");
        }
    },
    created () {
        this.columnHeaderAttribute = this.feature.getTheme()?.params?.data?.columnHeaderAttribute || this.columnHeaderAttribute;
    },
    methods: {
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        beautifyKey
    }
};
</script>

<template>
    <div
        v-if="show"
        class="px-3"
    >
        <table class="table">
            <thead>
                <tr class="row">
                    <th class="col">
                        {{ firstColumnHeaderName }}
                    </th>
                    <th
                        v-for="(name, index) in columnHeaders"
                        :key="name + '_' + index"
                        class="col"
                    >
                        {{ name }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(value, key) in splittedMappedProperties"
                    :key="key"
                    class="row"
                >
                    <th class="col">
                        {{ beautifyKey(key) }}
                    </th>
                    <td
                        v-for="(property, index) in value"
                        :key="property + '_' + index"
                        class="col"
                    >
                        <span v-if="isWebLink(property)">
                            <a
                                :href="property"
                                target="_blank"
                            >
                                Link
                            </a>
                        </span>
                        <span v-else-if="isPhoneNumber(property)">
                            <a :href="getPhoneNumberAsWebLink(property)">
                                {{ property }}
                            </a>
                        </span>
                        <span v-else-if="isEmailAddress(property)">
                            <a :href="`mailto:${property}`">
                                {{ property }}
                            </a>
                        </span>
                        <span v-else>
                            {{ property }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss" scoped>
    .table > :not(:first-child) {
        border-top: none;
    }
</style>
