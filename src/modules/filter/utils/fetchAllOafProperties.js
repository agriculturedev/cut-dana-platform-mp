import getFeature from "../../../shared/js/api/oaf/getOAFFeature.js";
import isObject from "../../../shared/js/utils/isObject.js";
import axios from "axios";

/**
 * Calls the oaf url and collects all properties of the features.
 * @param {String} url the url to the oaf service
 * @param {String} collection the name of the collection to use
 * @param {Number} limit the limit configured for this layer
 * @param {Function} onsuccess a function(Object[]) to call on success
 * @param {Function} onerror a function(Error) to call on error
 * @param {Boolean} [skipGeometry=false] a flag to decide if the geometry should be skipped
 * @param {String[]} [propertyNames] The property names to narrow the request.
 * @param {Function|Boolean} [axiosMock=false] false to use axios, a function that is called with the axios configuration if mock is needed
 * @returns {void}
 */
function fetchAllOafProperties (url, collection, limit, onsuccess, onerror, skipGeometry = false, propertyNames = undefined, axiosMock = false) {
    if (typeof url !== "string") {
        if (typeof onerror === "function") {
            onerror(new Error("fetchAllOafProperties: the url parameter has to be a string"));
        }
        return;
    }
    if (typeof collection !== "string") {
        if (typeof onerror === "function") {
            onerror(new Error("fetchAllOafProperties: the collection parameter has to be a string"));
        }
        return;
    }
    const limitParam = typeof limit === "number" ? limit : 10,
        axiosObject = typeof axiosMock === "function" ? axiosMock : axios,
        result = [];
    let axiosUrl = url + "/collections/" + collection + "/items?limit=" + limitParam;

    if (Array.isArray(propertyNames) && propertyNames.length) {
        axiosUrl += `&properties=${propertyNames.join(",")}`;
    }
    if (skipGeometry) {
        axiosUrl += "&skipGeometry=true";
    }

    fetchAllOafPropertiesRecursionHelper(result, axiosUrl, onsuccess, onerror, axiosObject);
}

/**
 * Helper function for the recursion of fetchAllOafProperties.
 * @param {Object[]} result the collected result
 * @param {String} url the url to the oaf service
 * @param {Function} onsuccess a function(Object[]) to call on success
 * @param {Function} onerror a function(Error) to call on error
 * @param {Function} axiosObject an object to use for the axios request
 * @returns {void}
 */
function fetchAllOafPropertiesRecursionHelper (result, url, onsuccess, onerror, axiosObject) {
    axiosObject({
        method: "get",
        url,
        headers: {
            accept: "application/geo+json"
        }
    }).then(response => {
        if (!isObject(response) || !isObject(response.data)) {
            if (typeof onerror === "function") {
                onerror(new Error("fetchAllOafProperties: the response data does not exist"));
            }
            return;
        }
        const nextLink = getFeature.getNextLinkFromFeatureCollection(response.data);

        if (Array.isArray(response.data.features)) {
            response.data.features.forEach(feature => {
                result.push(feature?.properties);
            });
        }
        if (typeof nextLink === "string") {
            fetchAllOafPropertiesRecursionHelper(result, nextLink, onsuccess, onerror, axiosObject);
        }
        else if (typeof onsuccess === "function") {
            onsuccess(result);
        }
    }).catch(error => {
        if (typeof onerror === "function") {
            onerror(error);
        }
    });
}

/**
 * Returns a unique value object of attrName(s) from the given properties list.
 * @param {Object[]} allFetchedProperties the list of all properties
 * @param {String|String[]} attrName the attribute name(s) to get the unique value list for
 * @param {Boolean} nested If set to true, for each attrName an nested object is created. Only works if attrName is an array
 * @returns {Object|Boolean} an object with the values as keys ({value1: true, ...}) or false if an error occured
 */
function getUniqueValuesFromFetchedFeatures (allFetchedProperties, attrName, nested) {
    if (!Array.isArray(allFetchedProperties)) {
        return false;
    }
    const result = {};

    if (Array.isArray(attrName)) {
        attrName.forEach(attributeName => {
            if (nested) {
                result[attributeName] = {};
            }
            Object.assign(nested ? result[attributeName] : result, getUniqueValuesFromFetchedFeatures(allFetchedProperties, attributeName));
        });
        return result;
    }

    allFetchedProperties.forEach(properties => {
        if (!isObject(properties) || !Object.prototype.hasOwnProperty.call(properties, attrName)) {
            return;
        }
        result[properties[attrName]] = true;
    });

    return result;
}
/**
 * Returns an Object(min, max) with min and max value extracted from the given properties.
 * @param {Object[]} allFetchedProperties the properties to parse through
 * @param {String|String[]} attrName the attribute(s) to receive the min and max value from
 * @param {Boolean} minOnly if only min is of interest
 * @param {Boolean} maxOnly if only max is of interest
 * @returns {Object|Boolean} an object with keys min and max or false on error
 */
function getMinMaxFromFetchedFeatures (allFetchedProperties, attrName, minOnly, maxOnly) {
    if (!Array.isArray(allFetchedProperties)) {
        return false;
    }
    let min = false,
        max = false;

    if (Array.isArray(attrName)) {
        const minMax = {};

        attrName.forEach((attributeName) => {
            const minMaxOfAttrName = getMinMaxFromFetchedFeatures(allFetchedProperties, attributeName, minOnly, maxOnly);

            if (!Object.prototype.hasOwnProperty.call(minMax, "min") && Object.prototype.hasOwnProperty.call(minMaxOfAttrName, "min")
                || minMax?.min > minMaxOfAttrName?.min) {
                minMax.min = minMaxOfAttrName.min;
            }
            if (!Object.prototype.hasOwnProperty.call(minMax, "max") && Object.prototype.hasOwnProperty.call(minMaxOfAttrName, "max")
                || minMax?.max < minMaxOfAttrName?.max) {
                minMax.max = minMaxOfAttrName.max;
            }
        });
        return minMax;
    }
    allFetchedProperties.forEach(properties => {
        if (
            !isObject(properties)
            || !Object.prototype.hasOwnProperty.call(properties, attrName)
            || properties[attrName] === null
            || typeof properties[attrName] === "undefined"
        ) {
            return;
        }
        if (min === false || properties[attrName] < min) {
            min = properties[attrName];
        }
        if (max === false || properties[attrName] > max) {
            max = properties[attrName];
        }
    });

    if (minOnly && !maxOnly) {
        return {min};
    }
    else if (!minOnly && maxOnly) {
        return {max};
    }
    return {min, max};
}

export {
    fetchAllOafProperties,
    fetchAllOafPropertiesRecursionHelper,
    getUniqueValuesFromFetchedFeatures,
    getMinMaxFromFetchedFeatures
};
