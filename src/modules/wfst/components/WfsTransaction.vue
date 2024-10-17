<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import LightButton from "../../../shared/modules/buttons/components/LightButton.vue";
import ModalItem from "../../../shared/modules/modals/components/ModalItem.vue";

/**
 * Wfs Transaction
 * @module modules/WfsTransaction
 */
export default {
    name: "WfsTransaction",
    components: {LightButton, ModalItem},
    computed: {
        ...mapGetters("Modules/Wfst", [
            "currentInteractionConfig",
            "currentLayerIndex",
            "featureProperties",
            "deactivateGFI",
            "icon",
            "id",
            "layerIds",
            "layerInformation",
            "layerSelectDisabled",
            "layerSelectLabel",
            "name",
            "selectedInteraction",
            "showConfirmModal",
            "showInteractionsButtons",
            "transactionProcessing"
        ]),
        ...mapGetters(["allLayerConfigs"])
    },
    created () {
        const newLayerInformation = this.allLayerConfigs.filter(item => this.layerIds.includes(item.id)).reverse(),
            firstActiveLayer = newLayerInformation.findIndex(layer => layer.visibility),
            currentLayerDeactivated = this.currentLayerIndex > -1 && !newLayerInformation[this.currentLayerIndex].visibility;

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
    methods: {
        ...mapMutations("Modules/Wfst", ["setTransactionProcessing", "setCurrentLayerIndex", "setLayerInformation", "setShowConfirmModal"]),
        ...mapActions("Modules/Wfst", ["prepareInteraction", "reset", "save", "setFeatureProperty", "setFeatureProperties", "sendTransaction"]),
        /**
         * Changes the layer index according user selection
         * @param {Number} index Index of the layer
         * @returns {void}
         */
        layerChanged (index) {
            this.setCurrentLayerIndex(index);
            this.setFeatureProperties();
            this.reset();
        },
        /**
         * Handles the input types
         * @param {String} type Input type
         * @returns {String} Input type
         */
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
        }
    }
};
</script>

<template lang="html">
    <div>
        <div id="tool-wfs-transaction-container">
            <div class="layer-select-container">
                <label
                    id="tool-wfs-transaction-layer-select-label"
                    for="tool-wfs-transaction-layer-select"
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
                        :selected="index === currentLayerIndex"
                    >
                        {{ $t(layer.name) }}
                    </option>
                </select>
            </div>
            <template v-if="typeof featureProperties === 'string'">
                <div class="tool-wfs-transaction-layer-failure">
                    {{ $t(featureProperties) }}
                </div>
            </template>
            <div
                v-else-if="showInteractionsButtons"
                class="tool-wfs-transaction-interaction-select-container btn-toolbar mb-3"
            >
                <div
                    class="btn-group flex-wrap mr-1 mt-5"
                    role="group"
                    aria-label="Control buttons"
                >
                    <template v-for="(config, key) in currentInteractionConfig">
                        <LightButton
                            v-if="config.available"
                            :id="key"
                            :key="key"
                            :text="config.text"
                            :icon="config.icon"
                            class="interaction-button"
                            :interaction="() => prepareInteraction(key)"
                        />
                    </template>
                </div>
            </div>
            <template v-else>
                <div class="tool-wfs-transaction-form-container">
                    <hr>
                    <p
                        v-if="currentInteractionConfig.Polygon.available"
                        class="mb-2"
                    >
                        {{ $t("common:modules.wfst.polygonHint") }}
                    </p>
                    <form id="tool-wfs-transaction-form">
                        <template v-for="property of featureProperties">
                            <template v-if="property.type !== 'geometry'">
                                <label
                                    :key="`${property.key}-label`"
                                    :for="`tool-wfs-transaction-form-input-${property.key}`"
                                    class="form-label"
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
                                    @input="event => setFeatureProperty({key: property.key, type: getInputType(property.type), value: event.target.checked})"
                                >
                                <input
                                    v-else
                                    :id="`tool-wfs-transaction-form-input-${property.key}`"
                                    :key="`${property.key}-input`"
                                    class="form-control"
                                    :type="getInputType(property.type)"
                                    :required="property.required"
                                    :value="property.value"
                                    @input="event => setFeatureProperty({key: property.key, type: getInputType(property.type), value: event.target.value})"
                                >
                            </template>
                        </template>
                        <div class="tool-wfs-transaction-form-buttons">
                            <LightButton
                                :interaction="reset"
                                text="common:modules.wfst.form.discard"
                                class="form-button"
                            />
                            <LightButton
                                :interaction="save"
                                text="common:modules.wfst.form.save"
                                type="button"
                                class="form-button"
                            />
                        </div>
                    </form>
                </div>
            </template>
        </div>
        <div class="d-flex justify-content-center mt-1">
            <div
                v-if="transactionProcessing"
                class="spinner-border"
            />
        </div>
        <ModalItem
            :show-modal="showConfirmModal"
            modal-inner-wrapper-style="padding: 10px;min-width: 30em;"
            modal-1-content-container-style="padding: 0;overflow: auto;max-height: 30em;"
        >
            <div id="confirmActionContainer">
                <h3>
                    {{ $t("common:modules.wfst.deleteInteraction.headline") }}
                </h3>
                <p
                    id="confirmation-textContent"
                >
                    {{ $t("common:modules.wfst.deleteInteraction.text") }}
                </p>

                <div
                    id="confirmation-button-container"
                    name="footer"
                >
                    <button
                        id="modal-button-left"
                        class="btn btn-secondary"
                        @click="sendTransaction(); setShowConfirmModal(false)"
                    >
                        {{ $t("common:modules.button.confirm") }}
                    </button>
                    <button
                        id="modal-button-right"
                        class="btn btn-secondary"
                        @click="setShowConfirmModal(false)"
                    >
                        {{ $t("common:modules.button.stop") }}
                    </button>
                </div>
            </div>
        </ModalItem>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#delete:focus, #update:focus {
    background-color:$light_blue;
}
.spinner-border {
    border: 4px solid $primary;
    border-radius: 50%;
    border-top: 4px solid $dark_blue;
    width: 25px;
    height: 25px;
}
h3 {
    border:none;
    color: grey;
    font-size:14px;
    font-weight:bold;
    letter-spacing:initial;
    line-height:18px;
    padding:0;
}
#confirmation-textContent {
    color:#777777;
    font-size:12px;
}
#confirmation-button-container {
    overflow:hidden;
    margin-top:12px;
}
#modal-button-left {
    float:left;
    margin: 0 12px 0 0;
}
#modal-button-right {
    float:right;
    margin: 0 0 0 12px;
}
#tool-wfs-transaction-container {
    .layer-select-container {
        display: flex;
        justify-content: space-between;
        width: 25em;

        #tool-wfs-transaction-layer-select-label {
            width: 5em;
            align-self: center;
            margin-right: 1em;
        }
    }

    .tool-wfs-transaction-layer-failure {
        display: flex;
        justify-content: center;
        align-content: center;
        margin-top: 1em;
    }

   .tool-wfs-transaction-interaction-select-container {
        .interaction-button {
            border-radius: 0
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
        margin-top: 1em;
        display: grid;
        grid-template-columns: 5em 20em;
        grid-row-gap: calc(#{1em} / 3);

        .form-label {
            align-self: center;
            margin: 0;
        }
    }

    .tool-wfs-transaction-form-buttons {
        display: grid;
        grid-template-columns: repeat(2, 12.5em);
        margin-top: calc(#{1em} / 2);

        .form-button:first-child {
            margin-right: calc(#{1em} / 2);
        }
        .form-button:last-child {
            margin-left: calc(#{1em} / 2);
        }
    }
}
</style>
