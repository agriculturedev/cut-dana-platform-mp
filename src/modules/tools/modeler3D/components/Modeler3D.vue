<script>
import ToolTemplate from "../../ToolTemplate.vue";
import Import from "./Modeler3DImport.vue";
import Draw from "./Modeler3DDraw.vue";
import EntityList from "./ui/EntityList.vue";
import AccordionItem from "./ui/AccordionItem.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import crs from "@masterportal/masterportalapi/src/crs";
import getGfiFeatures from "../../../../api/gfi/getGfiFeaturesByTileFeature";
import {adaptCylinderToGround, adaptCylinderToEntity, adaptCylinderUnclamped, calculatePolygonArea} from "../utils/draw";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import {Point} from "ol/geom.js";
import {Fill, Style, Circle} from "ol/style.js";

let eventHandler = null;

export default {
    name: "Modeler3D",
    components: {
        ToolTemplate,
        Import,
        Draw,
        AccordionItem,
        EntityList
    },
    data () {
        return {
            defaultTabClass: "",
            currentPosition: null,
            activeTabClass: "active",
            currentCartesian: null,
            originalCursorStyle: null,
            originalPosition: null,
            undonePosition: null,
            lastAction: null
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"]),
        /**
         * Returns the CSS classes for the import tab based on the current view.
         * @returns {string} - The CSS classes for the import tab.
         */
        importTabClasses () {
            return this.currentView === "import" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Returns the CSS classes for the draw tab based on the current view.
         * @returns {string} - The CSS classes for the draw tab.
         */
        drawTabClasses () {
            return this.currentView === "draw" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Returns the CSS classes for the options tab based on the current view.
         * @returns {string} - The CSS classes for the options tab.
         */
        optionsTabClasses () {
            return this.currentView === "" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Checks if it is possible to enter point of view (POV) mode.
         * Returns true if `longitude`, `latitude`, and `altitude` properties are defined and truthy, otherwise false.
         * @returns {boolean} - Indicates whether POV mode is possible.
         */
        povPossible () {
            return Boolean(this.longitude && this.latitude && this.altitude);
        }
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                this.initProjections();
                eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

                eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOWN);
                eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                document.addEventListener("keydown", this.catchUndoRedo);
            }
            else {
                eventHandler.destroy();
                document.removeEventListener("keydown", this.catchUndoRedo);
            }
        },
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
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),
        ...mapMutations("controls/overviewMap/", ["setOverviewLayer"]),


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
                this.setExtrudedHeight(20);
            }
            else if (entity.polyline) {
                entity.polyline.positions = new Cesium.ConstantProperty(this.activeShapePoints);
                entity.polyline.material.color = entity.originalColor;
                entity.polyline.width = entity.originalWidth;
            }
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
                this.generateCylinders();
                newEntity.lastRotationAngle = 0;
                this.setDrawRotation(0);
                if (newEntity.polygon) {
                    this.setActiveShapePoints(newEntity.polygon.hierarchy.getValue().positions);
                    newEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.activeShapePoints), false);
                }
                else if (newEntity.polyline) {
                    this.setActiveShapePoints(newEntity.polyline.positions.getValue());
                    newEntity.polyline.positions = new Cesium.CallbackProperty(() => this.activeShapePoints);
                }
            }
            this.highlightEntity(newEntity);
            this.setCurrentModelPosition(newEntity?.position?.getValue() || this.getCenterFromGeometry(newEntity));
            this.updateUI();
        },
        /**
         * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
         * @returns {void}
         */
        initProjections () {
            const pr = crs.getProjections(),
                epsg8395 = [],
                wgs84Proj = [];

            if (this.projections.length) {
                return;
            }
            // id is set to the name and in case of decimal "-DG" is appended to name later on
            // for use in select-box
            pr.forEach(proj => {
                proj.id = proj.name;
                if (proj.name === "EPSG:4326" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#4326") {
                    wgs84Proj.push(proj);
                }
                if (proj.name === "EPSG:8395" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#8395") {
                    epsg8395.push(proj);
                }
                if (proj.name.indexOf("#") > -1) { // e.g. "http://www.opengis.net/gml/srs/epsg.xml#25832"
                    const code = proj.name.substring(proj.name.indexOf("#") + 1, proj.name.length);

                    proj.epsg = "EPSG:" + code;
                }
                else {
                    proj.title = proj.name;
                }
                if (proj.id === this.currentProjection.id) {
                    this.setCurrentProjection(proj);
                }
            });
            if (wgs84Proj.length > 0) {
                this.addWGS84Decimal(pr, wgs84Proj);
            }
            this.namedProjections.find((el) => {
                if (el[1].includes("ETRS89_3GK3") && epsg8395.length > 0) {
                    this.addETRS893GK3(pr, el, epsg8395);
                    return true;
                }
                return false;
            });
            this.setProjections(pr);
        },
        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Array} projections list of all available projections
         * @param {Object} elementETRS89_3GK3 the WGS84 projection contained in list of projections
         * @param {Object} epsg8395 the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addETRS893GK3 (projections, elementETRS89_3GK3, epsg8395) {
            const index = projections.findIndex(proj => proj.name === "EPSG:8395"),
                etrs89_3GK3Proj = {};

            for (const key in epsg8395[0]) {
                etrs89_3GK3Proj[key] = epsg8395[0][key];
            }
            etrs89_3GK3Proj.name = "ETRS893GK3";
            etrs89_3GK3Proj.epsg = "EPSG:8395";
            etrs89_3GK3Proj.id = "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3";
            etrs89_3GK3Proj.title = elementETRS89_3GK3[1].substring(elementETRS89_3GK3[1].lastIndexOf("ETRS"), elementETRS89_3GK3[1].indexOf(" +proj="));
            etrs89_3GK3Proj.getCode = () => "noEPSGCode";
            projections.splice(index + 1, 0, etrs89_3GK3Proj);
        },
        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Array} projections list of all available projections
         * @param {Object} wgs84Proj the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addWGS84Decimal (projections, wgs84Proj) {
            const index = projections.findIndex(proj => proj.name === "EPSG:4326"),
                wgs84ProjDez = {};

            for (const key in wgs84Proj[0]) {
                wgs84ProjDez[key] = wgs84Proj[0][key];
            }
            wgs84ProjDez.name = "EPSG:4326-DG";
            wgs84ProjDez.epsg = "EPSG:4326";
            wgs84ProjDez.id = "http://www.opengis.net/gml/srs/epsg.xml#4326-DG";
            wgs84ProjDez.title = "WGS84_Lat-Lon (Grad, Dezimal), EPSG 4326";
            wgs84ProjDez.getCode = () => "EPSG:4326-DG";
            projections.splice(index + 1, 0, wgs84ProjDez);
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
                picked = scene.pick(event.endPosition),
                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

            if (Cesium.defined(entity) && entity instanceof Cesium.Entity && !entity.outline) {
                if (this.currentModelId && entity.id === this.currentModelId || entity.cylinder) {
                    document.getElementById("map").style.cursor = "grab";
                }
                else {
                    document.getElementById("map").style.cursor = "pointer";
                }
            }
            else if (this.hideObjects && Cesium.defined(picked) && picked instanceof Cesium.Cesium3DTileFeature) {
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
            if (this.isDrawing) {
                return;
            }

            let entity;

            if (event) {
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    picked = scene.pick(event.position);

                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);
            }

            if (entity instanceof Cesium.Entity || !event) {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                    scene = mapCollection.getMap("3D").getCesiumScene();

                this.setIsDragging(true);
                scene.screenSpaceCameraController.enableInputs = false;
                this.originalHideOption = this.hideObjects;
                this.setHideObjects(false);

                eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                document.getElementById("map").style.cursor = "grabbing";

                if (entity?.cylinder) {
                    const geometry = entities.getById(this.currentModelId),
                        position = geometry.polygon ? geometry.polygon.hierarchy.getValue().positions[entity.positionIndex] : geometry.polyline.positions.getValue()[entity.positionIndex],
                        cylinders = entities.values.filter(ent => ent.cylinder);

                    this.currentPosition = position;
                    this.originalPosition = {entityId: entity.positionIndex, attachedEntityId: entity.attachedEntityId, position};

                    cylinders.forEach((cyl) => {
                        this.cylinderPosition[cyl.positionIndex] = cyl.position.getValue();
                        cyl.position = geometry.clampToGround ?
                            new Cesium.CallbackProperty(() => adaptCylinderToGround(cyl, this.cylinderPosition[cyl.positionIndex]), false) :
                            new Cesium.CallbackProperty(() => adaptCylinderToEntity(geometry, cyl, this.cylinderPosition[cyl.positionIndex]), false);
                    });

                    this.setCylinderId(entity.id);

                    eventHandler.setInputAction(this.moveCylinder, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                else if (entity?.wasDrawn) {
                    entities.values.filter(ent => ent.cylinder).forEach((cyl, index) => {
                        this.cylinderPosition[index] = cyl.position.getValue();

                        cyl.position = entity.clampToGround ?
                            new Cesium.CallbackProperty(() => adaptCylinderToGround(cyl, this.cylinderPosition[index]), false) :
                            new Cesium.CallbackProperty(() => adaptCylinderToEntity(entity, cyl, this.cylinderPosition[index]), false);
                    });

                    this.originalPosition = {entityId: entity.id, position: this.getCenterFromGeometry(entity)};

                    if (this.currentModelId && this.currentModelId === entity.id) {
                        eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    }
                }
                else {
                    this.originalPosition = entity ? {entityId: entity.id, position: entity.position.getValue()} : null;
                    eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }

                eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);
            }
        },
        /**
         * Selects an object based on the provided event.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        selectObject (event) {
            if (this.isDrawing) {
                return;
            }
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.pick(event.position),
                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

            if (!Cesium.defined(picked) || entity.outline) {
                return;
            }

            if (entity instanceof Cesium.Entity && !entity.cylinder) {
                this.setCurrentModelId(entity.id);
                this.setCylinderId(null);
                if (entity.polygon) {
                    this.setArea(calculatePolygonArea(entity));
                }
            }
            else if (this.hideObjects && picked instanceof Cesium.Cesium3DTileFeature) {
                const features = getGfiFeatures.getGfiFeaturesByTileFeature(picked),
                    gmlId = features[0]?.getProperties()[this.gmlIdPath],
                    tileSetModels = this.updateAllLayers ?
                        Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D"}) :
                        Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D", id: picked.tileset.layerReferenceId});

                tileSetModels.forEach(model => model.hideObjects([gmlId], this.updateAllLayers));

                this.hiddenObjects.push({
                    name: gmlId
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

                    if (this.cylinderPosition[cylinder.positionIndex] !== position) {
                        this.cylinderPosition[cylinder.positionIndex] = scene.globe.pick(ray, scene);
                        this.updatePositionUI();
                    }
                }
                else {
                    const transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                        cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]);

                    cartographic.height = scene.sampleHeight(cartographic, [cylinder, entity]);

                    if (this.cylinderPosition[cylinder.positionIndex] !== Cesium.Cartographic.toCartesian(cartographic)) {
                        this.cylinderPosition[cylinder.positionIndex] = Cesium.Cartographic.toCartesian(cartographic);
                        this.updatePositionUI();
                    }
                }
                if (Cesium.defined(this.cylinderPosition[cylinder.positionIndex])) {
                    this.activeShapePoints.splice(cylinder.positionIndex, 1, this.cylinderPosition[cylinder.positionIndex]);
                    if (entity.polygon?.rectangle) {
                        this.moveAdjacentRectangleCorners({movedCornerIndex: cylinder.positionIndex, clampToGround: entity.clampToGround});
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
            if (!this.isDragging) {
                return;
            }

            const scene = mapCollection.getMap("3D").getCesiumScene(),
                ray = scene.camera.getPickRay(event.endPosition),
                position = scene.globe.pick(ray, scene),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (!Cesium.defined(position) || !Cesium.defined(entity)) {
                return;
            }

            if (entity.polygon) {
                this.movePolygon({entityId: this.currentModelId, position});
            }
            else if (entity.polyline) {
                this.movePolyline({entityId: this.currentModelId, position});
            }
            else {
                entity.position = position;
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
            const scene = mapCollection.getMap("3D").getCesiumScene();

            eventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
            eventHandler?.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.setIsDragging(false);

            if (this.cylinderId || this.wasDrawn) {
                this.setCylinderId(null);
            }

            this.setHideObjects(this.originalHideOption);

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
                    const cylinders = entities.values.filter(ent => ent.cylinder);

                    this.moveAdjacentRectangleCorners({movedCornerIndex: movedEntity.positionIndex, clampToGround: attachedEntity.clampToGround});
                    cylinders.forEach(cyl => {
                        cyl.position = attachedEntity.clampToGround ?
                            adaptCylinderToGround(cyl, this.cylinderPosition[cyl.positionIndex]) :
                            adaptCylinderToEntity(attachedEntity, cyl, this.cylinderPosition[cyl.positionIndex]);
                    });
                }
                else {
                    movedEntity.position = attachedEntity.clampToGround ?
                        adaptCylinderToGround(movedEntity, entityObject.position) :
                        adaptCylinderToEntity(attachedEntity, movedEntity, entityObject.position);
                }

            }
            else if (movedEntity.wasDrawn) {
                const cylinders = entities.values.filter(ent => ent.cylinder);

                if (movedEntity.polygon) {
                    this.movePolygon(entityObject);
                }
                else if (movedEntity.polyline) {
                    this.movePolyline(entityObject);
                }

                cylinders.forEach((cyl) => {
                    cyl.position = movedEntity?.clampToGround ?
                        adaptCylinderToGround(cyl, this.cylinderPosition[cyl.positionIndex]) :
                        adaptCylinderToEntity(movedEntity, cyl, this.cylinderPosition[cyl.positionIndex]);
                });
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
                    this.generateOutlines(entity);
                }
                else if (entity.polyline) {
                    entity.originalWidth = entity.polyline.width;
                    entity.originalColor = entity.polyline.material.color;
                    entity.polyline.material.color = Cesium.Color.fromAlpha(
                        Cesium.Color.fromCssColorString(silhouetteColor),
                        parseFloat(1)
                    );
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
            const objectIndex = this.hiddenObjects.findIndex(x => x.name === object.name),
                tileSetModels = Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D"});

            tileSetModels[0].showObjects([object.name]);
            this.hiddenObjects.splice(objectIndex, 1);
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
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
                tmplayer = new VectorLayer({
                    id: "overview-map-3d",
                    name: "overview-map-3d",
                    source: new VectorSource(),
                    alwaysOnTop: true
                }),
                feature = new Feature({
                    id: "newSipederDiperFeature",
                    geometry: new Point(this.clickCoordinate)
                });

            feature.setStyle(new Style({
                image: new Circle({
                    radius: 5,
                    fill: new Fill({color: "rgba(255,0,0, 1)"})
                })
            }));
            this.originalCursorStyle = document.body.style.cursor;
            this.currentCartesian = Cesium.Cartographic.toCartesian(currentPosition);
            destination.height = this.altitude + 1.80;

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height),
                orientation: {
                    pitch: 0,
                    roll: 0,
                    heading: scene.camera.heading
                },
                complete: () => {
                    tmplayer.getSource().addFeature(feature);
                    this.setOverviewLayer(tmplayer);
                }
            });

            this.movePovCamera(scene.camera);
            scene.screenSpaceCameraController.enableZoom = false;
            scene.screenSpaceCameraController.enableRotate = false;

            document.addEventListener("keydown", this.escapePedView);
        },

        /**
         * Use the mouse to move the camera to a pedestrian's point of view while holding down the left mouse button.
         * @param {Cesium.Camera} camera - A cesium camera.
         * @returns {void}
         */
        movePovCamera (camera) {
            let startMousePosition,
                mousePosition,
                letUsMove;

            eventHandler.setInputAction((movement) => {
                letUsMove = true;
                mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

            eventHandler.setInputAction(() => {
                letUsMove = false;
            }, Cesium.ScreenSpaceEventType.LEFT_UP);

            eventHandler.setInputAction((movement) => {
                if (letUsMove) {
                    mousePosition = movement.endPosition;
                    const deltaY = -mousePosition.y + startMousePosition.y,
                        deltaX = mousePosition.x - startMousePosition.x,

                        sensitivity = 0.002,
                        pitch = Cesium.Math.clamp(camera.pitch - sensitivity * deltaY, -Cesium.Math.PI_OVER_TWO, Cesium.Math.PI_OVER_TWO),
                        heading = camera.heading - sensitivity * deltaX;

                    camera.setView({
                        orientation: {
                            pitch: pitch,
                            roll: 0,
                            heading: heading
                        }
                    });
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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

            scene.camera.flyTo({
                destination: this.currentCartesian,
                complete: () => {
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableRotate = true;

                    eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    document.removeEventListener("keydown", this.escapePedView);
                    document.body.style.cursor = this.originalCursorStyle;
                    this.changeCursor();
                    this.setOverviewLayer(undefined);
                }
            });
        },
        resetPov () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            this.setPovActive(false);
            entities.removeById(this.cylinderId);
            document.body.style.cursor = this.originalCursorStyle;
            eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
                    eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
            }
            else if (id === "hideObjectsSwitch" || this.hideObjects) {
                this.setHideObjects(!this.hideObjects);
                this.resetPov();
                // document.body.style.cursor = this.originalCursorStyle;
            }

        },
        /**
         * Event handler for click events.
         * Updates the cursor style, removes the MOUSE_MOVE input action, and adds the selectObject function as the LEFT_CLICK input action.
         * @returns {void}
         */
        clickHandler () {
            document.body.style.cursor = this.originalCursorStyle;
            eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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

                document.body.style.cursor = "copy";
            }

            if (!Cesium.Cartesian3.equals(this.currentCartesian, currentCartesian)) {
                this.currentCartesian = currentCartesian;
            }
        },
        /**
         * Changes the cursor and sets input actions based on the state of `this.povActive`.
         * If `this.povActive` is true, it retrieves the povCylinder by ID and performs the following actions:
         * - If the povCylinder doesn't exist, it creates a cylinder, sets its position, and assigns it to povCylinder.
         * - It sets the moveHandler function as the input action for MOUSE_MOVE events.
         * - It sets the clickHandler function as the input action for LEFT_CLICK events.
         * @returns {void}
         */
        changeCursor () {
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
            eventHandler.setInputAction(this.moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.clickHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="380"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-modeler3D"
            >
                <ul class="nav nav-tabs">
                    <li
                        id="tool-modeler3D-import"
                        role="presentation"
                        class="nav-item"
                    >
                        <a
                            href="#"
                            class="nav-link"
                            :class="[importTabClasses, {'disabled': isDrawing}]"
                            @click.prevent="setCurrentView('import')"
                        >{{ $t("modules.tools.modeler3D.nav.importTitle") }}</a>
                    </li>
                    <li
                        id="tool-modeler3D-draw"
                        role="presentation"
                        class="nav-item"
                    >
                        <a
                            href="#"
                            class="nav-link"
                            :class="[drawTabClasses, {'disabled': isDrawing}]"
                            @click.prevent="setCurrentView('draw')"
                        >{{ $t("modules.tools.modeler3D.nav.drawTitle") }}</a>
                    </li>
                    <li
                        id="tool-modeler3D-options"
                        role="presentation"
                        class="nav-item"
                    >
                        <a
                            href="#"
                            class="nav-link"
                            :class="[optionsTabClasses, {'disabled': isDrawing}]"
                            @click.prevent="setCurrentView('')"
                        >{{ $t("modules.tools.modeler3D.nav.options") }}</a>
                    </li>
                </ul>
                <component
                    :is="currentView"
                    v-if="currentView"
                    @emit-move="moveEntity"
                />
                <div
                    v-if="!currentView"
                    id="modeler3D-options-view"
                    class="accordion"
                >
                    <div class="accordion-item">
                        <h1
                            id="options-headingOne"
                            class="accordion-header"
                        >
                            <button
                                class="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#options-collapseOne"
                                aria-expanded="true"
                                aria-controls="options-collapseOne"
                            >
                                {{ $t("modules.tools.modeler3D.options.captions.visibilityTitle") }}
                            </button>
                        </h1>
                        <div
                            id="options-collapseOne"
                            class="accordion-collapse collapse show"
                            aria-labelledby="options-headingOne"
                        >
                            <div class="accordion-body">
                                <h2 v-html="$t('modules.tools.modeler3D.options.captions.hideSwitchLabel')" />
                                <div class="form-check form-switch cta">
                                    <input
                                        id="hideObjectsSwitch"
                                        class="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        :aria-checked="hideObjects"
                                        :checked="hideObjects"
                                        @change="changeSwitches('hideObjectsSwitch')"
                                    >
                                    <label
                                        class="form-check-label"
                                        for="hideObjectsSwitch"
                                    >
                                        {{ $t("modules.tools.modeler3D.options.captions.enableFunction") }}
                                    </label>
                                </div>
                                <p
                                    class="cta"
                                    v-html="$t('modules.tools.modeler3D.options.captions.hideObjectInfo')"
                                />
                                <div class="h-seperator" />
                                <h2 v-html="$t('modules.tools.modeler3D.options.captions.povTitle')" />
                                <div>
                                    <div class="form-check form-switch cta">
                                        <input
                                            id="povActiveSwitch"
                                            class="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            :aria-checked="povActive"
                                            :checked="povActive"
                                            @change="changeSwitches('povActiveSwitch'), changeCursor()"
                                        >
                                        <label
                                            class="form-check-label"
                                            for="povActiveSwitch"
                                        >
                                            {{ $t("modules.tools.modeler3D.options.captions.enableFunction") }}
                                        </label>
                                    </div>
                                    <p
                                        class="cta"
                                        v-html="$t('modules.tools.modeler3D.options.captions.povInfo')"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="hiddenObjects.length > 0 && !isLoading"
                >
                    <hr class="m-0">
                    <AccordionItem
                        id="hidden-objects"
                        :title="$t('modules.tools.modeler3D.hiddenObjectsLabel')"
                        icon="bi-eye-slash-fill"
                    >
                        <EntityList
                            :objects="hiddenObjects"
                            @change-visibility="showObject"
                        />
                    </AccordionItem>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .nav-link {
        font-size: $font_size_big;
    }

    .accordion-button {
        font-size: 0.95rem;
    }

    .cta {
        margin-bottom:12px;
    }

    h2 {
        font-size: $font_size_big;
        font-weight: bold;
        text-transform: none;
        margin: 0 0 6px 0;
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        width: 100%;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }

    .form-switch {
        font-size: $font_size_big;
    }

    .nav-tabs {
        margin-bottom: 1em;
    }
</style>
