import crs from "@masterportal/masterportalapi/src/crs";
import {adaptCylinderToGround, adaptCylinderToEntity, calculateRotatedPointCoordinates} from "../js/draw";
import {convertColor} from "../../../shared/js/utils/convertColor";
import blobHandler from "../js/blob";
import {nextTick} from "vue";
import {uniqueId} from "../../../shared/js/utils/uniqueId";

/**
 * The actions for the modeler3D module.
 * @module modules/modeler3D/store/actionsModeler3D
 */
export default {
    /**
     * Handles the processing of GeoJSON content.
     * @param {Object} context - The context of the Vuex module.
     * @param {String} content - The GeoJSON content.
     * @returns {void}
     */
    handleGeoJsonFile ({commit, state}, content) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            clonedDrawnModels = [...state.drawnModels];
        let geojson;

        try {
            geojson = JSON.parse(content);
        }
        catch ({message}) {
            console.error("Error while trying to parse the given content:", message);
            return;
        }
        if (!Array.isArray(geojson?.features)) {
            console.warn("No features found in the given GeoJSON content.");
            return;
        }

        geojson.features.forEach(feature => {
            const properties = feature.properties,
                color = properties.color,
                outlineColor = properties.outlineColor,
                coordinates = feature.geometry.coordinates[0],
                entity = new Cesium.Entity({
                    id: uniqueId("import"),
                    name: properties.name,
                    wasDrawn: true,
                    clampToGround: properties.clampToGround
                });

            if (feature.geometry.type === "Polygon") {
                entity.polygon = {
                    material: new Cesium.ColorMaterialProperty(
                        new Cesium.Color(color.red, color.green, color.blue, color.alpha)
                    ),
                    outline: true,
                    outlineColor: new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, outlineColor.alpha),
                    outlineWidth: 1,
                    height: coordinates[0][2],
                    extrudedHeight: properties.extrudedHeight,
                    shadows: Cesium.ShadowMode.ENABLED,
                    hierarchy: new Cesium.PolygonHierarchy(coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1])))
                };
            }
            else if (feature.geometry.type === "Polyline") {
                entity.polyline = {
                    material: new Cesium.ColorMaterialProperty(
                        new Cesium.Color(color.red, color.green, color.blue, color.alpha)
                    ),
                    width: properties.width,
                    positions: coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]))
                };
            }

            entities.add(entity);
            if (feature.geometry.type === "Polygon") {
                entity.polygon.rectangle = properties.rectangle;
            }
            clonedDrawnModels.push({
                id: entity.id,
                name: entity.name,
                show: true,
                edit: false
            });
        });

        commit("setDrawnModels", clonedDrawnModels);
        commit("setCurrentView", "modeler-draw");
        commit("setIsLoading", false);
    },
    /**
     * Creates an entity for each element in the given list.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object[]} entityList List of entities to create.
     * @returns {void}
     */
    async createEntities ({dispatch}, entityList) {
        if (!Array.isArray(entityList) || !entityList.length) {
            return;
        }

        for (let i = 0; i < entityList.length; i++) {
            let blob = entityList[i]?.blob;

            if (!(blob instanceof Blob)) {
                try {
                    blob = await blobHandler.b64toBlob(blob, entityList[i]?.blobType);
                }
                catch ({message}) {
                    console.error("Error while parsing base64 into blob:", message);
                    return;
                }
            }
            await dispatch("createEntity", {blob, fileName: entityList[i].fileName, position: entityList[i].position, rotation: entityList[i].rotation, scale: entityList[i].scale});
        }
    },
    /**
     * Creates an entity from the processed gltf or glb.
     * @param {Object} context - The context of the Vuex module.
     * @param {Blob} blob - The GLTF or glb content.
     * @param {String} fileName - The name of the file.
     * @param {Object} Position - The position object of entity.
     * @param {Number} rotation - The rotation of entity.
     * @param {Number} scale - The scale of entity.
     * @returns {void}
     */
    async createEntity ({commit, state}, {blob, fileName, position, rotation, scale}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            clonedModels = [...state.importedModels],
            options = {
                id: uniqueId("import"),
                name: fileName,
                clampToGround: true,
                model: new Cesium.ModelGraphics({
                    uri: URL.createObjectURL(blob)
                })
            },
            clonedEntities = [...state.importedEntities],
            blobBuffer = await blobHandler.blobToBase64(blob);
        let entity = null;

        if (position) {
            options.position = new Cesium.Cartesian3(position.x, position.y, position.z);
        }
        entity = new Cesium.Entity(options);
        entities.add(entity);
        commit("setUseAnchorMove", false);

        clonedEntities.push({
            blob: blobBuffer,
            blobType: blob?.type,
            fileName,
            entityId: entity.id,
            rotation: state.rotation,
            scale: state.scale,
            position
        });

        if (!position) {
            commit("setMovingEntity", true);
        }
        commit("setImportedEntities", clonedEntities);


        clonedModels.push({
            id: entity.id,
            name: fileName,
            show: true,
            edit: false,
            heading: 0
        });

        commit("setImportedModels", clonedModels);
        commit("setCurrentModelId", entity.id);
        nextTick(() => {
            if (typeof rotation === "number") {
                commit("setRotation", rotation);
            }

            if (typeof scale === "number") {
                commit("setScale", scale);
            }
        });

        commit("setIsLoading", false);
    },
    /**
     * Action to delete an entity.
     * @param {Object} context - The context of the Vuex module.
     * @param {String} id - The ID of the entity to delete.
     * @returns {void}
     */
    deleteEntity ({commit, dispatch, state}, id) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(id),
            stateArray = entity?.wasDrawn ? state.drawnModels : state.importedModels,
            modelIndex = stateArray.findIndex(x => x.id === id),
            outlines = entities.values.filter(ent => ent.outline && ent.polyline);

        if (modelIndex > -1 && entity) {
            outlines.forEach(outline => entities.remove(outline));
            dispatch("removeCylinders");
            dispatch("removeLabels", entity);
            commit("setActiveShapePoints", []);
            commit("setCylinderId", null);
            commit("setCurrentModelId", null);

            stateArray.splice(modelIndex, 1);
            entities.removeById(id);
        }
    },
    /**
     * Toggles the visibility of a model entity.
     * @param {Object} context The context of the Vuex module.
     * @param {Object} model - The model object.
     * @returns {void}
     */
    changeVisibility (context, model) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(model.id);

        entity.show = !model.show;
        model.show = entity.show;
    },
    /**
     * Reacts on new selected projection. Sets the current projection and its name to state and updates the UI.
     * @param {Object} context - The context of the Vuex module.
     * @param {String} value id of the new selected projection
     * @returns {void}
    */
    newProjectionSelected ({dispatch, commit, getters}, value) {
        const targetProjection = getters.getProjectionById(value);

        commit("setCurrentProjection", targetProjection);
        dispatch("updatePositionUI");
    },
    /**
     * Reacts on new input value. Gets the currently selected entity and updates its position.
     * @param {Object} context - The context of the Vuex module.
     * @returns {void}
    */
    updateEntityPosition ({dispatch, state}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId);

        if (!entity) {
            return;
        }

        dispatch("transformToCartesian");
        if (entity.polygon) {
            const cylinders = entities.values.filter(ent => ent.cylinder);

            dispatch("movePolygon", {entityId: state.currentModelId, position: state.currentModelPosition});

            cylinders.forEach(cyl => {
                cyl.cylinder.length = entity.polygon.extrudedHeight - entity.polygon.height + 5;
            });
        }
        else {
            entity.position = state.currentModelPosition;
        }
    },
    /**
     * Reacts on changed entity position. Gets the currently selected entity position and transforms its coordinates
     * to the currently selected projection.
     * @param {Object} context - The context of the Vuex module.
     * @returns {void}
    */
    updatePositionUI ({commit, dispatch, getters, state}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId),
            entityPosition = entity?.position?.getValue() || getters.getCenterFromGeometry(entity);

        if (entityPosition) {
            dispatch("transformFromCartesian", entityPosition);
            if (entity?.polygon instanceof Cesium.PolygonGraphics) {
                commit("setHeight", entity.polygon.height.getValue());
            }
        }
    },
    /**
     * Reacts on changed entity position. Gets the currently selected entity position and transforms its coordinates
     * to the currently selected projection.
     * @param {Object} context - The context of the Vuex module.
     * @returns {void}
    */
    updateUI ({commit, dispatch, state}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId);

        commit("setAdaptToHeight", entity.clampToGround);

        if (entity?.polygon instanceof Cesium.PolygonGraphics) {
            commit("setExtrudedHeight", entity.polygon.extrudedHeight.getValue() - entity.polygon.height.getValue());
            commit("setDrawRotation", 0);
            entity.lastRotationAngle = 0;

            if (entity.polygon.rectangle) {
                const positions = entity.polygon.hierarchy.getValue().positions;

                commit("setRectWidth", Cesium.Cartesian3.distance(positions[1], positions[2]));
                commit("setRectDepth", Cesium.Cartesian3.distance(positions[1], positions[0]));
            }
        }
        else if (entity?.polyline instanceof Cesium.PolylineGraphics) {
            const lineWidth = entity.originalWidth ? entity.originalWidth.getValue() : entity.polyline.width.getValue();

            commit("setLineWidth", lineWidth);
            commit("setDrawRotation", 0);
        }
        else if (entity?.model instanceof Cesium.ModelGraphics) {
            const modelFromState = state.importedModels.find(ent => ent.id === entity.id);

            commit("setRotation", modelFromState.heading);
            commit("setScale", entity.model.scale ? entity.model.scale.getValue() : 1);
        }
        dispatch("updatePositionUI");
    },
    /**
     * Transforms the Cartesian3 coordinates to the currently selected projection and sets it to state.
     * @param {Object} context - The context of the Vuex module.
     * @param {Cartesian3} entityPosition position of currently selected entity
     * @returns {void}
    */
    transformFromCartesian ({state, commit}, entityPosition) {
        let coordinates = Cesium.Cartographic.fromCartesian(entityPosition);

        const height = coordinates.height;

        coordinates = [Cesium.Math.toDegrees(coordinates.longitude), Cesium.Math.toDegrees(coordinates.latitude)];

        if (state.currentProjection.epsg !== "EPSG:4326") {
            coordinates = crs.transform("EPSG:4326", state.currentProjection, coordinates);
        }

        if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3" && coordinates.toFixed(2).length === 9) {
            coordinates[0] += 3000000;
        }

        commit("setCoordinateEasting", coordinates[0]);
        commit("setCoordinateNorthing", coordinates[1]);
        commit("setHeight", height);
    },
    /**
     * Transforms the current UI values to Cartesian3 coordinates and sets it to state.
     * @param {Object} context - The context of the Vuex module.
     * @returns {void}
    */
    transformToCartesian ({commit, state}) {
        let coordinates = [state.coordinateEasting, state.coordinateNorthing],
            height = state.height;

        if (state.currentProjection.epsg !== "EPSG:4326") {
            if (state.currentProjection.id.indexOf("ETRS893GK3") > -1) {
                coordinates[0] -= 3000000;
            }
            coordinates = crs.transform(state.currentProjection, "EPSG:4326", coordinates);
        }

        if (state.adaptToHeight) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                cartographic = Cesium.Cartographic.fromDegrees(coordinates[0], coordinates[1]);

            height = scene.globe.getHeight(cartographic);

            commit("setHeight", height);
        }

        commit("setCurrentModelPosition", Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], height));
    },
    /**
     * Generates Cesium cylinders at all polygon positions.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object} entity - The entity to generate the cylinders for.
     * @returns {void}
    */
    generateCylinders ({dispatch, state}, entity) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

        state.activeShapePoints.forEach((_, index) => {
            dispatch("createCylinder", {
                posIndex: index,
                length: entity.polygon ? entity.polygon.extrudedHeight.getValue() - entity.polygon.height.getValue() + 5 : 5
            });
            const cylinder = entities.values.find(cyl => cyl.id === state.cylinderId);

            cylinder.position = new Cesium.CallbackProperty(() => {
                return entity.clampToGround ?
                    adaptCylinderToGround(cylinder, state.activeShapePoints[cylinder.positionIndex]) :
                    adaptCylinderToEntity(entity, cylinder, state.activeShapePoints[cylinder.positionIndex]);
            }, false);
        });
    },
    /**
     * Create a singular Cesium cylinder at the given position.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object} positionObj - The position options to create the cylinder with
     * @returns {void}
    */
    createCylinder ({commit, state}, {position = new Cesium.Cartesian3(), posIndex, length, entityId = state.currentModelId}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            cylinder = entities.add({
                attachedEntityId: entityId,
                position: position,
                positionIndex: posIndex,
                cylinder: {
                    material: new Cesium.ColorMaterialProperty(Cesium.Color.RED),
                    bottomRadius: 0.1,
                    topRadius: 1,
                    length: length ? length : state.extrudedHeight + 5
                }
            });

        commit("setCylinderId", cylinder.id);
    },
    /**
     * Removes all Cesium cylinders from the the Cesium EntityCollection.
     * @param {Object} context - The context of the Vuex module.
     * @returns {void}
    */
    removeCylinders () {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            pointEntities = entities.values.filter(entity => entity.cylinder);

        pointEntities.forEach(entity => {
            entities.remove(entity);
        });
    },
    /**
     * Moves a given polygon to a given new position.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object} moveOptions - Contains the polygon and new position it shall be moved to.
     * @returns {void}
    */
    movePolygon ({dispatch, getters, state}, {entityId, position, anchor = null}) {
        const scene = mapCollection.getMap("3D").getCesiumScene(),
            entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(entityId);

        if (entity?.polygon?.hierarchy && position) {
            const positions = entity?.polygon?.hierarchy.getValue().positions,
                center = getters.getCenterFromGeometry(entity),
                positionDelta = Cesium.Cartesian3.subtract(position, anchor || center, new Cesium.Cartesian3());

            if (entity.clampToGround) {
                state.height = scene.globe.getHeight(Cesium.Cartographic.fromCartesian(center));
            }
            entity.polygon.height = state.height;
            entity.polygon.extrudedHeight = state.extrudedHeight + state.height;

            positions.forEach(pos => {
                Cesium.Cartesian3.add(pos, positionDelta, pos);
            });

            dispatch("transformFromCartesian", getters.getCenterFromGeometry(entity));
        }
    },
    /**
     * Moves a given polyline to a given new position.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object} moveOptions - Contains the polyline and new position it shall be moved to.
     * @returns {void}
    */
    movePolyline ({getters}, {entityId, position, anchor = null}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(entityId);

        if (entity?.polyline?.positions && position) {
            const positions = entity.polyline.positions.getValue(),
                center = getters.getCenterFromGeometry(entity),
                positionDelta = Cesium.Cartesian3.subtract(position, anchor || center, new Cesium.Cartesian3());

            positions.forEach(pos => {
                Cesium.Cartesian3.add(pos, positionDelta, pos);
            });
        }
    },
    /**
     * Edits the layout of the currently selected entity.
     * @param {Object} context - The context of the Vuex module.
     * @param {String} keyword - The keyword defines which part of the layout is being edited.
     * @returns {void}
     */
    editLayout ({commit, getters, state}, keyword) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities?.getById(state.currentModelId),
            entityType = getters.getEntityType(entity);

        if (keyword === "fillColor" && entity.polygon) {
            const alpha = entity[entityType].material.color.alpha,
                newFillColor = Cesium.Color.fromBytes(...convertColor(state.newFillColor, "rgb")).withAlpha(alpha);

            entity.polygon.material = new Cesium.ColorMaterialProperty(newFillColor);
        }
        else if (keyword === "strokeColor") {
            const newStrokeColor = Cesium.Color.fromBytes(...convertColor(state.newStrokeColor, "rgb"));

            if (state.highlightTimeout) {
                clearTimeout(state.highlightTimeout);
            }
            if (entity.polygon) {
                const outlines = entities.values.filter(ent => ent.outline);

                outlines.forEach(outline => {
                    outline.show = false;
                    entity.polygon.outline = true;
                });

                entity.polygon.outlineColor = newStrokeColor;
                entity.originalOutlineColor = newStrokeColor;

                commit("setHighlightTimeout", setTimeout(() => {
                    outlines.forEach(outline => {
                        outline.show = true;
                        entity.polygon.outline = false;
                    });
                }, 2000));
            }
            else if (entity.polyline) {
                const highlightColor = entity.polyline.material.color;

                entity.polyline.material.color = newStrokeColor;
                entity.originalColor = newStrokeColor;

                commit("setHighlightTimeout", setTimeout(() => {
                    entity.polyline.material.color = highlightColor;
                }, 2000));
            }
        }
    },
    /**
     * Moves the adjacent corners of a rectangle to a new position.
     * @param {Object} context - The context of the Vuex module
     * @param {Object} moveOptions - Contains the moved corner index and a boolean to clamp the new position to the ground.
     * @returns {void}
     */
    moveAdjacentRectangleCorners ({getters, state}, {movedCornerIndex}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId);
        let center = null,
            angle = null,
            corner1 = null,
            corner2 = null,
            corner3,
            corner4,
            originalPoints = state.activeShapePoints;

        if (entity && (entity.rotation || state.drawRotation)) {
            center = Cesium.Cartographic.fromCartesian(getters.getCenterFromGeometry(entity));
            angle = Cesium.Math.toRadians((entity.rotation || 0) + state.drawRotation);

            originalPoints = originalPoints.map(position => calculateRotatedPointCoordinates({angle, center, position}));
        }

        corner1 = Cesium.Cartographic.fromCartesian(originalPoints[movedCornerIndex]);
        corner2 = Cesium.Cartographic.fromCartesian(originalPoints[(movedCornerIndex + 2) % 4]);
        corner3 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic(corner1.longitude, corner2.latitude, corner1.height));
        corner4 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic(corner2.longitude, corner1.latitude, corner1.height));

        if (entity && (entity.rotation || state.drawRotation)) {
            corner3 = calculateRotatedPointCoordinates({angle: -angle, center, position: corner3});
            corner4 = calculateRotatedPointCoordinates({angle: -angle, center, position: corner4});
        }

        state.activeShapePoints.splice((movedCornerIndex + 1) % 4, 1, movedCornerIndex % 2 === 0 ? corner3 : corner4);
        state.activeShapePoints.splice((movedCornerIndex + 3) % 4, 1, movedCornerIndex % 2 === 0 ? corner4 : corner3);
    },
    /**
     * Rotates the currently selected drawn entity.
     * @param {Object} context - The context of the Vuex module.
     * @param {Number} rotation - The rotation angle in degrees.
     * @returns {void}
     */
    rotateDrawnEntity ({state, getters}, rotation) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId),
            angle = Cesium.Math.toRadians(entity.lastRotationAngle - rotation),
            center = Cesium.Cartographic.fromCartesian(getters.getCenterFromGeometry(entity));

        state.activeShapePoints.forEach((position, index) => {
            state.activeShapePoints.splice(index, 1, calculateRotatedPointCoordinates({angle, center, position}));
        });

        entity.lastRotationAngle = rotation;
    },
    /**
     * Updates the dimensions of the currently selected rectangle.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object} dimensions - The new dimensions of the rectangle.
     * @returns {void}
     */
    updateRectangleDimensions ({getters, state}, dimensions) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId),
            position = getters.getCenterFromGeometry(entity),
            localFrame = Cesium.Transforms.eastNorthUpToFixedFrame(position),
            corners = [
                new Cesium.Cartesian3(-dimensions.width / 2, -dimensions.depth / 2, 0),
                new Cesium.Cartesian3(-dimensions.width / 2, dimensions.depth / 2, 0),
                new Cesium.Cartesian3(dimensions.width / 2, dimensions.depth / 2, 0),
                new Cesium.Cartesian3(dimensions.width / 2, -dimensions.depth / 2, 0)
            ],
            cornersRelative = corners.map(cr => Cesium.Matrix4.multiplyByPoint(localFrame, cr, new Cesium.Cartesian3())),
            angle = Cesium.Math.toRadians((-entity.rotation || 0) - state.drawRotation);

        cornersRelative.forEach((corner, index) => {
            const rotatedPoint = entity.rotation || state.drawRotation ?
                calculateRotatedPointCoordinates({angle, center: Cesium.Cartographic.fromCartesian(position), position: corner}) :
                corner;

            state.activeShapePoints.splice(index, 1, rotatedPoint);
        });
    },
    /**
     * Copys a drawn entity and places the copy next to the original entity.
     * For the placement, it calculates the extent of the entity and adds its width as offset to the longitude of the copied entity.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object} idObject - Contains the id of the entity to be copied and nextId for the new entity.
     * @returns {void}
     */
    copyEntity ({state, commit}, {id, nextId}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            models = state.drawnModels,
            entity = entities.getById(id),
            geometry = entity.polygon || entity.polyline,
            positions = entity.polygon ? entity.polygon.hierarchy.getValue().positions : entity.polyline.positions.getValue(),
            color = entity.polygon ? geometry.material.color.getValue() : entity.originalColor,
            outlineColor = geometry.outlineColor?.getValue(),
            positionsJson = JSON.parse(JSON.stringify(positions)),
            positionsCartographic = positionsJson.map(position => Cesium.Cartographic.fromCartesian(position)),
            extent = Cesium.Rectangle.fromCartographicArray(positionsCartographic),
            widthInRadians = extent.east - extent.west,
            positionsCopy = positionsCartographic.map(position => {
                position.longitude += widthInRadians;
                return Cesium.Cartesian3.fromRadians(position.longitude, position.latitude, position.height);
            });

        let copiedEntity = null;

        if (!entity) {
            return;
        }
        copiedEntity = new Cesium.Entity({
            id: nextId,
            name: entity.name + " copy",
            clampToGround: entity.clampToGround,
            show: true,
            wasDrawn: true
        });

        if (entity.polygon) {
            copiedEntity.polygon = {
                hierarchy: new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(positionsCopy)),
                material: new Cesium.ColorMaterialProperty(color),
                outlineColor: new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, outlineColor.alpha),
                height: entity.polygon.height.getValue(),
                extrudedHeight: entity.polygon.extrudedHeight.getValue()
            };
        }
        else {
            copiedEntity.polyline = {
                positions: new Cesium.ConstantProperty(positionsCopy),
                material: new Cesium.ColorMaterialProperty(color),
                width: entity.originalWidth
            };
        }

        entities.add(copiedEntity);

        if (entity.polygon?.rectangle) {
            copiedEntity.polygon.rectangle = true;
        }

        models.push({
            id: copiedEntity.id,
            name: copiedEntity.name,
            show: true,
            edit: false
        });
        commit("setDrawnModels", models);
        commit("setCurrentModelId", copiedEntity.id);
    },
    /**
    * Removes all Labels of the entity from the the Cesium EntityCollection.
    * @param {Object} context - The context of the Vuex module.
    * @param {Cesium.Entity} entity - The entity to remove the labels from.
    * @returns {void}
    */
    removeLabels (context, entity) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            labelEntities = entities.values.filter(ent => ent.label && ent.attachedEntityId === entity.id);

        labelEntities.forEach(label => {
            entities.remove(label);
        });
    }
};
