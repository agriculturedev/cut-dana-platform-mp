<script>
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import EntityList from "./ui/EntityList.vue";
import ModelerDraw from "./Modeler3DDraw.vue";
import ModelerImport from "./Modeler3DImport.vue";
import NavTab from "../../../shared/modules/tabs/components/NavTab.vue";
import SwitchInput from "../../../shared/modules/checkboxes/components/SwitchInput.vue";

import {mapActions, mapGetters, mapMutations} from "vuex";

import crs from "@masterportal/masterportalapi/src/crs";
import getGfiFeatures from "../../../shared/js/utils/getGfiFeaturesByTileFeature";
import {adaptCylinderUnclamped} from "../js/draw";
import layerCollection from "../../../core/layers/js/layerCollection";
import initProjections from "../../../shared/js/utils/initProjections";

/**
 * The component that handels the 3D modeler.
 *  @module modules/modeler3D/components/Modeler3D
 * @vue-data {Object} currentCartesian - The current position in cartesian coordinates.
 * @vue-data {Object} currentPosition - The current position in cartographic coordinates.
 * @vue-data {String} lastAction - The last action performed (undo/redo).
 * @vue-data {String} originalCursorStyle - Saves the original style of the cursor.
 * @vue-data {Object} originalPosition - The original position of the entity before moving. Can include the entity ID, the attachedEntityId and the position.
 * @vue-data {Object} undonePosition - The position of the entity after undoing a movement. Can include the entity ID, the attachedEntityId and the position.
 */

export default {
    name: "Modeler3D",
    components: {
        AccordionItem,
        EntityList,
        ModelerDraw,
        ModelerImport,
        NavTab,
        SwitchInput
    },
    data () {
        return {
            currentCartesian: null,
            currentPosition: null,
            lastAction: null,
            originalCursorStyle: null,
            originalPosition: null,
            undonePosition: null
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Modules/Modeler3D", [
            "activeShapePoints",
            "currentModelId",
            "currentModelPosition",
            "currentProjection",
            "currentView",
            "cylinderId",
            "drawRotation",
            "extrudedHeight",
            "getCenterFromGeometry",
            "gmlIdPath",
            "height",
            "hiddenObjects",
            "hiddenObjectsWithLayerId",
            "hideObjects",
            "highlightStyle",
            "importedEntities",
            "isDragging",
            "isDrawing",
            "isLoading",
            "movingEntity",
            "povActive",
            "projections",
            "updateAllLayers",
            "useAnchorMove"
        ]),
        ...mapGetters("Maps", ["clickCoordinate", "mouseCoordinate"])
    },
    watch: {
        /**
         * Updates the current model ID and performs corresponding actions.
         * @param {string} newId - The ID of the new model.
         * @param {string} oldId - The ID of the old model.
         * @returns {void}
         */
        currentModelId (newId, oldId) {
            if (!this.isDrawing) {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                    newEntity = entities.getById(newId),
                    oldEntity = entities.getById(oldId);

                if (oldEntity) {
                    this.resetOldEntity(oldEntity);
                }
                if (newEntity) {
                    this.setupNewEntity(newEntity);
                }
            }
        },
        /**
         * Moving the entity if there is no position with the entity.
         * @param {Boolean} val - value to decide if to move the entity.
         * @returns {void}
         */
        movingEntity (val) {
            if (val) {
                this.moveEntity();
                this.setMovingEntity(!val);
            }
        }
    },
    mounted () {
        const scene = mapCollection.getMap("3D").getCesiumScene();

        this.initProjectionsInModeler3D(crs, this.projections, this.namedProjections, this.currentProjection);
        this.eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        this.eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        document.addEventListener("keydown", this.catchUndoRedo);
    },
    beforeUnmount () {
        this.setCurrentModelId(null);
        this.eventHandler.destroy();
        document.removeEventListener("keydown", this.catchUndoRedo);
    },
    methods: {
        ...mapActions("Modules/Modeler3D", [
            "createCylinder",
            "generateCylinders",
            "movePolygon",
            "movePolyline",
            "moveAdjacentRectangleCorners",
            "removeCylinders",
            "updatePositionUI",
            "updateUI"
        ]),
        ...mapMutations("Modules/Modeler3D", [
            "setActiveShapePoints",
            "setCurrentModelId",
            "setCurrentModelPosition",
            "setCurrentProjection",
            "setCurrentView",
            "setCylinderId",
            "setExtrudedHeight",
            "setHideObjects",
            "setIsDragging",
            "setLineWidth",
            "setMovingEntity",
            "setPovActive",
            "setProjections",
            "setUseAnchorMove"
        ]),

        /**
         * Resets the old entity by calling the corresponding reset function based on the entity type.
         * @param {Cesium.Entity} oldEntity - The entity to reset.
         * @returns {void}
         */
        resetOldEntity (oldEntity) {
            const scene = mapCollection.getMap("3D").getCesiumScene();

            if (oldEntity.wasDrawn) {
                this.resetDrawnEntity(oldEntity);
            }
            else {
                this.resetModelEntity(oldEntity);
                this.setCurrentView("modeler-import");
            }
            scene.requestRender();
            this.setCurrentModelPosition(null);
        },
        /**
         * Resets the drawn entity's properties to their original values and resets state.
         * @param {Cesium.Entity} entity - The entity to reset.
         * @returns {void}
         */
        resetDrawnEntity (entity) {
            if (entity.polygon) {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                    outlines = entities.values.filter(ent => ent.outline && ent.polyline);

                outlines.forEach(outline => entities.remove(outline));
                entity.polygon.hierarchy = new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(this.activeShapePoints));
                entity.polygon.outline = true;
                this.setExtrudedHeight(20);
            }
            else if (entity.polyline) {
                entity.polyline.positions = new Cesium.ConstantProperty(this.activeShapePoints);
                entity.polyline.material.color = entity.originalColor;
                entity.polyline.width = entity.originalWidth;
            }
            entity.rotation = (entity.rotation || 0) + this.drawRotation;
            this.removeCylinders();
            this.setActiveShapePoints([]);
            this.setCylinderId(null);
        },
        /**
         * Resets the imported entity's properties to their original values and resets state.
         * @param {Cesium.Entity} entity - The entity to reset.
         * @returns {void}
         */
        resetModelEntity (entity) {
            entity.model.silhouetteColor = null;
            entity.model.silhouetteSize = 0;
            entity.model.colorBlendAmount = 0;
        },
        /**
         * Sets the entity's properties to callback values, generates cylinders and applies highlighting.
         * @param {Cesium.Entity} newEntity - The entity to apply the changes to.
         * @returns {void}
         */
        setupNewEntity (newEntity) {
            if (newEntity.wasDrawn) {
                this.setCurrentView("modeler-draw");
                if (newEntity.polygon) {
                    this.setActiveShapePoints(newEntity.polygon.hierarchy.getValue().positions);
                    newEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.activeShapePoints), false);
                }
                else if (newEntity.polyline) {
                    this.setActiveShapePoints(newEntity.polyline.positions.getValue());
                    newEntity.polyline.positions = new Cesium.CallbackProperty(() => this.activeShapePoints);
                }
                this.generateCylinders(newEntity);
            }
            if (newEntity.model) {
                this.setCurrentView("modeler-import");
            }
            this.highlightEntity(newEntity);
            this.setCurrentModelPosition(newEntity?.position?.getValue() || this.getCenterFromGeometry(newEntity));
            this.updateUI();
        },
        /**
         * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
         * @returns {void}
         */
        initProjectionsInModeler3D () {
            const projectionsObj = initProjections(crs, this.projections, this.namedProjections, this.currentProjection);

            if (projectionsObj?.currentProjection) {
                this.setCurrentProjection(projectionsObj.currentProjection);
            }

            if (projectionsObj?.projections) {
                this.setProjections(projectionsObj.projections);
            }
        },
        /**
         * Checks the map for pickable Cesium objects and changes the cursor on hover.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        cursorCheck (event) {
            if (this.isDrawing) {
                return;
            }
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.drillPick(event.endPosition).filter(pickedObj => !pickedObj?.id?.label && !pickedObj?.id?.outline),
                entity = Cesium.defaultValue(picked[0]?.id, picked[0]?.primitive?.id);

            if (Cesium.defined(entity) && entity instanceof Cesium.Entity) {
                if (this.currentModelId && entity.id === this.currentModelId || entity.cylinder) {
                    document.getElementById("map").style.cursor = "grab";
                }
                else {
                    document.getElementById("map").style.cursor = "pointer";
                }
            }
            else if (this.hideObjects && Cesium.defined(picked[0]) && picked[0] instanceof Cesium.Cesium3DTileFeature) {
                document.getElementById("map").style.cursor = "pointer";
            }
            else {
                document.getElementById("map").style.cursor = "auto";
            }
        },
        /**
         * Initiates the process of moving an entity.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        moveEntity (event) {
            if (this.isDrawing || this.povActive) {
                return;
            }

            let entity;

            if (event) {
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    picked = scene.drillPick(event.position).filter(pickedObj => !pickedObj?.id?.label && !pickedObj?.id?.outline);

                entity = Cesium.defaultValue(picked[0]?.id, picked[0]?.primitive?.id);
            }

            if (entity instanceof Cesium.Entity || !event) {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                    scene = mapCollection.getMap("3D").getCesiumScene();

                this.setIsDragging(true);
                scene.screenSpaceCameraController.enableInputs = false;
                this.setHideObjects(false);
                this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

                this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                document.getElementById("map").style.cursor = "grabbing";

                if (entity?.cylinder) {
                    const geometry = entities.getById(this.currentModelId),
                        position = geometry.polygon ? geometry.polygon.hierarchy.getValue().positions[entity.positionIndex] : geometry.polyline.positions.getValue()[entity.positionIndex];

                    this.currentPosition = position;
                    this.originalPosition = {
                        entityId: entity.positionIndex,
                        attachedEntityId: entity.attachedEntityId,
                        position
                    };

                    this.setCylinderId(entity.id);

                    this.eventHandler.setInputAction(this.moveCylinder, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                else if (entity?.wasDrawn) {
                    this.originalPosition = {entityId: entity.id, position: this.getCenterFromGeometry(entity)};
                    this.eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    if (this.currentModelId && this.currentModelId === entity.id) {
                        this.eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    }
                }
                else {
                    this.originalPosition = entity ? {entityId: entity.id, position: entity.position.getValue()} : null;
                    this.eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    if (this.importedEntities.length) {
                        const importedEntity = this.importedEntities.find(importEntity => importEntity.entityId === entity?.id);

                        if (importedEntity) {
                            importedEntity.position = entity.position.getValue();
                            this.eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        }
                    }
                }
                this.eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);
            }
        },
        /**
         * Selects an object based on the provided event.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        selectObject (event) {
            if (this.isDrawing || this.povActive) {
                return;
            }
            let entity = null;
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.drillPick(event.position).filter(pickedObj => !pickedObj?.id?.label && !pickedObj?.id?.outline);

            if (!Cesium.defined(picked[0])) {
                return;
            }
            entity = Cesium.defaultValue(picked[0]?.id, picked[0]?.primitive?.id);

            if (entity instanceof Cesium.Entity && !entity.cylinder) {
                this.setCurrentModelId(entity.id);
                this.setCylinderId(null);
            }

            else if (this.hideObjects && picked[0] instanceof Cesium.Cesium3DTileFeature) {
                const features = getGfiFeatures.getGfiFeaturesByTileFeature(picked[0]),
                    gmlId = features[0]?.getProperties()[this.gmlIdPath],
                    tileSetLayers = this.updateAllLayers ?
                        layerCollection.getLayers().filter(layer => layer.get("typ") === "TileSet3D") :
                        layerCollection.getLayers().filter(layer => layer.get("typ") === "TileSet3D" && layer.get("id") === picked[0].tileset.layerReferenceId);

                tileSetLayers.forEach(layer => layer.addToHiddenObjects([gmlId], this.updateAllLayers));

                this.hiddenObjects.push({
                    name: gmlId
                });
                this.hiddenObjectsWithLayerId.push({
                    name: gmlId,
                    layerId: picked[0].tileset.layerReferenceId
                });
            }
        },
        /**
         * Handles the mouse move event and performs actions when dragging a cylinder.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        moveCylinder (event) {
            if (!this.isDragging || this.isDrawing) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                cylinder = entities.getById(this.cylinderId);

            if (Cesium.defined(cylinder) && Cesium.defined(entity)) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                if (entity.clampToGround) {
                    const ray = scene.camera.getPickRay(event.endPosition),
                        position = scene.globe.pick(ray, scene);

                    if (this.activeShapePoints[cylinder.positionIndex] !== position) {
                        this.activeShapePoints.splice(cylinder.positionIndex, 1, scene.globe.pick(ray, scene));
                        this.updatePositionUI();
                    }
                }
                else {
                    const transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                        cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]);

                    cartographic.height = scene.sampleHeight(cartographic, [cylinder, entity]);

                    if (this.activeShapePoints[cylinder.positionIndex] !== Cesium.Cartographic.toCartesian(cartographic)) {
                        this.activeShapePoints.splice(cylinder.positionIndex, 1, Cesium.Cartographic.toCartesian(cartographic));
                        this.updatePositionUI();
                    }
                }
                if (Cesium.defined(this.activeShapePoints[cylinder.positionIndex])) {
                    if (entity.polygon?.rectangle) {
                        this.moveAdjacentRectangleCorners({movedCornerIndex: cylinder.positionIndex});
                    }
                }
            }
        },
        /**
         * Handles the mouse move event and performs actions when dragging an object.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        onMouseMove (event) {
            if (!this.isDragging || this.povActive) {
                return;
            }

            const scene = mapCollection.getMap("3D").getCesiumScene(),
                posRay = scene.camera.getPickRay(event.endPosition),
                position = scene.globe.pick(posRay, scene),
                anchorRay = scene.camera.getPickRay(event.startPosition),
                anchor = this.useAnchorMove ? scene.globe.pick(anchorRay, scene) : null,
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (!Cesium.defined(position) || !Cesium.defined(entity)) {
                return;
            }

            if (entity.polygon) {
                this.movePolygon({entityId: this.currentModelId, position, anchor});
            }
            else if (entity.polyline) {
                this.movePolyline({entityId: this.currentModelId, position, anchor});
            }
            else {
                const diff = Cesium.Cartesian3.subtract(position, anchor || entity?.position?.getValue() || position, new Cesium.Cartesian3());

                entity.position = Cesium.Cartesian3.add(entity.position?.getValue() || position, diff, new Cesium.Cartesian3());
            }
            this.updatePositionUI();
        },
        /**
         * Handles the mouse up event and performs actions when the dragging of an object is finished.
         * @returns {void}
         */
        onMouseUp () {
            if (!this.isDragging) {
                return;
            }
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                scene = mapCollection.getMap("3D").getCesiumScene(),
                entity = entities.getById(this.currentModelId);

            this.eventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
            this.eventHandler?.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.setIsDragging(false);

            if (this.importedEntities.length) {
                const importedEntity = this.importedEntities.find(importEntity => importEntity.entityId === this.currentModelId);

                if (importedEntity) {
                    importedEntity.position = entity.position.getValue();
                }
            }

            if (this.cylinderId || this.wasDrawn) {
                this.setCylinderId(null);
            }

            if (this.originalHideOption) {
                this.setHideObjects(this.originalHideOption);
                this.eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
            this.setUseAnchorMove(true);
            document.getElementById("map").style.cursor = "grab";
            setTimeout(() => {
                scene.screenSpaceCameraController.enableInputs = true;
            });
        },
        /**
         * Called on every keypress to catch CTRL + Z/Y to undo or redo the last movement action.
         * @param {Event} event keypress event
         * @returns {void}
         */
        catchUndoRedo (event) {
            if (this.isDrawing) {
                return;
            }
            if (event.ctrlKey && event.key === "z" && this.originalPosition) {
                this.lastAction = "undo";
                this.applyEntityMovement(this.originalPosition);
                this.originalPosition = null;
                event.preventDefault();
            }
            else if (event.ctrlKey && event.key === "y" && this.undonePosition) {
                this.lastAction = "redo";
                this.applyEntityMovement(this.undonePosition);
                this.undonePosition = null;
                event.preventDefault();
            }
        },
        /**
         * Applies the movement of an entity based on the provided object to redo or undo a movement command.
         * @param {Object} entityObject - The object containing the entity ID and the new position.
         * @returns {void}
         */
        async applyEntityMovement (entityObject) {
            if (!entityObject) {
                return;
            }

            this.setCurrentModelId(entityObject.attachedEntityId || entityObject.entityId);
            await this.$nextTick();

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                movedEntity = entityObject.attachedEntityId ? entities.values.find(val => val.positionIndex === entityObject.entityId) : entities.getById(entityObject.entityId);

            if (!movedEntity) {
                return;
            }

            if (this.lastAction === "undo") {
                this.undonePosition = {entityId: movedEntity.id, position: movedEntity.wasDrawn ? this.getCenterFromGeometry(movedEntity) : movedEntity.position.getValue()};
            }
            else if (this.lastAction === "redo") {
                this.originalPosition = {entityId: movedEntity.id, position: movedEntity.wasDrawn ? this.getCenterFromGeometry(movedEntity) : movedEntity.position.getValue()};
            }

            if (movedEntity.cylinder) {
                const attachedEntity = entities.getById(entityObject.attachedEntityId);

                this.undonePosition.attachedEntityId = entityObject.attachedEntityId;

                this.activeShapePoints.splice(movedEntity.positionIndex, 1, entityObject.position);
                if (attachedEntity.polygon?.rectangle) {
                    this.moveAdjacentRectangleCorners({movedCornerIndex: movedEntity.positionIndex});
                }
            }
            else if (movedEntity.wasDrawn) {
                if (movedEntity.polygon) {
                    this.movePolygon(entityObject);
                }
                else if (movedEntity.polyline) {
                    this.movePolyline(entityObject);
                }
            }
            else {
                movedEntity.position = entityObject.position;
            }

            if (this.isDragging) {
                this.onMouseUp();
            }
        },
        /**
         * Highlights the specified entity by applying the configured or default highlight style.
         * @param {Cesium.Entity} entity - The entity to highlight.
         * @returns {void}
         */
        highlightEntity (entity) {
            const silhouetteColor = this.highlightStyle.silhouetteColor,
                silhouetteSize = this.highlightStyle.silhouetteSize;

            if (entity.wasDrawn) {
                if (entity.polygon) {
                    entity.polygon.outline = false;
                    this.generateOutlines(entity);
                }
                else if (entity.polyline) {
                    entity.originalWidth = entity.polyline.width;
                    this.setLineWidth(entity.originalWidth);
                    entity.originalColor = entity.polyline.material.color;
                    entity.polyline.material.color = Cesium.Color.fromCssColorString(silhouetteColor);
                    entity.polyline.width += 2;
                }
            }
            else {
                entity.model.silhouetteColor = Cesium.Color.fromCssColorString(silhouetteColor);
                entity.model.silhouetteSize = parseFloat(silhouetteSize);
                entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
            }
        },
        /**
         * Generate outlines on top and bottom of a provided polygon entity.
         * @param {Cesium.Entity} entity - The entity to generate the outlines for.
         * @returns {void}
         */
        generateOutlines (entity) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                positions = entity.polygon.hierarchy.getValue().positions;

            entities.add({outline: true, polyline: {
                width: 4,
                material: Cesium.Color.fromAlpha(
                    Cesium.Color.fromCssColorString(this.highlightStyle.silhouetteColor),
                    parseFloat(1)
                ),
                positions: new Cesium.CallbackProperty(() => {
                    const extrudedPositions = positions.map((pos) => {
                        const cartographic = Cesium.Cartographic.fromCartesian(pos);

                        return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, this.height);
                    });

                    extrudedPositions.push(extrudedPositions[0]);
                    return extrudedPositions;
                }, false)
            }});
            entities.add({outline: true, polyline: {
                width: 4,
                material: Cesium.Color.fromAlpha(
                    Cesium.Color.fromCssColorString(this.highlightStyle.silhouetteColor),
                    parseFloat(1)
                ),
                positions: new Cesium.CallbackProperty(() => {
                    const extrudedPositions = positions.map((pos) => {
                        const cartographic = Cesium.Cartographic.fromCartesian(pos);

                        return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, this.extrudedHeight + this.height);
                    });

                    extrudedPositions.push(extrudedPositions[0]);
                    return extrudedPositions;
                }, false)
            }});
        },
        /**
         * Shows the specified object by making it visible in the scene.
         * @param {Object} object - The object to show.
         * @returns {void}
         */
        showObject (object) {
            const tileSetLayers = layerCollection.getLayers().filter(layer => layer.get("typ") === "TileSet3D"),
                index = this.hiddenObjects.findIndex(obj => obj.name === object.name);

            tileSetLayers.forEach(tileSetLayer => {
                tileSetLayer.showObjects([object.name]);
            });
            this.hiddenObjects.splice(index, 1);
        },
        /**
         * Positions the camera in the point of view of a pedestrian at the clicked position.
         * @returns {void}
         */
        positionPovCamera () {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", this.clickCoordinate),
                currentPosition = scene.camera.positionCartographic,
                destination = new Cesium.Cartographic(
                    Cesium.Math.toRadians(transformedCoordinates[0]),
                    Cesium.Math.toRadians(transformedCoordinates[1])
                ),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                povCylinder = entities.getById(this.cylinderId);

            this.originalCursorStyle = document.getElementById("map").style.cursor;
            this.currentCartesian = Cesium.Cartographic.toCartesian(currentPosition);
            destination.height = scene.sampleHeight(destination, [povCylinder]) + 1.8;

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height),
                orientation: {
                    pitch: 0,
                    roll: 0,
                    heading: scene.camera.heading
                }
            });

            scene.screenSpaceCameraController.enableZoom = false;
            scene.screenSpaceCameraController.enableRotate = false;
            scene.screenSpaceCameraController.enableTilt = false;
            scene.screenSpaceCameraController.enableLook = true;
            scene.screenSpaceCameraController.lookEventTypes = Cesium.CameraEventType.LEFT_DRAG;
            this.preRenderListener = scene.preRender.addEventListener(() => {
                scene.camera.setView({
                    orientation: {
                        heading: scene.camera.heading,
                        pitch: Cesium.Math.clamp(
                            scene.camera.pitch,
                            -Cesium.Math.PI_OVER_TWO + Cesium.Math.EPSILON1,
                            Cesium.Math.PI_OVER_TWO - Cesium.Math.EPSILON1),
                        roll: 0
                    }
                });
            });

            document.addEventListener("keydown", this.escapePedView);
        },


        /**
         * Reset the camera perspective.
         * @param {KeyboardEvent} e - The event object for the keyboard event or undefined.
         * @returns {void}
         */
        escapePedView (e) {
            if (typeof e !== "undefined" && e.code !== "Escape") {
                return;
            }
            const scene = mapCollection.getMap("3D").getCesiumScene();

            if (this.currentCartesian) {
                scene.camera.flyTo({
                    destination: this.currentCartesian,
                    complete: () => {
                        scene.preRender.removeEventListener(this.preRenderListener);
                        scene.screenSpaceCameraController.enableLook = false;
                        scene.screenSpaceCameraController.enableTilt = true;
                        scene.screenSpaceCameraController.enableZoom = true;
                        scene.screenSpaceCameraController.enableRotate = true;

                        this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                        document.removeEventListener("keydown", this.escapePedView);
                        document.getElementById("map").style.cursor = this.originalCursorStyle;
                        this.togglePovInteraction();
                    }
                });
            }

            this.resetPov();
        },
        /**
         * Resets the perpective / point of view and all related interactions.
         * It resets the cursor style by removing the povCylinder.
         * @returns {void}
         */
        resetPov () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            this.setPovActive(false);
            entities.removeById(this.cylinderId);
            document.getElementById("map").style.cursor = this.originalCursorStyle;
            this.eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            this.eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        },
        /**
         * Toggles the active state of a switch and performs related actions.
         * If the provided ID is "povActiveSwitch" or the current state of `this.povActive` is true,
         * it removes an entity by ID, resets the cursor style, and toggles `this.povActive`.
         * Finally, it updates the cursor style and toggles the visibility of objects.
         *
         * @param {string} id - The ID of the switch.
         * @returns {void}
         */
        changeSwitches (id) {
            if (id === "povActiveSwitch") {
                if (this.povActive) {
                    this.resetPov();
                    this.escapePedView(undefined);
                }
                else {
                    this.setPovActive(true);
                    this.setHideObjects(false);
                    this.eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    this.setCurrentModelId(null);
                }
            }
            else if (id === "hideObjectsSwitch" || this.hideObjects) {
                this.originalHideOption = !this.hideObjects;
                this.setHideObjects(!this.hideObjects);
                if (this.povActive) {
                    this.escapePedView(undefined);
                }
            }

        },
        /**
         * Event handler for click events.
         * Updates the cursor style, removes the MOUSE_MOVE input action, and adds the selectObject function as the LEFT_CLICK input action.
         * @returns {void}
         */
        clickHandler () {
            document.getElementById("map").style.cursor = this.originalCursorStyle;
            this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.positionPovCamera();
        },
        /**
         * Event handler for move events.
         * Transforms the mouse coordinates, retrieves the povCylinder by ID,
         * updates the cursor style, samples the height at the transformed coordinates,
         * and updates the currentCartesian position if it has changed.
         * @returns {void}
         */
        moveHandler () {
            if (!this.mouseCoordinate) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]),
                povCylinder = entities.getById(this.cylinderId);
            let currentCartesian;

            if (cartographic) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                cartographic.height = scene.sampleHeight(cartographic, [povCylinder]);
                currentCartesian = Cesium.Cartographic.toCartesian(cartographic);

                document.getElementById("map").style.cursor = "copy";
            }

            if (!Cesium.Cartesian3.equals(this.currentCartesian, currentCartesian)) {
                this.currentCartesian = currentCartesian;
            }
        },
        /**
         * Displays or removes a povCylinder at the cursor position depending on start or end of POV interaction, and sets input actions based on the state of `this.povActive`.
         * If `this.povActive` is true, it retrieves the povCylinder by ID and performs the following actions:
         * - If the povCylinder doesn't exist, it creates a cylinder, sets its position, and assigns it to povCylinder.
         * - It sets the moveHandler function as the input action for MOUSE_MOVE events.
         * - It sets the clickHandler function as the input action for LEFT_CLICK events.
         * @returns {void}
         */
        togglePovInteraction () {
            if (!this.povActive) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;
            let povCylinder = entities.getById(this.cylinderId);

            if (!povCylinder) {
                const payload = {
                    posIndex: 0,
                    length: 10
                };

                this.createCylinder(payload);
                povCylinder = entities.getById(this.cylinderId);
                povCylinder.position = new Cesium.CallbackProperty(() => adaptCylinderUnclamped(povCylinder, this.currentCartesian), false);
            }
            this.eventHandler.setInputAction(this.moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.eventHandler.setInputAction(this.clickHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
};
</script>

<template lang="html">
    <div
        id="module-modeler3D"
    >
        <ul
            id="modeler-tabs"
            class="nav nav-tabs nav-justified mb-3"
            role="tablist"
        >
            <NavTab
                id="import-tab"
                :class="{'disabled': isDrawing}"
                :active="currentView === 'modeler-import'"
                :target="''"
                :label="'common:modules.modeler3D.nav.importTitle'"
                :interaction="() => {setCurrentView('modeler-import'); povActive ? escapePedView(undefined) : '';}"
            />
            <NavTab
                id="draw-tab"
                :class="{'disabled': isDrawing}"
                :active="currentView === 'modeler-draw'"
                :target="'#draw-pane'"
                :label="'common:modules.modeler3D.nav.drawTitle'"
                :interaction="() => {setCurrentView('modeler-draw'); povActive ? escapePedView(undefined) : ''}"
            />
            <NavTab
                id="options-tab"
                :class="{'disabled': isDrawing}"
                :active="currentView === ''"
                :target="'#options-pane'"
                :label="'common:modules.modeler3D.nav.options'"
                :interaction="() => {setCurrentView(''); povActive ? escapePedView(undefined) : ''}"
            />
        </ul>
        <component
            :is="currentView"
            v-if="currentView"
        />
        <div
            v-if="!currentView"
            id="modeler3D-options-view"
        >
            <AccordionItem
                id="options-accordion"
                :title="$t('modules.modeler3D.options.captions.visibilityTitle')"
                icon="bi-eye-fill"
                :is-open="true"
            >
                <h4> {{ $t('modules.modeler3D.options.captions.hideSwitchLabel') }} </h4>
                <div class="form-check form-switch mb-4">
                    <SwitchInput
                        id="hideObjectsSwitch"
                        aria-checked="hideObjects"
                        :aria="$t('modules.modeler3D.options.captions.enableFunction')"
                        :checked="hideObjects"
                        :label="$t('modules.modeler3D.options.captions.enableFunction')"
                        @change="changeSwitches('hideObjectsSwitch')"
                    />
                </div>
                <p
                    class="mb-4 text-with-newlines"
                >
                    {{ $t('modules.modeler3D.options.captions.hideObjectInfo') }}
                </p>
                <hr>
                <h4> {{ $t('modules.modeler3D.options.captions.povTitle') }} </h4>
                <div>
                    <div class="form-check form-switch mb-4">
                        <SwitchInput
                            id="povActiveSwitch"
                            aria-checked="povActive"
                            :aria="$t('modules.modeler3D.options.captions.enableFunction')"
                            :checked="povActive"
                            :label="$t('modules.modeler3D.options.captions.enableFunction')"
                            @change="changeSwitches('povActiveSwitch'), togglePovInteraction()"
                        />
                    </div>
                    <p
                        class="mb-4 text-with-newlines"
                    >
                        {{ $t('modules.modeler3D.options.captions.povInfo') }}
                    </p>
                </div>
            </AccordionItem>
        </div>
        <div
            v-if="hiddenObjects?.length > 0 && !isLoading"
        >
            <hr class="m-0">
            <AccordionItem
                id="hidden-objects"
                :title="$t('modules.modeler3D.hiddenObjectsLabel')"
                icon="bi-eye-slash-fill"
            >
                <EntityList
                    :objects="hiddenObjects"
                    :enable-checkboxes="false"
                    @change-visibility="showObject"
                />
            </AccordionItem>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~mixins";
@import "~variables";

.text-with-newlines {
    white-space: pre-wrap;
}

</style>
