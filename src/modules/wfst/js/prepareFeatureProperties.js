import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import getProxyUrl from "../../../../utils/getProxyUrl";

/**
 * Prepares the possible feature properties to be set for
 * a DescribeFeatureType request and joins this together
 * with the gfiAttributes configuration of the layer.
 *
 * @param {TransactionLayer} layer Layer to retrieve information for.
 * @param {Boolean} useProxy Whether a proxy should be used for requests. Deprecated in v3.0.0.
 * @returns {FeatureProperty[]} If layer.gfiAttributes !== "ignore", then an array of prepared feature properties; else and empty array.
 */
async function prepareFeatureProperties (layer, useProxy) {
    const isGfiAttributesIgnore = layer.gfiAttributes === "ignore",
        isGfiAttributesShowAll = layer.gfiAttributes === "showAll",
        isGfiAttributesNestedObject = Object?.values(layer.gfiAttributes)?.find(gfiAttr => typeof gfiAttr === "object" && gfiAttr !== null && !Array.isArray(gfiAttr)),
        url = useProxy ? getProxyUrl(layer.url) : layer.url;

    let properties,
        propertiesWithBooleans = [],
        preparedProperties = [];

    if (isGfiAttributesIgnore) {
        return [];
    }

    try {
        properties = await wfs.receivePossibleProperties(url, layer.version, layer.featureType, layer.isSecured);
    }
    catch (e) {
        console.error(e);
    }

    if (!properties) {
        return [];
    }

    propertiesWithBooleans = properties.map(property => property.type === "boolean" && property.value === null ? {...property, valid: true, value: false} : property);

    if (isGfiAttributesShowAll) {
        preparedProperties = propertiesWithBooleans;
    }
    else if (isGfiAttributesNestedObject) {
        preparedProperties = propertiesWithBooleans
            .reduce((array, property) => {
                return property.type === "geometry" || Object.keys(layer.gfiAttributes[property.key]) !== undefined
                    ? [...array, {
                        ...property,
                        label: typeof layer.gfiAttributes[property.key] === "string"
                            ? layer.gfiAttributes[property.key]
                            : layer.gfiAttributes[property.key]?.name}]
                    : array;
            },
            []);
    }
    else {
        preparedProperties = propertiesWithBooleans
            .reduce((array, property) => property.type === "geometry" || layer.gfiAttributes[property.key] !== undefined
                ? [...array, {...property, label: layer.gfiAttributes[property.key]}]
                : array,
            []);
    }

    return preparedProperties;
}

export default {prepareFeatureProperties};
