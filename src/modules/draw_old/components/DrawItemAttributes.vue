<script>
import isObject from "../../../shared/js/utils/isObject";
import {mapGetters, mapActions} from "vuex";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";

/**
 * Draw Item Attributes
 * @module modules/DrawItemAttributes
 * @vue-prop {Object} selectedFeature - The selected feature.
 * @vue-prop {Object} layer - The layer.
 * @vue-prop {Array} attributesKeyList - The list of attribute keys.
 * @vue-data {String} attributeKey - The attribute key.
 * @vue-data {String} attributeValue - The attribute value.
 * @vue-data {Array} attributes - The attributes.
 * @vue-data {Array} validKeys - List of valid keys.
 * @vue-data {Object} addKeys - Keys to add.
 */
export default {
    name: "DrawItemAttributes",
    components: {IconButton},
    props: {
        selectedFeature: {
            type: Object,
            required: false,
            default: undefined
        },
        layer: {
            type: Object,
            required: false,
            default: undefined
        },
        attributesKeyList: {
            type: Array,
            required: false,
            default: undefined
        }
    },
    emits: ["updateAttributesKeyList"],
    data () {
        return {
            attributeKey: "",
            attributeValue: "",
            attributes: [],
            validKeys: [],
            addKey: {valid: true, message: ""}
        };
    },
    computed: {
        ...mapGetters("Modules/Draw_old", ["oldStyle"])
    },
    watch: {
        selectedFeature (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            this.unifyAttributeToFeature(newVal, this.attributesKeyList);
            this.setAttributesFromFeature();
            if (isObject(oldVal)) {
                this.resetStyle(oldVal);
            }
        },
        attributes: {
            handler () {
                if (!this.checkAttributes(this.attributes)) {
                    return;
                }
                this.saveChanges(this.attributes, this.selectedFeature, this.layer);
                this.updateAttributesKeyList(this.attributes);
            },
            deep: true
        },
        attributesKeyList: {
            handler (val) {
                if (this.layer && this.layer.getSource().getFeatures().length) {
                    this.layer.getSource().getFeatures().forEach(feature => {
                        this.unifyAttributeToFeature(feature, val);
                    });
                }
            },
            deep: true
        }
    },
    mounted () {
        this.setAttributesFromFeature();
        this.initAttributesKeyList();
    },
    beforeUnmount () {
        this.resetStyle(this.selectedFeature);
    },
    methods: {
        ...mapActions("Modules/Draw_old", ["setDownloadFeatures"]),

        /**
         * Resets the style of selected feature to old style
         * @param {ol/feature} oldFeature the last selected feature whose style must be restored from oldStyle
         * @returns {void}
         */
        resetStyle (oldFeature) {
            if (isObject(oldFeature) && typeof oldFeature.getStyle() !== "function") {
                oldFeature?.getStyle()?.setText();
                oldFeature.setStyle(this.oldStyle);
            }
        },
        /**
         * Unifying the attributes to each feature so that all the features have the same attributes list
         * @param {ol/Feature} feature The drawn feature
         * @param {String[]} keyList The attributes' key list
         * @returns {void}
         */
        unifyAttributeToFeature (feature, keyList) {
            const attributes = Object.assign({}, feature.getProperties()),
                newAttr = {},
                gfiAttributes = {};

            delete attributes.masterportal_attributes;
            delete attributes.geometries;

            if (isObject(attributes)) {
                keyList.forEach(key => {
                    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                        newAttr[key] = attributes[key];
                    }
                    else {
                        newAttr[key] = "";
                    }
                    gfiAttributes[key] = key;
                });
            }
            else {
                keyList.forEach(key => {
                    newAttr[key] = "";
                    gfiAttributes[key] = key;
                });
            }

            feature.setProperties(newAttr);

            if (Object.keys(newAttr).length) {
                if (Object.prototype.hasOwnProperty.call(newAttr, "geometry")) {
                    delete newAttr.geometry;
                }
                if (Object.prototype.hasOwnProperty.call(newAttr, "epsg")) {
                    delete newAttr.epsg;
                }
                feature.setProperties(newAttr);
                this.layer.set("gfiAttributes", gfiAttributes);
            }
        },
        /**
         * Initializes the attributes' key list.
         * @returns {void}
         */
        initAttributesKeyList () {
            if (this.layer && this.layer.getSource().getFeatures().length) {
                for (const feature of this.layer.getSource().getFeatures().reverse()) {
                    const attributes = Object.assign({}, feature.getProperties());

                    delete attributes.masterportal_attributes;
                    delete attributes.geometry;

                    if (Object.keys(attributes).length) {
                        this.$emit("updateAttributesKeyList", Object.keys(attributes));
                        break;
                    }
                }
            }
        },
        /**
         * Sets the local attributes by the attributes from the selected feature.
         * @returns {void}
         */
        setAttributesFromFeature () {
            if (!this.isFeature()) {
                return;
            }
            this.attributes = [];
            const attributes = Object.assign({}, this.selectedFeature.getProperties());


            if (isObject(attributes)) {
                Object.entries(attributes).forEach(([key, value]) => {
                    const attr = {key, value};

                    if (key !== "geometry" && key !== "masterportal_attributes") {
                        this.attributes.push(attr);
                    }
                });
            }
            this.attributeKey = "";
            this.attributeValue = "";
            this.addKey = {valid: true, message: ""};
            this.switchToRef("attributeKey");
        },
        /**
         * Add new attribute to the selected feature and the local attributes array.
         * @returns {void}
         */
        addAttributesToFeature () {
            if (!this.isFeature()) {
                return;
            }
            if (!this.attributeKey) {
                this.addKey = {
                    valid: false,
                    message: this.$t("common:modules.draw_old.attributeSelect.attributeKeyError")
                };
                return;
            }
            if (this.attributes.some(attr => attr?.key === this.attributeKey)) {
                this.addKey = {
                    valid: false,
                    message: this.$t("common:modules.draw_old.attributeSelect.attributeDuplicatedKeyError")
                };
                return;
            }

            this.selectedFeature.set(this.attributeKey, this.attributeValue);
            const attr = {key: this.attributeKey, value: this.attributeValue};

            this.attributes.push(attr);
            this.attributeKey = "";
            this.attributeValue = "";
            this.$nextTick(() => {
                this.setDownloadFeatures();
            });
        },
        /**
         * Removes attribute row from the local attributes array and removes the attribute from the feature.
         * @param {Number} idx The index of the row of the local attributes.
         * @returns {void}
         */
        removeAttribute (idx) {
            if (!this.isFeature() || !isObject(this.attributes[idx])) {
                return;
            }
            const key = this.attributes[idx].key;

            this.selectedFeature.unset(key);
            this.attributes.splice(idx, 1);
            this.setDownloadFeatures();
        },
        /**
         * Save the current changes which were made on already existing attributes.
         * @param {String[]} addedAttributes the added feature attributes
         * @param {ol/Feature} selectedFeature the selected feature to add attributes
         * @returns {void}
         */
        saveChanges (addedAttributes, selectedFeature) {
            if (!Array.isArray(addedAttributes)) {
                return;
            }
            const attributes = {};

            addedAttributes.forEach(attributeRow => {
                if (!isObject(attributeRow)) {
                    return;
                }
                const key = attributeRow.key,
                    value = attributeRow.value;

                attributes[key] = value;
            });

            if (Object.keys(attributes).length) {
                selectedFeature.setProperties(attributes);
            }
        },
        /**
         * Generates the attributes' key list and emits the updateAttributesKeyList function
         * @param {Object[]} attributes The attributes array.
         * @returns {void}
         */
        updateAttributesKeyList (attributes) {
            const keyList = [];

            attributes.forEach(attr => {
                keyList.push(attr.key);
            });

            this.$emit("updateAttributesKeyList", keyList);
        },
        /**
         * Checks if the selectedFeature is a feature.
         * @returns {Boolean} true if its a feature, false if not.
         */
        isFeature () {
            return isObject(this.selectedFeature);
        },
        /**
         * Checks the given attributes on duplicated keys and empty keys.
         * @param {Object[]} attributes The attributes array.
         * @returns {Boolean} true if attributes array is fine, false if key is duplicated or empty.
         */
        checkAttributes (attributes) {
            const keyStatus = {};
            let success = true;

            attributes.forEach(attribute => {
                if (!Object.prototype.hasOwnProperty.call(keyStatus, attribute.key)) {
                    keyStatus[attribute.key] = {valid: true};
                    if (!attribute.key) {
                        keyStatus[attribute.key].valid = false;
                        keyStatus[attribute.key].message = this.$t("common:modules.draw_old.attributeSelect.attributeKeyError");
                        success = false;
                    }
                }
                else {
                    if (!isObject(keyStatus[attribute.key])) {
                        keyStatus[attribute.key] = {};
                    }
                    keyStatus[attribute.key].valid = false;
                    keyStatus[attribute.key].message = this.$t("common:modules.draw_old.attributeSelect.attributeDuplicatedKeyError");
                    success = false;
                }
            });
            this.validKeys = keyStatus;
            return success;
        },
        switchToRef (ref) {
            if (typeof this.$refs[ref]?.focus === "function") {
                this.$refs[ref].focus();
            }
        }
    }
};
</script>

<template>
    <form id="draw-attributes">
        <div
            v-if="isFeature()"
            class="form-group form-group-sm"
        >
            <div
                v-for="(attribute, idx) in attributes"
                :key="idx"
                class="row align-items-center text-center justify-content-center mb-1"
            >
                <div class="col-5 position-relative">
                    <div class="input-group has-validation">
                        <input
                            :id="'key-input-'+idx"
                            v-model="attribute.key"
                            aria-label="attribute"
                            type="text"
                            :title="validKeys[attribute.key].valid === null ? validKeys[attribute.key].message : null"
                            :class="[validKeys[attribute.key].valid === false ? 'is-invalid' : '', 'form-control']"
                            placeholder="Attribute key"
                        >
                    </div>
                </div>
                <div class="col-1">
                    -
                </div>
                <div class="col-5">
                    <input
                        v-model="attribute.value"
                        aria-label="attribute"
                        type="text"
                        class="form-control"
                        placeholder="Attribute value"
                    >
                </div>
                <IconButton
                    :aria="$t('common:modules.draw_old.attributeSelect.remove')"
                    :icon="'bi bi-trash'"
                    :interaction="() => removeAttribute(idx)"
                    :class-array="['btn-light']"
                />
            </div>
            <div class="row align-items-center text-center justify-content-center">
                <div class="col-5">
                    <div class="input-group has-validation">
                        <input
                            id="attribute-key-input"
                            ref="attributeKey"
                            v-model="attributeKey"
                            aria-label="attribute"
                            type="text"
                            :title="addKey.valid === null ? addKey.message : null"
                            :class="[addKey.valid === false ? 'is-invalid' : '', 'form-control']"
                            :placeholder="$t('common:modules.draw_old.attributeSelect.input.key')"
                            @input="addKey.valid = true"
                            @keyup.enter="switchToRef('attributeValue')"
                        >
                    </div>
                </div>
                <div class="col-1">
                    -
                </div>
                <div class="col-5">
                    <input
                        ref="attributeValue"
                        v-model="attributeValue"
                        aria-label="attribute"
                        type="text"
                        class="form-control"
                        :placeholder="$t('common:modules.draw_old.attributeSelect.input.value')"
                        @keyup.enter="addAttributesToFeature(), switchToRef('attributeKey')"
                    >
                </div>
                <IconButton
                    :aria="$t('common:modules.draw_old.attributeSelect.save')"
                    :icon="'bi bi-save'"
                    :interaction="() => addAttributesToFeature()"
                    :class-array="['btn-light']"
                />
            </div>
        </div>
        <div v-else>
            <span>{{ $t("common:modules.draw_old.attributeSelect.noFeatureSelected") }}</span>
        </div>
    </form>
</template>

<style lang="scss" scoped>
hr {
    margin: 0;
}
.bi-trash, .bi-save {
    cursor: pointer;
}
.col-1 {
    padding: 0;
    width: auto;
}
</style>
