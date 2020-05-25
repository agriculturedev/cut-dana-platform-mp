import {fromCircle} from "ol/geom/Polygon.js";
import {createStyle} from "./style/createStyle";
import Feature from "ol/Feature";
import {getMapProjection} from "masterportalAPI/src/crs";
import {GeoJSON} from "ol/format.js";
import MultiLine from "ol/geom/MultiLineString.js";
import MultiPoint from "ol/geom/MultiPoint.js";
import MultiPolygon from "ol/geom/MultiPolygon.js";

/**
 * Resets and deactivates the Draw Tool.
 *
 * @param {String} cursor If a cursor has been added through the RemoteInterface, it gets removed.
 * @returns {void}
 */
function cancelDrawWithoutGUI ({dispatch}, cursor) {
    dispatch("deactivateDrawInteraction");
    dispatch("deactivateSelectInteraction");
    dispatch("deactivateModifyInteraction");
    dispatch("resetModule");
    dispatch("setActive", false);

    if (cursor?.cursor) {
        // TODO: The cursor changes from the map need to happen here
        $("#map").removeClass("no-cursor");
    }
}

/**
 * Creates and returns a GeoJSON of all drawn features without GUI.
 * Per default the geometries of the features are added individually.
 * If the given parameter "geomType" is set to "multiGeometry", features are clustered as multiGeometry features for each geometry type.
 *
 * @param {Object} context actions context object
 * @param {Object} payload payload object.
 * @param {String} payload.prmObject An Object which includes the parameters.
 * @param {String} payload.prmObject.geomType Type for processing the gometries; singleGeometry (default) or multiGeometry ("multiGeometry").
 * @param {Boolean} payload.prmObject.transformWGS The coordinates of the features are transformed from WGS84 to UTM32 if set to true.
 * @param {module:ol/Feature} payload.currentFeature Last drawn feature (drawend event).
 * @returns {String} GeoJSON with all drawn features; If the Tool hasn't been initialized yet, no layer was created and thus an empty Object is returned.
 */
function downloadFeaturesWithoutGUI ({state, rootState}, payload) {
    let circularPolygon,
        features,
        featuresConverted = {"type": "FeatureCollection", "features": []},
        featureType,
        multiGeom,
        singleGeom,
        targetProjection = null;
    const featureArray = [],
        format = new GeoJSON(),
        mapProjection = getMapProjection(rootState.Map.map),
        multiLine = new MultiLine([]),
        multiPoint = new MultiPoint([]),
        multiPolygon = new MultiPolygon([]);

    // TODO: How does this value arrive? In JSDoc it is written that its a Boolean which would make the "===" redundant
    if (payload.prmObject?.transformWGS === true) {
        targetProjection = "EPSG:4326";
    }
    if (payload.prmObject?.targetProjection !== undefined) {
        targetProjection = payload.prmObject.targetProjection;
    }

    if (state.layer !== undefined && state.layer !== null) {
        features = state.layer.getSource().getFeatures();

        if (payload?.currentFeature !== undefined) {
            features.push(payload.currentFeature);
        }
        if (payload?.prmObject?.geomType === "multiGeometry") {
            features.forEach(item => {
                featureType = item.getGeometry().getType();

                if (featureType === "Polygon") {
                    multiPolygon.appendPolygon(targetProjection !== null
                        ? item.getGeometry().clone().transform(mapProjection, targetProjection)
                        : item.getGeometry());
                }
                else if (featureType === "Point") {
                    multiPoint.appendPoint(targetProjection !== null
                        ? item.getGeometry().clone().transform(mapProjection, targetProjection)
                        : item.getGeometry());
                }
                else if (featureType === "LineString") {
                    multiLine.appendLineString(targetProjection !== null
                        ? item.getGeometry().clone().transform(mapProjection, targetProjection)
                        : item.getGeometry());
                }
                // Circles can't be added to a featureCollection directly and have to be converted to a Polygon before
                else if (featureType === "Circle") {
                    circularPolygon = fromCircle(targetProjection !== null
                        ? item.getGeometry().clone().transform(mapProjection, targetProjection)
                        : item.getGeometry(),
                    64);
                    multiPolygon.appendPolygon(circularPolygon);
                }
                else if (featureType === "MultiPolygon" || featureType === "MultiPoint" || featureType === "MultiLineString") {
                    if (targetProjection !== null) {
                        multiGeom = item.clone();
                        multiGeom.getGeometry().transform(mapProjection, targetProjection);
                    }
                    else {
                        multiGeom = item;
                    }
                    featureArray.push(multiGeom);
                }
            });

            if (multiPolygon.getCoordinates().length > 0) {
                featureArray.push(new Feature(multiPolygon));
            }
            if (multiPoint.getCoordinates().length > 0) {
                featureArray.push(new Feature(multiPoint));
            }
            if (multiLine.getCoordinates().length > 0) {
                featureArray.push(new Feature(multiLine));
            }
            // NOTE: Text written through the Draw Tool is not included in the FeatureCollection. If text is needed, the FeatureCollection should be created differently.
            // NOTE: Text content can be accessed with item.getStyle().getText().getText().
            featuresConverted = format.writeFeaturesObject(featureArray);
        }
        else {
            features.forEach(item => {
                featureType = item.getGeometry().getType();

                if (targetProjection !== null) {
                    singleGeom = item.clone();
                    singleGeom.getGeometry().transform(mapProjection, targetProjection);
                }
                else {
                    singleGeom = item;
                }

                // Circles can't be added to a featureCollection directly and have to be converted to a Polygon before
                if (featureType === "Circle") {
                    featureArray.push(new Feature(fromCircle(singleGeom.getGeometry(), 64)));
                }
                else {
                    featureArray.push(singleGeom);
                }
            });
            // NOTE: Text written through the Draw Tool is not included in the FeatureCollection. If text is needed, the FeatureCollection should be created differently.
            // NOTE: Text content can be accessed with item.getStyle().getText().getText().
            featuresConverted = format.writeFeaturesObject(featureArray);
        }
    }
    return JSON.stringify(featuresConverted);
}

/**
 * Sends the generated GeoJSON to the RemoteInterface to communicate with an iFrame.
 *
 * @param {Object} _context actions context object.
 * @param {String} geomType singleGeometry (default) or multiGeometry ("multiGeometry")
 * @returns {void}
 */
function downloadViaRemoteInterface (_context, geomType) {
    const result = downloadFeaturesWithoutGUI(geomType);

    Radio.trigger("RemoteInterface", "postMessage", {
        "downloadViaRemoteInterface": "function identifier",
        "success": true,
        "response": result
    });
}

/**
 * Enable editing of already drawn features without GUI.
 * Used in the RemoteInterface.
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function editFeaturesWithoutGUI ({dispatch}) {
    dispatch("deactivateDrawInteraction");
    dispatch("createModifyInteractionAndAddToMap");
}

/**
 * Initializes the drawing functionality without GUI.
 * Used in the RemoteInterface.
 *
 * @param {Object} context actions context object.
 * @param {String} prmObject An Object which includes the parameters.
 * @param {String} prmObject.drawType Which feature type is meant to be drawn; ["Point", "LineString", "Polygon", "Circle"].
 * @param {String} prmObject.color color of the feature, rgb-coded (default: "55, 126, 184").
 * @param {Number} prmObject.opacity opacity of the feature (default: 1.0).
 * @param {Integer} prmObject.maxFeatures Maximum number of Features allowed to be drawn (default: unlimited).
 * @param {String} prmObject.initialJSON GeoJSON containing the Features to be drawn on the Layer, e.g. for editing.
 * @param {Boolean} prmObject.transformWGS The GeoJSON will be transformed from WGS84 to UTM if set to true.
 * @param {Boolean} prmObject.zoomToExtent The map will be zoomed to the extent of the GeoJson if set to true.
 * @returns {String} GeoJSON of all Features as a String
 */
function initializeWithoutGUI ({state, commit, dispatch}, {drawType, color, opacity, maxFeatures, initialJSON, transformWGS, zoomToExtent}) {
    let featJSON,
        newColor,
        format;

    // TODO: collection is not defined on the model directly but rather implicitly --> How is this needed and how can this be handled?
    if (this.collection) {
        this.collection.setActiveToolsToFalse(this);
    }

    commit("setRenderToWindow", false);
    dispatch("setActive", true);

    if (["Point", "LineString", "Polygon", "Circle"].indexOf(drawType) > -1) {
        commit("setDrawType", {id: getDrawId(drawType), geometry: drawType});

        if (color) {
            commit("setColor", color);
        }
        if (opacity) {
            newColor = state.color;

            newColor[3] = parseFloat(opacity);
            commit("setColor", newColor);
            commit("setOpacity", opacity);
        }

        dispatch("createDrawInteractionAndAddToMap", {active: true, maxFeatures: maxFeatures});

        if (initialJSON) {
            try {
                // TODO: How does this value arrive? In JSDoc it is written that its a Boolean which would make the "===" redundant
                if (transformWGS === true) {
                    format = new GeoJSON({
                        defaultDataProjection: "EPSG:4326"
                    });
                    // read GeoJSON and transform the coordiantes from WGS84 to UTM32
                    featJSON = format.readFeatures(initialJSON, {
                        dataProjection: "EPSG:4326",
                        featureProjection: "EPSG:25832"
                    });
                }
                else {
                    featJSON = format.readFeatures(initialJSON);
                }

                if (featJSON.length > 0) {
                    state.layer.setStyle(createStyle(drawType));
                    state.layer.getSource().addFeatures(featJSON);
                }
                // TODO: How does this value arrive? In JSDoc it is written that its a Boolean which would make the "===" redundant
                if (featJSON.length > 0 && zoomToExtent === true) {
                    Radio.trigger("Map", "zoomToExtent", state.layer.getSource().getExtent());
                }
            }
            catch (e) {
                // The given JSON was invalid
                Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.draw.geometryDrawFailed"));
            }
        }
    }
}

/**
 * Find the correct id for the translation of the given drawType.
 * If the drawType is not "Circle", "LineString", "Point" or "Polygon", simply "draw" is returned.
 *
 * @param {String} drawType Type of the draw interaction.
 * @returns {String} The translation key for the given draw interaction
 */
function getDrawId (drawType) {
    switch (drawType) {
        case "Circle":
            return "drawCircle";
        case "LineString":
            return "drawLine";
        case "Point":
            return "drawPoint";
        case "Polygon":
            return "drawArea";
        default:
            return "draw";
    }
}

export {
    cancelDrawWithoutGUI,
    downloadFeaturesWithoutGUI,
    downloadViaRemoteInterface,
    editFeaturesWithoutGUI,
    initializeWithoutGUI
};
