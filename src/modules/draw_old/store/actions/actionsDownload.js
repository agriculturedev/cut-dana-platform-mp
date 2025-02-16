import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import {GeoJSON, GPX} from "ol/format.js";
import convertFeaturesToKml from "../../../../shared/js/utils/convertFeaturesToKml.js";
import {convertJsonToCsv} from "../../../../shared/js/utils/convertJsonToCsv";
import {setCsvAttributes} from "../../js/setCsvAttributes.js";
import {setKmlAttributes} from "../../js/setKmlAttributes.js";
import {transform, transformPoint, transformGeometry} from "../../js/download/transformGeometry";
import main from "../../js/main";

/**
 * Converts the features from OpenLayers Features to features in the chosen format.
 *
 * @param {module:ol/format} format Format in which the features should be saved.
 * @returns {String} The features written in the chosen format as a String.
 */
async function convertFeatures ({state, dispatch}, format) {
    const convertedFeatures = [];

    for (const feature of state.download.features) {
        const cloned = feature.clone(),
            transCoords = await dispatch("transformCoordinates", cloned.getGeometry());

        if (transCoords.length === 3 && transCoords[2] === 0) {
            transCoords.pop();
        }

        cloned.getGeometry().setCoordinates(transCoords, "XY");
        convertedFeatures.push(cloned);
    }

    return format.writeFeatures(convertedFeatures);
}
/**
 * Resets values to hide the UI for the Download and not cause side effects while doing so.
 *
 * @returns {void}
 */
function fileDownloaded ({state, commit}) {
    commit("setDownloadSelectedFormat", state.download.selectedFormat);
}
/**
 * Converts the features to the chosen format and saves it in the state.
 *
 * @returns {void}
 */
async function prepareData ({state, commit, dispatch, rootGetters}) {
    let features = "";

    switch (state.download.selectedFormat) {
        case "GEOJSON":
            features = await dispatch("convertFeatures", new GeoJSON());
            break;
        case "GPX":
            features = await dispatch("convertFeatures", new GPX());
            break;
        case "KML":
            features = setKmlAttributes(state.download.features);

            features = await convertFeaturesToKml(features);
            break;
        case "CSV":
            features = setCsvAttributes(state.download.features, rootGetters["Maps/projection"].getCode());

            features = Array.isArray(features) ? convertJsonToCsv(features.map(feature => feature.get("csv_attributes")), false, state.semicolonCSVDelimiter) : "";
            break;
        case "none":
            commit("setDownloadSelectedFormat", "");
            break;
        default:
            break;
    }

    commit("setDownloadDataString", features);
}
/**
 * Prepares the download.
 * If the user is using Internet Explorer as a Browser a Blob is used, otherwise the download is accomplished through the href & download combo on an anchor tag.
 *
 * @returns {void}
 */
function prepareDownload ({state, commit, dispatch}) {
    dispatch("validateFileName").then(fileName => {
        if (fileName && fileName !== "") {
            const dataString = state.download.dataString,
                url = `data:text/plain;charset=utf-8,${encodeURIComponent(dataString)}`;

            commit("setDownloadFile", fileName);
            commit("setDownloadFileUrl", url);
        }
    }).catch(err => {
        console.error(err);
    });
}
/**
 * Commits the current features of the draw layer to the state.
 * Action is dispatched when a feature is drawn, edited or deleted.
 * NOTE: When a feature is an instance of ol/Circle, it is converted to a ol/Polygon first.
 *
 * @returns {void}
 */
function setDownloadFeatures ({state, commit, dispatch, rootGetters}) {
    const downloadFeatures = [],
        drawnFeatures = main.getApp().config.globalProperties.$layer.getSource().getFeatures();

    drawnFeatures?.forEach(drawnFeature => {
        const feature = drawnFeature.clone(),
            geometry = feature.getGeometry();

        // If the feature is invisible from filter, the style will be reset by printing.
        if (!feature.get("masterportal_attributes").isVisible && feature.get("masterportal_attributes").invisibleStyle) {
            feature.setStyle(feature.get("masterportal_attributes").invisibleStyle);
        }

        if (state.oldStyle && typeof state.selectedFeature?.get === "function"
            && drawnFeature.get("masterportal_attributes").styleId === state.selectedFeature.get("masterportal_attributes").styleId
            && (typeof drawnFeature.get("masterportal_attributes").styleId === "number" || typeof drawnFeature.get("masterportal_attributes").styleId === "string")
        ) {
            feature.setStyle(state.oldStyle);
        }

        if (geometry instanceof Circle) {
            feature.setGeometry(fromCircle(geometry));
            // transform after setting geometry, transformed coordinates are only for center and radius
            transformGeometry(rootGetters["Maps/projection"].getCode(), geometry);
            feature.set("masterportal_attributes", Object.assign(feature.get("masterportal_attributes") ?? {}, {
                "isGeoCircle": true,
                "geoCircleCenter": geometry.getCenter().join(","),
                "geoCircleRadius": geometry.getRadius()
            }));
        }

        downloadFeatures.push(feature);
    });

    commit("setDownloadFeatures", downloadFeatures);
    dispatch("prepareData");
    dispatch("prepareDownload");
}
/**
 * Commits the input of the user for the name of the file to the state.
 * If at least one feature is already drawn, the download is prepared.
 * If the user entered a name for a file and has chosen a format for the features, the download button is enabled.
 *
 * @param {Event} event Event fired by changing the input for the name of the file.
 * @param {HTMLInputElement} event.currentTarget The HTML input element for the name of the file.
 * @returns {void}
 */
function setDownloadFileName ({commit, dispatch}, {currentTarget}) {
    const {value} = currentTarget;

    commit("setDownloadFileName", value);

    if (main.getApp().config.globalProperties.$layer.getSource().getFeatures().length > 0) {
        dispatch("prepareDownload");
    }
}
/**
 * Commits the selection of the user for file format to the state.
 * If at least one feature is already drawn, they are converted to the chosen format and the download is prepared.
 * If the user entered a name for a file and has chosen a format for the features, the download button is enabled.
 *
 * @param {Event} event Event fired by selecting a different element.
 * @param {String} value The selected option value from dropdown or pre selected value.
 * @returns {void}
 */
async function setDownloadSelectedFormat ({commit, dispatch}, value) {

    commit("setDownloadSelectedFormat", value);
    if (main.getApp().config.globalProperties.$layer.getSource().getFeatures().length > 0) {
        await dispatch("setDownloadFeatures");
        await dispatch("prepareData");
        dispatch("prepareDownload");
    }
}
/**
 * Transforms the given geometry from EPSG:25832 to EPSG:4326.
 * If the geometry is not an instance of ol/LineString, ol/Point or ol/Polygon an Alert is send to the user.
 *
 * @param {module:ol/geom/Geometry} geometry Geometry to be transformed.
 * @returns {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)} The transformed Geometry or an empty array.
 */
function transformCoordinates ({dispatch, rootGetters}, geometry) {
    const coords = geometry.getCoordinates(),
        type = geometry.getType(),
        alert = {
            category: "error",
            content: i18next.t("common:modules.draw_old.download.unknownGeometry", {geometry: type}),
            displayClass: "error",
            multipleAlert: true
        };

    switch (type) {
        case "LineString":
            return transform(rootGetters["Maps/projection"].getCode(), coords, false);
        case "Point":
            return transformPoint(rootGetters["Maps/projection"].getCode(), coords);
        case "Polygon":
            return transform(rootGetters["Maps/projection"].getCode(), coords, true);
        default:
            dispatch("Alerting/addSingleAlert", alert, {root: true});
            return [];
    }
}
/**
 * Checks whether the user has added the suffix of the chosen format to the filename and if not, it is added.
 *
 * @returns {String} Returns the filename including the suffix of the chosen format; returns and empty String if either the filename or the format has not been chosen yet.
 */
function validateFileName ({state}) {
    const {fileName, selectedFormat} = state.download;

    if (fileName.length > 0 && selectedFormat.length > 0) {
        const suffix = `.${selectedFormat.toLowerCase()}`;

        return fileName.toLowerCase().endsWith(suffix) ? fileName : fileName + suffix;
    }
    return "";
}

export {
    convertFeatures,
    fileDownloaded,
    prepareData,
    prepareDownload,
    setDownloadFeatures,
    setDownloadFileName,
    setDownloadSelectedFormat,
    transformCoordinates,
    validateFileName
};
