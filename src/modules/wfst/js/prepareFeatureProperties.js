import wfs from "@masterportal/masterportalapi/src/layer/wfs";

/**
 * Prepares the possible feature properties to be set for
 * a DescribeFeatureType request and joins this together
 * with the gfiAttributes configuration of the layer.
 *
 * @param {TransactionLayer} layer Layer to retrieve information for.
 * @returns {FeatureProperty[]} If layer.gfiAttributes !== "ignore", then an array of prepared feature properties; else and empty array.
 */
async function prepareFeatureProperties (layer) {
    if (layer.gfiAttributes === "ignore") {
        return [];
    }
    let properties;

    try {
        properties = await wfs.receivePossibleProperties(layer.url, layer.version, layer.featureType, layer.isSecured);
    }
    catch (e) {
        console.error(e);
    }

    if (!properties) {
        return [];
    }

    return layer.gfiAttributes === "showAll"
        ? properties
        : properties
            .reduce((array, property) => property.type === "geometry" || layer.gfiAttributes[property.key] !== undefined
                ? [...array, {...property, label: layer.gfiAttributes[property.key]}]
                : array,
            []);
}

export default {prepareFeatureProperties};
