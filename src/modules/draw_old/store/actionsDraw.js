import {Draw} from "ol/interaction.js";
import crs from "@masterportal/masterportalapi/src/crs";

import * as actionsDownload from "./actions/actionsDownload";
import {drawInteractionOnDrawEvent, handleDrawEvent} from "./actions/drawInteractionOnDrawEvent";
import * as setters from "./actions/settersDraw";
import * as withoutGUI from "./actions/withoutGUIDraw";

import circleCalculations from "../js/circleCalculations";
import {createDrawInteraction, createModifyInteraction, createModifyAttributesInteraction, createSelectInteraction} from "../js/createInteractions";
import createStyleModule from "../js/style/createStyle";
import {createSelectedFeatureTextStyle} from "../js/style/createSelectedFeatureTextStyle";
import createTooltipOverlay from "../js/style/createTooltipOverlay";
import drawTypeOptions from "./drawTypeOptions";
import getDrawTypeByGeometryType from "../js/getDrawTypeByGeometryType";
import postDrawEnd from "../js/postDrawEnd";

import stateDraw from "./stateDraw";
import main from "../js/main";

const initialState = JSON.parse(JSON.stringify(stateDraw)),
    actions = {
        ...actionsDownload,
        /**
         * Adds selected values from the state to the "drawState" of the given feature
         *
         * @param {ol/Feature} feature The OpenLayers feature to append to the current "drawState".
         * @returns {void}
         */
        addDrawStateToFeature ({getters}, feature) {
            if (!feature) {
                return;
            }
            const {styleSettings} = getters,
                // use clones to avoid side effects
                styleSettingsCopy = JSON.parse(JSON.stringify(styleSettings)),
                symbol = getters.symbol ? JSON.parse(JSON.stringify(getters.symbol)) : "",
                zIndex = JSON.parse(JSON.stringify(getters.zIndex)),
                imgPath = getters.imgPath ? JSON.parse(JSON.stringify(getters.imgPath)) : "",
                pointSize = JSON.parse(JSON.stringify(getters.pointSize));
            let drawType = JSON.parse(JSON.stringify(getters.drawType));

            if (getters.drawType.id === "drawDoubleCircle") {
                // the double circle should behave like a circle on modify
                drawType = {geometry: "Circle", id: "drawCircle"};
            }

            feature.set("masterportal_attributes", Object.assign(feature.get("masterportal_attributes") ?? {}, {"drawState": {
                strokeWidth: styleSettingsCopy.strokeWidth,
                opacity: styleSettingsCopy.opacity,
                opacityContour: styleSettingsCopy.opacityContour,
                font: styleSettingsCopy.font,
                fontSize: parseInt(styleSettingsCopy.fontSize, 10),
                text: styleSettingsCopy.text,
                circleMethod: styleSettingsCopy.circleMethod,
                circleRadius: styleSettingsCopy.circleRadius,
                circleOuterRadius: styleSettingsCopy.circleOuterRadius,
                drawType,
                symbol,
                zIndex,
                imgPath,
                pointSize,
                color: styleSettingsCopy.color,
                colorContour: styleSettingsCopy.colorContour,
                outerColorContour: styleSettingsCopy.outerColorContour
            }}), false);

        },
        /**
         * Adds an interaction to the current map instance.
         *
         * @param {module:ol/interaction/Interaction} interaction interaction with the map.
         * @returns {void}
         */
        addInteraction ({dispatch}, interaction) {
            dispatch("Maps/addInteraction", interaction, {root: true});
        },
        /**
         * Removes all features from the layer.
         *
         * @returns {void}
         */
        clearLayer ({dispatch}) {
            main.getApp().config.globalProperties.$layer.getSource().clear();
            dispatch("setDownloadFeatures");
        },
        /**
         * Clears the tooltip from the map.
         *
         * @param {module:ol/Overlay} tooltip The tooltip to be removed.
         * @returns {void}
         */
        clearTooltip ({rootState}, tooltip) {
            tooltip.getElement().parentNode.removeChild(tooltip.getElement());
            mapCollection.getMap(rootState.Maps.mode).un("pointermove", tooltip.get("mapPointerMoveEvent"));
            mapCollection.getMap(rootState.Maps.mode).removeOverlay(tooltip);
        },
        /**
         * Returns the center point of a Line or Polygon or a point itself.
         * If a targetprojection is given, the values are transformed.
         *
         * @param {Object} prm Parameter object.
         * @param {module:ol/Feature} prm.feature Line, Polygon or Point.
         * @param {String} prm.targetProjection Target projection if the projection differs from the map's projection.
         * @returns {module:ol/coordinate~Coordinate} Coordinates of the center point of the geometry.
         */
        createCenterPoint ({rootState}, {feature, targetProjection}) {
            let centerPoint,
                centerPointCoords = [];

            const featureType = feature.getGeometry().getType(),
                map = mapCollection.getMap(rootState.Maps.mode);

            if (featureType === "LineString") {
                if (targetProjection !== undefined) {
                    centerPointCoords = crs.transform(crs.getMapProjection(map), targetProjection, feature.getGeometry().getCoordinateAt(0.5));
                }
                else {
                    centerPointCoords = feature.getGeometry().getCoordinateAt(0.5);
                }
            }
            else if (featureType === "Point") {
                if (targetProjection !== undefined) {
                    centerPointCoords = crs.transform(crs.getMapProjection(map), targetProjection, feature.getGeometry().getCoordinates());
                }
                else {
                    centerPointCoords = feature.getGeometry().getCoordinates();
                }
            }
            else if (featureType === "Polygon") {
                if (targetProjection !== undefined) {
                    centerPoint = crs.transform(crs.getMapProjection(map), targetProjection, feature.getGeometry().getInteriorPoint().getCoordinates());
                }
                else {
                    centerPoint = feature.getGeometry().getInteriorPoint().getCoordinates();
                }
                centerPointCoords = centerPoint.slice(0, -1);
            }
            else if (featureType === "Circle") {
                if (targetProjection !== undefined) {
                    centerPointCoords = crs.transform(crs.getMapProjection(map), targetProjection, feature.getGeometry().getCenter());
                }
                else {
                    centerPointCoords = feature.getGeometry().getCenter();
                }
            }
            return centerPointCoords;
        },
        /**
         * Creates a draw interaction to add to the map.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.active Decides whether the draw interactions are active or not.
         * @param {Number} [payload.maxFeatures] Max amount of features to be added to the map.
         * @returns {void}
         */
        createDrawInteractionAndAddToMap ({state, commit, dispatch, getters}, {active, maxFeatures}) {
            const {styleSettings} = getters,
                drawInteraction = createDrawInteraction(state, styleSettings);

            if (state.selectInteractionModify?.getFeatures()?.getArray()?.length > 0) {
                state.selectInteractionModify.getFeatures().clear();
                commit("setSelectedFeature", null);
            }

            commit("setDrawInteraction", drawInteraction);
            dispatch("manipulateInteraction", {interaction: "draw", active: active});
            dispatch("createDrawInteractionListener", {isOuterCircle: false, drawInteraction: "", maxFeatures});
            dispatch("Maps/addInteraction", drawInteraction, {root: true});

            // NOTE: This leads to the creation of a second (the outer) circle instead of a MultiPolygon right now.
            if (state.drawType.id === "drawDoubleCircle") {
                const drawInteractionTwo = createDrawInteraction(state, styleSettings);

                commit("setDrawInteractionTwo", drawInteractionTwo);
                dispatch("manipulateInteraction", {interaction: "draw", active: active});
                dispatch("createDrawInteractionListener", {isOuterCircle: true, drawInteraction: "Two", maxFeatures});
                dispatch("Maps/addInteraction", drawInteractionTwo, {root: true});
            }
        },
        /**
         * Listener to change the entries for the next drawing.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.isOuterCircle Determines if the outer circle of a doubleCircle is supposed to be drawn.
         * @param {String} payload.drawInteraction Either an empty String or "Two" to identify for which drawInteraction this is used.
         * @param {Number} [payload.maxFeatures] Max amount of features to be added to the map.
         * @returns {void}
         */
        createDrawInteractionListener ({rootState, state, dispatch, getters, commit}, {isOuterCircle, drawInteraction, maxFeatures}) {
            const interaction = state["drawInteraction" + drawInteraction];
            let tooltip;

            interaction.on("drawstart", event => {
                event.feature.set("masterportal_attributes", Object.assign(event.feature.get("masterportal_attributes") ?? {}, {"isOuterCircle": isOuterCircle, "isVisible": true}));
                dispatch("drawInteractionOnDrawEvent", drawInteraction);

                if (!tooltip && state?.drawType?.id === "drawCircle" || state?.drawType?.id === "drawDoubleCircle") {
                    tooltip = createTooltipOverlay({getters, commit, dispatch});
                    mapCollection.getMap(rootState.Maps.mode).addOverlay(tooltip);
                    mapCollection.getMap(rootState.Maps.mode).on("pointermove", tooltip.get("mapPointerMoveEvent"));
                    event.feature.getGeometry().on("change", tooltip.get("featureChangeEvent"));
                }
            });
            if (maxFeatures && maxFeatures > 0) {
                interaction.on("drawstart", () => {
                    const featureCount = main.getApp().config.globalProperties.$layer.getSource().getFeatures().length;

                    if (featureCount > maxFeatures - 1) {
                        const alert = {
                            category: "error",
                            content: i18next.t("common:modules.draw_old.limitReached", {count: maxFeatures}),
                            displayClass: "error",
                            multipleAlert: true
                        };

                        dispatch("Alerting/addSingleAlert", alert, {root: true});
                        dispatch("deactivateDrawInteractions");
                        if (interaction) {
                            dispatch("removeInteraction", interaction);
                        }
                    }
                });
            }
            interaction.on("drawend", event => {
                dispatch("addDrawStateToFeature", event.feature);
                dispatch("uniqueID").then(id => {
                    event.feature.set("masterportal_attributes", Object.assign(event.feature.get("masterportal_attributes") ?? {}, {"styleId": id}));

                    if (tooltip) {
                        event.feature.getGeometry().un("change", tooltip.get("featureChangeEvent"));
                        dispatch("clearTooltip", tooltip);
                        tooltip = null;
                    }

                    dispatch("setDownloadFeatures");

                    // NOTE: This is only used for dipas/diplanung (08-2020): inputMap contains the map, drawing is cancelled and editing is started
                    if (typeof Config.inputMap !== "undefined" && Config.inputMap !== null) {
                        const {feature} = event,
                            {targetProjection} = Config.inputMap;

                        dispatch("cancelDrawWithoutGUI", {cursor: "auto"});
                        dispatch("editFeaturesWithoutGUI");

                        dispatch("createCenterPoint", {feature, targetProjection}).then(coordinates => {
                            dispatch("downloadFeaturesWithoutGUI", {prmObject: {targetProjection}, currentFeature: feature})
                                .then(geoJSON => postDrawEnd({type: "Point", coordinates}, geoJSON));
                        });
                    }
                });
            });
        },
        /**
         * Creates modify and select interaction.
         *
         * @param {Boolean} active Active setting.
         * @returns {void}
         */
        createModifyAttributesInteractionAndAddToMap ({commit, dispatch}, active) {
            const modifyInteraction = createModifyAttributesInteraction(main.getApp().config.globalProperties.$layer),
                selectInteractionModify = createSelectInteraction(main.getApp().config.globalProperties.$layer, 10);

            commit("setModifyAttributesInteraction", modifyInteraction);
            dispatch("manipulateInteraction", {interaction: "modifyAttributes", active: active});
            dispatch("createModifyAttributesInteractionListener");
            dispatch("Maps/addInteraction", modifyInteraction, {root: true});

            commit("setSelectInteractionModifyAttributes", selectInteractionModify);
            dispatch("createSelectInteractionModifyAttributesListener");
            dispatch("Maps/addInteraction", selectInteractionModify, {root: true});
        },
        /**
         * Creates modify attributes interaction listener.
         *
         * @returns {void}
         */
        createModifyAttributesInteractionListener ({rootState, state, dispatch, commit, getters}) {
            let tooltip,
                changeInProgress = false;

            state.modifyAttributesInteraction.on("modifystart", event => {
                if (state.selectedFeature) {
                    commit("setSelectedFeature", null);
                }

                event.features.getArray().forEach(feature => {
                    let center = null;

                    if (typeof feature.getGeometry().getCenter === "function") {
                        center = JSON.stringify(feature.getGeometry().getCenter());
                    }
                    feature.getGeometry().once("change", async () => {
                        if (changeInProgress) {
                            return;
                        }
                        changeInProgress = true;

                        if (!state.selectedFeature || state.selectedFeature.ol_uid !== feature.ol_uid) {
                            await dispatch("saveAsCurrentFeatureAndApplyStyleSettings", feature);

                            if (!tooltip && (state.drawType.id === "drawCircle" || state.drawType.id === "drawDoubleCircle")) {
                                if (center === JSON.stringify(feature.getGeometry().getCenter())) {
                                    tooltip = createTooltipOverlay({getters, commit, dispatch});
                                    mapCollection.getMap(rootState.Maps.mode).addOverlay(tooltip);
                                    mapCollection.getMap(rootState.Maps.mode).on("pointermove", tooltip.get("mapPointerMoveEvent"));
                                    state.selectedFeature.getGeometry().on("change", tooltip.get("featureChangeEvent"));
                                }
                            }
                        }
                    });
                });
            });
            state.modifyAttributesInteraction.on("modifyend", event => {

                changeInProgress = false;
                if (tooltip) {
                    state.selectedFeature.getGeometry().un("change", tooltip.get("featureChangeEvent"));
                    dispatch("clearTooltip", tooltip);
                    tooltip = null;
                }

                dispatch("setDownloadFeatures");

                // NOTE: This is only used for dipas/diplanung (08-2020): inputMap contains the map
                if (typeof Config.inputMap !== "undefined" && Config.inputMap !== null) {
                    dispatch("createCenterPoint", {feature: event.features.getArray()[0], targetProjection: Config.inputMap.targetProjection}).then(centerPointCoords => {
                        dispatch("downloadFeaturesWithoutGUI", {prmObject: {"targetProjection": Config.inputMap.targetProjection}, currentFeature: event.feature})
                            .then(geoJSON => postDrawEnd({type: "Point", coordinates: centerPointCoords}, geoJSON));
                    });
                }
            });
        },
        /**
         * Creates a modify interaction and adds it to the map.
         *
         * @param {Boolean} active Decides whether the modify interaction is active or not.
         * @returns {void}
         */
        createModifyInteractionAndAddToMap ({commit, dispatch}, active) {
            const modifyInteraction = createModifyInteraction(main.getApp().config.globalProperties.$layer),
                selectInteractionModify = createSelectInteraction(main.getApp().config.globalProperties.$layer, 10);

            commit("setModifyInteraction", modifyInteraction);
            dispatch("manipulateInteraction", {interaction: "modify", active: active});
            dispatch("createModifyInteractionListener");
            dispatch("Maps/addInteraction", modifyInteraction, {root: true});

            commit("setSelectInteractionModify", selectInteractionModify);
            dispatch("createSelectInteractionModifyListener");
            dispatch("Maps/addInteraction", selectInteractionModify, {root: true});
        },
        /**
         * Listener to change the features through the modify interaction.
         * NOTE: For text only the position can be changed. This can be done by clicking at highlighted (on-hover) bottom-left corner of the text.
         *
         * @returns {void}
         */
        createModifyInteractionListener ({rootState, state, dispatch, commit, getters}) {
            let tooltip,
                changeInProgress = false;

            state.modifyInteraction.on("modifystart", event => {
                if (state.selectedFeature) {
                    // set selectedFeature to null to avoid change of last selected feature
                    commit("setSelectedFeature", null);
                }

                event.features.getArray().forEach(feature => {
                    let center = null;

                    if (typeof feature.getGeometry().getCenter === "function") {
                        center = JSON.stringify(feature.getGeometry().getCenter());
                    }
                    feature.getGeometry().once("change", async () => {
                        if (changeInProgress) {
                            return;
                        }
                        changeInProgress = true;

                        if (!state.selectedFeature || state.selectedFeature.ol_uid !== feature.ol_uid) {
                            await dispatch("saveAsCurrentFeatureAndApplyStyleSettings", feature);

                            if (!tooltip && (state.drawType.id === "drawCircle" || state.drawType.id === "drawDoubleCircle")) {
                                if (center === JSON.stringify(feature.getGeometry().getCenter())) {
                                    tooltip = createTooltipOverlay({getters, commit, dispatch});
                                    mapCollection.getMap(rootState.Maps.mode).addOverlay(tooltip);
                                    mapCollection.getMap(rootState.Maps.mode).on("pointermove", tooltip.get("mapPointerMoveEvent"));
                                    state.selectedFeature.getGeometry().on("change", tooltip.get("featureChangeEvent"));
                                }
                            }
                        }
                    });
                });
            });
            state.modifyInteraction.on("modifyend", event => {

                changeInProgress = false;
                if (tooltip) {
                    state.selectedFeature.getGeometry().un("change", tooltip.get("featureChangeEvent"));
                    dispatch("clearTooltip", tooltip);
                    tooltip = null;
                }

                dispatch("setDownloadFeatures");

                // NOTE: This is only used for dipas/diplanung (08-2020): inputMap contains the map
                if (typeof Config.inputMap !== "undefined" && Config.inputMap !== null) {
                    dispatch("createCenterPoint", {feature: event.features.getArray()[0], targetProjection: Config.inputMap.targetProjection}).then(centerPointCoords => {
                        dispatch("downloadFeaturesWithoutGUI", {prmObject: {"targetProjection": Config.inputMap.targetProjection}, currentFeature: event.feature})
                            .then(geoJSON => postDrawEnd({type: "Point", coordinates: centerPointCoords}, geoJSON));
                    });
                }
            });
        },
        /**
         * Creates select interaction modify attributes listener.
         *
         * @returns {void}
         */
        createSelectInteractionModifyAttributesListener ({state, commit, dispatch}) {
            state.selectInteractionModifyAttributes.on("select", event => {
                if (state.currentInteraction !== "modifyAttributes" || !event.selected.length) {
                    state.selectInteractionModifyAttributes.getFeatures().clear();
                    if (state.selectedFeature) {
                        commit("setSelectedFeature", null);
                    }
                    return;
                }

                const feature = event.selected[event.selected.length - 1];

                dispatch("saveAsCurrentFeatureAndApplyStyleSettings", feature);
                // ui reason: this is the short period of time the ol default mark of select interaction is seen at mouse click event of a feature
                setTimeout(() => {
                    state.selectInteractionModifyAttributes.getFeatures().clear();
                    const textStyle = createSelectedFeatureTextStyle(state.selectedFeature);

                    commit("setOldStyle", state.selectedFeature.getStyle());
                    if (typeof state.selectedFeature?.getStyle() === "function") {
                        let style = state.selectedFeature.getStyle()(state.selectedFeature);

                        if (Array.isArray(style) && style.length > 0) {
                            style = style[0];
                        }

                        if (!style?.getText()?.getText()) {
                            style.setText(textStyle);
                            state.selectedFeature.setStyle(style);
                        }
                    }
                    else if (typeof state.selectedFeature.getStyle() === "object") {
                        const style = state.selectedFeature.getStyle();

                        if (style) {
                            style.setText(textStyle);
                            state.selectedFeature.setStyle(style);
                        }
                    }
                }, 300);
            });
        },
        /**
         * Listener to select (for modify) the features through ol select interaction
         *
         * @returns {void}
         */
        createSelectInteractionModifyListener ({state, commit, dispatch}) {
            state.selectInteractionModify.on("select", event => {
                if (state.currentInteraction !== "modify" || !event.selected.length) {
                    if (state.drawType.id === "writeText" || state.drawType.id === "drawSymbol") {
                        dispatch("updateDrawInteraction");
                    }
                    // reset interaction - if not reset, the ol default would be used, this shouldn't be what we want at this point
                    state.selectInteractionModify.getFeatures().clear();
                    if (state.selectedFeature) {
                        commit("setSelectedFeature", null);
                    }
                    return;
                }

                // the last selected feature is always on top
                const feature = event.selected[event.selected.length - 1];

                dispatch("saveAsCurrentFeatureAndApplyStyleSettings", feature);
            });
        },
        /**
         * Creates a select interaction (for deleting features) and adds it to the map.
         * NOTE: Deletion of text can be done by clicking at the highlighted (on-hover) bottom-left corner of the text.
         *
         * @param {Boolean} active Decides whether the select interaction is active or not.
         * @returns {void}
         */
        createSelectInteractionAndAddToMap ({commit, dispatch}, active) {
            const selectInteraction = createSelectInteraction(main.getApp().config.globalProperties.$layer);

            commit("setSelectInteraction", selectInteraction);
            dispatch("manipulateInteraction", {interaction: "delete", active: active});
            dispatch("createSelectInteractionListener");
            dispatch("Maps/addInteraction", selectInteraction, {root: true});
        },
        /**
         * Listener to select (for deletion) the features through the select interaction.
         *
         * @returns {void}
         */
        createSelectInteractionListener ({state, dispatch}) {
            state.selectInteraction.on("select", event => {
                // remove feature from source
                main.getApp().config.globalProperties.$layer.getSource().removeFeature(event.selected[0]);
                // remove feature from interaction
                state.selectInteraction.getFeatures().clear();
                // remove feature from array of downloadable features
                dispatch("setDownloadFeatures");
            });
        },
        /**
         * Deactivates all draw interactions of the map and add them to the state.
         * NOTE: This is mainly used with the RemoteInterface because otherwise not all interactions are removed.
         *
         * @returns {void}
         */
        deactivateDrawInteractions ({state, rootState}) {
            mapCollection.getMap(rootState.Maps.mode).getInteractions().forEach(int => {
                if (int instanceof Draw) {
                    if (state.deactivatedDrawInteractions.indexOf(int) === -1) {
                        state.deactivatedDrawInteractions.push(int);
                    }
                }
            });
        },
        drawInteractionOnDrawEvent,
        handleDrawEvent,
        /**
         * Activates or deactivates the given Interactions based on the given parameters.
         *
         * @param {Object} payload payload object.
         * @param {String} payload.interaction name of the interaction to be manipulated.
         * @param {Boolean} payload.active Value to set the drawInteractions to.
         * @return {void}
         */
        manipulateInteraction ({state}, {interaction, active}) {
            if (interaction === "draw") {
                if (typeof state.drawInteraction !== "undefined" && state.drawInteraction !== null) {
                    state.drawInteraction.setActive(active);
                }
                if (typeof state.drawInteractionTwo !== "undefined" && state.drawInteractionTwo !== null) {
                    state.drawInteractionTwo.setActive(active);
                }
            }
            else if (interaction === "modify") {
                if (typeof state.modifyInteraction !== "undefined" && state.modifyInteraction !== null) {
                    state.modifyInteraction.setActive(active);
                }
                if (typeof state.selectInteractionModify !== "undefined" && state.selectInteractionModify !== null) {
                    state.selectInteractionModify.setActive(active);
                }
            }
            else if (interaction === "modifyAttributes") {
                if (typeof state.modifyAttributesInteraction !== "undefined" && state.modifyAttributesInteraction !== null) {
                    state.modifyInteraction.setActive(active);
                }
                if (typeof state.selectInteractionModifyAttributes !== "undefined" && state.selectInteractionModifyAttributes !== null) {
                    state.selectInteractionModifyAttributes.setActive(active);
                }
            }
            else if (interaction === "delete") {
                if (typeof state.selectInteraction !== "undefined" && state.selectInteraction !== null) {
                    state.selectInteraction.setActive(active);
                }
            }
        },
        /**
         * Restores the last deleted element of the feature array of the layer.
         *
         * @returns {void}
         */
        redoLastStep ({state, commit, dispatch}) {
            const redoArray = state.redoArray,
                featureToRestore = redoArray[redoArray.length - 1];

            if (typeof featureToRestore !== "undefined" && featureToRestore !== null) {
                const featureId = state.fId;

                featureToRestore.setId(featureId);
                commit("setFId", state.fId + 1);
                main.getApp().config.globalProperties.$layer.getSource().addFeature(featureToRestore);
                main.getApp().config.globalProperties.$layer.getSource().getFeatureById(featureId).setStyle(featureToRestore.getStyle());
                dispatch("updateRedoArray", {remove: true});
                dispatch("updateUndoArray", {remove: false, feature: featureToRestore});
            }
        },
        /**
         * Removes the given interaction from the current map instance.
         *
         * @param {module:ol/interaction/Interaction} interaction interaction with the map.
         * @returns {void}
         */
        removeInteraction ({dispatch}, interaction) {
            dispatch("Maps/removeInteraction", interaction, {root: true});
        },
        /**
         * Resets the Draw Tool.
         *
         * @returns {void}
         */
        resetModule ({state, commit, dispatch, getters}) {
            dispatch("toggleInteraction", "draw");
            dispatch("manipulateInteraction", {interaction: "draw", active: false});

            if (state.drawInteraction) {
                dispatch("removeInteraction", state.drawInteraction);
            }
            if (state.drawInteractionTwo) {
                dispatch("removeInteraction", state.drawInteractionTwo);
            }
            if (state.modifyInteraction) {
                dispatch("removeInteraction", state.modifyInteraction);
            }
            if (state.selectInteractionModify) {
                dispatch("removeInteraction", state.selectInteractionModify);
            }
            if (state.selectInteraction) {
                dispatch("removeInteraction", state.selectInteraction);
            }
            if (state.modifyAttributesInteraction) {
                dispatch("removeInteraction", state.modifyAttributesInteraction);
            }
            if (state.selectInteractionModifyAttributes) {
                dispatch("removeInteraction", state.selectInteractionModifyAttributes);
            }

            commit("setSelectedFeature", null);
            commit("setDrawType", initialState.drawType);
            commit("setFreeHand", initialState.freeHand);
            commit("setPointSize", initialState.pointSize);
            commit("setSymbol", getters.iconList[0]);
            commit("setWithoutGUI", initialState.withoutGUI);

            commit("setDownloadDataString", initialState.download.dataString);
            commit("setDownloadFeatures", initialState.download.features);
            commit("setDownloadFileName", initialState.download.fileName);
            commit("setDownloadSelectedFormat", initialState.download.selectedFormat);

            if (state.addFeatureListener.listener) {
                main.getApp().config.globalProperties.$layer.getSource().un("addFeature", state.addFeatureListener.listener);
            }
        },
        /**
         * Saves the given feature as currentFeature and applies the styleSettings
         *
         * @param {ol/Feature} feature The OpenLayers feature to append to  current "drawState".
         * @returns {void}
         */
        saveAsCurrentFeatureAndApplyStyleSettings: async ({commit, dispatch, getters}, feature) => {
            const {styleSettings} = getters;
            let drawState = feature.get("masterportal_attributes").drawState;

            if (typeof drawState === "undefined") {
                // setDrawType changes visibility of all select- and input-boxes
                commit("setDrawType", getDrawTypeByGeometryType(feature.getGeometry().getType(), drawTypeOptions));

                // use current state as standard for extern features (e.g. kml or gpx import)
                await dispatch("addDrawStateToFeature", feature);
                drawState = feature.get("masterportal_attributes").drawState;
            }
            else {
                // setDrawType changes visibility of all select- and input-boxes
                let drawType = feature.get("masterportal_attributes").drawState.drawType;

                if (!drawType && drawState.fontSize) {
                    drawType = {geometry: "Point", id: "writeText"};
                    commit("setDrawType", drawType);
                    drawState = Object.assign(getters.styleSettings, drawState, {drawType: drawType});
                    feature.set("masterportal_attributes", Object.assign(feature.get("masterportal_attributes") ?? {}, {"drawState": drawState}));
                }
                else {
                    commit("setDrawType", drawType);
                }
            }
            commit("setSelectedFeature", feature);

            if (feature.getGeometry().getType() === "LineString" && styleSettings.colorContour === undefined) {
                try {
                    const styles = feature.getStyle()(feature);

                    if (styles && styles.length > 0) {
                        const style = styles[styles.length - 1],
                            color = style.getStroke().getColor();

                        styleSettings.colorContour = color;
                        styleSettings.opacityContour = color.length === 4 ? color[3] : 1;
                        styleSettings.strokeWidth = style.getStroke().getWidth();
                    }
                }
                catch (exc) {
                    console.warn(exc.message);
                }
            }

            Object.assign(styleSettings,
                drawState);

            commit("setSymbol", feature.get("masterportal_attributes").drawState.symbol);

            setters.setStyleSettings({commit, getters}, styleSettings);
        },
        ...setters,
        /**
         * Enables the given interaction and disables the others.
         *
         * @param {String} interaction The interaction to be enabled.
         * @returns {void}
         */
        toggleInteraction ({getters, commit, dispatch}, interaction) {
            commit("setFormerInteraction", getters.currentInteraction);
            commit("setCurrentInteraction", interaction);
            commit("setSelectedFeature", null);
            if (interaction === "draw") {
                dispatch("manipulateInteraction", {interaction: "draw", active: true});
                dispatch("manipulateInteraction", {interaction: "modify", active: false});
                dispatch("manipulateInteraction", {interaction: "modifyAttributes", active: false});
                dispatch("manipulateInteraction", {interaction: "delete", active: false});
                dispatch("updateDrawInteraction");
            }
            else if (interaction === "modify") {
                dispatch("manipulateInteraction", {interaction: "draw", active: false});
                dispatch("manipulateInteraction", {interaction: "modify", active: true});
                dispatch("manipulateInteraction", {interaction: "modifyAttributes", active: false});
                dispatch("manipulateInteraction", {interaction: "delete", active: false});
            }
            else if (interaction === "modifyAttributes") {
                dispatch("manipulateInteraction", {interaction: "draw", active: false});
                dispatch("manipulateInteraction", {interaction: "modify", active: false});
                dispatch("manipulateInteraction", {interaction: "modifyAttributes", active: true});
                dispatch("manipulateInteraction", {interaction: "delete", active: false});
            }
            else if (interaction === "delete") {
                dispatch("manipulateInteraction", {interaction: "draw", active: false});
                dispatch("manipulateInteraction", {interaction: "modify", active: false});
                dispatch("manipulateInteraction", {interaction: "modifyAttributes", active: false});
                dispatch("manipulateInteraction", {interaction: "delete", active: true});
            }
            else if (interaction === "none") {
                dispatch("manipulateInteraction", {interaction: "draw", active: false});
                dispatch("manipulateInteraction", {interaction: "modify", active: false});
                dispatch("manipulateInteraction", {interaction: "modifyAttributes", active: false});
                dispatch("manipulateInteraction", {interaction: "delete", active: false});
            }
        },
        /**
         * Deletes the last element in the feature array of the layer.
         *
         * @returns {void}
         */
        undoLastStep ({state, dispatch}) {
            /**
             * NOTE: main.getApp().config.globalProperties.$layer.getSource().getFeatures() doesn't return the features in the order they were added.
             * Therefore it is necessary to keep an array with the features in the right order.
             */
            const features = state.undoArray,
                featureToRemove = features[features.length - 1];

            if (typeof featureToRemove !== "undefined" && featureToRemove !== null) {
                dispatch("updateRedoArray", {remove: false, feature: featureToRemove});
                dispatch("updateUndoArray", {remove: true});
                main.getApp().config.globalProperties.$layer.getSource().removeFeature(featureToRemove);
            }
        },
        /**
         * Creates and returns a unique ID.
         * If given, it starts with a prefix.
         *
         * @param {String} [prefix] Prefix for the ID.
         * @returns {String} A unique ID.
         */
        uniqueID ({state, commit}, prefix) {
            const id = state.idCounter + 1;

            commit("setIdCounter", id);
            return prefix ? prefix + id : id.toString(10);
        },
        /**
         * Updates the selected feature during modify for circles
         *
         * @param {Number} radius The radius of the circle.
         * @returns {void}
         */
        updateCircleRadiusDuringModify ({state, rootState, dispatch}, radius) {
            if (state.currentInteraction === "modify" && state.selectedFeature !== null && (state.drawType.id === "drawCircle" || state.drawType.id === "drawDoubleCircle")) {
                const feature = state.selectedFeature,
                    circleCenter = feature.getGeometry().getCenter();

                circleCalculations.calculateCircle({feature}, circleCenter, radius, mapCollection.getMap(rootState.Maps.mode));

                dispatch("addDrawStateToFeature", state.selectedFeature);
            }
        },
        /**
         * Updates the drawInteractions on the map and creates a new one.
         *
         * @returns {void}
         */
        updateDrawInteraction ({state, commit, getters, dispatch}) {
            if (state.currentInteraction === "modify" && state.selectedFeature !== null) {
                const {styleSettings} = getters;

                state.selectedFeature.setStyle(function (feature) {
                    if (feature.get("masterportal_attributes").isVisible === undefined || feature.get("masterportal_attributes").isVisible) {
                        return createStyleModule.createStyle(feature.get("masterportal_attributes").drawState, styleSettings);
                    }
                    return undefined;
                });
                dispatch("addDrawStateToFeature", state.selectedFeature);
                return;
            }

            dispatch("removeInteraction", state.drawInteraction);
            commit("setDrawInteraction", null);
            if (typeof state.drawInteractionTwo !== "undefined" && state.drawInteractionTwo !== null) {
                if (state.drawInteractionTwo) {
                    dispatch("removeInteraction", state.drawInteractionTwo);
                }
                commit("setDrawInteractionTwo", null);
            }
            dispatch("createDrawInteractionAndAddToMap", {active: true});
        },
        /**
         * Adds or removes one element from the redoArray.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.remove Remove one feature from the array if true.
         * @param {Object} [payload.feature] feature to be added to the array, if given.
         * @returns {void}
         */
        updateRedoArray: ({state, commit}, {remove, feature}) => {
            const redoArray = state.redoArray;

            if (remove) {
                redoArray.pop();
            }
            else {
                redoArray.push(feature);
            }
            commit("setRedoArray", redoArray);
        },
        /**
         * Sets drawLayervisible and let layer and interactions react in a logic way.
         *
         * @param {Object} context Actions context object.
         * @param {Boolean} value The value to set.
         * @returns {void}
         */
        updateDrawLayerVisible: ({getters, commit, dispatch}, value) => {
            if (typeof getters?.layer?.setVisible === "function") {
                getters.layer.setVisible(value);
            }

            if (value) {
                if (getters.formerInteraction) {
                    dispatch("toggleInteraction", getters.formerInteraction);
                }
            }
            else {
                commit("setFormerInteraction", getters.currentInteraction);
                dispatch("toggleInteraction", "none");
            }
            commit("setDrawLayerVisible", value);
        },
        /**
         * Adds or removes one element from the undoArray.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.remove Remove one feature from the array if true.
         * @param {Object} [payload.feature] feature to be added to the array, if given.
         * @returns {void}
         */
        updateUndoArray: ({state, commit}, {remove, feature}) => {
            const undoArray = state.undoArray;

            if (remove) {
                undoArray.pop();
            }
            else {
                undoArray.push(feature);
            }
            commit("setUndoArray", undoArray);
        },
        ...withoutGUI
    };

export default actions;
