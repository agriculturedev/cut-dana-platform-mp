/**
 * Prepares all MultiPolygon coordinates
 * @param {ol/Feature} multiPolygonFeatures array of features in MultiPolygon
 * @returns {Array} MultiPolygon coordinates with Polygons and holes
 */
export default function (multiPolygonFeatures) {
    const featureMap = new Map();
    let multiPolygonCoordinates = [],
        sortedFeatures = [];

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

    sortedFeatures = Array.from(featureMap).sort((a, b) => {
        const parentIdA = Number(a[1].outerId) === 0 ? Number(a[0]) : Number(a[1].outerId),
            parentIdB = Number(b[1].outerId) === 0 ? Number(b[0]) : Number(b[1].outerId);

        return parentIdA - parentIdB;
    });

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
