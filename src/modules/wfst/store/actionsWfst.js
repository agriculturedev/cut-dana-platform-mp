import {Vector as VectorLayer} from "ol/layer";
import {Draw, Modify, Select, Translate} from "ol/interaction";
import VectorSource from "ol/source/Vector";
import {platformModifierKeyOnly, primaryAction} from "ol/events/condition";
import addFeaturePropertiesToFeature from "../js/addFeaturePropertiesToFeature";
import prepareFeaturePropertiesModule from "../js/prepareFeatureProperties";
import {rawLayerList} from "@masterportal/masterportalapi/src";
import layerCollection from "../../../core/layers/js/layerCollection";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";

let drawInteraction,
    featureToDelete,
    drawLayer,
    modifyInteraction,
    modifyFeature,
    modifyFeatureSaveId,
    selectInteraction,
    translateInteraction;

const actions = {
    clearInteractions ({dispatch}) {
        const map = mapCollection.getMap("2D");

        if (drawInteraction) {
            dispatch("Maps/removeInteraction", drawInteraction, {root: true});
        }
        if (modifyInteraction) {
            dispatch("Maps/removeInteraction", modifyInteraction, {root: true});
        }
        if (selectInteraction) {
            dispatch("Maps/removeInteraction", selectInteraction, {root: true});
        }
        if (translateInteraction) {
            dispatch("Maps/removeInteraction", translateInteraction, {root: true});
        }
        map.removeLayer(drawLayer);

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
     * @param {("LineString"|"Point"|"Polygon"|"delete"|"update")} interaction Identifier of the selected interaction.
     * @returns {void}
     */
    async prepareInteraction ({commit, dispatch, getters, rootGetters}, interaction) {
        dispatch("clearInteractions");
        const {currentInteractionConfig, currentLayerId, currentLayerIndex, layerInformation, featureProperties, toggleLayer} = getters,

            sourceLayer = layerCollection.getLayerById(currentLayerId).layer;

        if (interaction === "LineString" || interaction === "Point" || interaction === "Polygon") {
            commit("setSelectedInteraction", "insert");
            drawLayer = new VectorLayer({
                id: "module/wfsTransaction/wfsTransaction/vectorLayer",
                name: "module/wfsTransaction/wfsTransaction/vectorLayer",
                source: new VectorSource(),
                alwaysOnTop: true,
                zIndex: 10
            });

            dispatch("Maps/addLayer", drawLayer, {root: true});

            const {style} = layerInformation[currentLayerIndex],
                drawOptions = {
                    source: drawLayer.getSource(),
                    type: (currentInteractionConfig[interaction].multi ? "Multi" : "") + interaction,
                    stopClick: true,
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
                sourceLayer?.setVisible(false);
            }

            drawInteraction.on("drawend", (event) => {
                sourceLayer.getSource().addFeature(event.feature);
                drawLayer.getSource().clear();
                const currentLayer = rawLayerList.getLayerWhere({id: currentLayerId}),
                    mapScale = rootGetters["Maps/scale"];

                if ((currentLayer.minScale && mapScale < currentLayer.minScale) || (currentLayer.maxScale && mapScale > currentLayer.maxScale)) {
                    drawLayer.getSource().once("change", () => drawLayer.getSource().clear());
                    dispatch("Alerting/addSingleAlert", {
                        category: "error",
                        content: i18next.t("common:modules.wfst.error.geometryOutOfRange"),
                        mustBeConfirmed: false
                    }, {root: true});
                    return;
                }
                dispatch("Maps/removeInteraction", drawInteraction, {root: true});
                dispatch("Maps/addInteraction", modifyInteraction, {root: true});
                dispatch("Maps/addInteraction", translateInteraction, {root: true});
            });
            dispatch("Maps/addInteraction", drawInteraction, {root: true});
        }
        else if (interaction === "update") {
            commit("setSelectedInteraction", "update");
            selectInteraction = new Select({
                layers: [sourceLayer]
            });

            selectInteraction.getFeatures().on("add", (event) => {
                commit("setSelectedInteraction", "selectedUpdate");
                modifyFeature = event.target.getArray()[0].clone();

                modifyFeatureSaveId = event.target.getArray()[0].getId();
                modifyInteraction = new Modify({
                    features: event.target,
                    condition: e => primaryAction(e) && !platformModifierKeyOnly(e)
                });
                translateInteraction = new Translate({
                    features: event.target,
                    condition: e => primaryAction(e) && platformModifierKeyOnly(e)
                });

                dispatch("Maps/removeInteraction", selectInteraction, {root: true});
                dispatch("Maps/addInteraction", modifyInteraction, {root: true});
                dispatch("Maps/addInteraction", translateInteraction, {root: true});
                commit(
                    "setFeatureProperties",
                    featureProperties
                        .map(property => ({...property, value: modifyFeature.get(property.key)}))
                );
            });
            dispatch("Maps/addInteraction", selectInteraction, {root: true});
        }
        else if (interaction === "delete") {
            commit("setSelectedInteraction", "delete");
            selectInteraction = new Select({
                layers: [sourceLayer]
            });
            selectInteraction.on("select", event => {
                featureToDelete = event.selected[0];
                commit("setShowConfirmModal", true);
                dispatch("Maps/removeInteraction", selectInteraction, {root: true});
            });
            dispatch("Maps/addInteraction", selectInteraction, {root: true});
            featureToDelete = null;
        }
    },
    /**
     * Resets all values from selected layer, all interaction, any modified feature.
     * @returns {void}
     */
    reset ({commit, dispatch, getters}) {
        const sourceLayer = layerCollection.getLayerById(getters.currentLayerId)?.layer,
            layerSelected = Array.isArray(getters.featureProperties);

        commit("setFeatureProperties",
            layerSelected
                ? getters.featureProperties.map(property => ({...property, value: null}))
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
        let featureWithProperties = null;
        const feature = modifyFeature ? modifyFeature : drawLayer.getSource().getFeatures()[0],
            {currentLayerIndex, featureProperties, layerInformation, selectedInteraction, layerIds} = getters,
            error = getters.savingErrorMessage(feature),
            currentLayerId = layerIds[currentLayerIndex],
            geometryFeature = modifyFeature
                ? layerCollection.getLayerById(currentLayerId).getLayerSource().getFeatures()
                    .find((workFeature) => workFeature.getId() === modifyFeatureSaveId)
                : feature;

        if (error.length > 0) {
            dispatch("Alerting/addSingleAlert", {
                category: "Info",
                displayClass: "info",
                content: error,
                mustBeConfirmed: false
            }, {root: true});
            return;
        }

        featureWithProperties = await addFeaturePropertiesToFeature(
            {
                id: feature.getId() || modifyFeatureSaveId,
                geometryName: feature.getGeometryName(),
                geometry: geometryFeature.getGeometry()
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
        const {currentLayerIndex, layerInformation, selectedInteraction} = getters,
            layer = layerInformation[currentLayerIndex],
            selectedFeature = feature && featureToDelete !== null ? feature : featureToDelete,
            url = layer.url,
            transactionMethod = ["LineString", "Point", "Polygon"].includes(selectedInteraction)
                ? "insert"
                : selectedInteraction,
            messageKey = `success.${transactionMethod}`;
        let response;

        try {
            response = await wfs.sendTransaction(rootGetters["Maps/projectionCode"], selectedFeature, url, layer, selectedInteraction);
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
            const transaction = i18next.t("common:modules.wfst.transaction." + messageKey);

            await dispatch("reset");
            layerCollection.getLayerById(layer.id).getLayerSource().refresh();
            if (response !== null) {
                dispatch("Alerting/addSingleAlert", {
                    category: "success",
                    content: i18next.t("common:modules.wfst.transaction.success.baseSuccess", {transaction: transaction})
                }, {root: true});
            }
        }
        return response;
    },

    /**
     * Sets the feature property
     *
     * @param {Object} payload property key, type, value
     * @returns {void}
     */
    setFeatureProperty ({commit, dispatch}, {key, type, value}) {
        if (type === "number" && !Number.isFinite(parseFloat(value))) {
            dispatch("Alerting/addSingleAlert", {
                category: "error",
                content: i18next.t("common:modules.wfst.error.onlyNumbersAllowed"),
                mustBeConfirmed: false
            }, {root: true});
            return;
        }
        commit("setFeatureProperty", {key, value});
    },
    /**
     * Sets all feature properties based on actual layer
     * @returns {void}
     */
    async setFeatureProperties ({commit, getters: {currentLayerIndex, layerInformation}}) {
        if (currentLayerIndex === -1) {
            commit("setFeatureProperties", i18next.t("common:modules.wfst.error.allLayersNotSelected"));
            return;
        }
        const layer = layerInformation[currentLayerIndex];

        if (!Object.prototype.hasOwnProperty.call(layer, "featurePrefix")) {
            commit("setFeatureProperties", i18next.t("common:modules.wfst.error.layerNotConfiguredCorrectly"));
            return;
        }
        if (!layer.visibility) {
            commit("setFeatureProperties", i18next.t("common:modules.wfst.error.layerNotSelected"));
            return;
        }
        commit("setFeatureProperties", await prepareFeaturePropertiesModule.prepareFeatureProperties(layer));
    }
};

export default actions;
