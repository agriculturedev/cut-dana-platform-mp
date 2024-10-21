import {WKT} from "ol/format.js";
import isObject from "../../../shared/js/utils/isObject";
import Feature from "ol/Feature";

/**
 * Sets the geometry of each feature as WKT and epsg to its attributes.
 * @param {ol/Feature[]} features - An array of features.
 * @param {String} code The EPSG-Code in which the features are coded.
 * @returns {ol/Feature[]|Boolean} The features incl. the wkt geometries. False if the given parameter is not an array.
 */
export function setCsvAttributes (features, code) {
    if (!Array.isArray(features)) {
        return false;
    }
    const wktParser = new WKT();

    features.forEach(feature => {
        if (feature instanceof Feature) {
            const wktGeometry = wktParser.writeGeometry(feature.getGeometry());

            if (!isObject(feature.get("csv_attributes"))) {
                feature.set("csv_attributes", {});
            }
            feature.get("csv_attributes").geometry = wktGeometry;
            feature.get("csv_attributes").epsg = code;

            Object.keys(feature.getProperties()).forEach(key => {
                if (!["masterportal_attributes", "geometry", "csv_attributes"].includes(key)) {
                    feature.get("csv_attributes")[key] = feature.get(key);
                }
            });
        }
    });

    return features;
}

