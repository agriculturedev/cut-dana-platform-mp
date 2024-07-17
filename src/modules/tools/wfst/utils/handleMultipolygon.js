import store from "../../../../app-store";
import MultiPolygon from "ol/geom/MultiPolygon";
import Feature from "ol/Feature";

/**
 * @typedef {Object} FeatureMap
 * @property {string} outerId - The ID of the outer (parent) feature.
 * @property {ol.Feature} feature - The OpenLayers feature object.
 */

/**
 * @typedef {Object} SeparateMultiPolygonResult
 * @property {Map<string, FeatureMap>} featureMap - A map where keys are feature IDs and values are feature map items.
 * @property {boolean} isVoidFeature - Indicates if there is a void feature.
 */

/**
 * Handles and prepares coordinates for MultiPolygon features
 * @param {Array<ol.Feature>} multiPolygonFeatures - Array of Features representing a MultiPolygon
 * @param {ol.layer.Vector} drawLayer - The layer where the features are drawn
 * @returns {void}
 */
async function handleMultipolygon (multiPolygonFeatures, drawLayer) {
    const {featureMap, isVoidFeature} = await separateMultipolygon(multiPolygonFeatures),
        sortedFeatures = sortFeatureMap(featureMap);

    if (isVoidFeature && sortedFeatures) {
        fuseMultiPolygons(sortedFeatures, drawLayer);
    }
}

/**
 * Drawn MultiPolygon features received as a function parameter are separated
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
 * @param {Array<ol.Feature>} multiPolygonFeatures - Array of Features representing a MultiPolygon
 * @returns {SeparateMultiPolygonResult} - An Object containing the feature map and a boolean indicating if there is a void feature
 */
async function separateMultipolygon (multiPolygonFeatures) {
    const featureMap = new Map(),
        processedMultiPolygons = store.getters["Tools/Wfst/processedMultiPolygons"];
    let isVoidFeature = false,
        shouldCreateVoidFeature = false;

    for (let i = 0; i < multiPolygonFeatures.length; i++) {
        const iFeature = multiPolygonFeatures[i];
        let outerFeature = {};

        for (let j = 0; j < multiPolygonFeatures.length; j++) {
            const jFeature = multiPolygonFeatures[j];

            if (iFeature.ol_uid !== jFeature.ol_uid) {
                const isFeatureInner = iFeature.getGeometry()?.getCoordinates?.()?.[0]?.[0].every(coord => jFeature.getGeometry()?.intersectsCoordinate(coord));

                if (isFeatureInner && !processedMultiPolygons?.has(iFeature)) {
                    outerFeature = jFeature;
                    isVoidFeature = true;
                    shouldCreateVoidFeature = await validateVoidFeature();
                }
            }
        }

        if (outerFeature?.ol_uid && shouldCreateVoidFeature) {
            featureMap.set(iFeature.ol_uid, {outerId: outerFeature.ol_uid, feature: iFeature});
        }
        else {
            featureMap.set(iFeature.ol_uid, {outerId: "0", feature: iFeature});
            store.commit("Tools/Wfst/addProcessedMultiPolygon", iFeature);
        }
    }

    return {featureMap, isVoidFeature};
}

/**
 * Sorts the feature map so that every inner Feature is placed behind its outer Feature.
 * @param {Map<string, FeatureMap>} featureMap - The feature map to be sorted.
 * @returns {Array} - An array of sorted features.
 */
function sortFeatureMap (featureMap) {
    return Array.from(featureMap).sort((a, b) => {
        const featureIdA = Number(a[1].outerId) === 0 ? Number(a[0]) : Number(a[1].outerId),
            featureIdB = Number(b[1].outerId) === 0 ? Number(b[0]) : Number(b[1].outerId);

        return featureIdA - featureIdB;
    });
}

/**
 * Merges inner MultiPolygons into their corresponding outer MultiPolygons
 * For each inner feature, find its outer feature and append the inner coordinates
 * to the outer feature's coordinates. Remove the inner feature from the draw layer.
 * @param {Array} sortedFeatures - Array of sorted features from the draw layer.
 * @param {ol.layer.Vector} drawLayer - The layer where the features are drawn.
 * @returns {void}
 */
async function fuseMultiPolygons (sortedFeatures, drawLayer) {
    const innerFeatures = sortedFeatures.filter((sFeature) => {
        return sFeature?.[1]?.outerId !== "0";
    });

    if (innerFeatures) {
        for (const innerFeature of innerFeatures) {
            const outerFeatures = sortedFeatures.filter((sortedFeature) => sortedFeature[0] === innerFeature[1]?.outerId),
                outerFeature = outerFeatures.find((findOuterFeature) => findOuterFeature[0] === innerFeature[1]?.outerId),
                outerFeatureCoords = outerFeature[1]?.feature?.getGeometry()?.getCoordinates()?.[0],
                innerFeatureCoords = innerFeature[1]?.feature?.getGeometry()?.getCoordinates()?.[0];

            if (innerFeatureCoords && outerFeatureCoords) {
                outerFeatureCoords.push(...innerFeatureCoords);
            }
            outerFeature[1]?.feature?.getGeometry()?.setCoordinates([outerFeatureCoords]);
            drawLayer.getSource().removeFeature(innerFeature[1].feature);
        }
    }
}

/**
 * Validates if a void feature should be created by prompting the user for confirmation.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if a void feature should be created.
 */
async function validateVoidFeature () {
    let shouldCreateVoidFeature;

    await new Promise((resolve) => {
        store.dispatch("ConfirmAction/addSingleAction", {
            confirmCaption: i18next.t("common:modules.tools.wfsTransaction.confirmVoidFeatureCreation.confirmCaption"),
            denyCaption: i18next.t("common:modules.tools.wfsTransaction.confirmVoidFeatureCreation.denyCaption"),
            textContent: i18next.t("common:modules.tools.wfsTransaction.confirmVoidFeatureCreation.textContent"),
            actionConfirmedCallback: () => {
                shouldCreateVoidFeature = true;
                resolve();
            },
            actionDeniedCallback: () => {
                shouldCreateVoidFeature = false;
                resolve();
            }
        }, {root: true});
    });

    return shouldCreateVoidFeature;
}

/**
 * Builds a MultiPolygon by combining the coordinates of multiple features.
 * @param {Array<ol.Feature>} features - Array of features to be combined into a MultiPolygon.
 * @param {ol.layer.Vector} drawLayer  - The layer where the features are drawn.
 * @returns {Feature} - The resulting MultiPolygon geometry.
 */
function buildMultipolygon (features, drawLayer) {
    const coords = [];

    features.forEach((feature) => {
        coords.push(...feature.getGeometry().getCoordinates());
    });
    features[0]?.getGeometry()?.setCoordinates(coords);

    features.forEach((feature, index) => {
        if (index === 0) {
            return;
        }
        drawLayer.getSource().removeFeature(feature);
    });
    return features[0];
}

/**
 * Splits the outer features of a given array of features into separate features.
 * Each outer feature is split into multiple features, one for each coordinate array.
 * @param {Array<Feature>} features - The array of features to split.
 * @param {ol.layer.Vector} drawLayer - The layer where the features are drawn.
 * @returns {Array<Feature>} - The array of newly created features.
 */
async function splitOuterFeatures (features, drawLayer) {
    const newFeatures = new Set(),
        coordsArray = features[0].getGeometry().getCoordinates();

    coordsArray.forEach(coords => {
        const newFeature = new Feature({
            geometry: new MultiPolygon([coords])
        });

        newFeatures.add(newFeature);
    });

    features.forEach((feature, index) => {
        if (index !== 0) {
            const newFeature = feature.clone();

            newFeature.setId(feature.getId());
            newFeatures.add(newFeature);
        }
    });
    drawLayer.getSource().clear();
    newFeatures.forEach(feature => {
        drawLayer.getSource().addFeature(feature);
    });

    return Array.from(newFeatures);
}

export {handleMultipolygon, separateMultipolygon, sortFeatureMap, fuseMultiPolygons, validateVoidFeature, buildMultipolygon, splitOuterFeatures};
