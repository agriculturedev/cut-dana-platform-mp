<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import crs from "@masterportal/masterportalapi/src/crs";
import {adaptCylinderToEntity, adaptCylinderToGround, adaptCylinderUnclamped, calculatePolygonArea} from "../utils/draw";

import DrawTypes from "./ui/DrawTypes.vue";
import DrawLayout from "./ui/DrawLayout.vue";
import EntityList from "./ui/EntityList.vue";
import DrawModels from "./ui/DrawModels.vue";

let eventHandler = null;

export default {
    name: "Modeler3DDraw",
    components: {
        DrawTypes,
        DrawLayout,
        EntityList,
        DrawModels
    },
    data () {
        return {
            clampToGround: true,
            currentPosition: null,
            shapeId: null,
            undonePointInfo: null,
            labelId: null,
            lastAddedPosition: null,
            dimensions: true,
            areaLabelId: null,
            labelList: [],
            undoneLabelInfo: null
        };
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        ...mapGetters("Maps", ["mouseCoordinate"])
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

        /**
         * Called if button in UI is pressed. Starts the drawing process.
         * @returns {void}
         */
        startDrawing () {
            this.setExtrudedHeight(this.currentLayout.extrudedHeight);
            this.setLineWidth(this.currentLayout.strokeWidth);
            this.setIsDrawing(true);
            this.shapeId = null;
            this.currentPosition = {x: 1, y: 1, z: 1};
            this.createCylinder({
                posIndex: this.activeShapePoints.length
            });

            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId);

            floatingPoint.position = this.clampToGround ?
                new Cesium.CallbackProperty(() => adaptCylinderToGround(floatingPoint, this.currentPosition), false) :
                new Cesium.CallbackProperty(() => adaptCylinderUnclamped(floatingPoint, this.currentPosition), false);

            eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

            eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.addGeometryPosition, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            eventHandler.setInputAction(this.stopDrawing, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            eventHandler.setInputAction(this.stopDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            document.addEventListener("keydown", this.catchUndoRedo);
        },
        /**
         * Called on every keypress to catch CTRL + Y/Z to undo or redo the last action.
         * @param {Event} event keypress event
         * @returns {void}
         */
        catchUndoRedo (event) {
            if (event.ctrlKey && event.key === "z") {
                this.undoGeometryPosition();
                this.undoLabelPosition();
                event.preventDefault();
            }
            else if (event.ctrlKey && event.key === "y") {
                this.redoGeometryPosition();
                this.redoLabelPosition();
                event.preventDefault();
            }
        },
        /**
         * Called on mouse move. Repositions the current pin to set the position.
         * @param {Event} event changed mouse position event
         * @returns {void}
         */
        onMouseMove (event) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId);


            if (this.clampToGround) {
                const ray = scene.camera.getPickRay(event.endPosition),
                    position = scene.globe.pick(ray, scene);

                if (Cesium.defined(position)) {
                    document.body.style.cursor = "copy";
                }

                if (this.currentPosition !== position) {
                    this.currentPosition = position;
                }
            }
            else {
                const transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                    cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]),
                    polygon = entities.values.find(ent => ent.id === this.currentModelId),
                    ignoreObjects = polygon ? [floatingPoint, polygon] : [floatingPoint];

                if (cartographic) {
                    document.body.style.cursor = "copy";
                }

                cartographic.height = scene.sampleHeight(cartographic, ignoreObjects);

                if (this.currentPosition !== Cesium.Cartographic.toCartesian(cartographic)) {
                    this.currentPosition = Cesium.Cartographic.toCartesian(cartographic);
                }
            }
            if (Cesium.defined(this.currentPosition)) {
                this.activeShapePoints.splice(floatingPoint.positionIndex, 1, this.currentPosition);
                const shape = entities.getById(this.shapeId);

                if (shape?.polygon?.rectangle && this.activeShapePoints.length > 1) {
                    this.moveAdjacentRectangleCorners({movedCornerIndex: 3, clampToGround: this.clampToGround});
                }

                if (this.activeShapePoints.length > 1 && this.shapeId !== null && this.dimensions) {
                    const areaLabel = entities.getById(this.areaLabelId);

                    if (shape?.polygon && this.labelList.length !== 0) {
                        const area = calculatePolygonArea(shape);

                        areaLabel.label.text = Math.round(area * 100) / 100 + " m²";
                        areaLabel.label.show = this.dimensions;
                        this.setArea(area);
                    }
                    this.calculateDistances();
                }
            }
        },
        /**
         * Called on mouse leftclick. Sets the position of a pin and starts to draw a geometry.
         * When a position is identical to the last placed position, the function is escaped to avoid moving errors of the drawn geometry.
         * @returns {void}
         */
        addGeometryPosition () {
            if (Cesium.Cartesian3.equals(this.currentPosition, this.lastAddedPosition)) {
                return;
            }
            this.lastAddedPosition = this.currentPosition;

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            let floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId),
                entity = null,
                label = null;

            if (this.activeShapePoints.length === 1 && !this.shapeId) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                this.setHeight(this.clampToGround ?
                    scene.globe.getHeight(Cesium.Cartographic.fromCartesian(this.currentPosition)) :
                    scene.sampleHeight(Cesium.Cartographic.fromCartesian(this.currentPosition), [floatingPoint])
                );
                this.drawShape();
                this.addLabel("area");
            }
            entity = entities.getById(this.shapeId);
            label = this.addLabel("distance");
            this.labelList.push(label);

            if (entity?.polygon?.rectangle) {
                if (this.activeShapePoints.length > 1) {
                    this.activeShapePoints.push({});
                    this.stopDrawing();
                    return;
                }
                this.activeShapePoints.splice(1, 0, Cesium.Cartesian3.clone(this.activeShapePoints[0]));
                this.activeShapePoints.unshift(Cesium.Cartesian3.clone(this.activeShapePoints[0]));
            }
            if ((this.activeShapePoints.length === 2 && entity?.polygon) || entity?.polygon?.rectangle) {
                label = this.addLabel("distance");
                this.labelList.push(label);
            }

            if (this.clampToGround) {
                floatingPoint.position = adaptCylinderToGround(floatingPoint, this.currentPosition);
                this.createCylinder({
                    posIndex: this.activeShapePoints.length
                });
            }
            else {
                floatingPoint.position = entity ? adaptCylinderToEntity(entity, floatingPoint, this.currentPosition) : adaptCylinderUnclamped(floatingPoint, this.currentPosition);

                this.createCylinder({
                    posIndex: this.activeShapePoints.length,
                    length: entity?.polygon ? this.extrudedHeight + entity.polygon.height + 5 : undefined
                });
            }
            floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId);
            floatingPoint.position = this.clampToGround ?
                new Cesium.CallbackProperty(() => adaptCylinderToGround(floatingPoint, this.currentPosition), false) :
                new Cesium.CallbackProperty(() => entity ? adaptCylinderToEntity(entity, floatingPoint, this.currentPosition) : adaptCylinderUnclamped(floatingPoint, this.currentPosition), false);

            this.activeShapePoints.push(this.currentPosition);
        },
        /**
         * Called on CTRL + Z. Deletes the last set geometry position.
         * When no positions were set, the function is escaped to avoid errors.
         * @returns {void}
         */
        undoGeometryPosition () {
            if (!this.isDrawing || this.activeShapePoints.length <= 1) {
                return;
            }
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                lastPositionIndex = this.activeShapePoints.length - 2,
                lastFloatingPoint = entities.values.find(cyl => cyl.positionIndex === lastPositionIndex),
                currentFloatingPoint = entities.values.find(cyl => cyl.positionIndex === lastPositionIndex + 1);

            currentFloatingPoint.positionIndex = lastPositionIndex;
            this.undonePointInfo = {
                position: lastFloatingPoint.position.getValue(),
                length: lastFloatingPoint.cylinder.length.getValue(),
                posIndex: lastPositionIndex
            };
            entities.remove(lastFloatingPoint);

            this.activeShapePoints.splice(lastPositionIndex, 1);
        },
        /**
         * Called on CTRL + Y. Redoes the last undone geometry position.
         * When no positions were undone, the function is escaped to avoid errors.
         * @returns {void}
         */
        redoGeometryPosition () {
            if (!this.isDrawing || !this.undonePointInfo) {
                return;
            }
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                undonePositionIndex = this.activeShapePoints.length - 1,
                currentFloatingPoint = entities.values.find(cyl => cyl.positionIndex === undonePositionIndex);

            currentFloatingPoint.positionIndex = undonePositionIndex + 1;

            this.activeShapePoints.splice(undonePositionIndex, 0, this.undonePointInfo.position);

            this.createCylinder(this.undonePointInfo);
            this.setCylinderId(currentFloatingPoint.id);
            this.undonePointInfo = null;
        },
        /**
         * Called on CTRL + Z and deletes the last label position, if dimensions is true.
         * @returns {void}
         */
        undoLabelPosition () {
            if (!this.isDrawing || this.labelList.length < 1 || !this.dimensions) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                lastLabelPositionIndex = this.labelList.length === 1 ? this.labelList.length - 1 : this.labelList.length - 2,
                lastLabel = this.labelList[lastLabelPositionIndex]?.id,
                areaLabel = entities.values.find(lab => lab.id === this.areaLabelId),
                currentLabel = entities.values.find(lab => lab.id === lastLabel);

            this.undoneLabelInfo = {
                position: this.labelList[lastLabelPositionIndex].position,
                text: this.labelList[lastLabelPositionIndex].label.text
            };

            if (this.labelList.length === 1) {
                entities.remove(currentLabel);
                areaLabel.label.show = false;
            }
            entities.remove(currentLabel);

            this.labelList.splice(lastLabelPositionIndex, 1);
        },
        /**
         * Called on CTRL + Y and redoes the last undone label, if dimensions is true.
         * @returns {void}
         */
        redoLabelPosition () {
            if (!this.isDrawing || !this.undoneLabelInfo || !this.dimensions) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                undoneLabelPositionIndex = this.labelList.length === 0 ? null : this.labelList.length - 1,
                lastLabel = this.labelList.length === 0 ? null : this.labelList[undoneLabelPositionIndex]?.id,
                currentLabel = this.labelList.length === 0 ? null : entities.values.find(lab => lab?.id === lastLabel),
                areaLabel = entities.values.find(lab => lab.id === this.areaLabelId);

            this.addLabel("distance", this.undoneLabelInfo);
            if (this.labelList.length === 0) {
                areaLabel.label.show = true;
                areaLabel.label.text = "0 m²";
            }

            this.labelList.splice(undoneLabelPositionIndex, 0, entities.getById(this.labelId));
            this.labelId = currentLabel !== null ? currentLabel.id : this.labelId;
            this.undoneLabelInfo = null;
        },
        /**
         * Called on mouse rightclick. Completes the polygon when there are at least 3 corners or deletes it when it has less.
         * @returns {void}
         */
        stopDrawing () {
            if (!this.isDrawing) {
                return;
            }
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                shape = entities.getById(this.shapeId);

            this.activeShapePoints.pop();

            if (shape?.polygon && this.activeShapePoints.length > 2) {
                shape.polygon.hierarchy = new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(this.activeShapePoints));

            }
            if (shape?.polyline && this.activeShapePoints.length >= 2) {
                shape.polyline.positions = this.activeShapePoints;
            }
            else if (shape && shape.polygon && (this.activeShapePoints.length < 3 || (shape.polygon.rectangle && this.activeShapePoints.length < 4))) {
                this.deleteEntity(shape.id);
            }

            this.setActiveShapePoints([]);
            this.removeCylinders();
            this.removeLabel();
            this.labelList = [];
            this.currentPosition = null;
            this.shapeId = null;
            this.setIsDrawing(false);
            document.body.style.cursor = "auto";
            eventHandler.destroy();
            window.removeEventListener("keydown", this.catchUndoRedo);
        },
        /**
         * Creates the drawn shape in the EntityCollection and sets its attributes.
         * @returns {void}
         */
        drawShape () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                models = this.drawnModels,
                lastElement = entities.values.filter(ent => !ent.cylinder).pop(),
                lastId = lastElement ? lastElement.id : undefined,
                shapeId = lastId ? lastId + 1 : 1,
                positionData = new Cesium.CallbackProperty(() => {
                    if (this.selectedDrawType === "polygon" || this.selectedDrawType === "rectangle") {
                        return new Cesium.PolygonHierarchy(this.activeShapePoints);
                    }
                    return this.activeShapePoints;
                }, false),
                shape = new Cesium.Entity({
                    id: shapeId,
                    name: this.drawName ? this.drawName : i18next.t("common:modules.tools.modeler3D.draw.captions.drawing") + ` ${shapeId}`,
                    wasDrawn: true,
                    clampToGround: this.clampToGround
                });

            if (this.selectedDrawType === "line") {
                shape.polyline = {
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromBytes(...this.currentLayout.strokeColor).withAlpha(1 - this.currentLayout.fillTransparency / 100)
                    ),
                    positions: positionData,
                    width: this.lineWidth
                };
            }
            else if (this.selectedDrawType === "polygon" || this.selectedDrawType === "rectangle") {
                shape.polygon = {
                    height: this.height,
                    hierarchy: positionData,
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromBytes(...this.currentLayout.fillColor).withAlpha(1 - this.currentLayout.fillTransparency / 100)
                    ),
                    outline: true,
                    outlineColor: Cesium.Color.fromBytes(...this.currentLayout.strokeColor).withAlpha(1 - this.currentLayout.fillTransparency / 100),
                    shadows: Cesium.ShadowMode.ENABLED,
                    extrudedHeight: this.extrudedHeight + this.height
                };
            }

            entities.add(shape);
            if (this.selectedDrawType === "rectangle") {
                shape.polygon.rectangle = true;
            }

            models.push({
                id: shape.id,
                name: shape.name,
                show: true,
                edit: false
            });
            this.setDrawnModels(models);
            this.shapeId = shape.id;
        },
        /**
         * Resets the drawing to adjust to changes
         * @param {Object} layout - The new layout with current values
         * @returns {void}
         */
        resetDrawing (layout) {
            if (layout) {
                this.setCurrentLayout(layout);
            }
            if (this.isDrawing) {
                this.stopDrawing();
                this.startDrawing();
            }
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {string} id - The ID of the entity to zoom to.
         * @returns {void}
         */
        zoomTo (id) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(id);

            if (entity) {
                let height;

                if (entity.polygon) {
                    height = entity.polygon.extrudedHeight.getValue();
                }
                else if (entity.polyline) {
                    height = 0;
                }

                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    center = this.getCenterFromGeometry(entity),
                    centerCartographic = Cesium.Cartographic.fromCartesian(center),
                    longitude = centerCartographic.longitude,
                    latitude = centerCartographic.latitude,
                    targetHeight = height + 250;

                scene.camera.flyTo({
                    destination: Cesium.Cartesian3.fromRadians(longitude, latitude, targetHeight)
                });
            }
        },
        /**
         * Exports all drawn entities to single GeoJSON file.
         * @param {Event} event changed mouse position event
         * @returns {void}
         */
        exportToGeoJson () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                drawnEntitiesCollection = [],
                jsonGlob = {
                    type: "FeatureCollection",
                    features: []
                },
                features = [];

            entities.values.forEach(entity => {
                if (!entity.model) {
                    drawnEntitiesCollection.push(entity);
                }
            });

            drawnEntitiesCollection.forEach(entity => {
                const geometry = entity.polygon ? entity.polygon : entity.polyline,
                    positions = entity.polygon ? entity.polygon.hierarchy.getValue().positions : entity.polyline.positions.getValue(),
                    color = geometry.material.color.getValue(),
                    outlineColor = geometry.outlineColor?.getValue(),
                    feature = {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: entity.polygon ? "Polygon" : "Polyline",
                            coordinates: [[]]
                        }};

                positions.forEach(position => {
                    const cartographic = Cesium.Cartographic.fromCartesian(position),
                        longitude = Cesium.Math.toDegrees(cartographic.longitude),
                        latitude = Cesium.Math.toDegrees(cartographic.latitude),
                        altitude = entity.polygon ? geometry.height.getValue() : cartographic.height,
                        coordXY = [Number(longitude), Number(latitude), Number(altitude)];

                    feature.geometry.coordinates[0].push(coordXY);
                });

                feature.properties.name = entity.name;
                feature.properties.clampToGround = entity.clampToGround;
                feature.properties.color = color;

                if (entity.polygon) {
                    feature.properties.outlineColor = outlineColor;
                    feature.properties.extrudedHeight = geometry.extrudedHeight.getValue();
                }
                else if (entity.polyline) {
                    feature.properties.width = geometry.width.getValue();
                }

                features.push(feature);
            });

            jsonGlob.features = features;

            this.downloadGeoJson(JSON.stringify(jsonGlob));
        },
        /**
         * Downloads the exported GeoJSON file
         * @param {JSON} geojson - all entities in a json format.
         * @returns {void}
         */
        downloadGeoJson (geojson) {
            const url = URL.createObjectURL(new Blob([geojson], {type: "application/geo+json"})),
                link = document.createElement("a");

            link.href = url;
            link.download = "export.geojson";
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        },
        /**
         * Creates the label in the EntityCollection depending on "distance" or "area" type.
         * @param {String} type - label type can be "distance" or "area".
         * @param {Object} labelInfo - set specific text and position. Default is false.
         * @returns {Cesium.Entity} - The created label.
         */
        addLabel (type, labelInfo = false) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                lastElement = entities.values.filter(ent => !ent.cylinder).pop(),
                lastId = lastElement ? lastElement.id : undefined,
                labelId = lastId ? lastId + 1 : 1;
            let label;

            if (type === "distance") {
                label = {
                    position: !labelInfo ? this.currentPosition : labelInfo.position,
                    id: labelId,
                    label: {
                        text: !labelInfo ? "text" : labelInfo.text,
                        wasDrawn: true,
                        fillColor: Cesium.Color.BLACK,
                        font: "10px",
                        showBackground: true,
                        backgroundColor: Cesium.Color.fromCssColorString("#DCE2F3"),
                        style: Cesium.LabelStyle.FILL,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        show: !labelInfo ? false : this.dimensions
                    }
                };
                this.labelId = label.id;
            }
            else if (type === "area") {
                label = {
                    position: this.activeShapePoints[0],
                    id: labelId,
                    label: {
                        text: "text",
                        wasDrawn: true,
                        fillColor: Cesium.Color.WHITE,
                        font: "10px",
                        showBackground: true,
                        backgroundColor: Cesium.Color.fromCssColorString("#3C5F94"),
                        style: Cesium.LabelStyle.FILL,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        show: false,
                        pixelOffset: new Cesium.Cartesian2(30, -30)
                    }
                };
                this.areaLabelId = label.id;
            }
            entities.add(label);
            return label;
        },
        /**
        * Removes all Label from the the Cesium EntityCollection.
        * @returns {void}
        */
        removeLabel () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                labelEntities = entities.values.filter(entity => entity.label);

            labelEntities.forEach(entity => {
                entities.remove(entity);
            });
        },
        /**
        * Calculate the distance between two points and update the label.
        * @param {Cesium.Cartesian3} position1 - The first position.
        * @param {Cesium.Cartesian3} position2 - The second position.
        * @param {Number} labelId - The id of the label.
        * @returns {void}
        */
        calculateDistances () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            this.labelList.forEach((label, index) => {
                const labelEntity = entities.getById(label.id),
                    position1 = this.activeShapePoints[index % this.activeShapePoints.length],
                    position2 = this.activeShapePoints[(index + 1) % this.activeShapePoints.length],
                    distance = Cesium.Cartesian3.distance(position1, position2),
                    labelPosition = Cesium.Cartesian3.midpoint(position1, position2, new Cesium.Cartesian3());

                labelEntity.label.text = Math.round(distance * 100) / 100 + "m";
                labelEntity.position = labelPosition;
                labelEntity.label.show = this.dimensions;
            });
        },
        /**
         * Starts placing of a ready to place 3D element.
         * @returns {void}
         */
        startPlacing () {
            if (this.isDrawing) {
                this.stopDrawing();
            }

            const camera = mapCollection.getMap("3D").getCesiumScene().camera,
                position = Cesium.Cartographic.fromCartesian(camera.position);

            if (this.selectedDrawModelType === "rectangle") {
                const corners = this.generateRectangleCorners(position);

                this.setActiveShapePoints(corners);
                this.setSelectedDrawType("rectangle");
                this.setExtrudedHeight(20);
                this.drawShape();
            }

            this.$emit("select-and-move", this.shapeId);
        },
        /**
         * Generate the corners of a rectangle given a center position.
         * @param {Cesium.Cartographic} position - The given center of the rectangle.
         * @returns {Cesium.Cartesian3[]} - The corners of the rectangle.
         */
        generateRectangleCorners (position) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                ellipsoid = scene.globe.ellipsoid,
                localFrame = Cesium.Transforms.eastNorthUpToFixedFrame(ellipsoid.cartographicToCartesian(position)),

                halfDepth = 20 / 2,
                halfWidth = 15 / 2,
                corners = [
                    new Cesium.Cartesian3(-halfDepth, -halfWidth, 0),
                    new Cesium.Cartesian3(halfDepth, -halfWidth, 0),
                    new Cesium.Cartesian3(halfDepth, halfWidth, 0),
                    new Cesium.Cartesian3(-halfDepth, halfWidth, 0)
                ],

                cornersCartesian = corners.map(cr => Cesium.Matrix4.multiplyByPoint(localFrame, cr, new Cesium.Cartesian3()));

            return cornersCartesian;
        }
    }
};
</script>

<template lang="html">
    <div id="modeler3D-draw-tool">
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.draw.captions.introInfo')"
        />
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.draw.captions.controlInfo')"
        />
        <div class="h-seperator" />
        <div>
            <div class="form-check form-switch cta">
                <input
                    id="clampToGroundSwitch"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="clampToGround"
                    :checked="clampToGround"
                    @change="clampToGround = !clampToGround; resetDrawing();"
                >
                <label
                    class="form-check-label"
                    for="clampToGroundSwitch"
                >
                    {{ $t("modules.tools.modeler3D.draw.captions.clampToGround") }}
                </label>
            </div>
            <div class="form-check form-switch cta">
                <input
                    id="dimensionsSwitch"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="dimensions"
                    :checked="dimensions"
                    @change="dimensions = !dimensions; resetDrawing();"
                >
                <label
                    class="form-check-label"
                    for="clampToGroundSwitch"
                >
                    {{ "Maße anzeigen" }}
                </label>
            </div>
            <div
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="modeler3D-draw-name"
                >
                    {{ $t("modules.tools.modeler3D.draw.captions.drawName") }}
                </label>
                <div class="col-md-7">
                    <input
                        id="modeler3D-draw-name"
                        class="form-control form-control-sm"
                        type="text"
                        :value="drawName"
                        @input="setDrawName($event.target.value)"
                    >
                </div>
            </div>
        </div>
        <div
            v-if="drawModelTypes.length > 0"
            class="d-flex flex-column"
        >
            <label
                class="col col-form-label"
                for="tool-modeler3D-draw-models"
            >
                {{ $t("modules.tools.modeler3D.draw.captions.readyGeometries") }}
            </label>
            <DrawModels
                id="tool-modeler3D-draw-models"
                :draw-model-types="drawModelTypes"
                :selected-draw-model-type="selectedDrawModelType"
                :set-selected-draw-model-type="setSelectedDrawModelType"
                @start-placing="startPlacing"
            />
        </div>
        <div class="d-flex flex-column">
            <label
                class="col col-form-label"
                for="tool-modeler3d-draw-types"
            >
                {{ $t("modules.tools.modeler3D.draw.captions.geometries") }}
            </label>
            <DrawTypes
                id="tool-modeler3d-draw-types"
                :current-layout="currentLayout"
                :draw-types="drawTypes"
                :selected-draw-type="selectedDrawType"
                :set-selected-draw-type="setSelectedDrawType"
                @start-drawing="startDrawing"
                @stop-drawing="stopDrawing"
            />
        </div>
        <div
            v-if="selectedDrawType !== ''"
            class="d-flex flex-column flex-wrap"
        >
            <label
                class="col-md-5 col-form-label"
                for="tool-modeler3d-draw-types"
            >
                {{ $t("modules.tools.modeler3D.draw.captions.options") }}
            </label>
            <DrawLayout
                :current-layout="currentLayout"
                :selected-draw-type="selectedDrawType"
                @update-layout="resetDrawing"
            />
        </div>
        <EntityList
            v-if="drawnModels.length > 0"
            id="drawn-models"
            :objects="drawnModels"
            :objects-label="$t('modules.tools.modeler3D.draw.captions.drawnModels')"
            :entity="true"
            :geometry="true"
            @change-visibility="changeVisibility"
            @export-geojson="exportToGeoJson"
            @zoom-to="zoomTo"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .cta {
        margin-bottom:12px;
    }

    .form-switch,
    .col-form-label {
        font-size: $font_size_big;
    }

    .form-check-input {
        cursor: pointer;
    }

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 0.1rem 0.7rem;
        cursor: pointer;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
        &:disabled {
            background-color: $dark_grey;
            cursor: not-allowed;
        }
    }
</style>
