<script>
import {pointerMove} from "ol/events/condition.js";
import selectInteraction from "@masterportal/masterportalapi/src/maps/interactions/selectInteraction";
import modifyInteraction from "@masterportal/masterportalapi/src/maps/interactions/modifyInteraction";
import {mapActions} from "vuex";

import IconButton from "../../buttons/components/IconButton.vue";

/**
 * Shared component that provides buttons to edit drawn features.
 * @module shared/modules/draw/DrawEdit
 * @vue-prop {String[]} [drawEdits=["deleteAll", "delete", "edit", "undo", "redo"] - The draw edits.
 * @vue-prop {Object} [drawIcons={delete: "bi-eraser-fill", deleteAll: "bi-trash", modify: "bi-tools", redo: "bi-arrow-right", undo: "bi-arrow-left"}] - The icons for edit buttons.
 * @vue-prop {ol/layer/Vector} layer - The vector layer for drawings.
 * @vue-prop {String} [selectedInteraction="draw"] - The selected interaction.
 * @vue-prop {Function} [setSelectedInteraction=null] - Setter for selected interaction.
 * @vue-data {ol/interaction/Select} - The current select interactions.
 * @vue-data {ol/interaction/Modify} - The current modify interaction.
 * @vue-data {Object} - The mapping object for edit interactions.
 * @vue-data {String} - The current mode.
 * @vue-data {ol/feature[]} - Contains the redo features.
 * @vue-data {ol/feature[]} - Contains the undo features.
 */
export default {
    name: "DrawEdit",
    components: {
        IconButton
    },
    props: {
        drawEdits: {
            type: Array,
            default () {
                return ["deleteAll", "delete", "edit", "undo", "redo"];
            }
        },
        drawIcons: {
            type: Object,
            default () {
                return {
                    delete: "bi-eraser-fill",
                    deleteAll: "bi-trash",
                    modify: "bi-tools",
                    redo: "bi-arrow-right",
                    undo: "bi-arrow-left"
                };
            }
        },
        layer: {
            type: Object,
            required: true
        },
        selectedInteraction: {
            type: String,
            default () {
                return "draw";
            }
        },
        setSelectedInteraction: {
            type: Function,
            default () {
                return null;
            }
        }
    },
    data () {
        return {
            currentSelectInteractions: [],
            currentModifyInteraction: null,
            mappingEditInteractions: {
                delete: this.regulateDelete,
                deleteAll: this.regulateDeleteAll,
                modify: this.regulateModify,
                redo: this.regulateRedo,
                undo: this.regulateUndo
            },
            mode: "",
            redoFeatures: [],
            undoFeatures: []
        };
    },
    computed: {
        source () {
            return this.layer?.getSource();
        }
    },
    watch: {
        selectedInteraction (selectedInteraction) {
            if (selectedInteraction !== "delete") {
                this.currentSelectInteractions.forEach(currentSelectInteraction => this.removeInteraction(currentSelectInteraction));
                this.currentSelectInteractions = [];
            }
            if (selectedInteraction !== "modify") {
                this.removeInteraction(this.currentModifyInteraction);
                this.currentModifyInteraction = null;
            }
        }
    },
    mounted () {
        this.source.on("addfeature", event => {
            this.shiftUndoRedoFeatures(event.feature, "draw", this.mode);
        });

        this.source.on("removefeature", event => {
            this.shiftUndoRedoFeatures(event.feature, "delete", this.mode);
        });

        this.source.on("clear", () => {
            this.mode = "";
        });
    },
    unmounted () {
        this.currentSelectInteractions.forEach(currentSelectInteraction => this.removeInteraction(currentSelectInteraction));
        this.removeInteraction(this.currentModifyInteraction);
    },
    methods: {
        ...mapActions("Maps", ["addInteraction", "removeInteraction"]),

        /**
         * Regulate the draw edit interactions.
         * @param {String} drawEdit The current draw edit.
         * @returns {void}
         */
        regulateEditInteraction (drawEdit) {
            this.mappingEditInteractions[drawEdit]();
        },

        /**
         * Regulate the draw edit delete interaction.
         * The previous select interactions are removed from the map and newly created select interactions are added.
         * @returns {void}
         */
        regulateDelete () {
            if (typeof this.setSelectedInteraction === "function") {
                this.setSelectedInteraction("delete");
            }

            this.currentSelectInteractions.forEach(currentSelectInteraction => this.removeInteraction(currentSelectInteraction));
            this.currentSelectInteractions = this.createSelectInteractions(this.layer);
            selectInteraction.removeSelectedFeature(this.currentSelectInteractions[0], this.source);
            this.currentSelectInteractions.forEach(currentSelectInteraction => this.addInteraction(currentSelectInteraction));
        },

        /**
         * Create the select interactions for delte features.
         * The first interaction is executed with a singleClick and is needed to delete a feature.
         * The second interaction is only used to highlight the feature on hover/pointermove.
         * @param {ol/layer/Vector} layer The vector layer for drawings.
         * @returns {ol/interaction/Select[]} The select interactions.
         */
        createSelectInteractions (layer) {
            return [
                selectInteraction.createSelectInteraction(layer),
                selectInteraction.createSelectInteraction(layer, pointerMove)
            ];
        },

        /**
         * Regulate the draw edit delete all (clear) interaction.
         * If delete all was executed, all deleted features will be stored as array in undoFeatures and redoFeatures respectively.
         * @returns {void}
         */
        regulateDeleteAll () {
            this.mode = "deleteAll";

            this.undoFeatures.push(this.source.getFeatures());
            this.source.clear();
        },

        /**
         * Regulate the draw edit modify interaction.
         * The previous modify interaction is removed from the map and newly created modify interaction is added.
         * @returns {void}
         */
        regulateModify () {
            if (typeof this.setSelectedInteraction === "function") {
                this.setSelectedInteraction("modify");
            }

            this.removeInteraction(this.currentModifyInteraction);
            this.currentModifyInteraction = modifyInteraction.createModifyInteraction(this.source);
            this.addInteraction(this.currentModifyInteraction);
        },

        /**
         * Regulate the draw edit undo.
         * @returns {void}
         */
        regulateUndo () {
            this.undoRedoFeatures(this.undoFeatures, "undo");
        },

        /**
         * Regulate the draw edit redo.
         * @returns {void}
         */
        regulateRedo () {
            this.undoRedoFeatures(this.redoFeatures, "redo");
        },

        /**
         * Regulates the undo or redo features,
         * depending on whether the last feature was drawn in features,
         * deleted or is an array of features (delete all).
         * @param {ol/feature[]} features The undo or redo features.
         * @param {String} mode The undo or redo mode.
         * @returns {void}
         */
        undoRedoFeatures (features, mode) {
            if (features.length > 0) {
                const source = this.source,
                    feature = features[features.length - 1];

                this.mode = mode;

                if (this.isDeleteAllMode(feature)) {
                    this.undoRedoDeleteAll(mode, features, source);
                }
                else if (feature.mode === "draw") {
                    source.removeFeature(feature.feature);
                }
                else if (feature.mode === "delete") {
                    source.addFeature(feature.feature);
                }
            }
        },

        /**
         * Checks if the feature was created by the edit function deleteAll.
         * @param {ol/feature|ol/feature[]} feature The undo or redo feature.
         * @returns {Boolean} The feature is an array of features or not.
         */
        isDeleteAllMode (feature) {
            return Array.isArray(feature);
        },

        /**
         * Regulates the undo redo features, if delete all was used.
         * A distinction is made between undo and redo.
         * With undo, the features are restored.
         * With redo, the features are deleted again.
         * @param {String} mode The undo or redo mode.
         * @param {ol/feature[]} features The undo or redo features.
         * @param {ol/source} source The vector layer.
         * @returns {void}
         */
        undoRedoDeleteAll (mode, features, source) {
            const featureArray = features.pop();

            this.mode = "deleteAll";

            if (mode === "undo") {
                source.addFeatures(featureArray);
                this.redoFeatures.push(featureArray);
            }
            else if (mode === "redo") {
                featureArray.forEach(feat => source.removeFeature(feat));
                this.undoFeatures.push(featureArray);
            }
            this.mode = "";
        },

        /**
         * Changes the position of features in undo and redo feature collections.
         * The shift is determined based on the triggered edit mode.
         * Note: When deleteAll is executed, the editMode is an empty string because each feature is added or removed individually from the layer source.
         * @param {ol/feature} feature The ol feature.
         * @param {String} featureMode Mode of the feature, possible modes are draw or delete.
         * @param {String} editMode Editing mode that was executed.
         * @returns {void}
         */
        shiftUndoRedoFeatures (feature, featureMode, editMode) {
            const undoRedoFeature = {
                feature: feature,
                mode: featureMode
            };

            if (editMode === "undo") {
                this.mode = "";
                this.undoFeatures.pop();
                this.redoFeatures.push(undoRedoFeature);
            }
            else if (editMode === "redo") {
                this.mode = "";
                this.redoFeatures.pop();
                this.undoFeatures.push(undoRedoFeature);
            }
            else if (editMode === "") {
                this.undoFeatures.push(undoRedoFeature);
                this.redoFeatures = [];
            }
        }
    }
};
</script>

<template>
    <div
        v-if="source?.getFeatures()?.length > 0 || undoFeatures.length > 0 || redoFeatures.length > 0"
        class="mb-4"
    >
        <div class="d-flex">
            <IconButton
                v-for="drawEdit in drawEdits"
                :id="'draw-edit-' + drawEdit"
                :key="drawEdit"
                :aria="$t('common:shared.modules.draw.drawEdit.' + drawEdit)"
                :class-array="[
                    'btn-light',
                    'me-3',
                    selectedInteraction === drawEdit ? 'active': '',
                    drawEdit === 'redo' && redoFeatures.length === 0 ? 'disabled' : '',
                    drawEdit === 'undo' && undoFeatures.length === 0 ? 'disabled' : '',
                    drawEdit !== 'redo' && drawEdit !== 'undo' && source?.getFeatures()?.length === 0 ? 'disabled' : ''
                ]"
                :interaction="() => regulateEditInteraction(drawEdit)"
                :icon="drawIcons[drawEdit]"
            />
        </div>
        <hr>
    </div>
</template>
