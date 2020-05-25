import {Select, Modify, Draw} from "ol/interaction.js";

import {createStyle} from "./actions/style/createStyle";
import {drawInteractionOnDrawEvent} from "./actions/drawInteractionOnDrawEvent";

import * as setter from "./actions/setterDraw";
import * as withoutGUI from "./actions/withoutGUIDraw";

// NOTE: The Update and the Redo interactions of the Draw Tool are and weren't compatible with the delete and modify interaction.

const actions = {
    /**
     * Adds an interaction to the current map instance.
     *
     * @param {Object} context actions context object.
     * @param {ol/interaction/Interaction} interaction interaction with the map.
     * @returns {void}
     */
    addInteraction ({rootState}, interaction) {
        rootState.Map.map.addInteraction(interaction);
    },
    /**
     * Removes all features from the layer.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    clearLayer ({state}) {
        state.layer.getSource().clear();
    },
    /**
     * Creates a draw interaction to draw features on the map.
     *
     * @param {Object} context actions context object.
     * @returns {ol/interaction/Draw} draw interaction
     */
    createDrawInteraction ({state}) {
        return new Draw({
            source: state.layer.getSource(),
            type: state.drawType.geometry,
            style: createStyle(state),
            freehand: state.freeHand
        });
    },
    /**
     * Creates a draw interaction to add to the map.
     *
     * @param {Object} context actions context object.
     * @param {Boolean} actives Decides whether the draw interations are active or not.
     * @param {Integer} [maxFeatures] Max amount of features to be added to the map.
     * @returns {void}
     */
    createDrawInteractionAndAddToMap ({state, commit, dispatch}, {active, maxFeatures}) {
        dispatch("createDrawInteraction").then(drawInteraction => {
            commit("setDrawInteraction", drawInteraction);
            dispatch("manipulateInteraction", "draw", active);
            dispatch("createDrawInteractionListener", {doubleCircle: false, drawInteraction: "", maxFeatures: maxFeatures});
            dispatch("addInteraction", drawInteraction);
        });

        if (state.drawType.id === "drawDoubleCircle") {
            dispatch("createDrawInteraction").then(drawInteractionTwo => {
                commit("setDrawInteractionTwo", drawInteractionTwo);
                dispatch("manipulateInteraction", "draw", true);
                dispatch("createDrawInteractionListener", {doubleCircle: true, drawInteraction: "Two", maxFeatures: maxFeatures});
                dispatch("addInteraction", drawInteractionTwo);
            });
        }
    },
    /**
     * Listener to change the entries for the next drawing.
     *
     * @param {Object} context actions context object.
     * @param {Object} payload payload object.
     * @param {Boolean} payload.doubleCircle Determines if a doubleCircle is supposed to be drawn.
     * @param {String} payload.drawInteraction Either an empty String or "Two" to identify for which drawInteraction this is used.
     * @param {Integer} [payload.maxFeatures] Max amount of features to be added to the map.
     * @returns {void}
     */
    createDrawInteractionListener ({state, dispatch}, {doubleCircle, drawInteraction, maxFeatures}) {
        const interaction = state["drawInteraction" + drawInteraction];
        let geoJSON;

        interaction.on("drawend", function (event) {
            event.feature.set("styleId", dispatch("uniqueID"));

            if (typeof Config.inputMap !== "undefined") {
                dispatch("cancelDrawWithoutGUI");
                dispatch("editFeaturesWithoutGUI");

                geoJSON = dispatch("downloadFeaturesWithoutGUI", {prmObject: {"targetProjection": Config.inputMap.targetprojection}, currentFeature: event.feature});
                Radio.trigger("RemoteInterface", "postMessage", {"drawEnd": geoJSON});
            }
        });
        interaction.on("drawstart", function () {
            dispatch("drawInteractionOnDrawEvent", {drawInteraction, doubleCircle});
        });

        if (maxFeatures && maxFeatures > 0) {
            interaction.on("drawstart", function () {
                const featureCount = state.layer.getSource().getFeatures().length;

                if (featureCount > maxFeatures - 1) {
                    Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.draw.limitReached", {count: maxFeatures}));
                    dispatch("deactivateDrawInteraction");
                }
            });
        }
    },
    /**
     * Creates a modify interaction and returns it.
     *
     * @param {Object} context actions context object.
     * @returns {module:ol/interaction/Modify} The modify interaction.
     */
    createModifyInteraction ({state}) {
        return new Modify({
            source: state.layer.getSource()
        });
    },
    /**
     * Creates a modify interaction and adds it to the map.
     *
     * @param {Object} context actions context object.
     * @param {Boolean} active Decides whether the modify interaction is active or not.
     * @returns {void}
     */
    createModifyInteractionAndAddToMap ({commit, dispatch}, active) {
        dispatch("createModifyInteraction").then(modifyInteraction => {
            commit("setModifyInteraction", modifyInteraction);
            dispatch("manipulateInteraction", {interaction: "modify", active: active});
            dispatch("createModifyInteractionListener");
            dispatch("addInteraction", modifyInteraction);
        });
    },
    /**
     * Listener to change the features through the modify interaction.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createModifyInteractionListener ({state, dispatch}) {
        state.modifyInteraction.on("modifyend", event => {
            let geoJSON;

            if (typeof Config.inputMap !== "undefined") {
                geoJSON = dispatch("downloadFeaturesWithoutGUI", {prmObject: {"targetProjection": Config.inputMap.targetProjection}, currentFeature: event.feature});
                Radio.trigger("RemoteInterface", "postMessage", {"drawEnd": geoJSON});
            }
        });
    },
    /**
     * Creates a select interaction (for deleting features) and adds it to the map.
     *
     * @param {Object} context actions context object.
     * @param {Boolean} active Decides whether the select interaction is active or not.
     * @returns {void}
     */
    createSelectInteractionAndAddToMap ({commit, dispatch}, active) {
        dispatch("createSelectInteraction").then(selectInteraction => {
            commit("setSelectInteraction", selectInteraction);
            dispatch("manipulateInteraction", {interaction: "delete", active: active});
            dispatch("createSelectInteractionListener");
            dispatch("addInteraction", selectInteraction);
        });
    },
    /**
     * Creates a select interaction (for deleting features) and returns it.
     *
     * @param {Object} context actions context object.
     * @returns {module:ol/interaction/Select} The select interaction.
     */
    createSelectInteraction ({state}) {
        return new Select({
            layers: [state.layer]
        });
    },
    /**
     * Listener to select (for deletion) the features through the select interaction.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createSelectInteractionListener ({state}) {
        state.selectInteraction.on("select", event => {
            // remove feature from source
            state.layer.getSource().removeFeature(event.selected[0]);
            // remove feature from interaction
            state.selectInteraction.getFeatures().clear();
        });
    },
    /**
     * Deactivates the draw interaction if defined.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    deactivateDrawInteraction ({state}) {
        if (state.drawInteraction !== null) {
            state.drawInteraction.setActive(false);
        }
        if (state.drawInteractionTwo !== null) {
            state.drawInteractionTwo.setActive(false);
        }
    },
    drawInteractionOnDrawEvent,
    /**
     * Activates or deactivates the given Interactions based on the given parameters.
     *
     * @param {Object} context actions context object.
     * @param {String} payload.interaction name of the interaction to be manipulated.
     * @param {Boolean} payload.active Value to set the drawInteractions to.
     * @return {void}
     */
    manipulateInteraction ({state}, {interaction, active}) {
        if (interaction === "draw") {
            if (state.drawInteraction !== null) {
                state.drawInteraction.setActive(active);
            }
            if (state.drawInteractionTwo !== null) {
                state.drawInteractionTwo.setActive(active);
            }
        }
        else if (interaction === "modify") {
            if (state.modifyInteraction) {
                state.modifyInteraction.setActive(active);
                // TODO: putGlyphToCursor glyphicon glyphicon-pencil (bei deactivate) glyphicon glyphicon-wrench (bei activate)
            }
        }
        else if (interaction === "delete") {
            if (state.selectInteraction) {
                state.selectInteraction.setActive(active);
                // TODO: putGlyphToCursor glyphicon glyphicon-pencil (bei deactivate) glyphicon glyphicon-trash (bei activate)
            }
        }
    },
    /**
     * Restores the last deleted element of the feature array of the layer.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    redoLastStep ({state, commit, dispatch}) {
        const redoArray = state.redoArray,
            featureToRestore = redoArray[redoArray.length - 1];

        if (featureToRestore) {
            const featureId = state.fId;

            featureToRestore.setId(featureId);
            commit("setFId", state.fId + 1);
            state.layer.getSource().addFeature(featureToRestore);
            state.layer.getSource().getFeatureById(featureId).setStyle(featureToRestore.getStyle());
            dispatch("updateRedoArray", {remove: true});
        }
    },
    /**
     * Removes the given interaction from the current map instance.
     *
     * @param {Object} context actions context object.
     * @param {ol/interaction/Interaction} interaction interaction with the map
     * @returns {void}
     */
    removeInteraction ({rootState}, interaction) {
        rootState.Map.map.removeInteraction(interaction);
    },
    /**
     * Resets the Draw Tool.
     * TODO: In the Backbone Version the changeable values are also reseted to default --> Needed?
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    resetModule ({dispatch}) {
        dispatch("deactivateDrawInteraction");
        dispatch("deactivateModifyInteraction");
        dispatch("deactivateSelectInteraction");
    },
    ...setter,
    /**
     * Starts the Download Tool for the drawn features.
     * NOTE: Draw Tool is not hidden.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    startDownloadTool ({state}) {
        const features = state.layer.getSource().getFeatures();

        Radio.trigger("Download", "start", {
            features: features,
            formats: ["KML", "GEOJSON", "GPX"]
        });
    },
    /**
     * Enables the given interaction and disables the others.
     *
     * @param {Object} context actions context object.
     * @param {String} interaction The interaction to be enabled.
     * @returns {void}
     */
    toggleInteraction ({commit, dispatch}, interaction) {
        if (interaction === "draw") {
            commit("setCurrentInteraction", interaction);
            dispatch("manipulateInteraction", {interaction: "draw", active: true});
            dispatch("manipulateInteraction", {interaction: "modify", active: false});
            dispatch("manipulateInteraction", {interaction: "delete", active: false});
        }
        else if (interaction === "modify") {
            commit("setCurrentInteraction", interaction);
            dispatch("manipulateInteraction", {interaction: "draw", active: false});
            dispatch("manipulateInteraction", {interaction: "modify", active: true});
            dispatch("manipulateInteraction", {interaction: "delete", active: false});
        }
        else if (interaction === "delete") {
            commit("setCurrentInteraction", interaction);
            dispatch("manipulateInteraction", {interaction: "draw", active: false});
            dispatch("manipulateInteraction", {interaction: "modify", active: false});
            dispatch("manipulateInteraction", {interaction: "delete", active: true});
        }
    },
    /**
     * Deletes the last element in the feature array of the layer.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    undoLastStep ({state, dispatch}) {
        const features = state.layer.getSource().getFeatures(),
            featureToRemove = features[features.length - 1];

        if (featureToRemove) {
            dispatch("updateRedoArray", {remove: false, feature: featureToRemove});
            state.layer.getSource().removeFeature(featureToRemove);
        }
    },
    /**
     * Creates and returns a unique ID.
     * If given, it starts with a prefix.
     *
     * @param {Object} context actions context object.
     * @param {String} [prefix] Prefix for the ID.
     * @returns {String} A unique ID.
     */
    uniqueID ({state, commit}, prefix) {
        const id = state.idCounter + 1;

        commit("setIdCounter", id);
        return prefix ? prefix + id : id;
    },
    /**
     * Updates the drawInteractions on the map and creates a new one.
     *
     * @param {Object} context actions context object.
     * @returns {void}
     */
    updateDrawInteraction ({state, commit, dispatch}) {
        dispatch("removeInteraction", state.drawInteraction);
        commit("setDrawInteraction", null);
        if (state.drawInteractionTwo) {
            dispatch("removeInteraction", state.drawInteractionTwo);
            commit("setDrawInteractionTwo", null);
        }
        dispatch("createDrawInteractionAndAddToMap", {active: true});
    },
    /**
     * Adds or removes one element from the redoArray.
     *
     * @param {Object} context actions context object.
     * @param {Object} payload payload object.
     * @param {Boolean} payload.remove Remove one feature from the array if true.
     * @param {Object} [payload.feature] feature to be added to the array, if given.
     * @return {void}
     */
    updateRedoArray: function ({state, commit}, {remove, feature}) {
        const redoArray = state.redoArray;

        if (remove) {
            redoArray.pop();
        }
        else {
            redoArray.push(feature);
        }
        commit("setRedoArray", redoArray);
    },
    ...withoutGUI
};

export default actions;
