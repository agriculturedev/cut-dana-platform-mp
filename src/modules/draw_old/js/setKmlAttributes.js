import Feature from "ol/Feature";

/**
 * Sets the attributes of each feature as requested by the converting function.
 * @param {ol/Feature[]} features - An array of features.
 * @returns {ol/Feature[]|Boolean} The features incl. the necessary attributes. False if the given parameter is not an array.
 */
export function setKmlAttributes (features) {
    if (!Array.isArray(features)) {
        return false;
    }

    features.forEach(feature => {
        if (feature instanceof Feature && !Object.prototype.hasOwnProperty.call(feature.getProperties(), "attributes")) {
            feature.set("attributes", {});

            Object.keys(feature.getProperties()).forEach(key => {
                if (!["masterportal_attributes", "geometry", "attributes"].includes(key)) {
                    feature.get("attributes")[key] = feature.get(key);
                }
            });

            if (Object.prototype.hasOwnProperty.call(feature.getProperties(), "masterportal_attributes")) {
                Object.keys(feature.get("masterportal_attributes")).forEach(key => {
                    feature.set(key, feature.get("masterportal_attributes")[key]);
                });
            }
        }
    });

    return features;
}

