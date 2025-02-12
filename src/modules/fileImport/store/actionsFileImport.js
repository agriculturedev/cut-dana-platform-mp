import {GeoJSON, GPX, KML} from "ol/format.js";
import Circle from "ol/geom/Circle";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";
import {createDrawStyle} from "../../draw_old/js/style/createDrawStyle";
import isObject from "../../../shared/js/utils/isObject";
import {createEmpty as createEmptyExtent, extend} from "ol/extent";
import {uniqueId} from "../../../shared/js/utils/uniqueId.js";
import layerCollection from "../../../core/layers/js/layerCollection";
import {treeSubjectsKey} from "../../../shared/js/utils/constants";

const defaultFont = "16px Arial",
    supportedFormats = {
        kml: new KML({
            extractStyles: true,
            iconUrlFunction: (url) => url,
            defaultStyle: [new Style({
                image: new Icon({
                    anchor: [20, 2],
                    anchorOrigin: "bottom-left",
                    anchorXUnits: "pixels",
                    anchorYUnits: "pixels",
                    crossOrigin: "anonymous",
                    rotation: 0,
                    scale: 1,
                    size: [16, 16],
                    src: `${window.location.origin}/src/assets/img/tools/draw/circle_blue.svg`
                }),
                text: new Text({
                    fill: new Fill({
                        color: [0, 0, 0, 1]
                    })
                }),
                zIndex: 0
            })]
        }),
        gpx: new GPX(),
        geojson: new GeoJSON()
    };

/**
 * Checks given file suffix for any defined Format. Default mappings are defined in state and may be
 * overridden in config.
 * @param {String} filename - Name of the given file.
 * @param {String} selectedFiletype - The name of type of file. This represents a key of supportedFiletypes
 * and defines, how the format will be chosen. Either directly if it matches an available format and
 * supported file type. Or automatically, when set to "auto".
 * @param {Object} supportedFiletypes - Object of supported file types. This has to include a regex for each
 * file type, that will be used to determine the filetype when selectedFiletype is "auto". The defaults are
 * defined in state and may be overridden in config.
 * @param {Object} availableFormats - Object of available formats provided by Openlayers. These are hardcoded
 * in this file and this is only a param for the sake of avoiding global variables.
 * @returns {Object|Boolean} Returns the chosen openlayers format object or false on error.
 */
function getFormat (filename, selectedFiletype, supportedFiletypes, availableFormats) {
    if (selectedFiletype !== "auto") {
        if (availableFormats[selectedFiletype] === undefined) {
            console.warn("File import tool: Selected filetype \"" + selectedFiletype + "\" has no OL Format defined for it.");
            return false;
        }
        return availableFormats[selectedFiletype];
    }

    for (const formatKey in supportedFiletypes) {
        if (supportedFiletypes[formatKey].rgx === undefined) {
            continue;
        }

        if (filename.match(supportedFiletypes[formatKey].rgx) !== null) {
            if (availableFormats[formatKey] === undefined) {
                console.warn("File import tool: Filetype \"" + formatKey + "\" is defined as supported, but there isn't any OL Format defined for it.");
                continue;
            }
            return availableFormats[formatKey];
        }
    }
    return false;
}

/**
 * Checks for OL-unsupported tags and removes them.
 * Currently unsupported tags are:
 *      - cascadingStyle
 * Removes attributes from Placemark-tag, e.g. 'id': if same id is in different imported files, the features are overwritten by ol format.
 * @param {String} rawSource - KML source as string.
 * @returns {String} Returns raw string KML source without unsupported tags.
 */
function removeBadTags (rawSource) {
    let result = rawSource;

    // remove "cascadingStyle" Tags
    result = rawSource.replace(/<.*?cascadingstyle.*?kml:id="(.+)">\s*<style>/gmi, (a, b) => {
        return "<Style id=\"" + b + "\">";
    });
    result = result.replace(/<\/Style>\s*<\/.*?cascadingstyle>/gmi, "</Style>");
    result = result.replace(/<Placemark.*?(>)/gmi, "<Placemark>");

    return result;
}

/**
 * Reads the JSON and extracts the coordinate system.
 * @param {String} rawSource - KML source as string.
 * @returns {String} Returns CRS.Properties.Name - if not found it defaults to EPSG:4326
 */
function getCrsPropertyName (rawSource) {
    let result = "EPSG:4326";

    try {
        const jsonDoc = JSON.parse(rawSource);

        if (jsonDoc &&
            Object.prototype.hasOwnProperty.call(jsonDoc, "crs") &&
            Object.prototype.hasOwnProperty.call(jsonDoc.crs, "properties") &&
            Object.prototype.hasOwnProperty.call(jsonDoc.crs.properties, "name")) {

            result = jsonDoc.crs.properties.name;
        }
    }
    catch (e) {
        // no JSON input
    }

    return result;
}
/**
 * Checks for isVisible setting and in case it's not there adds it.
 * @param {Array} features The Features to be inspected.
 * @returns {Array} Returns Features with isVisible set.
 */
function checkIsVisibleSetting (features) {
    const resFeatures = features;

    resFeatures.forEach(feature => {
        // in case File doesn't have the isVisible setting
        if (!Object.prototype.hasOwnProperty.call(feature.getProperties(), "masterportal_attributes")) {
            feature.set("masterportal_attributes", {isVisible: true});
        }
        else if (!Object.prototype.hasOwnProperty.call(feature.get("masterportal_attributes"), "isVisible")) {
            feature.get("masterportal_attributes").isVisible = true;
        }
    });

    return resFeatures;
}

/**
 * Gets custom attributes from feature by parsing given feature keys.
 * @param {ol/Feature} feature The feature.
 * @returns {Object} The parsed attributes.
 */
function getParsedCustomAttributes (feature) {
    if (typeof feature.getKeys !== "function" || !Array.isArray(feature.getKeys())) {
        return {};
    }

    let attributes = feature.get("attributes");

    if (!isObject(attributes)) {
        attributes = {};
    }
    feature.getKeys().forEach(key => {
        if (typeof key.split === "function" && key.split("custom-attribute____").length > 1) {
            const parsedKey = key.split("custom-attribute____")[1];

            attributes[parsedKey] = feature.get(key);
        }
    });
    return attributes;
}

export default {

    /**
     * Sets the featureExtents
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {ol/Feature[]} payload.features the parsed features
     * @param {String} payload.fileName the file name
     * @returns {void}
     */
    setFeatureExtents ({state, commit}, {features, fileName}) {
        const extents = state.featureExtents,
            extent = createEmptyExtent();

        for (let i = 0; i < features.length; i++) {
            extend(extent, features[i].getGeometry().getExtent());
        }

        extents[fileName] = extent;
        commit("setFeatureExtents", extents);
    },

    /**
     * Imports the given KML file from datasrc.raw, creating the features into datasrc.layer.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the root getters
     * @param {Object} datasrc data source to import, with properties filename, layer and raw.
     * @returns {void}
     */
    importFile ({state, dispatch, rootGetters, commit}, datasrc) {
        const
            vectorLayer = datasrc.layer,
            fileName = datasrc.filename,
            format = getFormat(fileName, state.selectedFiletype, state.supportedFiletypes, supportedFormats),
            crsPropName = getCrsPropertyName(datasrc.raw);

        let
            featureError = false,
            alertingMessage,
            features;

        if (format instanceof KML) {
            datasrc.raw = removeBadTags(datasrc.raw);
        }

        if (format === false) {
            const fileNameSplit = fileName.split("."),
                fileFormat = fileNameSplit.length > 0 ? "*." + fileNameSplit[fileNameSplit.length - 1] : "unknown";

            alertingMessage = {
                category: "error",
                content: i18next.t("common:modules.fileImport.alertingMessages.missingFormat", {format: fileFormat})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        try {
            features = format.readFeatures(datasrc.raw);

            if (format instanceof KML) {
                const indices = [];

                features.forEach((feature, i) => {
                    if (feature.getGeometry() !== null && feature.getGeometry().getType() === "Point") {
                        if (feature.values_.name === undefined) {
                            // import of point no text: showPointNames must be false
                            indices.push(i);
                        }
                    }
                });
                if (indices.length > 0) {
                    // type Point with no names (=Icons) have to be imported with special options, else if downloaded over draw tool again there will be an error
                    const specialFormat = new KML({
                            extractStyles: true,
                            showPointNames: false,
                            crossOrigin: null
                        }),
                        featuresNoPointNames = specialFormat.readFeatures(datasrc.raw);

                    indices.forEach((index) => {
                        features[index] = featuresNoPointNames[index];
                    });
                }
            }
        }
        catch (ex) {
            console.warn(ex);
            alertingMessage = {
                category: "error",
                content: i18next.t("common:modules.fileImport.alertingMessages.formatError", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (!Array.isArray(features) || features.length === 0) {
            alertingMessage = {
                category: "error",
                content: i18next.t("common:modules.fileImport.alertingMessages.missingFileContent", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        features.forEach(feature => {
            const featureAttributes = getParsedCustomAttributes(feature),
                masterportal_attributes = {};
            let geometries;

            feature.setProperties(featureAttributes);
            Object.keys(featureAttributes).forEach(key => {
                if (!Object.prototype.hasOwnProperty.call(state.gfiAttributes, key)) {
                    commit("setGFIAttribute", {key});
                }
                feature.unset("custom-attribute____" + key);
            });

            Object.keys(feature.getProperties()).forEach((key) => {
                if (["isOuterCircle", "drawState", "fromDrawTool", "invisibleStyle", "styleId", "source", "attributes", "isVisible", "isGeoCircle", "geoCircleCenter", "geoCircleRadius"].indexOf(key) >= 0) {

                    if (key !== "attributes" && key !== "drawState" && key !== "invisibleStyle" && key !== "masterportal_attributes") {
                        // transform "true" or "false" from KML to Boolean
                        let valueToSetForMasterportal = feature.get(key);

                        if (valueToSetForMasterportal === "true") {
                            valueToSetForMasterportal = true;
                        }
                        else if (valueToSetForMasterportal === "false") {
                            valueToSetForMasterportal = false;
                        }

                        masterportal_attributes[key] = valueToSetForMasterportal;
                    }

                    feature.unset(key);
                }
            });

            feature.set("masterportal_attributes", masterportal_attributes);

            if (feature.get("masterportal_attributes").isGeoCircle) {
                const circleCenter = feature.get("masterportal_attributes").geoCircleCenter.split(",").map(parseFloat),
                    circleRadius = parseFloat(feature.get("masterportal_attributes").geoCircleRadius);

                feature.setGeometry(new Circle(circleCenter, circleRadius));
            }
            if ((/true/).test(feature.get("masterportal_attributes").fromDrawTool) && feature.get("name") && feature.getGeometry().getType() === "Point") {
                const style = feature.getStyleFunction()(feature).clone();

                feature.setStyle(new Style({
                    image: new CircleStyle(),
                    text: new Text({
                        fill: style.getText().getFill(),
                        font: defaultFont,
                        scale: style.getText().getScale(),
                        text: style.getText().getText(),
                        textAlign: "left",
                        textBaseline: "bottom"
                    })
                }));
                feature.get("masterportal_attributes").drawState = {
                    fontSize: parseInt(defaultFont.split("px")[0], 10) * style.getText().getScale(),
                    text: style.getText().getText(),
                    color: style.getText().getFill().getColor()
                };
            }
            if (feature.getGeometry() === null) {
                featureError = true;
                alertingMessage = {
                    category: "error",
                    content: i18next.t("common:modules.fileImport.alertingMessages.featureError")
                };

                dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            }
            else {
                if (feature.getGeometry().getType() === "GeometryCollection") {
                    geometries = feature.getGeometry().getGeometries();
                }
                else {
                    geometries = [feature.getGeometry()];
                }

                geometries.forEach(geometry => {
                    let mappedCrsPropName = crsPropName;

                    if ((crsPropName === "urn:ogc:def:crs:EPSG:6.6:4326") ||
                       (crsPropName === "urn:ogc:def:crs:OGC:1.3:CRS84") ||
                       (crsPropName === "urn:ogc:def:crs:OGC:1.3:CRS:84") ||
                       (crsPropName === "urn:ogc:def:crs:OGC:2:84") ||
                       (crsPropName === "urn:x-ogc:def:crs:EPSG:4326")) {
                        mappedCrsPropName = "EPSG:4326";
                    }
                    else if ((crsPropName === "EPSG:102100") ||
                        (crsPropName === "EPSG:102113") ||
                        (crsPropName === "EPSG:900913") ||
                        (crsPropName === "urn:ogc:def:crs:EPSG:6.18:3:3857")) {
                        mappedCrsPropName = "EPSG:3857";
                    }
                    geometry.transform(mappedCrsPropName, rootGetters["Maps/projectionCode"]);
                    feature.set("source", fileName);
                });
            }
            if (typeof feature.get === "function" && typeof feature.get("masterportal_attributes").styleId === "undefined") {
                feature.get("masterportal_attributes").styleId = uniqueId("");
            }
        });

        features = checkIsVisibleSetting(features);

        vectorLayer.getSource().addFeatures(features);
        vectorLayer.set("gfiAttributes", state.gfiAttributes);

        if (featureError) {
            alertingMessage = {
                category: "error",
                content: i18next.t("common:modules.fileImport.alertingMessages.successPartly", {filename: fileName})
            };
        }
        else {
            alertingMessage = {
                category: "success",
                content: i18next.t("common:modules.fileImport.alertingMessages.success", {filename: fileName})
            };
        }

        if (state.showConfirmation) {
            dispatch("Alerting/addSingleAlert", {
                category: alertingMessage.category,
                content: alertingMessage.content
            }, {root: true});
        }
        dispatch("addImportedFilename", fileName);

        if (state.enableZoomToExtend && features.length) {
            dispatch("setFeatureExtents", {features: features, fileName: fileName});
        }
    },

    /**
     * Imports the given GeoJSON file from datasrc.raw, creating the features into datasrc.layer.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the root getters
     * @param {Object} datasrc data source to import, with properties filename, layer and raw.
     * @returns {void}
     */
    importGeoJSON ({state, dispatch, rootGetters, commit}, datasrc) {
        const vectorLayer = datasrc.layer,
            fileName = datasrc.filename,
            format = getFormat(fileName, state.selectedFiletype, state.supportedFiletypes, supportedFormats),
            fileDataProjection = getCrsPropertyName(datasrc.raw);

        let
            alertingMessage,
            features;

        if (format === false) {
            const fileNameSplit = fileName.split("."),
                fileFormat = fileNameSplit.length > 0 ? "*." + fileNameSplit[fileNameSplit.length - 1] : "unknown";

            alertingMessage = {
                category: "error",
                content: i18next.t("common:modules.fileImport.alertingMessages.missingFormat", {format: fileFormat})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        try {
            features = format.readFeatures(datasrc.raw, {
                dataProjection: fileDataProjection,
                featureProjection: rootGetters["Maps/projectionCode"]
            });
        }
        catch (ex) {
            console.warn(ex);
            alertingMessage = {
                category: "error",
                content: i18next.t("common:modules.fileImport.alertingMessages.formatError", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (!Array.isArray(features) || features.length === 0) {
            alertingMessage = {
                category: "error",
                content: i18next.t("common:modules.fileImport.alertingMessages.missingFileContent", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        vectorLayer.setStyle((feature) => {
            const drawState = feature.getProperties()?.masterportal_attributes?.drawState,
                customStyles = state.customAttributeStyles[fileName];
            let style;

            if (!drawState && !customStyles) {
                const defaultColor = [226, 26, 28, 0.9],
                    defaultFillColor = [228, 26, 28, 0.5],
                    defaultPointSize = 16,
                    defaultStrokeWidth = 1,
                    defaultCircleRadius = 300,
                    geometryType = feature ? feature.getGeometry().getType() : "Cesium";

                if (geometryType === "Point" || geometryType === "MultiPoint") {
                    style = createDrawStyle(defaultColor, defaultColor, geometryType, defaultPointSize, 1, 1);
                }
                else if (geometryType === "LineString" || geometryType === "MultiLineString") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultColor,
                            width: defaultStrokeWidth
                        })
                    });
                }
                else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultColor,
                            width: defaultStrokeWidth
                        }),
                        fill: new Fill({
                            color: defaultFillColor
                        })
                    });
                }
                else if (geometryType === "Circle") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultColor,
                            width: defaultStrokeWidth
                        }),
                        fill: new Fill({
                            color: defaultFillColor
                        }),
                        circleRadius: defaultCircleRadius,
                        colorContour: defaultColor
                    });
                }
                else {
                    console.warn("Geometry type not implemented: " + geometryType);
                    style = new Style();
                }

                return style.clone();
            }

            if (drawState?.drawType.geometry === "Point") {
                if (drawState.text) {
                    style = new Style({
                        image: new CircleStyle({
                        }),
                        text: new Text({
                            text: drawState.text,
                            font: drawState.fontSize + "px Arial,sans-serif",
                            fill: new Fill({
                                color: drawState.color
                            })
                        })
                    });
                }
                else if (drawState?.symbol.value !== "simple_point") {
                    style = new Style({
                        image: new Icon({
                            crossOrigin: "anonymous",
                            src: drawState.symbol.value.indexOf("/") > 0 ? drawState.symbol.value : drawState.imgPath + drawState.symbol.value,
                            scale: drawState.symbol.scale
                        })
                    });
                }
                else {
                    style = createDrawStyle(drawState?.color, drawState?.color, drawState?.drawType.geometry, drawState?.pointSize, 1, drawState?.zIndex);
                }
            }
            else if (drawState?.drawType.geometry === "LineString" || drawState?.drawType.geometry === "MultiLineString") {
                style = new Style({
                    stroke: new Stroke({
                        color: drawState.colorContour,
                        width: drawState.strokeWidth
                    })
                });
            }
            else if (drawState?.drawType.geometry === "Polygon" || drawState?.drawType.geometry === "MultiPolygon") {
                style = new Style({
                    stroke: new Stroke({
                        color: drawState.colorContour,
                        width: drawState.strokeWidth
                    }),
                    fill: new Fill({
                        color: drawState.color
                    })
                });
            }
            else if (drawState?.drawType.geometry === "Circle") {
                style = new Style({
                    stroke: new Stroke({
                        color: drawState.colorContour,
                        width: drawState.strokeWidth
                    }),
                    fill: new Fill({
                        color: drawState.color
                    }),
                    circleRadius: drawState.circleRadius,
                    circleOuterRadius: drawState.circleOuterRadius,
                    colorContour: drawState.colorContour,
                    outerColorContour: drawState.outerColorContour
                });
            }
            else if (!drawState && customStyles) {
                const geometryType = feature ? feature.getGeometry().getType() : "Cesium",
                    featureAttribute = feature.get(customStyles[0].attribute),
                    featureColor = customStyles.find(attribute => {
                        return attribute.attributeValue === featureAttribute || attribute.attributeValue === "none";
                    }).attributeColor,
                    defaultPointSize = 16,
                    defaultStrokeWidth = 2,
                    defaultCircleRadius = 300,
                    defaultStrokeColor = [169, 159, 163, 0.9];

                if (geometryType === "Point" || geometryType === "MultiPoint") {
                    style = createDrawStyle(featureColor, featureColor, geometryType, defaultPointSize, 1, 1);
                }
                else if (geometryType === "LineString" || geometryType === "MultiLineString") {
                    style = new Style({
                        stroke: new Stroke({
                            color: featureColor,
                            width: defaultStrokeWidth
                        })
                    });
                }
                else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultStrokeColor,
                            width: defaultStrokeWidth
                        }),
                        fill: new Fill({
                            color: featureColor
                        })
                    });
                }
                else if (geometryType === "Circle") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultStrokeColor,
                            width: defaultStrokeWidth
                        }),
                        fill: new Fill({
                            color: featureColor
                        }),
                        circleRadius: defaultCircleRadius,
                        colorContour: featureColor
                    });
                }

                feature.set("styleId", featureAttribute);
            }
            else {
                console.warn("Geometry type not implemented: " + drawState.drawType.geometry);
                style = new Style();
            }

            return style.clone();
        });

        features.forEach(feature => {
            if (feature.get("fromDrawTool") && !feature.get("masterportal_attributes")) {
                // move old styling properties which were set in the export from the draw tool to a neu structure
                // within masterportal_attributes in accordance to the new structure set by the draw tool
                const attributes = {},
                    masterportal_attributes = {};

                masterportal_attributes.drawState = feature.getProperties().drawState;
                masterportal_attributes.invisibleStyle = feature.getProperties().invisibleStyle;

                Object.keys(feature.getProperties()).forEach((key) => {
                    if (["isOuterCircle", "drawState", "fromDrawTool", "invisibleStyle", "styleId", "source", "attributes", "isVisible", "isGeoCircle", "geoCircleCenter", "geoCircleRadius"].indexOf(key) >= 0) {

                        if (key !== "attributes" && key !== "drawState" && key !== "invisibleStyle") {
                            masterportal_attributes[key] = feature.get(key);
                        }

                        feature.unset(key);
                    }
                });

                attributes.masterportal_attributes = masterportal_attributes;
                feature.setProperties(attributes);
            }

            if (isObject(feature.getProperties())) {
                Object.keys(feature.getProperties()).forEach(key => {
                    if (key !== "geometry" && key !== "isVisible" && key !== "masterportal_attributes") {
                        if (!Object.prototype.hasOwnProperty.call(state.gfiAttributes, key)) {
                            commit("setGFIAttribute", {key});
                        }
                    }
                });

                // check if "isVisible"-Property is set in masterportal_attributes
                if (!Object.prototype.hasOwnProperty.call(feature.getProperties(), "masterportal_attributes")) {
                    feature.set("masterportal_attributes", {isVisible: true});
                }
                else if (!Object.prototype.hasOwnProperty.call(feature.get("masterportal_attributes"), "isVisible")) {
                    feature.get("masterportal_attributes").isVisible = true;
                }
            }

            if (vectorLayer.getStyleFunction()(feature) !== undefined) {
                feature.setStyle(vectorLayer.getStyleFunction()(feature));
            }

            if (isObject(feature.get("masterportal_attributes")) && feature.get("masterportal_attributes").isGeoCircle) {
                const circleCenter = feature.get("masterportal_attributes").geoCircleCenter.split(",").map(parseFloat),
                    circleRadius = parseFloat(feature.get("masterportal_attributes").geoCircleRadius);

                feature.setGeometry(new Circle(circleCenter, circleRadius));

                // Transformation here is necessary because all other geometries have already been transformed within "format.readFeatures(..."
                feature.getGeometry().transform(fileDataProjection, rootGetters["Maps/projectionCode"]);
            }

            feature.set("source", fileName);
            // set a feature id just in case the feature has an id that is already set on a previously imported feature
            feature.setId(state.geojsonFeatureId);
            commit("setGeojsonFeatureId");
            vectorLayer.getSource().addFeature(feature);
        });

        if (Object.keys(state.gfiAttributes).length > 0) {
            vectorLayer.set("gfiAttributes", state.gfiAttributes);

            dispatch("replaceByIdInLayerConfig", {
                layerConfigs: [{
                    id: state.layerId,
                    layer: state.gfiAttributes
                }]
            }, {root: true});
        }

        alertingMessage = {
            category: "success",
            content: i18next.t("common:modules.fileImport.alertingMessages.success", {filename: fileName})
        };

        if (state.showConfirmation) {
            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
        }
        dispatch("addImportedFilename", fileName);

        if (state.enableZoomToExtend && features.length) {
            dispatch("setFeatureExtents", {features: features, fileName: fileName});
        }
    },

    /**
     * Adds the name of a successfully imported file to list of imported filenames
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {String} fileName name of the file
     * @returns {void}
     */
    addImportedFilename ({state, commit}, fileName) {
        const fileNames = [... state.importedFileNames];

        fileNames.push(fileName);
        commit("setImportedFileNames", fileNames);
    },

    /**
     * Adds a layer Config to app-store layerConfigs
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @returns {ol/layer} The created layer.
     */
    async addLayerConfig ({dispatch, state}) {
        if (!layerCollection.getLayerById(state.layerId)) {
            await dispatch("addLayerToLayerConfig", {
                layerConfig: {
                    id: state.layerId,
                    name: "importDrawLayer",
                    showInLayerTree: true,
                    typ: "VECTORBASE",
                    type: "layer",
                    visibility: true
                },
                parentKey: treeSubjectsKey
            }, {root: true});
        }

        return layerCollection.getLayerById(state.layerId);
    },

    /**
     * Opens the draw tool in the secondary Menu
     * @returns {void}
     */
    openDrawTool ({dispatch, rootGetters}) {
        const menuSide = "secondaryMenu",
            menuExpanded = "Menu/expanded";

        dispatch("Menu/changeCurrentComponent", {type: "draw_old", side: menuSide, props: {name: i18next.t("common:modules.draw_old.name")}}, {root: true});

        if (!rootGetters[menuExpanded](menuSide)) {
            dispatch("Menu/toggleMenu", menuSide, {root: true});
        }
    }
};
