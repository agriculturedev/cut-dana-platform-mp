/**
 * Returns a position, at which a cylinder is above ground.
 * @param {Cesium.Entity} cylinder - the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function adaptCylinderToGround (cylinder, position) {
    const newPosition = position ? position : {x: 1, y: 1, z: 1},
        scene = mapCollection.getMap("3D").getCesiumScene(),
        cartographic = Cesium.Cartographic.fromCartesian(newPosition);

    cartographic.height = scene.globe.getHeight(cartographic) + cylinder.cylinder.length._value / 2;

    return Cesium.Cartographic.toCartesian(cartographic);
}

/**
 * Returns a position, at which a cylinder is above ground.
 * @param {Cesium.Entity} entity - the entity that should be ignored by sampleHeight
 * @param {Cesium.Entity} cylinder - the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function adaptCylinderToEntity (entity, cylinder, position) {
    const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
        scene = mapCollection.getMap("3D").getCesiumScene(),
        cartographic = Cesium.Cartographic.fromCartesian(position),
        outlines = entities.values.filter(ent => ent.outline && ent.polyline),
        sampledHeight = scene.sampleHeight(cartographic, [entity, cylinder, ...outlines]),
        heightDelta = entity?.polygon?.extrudedHeight - sampledHeight || sampledHeight;

    cylinder.cylinder.length = heightDelta + 5;

    cartographic.height = sampledHeight + cylinder.cylinder.length._value / 2;

    return Cesium.Cartographic.toCartesian(cartographic);
}

/**
 * Returns a position, at which a cylinder with the given length is above terrain.
 * @param {Cesium.Entity} cylinder - the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function adaptCylinderUnclamped (cylinder, position) {
    const newPosition = position ? position : {x: 1, y: 1, z: 1},
        cartographic = Cesium.Cartographic.fromCartesian(newPosition);

    cartographic.height += cylinder.cylinder.length._value / 2;

    return Cesium.Cartographic.toCartesian(cartographic);
}

/**
 * Returns the calculated area.
 * @param {Cesium.Cartesian3[]} positions - the entity from which the area is calculated.
 * @returns {Number} - the rounded area in meters.
 */
export function calculatePolygonArea (positions) {
    const indices = Cesium.PolygonPipeline.triangulate(positions, []);
    let area = 0;

    for (let i = 0; i < indices.length; i += 3) {
        const vector1 = positions[indices[i]],
            vector2 = positions[indices[i + 1]],
            vector3 = positions[indices[i + 2]],
            vectorC = Cesium.Cartesian3.subtract(vector2, vector1, new Cesium.Cartesian3()),
            vectorD = Cesium.Cartesian3.subtract(vector3, vector1, new Cesium.Cartesian3()),
            areaVector = Cesium.Cartesian3.cross(vectorC, vectorD, new Cesium.Cartesian3());

        area += Cesium.Cartesian3.magnitude(areaVector) / 2.0;
    }
    return Math.round(area * 100) / 100;
}

/**
 * Calculates the coordinates of a rotated point by performing a 2D rotation around a 3D point.
 * To transform without distortion, the coordinates are transferred to a local coordinate system
 * and transferred back after the rotation.
 * @param {object} angle - The angle.
 * @param {object} center - The center point.
 * @param {object} position - The position of the point.
 * @returns {object} The rotated coordinates.
 */
export function calculateRotatedPointCoordinates ({angle, center, position}) {
    const localToGlobal = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartographic.toCartesian(center)),
        globalToLocal = Cesium.Matrix4.inverse(localToGlobal, new Cesium.Matrix4()),
        localPosition = Cesium.Matrix4.multiplyByPoint(globalToLocal, position, new Cesium.Cartesian3()),
        rotatedPosition = new Cesium.Cartesian3(
            localPosition.x * Math.cos(angle) - localPosition.y * Math.sin(angle),
            localPosition.x * Math.sin(angle) + localPosition.y * Math.cos(angle),
            localPosition.z
        );

    return Cesium.Matrix4.multiplyByPoint(localToGlobal, rotatedPosition, new Cesium.Cartesian3());
}
