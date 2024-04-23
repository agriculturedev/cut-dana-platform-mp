<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getLayerInformationModule from "../utils/getLayerInformation";
import ToolTemplate from "../../ToolTemplate.vue";
import {getComponent} from "../../../../utils/getComponent";
import SimpleButton from "../../../../share-components/SimpleButton.vue";

export default {
    name: "WfsTransaction",
    components: {SimpleButton, ToolTemplate},
    computed: {
        ...mapGetters("Tools/Wfst", ["currentInteractionConfig", "currentLayerIndex", "featureProperties", "layerIds", "layersLoading", "layerInformation", "layerSelectDisabled", "layerSelectLabel", "selectedInteraction", "showInteractionsButtons", "isLayerVisible", "active", "deactivateGFI", "icon", "name", "id", "isFormDisabled"]),

        loadedLayerIds () {
            return this.$store.getters["Maps/loadedLayers"];
        }
    },
    watch: {
        active (val) {
            this.setActive(val);
        },

        loadedLayerIds (val) {
            if (this.layerIds.every(id => val?.includes(id))) {
                this.setLayersLoading(false);
            }
        }
    },
    created () {
        this.$on("close", this.close);
        this.updateLayerSelection();
        Backbone.Events.listenTo(Radio.channel("ModelList"), "updatedSelectedLayerList", this.updateLayerSelection);
    },
    methods: {
        ...mapMutations("Tools/Wfst", ["setCurrentLayerIndex", "setLayerInformation", "setLayersLoading"]),
        ...mapActions("Tools/Wfst", ["prepareInteraction", "reset", "save", "setActive", "updateFeatureProperty", "setFeatureProperties"]),
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        updateLayerSelection () {
            const newLayerInformation = getLayerInformationModule.getLayerInformation(this.layerIds),
                firstActiveLayer = newLayerInformation.findIndex(layer => layer.isSelected),
                currentLayerDeactivated = this.currentLayerIndex > -1 && !newLayerInformation[this.currentLayerIndex].isSelected;

            this.setLayerInformation(newLayerInformation);
            if ((this.currentLayerIndex === -1 && firstActiveLayer > -1) ||
                (this.currentLayerIndex > -1 && firstActiveLayer === -1) ||
                (currentLayerDeactivated && firstActiveLayer > -1)) {
                this.setCurrentLayerIndex(firstActiveLayer);
            }
            if (currentLayerDeactivated) {
                this.reset();
            }
            this.setFeatureProperties();
        },
        layerChanged (index) {
            this.setCurrentLayerIndex(index);
            this.setFeatureProperties();
            this.reset();
        },
        getInputType (type) {
            if (type === "string") {
                return "text";
            }
            else if (["integer", "int", "decimal", "short", "float"].includes(type)) {
                return "number";
            }
            else if (type === "boolean") {
                return "checkbox";
            }
            else if (type === "date") {
                return "date";
            }
            else if (type === "dateTime") {
                return "datetime-local";
            }
            return "";
        },
        getDecimalStep (type, value) {
            if (type === "decimal" && value) {
                const fractionalPartLength = value.toString().split(",")?.[1]?.length || value.toString().split(".")?.[1]?.length;

                if (fractionalPartLength) {
                    switch (fractionalPartLength) {
                        case 1: return "0.1";
                        case 2: return "0.01";
                        default: return "0.001";
                    }
                }
                return "1";
            }
            return null;
        },
        formatDecimalValue (type, value) {
            if (type === "decimal" && value) {
                if (value.includes(".") || value.includes(",")) {
                    return value.replace(",", ".");
                }
                return value + ".0";

            }
            return value;
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-wfs-transaction-container"
            >
                <div class="layer-select-container">
                    <label
                        id="tool-wfs-transaction-layer-select-label"
                        for="tool-wfs-transaction-layer-select-input"
                    >
                        {{ $t(layerSelectLabel) }}
                    </label>
                    <select
                        id="tool-wfs-transaction-layer-select-input"
                        class="form-select"
                        :disabled="layerSelectDisabled"
                        @change="layerChanged($event.target.options.selectedIndex)"
                    >
                        <option
                            v-for="(layer, index) of layerInformation"
                            :key="layer.id"
                            :disabled="!loadedLayerIds?.includes(layer.id)"
                            :selected="index === currentLayerIndex"
                        >
                            {{ $t(layer.name) }}
                        </option>
                    </select>
                    <div
                        v-if="layersLoading && currentLayerIndex > -1"
                        id="tool-wfs-transaction-layers-loading"
                    >
                        <div class="spinner-border spinner-border-sm" />
                    </div>
                </div>
                <template v-if="!isLayerVisible || currentLayerIndex === -1">
                    <div class="tool-wfs-transaction-layer-failure">
                        {{ $t("common:modules.tools.wfsTransaction.error.layerNotSelected") }}
                    </div>
                </template>
                <div
                    v-else-if="showInteractionsButtons"
                    class="tool-wfs-transaction-interaction-select-container"
                >
                    <template v-for="(config, key) in currentInteractionConfig">
                        <SimpleButton
                            v-if="config.available"
                            :key="key"
                            :text="config.text"
                            :icon="config.icon"
                            class="interaction-button"
                            :interaction="() => prepareInteraction(key)"
                        />
                    </template>
                </div>
                <template v-else>
                    <div class="tool-wfs-transaction-form-container">
                        <hr>
                        <p
                            v-if="currentInteractionConfig.Polygon.available"
                            class="mb-2"
                        >
                            {{ $t("common:modules.tools.wfsTransaction.polygonHint") }}
                        </p>
                        <p
                            v-if="featureProperties.find(prop => prop.required)"
                            class="mb-2"
                        >
                            <span><span class="form-label-info"> - </span>{{ $t("common:modules.tools.wfsTransaction.fieldRequired") }}</span>
                        </p>
                        <form id="tool-wfs-transaction-form">
                            <template v-for="property of featureProperties">
                                <template v-if="property.type !== 'geometry'">
                                    <label
                                        :key="`${property.key}-label`"
                                        :for="`tool-wfs-transaction-form-input-${property.key}`"
                                        class="form-label"
                                        :class="{'form-label__required': property.required && getInputType(property.type) !== 'checkbox'}"
                                    >
                                        {{ $t(property.label) }}
                                    </label>
                                    <input
                                        v-if="getInputType(property.type) ==='checkbox'"
                                        :id="`tool-wfs-transaction-form-input-${property.key}`"
                                        :key="`${property.key}-checkbox-input`"
                                        :type="getInputType(property.type)"
                                        :checked="['true', true].includes(property.value) ? true : false"
                                        class="form-control-checkbox"
                                        @input="event => updateFeatureProperty({
                                            key: property.key,
                                            type: getInputType(property.type),
                                            value: event.target.checked
                                        })"
                                    >
                                    <input
                                        v-else
                                        :id="`tool-wfs-transaction-form-input-${property.key}`"
                                        :key="`${property.key}-input`"
                                        class="form-control"
                                        :class="{
                                            'form-control__valid': property.required && property.valid === true,
                                            'form-control__invalid': property.required && property.valid === false
                                        }"
                                        :step="property.type === 'decimal' ? getDecimalStep(property.type, property.value) : null"
                                        :title="property.required && !property.valid ? $t(`common:modules.tools.wfsTransaction.mandatoryInputError.${getInputType(property.type)}`): ''"
                                        :type="getInputType(property.type)"
                                        :required="property.required"
                                        :value="property.value"
                                        @input="event => updateFeatureProperty({
                                            key: property.key,
                                            type: getInputType(property.type),
                                            value: property.type === 'decimal' ? formatDecimalValue(property.type, event.target.value) : event.target.value,
                                            required: property.required
                                        })"
                                    >
                                </template>
                            </template>
                            <div class="tool-wfs-transaction-form-buttons">
                                <SimpleButton
                                    :interaction="reset"
                                    text="common:modules.tools.wfsTransaction.form.discard"
                                    class="form-button"
                                />
                                <SimpleButton
                                    :interaction="save"
                                    :disabled="isFormDisabled"
                                    text="common:modules.tools.wfsTransaction.form.save"
                                    type="button"
                                    class="form-button"
                                />
                            </div>
                        </form>
                    </div>
                </template>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
$margin: 1rem;

#tool-wfs-transaction-container {
    .layer-select-container {
        display: flex;
        justify-content: space-between;

        #tool-wfs-transaction-layer-select-label {
            width: 10em;
            align-self: center;
        }
    }

    #tool-wfs-transaction-layers-loading {
        display: flex;
        align-items: center;
        margin-left: $margin;
    }

    .tool-wfs-transaction-layer-failure {
        display: flex;
        justify-content: center;
        align-content: center;
        margin-top: $margin;
    }

    .tool-wfs-transaction-interaction-select-container {
        display: flex;
        justify-content: space-between;
        margin-top: $margin;

        .interaction-button {
            margin: 5px;
        }
        .interaction-button:first-child {
            margin-left: 0;
        }
        .interaction-button:last-child {
            margin-right: 0;
        }
    }

    .tool-wfs-transaction-form-container {
        width: 40em;
    }

    #tool-wfs-transaction-form {
        display: grid;
        grid-template-columns: 10em 30em;
        grid-row-gap: calc(#{$margin} / 2);

        .form-label {
            align-self: center;
            margin: 0;
        }

        .form-control.form-control__valid {
            border: 1px solid green;
        }
        .form-control.form-control__invalid {
            border: 1px solid red;
        }
    }

    .form-label__required::after,
    .form-label-info::before {
        content: "*";
        color: red;
    }

    .tool-wfs-transaction-form-buttons {
        display: grid;
        grid-template-columns: repeat(2, 20em);
        margin-top: calc(#{$margin} / 2);

        .form-button:first-child {
            margin-right: calc(#{$margin} / 2);
        }
        .form-button:last-child {
            margin-left: calc(#{$margin} / 2);
        }
    }
}
</style>
