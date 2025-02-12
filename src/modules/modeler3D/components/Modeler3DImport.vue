<script>
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import EntityList from "./ui/EntityList.vue";
import EntityModel from "./Modeler3DEntityModel.vue";
import FileUpload from "../../../shared/modules/inputs/components/FileUpload.vue";
import SpinnerItem from "../../../shared/modules/spinner/components/SpinnerItem.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";

import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
/**
 * The component that handels the import of 3D models in different formats (dae, obj, glb, gltf, geojson).
 * @module modules/modeler3D/components/Modeler3DImport
 */
export default {
    name: "Modeler3DImport",
    components: {
        AccordionItem,
        EntityList,
        EntityModel,
        FileUpload,
        SpinnerItem
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Modules/Modeler3D", ["currentModelId", "importedModels", "isLoading", "wasDrawn"])

    },
    mounted () {
        this.setFocusToFirstControl();
    },
    methods: {
        ...mapActions("Modules/Modeler3D", ["changeVisibility", "createEntity", "handleGeoJsonFile"]),
        ...mapMutations("Modules/Modeler3D", ["setIsLoading"]),
        ...mapMutations("Alerting", ["addSingleAlert"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["file-upload"]) {
                    this.$refs["file-upload"].focus();
                }
            });
        },
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFile(e.target.files[0]);
                e.target.value = null;
            }
        },
        onDrop (e) {
            if (e.dataTransfer.files !== undefined) {
                this.addFile(e.dataTransfer.files[0]);
            }
        },
        addFile (file) {
            const reader = new FileReader(),
                fileName = file.name.split(".")[0],
                fileExtension = file.name.split(".").pop();

            this.setIsLoading(true);

            if (fileExtension === "gltf" || fileExtension === "glb") {
                this.handleGltfFile(file, fileName);
                return;
            }

            reader.onload = (event) => {
                if (fileExtension === "obj") {
                    this.handleObjFile(event.target.result, fileName);
                }
                else if (fileExtension === "dae") {
                    this.handleDaeFile(event.target.result, fileName);
                }
                else if (fileExtension === "geojson") {
                    this.handleGeoJsonFile(event.target.result);
                }
                else {
                    this.setIsLoading(false);
                }
            };

            reader.onerror = (e) => {
                console.error("Error reading the file:", e.target.error);
                this.setIsLoading(false);
            };

            reader.readAsText(file);
        },
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        /**
         * Handles the processing of GLTF or GLB content.
         * @param {Blob} blob - The GLTF or GLB content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        async handleGltfFile (blob, fileName) {
            await this.createEntity({blob: blob, fileName: fileName});
        },
        /**
         * Handles the processing of OBJ content.
         * @param {String} content - The OBJ content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        async handleObjFile (content, fileName) {
            const {OBJLoader} = await import("three/examples/jsm/loaders/OBJLoader.js"),
                objLoader = new OBJLoader(),
                objData = objLoader.parse(content),
                gltfExporter = new GLTFExporter();

            gltfExporter.parse(objData, async (model) => {
                const blob = new Blob([model], {type: "model/gltf+json"});

                await this.createEntity({blob: blob, fileName: fileName});
            }, (error) => {
                console.error("Error exporting OBJ to GLTF:", error);
                this.setIsLoading(false);
            }, {binary: true});
        },
        /**
         * Handles the processing of a DAE file.
         * @param {String} content - The DAE content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        async handleDaeFile (content, fileName) {
            const {ColladaLoader} = await import("three/examples/jsm/loaders/ColladaLoader.js"),
                colladaLoader = new ColladaLoader(),
                exporter = new GLTFExporter(),
                collada = colladaLoader.parse(content);

            exporter.parse(collada.scene, async (gltfData) => {
                const blob = new Blob([gltfData], {type: "model/gltf-binary"});

                await this.createEntity({blob: blob, fileName: fileName});
            }, (error) => {
                console.error("Error exporting DAE to GLTF:", error);
                this.setIsLoading(false);
            }, {binary: true});
        },
        /**
         * Toggles the visibility of a model entity.
         * @param {Object} model - The model object.
         * @returns {void}
         */
        changeVisibility (model) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {String} id - The ID of the entity to zoom to.
         * @returns {void}
         */
        zoomTo (id) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(id),
                entityPosition = entity.position.getValue(),
                destination = Cesium.Cartographic.fromCartesian(entityPosition);

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height + 250)
            });
        }
    }
};
</script>

<template lang="html">
    <SpinnerItem
        v-if="isLoading"
        custom-class="spinner"
    />
    <div
        v-else
        id="modeler3D-import-view"
    >
        <AccordionItem
            id="info-section"
            class="p-0"
            :title="$t('modules.modeler3D.import.captions.info')"
            icon="bi bi-info-circle"
        >
            <p
                class="cta"
                v-html="$t('modules.modeler3D.import.captions.introInfo')"
            />
            <p
                class="cta"
                v-html="$t('modules.modeler3D.import.captions.introInfo2')"
            />
        </AccordionItem>
        <hr class="m-0">
        <AccordionItem
            v-if="importedModels?.length > 0"
            id="import-model-section"
            class="p-0"
            :title="$t('modules.modeler3D.import.captions.successfullyImportedLabel')"
            icon="bi bi-box"
            :is-open="true"
        >
            <EntityList
                id="successfully-imported-models"
                :objects="importedModels"
                :entity="true"
                @change-visibility="changeVisibility"
                @zoom-to="zoomTo"
            />
        </AccordionItem>
        <hr
            v-if="!currentModelId"
            class="m-0"
        >
        <AccordionItem
            v-if="!currentModelId || wasDrawn"
            id="import-section"
            class="p-0"
            :title="$t('modules.modeler3D.import.captions.newImport')"
            icon="bi bi-upload"
            :is-open="true"
        >
            <p
                class="cta"
                v-html="$t('modules.modeler3D.import.captions.introFormats')"
            />
            <FileUpload
                id="fileUpload"
                :keydown="(e) => triggerClickOnFileInput(e)"
                :change="(e) => onInputChange(e)"
                :drop="(e) => onDrop(e)"
                :intro-formats="$t('modules.modeler3D.import.captions.introFormats')"
                @add-file="addFile"
            />
        </AccordionItem>
        <EntityModel
            v-if="currentModelId && !wasDrawn"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .spinner {
        width: 50px;
        height: 50px;
        margin-top: -25px;
        margin-left: -25px;
        left: 50%;
        top: 50%;
        position: absolute;
        background: rgba(0, 0, 0, 0);
    }
</style>
