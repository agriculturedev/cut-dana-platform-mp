import axios from "axios";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {WFS} from "ol/format";
import handleAxiosResponse from "../../handleAxiosResponse";

/**
 * Retrieves features from the defined layer.
 *
 * @param {string} layerId Id of the layer to retrieve the features from.
 * @param {string} property Property to filter.
 * @param {string[]} values Array of allowed values.
 * @returns {Promise<Feature[]>} If resolved, returns an array of features.
 */
function getAndFilterFeatures (layerId, property, values) {
    const layer = rawLayerList.getLayerWhere({id: layerId});

    if (layer === null) {
        return new Promise((_, reject) => reject(`The layer with the id ${layerId} could not be found.`));
    }
    return axios
        .get(createUrl(layer.url, layer.version, layer.featureType))
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
     * @returns {String} the created url
     */
function createUrl (requestUrl, version, featureType) {
    const url = new URL(requestUrl);

    url.searchParams.set("service", "WFS");
    url.searchParams.set("version", version);
    url.searchParams.set("typeName", featureType);
    url.searchParams.set("request", "GetFeature");
    return url;
}

export default {
    createUrl,
    getAndFilterFeatures
};
