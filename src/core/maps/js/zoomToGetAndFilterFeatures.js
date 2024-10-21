import axios from "axios";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {WFS} from "ol/format";
import escape from "escape-html";

import handleAxiosResponse from "../../../shared/js/utils/handleAxiosResponse";

/**
 * Retrieves features from the defined layer.
 *
 * @param {String} layerId Id of the layer to retrieve the features from.
 * @param {String} property Property to filter.
 * @param {String[]} values Array of allowed values.
 * @returns {Promise<Feature[]>} If resolved, returns an array of features.
 */
async function getAndFilterFeatures (layerId, property, values) {
    const layer = rawLayerList.getLayerWhere({id: layerId}),
        filter = createFilter(layer?.featureNS, layer?.featurePrefix, layer?.version, property, values);

    if (layer === null) {
        return new Promise((_, reject) => reject(`The layer with the id ${layerId} could not be found.`));
    }

    return axios
        .get(createUrl(layer.url, layer.version, layer.featureType, filter))
        .then(response => handleAxiosResponse(response, "utils/zoomTo/actionsZoomTo/zoomToFeatures"))
        .then(data => new WFS().readFeatures(data))
        .then(features => features.filter(feature => {
            if (!feature.getKeys().includes(property)) {
                return false;
            }
            return values.includes(feature.get(property).toUpperCase().trim());
        }));
}
/**
 * Creates the url.
 * @param {String} requestUrl The url of the layer.
 * @param {String} version The version of WFS.
 * @param {String} featureType The featureType of the layer.
 * @param {String} filter filter with values
 * @returns {String} the created url
 */
function createUrl (requestUrl, version, featureType, filter) {
    const url = new URL(requestUrl);

    url.searchParams.set("service", "WFS");
    url.searchParams.set("version", version);
    url.searchParams.set("typeName", featureType);
    url.searchParams.set("request", "GetFeature");
    // only if filter is set
    if (filter !== null) {
        url.searchParams.set("filter", filter);
    }
    return url;
}

/**
 * creates a filter for the given values
 * @param {String} featureNS configured feature namespace
 * @param {String} featurePrefix configured feature prefix
 * @param {String} version the version of WFS
 * @param {String} property property to filter
 * @param {string[]} values Array of allowed values
 * @return {String} filter
 */
function createFilter (featureNS, featurePrefix, version, property, values) {
    const prefix = featurePrefix ? featurePrefix : "app", // if no featurePrefix is set, use "app" as default
        propertyPrefix = featureNS ? prefix + ":" : "", // only create a property prefix if featureNS is configured
        filterWfs1 = "<Filter xmlns=\"http://www.opengis.net/ogc\"",
        filterWfs2 = "<Filter xmlns=\"http://www.opengis.net/fes/2.0\"",
        filterTagEnd = featureNS ? " xmlns:" + prefix + "=\"" + featureNS + "\">" : ">", // only create the filter with namespace and prefix, if featureNS is configured
        propEnd = "</Literal></PropertyIsEqualTo>";
    let filter,
        propStart = "",
        propPart = "",
        filterContent = "";

    if (!property || property === "") {
        return null;
    }
    // WFS with versions 1.x
    else if (version && version.startsWith("1.")) {
        propStart = "<PropertyIsEqualTo matchCase=\"false\"><PropertyName>" + propertyPrefix + property + "</PropertyName><Literal>";
        filter = filterWfs1;
    }
    // default for WFS 2.0
    else {
        propStart = "<PropertyIsEqualTo matchCase=\"false\"><ValueReference>" + propertyPrefix + property + "</ValueReference><Literal>";
        filter = filterWfs2;
    }

    // handling for values
    values.forEach(value => {
        const escapedValue = escape(value);

        propPart += propStart + escapedValue + propEnd;
    });
    if (values.length > 1) {
        filterContent = "<Or>" + propPart + "</Or>";
    }
    else if (values.length === 1) {
        filterContent = propPart;
    }
    else {
        filterContent = propStart + propEnd;
    }
    filter += filterTagEnd + filterContent + "</Filter>";
    return filter;
}

export default {
    createUrl,
    createFilter,
    getAndFilterFeatures
};
