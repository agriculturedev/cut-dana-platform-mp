<script>
import {mapGetters, mapMutations} from "vuex";
import isObject from "../../../shared/js/utils/isObject";
import {buildXmlFilter} from "../js/buildFilter";
import {fieldValueChanged} from "../js/literalFunctions";
import {buildPath, getOptions, prepareOptionsWithId} from "../js/pathFunctions";
import requestProvider from "../js/requests";

/**
 * Validates that the prop for the type is correct.
 *
 * @param {String} queryType The type to be validated.
 * @returns {Boolean} Whether a correct type was given or not.
 */
function validate (queryType) {
    return ["equal", "like"].indexOf(queryType) !== -1;
}

export default {
    name: "WfsSearchField",
    props: {
        fieldId: {
            type: [String, Array],
            required: true
        },
        fieldName: {
            type: [String, Array],
            required: true
        },
        inputLabel: {
            type: [String, Array],
            required: true
        },
        defaultValue: {
            type: [String, Array],
            default: ""
        },
        dropdownInputUsesId: {
            type: [Boolean, Array],
            default: false
        },
        inputPlaceholder: {
            type: [String, Array],
            default: ""
        },
        inputTitle: {
            type: [String, Array],
            default: ""
        },
        options: {
            type: [String, Array],
            default: null
        },
        required: {
            type: [Boolean, Array],
            default: false
        },
        suggestionsConfig: {
            type: [Object, Array],
            default: undefined
        },
        queryType: {
            type: [String, Array],
            default: "equal",
            validator: function (type) {
                return typeof type === "string" ? validate(type) : type.every(val => validate(val));
            }
        }
    },
    data: () => ({
        parameterIndex: 0,
        showLoader: false,
        suggestions: [],
        value: ""
    }),
    computed: {
        ...mapGetters("Modules/WfsSearch", [
            "parsedSource",
            "requiredValues",
            "selectedOptions",
            "service",
            "valuesReset",
            "currentInstance",
            "currentInstanceIndex"
        ]),
        selectableParameters () {
            // This could be checked with any required value
            if (Array.isArray(this.fieldName)) {
                // The "options" part is special, as it already can be an array. The second check makes sure, that the elements of the array should not be displayed but are part of a single field config.
                return {
                    fieldId: this.fieldId,
                    fieldName: this.fieldName[this.parameterIndex],
                    inputLabel: this.inputLabel[this.parameterIndex],
                    defaultValue: this.multipleValues(this.defaultValue),
                    dropdownInputUsesId: this.multipleValues(this.dropdownInputUsesId),
                    inputPlaceholder: this.multipleValues(this.inputPlaceholder),
                    inputTitle: this.multipleValues(this.inputTitle),
                    options: Array.isArray(this.options) && !isObject(this.options[0]) ? this.options[this.parameterIndex] : this.options,
                    required: this.multipleValues(this.required),
                    suggestionsConfig: this.multipleValues(this.suggestionsConfig),
                    queryType: this.multipleValues(this.queryType)
                };
            }
            return this.$props;
        },
        htmlElement () {
            return this.selectableParameters.options === null ? "input" : "select";
        },
        /**
         * If the options of the field are from an external source, it is disabled if:
         * - Is not the root element and the root element has not been added yet
         * - The prior needed element (e.g. 'foo' is needed to have the field 'foo.bar') is not added yet
         * - The prior needed / root element (example above) is not selected yet
         *
         * @returns {Boolean} Whether the input is disabled or not.
         */
        disabled () {
            const notRoot = this.selectableParameters.options !== "";

            if (typeof this.selectableParameters.options === "string" && notRoot && this.parsedSource !== null && Object.keys(this.selectedOptions).length > 0) {
                const optionsArr = this.selectableParameters.options.split("."),
                    selectedValues = Object.keys(this.selectedOptions);

                return !(this.currentInstance.addedOptions?.includes("")
                    && optionsArr.every(option => this.currentInstance.addedOptions.includes(option))
                    && (selectedValues.includes("") && optionsArr.slice(0, optionsArr.length - 1).every(option => selectedValues.includes(option))));
            }
            // Disable all options depending on the root source in the beginning or if the external source hasn't been loaded yet
            return typeof this.selectableParameters.options === "string" ? this.parsedSource === null || notRoot : false;
        },
        selectableOptions () {
            // Options are supposed to be retrieved from the external source
            if (typeof this.selectableParameters.options === "string" && this.parsedSource !== null) {
                if (this.selectableParameters.options === "") {
                    if (this.selectableParameters.dropdownInputUsesId) {
                        return prepareOptionsWithId(this.parsedSource, true);
                    }

                    return Object.keys(this.parsedSource);
                }

                const optionsArr = this.selectableParameters.options.split("."),
                    lastIndex = optionsArr.length - 1;

                if (Object.keys(this.selectedOptions).includes("")) {
                    const optionKeysWithoutRoot = Object.keys(this.selectedOptions)
                            .filter(option => option !== ""),
                        previousElementsSelected = optionsArr.slice(0, lastIndex)
                            .every(option => optionKeysWithoutRoot.includes(option));

                    if (previousElementsSelected) {
                        return getOptions(
                            buildPath(this.selectedOptions, optionsArr[lastIndex], this.parsedSource),
                            this.parsedSource
                        );
                    }
                }

                return [];
            }
            // Either options are already given through the config or the standard value 'null' is returned
            return this.selectableParameters.options;
        },
        showSuggestions () {
            const length = typeof this?.suggestionsConfig?.length !== "undefined" ? this.suggestionsConfig.length : 3;

            return !this.options && this.suggestionsConfig && this.value.length >= length;
        }
    },
    watch: {
        currentInstanceIndex () {
            this.updateCurrentInstanceOptions();
        }
    },
    mounted () {
        this.updateCurrentInstanceOptions();
    },
    methods: {
        ...mapMutations("Modules/WfsSearch", [
            "setValuesReset",
            "setRequiredValues",
            "setSelectedOptions",
            "addOptions"
        ]),
        /**
         * Update the addedOptions field for the current instance.         *
         * @returns {void}
         */
        updateCurrentInstanceOptions () {
            if (typeof this.selectableParameters.options === "string") {
                if (this.selectableParameters.options === "") {
                    this.addOptions(this.selectableParameters.options);
                }
                else {
                    const optionsArr = this.selectableParameters.options.split(".");

                    // Current option is always the last part of the string
                    this.addOptions(optionsArr[optionsArr.length - 1]);
                }
            }
        },
        /**
         * The array check needs to be done for every property which is not required
         * to check if multiple parameters can be selected from this field and if every
         * parameter has different values set.
         *
         * @param {Boolean/Object/String/Array} prm The parameter to be checked.
         * @returns {String} The currently selected value.
         */
        multipleValues (prm) {
            return Array.isArray(prm) ? prm[this.parameterIndex] : prm;
        },
        async valueChanged (val) {
            const value = this.value = this.htmlElement === "input" || val === "" ? val : JSON.parse(val).value;

            this.setValuesReset(false);
            // NOTE: The extra object is sadly needed so that the object is reactive :(
            this.setRequiredValues({...fieldValueChanged(this.selectableParameters.fieldId, value, this.currentInstance.literals, this.requiredValues, this.parameterIndex)});

            if (typeof this.selectableParameters.options === "string") {
                const index = val === "" ? 0 : JSON.parse(val).index;

                this.setSelectedOptions({options: this.selectableParameters.options, value, index});
            }
            else if (this.showSuggestions) {
                this.showLoader = true;
                const fieldName = Array.isArray(this.fieldName) ? this.fieldName[this.parameterIndex] : this.fieldName,
                    xmlFilter = buildXmlFilter({fieldName, queryType: "like", value}),
                    suggestions = await requestProvider.searchFeatures(this.$store, this.currentInstance, this.service, xmlFilter, this?.suggestionsConfig?.featureType);

                this.showLoader = false;
                // Retrieve the values for the fieldName and make sure they are unique.
                this.suggestions = [...new Set(suggestions.map(v => v.values_[fieldName]))];
            }
        },
        isObject
    }
};
</script>

<template>
    <div class="mb-3">
        <div
            v-if="Array.isArray(inputLabel)"
            class="form-floating mb-3"
        >
            <select
                :id="`module-wfsSearch-${selectableParameters.fieldName}-${selectableParameters.fieldId}-fieldSelection`"
                class="form-select"
                :aria-label="$t('common:modules.wfsSearch.fieldSelectionLabel')"
                @change="parameterIndex = $event.currentTarget.value"
            >
                <option
                    v-for="(label, index) of inputLabel"
                    :key="index + label"
                    :value="index"
                >
                    {{ label }}
                </option>
            </select>
            <label for="`module-wfsSearch-${selectableParameters.fieldName}-${selectableParameters.fieldId}-fieldSelection`">
                {{ $t("common:modules.wfsSearch.fieldSelectionLabel") }}
            </label>
        </div>
        <label
            v-else
            :for="`module-wfsSearch-${selectableParameters.fieldName}-${selectableParameters.fieldId}-input`"
        >
            {{ inputLabel.endsWith("*") ? $t(inputLabel.split("*")[0]) + "*" : $t(inputLabel) }}
        </label>
        <div class="form-floating">
            <component
                :is="htmlElement"
                :id="`module-wfsSearch-${selectableParameters.fieldName}-${selectableParameters.fieldId}-input`"
                :class="{
                    'form-control': htmlElement !== 'select',
                    'form-select': htmlElement === 'select',
                    'module-wfsSearch-field-input': htmlElement === 'input'
                }"
                :default-value="htmlElement === 'input' ? selectableParameters.defaultValue : ''"
                :required="selectableParameters.required"
                :disabled="disabled"
                :list="htmlElement === 'input' && showSuggestions ? `module-wfsSearch-${fieldName}-${fieldId}-input-suggestions` : ''"
                :aria-label="Array.isArray(inputLabel) ? selectableParameters.inputLabel : ''"
                @input="valueChanged($event.currentTarget.value)"
            >
                <template v-if="htmlElement === 'select'">
                    <option
                        value="1"
                        :selected="valuesReset"
                    >
                        {{ $t("common:modules.wfsSearch.optionsPlaceholder") }}
                    </option>
                    <option
                        v-for="(option, index) of selectableOptions"
                        :key="index + isObject(option) ? option.fieldValue : option"
                        :value="JSON.stringify(isObject(option) ? {value: option.fieldValue, index} : {value: option, index})"
                    >
                        {{ isObject(option) ? (option.displayName ? option.displayName : option.fieldValue) : option }}
                    </option>
                </template>
            </component>
            <i
                v-if="htmlElement === 'input' && showLoader"
                class="loader"
            />
            <datalist
                v-if="htmlElement === 'input'"
                :id="`module-wfsSearch-${fieldName}-${fieldId}-input-suggestions`"
            >
                <option
                    v-for="(val, index) in suggestions"
                    :key="val + index"
                    :value="val"
                >
                    {{ val }}
                </option>
            </datalist>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* Loader CSS based on https://codepen.io/lopis/pen/zwprzP  */
@import "~variables";

$length: 1.5em;

.loader {
    position: relative;
    bottom: 2rem;
    left: 87.5%;
    height: $length;
    width: $length;
    display: inline-block;
    animation: around 5.4s infinite;

    &:after, &:before {
        content: "";
        background: white;
        position: absolute;
        display: inline-block;
        width: 100%;
        height: 100%;
        border-width: 0.15rem;
        border-color: $dark_grey $dark_grey transparent transparent;
        border-style: solid;
        border-radius: 1rem;
        box-sizing: border-box;
        top: 0;
        left: 0;
        animation: around 0.7s ease-in-out infinite;
    }

    &:after {
        animation: around 0.7s ease-in-out 0.1s infinite;
        background: transparent;
    }
}

@keyframes around {
    0% {
        transform: rotate(0deg)
    }
    100% {
        transform: rotate(360deg)
    }
}

.form-control:focus ~ label {
    color: $secondary;
}
</style>
