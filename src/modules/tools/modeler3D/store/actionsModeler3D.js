import crs from "@masterportal/masterportalapi/src/crs";
import store from "../../../../app-store";
import {adaptCylinderToGround, adaptCylinderToEntity, calculateRotatedPointCoordinates} from "../utils/draw";
import {convertColor} from "../../../../utils/convertColor";

const actions = {
    /**
     * Action to delete an entity.
     *
     * @param {Object} context - The context of the Vuex module.
     * @param {string} id - The ID of the entity to delete.
     * @returns {void}
     */
    deleteEntity ({commit, dispatch, state}, id) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(id),
            stateArray = entity?.wasDrawn ? state.drawnModels : state.importedModels,
            modelIndex = stateArray.findIndex(x => x.id === id);

        if (modelIndex > -1 && entity) {
            dispatch("removeCylinders");
            commit("setActiveShapePoints", []);
            commit("setCylinderId", null);
            commit("setCurrentModelId", null);
            commit("setArea", null);

            stateArray.splice(modelIndex, 1);
            entities.removeById(id);
        }
    },
    /**
     * Confirms the deletion of an entity by adding a confirmation action.
     * @param {object} context - The context of the Vuex module.
     * @param {string} id - The ID of the entity to be deleted.
     * @returns {void}
     */
    confirmDeletion ({dispatch, getters}, id) {
        const modelName = getters.getModelNameById(id);

        store.dispatch("ConfirmAction/addSingleAction", {
            actionConfirmedCallback: () => dispatch("deleteEntity", id),
            confirmCaption: i18next.t("common:modules.tools.modeler3D.entity.deleteInteraction.confirm"),
            textContent: i18next.t("common:modules.tools.modeler3D.entity.deleteInteraction.text", {name: modelName}),
            headline: i18next.t("common:modules.tools.modeler3D.entity.deleteInteraction.headline")
        });
    },
    /**
     * Toggles the visibility of a model entity.
     * @param {Object} context The context of the Vuex module.
     * @param {object} model - The model object.
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
     * @param {object} context - The context of the Vuex module.
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
     * @param {object} context - The context of the Vuex module.
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
                cyl.position = entity.clampToGround ?
                    adaptCylinderToGround(cyl, state.cylinderPosition[cyl.positionIndex]) :
                    adaptCylinderToEntity(entity, cyl, state.cylinderPosition[cyl.positionIndex]);
            });
        }
        else {
            entity.position = state.currentModelPosition;
        }
    },
    /**
     * Reacts on changed entity position. Gets the currently selected entity position and transforms its coordinates
     * to the currently selected projection.
     * @param {object} context - The context of the Vuex module.
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
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    updateUI ({commit, dispatch, state}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId);

        commit("setAdaptToHeight", entity.clampToGround);

        if (entity?.polygon instanceof Cesium.PolygonGraphics) {
            commit("setExtrudedHeight", entity.polygon.extrudedHeight.getValue() - entity.polygon.height.getValue());
        }
        else if (entity?.polyline instanceof Cesium.PolylineGraphics) {
            commit("setLineWidth", entity.polyline.width.getValue());
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
     * @param {object} context - The context of the Vuex module.
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
     * @param {object} context - The context of the Vuex module.
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
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    generateCylinders ({commit, dispatch, state}) {
        let positions, length;
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId);

        if (entity?.polygon) {
            length = entity.polygon.extrudedHeight - entity.polygon.height + 5;
            positions = entity.polygon.hierarchy.getValue().positions;

        }
        else if (entity?.polyline) {
            length = 4;
            positions = entity.polyline.positions.getValue();

        }
        commit("setActiveShapePoints", positions);

        positions.forEach((_, index) => {
            dispatch("createCylinder", {
                posIndex: index,
                length: length
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
     * @param {object} context - The context of the Vuex module.
     * @param {object} positionObj - The position options to create the cylinder with
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
     * @param {object} context - The context of the Vuex module.
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
     * @param {object} context - The context of the Vuex module.
     * @param {object} moveOptions - Contains the polygon and new position it shall be moved to.
     * @returns {void}
    */
    movePolygon ({dispatch, getters, state}, {entityId, position}) {
        const scene = mapCollection.getMap("3D").getCesiumScene(),
            entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(entityId);

        if (entity?.polygon?.hierarchy && position) {
            const positions = entity?.polygon?.hierarchy.getValue().positions,
                center = getters.getCenterFromGeometry(entity),
                positionDelta = Cesium.Cartesian3.subtract(position, center, new Cesium.Cartesian3());

            if (entity.clampToGround) {
                state.height = scene.globe.getHeight(Cesium.Cartographic.fromCartesian(center));
            }
            entity.polygon.height = state.height;
            entity.polygon.extrudedHeight = state.extrudedHeight + state.height;

            positions.forEach((pos, index) => {
                Cesium.Cartesian3.add(pos, positionDelta, pos);
                state.cylinderPosition[index] = pos;
            });

            dispatch("transformFromCartesian", getters.getCenterFromGeometry(entity));
        }
    },
    /**
     * Moves a given polyline to a given new position.
     * @param {object} context - The context of the Vuex module.
     * @param {object} moveOptions - Contains the polyline and new position it shall be moved to.
     * @returns {void}
    */
    movePolyline ({state, getters}, {entityId, position}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(entityId);

        if (entity?.polyline?.positions && position) {
            const positions = entity.polyline.positions.getValue(),
                center = getters.getCenterFromGeometry(entity),
                positionDelta = Cesium.Cartesian3.subtract(position, center, new Cesium.Cartesian3());

            positions.forEach((pos, index) => {
                Cesium.Cartesian3.add(pos, positionDelta, pos);
                state.cylinderPosition[index] = pos;
            });
        }
    },
    /**
     * Edits the layout of the currently selected entity.
     * @param {object} context - The context of the Vuex module.
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
                const highlightColor = entity.polyline.material.color.getValue();

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
     * @param {object} context - The context of the Vuex module
     * @param {Object} moveOptions - Contains the moved corner index and a boolean to clamp the new position to the ground.
     * @returns {void}
     */
    moveAdjacentRectangleCorners ({state}, {movedCornerIndex, clampToGround}) {
        const corner1 = Cesium.Cartographic.fromCartesian(state.activeShapePoints[movedCornerIndex]),
            corner2 = Cesium.Cartographic.fromCartesian(state.activeShapePoints[(movedCornerIndex + 2) % 4]),
            corner3 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic(corner1.longitude, corner2.latitude, corner1.height)),
            corner4 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic(corner2.longitude, corner1.latitude, corner1.height)),
            entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId),
            cylinders = entities.values.filter(ent => ent.cylinder);

        state.activeShapePoints.splice((movedCornerIndex + 1) % 4, 1, corner3);
        state.activeShapePoints.splice((movedCornerIndex + 3) % 4, 1, corner4);

        cylinders.forEach(cyl => {
            state.cylinderPosition[cyl.positionIndex] = clampToGround ?
                adaptCylinderToGround(cyl, state.activeShapePoints[cyl.positionIndex]) :
                adaptCylinderToEntity(entity, cyl, state.activeShapePoints[cyl.positionIndex]);
        });
    },
    /**
     * Rotates the currently selected drawn entity.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
     */
    rotateDrawnEntity ({state, getters}) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId),
            angle = Cesium.Math.toRadians(entity.lastRotationAngle - state.drawRotation),
            center = Cesium.Cartographic.fromCartesian(getters.getCenterFromGeometry(entity));

        state.activeShapePoints.forEach((position, index) => {
            state.activeShapePoints[index] = calculateRotatedPointCoordinates({angle, center, position});
        });

        state.activeShapePoints.forEach((pos, index) => {
            const cyl = entities.values.filter(ent => ent.cylinder).find(e => e.positionIndex === index);

            cyl.position = entity.clampToGround ?
                adaptCylinderToGround(cyl, pos) :
                adaptCylinderToEntity(entity, cyl, pos);
        });
        entity.lastRotationAngle = state.drawRotation;
    },
    /**
     * Updates the dimensions of the currently selected rectangle.
     * @param {Object} context - The context of the Vuex module.
     * @param {Object} dimensions - The new dimensions of the rectangle.
     * @returns {void}
     */
    updateRectangleDimensions ({commit, getters, state}, dimensions) {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(state.currentModelId),
            cylinders = entities.values.filter(ent => ent.cylinder),
            position = getters.getCenterFromGeometry(entity),
            localFrame = Cesium.Transforms.eastNorthUpToFixedFrame(position),
            corners = [
                new Cesium.Cartesian3(-dimensions.width / 2, -dimensions.depth / 2, 0),
                new Cesium.Cartesian3(dimensions.width / 2, -dimensions.depth / 2, 0),
                new Cesium.Cartesian3(dimensions.width / 2, dimensions.depth / 2, 0),
                new Cesium.Cartesian3(-dimensions.width / 2, dimensions.depth / 2, 0)
            ],
            cornersRelative = corners.map(cr => Cesium.Matrix4.multiplyByPoint(localFrame, cr, new Cesium.Cartesian3()));

        commit("setActiveShapePoints", cornersRelative);

        cylinders.forEach(cyl => {
            state.cylinderPosition[cyl.positionIndex] = entity.clampToGround ?
                adaptCylinderToGround(cyl, state.activeShapePoints[cyl.positionIndex]) :
                adaptCylinderToEntity(entity, cyl, state.activeShapePoints[cyl.positionIndex]);
        });
    }
};

export default actions;
