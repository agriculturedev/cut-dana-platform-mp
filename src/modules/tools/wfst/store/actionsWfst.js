import {Draw, Modify, Select, Translate} from "ol/interaction";
import {platformModifierKeyOnly, primaryAction} from "ol/events/condition";
import addFeaturePropertiesToFeature from "../utils/addFeaturePropertiesToFeature";
import getLayerInformationModule from "../utils/getLayerInformation";
import prepareFeaturePropertiesModule from "../utils/prepareFeatureProperties";
import {getComponent} from "../../../../utils/getComponent";
import loader from "../../../../utils/loaderOverlay";
import getProxyUrl from "../../../../utils/getProxyUrl";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import {handleMultipolygon, buildMultipolygon, splitOuterFeatures} from "../utils/handleMultipolygon";
import {nextTick} from "vue";

let drawInteraction,
    drawLayer,
    modifyInteraction,
    modifyFeature,
    modifyFeatureSaveId,
    selectInteraction,
    translateInteraction;

const actions = {
    /**
     * Clear all map interactions.
     *
     * @returns {void}
     */
    clearInteractions ({commit, dispatch}) {
        dispatch("Maps/removeInteraction", drawInteraction, {root: true});
        dispatch("Maps/removeInteraction", modifyInteraction, {root: true});
        dispatch("Maps/removeInteraction", selectInteraction, {root: true});
        dispatch("Maps/removeInteraction", translateInteraction, {root: true});
        commit("Maps/removeLayerFromMap", drawLayer, {root: true});
        drawInteraction = undefined;
        modifyInteraction = undefined;
        selectInteraction?.getFeatures().clear();
        selectInteraction = undefined;
        translateInteraction = undefined;
        drawLayer = undefined;
    },
    /**
     * Prepares everything so that the user can interact with features or draw features
     * to be able to send a transaction to the service.
     *
     * @param {("LineString"|"Point"|"Polygon"|"MultiPolygon"|"delete"|"update")} interaction Identifier of the selected interaction.
     * @returns {void}
     */
    async prepareInteraction ({commit, dispatch, getters, rootGetters}, interaction) {
        dispatch("clearInteractions");
        const {currentLayerId, currentLayerIndex, layerInformation, featureProperties, toggleLayer} = getters,
            // NOTE: As this is a rootGetter, the naming scheme is used like this.
            // eslint-disable-next-line new-cap
            sourceLayer = rootGetters["Maps/getLayerById"]({layerId: currentLayerId}),
            shouldValidateForm = featureProperties.find(featProp => featProp.type !== "geometry" && featProp.required);

        if (interaction === "LineString" || interaction === "Point" || interaction === "Polygon" || interaction === "MultiPolygon") {
            commit("setSelectedInteraction", "insert");
            drawLayer = await dispatch("Maps/addNewLayerIfNotExists", {layerName: "tool/wfsTransaction/vectorLayer"}, {root: true});

            const {style} = layerInformation[currentLayerIndex],
                drawOptions = {
                    source: drawLayer.getSource(),
                    type: interaction,
                    geometryName: featureProperties.find(({type}) => type === "geometry")?.key
                };

            if (interaction === "Point") {
                drawOptions.style = style;
            }
            drawInteraction = new Draw(drawOptions);
            modifyInteraction = new Modify({
                source: drawLayer.getSource(),
                condition: event => primaryAction(event) && !platformModifierKeyOnly(event)
            });
            translateInteraction = new Translate({
                layers: [drawLayer],
                condition: event => primaryAction(event) && platformModifierKeyOnly(event)
            });
            drawLayer.setStyle(style);

            if (toggleLayer) {
                sourceLayer.setVisible(false);
            }

            drawInteraction.on("drawend", async () => {
                if (interaction === "MultiPolygon") {
                    await nextTick();
                    const currentFeatures = await drawLayer?.getSource()?.getFeatures();

                    handleMultipolygon(currentFeatures, drawLayer);
                }

                if (getComponent(currentLayerId).get("isOutOfRange")) {
                    drawLayer.getSource().once("change", () => drawLayer.getSource().clear());
                    dispatch("Alerting/addSingleAlert", {
                        category: "Info",
                        displayClass: "info",
                        content: i18next.t("common:modules.tools.wfsTransaction.error.geometryOutOfRange"),
                        mustBeConfirmed: false
                    }, {root: true});
                    return;
                }
                if (interaction !== "MultiPolygon") {
                    dispatch("Maps/removeInteraction", drawInteraction, {root: true});
                }
                dispatch("Maps/addInteraction", modifyInteraction, {root: true});
                dispatch("Maps/addInteraction", translateInteraction, {root: true});
            });
            dispatch("Maps/addInteraction", drawInteraction, {root: true});
            if (shouldValidateForm) {
                dispatch("validateForm", featureProperties);
            }
        }
        else if (interaction === "update") {
            commit("setSelectedInteraction", "update");
            selectInteraction = new Select({
                layers: [sourceLayer]
            });
            selectInteraction.getFeatures().on("add", async (event) => {
                commit("setSelectedInteraction", "selectedUpdate");
                event.element.setStyle(selectInteraction.getStyle());

                if (event.element.getGeometry().getType() !== "MultiPolygon") {
                    modifyFeature = event.target.getArray()[0].clone();
                }
                // ol sensibly cleans id off clones; keep id for saving
                const id = event.target.getArray()[0].getId();

                if (id) {
                    modifyFeatureSaveId = id;
                }
                modifyInteraction = new Modify({
                    features: event.target,
                    condition: e => primaryAction(e) && !platformModifierKeyOnly(e)
                });
                translateInteraction = new Translate({
                    features: event.target,
                    condition: e => primaryAction(e) && platformModifierKeyOnly(e)
                });
                /**
                 * Handle Multipolygon Creation and Editing inside the Edit Menu
                 */
                if (event.target.getArray()?.[0]?.get("geom")?.getType() !== "MultiPolygon") {
                    dispatch("Maps/removeInteraction", selectInteraction, {root: true});
                }
                else {
                    drawLayer = await dispatch("Maps/addNewLayerIfNotExists", {layerName: "tool/wfsTransaction/vectorLayer"}, {root: true});
                    splitOuterFeatures([event.element], drawLayer);
                    selectInteraction.getFeatures().clear();
                    sourceLayer.setVisible(false);
                    if (drawLayer.getSource().getFeatures().length > 0) {
                        drawLayer.getSource().getFeatures().forEach(feature => {
                            selectInteraction.getFeatures().push(feature);
                        });
                    }
                    const drawOptions = {
                            source: drawLayer.getSource(),
                            type: "MultiPolygon",
                            geometryName: featureProperties.find(({type}) => type === "geometry")?.key
                        },
                        editOptions = {
                            layers: [drawLayer],
                            condition: e => primaryAction(e) && platformModifierKeyOnly(e)
                        },
                        modifyOptions = {
                            source: drawLayer.getSource(),
                            condition: e => primaryAction(e) && !platformModifierKeyOnly(e)
                        },
                        style = selectInteraction.getStyle();

                    drawLayer.setStyle(style);
                    modifyInteraction = new Modify(modifyOptions);
                    translateInteraction = new Translate(editOptions);
                    drawInteraction = new Draw(drawOptions);
                    drawInteraction.on("drawstart", () => {
                        drawLayer.setStyle(layerInformation[currentLayerIndex].style);
                    });
                    drawInteraction.on("drawend", async () => {
                        await nextTick();
                        const features = await drawLayer.getSource().getFeatures();

                        await nextTick();
                        await handleMultipolygon(features, drawLayer);
                        drawLayer.setStyle(style);
                    });
                    dispatch("Maps/addInteraction", drawInteraction, {root: true});
                }
                dispatch("Maps/addInteraction", modifyInteraction, {root: true});
                dispatch("Maps/addInteraction", translateInteraction, {root: true});
                commit(
                    "setFeatureProperties",
                    featureProperties
                        .map(property => ({...property, value: modifyFeature ? modifyFeature.get(property.key) : event.element.get(property.key), valid: true}))
                );
                if (shouldValidateForm) {
                    dispatch("validateForm", featureProperties);
                    commit("setIsFormDisabled", false);
                }
            });
            dispatch("Maps/addInteraction", selectInteraction, {root: true});
        }
        else if (interaction === "delete") {
            commit("setSelectedInteraction", "delete");
            selectInteraction = new Select({
                layers: [sourceLayer]
            });
            selectInteraction.on("select", event => {
                dispatch("ConfirmAction/addSingleAction", {
                    actionConfirmedCallback: () => dispatch("sendTransaction", event.selected[0]),
                    confirmCaption: i18next.t("common:modules.tools.wfsTransaction.deleteInteraction.confirm"),
                    textContent: i18next.t("common:modules.tools.wfsTransaction.deleteInteraction.text"),
                    headline: i18next.t("common:modules.tools.wfsTransaction.deleteInteraction.headline")
                }, {root: true});
                dispatch("Maps/removeInteraction", selectInteraction, {root: true});
            });
            dispatch("Maps/addInteraction", selectInteraction, {root: true});
        }
    },
    /**
     * Resets all values from selected layer, all interaction, any modified feature.
     * @returns {void}
     */
    reset ({commit, dispatch, getters, rootGetters}) {
        // NOTE: As this is a rootGetter, the naming scheme is used like this.
        // eslint-disable-next-line new-cap
        const sourceLayer = rootGetters["Maps/getLayerById"]({layerId: getters.currentLayerId}),
            layerSelected = Array.isArray(getters.featureProperties);

        commit("setFeatureProperties",
            layerSelected
                ? getters.featureProperties.map(property => ({...property, value: null, valid: null}))
                : getters.featureProperties
        );
        commit("setSelectedInteraction", null);
        dispatch("clearInteractions");
        if (layerSelected) {
            sourceLayer?.setVisible(true);
        }
        if (modifyFeature) {
            sourceLayer
                ?.getSource().getFeatures()
                .find(feature => feature.getId() === modifyFeature.getId())
                ?.setGeometry(modifyFeature.getGeometry());
            sourceLayer?.getSource().refresh();
            modifyFeature = undefined;
            modifyFeatureSaveId = undefined;
        }
    },
    /**
     * Checks whether all required values have been set and a feature is present
     * and either dispatches an alert or sends a transaction.
     *
     * @returns {void}
     */
    async save ({dispatch, getters}) {
        let featureWithProperties = null,
            multiPolygonGeometry;
        const polygonFeature = modifyFeature ? modifyFeature : drawLayer.getSource().getFeatures()?.[0],
            {currentLayerIndex, featureProperties, layerInformation, selectedInteraction, layerIds} = getters,
            error = getters.savingErrorMessage(polygonFeature),
            multiPolygonFeatures = modifyFeature
                ? modifyFeature
                : drawLayer?.getSource()?.getFeatures().filter(feature => feature.getGeometry().getType() === "MultiPolygon"),
            currentLayerId = layerIds[currentLayerIndex],
            geometryFeature = modifyFeature
                ? Radio
                    .request("ModelList", "getModelByAttributes", {id: currentLayerId})
                    .layer
                    .getSource()
                    .getFeatures()
                    .find((workFeature) => workFeature.getId() === modifyFeatureSaveId)
                : polygonFeature;

        if (error.length > 0) {
            dispatch("Alerting/addSingleAlert", {
                category: "Info",
                displayClass: "info",
                content: error,
                mustBeConfirmed: false
            }, {root: true});
            return;
        }

        if (multiPolygonFeatures.length !== 0 && drawLayer) {
            if (multiPolygonFeatures.length > 1) {
                multiPolygonGeometry = buildMultipolygon(multiPolygonFeatures, drawLayer);
                multiPolygonGeometry.setId(modifyFeatureSaveId);
            }
            else {
                multiPolygonGeometry = multiPolygonFeatures[0];
                multiPolygonGeometry.setId(modifyFeatureSaveId);
            }
        }

        featureWithProperties = await addFeaturePropertiesToFeature(
            {
                id: polygonFeature.getId() || modifyFeatureSaveId,
                geometryName: featureProperties.find(({type}) => type === "geometry")?.key,
                geometry: multiPolygonFeatures && multiPolygonGeometry ? multiPolygonGeometry.getGeometry() : geometryFeature.getGeometry()
            },
            featureProperties,
            selectedInteraction === "selectedUpdate",
            layerInformation[currentLayerIndex].featurePrefix
        );

        await dispatch(
            "sendTransaction",
            featureWithProperties
        );
    },

    /**
     * Sends a transaction to the API and processes the response.
     * Either a message is displayed to the user in case of an error, depending on the response,
     * or the layer is refreshed and the stored feature is displayed.
     *
     * @param {module:ol/Feature} feature Feature to by inserted / updated / deleted.
     * @returns {Promise} Promise containing the feature to be added, updated or deleted if transaction was successful. If transaction fails it returns null
     */
    async sendTransaction ({dispatch, getters, rootGetters}, feature) {
        const {currentLayerIndex, layerInformation, selectedInteraction, useProxy} = getters,
            layer = layerInformation[currentLayerIndex],
            url = useProxy ? getProxyUrl(layer.url) : layer.url;
        let response;

        loader.show();
        try {
            response = await wfs.sendTransaction(rootGetters["Maps/projectionCode"], feature, url, layer, selectedInteraction);
        }
        catch (e) {
            await dispatch("Alerting/addSingleAlert", {
                category: "Info",
                displayClass: "info",
                content: i18next.t(`Error: ${e.message}`),
                mustBeConfirmed: false
            }, {root: true});
            response = null;
        }
        finally {
            await dispatch("reset");
            getComponent(layer.id).layer.getSource().refresh();
            loader.hide();
        }
        return response;
    },

    /**
     * Sets the active property of the state to the given value.
     * Also starts processes if the tool is activated (active === true).
     * @param {Object} context actions context object.
     * @param {Boolean} active Value deciding whether the tool gets activated or deactivated.
     * @returns {void}
     */
    setActive ({commit, dispatch, getters: {layerIds}}, active) {
        commit("setActive", active);

        if (active) {
            const layerInformation = getLayerInformationModule.getLayerInformation(layerIds);

            commit("setLayerInformation", layerInformation);
            commit("setCurrentLayerIndex", layerInformation.findIndex(layer => layer.isSelected));
            dispatch("setFeatureProperties");
        }
        else {
            dispatch("reset");
        }
    },

    /**
     * Validates the user-input sets the error messages.
     * @param {Object} property property that is validated based on it's type
     * @returns {void}
     */
    validateInput ({commit}, property) {
        if (property.type === "number") {
            const isNotEmpty = property.value.length > 0,
                hasNumbersOrPartialNumbers = !Number.isNaN(Number(property.value)),
                isNumberValid = isNotEmpty && hasNumbersOrPartialNumbers;

            commit("setFeatureProperty", {...property, valid: isNumberValid});
        }
        else if (property.type === "text") {
            const hasTextAndNumberAndHasSpecials = (/^[A-Za-z0-9 [\]öäüÖÄÜß,/\\.-]*$/).test(property.value),
                hasOnlyNumbers = (/^[0-9]*$/).test(property.value),
                isTextValid = hasTextAndNumberAndHasSpecials && !hasOnlyNumbers;

            commit("setFeatureProperty", {...property, valid: isTextValid});
        }
        else if (property.type === "date") {
            const dateEpoch = Date.parse(property.value),
                year2100 = 4133894400000,
                isDateValid = year2100 > dateEpoch;

            commit("setFeatureProperty", {...property, valid: isDateValid});
        }
    },

    /**
     * Validates whole form based on the list of received properties.
     * @param {Object} featureProperties a list of properties
     * @returns {void}
     */
    validateForm ({commit}, featureProperties) {
        const isFormInvalid = featureProperties.find(f => f.type !== "geometry" && f.required && f.valid !== true);

        commit("setIsFormDisabled", Boolean(isFormInvalid));
    },

    /**
     * Sets actual feature property based on the user action on an input.
     * @param {Object} feature of a feature with it's key, type and value
     *
     * @returns {void}
     */
    updateFeatureProperty ({dispatch, commit, getters: {featureProperties}}, feature) {
        if (feature.required) {
            dispatch("validateInput", feature);
            dispatch("validateForm", featureProperties);
        }
        else {
            commit("setFeatureProperty", {...feature, key: feature.key, value: feature.value});
        }
    },

    /**
     * Sets all feature properties based on actual layer
     *
     * @returns {void}
     */
    async setFeatureProperties ({commit, getters: {currentLayerIndex, layerInformation, useProxy}}) {
        if (currentLayerIndex === -1) {
            commit("setFeatureProperties", i18next.t("common:modules.tools.wfsTransaction.error.allLayersNotSelected"));
            return;
        }
        const layer = layerInformation[currentLayerIndex];

        if (!Object.prototype.hasOwnProperty.call(layer, "featurePrefix")) {
            commit("setFeatureProperties", i18next.t("common:modules.tools.wfsTransaction.error.layerNotConfiguredCorrectly"));
            return;
        }
        if (!layer.isSelected) {
            commit("setFeatureProperties", i18next.t("common:modules.tools.wfsTransaction.error.layerNotSelected"));
            return;
        }
        commit("setFeatureProperties", await prepareFeaturePropertiesModule.prepareFeatureProperties(layer, useProxy));
    }
};

export default actions;
