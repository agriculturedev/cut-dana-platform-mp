<script>
import isObject from "../../../shared/js/utils/isObject.js";
import renameKeys from "../../../shared/js/utils/renameKeys.js";
import beautifyKey from "../../../shared/js/utils/beautifyKey.js";
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";

/**
* Snippet Info
* @module modules/SnippetInfo
* @vue-prop {Array} attrName - The list of attribute names.
* @vue-prop {Array} title - The title of the info.
* @vue-prop {String} layerId - The layer id.
* @vue-prop {Number} snippetId - The snippet id.
* @vue-prop {Array} filteredItems - The list of filtered items.
* @vue-prop {Object} universalSearch - The configured universal search object
* @vue-prop {Object} beautifiedAttrName - The beautified attribute name
* @vue-data {Object} featureInfo - (??).
*/
export default {
    name: "SnippetFeatureInfo",
    props: {
        attrName: {
            type: Array,
            required: false,
            default: () => []
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        layerId: {
            type: String,
            required: false,
            default: undefined
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        filteredItems: {
            type: Array,
            required: false,
            default: () => []
        },
        universalSearch: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        beautifiedAttrName: {
            type: Object,
            required: false,
            default: undefined
        }
    },
    emits: ["setSnippetPrechecked", "setSnippetVisible"],
    data () {
        return {
            featureInfo: null,
            visible: false
        };
    },
    computed: {
        titleText () {
            if (typeof this.title === "string") {
                return translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        featureInfoWithoutDuplicates () {
            if (this.featureInfo === null) {
                return [];
            }
            const result = {};

            Object.entries(this.featureInfo).forEach(([key, value]) => {
                result[key] = Array.isArray(value) ? value.join(", ") : value;
            });
            return result;
        }
    },
    watch: {
        filteredItems: {
            handler (items) {
                const attributesObject = this.getUniqueObjectFromAttributes(this.attrName, items),
                    localFeatureInfo = this.featureInfo ? this.featureInfo : {};
                let beautifiedObjects;

                if (attributesObject === null) {
                    this.featureInfo = null;
                    return;
                }

                if (typeof this.beautifiedAttrName === "undefined") {
                    beautifiedObjects = this.beautifyObjectKeys(attributesObject);
                }
                else {
                    beautifiedObjects = renameKeys(this.beautifiedAttrName, attributesObject);
                }

                Object.entries(beautifiedObjects).forEach(([key, val]) => {
                    if (!Array.isArray(localFeatureInfo[key])) {
                        localFeatureInfo[key] = [];
                    }
                    val.forEach(value => {
                        if (localFeatureInfo[key].includes(value)) {
                            return;
                        }
                        localFeatureInfo[key].push(value);
                    });
                });
                this.featureInfo = localFeatureInfo;
            },
            deep: true
        },
        featureInfo: {
            handler () {
                if (isObject(this.featureInfo) && Object.keys(this.featureInfo).length > 0) {
                    this.visible = true;
                    this.$emit("setSnippetVisible", true);
                    return;
                }
                this.visible = false;
                this.$emit("setSnippetVisible", false);
            },
            deep: true
        }
    },
    mounted () {
        this.$emit("setSnippetPrechecked", false);
    },
    methods: {
        /**
         * Beautify the keys of an object.
         * @param {Object} unlovelyObject - The object to be beautified.
         * @returns {Object} The beautified object.
         */
        beautifyObjectKeys (unlovelyObject) {
            const beautifiedObj = {};

            Object.entries(unlovelyObject).forEach(([key, value]) => {
                beautifiedObj[beautifyKey(key)] = value;
            });
            return beautifiedObj;
        },

        /**
         * Gets an object with unique list of values for each attribute.
         * @param {String[]} attrName an array of attrNames
         * @param {Object[]} features an array of objects
         * @returns {Object|null} returns object or null if given features is not an array
         */
        getUniqueObjectFromAttributes (attrName, features) {
            if (!Array.isArray(attrName) || !Array.isArray(features) || features.length === 0) {
                return null;
            }
            const uniqueObjects = {},
                result = {};

            features.forEach(feature => {
                attrName.forEach(attr => {
                    if (!isObject(uniqueObjects[attr])) {
                        uniqueObjects[attr] = {};
                    }
                    uniqueObjects[attr][feature.get(attr)] = true;
                });
            });
            Object.entries(uniqueObjects).forEach(([attr, obj]) => {
                result[attr] = [];
                Object.keys(obj).forEach(value => {
                    if (value === "undefined") {
                        result[attr].push("");
                        return;
                    }
                    result[attr].push(value);
                });
            });

            return result;
        },

        /**
         * Checks if the attribute should be searched in webpage.
         * @param {Object|Boolean} universalSearch the universalSearch parameter with prefix and attribute name.
         * @param {String} attr the attribute name
         * @returns {Boolean} returns true if this attribute should be searched in webpage.
         */
        checkAttrInSearch (universalSearch, attr) {
            if (!isObject(universalSearch)) {
                return false;
            }
            if (!universalSearch?.attrName || !universalSearch?.prefix) {
                return false;
            }
            if (typeof attr !== "string") {
                return false;
            }
            return universalSearch.attrName === attr;
        }
    }
};
</script>

<template>
    <div
        v-if="visible"
        class="snippetFeatureInfoContainer"
    >
        <h5 v-if="title">
            {{ titleText }}
        </h5>
        <dl class="row">
            <template
                v-for="(value, key, index) in featureInfoWithoutDuplicates"
                :key="key + index"
            >
                <dt class="ms-3 mt-2 mb-0">
                    {{ key }}
                </dt>
                <template v-if="value === ''">
                    <dd
                        :key="key"
                        class="ms-3"
                    >
                        ---
                    </dd>
                    <hr>
                </template>
                <template v-else>
                    <dd
                        :key="key"
                        class="ms-3"
                    >
                        {{ value }}
                        <a
                            v-if="checkAttrInSearch(universalSearch, key)"
                            :href="universalSearch.prefix + value"
                            :aria-label="value"
                            :title="$t('common:modules.filter.universalSearchTitle')"
                            target="_blank"
                        >
                            <button
                                class="btn btn-light ms-2"
                                type="button"
                            >
                                <i
                                    class="bi bi-search "
                                    role="img"
                                />
                            </button>
                        </a>
                    </dd>
                    <hr>
                </template>
            </template>
        </dl>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    .snippetFeatureInfoContainer {
        dt {
            font-weight: normal;
            font-size: $font_size_sm;
            };
        dd {
            font-family: "MasterPortalFont Bold"
            }
        hr {
            margin: 1px 10px 1px;
            width: 85%;
        }
    };
</style>
