/**
 * Prepares all MultiPolygon coordinates
 * @param {ol/Feature} multiPolygonFeatures array of features in MultiPolygon
 * @returns {Array} MultiPolygon coordinates with Polygons and holes
 */
export default function (multiPolygonFeatures) {
    const featureMap = new Map();
    let multiPolygonCoordinates = [],
        sortedFeatures = [];

    /**
     * 1. Drawn MultiPolygon features received as a function parameter are separated
     * into outer Features or inner Features with 'intersectsCoordinate' method.
     * Usage of JavaScript Map object enabled us to distinguish
     * which Polygons are (and if) drawn inside other Polygons.
     *
     * Each Map item has:
     * as a key: ol_uid of specific Features
     * as a value: object containing whole Feature and ol_uid of outer (or parent) Feature
     *
     * Example:
     * featureMap = {
     *  187: {outerId: "0", feature: Feature} // first drawn Polygon (outer)
     *  323: {outerId: "0", feature: Feature} // second drawn Polygon (outer)
     *  402: {outerId: "187", feature: Feature} // third drawn Polygon (inner, has id of outer Polygon)
     * }
     */
    for (let i = 0; i < multiPolygonFeatures.length; i++) {
        const iFeature = multiPolygonFeatures[i];
        let outerFeature = {};

        for (let j = 0; j < multiPolygonFeatures.length; j++) {
            const jFeature = multiPolygonFeatures[j];

            if (iFeature.ol_uid !== jFeature.ol_uid) {
                const isFeatureInner = iFeature.getGeometry()?.getCoordinates?.()?.[0]?.[0].every(coord => jFeature.getGeometry()?.intersectsCoordinate(coord));

                if (isFeatureInner) {
                    outerFeature = jFeature;
                }
            }
        }

        if (outerFeature?.ol_uid) {
            featureMap.set(iFeature.ol_uid, {outerId: outerFeature.ol_uid, feature: iFeature});
        }
        else {
            featureMap.set(iFeature.ol_uid, {outerId: "0", feature: iFeature});
        }
    }

    /**
     * 2. Created Map of all Features as 'featureMap' is being sorted in way that
     * every inner Feature is placed behind his outer Feature so it prepares further
     * MultiPolygon coordinates nested array and assigned to 'sortedFeatures' array
     */
    sortedFeatures = Array.from(featureMap).sort((a, b) => {
        const featureIdA = Number(a[1].outerId) === 0 ? Number(a[0]) : Number(a[1].outerId),
            featureIdB = Number(b[1].outerId) === 0 ? Number(b[0]) : Number(b[1].outerId);

        return featureIdA - featureIdB;
    });

    /**
     * 3. Based on 'sortedFeatures' array and Polygons' coordinates are being added to
     * multiPolygonCoordinates nested array in accordance with
     * GeoJSON specification https://www.rfc-editor.org/rfc/rfc7946#section-3.1.9
     */
    sortedFeatures.forEach(sFeature => {
        if (sFeature?.[1]?.outerId === "0") {
            multiPolygonCoordinates = [...multiPolygonCoordinates, ...sFeature[1].feature.getGeometry().getCoordinates()];
        }
        else {
            multiPolygonCoordinates[multiPolygonCoordinates.length - 1] = [
                ...multiPolygonCoordinates[multiPolygonCoordinates.length - 1],
                [...sFeature[1].feature.getGeometry().getCoordinates()[0][0]]
            ];
        }
    });
    return multiPolygonCoordinates;
}
