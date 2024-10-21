import createStyleModule from "../../js/style/createStyle";
import circleCalculations from "../../js/circleCalculations";
import main from "../../js/main";

const errorBorder = "#E10019";

/**
 * Creates a listener for the addfeature event of the source of the layer used for the Draw Tool.
 * NOTE: Should the zIndex only be counted up if the feature gets actually drawn?
 *
 * @param {Object} context actions context object.
 * @param {String} drawInteraction Either an empty String or "Two" to identify for which drawInteraction this is used.
 * @returns {void}
 */
export function drawInteractionOnDrawEvent ({state, commit, dispatch}, drawInteraction) {
    // we need a clone of styleSettings each time a draw event is called, otherwise the copy will influence former drawn objects
    // using "{styleSettings} = getters," would lead to a copy not a clone - don't use getters for styleSettings here
    const styleSettings = JSON.parse(JSON.stringify(state[state.drawType.id + "Settings"])),
        circleMethod = styleSettings.circleMethod;

    commit("setAddFeatureListener", main.getApp().config.globalProperties.$layer.getSource().once("addfeature", event => dispatch("handleDrawEvent", event)));
    if (state.currentInteraction === "draw" && circleMethod === "defined" && state.drawType.geometry === "Circle") {
        const interaction = state["drawInteraction" + drawInteraction];

        interaction.finishDrawing();
    }
}

/**
 * Handles the draw event.
 * @param {Object} context actions context object.
 * @param {Object} event drawInteraction event
 * @returns {void}
 */
export function handleDrawEvent ({state, commit, dispatch, rootState}, event) {
    const stateKey = state.drawType.id + "Settings",
        drawType = state.drawType,
        layerSource = main.getApp().config.globalProperties.$layer.getSource(),
        styleSettings = JSON.parse(JSON.stringify(state[stateKey])),
        circleMethod = styleSettings.circleMethod;

    event.feature.set("masterportal_attributes", Object.assign(event.feature.get("masterportal_attributes") ?? {}, {"fromDrawTool": true}));
    dispatch("updateUndoArray", {remove: false, feature: event.feature});
    if (circleMethod === "defined" && drawType.geometry === "Circle") {
        const innerRadius = !isNaN(styleSettings.circleRadius) ? parseFloat(styleSettings.circleRadius) : null,
            outerRadius = !isNaN(styleSettings.circleOuterRadius) ? parseFloat(styleSettings.circleOuterRadius) : null,
            circleRadius = event.feature.get("masterportal_attributes").isOuterCircle ? outerRadius : innerRadius,
            circleCenter = event.feature.getGeometry().getCenter();

        if (innerRadius === null || innerRadius === 0) {
            state.innerBorderColor = errorBorder;

            if (drawType.id === "drawDoubleCircle") {
                if (outerRadius === null || outerRadius === 0) {
                    const alert = {
                        category: "error",
                        content: i18next.t("common:modules.draw_old.undefinedTwoCircles"),
                        displayClass: "error",
                        multipleAlert: true
                    };

                    dispatch("Alerting/addSingleAlert", alert, {root: true});
                    layerSource.removeFeature(event.feature);
                    state.outerBorderColor = errorBorder;
                }
                else {
                    const alert = {
                        category: "error",
                        content: i18next.t("common:modules.draw_old.undefinedInnerCircle"),
                        displayClass: "error",
                        multipleAlert: true
                    };

                    dispatch("Alerting/addSingleAlert", alert, {root: true});
                    layerSource.removeFeature(event.feature);
                    state.outerBorderColor = "";
                }
            }
            else {
                const alert = {
                    category: "error",
                    content: i18next.t("common:modules.draw_old.undefinedRadius"),
                    displayClass: "error",
                    multipleAlert: true
                };

                dispatch("Alerting/addSingleAlert", alert, {root: true});
                layerSource.removeFeature(event.feature);
            }
        }
        else {
            if (outerRadius === null || outerRadius === 0) {
                if (drawType.id === "drawDoubleCircle") {
                    const alert = {
                        category: "error",
                        content: i18next.t("common:modules.draw_old.undefinedOuterCircle"),
                        displayClass: "error",
                        multipleAlert: true
                    };

                    dispatch("Alerting/addSingleAlert", alert, {root: true});
                    layerSource.removeFeature(event.feature);
                    state.outerBorderColor = errorBorder;
                }
                else {
                    circleCalculations.calculateCircle(event, circleCenter, circleRadius, mapCollection.getMap(rootState.Maps.mode));
                }
            }
            else {
                circleCalculations.calculateCircle(event, circleCenter, circleRadius, mapCollection.getMap(rootState.Maps.mode));
                state.outerBorderColor = "";
            }
            state.innerBorderColor = "";
        }
    }

    if (event.feature.get("masterportal_attributes").isOuterCircle) {
        styleSettings.colorContour = styleSettings.outerColorContour;
    }
    event.feature.setStyle(featureStyle(styleSettings, event.feature.get("masterportal_attributes").isOuterCircle));
    event.feature.set("masterportal_attributes", Object.assign(event.feature.get("masterportal_attributes") ?? {}, {"invisibleStyle": createStyleModule.createStyle(event.feature.get("masterportal_attributes").drawState, styleSettings)}));
    commit("setZIndex", state.zIndex + 1);
}

/**
 * Returns a function to style feature.
 * @param {Object} styleSettings settings for style
 * @param {Boolean} isOuterCircle if true, style is for isOuterCircle
 * @returns {Function} a function to style feature
 */
export function featureStyle (styleSettings, isOuterCircle) {
    return (feature) => {
        if (feature.get("masterportal_attributes").isVisible) {
            let settings;

            // NOTICE: change settings for outerCircle, else outerColor is same as innerColor (BG-5394)
            // NOTICE: do this only for outerCircle to stay the old behaviour for all other stylings
            if (!isOuterCircle) {
                settings = Object.assign({}, styleSettings, feature.get("masterportal_attributes").drawState);
            }
            else {
                settings = Object.assign({}, feature.get("masterportal_attributes").drawState, styleSettings);
            }
            return createStyleModule.createStyle(feature.get("masterportal_attributes").drawState, settings);
        }
        return undefined;
    };
}
