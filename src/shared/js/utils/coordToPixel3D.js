import crs from "@masterportal/masterportalapi/src/crs";

/**
 * Returns the pixel in 3D map, calculated by the given coordinates.
 * @param {Array} clickCoordinates the clicked coordinates
 * @returns {Array} the pixel in 3D map.
 */
function coordToPixel3D (clickCoordinates) {
    const scene = mapCollection.getMap("3D").getCesiumScene(),
        coordWGS84 = crs.transform(
            crs.getMapProjection(mapCollection.getMap("2D")),
            "EPSG:4326",
            clickCoordinates
        ),
        fromDegrees = Cesium.Cartesian3.fromDegrees(coordWGS84[0], coordWGS84[1]),
        windowCoord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, fromDegrees),
        clickPixels = [parseInt(windowCoord.x.toFixed(0), 10), parseInt(windowCoord.y.toFixed(0), 10)];

    return clickPixels;
}

export default {
    coordToPixel3D
};
