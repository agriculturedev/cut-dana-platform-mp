/**
 * Adds the given centerPoint to the properties of the GeoJSON.
 * @param {Object} centerPoint Object representing a Point. Includes the type and the coordinates.
 * @param {String} geoJSON GeoJSON represented as a JSON String.
 * @returns {void}
 */
function postDrawEnd (centerPoint, geoJSON) {
    const geoJSONAddCenter = JSON.parse(geoJSON);

    if (geoJSONAddCenter.features[0].properties === null) {
        geoJSONAddCenter.features[0].properties = {};
    }
    geoJSONAddCenter.features[0].properties.centerPoint = centerPoint;
}

export default postDrawEnd;
