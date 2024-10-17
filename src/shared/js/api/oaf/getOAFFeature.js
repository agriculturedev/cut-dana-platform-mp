import axios from "axios";
import isObject from "../../utils/isObject";
import {GeoJSON} from "ol/format";
import {getUniqueValuesFromFetchedFeatures} from "../../../../modules/filter/utils/fetchAllOafProperties";

/**
 * Gets all features of given collection.
 * @param {String} baseUrl The base url.
 * @param {String} collection The collection.
 * @param {Number} limit The limit of features per request.
 * @param {String} [filter] The filter. See https://ogcapi.ogc.org/features/ for more information.
 * @param {String} [filterCrs] The filter crs. Needs to be set if a filter is used.
 * @param {String} [crs] The coordinate reference system of the response geometries.
 * @param {String[]} [propertyNames] The property names to narrow the request.
 * @returns {Promise} An promise which resolves an array of oaf features.
 */
async function getOAFFeatureGet (baseUrl, collection, limit = 400, filter = undefined, filterCrs = undefined, crs = undefined, propertyNames = undefined, skipGeometry = false) {
    if (typeof baseUrl !== "string") {
        return new Promise((resolve, reject) => {
            reject(new Error(`Please provide a valid base url! Got ${baseUrl}`));
        });
    }
    if (typeof collection !== "string") {
        return new Promise((resolve, reject) => {
            reject(new Error(`Please provide a collection! Got ${collection}`));
        });
    }
    if (typeof filter !== "undefined" && typeof filterCrs === "undefined") {
        return new Promise((resolve, reject) => {
            reject(new Error(`Please provide a valid crs for the oaf filter! Got ${filterCrs}`));
        });
    }
    const url = `${baseUrl}/collections/${collection}/items?limit=${limit}`,
        result = [];
    let extendedUrl = filter ? `${url}&filter=${filter}&filter-crs=${filterCrs}&crs=${crs}` : url;

    if (Array.isArray(propertyNames)) {
        extendedUrl += `&properties=${propertyNames.join(",")}`;
    }

    if (skipGeometry) {
        extendedUrl += `&skipGeometry=${skipGeometry}`;
    }

    return this.oafRecursionHelper(result, extendedUrl);
}
/**
 * An recursion helper which calls the given url and pushes the result in the given 'result' reference.
 * @param {Object[]} result An array of objects.
 * @param {String} url The url to call.
 * @returns {Promise} an promise which resolves all oaf features as geojson.
 */
async function oafRecursionHelper (result, url) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: {
                accept: "application/geo+json"
            }
        }).then(async (response) => {
            const nextLink = this.getNextLinkFromFeatureCollection(response?.data);

            if (Array.isArray(response?.data?.features)) {
                result.push(...response.data.features);
            }
            if (typeof nextLink === "string") {
                try {
                    resolve(await this.oafRecursionHelper(result, nextLink, onerror));
                }
                catch (error) {
                    reject(error);
                }
            }
            else {
                resolve(result);
            }
        }).catch(error => reject(error));
    });
}

/**
 * Reads the given features or featureCollections and parse them to ol/GeoJSON.
 * @param {Object[]|ol} features The array of features.
 * @param {Object} [options={}] The options to pass to the GeoJSON constructor.
 * @returns {ol/Feature[]} an array of ol features.
 */
function readAllOAFToGeoJSON (features, options = {}) {
    if (!Array.isArray(features)) {
        return features;
    }
    const geoJSONParser = new GeoJSON(options),
        olFeatures = geoJSONParser.readFeatures(
            {
                type: "FeatureCollection",
                features
            }
        );

    return olFeatures;
}

/**
 * Parses the given feature collection for the next nextLink.
 * @param {Object} featureCollection the feature collection
 * @returns {String|Boolean} the next link or false if no next link exists
 */
function getNextLinkFromFeatureCollection (featureCollection) {
    if (!Array.isArray(featureCollection?.links)) {
        return false;
    }
    const len = featureCollection.links.length;

    for (let i = 0; i < len; i++) {
        if (
            isObject(featureCollection.links[i])
            && typeof featureCollection.links[i].href === "string"
            && featureCollection.links[i].rel === "next"
            && featureCollection.links[i].type === "application/geo+json"
        ) {
            return featureCollection.links[i].href;
        }
    }
    return false;
}

/**
 * Gets the unique values for given properties.
 * @param {String} baseUrl The base url.
 * @param {String} collection The collection name.
 * @param {Number} limit The limit of features each request should contain.
 * @param {String[]} propertiesToGetValuesFor The properties to get values for.
 * @returns {Promise} a promise which resolves the unique values as object or rejects on error.
 */
async function getUniqueValuesFromCollection (baseUrl, collection, limit, propertiesToGetValuesFor) {
    return new Promise((resolve, reject) => {
        this.getOAFFeatureGet(baseUrl, collection, limit, undefined, undefined, undefined, propertiesToGetValuesFor, true).then(features => {
            resolve(getUniqueValuesFromFetchedFeatures(features.map(feature => feature?.properties), propertiesToGetValuesFor, true));
        }).catch(error => reject(error));
    });
}
/**
 * Gets the unique values by a scheme request.
 * @param {String} baseUrl The base url of the dataset.
 * @param {String} collection The collection name.
 * @param {String[]} propertiesToGetValuesFor List of properties to get the values for. If empty it returns all attributes.
 * @returns {Object} an object with property name as key and the unique values as object as value.
 */
async function getUniqueValuesByScheme (baseUrl, collection, propertiesToGetValuesFor) {
    if (typeof baseUrl !== "string" || typeof collection !== "string" || !Array.isArray(propertiesToGetValuesFor)) {
        return {};
    }
    const url = `${baseUrl}/collections/${collection}/schema`,
        response = await axios.get(url, {
            headers: {
                accept: "application/schema+json"
            }
        }),
        result = {};
    let atLeastOneEnumFound = false;

    if (response.status !== 200 || !isObject(response.data?.properties)) {
        return this.getUniqueValuesFromCollection(baseUrl, collection, 400, propertiesToGetValuesFor);
    }

    Object.entries(response.data.properties).forEach(([key, value]) => {
        if (!Object.prototype.hasOwnProperty.call(value, "enum") || (propertiesToGetValuesFor.length && !propertiesToGetValuesFor.includes(key))) {
            return;
        }
        atLeastOneEnumFound = true;
        const uniqueList = {};

        value.enum.forEach(uniqueValue => {
            uniqueList[uniqueValue] = true;
        });
        result[key] = uniqueList;
    });

    if (!atLeastOneEnumFound) {
        return this.getUniqueValuesFromCollection(baseUrl, collection, 400, propertiesToGetValuesFor);
    }
    return result;
}

/**
 * Gets an oaf geometry filter.
 * @param {ol/geom/Geometry} geometry - The Geometry.
 * @param {String} geometryName - The geometry-valued property.
 * @param {String} filterType - Possible types are intersects | within.
 * @returns {String|undefined} a string which represents the oaf geometry filter.
 */
function getOAFGeometryFilter (geometry, geometryName, filterType) {
    if (typeof filterType !== "string" || filterType !== "intersects" && filterType !== "within") {
        return undefined;
    }

    const flattenCoordinates = Array.isArray(geometry?.flatCoordinates) && geometry?.flatCoordinates[2] === 0 ? geometry.flatCoordinates.filter((coordinate, index) => (index + 1) % 3) : geometry.flatCoordinates,
        result = [],
        operation = filterType === "intersects" ? "S_INTERSECTS" : "S_WITHIN";

    for (let i = 0; i < flattenCoordinates.length; i += 2) {
        const chunk = flattenCoordinates.slice(i, i + 2);

        result.push(chunk.join(" "));
    }

    if (geometry?.getType() === "Point") {
        return `${operation}(${geometryName}, POINT(${result.join(", ")}))`;
    }
    return `${operation}(${geometryName}, POLYGON((${result.join(", ")})))`;
}

export default {
    getOAFFeatureGet,
    readAllOAFToGeoJSON,
    oafRecursionHelper,
    getNextLinkFromFeatureCollection,
    getUniqueValuesFromCollection,
    getUniqueValuesByScheme,
    getOAFGeometryFilter
};
