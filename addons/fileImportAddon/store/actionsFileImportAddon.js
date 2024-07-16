import {KML, GeoJSON, GPX} from "ol/format.js";
import uniqueId from "../../../src/utils/uniqueId.js";
import Circle from "ol/geom/Circle";

const supportedFormats = {
    kml: new KML({extractStyles: true}),
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

    // ... remove more tags eventually

    return result;
}

/**
 * In case the kml file is from old atlas_innere_sicherheit, the raw source data will be parsed into the format of masterportal
 * @param {String} rawData - KML source Data as string.
 * @param {Object} pointImages - the images file and color code of the icon according to the point color style
 * @param {Object} textColors - the color with key and color code of the point text style
 * @param {Object} textSizes - the text sizes with key and scale value of the point text style
 * @returns {String} Returns the parsed data from kml source data
 */
function getParsedData (rawData, pointImages, textColors, textSizes) {
    const xmlDoc = new DOMParser().parseFromString(rawData, "text/xml"),
        placeMarks = xmlDoc.getElementsByTagName("Placemark");

    if (xmlDoc.getElementsByTagName("kml").length &&
        xmlDoc.getElementsByTagName("kml")[0].attributes.xmlns.value.includes("/2.0") &&
        xmlDoc.getElementsByTagName("Folder").length) {

        Array.prototype.forEach.call(placeMarks, placemark => {
            const styleAll = xmlDoc.getElementsByTagName("Style"),
                styleId = placemark.getElementsByTagName("styleUrl")[0].firstChild.nodeValue.replace("#", "");
            let styles = "";

            Array.prototype.forEach.call(styleAll, style => {
                if (style.attributes.id.value.includes(styleId)) {
                    styles = style;
                }
            });

            if (placemark.getElementsByTagName("Point").length) {
                if (styles.getElementsByTagName("IconStyle").length) {
                    // here is for the point only with image like taktical marks
                    const iconStyle = styles.getElementsByTagName("IconStyle")[0];

                    if (iconStyle.getElementsByTagName("color").length) {
                        iconStyle.removeChild(iconStyle.getElementsByTagName("color")[0]);
                    }
                    if (iconStyle.getElementsByTagName("colorMode")) {
                        iconStyle.removeChild(iconStyle.getElementsByTagName("colorMode")[0]);
                    }
                    iconStyle.getElementsByTagName("scale")[0].childNodes[0].nodeValue = "1";
                    placemark.getElementsByTagName("name")[0].childNodes[0].nodeValue = "";
                }
                else if (placemark.getElementsByTagName("Data").length && placemark.getElementsByTagName("Data")[0].attributes.name.value.includes("feature_name") &&
                    placemark.getElementsByTagName("Data")[1].attributes.name.value.includes("farbe")) {
                    // here is for the point only with text
                    const textColor = placemark.getElementsByTagName("Data")[1].getElementsByTagName("value")[0].childNodes[0].nodeValue,
                        textSize = placemark.getElementsByTagName("Data")[2].getElementsByTagName("value")[0].childNodes[0].nodeValue,
                        maskIcon = new DOMParser().parseFromString("<IconStyle><scale>0</scale><Icon><href>" + pointImages.blue[1] + "</href></Icon></IconStyle>", "text/xml");

                    Object.entries(textColors).forEach(([key, color]) => {
                        if (textColor === key) {
                            styles.getElementsByTagName("LabelStyle")[0].getElementsByTagName("color")[0].childNodes[0].nodeValue = color;
                        }
                    });

                    Object.entries(textSizes).forEach(([key, size]) => {
                        if (textSize === key) {
                            const maskScale = new DOMParser().parseFromString("<scale>" + size + "</scale>", "text/xml");

                            styles.getElementsByTagName("LabelStyle")[0].appendChild(maskScale.getElementsByTagName("scale")[0]);
                        }
                    });

                    placemark.getElementsByTagName("name")[0].childNodes[0].nodeValue = placemark.getElementsByTagName("Data")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue;

                    styles.appendChild(maskIcon.getElementsByTagName("IconStyle")[0]);
                }
                else if (placemark.getElementsByTagName("Data").length && placemark.getElementsByTagName("Data")[1].attributes.name.value.includes("umkreis_gruppe")) {
                    // here is for circle or double circle, to hide the point in the center
                    const maskIcon = new DOMParser().parseFromString("<IconStyle><scale>0</scale><Icon><href>" + pointImages.blue[1] + "</href></Icon></IconStyle>", "text/xml");

                    styles.appendChild(maskIcon.getElementsByTagName("IconStyle")[0]);
                    placemark.getElementsByTagName("name")[0].childNodes[0].nodeValue = "";
                }
                else if (!placemark.getElementsByTagName("ExtendedData").length) {
                    // here is for the point only with color
                    let iconImage;

                    if (styles.getElementsByTagName("LineStyle").length &&
                        styles.getElementsByTagName("LineStyle")[0].getElementsByTagName("color").length) {
                        const lineColor = styles.getElementsByTagName("LineStyle")[0].getElementsByTagName("color")[0].childNodes[0].nodeValue;

                        Object.entries(pointImages).forEach(([, pointImage]) => {
                            if (pointImage[0] === lineColor) {
                                iconImage = pointImage[1];
                            }
                        });
                    }

                    const maskIcon = new DOMParser().parseFromString("<IconStyle><scale>1</scale><Icon><href>" + iconImage + "</href></Icon></IconStyle>", "text/xml");

                    styles.appendChild(maskIcon.getElementsByTagName("IconStyle")[0]);
                    placemark.getElementsByTagName("name")[0].childNodes[0].nodeValue = "";
                }
                else {
                    placemark.getElementsByTagName("name")[0].childNodes[0].nodeValue = "";
                }
            }

            placemark.appendChild(styles);
        });
    }

    // Parsing damage accounts features to the feature which could be used for new AIS system
    Array.prototype.forEach.call(placeMarks, placemark => {
        if (placemark.getElementsByTagName("name").length &&
            placemark.getElementsByTagName("name")[0].childNodes.length &&
            placemark.getElementsByTagName("href").length &&
            placemark.getElementsByTagName("href")[0].childNodes.length) {
            const value = placemark.getElementsByTagName("name")[0].childNodes[0].nodeValue,
                img = placemark.getElementsByTagName("href")[0].childNodes[0].nodeValue;

            let parsedImg = "";

            if (img.includes("damage_account.jpg")) {
                parsedImg = img.replace("damage_account.jpg", "damage_account_" + value + ".jpg");
                placemark.getElementsByTagName("name")[0].childNodes[0].nodeValue = "";
                placemark.getElementsByTagName("href")[0].childNodes[0].nodeValue = parsedImg;
            }
        }
    });

    return xmlDoc;
}
/**
 * Adds the layer to theme tree under the menu Importierte Daten
 * @param {String} layerName - the name of layer from the imported file
 * @param {String} layerId - the id of layer from the imported file
 * @param {ol.Feature[]} features - all features generated from the imported file
 * @returns {void}
 */
function addLayerToTree (layerName, layerId, features) {
    if (Radio.request("Parser", "getItemByAttributes", {id: "importedData"}) === undefined) {
        Radio.trigger("Parser", "addFolder", "Importierte Daten", "importedData", "tree", 0);
        Radio.trigger("ModelList", "renderTree");
        document.getElementById("Overlayer").parentNode.appendChild(document.getElementById("importedData").parentNode);
    }

    Radio.trigger("Parser", "addVectorLayer", layerName, layerId, features, "importedData");
    Radio.trigger("ModelList", "closeAllExpandedFolder");
}

export default {
    setSelectedFiletype: ({commit}, newFiletype) => {
        commit("setSelectedFiletype", newFiletype);

    },

    importKML: ({state, dispatch}, datasrc) => {
        const
            checkSameLayer = datasrc.checkSameLayer,
            layerName = datasrc.layerName,
            layerId = "imported" + uniqueId("_"),
            format = getFormat(datasrc.filename, state.selectedFiletype, state.supportedFiletypes, supportedFormats);
        let
            featureError = false,
            alertingMessage,
            features,
            parsedData = datasrc.raw;

        if (Array.isArray(checkSameLayer) && checkSameLayer.length) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.fileImportAddon.alertingMessages.sameName", {filename: datasrc.filename.split(".")[0]})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (format instanceof KML) {
            parsedData = getParsedData(removeBadTags(datasrc.raw), datasrc.pointImages, datasrc.textColors, datasrc.textSizes);
        }

        if (format === false) {
            const fileNameSplit = datasrc.filename.split("."),
                fileFormat = fileNameSplit.length > 0 ? "*." + fileNameSplit[fileNameSplit.length - 1] : "unknown";

            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.fileImportAddon.alertingMessages.missingFormat", {format: fileFormat})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        try {
            features = format.readFeatures(parsedData);

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
                    const specialFormat = new KML({extractStyles: true, showPointNames: false}),
                        featuresNoPointNames = specialFormat.readFeatures(parsedData);

                    indices.forEach((index) => {
                        features[index] = featuresNoPointNames[index];
                    });
                }
            }
        }
        catch (ex) {
            console.warn(ex);
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.fileImportAddon.alertingMessages.formatError", {filename: datasrc.filename})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (!Array.isArray(features) || features.length === 0) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("additional:modules.tools.fileImportAddon.alertingMessages.missingFileContent", {filename: datasrc.filename})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        features.forEach(feature => {
            let geometries;

            if (feature.get("isGeoCircle")) {
                const circleCenter = feature.get("geoCircleCenter").split(",").map(parseFloat),
                    circleRadius = parseFloat(feature.get("geoCircleRadius"));

                feature.setGeometry(new Circle(circleCenter, circleRadius));
            }
            if (feature.getGeometry() === null) {
                featureError = true;
                alertingMessage = {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("additional:modules.tools.fileImportAddon.alertingMessages.featureError")
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
                    geometry.transform("EPSG:4326", "EPSG:25832");
                });
            }
        });

        if (featureError) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.info"),
                content: i18next.t("additional:modules.tools.fileImportAddon.alertingMessages.successPartly", {filename: datasrc.filename})
            };
        }
        else {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.info"),
                content: i18next.t("additional:modules.tools.fileImportAddon.alertingMessages.success", {filename: datasrc.filename})
            };
        }

        dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
        dispatch("addImportedFilename", datasrc.filename);
        addLayerToTree(layerName, layerId, features);
    },
    /**
     * Adds the name of a successfully imported file to list of imported filenames
     * @param {String} fileName name of the file
     * @returns {void}
     */
    addImportedFilename: ({state, commit}, fileName) => {
        const fileNames = [... state.importedFileNames];

        fileNames.push(fileName);
        commit("setImportedFileNames", fileNames);
    }
};
