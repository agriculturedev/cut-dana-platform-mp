<script>
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import EntityAttribute from "./ui/EntityAttribute.vue";
import EntityAttributeSlider from "./ui/EntityAttributeSlider.vue";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";

import {convertColor} from "../../../shared/js/utils/convertColor";
import {uniqueId} from "../../../shared/js/utils/uniqueId";
import {calculatePolygonArea} from "../js/draw";
import SwitchInput from "../../../shared/modules/checkboxes/components/SwitchInput.vue";
/**
 * The entity model component for the 3D modeler.
 * Contains the display of the entity's properties and methods to manipulate them.
 * @module modules/modeler3D/components/Modeler3DEntityModel
 * @vue-data {String} widthString - The width of rectangle entities.
 * @vue-data {String} depthString - The depth of rectangle entities.
 * @vue-data {String} extrudedHeightString - The extruded height of rectangle or polygon entities.
 * @vue-data {String} eastingString - The easting coordinate of the entity as a string.
 * @vue-data {String} northingString - The northing coordinate of the entity as a string.
 */
export default {
    name: "Modeler3DEntityModel",
    components: {
        AccordionItem,
        EntityAttribute,
        EntityAttributeSlider,
        IconButton,
        SwitchInput
    },
    inject: {
        toggleDimensions: {
            default: null
        }
    },
    data () {
        return {
            widthString: "",
            depthString: "",
            extrudedHeightString: "",
            eastingString: "",
            northingString: ""
        };
    },
    computed: {
        ...mapGetters("Modules/Modeler3D", [
            "activeShapePoints",
            "adaptToHeight",
            "coordAdjusted",
            "coordinateEasting",
            "coordinateNorthing",
            "currentModelId",
            "currentProjection",
            "drawName",
            "drawnModels",
            "drawRotation",
            "extrudedHeight",
            "formatCoord",
            "getCenterFromGeometry",
            "getEntityType",
            "getLabel",
            "height",
            "importedEntities",
            "importedModels",
            "isApplyingState",
            "isDragging",
            "lineWidth",
            "prettyCoord",
            "projections",
            "rectDepth",
            "rectWidth",
            "rotation",
            "scale",
            "wasDrawn"
        ]),

        showExtrudedHeight () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polygon && entity?.wasDrawn);
        },
        showDimensions () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polygon?.rectangle);
        },
        showPositioning () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polygon || !entity?.wasDrawn);
        },
        showWidth () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polyline && entity?.wasDrawn);
        },
        showFillColor () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polygon && entity?.wasDrawn);
        },
        /**
         * The rotation angle of the imported entity.
         * @type {string}
         * @name rotationString
         * @memberof Modeler3DEntityModel
         * @vue-computed
         * @vue-prop {number} rotation - The current rotation angle.
         * @vue-propsetter {number} rotation - Sets the rotation angle, clamping it between -180 and 180 degrees.
         */
        rotationString: {
            get () {
                return this.rotation.toString();
            },
            set (value) {
                let adjustedValue = parseInt(value, 10);

                if (adjustedValue < -180) {
                    adjustedValue = -180;
                }
                else if (adjustedValue > 180) {
                    adjustedValue = 180;
                }
                this.setRotation(adjustedValue);
                this.rotate();
                this.resetImportedModels(this.importedEntities, adjustedValue, this.currentModelId, "rotation");
            }
        },
        scaleString: {
            get () {
                return this.scale.toFixed(1);
            },
            set (value) {
                let adjustedValue = parseFloat(value.split());
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

                if (adjustedValue < 0.1) {
                    adjustedValue = 0.1;
                }
                this.setScale(adjustedValue);
                entities.getById(this.currentModelId).model.scale = this.scale;
                this.resetImportedModels(this.importedEntities, adjustedValue, this.currentModelId, "scale");
            }
        },
        lineWidthString: {
            get () {
                return this.lineWidth.toFixed(2);
            },
            set (value) {
                let adjustedValue = parseFloat(value);
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

                if (adjustedValue < 0.01) {
                    adjustedValue = 0.01;
                }
                this.setLineWidth(adjustedValue);
                entities.getById(this.currentModelId).polyline.width = this.lineWidth + 2;
                entities.getById(this.currentModelId).originalWidth = this.lineWidth;
            }
        },
        heightString: {
            get () {
                return this.height.toFixed(2);
            },
            set (value) {
                this.setHeight(this.formatCoord(value));
                this.updateEntityPosition();
            }
        },
        area () {
            return calculatePolygonArea(this.activeShapePoints);
        },
        editedFillColor: {
            get () {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                    entity = entities?.getById(this.currentModelId),
                    entityType = this.getEntityType(entity),
                    color = entity[entityType].material.color.getValue(),
                    colorToByte = [Cesium.Color.floatToByte(color.red), Cesium.Color.floatToByte(color.green), Cesium.Color.floatToByte(color.blue)];

                return convertColor(colorToByte, "hex");
            },
            set (value) {
                this.setNewFillColor(value);
                this.editLayout("fillColor");
            }
        },
        editedStrokeColor: {
            get () {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                    entity = entities?.getById(this.currentModelId),
                    outlineColor = entity.polygon ? entity?.polygon?.outlineColor.getValue() : entity?.originalColor.getValue(),
                    colorToByte = [Cesium.Color.floatToByte(outlineColor.red), Cesium.Color.floatToByte(outlineColor.green), Cesium.Color.floatToByte(outlineColor.blue)];

                return convertColor(colorToByte, "hex");
            },
            set (value) {
                this.setNewStrokeColor(value);
                this.editLayout("strokeColor");
            }
        },
        drawRotationString: {
            get () {
                return this.drawRotation.toString();
            },
            set (value) {
                let adjustedValue = Number(value) ? parseInt(value, 10) : 0;

                if (adjustedValue < -180) {
                    adjustedValue = -180;
                }
                else if (adjustedValue > 180) {
                    adjustedValue = 180;
                }

                this.setDrawRotation(adjustedValue);
                this.rotateDrawnEntity(adjustedValue);
            }
        },
        selectedModelName () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities?.getById(this.currentModelId),
                drawName = this.drawName !== "" ? this.drawName : entity?.name;

            return drawName;
        }
    },
    watch: {
        currentModelId () {
            this.updateDimensions();

            if (!this.isApplyingState || this.isDragging || !this.importedEntities.length) {
                return;
            }
            this.$nextTick(() => {
                this.rotationString = this.rotation;
                this.scaleString = String(this.scale);
            });
        },
        widthString (newVal) {
            const width = newVal.length !== 0 ? newVal : 0;

            this.setRectWidth(parseFloat(width));
            this.updateRectangleDimensions({width: this.rectWidth, depth: this.rectDepth});

        },
        depthString (newVal) {
            const depth = newVal.length !== 0 ? newVal : 0;

            this.setRectDepth(parseFloat(depth));
            this.updateRectangleDimensions({width: this.rectWidth, depth: this.rectDepth});

        },
        extrudedHeightString (newVal) {
            const extruded = newVal.length !== 0 ? newVal : 0;

            let adjustedValue = parseFloat(extruded);

            if (adjustedValue < 0.01) {
                adjustedValue = 0.01;
            }
            this.setExtrudedHeight(adjustedValue);
            this.updateExtrudedHeight();
        },
        isDragging () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);


            if (entity?.polygon?.rectangle) {
                const positions = entity.polygon.hierarchy.getValue().positions;

                this.widthString = Cesium.Cartesian3.distance(positions[1], positions[2]).toFixed(2).toString();
                this.depthString = Cesium.Cartesian3.distance(positions[1], positions[0]).toFixed(2).toString();
            }
        },
        coordinateEasting (newVal) {
            this.eastingString = this.prettyCoord(newVal);
        },
        coordinateNorthing (newVal) {
            this.northingString = this.prettyCoord(newVal);
        }
    },
    mounted () {
        this.updateDimensions();

        if (this.isApplyingState && !this.isDragging && this.importedEntities.length) {
            this.$nextTick(() => {
                this.rotationString = this.rotation;
                this.scaleString = String(this.scale);
            });
        }
    },
    methods: {
        ...mapActions("Modules/Modeler3D", [
            "copyEntity",
            "editLayout",
            "newProjectionSelected",
            "rotateDrawnEntity",
            "updateEntityPosition",
            "updateRectangleDimensions"
        ]),
        ...mapMutations("Modules/Modeler3D", [
            "setAdaptToHeight",
            "setCoordinateEasting",
            "setCoordinateNorthing",
            "setDrawRotation",
            "setExtrudedHeight",
            "setHeight",
            "setImportedEntities",
            "setLineWidth",
            "setModelName",
            "setNewFillColor",
            "setNewStrokeColor",
            "setRectDepth",
            "setRectWidth",
            "setRotation",
            "setScale"
        ]),
        convertColor,

        /**
         * Called if selection of projection changed. Sets the current projection to state and updates the UI.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            if (event.target.value) {
                this.newProjectionSelected(event.target.value);
            }
        },
        /**
         * Update dimension values for input fields.
         * @returns {void}
         */
        updateDimensions () {
            this.eastingString = this.prettyCoord(this.coordinateEasting);
            this.northingString = this.prettyCoord(this.coordinateNorthing);

            if (this.showDimensions) {
                this.widthString = this.rectWidth.toFixed(2);
                this.depthString = this.rectDepth.toFixed(2);
            }
            if (this.showExtrudedHeight) {
                this.extrudedHeightString = this.extrudedHeight.toFixed(2);
            }
        },
        /**
         * Handle the changes of easting and northing coordinates.
         * @param {String} coord the new coordinate.
         * @param {String} type the type of the coordinate. Can be either east or north.
         * @returns {void}
         */
        updateCoords (coord, type) {
            const input = coord.length !== 0 ? coord : 0;

            if (type === "east") {
                this.setCoordinateEasting(this.formatCoord(input));
                this.updateEntityPosition();
            }
            else if (type === "north") {
                this.setCoordinateNorthing(this.formatCoord(input));
                this.updateEntityPosition();
            }
        },
        /**
         * Handles the change event of the "Adapt to Height" checkbox.
         * Updates the adaptToHeight state and triggers the entity position update if the checkbox is checked.
         * @param {Boolean} value - The new value of the checkbox.
         * @returns {void}
         */
        checkedAdapt (value) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (entity) {
                entity.clampToGround = value;
                this.setAdaptToHeight(value);
                this.updateEntityPosition();
            }
        },
        /**
         * Updates the extrudedHeight of the polygon.
         * @returns {void}
         */
        updateExtrudedHeight () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (entity && entity.polygon instanceof Cesium.PolygonGraphics) {
                entity.polygon.extrudedHeight = this.extrudedHeight + entity.polygon.height;
                entities.values.filter(ent => ent.cylinder).forEach(cyl => {
                    cyl.cylinder.length = this.extrudedHeight + 5;
                });
            }
        },
        /**
         * Rotates the current model based on the value of the rotationAngle property.
         * Updates the heading of the model and sets its orientation using the calculated quaternion.
         * @returns {void}
         */
        rotate () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                modelOrigin = this.wasDrawn ? this.drawnModels : this.importedModels,
                modelFromState = modelOrigin.find(ent => ent.id === entity.id),
                heading = Cesium.Math.toRadians(this.rotation),
                position = entity.wasDrawn ? entity.polygon.hierarchy.getValue().positions[0] : entity.position.getValue(),
                orientationMatrix = Cesium.Transforms.headingPitchRollQuaternion(
                    position,
                    new Cesium.HeadingPitchRoll(heading, 0, 0)
                );

            if (modelFromState && entity) {
                modelFromState.heading = this.rotation;

                if (entity.wasDrawn) {
                    const positions = entity.polygon.hierarchy.getValue().positions,
                        center = this.getCenterFromGeometry(entity),
                        rotatedPositions = positions.map(pos => {
                            const relativePosition = Cesium.Cartesian3.subtract(pos, center),
                                rotatedRelativePosition = Cesium.Matrix3.multiplyByVector(orientationMatrix, relativePosition);

                            return Cesium.Cartesian3.add(rotatedRelativePosition, center, new Cesium.Cartesian3());
                        });

                    entity.polygon.hierarchy = new Cesium.PolygonHierarchy(rotatedPositions);
                }
                else {
                    entity.orientation = orientationMatrix;
                }
            }
        },
        /**
         * Copies the specified entity with the given id. The copied entity will be placed next to the original.
         * @returns {void}
         */
        copySelectedEntity () {
            this.copyEntity({id: this.currentModelId, nextId: uniqueId()});
        },
        jumpToSection (id) {
            const element = document.getElementById(`accordion-container-${id}`);

            if (element) {
                element.scrollIntoView({behavior: "smooth"});
            }
        },
        /**
         * Resets the value of rotation and scale from imported models.
         * @param {Object[]} importedEntities the imported entities.
         * @param {Number} adjustedValue the adjusted value.
         * @param {Number} currentModelId the current model id.
         * @param {String} type the type of adjusted value.
         * @returns {void}
         */
        resetImportedModels (importedEntities, adjustedValue, currentModelId, type) {
            if (!importedEntities.length || typeof adjustedValue !== "number" || typeof currentModelId !== "number" || typeof type !== "string") {
                return;
            }

            const clonedImportedEntities = importedEntities;

            clonedImportedEntities.forEach(entity => {
                if (entity?.entityId === currentModelId) {
                    entity[type] = adjustedValue;
                }
            });

            this.setImportedEntities(clonedImportedEntities);
        }
    }
};
</script>

<template lang="html">
    <div id="modeler3D-entity-view">
        <p
            v-if="currentProjection.id === 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
            id="projection-warning"
            class="cta red"
            v-html="$t('modules.modeler3D.entity.captions.projectionInfo')"
        />
        <hr
            v-if="wasDrawn"
            class="m-0"
        >
        <AccordionItem
            v-if="wasDrawn"
            id="options-section"
            class="p-0"
            :title="$t('modules.modeler3D.draw.captions.options')"
            icon="bi bi-tools"
            :is-open="true"
        >
            <div class="d-flex mb-2 align-items-center">
                <IconButton
                    id="copy-entity"
                    :interaction="() => copySelectedEntity()"
                    :aria="$t('common:modules.modeler3D.entity.captions.copyTitle', {name: selectedModelName})"
                    :class-array="['btn-primary', 'me-3']"
                    icon="bi bi-stickies"
                />
                <IconButton
                    id="measure-entity"
                    :interaction="() => toggleDimensions(currentModelId)"
                    :aria="$t('common:modules.modeler3D.entity.captions.dimensionsModel', {name: selectedModelName})"
                    :class-array="['btn-primary', 'me-3']"
                    icon="bi bi-rulers"
                />
                <IconButton
                    id="rotate-entity"
                    :interaction="() => jumpToSection('transformation-section')"
                    :aria="$t('common:modules.modeler3D.entity.captions.rotation')"
                    :class-array="['btn-primary', 'me-3']"
                    icon="bi bi-arrow-repeat"
                />
            </div>
        </AccordionItem>
        <hr
            v-if="showPositioning"
            class="m-0"
        >
        <AccordionItem
            v-if="showPositioning"
            id="coordinates-section"
            class="p-0"
            :title="$t('modules.modeler3D.draw.captions.coordinates')"
            icon="bi bi-pin-map"
            :is-open="true"
        >
            <div class="container p-0">
                <div class="row">
                    <div
                        id="projection"
                        class="col col-md form-group form-group-sm"
                    >
                        <label
                            class="col col-md col-form-label"
                            for="tool-edit-projection"
                        >
                            {{ $t("modules.modeler3D.entity.projections.projection") }}
                        </label>
                        <div class="col col-md">
                            <select
                                class="form-select form-select-sm"
                                aria-label="currentProjection"
                                @change="selectionChanged($event)"
                            >
                                <option
                                    v-for="(projection, i) in projections"
                                    :key="i"
                                    :value="projection.id"
                                    :SELECTED="projection.id === currentProjection.id ? true : null"
                                >
                                    {{ projection.title ? projection.title : projection.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div
                        v-if="showPositioning"
                        id="position"
                    >
                        <EntityAttribute
                            id="easting"
                            :value="eastingString"
                            title="easting"
                            :label="$t(getLabel('eastingLabel'))"
                            :width-classes="['col', 'col-md']"
                            :buttons="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                            @input="val => eastingString = val"
                            @change="eastingString = eastingString.length !== 0 ? parseFloat(eastingString.replace(',', '.')).toFixed(2) : '0.00', updateCoords(eastingString, 'east')"
                            @increment="eastingString = prettyCoord(coordinateEasting + coordAdjusted({shift: false, coordType: 'easting'})), updateCoords(eastingString, 'east')"
                            @increment-shift="eastingString = prettyCoord(coordinateEasting + coordAdjusted({shift: true, coordType: 'easting'})), updateCoords(eastingString, 'east')"
                            @decrement="eastingString = prettyCoord(coordinateEasting - coordAdjusted({shift: false, coordType: 'easting'})), updateCoords(eastingString, 'east')"
                            @decrement-shift="eastingString = prettyCoord(coordinateEasting - coordAdjusted({shift: true, coordType: 'easting'})), updateCoords(eastingString, 'east')"
                        />
                        <EntityAttribute
                            id="northing"
                            :value="northingString"
                            title="northing"
                            :label="$t(getLabel('northingLabel'))"
                            :width-classes="['col', 'col-md']"
                            :buttons="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                            @input="val => northingString = val"
                            @change="northingString = northingString.length !== 0 ? parseFloat(northingString.replace(',', '.')).toFixed(2) : '0.00', updateCoords(northingString, 'north')"
                            @increment="northingString = prettyCoord(coordinateNorthing + coordAdjusted({shift: false, coordType: 'northing'})), updateCoords(northingString, 'north')"
                            @increment-shift="northingString = prettyCoord(coordinateNorthing + coordAdjusted({shift: true, coordType: 'northing'})), updateCoords(northingString, 'north')"
                            @decrement="northingString = prettyCoord(coordinateNorthing - coordAdjusted({shift: false, coordType: 'northing'})), updateCoords(northingString, 'north')"
                            @decrement-shift="northingString = prettyCoord(coordinateNorthing - coordAdjusted({shift: true, coordType: 'northing'})), updateCoords(northingString, 'north')"
                        />
                    </div>
                </div>
            </div>
        </AccordionItem>
        <hr class="m-0">
        <AccordionItem
            v-if="showPositioning || showPositioning && wasDrawn || showExtrudedHeight"
            id="dimensions-section"
            class="p-0"
            :title="$t('modules.modeler3D.draw.captions.dimensions')"
            icon="bi bi-rulers"
            :is-open="true"
        >
            <div class="container pt-0">
                <div class="row">
                    <EntityAttribute
                        v-if="showDimensions"
                        id="width"
                        :value="widthString"
                        title="width"
                        :label="$t('modules.modeler3D.entity.projections.width') + ' [m]'"
                        :width-classes="['col', 'col-md']"
                        :buttons="true"
                        @input="val => widthString = val"
                        @change="widthString = widthString.length !== 0 ? parseFloat(widthString.replace(',', '.')).toFixed(2) : '0.00'"
                        @increment="widthString = (parseFloat(widthString) + 0.1).toFixed(2)"
                        @increment-shift="widthString = (parseFloat(widthString) + 1).toFixed(2)"
                        @decrement="widthString = (parseFloat(widthString) - 0.1).toFixed(2)"
                        @decrement-shift="widthString = (parseFloat(widthString) - 1).toFixed(2)"
                    />
                    <EntityAttribute
                        v-if="showDimensions"
                        id="depth"
                        :value="depthString"
                        title="depth"
                        :label="$t('modules.modeler3D.entity.projections.depth') + ' [m]'"
                        :width-classes="['col', 'col-md']"
                        :buttons="true"
                        @input="val => depthString = val"
                        @change="depthString = depthString.length !== 0 ? parseFloat(depthString.replace(',', '.')).toFixed(2) : '0.00'"
                        @increment="depthString = (parseFloat(depthString) + 0.1).toFixed(2)"
                        @increment-shift="depthString = (parseFloat(depthString) + 1).toFixed(2)"
                        @decrement="depthString = (parseFloat(depthString) - 0.1).toFixed(2)"
                        @decrement-shift="depthString = (parseFloat(depthString) - 1).toFixed(2)"
                    />
                    <EntityAttribute
                        v-if="showPositioning"
                        id="height"
                        :value="heightString"
                        title="height"
                        :label="$t('modules.modeler3D.entity.projections.height') + ' [m]'"
                        :width-classes="['col', 'col-md']"
                        :keep-height="true"
                        :buttons="!adaptToHeight"
                        :disabled="adaptToHeight"
                        @input="val => heightString = val"
                        @increment="heightString = prettyCoord(height + coordAdjusted({shift: false, coordType: 'height'}))"
                        @increment-shift="heightString = prettyCoord(height + coordAdjusted({shift: true, coordType: 'height'}))"
                        @decrement="heightString = prettyCoord(height - coordAdjusted({shift: false, coordType: 'height'}))"
                        @decrement-shift="heightString = prettyCoord(height - coordAdjusted({shift: true, coordType: 'height'}))"
                    />
                    <div
                        v-if="showPositioning && wasDrawn"
                        id="area"
                        class="pt-4"
                    >
                        <label
                            class="col col-md"
                            for="displayArea"
                        >
                            {{ $t("modules.modeler3D.entity.projections.area") }}
                        </label>
                        <div
                            class="col col-md displayArea mt-1"
                        >
                            {{ area + " m²" }}
                        </div>
                    </div>
                    <div
                        v-if="showPositioning"
                        id="adapt-check"
                        class="form-check pt-4 ms-3"
                    >
                        <SwitchInput
                            id="adaptHeightCheck"
                            class="check-height"
                            :label="$t('modules.modeler3D.entity.projections.adaptToHeight')"
                            :aria="$t('modules.modeler3D.entity.projections.adaptToHeight')"
                            :checked="adaptToHeight"
                            @change="checkedAdapt($event.target.checked)"
                        />
                    </div>
                    <div
                        v-if="showExtrudedHeight"
                        class="pt-4"
                    >
                        <EntityAttribute
                            :value="extrudedHeightString"
                            title="extruded-height"
                            :label="$t('modules.modeler3D.draw.captions.extrudedHeight') + ' [m]'"
                            :width-classes="['col', 'col-md']"
                            @input="val => extrudedHeightString = val"
                            @change="extrudedHeightString = extrudedHeightString.length !== 0 ? parseFloat(extrudedHeightString.replace(',', '.')).toFixed(2) : '0.00'"
                            @increment="extrudedHeightString = (extrudedHeight + 0.1).toFixed(2)"
                            @increment-shift="extrudedHeightString = (extrudedHeight + 1).toFixed(2)"
                            @decrement="extrudedHeightString = (extrudedHeight - 0.1).toFixed(2)"
                            @decrement-shift="extrudedHeightString = (extrudedHeight - 1).toFixed(2)"
                        />
                    </div>
                </div>
            </div>
        </AccordionItem>
        <hr
            class="m-0"
        >
        <AccordionItem
            id="transformation-section"
            class="p-0"
            :title="$t('modules.modeler3D.draw.captions.transformation')"
            icon="bi bi-arrow-repeat"
            :is-open="true"
        >
            <div
                id="container"
            >
                <div class="row">
                    <div
                        v-if="wasDrawn"
                        class="col col-md-12"
                    >
                        <EntityAttributeSlider
                            id="rotation"
                            :value="drawRotationString"
                            title="rotation"
                            :value-label="$t('modules.modeler3D.entity.captions.rotation') + ' [°]'"
                            :step-label="$t('modules.modeler3D.entity.captions.rotationSwitch')"
                            :min="-180"
                            :max="180"
                            unit="°"
                            @input="val => drawRotationString = val"
                            @increment="val => drawRotationString = drawRotation + val"
                            @decrement="val => drawRotationString = drawRotation - val"
                        />
                    </div>
                    <div
                        v-else
                        class="col col-md-12"
                    >
                        <EntityAttributeSlider
                            id="rotation"
                            :value="rotationString"
                            title="rotation"
                            :value-label="$t('modules.modeler3D.entity.captions.rotation') + ' [°]'"
                            :step-label="$t('modules.modeler3D.entity.captions.rotationSwitch')"
                            :min="-180"
                            :max="180"
                            unit="°"
                            @input="val => rotationString = val"
                            @increment="val => rotationString = rotation + val"
                            @decrement="val => rotationString = rotation - val"
                        />
                    </div>
                    <div
                        v-if="!wasDrawn"
                        class="pt-4"
                    >
                        <EntityAttribute
                            id="scale"
                            :value="scaleString"
                            title="scale"
                            :label="$t('modules.modeler3D.entity.captions.scale')"
                            :width-classes="['col-md-8', 'col-md-4']"
                            @input="val => scaleString = val"
                            @increment="scaleString = (scale + 0.1).toFixed(1)"
                            @increment-shift="scaleString = (scale + 1).toFixed(1)"
                            @decrement="scaleString = (scale - 0.1).toFixed(1)"
                            @decrement-shift="scaleString = (scale - 1).toFixed(1)"
                        />
                    </div>
                </div>
            </div>
        </AccordionItem>
        <hr
            v-if="showWidth || showFillColor || wasDrawn"
            class="m-0"
        >
        <AccordionItem
            v-if="showWidth || showFillColor || wasDrawn"
            id="design-section"
            class="p-0"
            :title="$t('modules.modeler3D.draw.captions.design')"
            icon="bi bi-paint-bucket"
            :is-open="true"
        >
            <div v-if="showWidth">
                <EntityAttribute
                    :value="lineWidthString"
                    title="line-width"
                    :label="$t('modules.modeler3D.draw.captions.strokeWidth') + ' [Pixel]'"
                    :width-classes="['col-md-8', 'col-md-4']"
                    @input="val => lineWidthString = val"
                    @increment="lineWidthString = (lineWidth + 1).toFixed(2)"
                    @decrement="lineWidthString = (lineWidth - 1).toFixed(2)"
                />
            </div>
            <div
                v-if="showFillColor"
            >
                <EntityAttribute
                    :value="editedFillColor"
                    title="fill-color"
                    :label="$t('modules.modeler3D.draw.captions.fillColor')"
                    :width-classes="['col-md-8', 'col-md-3']"
                    :buttons="false"
                    type="color"
                    @input="val => editedFillColor = val"
                />
            </div>
            <div
                v-if="wasDrawn"
            >
                <EntityAttribute
                    :value="editedStrokeColor"
                    title="stroke-color"
                    :label="$t('modules.modeler3D.draw.captions.strokeColor')"
                    :width-classes="['col-md-8', 'col-md-3']"
                    :buttons="false"
                    type="color"
                    @input="val => editedStrokeColor = val"
                />
            </div>
        </AccordionItem>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";

    .cta {
        margin-bottom:12px;
    }

    .red {
        color: red;
    }

    .row {
        align-items: center;
    }

</style>
