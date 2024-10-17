export default {
    /**
     * Checks whether the given coordinate is within a Polygon.
     * @param {Object} feature feature to inspect
     * @param {Array} coordinates coordinates to check
     * @returns {Object|Boolean} - an object with polygonGeometryCoordinates and a boolean if a given coordinate is inside
     */
    checkIsCoordInsidePolygon: function (feature, coordinates) {
        if (feature) {
            return feature.getGeometry().intersectsCoordinate(coordinates);
        }
        return true;
    },
    /**
     * Determines a random coordinate given within a polygon.
     * @param {Array} coordinates the coordinates within a polygon.
     * @returns {Array} a random coordinate
     */
    getRandomCoordinate: function (coordinates) {
        if (Array.isArray(coordinates) && coordinates[coordinates.length - 1]) {
            const randomIndex = Math.floor(Math.random() * coordinates.length);

            return this.getRandomCoordinate(coordinates[randomIndex]);
        }
        return coordinates;
    },

    /**
     * Handels Geometry Collection for setting and showing markers:
     * Returns coordinates for first Point from a GeometryCollection if there is one.
     * @param {Object} feature feature to inspect
     * @param {Array} coordinates coordinates to check
     * @returns {Array} - coordinates from first Point or from hit coordinate
     */
    getFirstPointCoordinates: function (feature, coordinates) {
        const geomCollection = feature.getGeometry(),
            firstPoint = geomCollection.getGeometries().find(geom => geom.getType() === "Point");

        return firstPoint ? firstPoint.getCoordinates() : coordinates;
    }
};
