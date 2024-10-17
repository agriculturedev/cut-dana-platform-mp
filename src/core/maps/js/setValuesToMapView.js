/**
 * Sets the resolutions to map view.
 * Note: Resolutions must be set with underscore,
 * because ol accesses them when setting the zoom.
 * @param {ol/View} view The map view.
 * @param {String[]} resolutions The resolutions.
 * @returns {void}
 */
export function setResolutions (view, resolutions) {
    if (resolutions) {
        view.set("resolutions", resolutions);
        view.resolutions_ = resolutions;
    }
}

/**
 * Sets the map view settings to the map view.
 * @param {ol/View} view The map view.
 * @param {Object} mapViewSettings The map view settings.
 * @returns {void}
 */
export function setValues (view, mapViewSettings) {
    for (const [key, value] of Object.entries(mapViewSettings)) {
        if (key === "startCenter") {
            view.setCenter(value);
        }
        else if (key === "startResolution") {
            view.setResolution(value);
        }
        else if (key === "startZoomLevel") {
            view.setZoom(value);
        }
        else {
            view.set(key, value);
        }
    }
}
