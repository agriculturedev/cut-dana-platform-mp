import axios from "axios";
import handleAxiosErrorModule from "../utils/handleAxiosError";

/**
 * handles input errors for OAF request
 * @throws Throws an error if an error occures and no onerror callback is given.
 * @param {string} url - the request url
 * @param {string} collection - the requested collection
 * @param {Function} [onerror] - callback function
 * @returns {boolean} whether an error has occured (or throws an error)
 */
function errorHandler (url, collection, onerror) {
    let error = null;

    if (typeof url !== "string") {
        error = new Error(`api/oaf/getFeature: Url is ${url}. Url has to be defined and a string.`);
    }
    if (typeof collection !== "string") {
        error = new Error(`api/oaf/getFeature: Collection is ${collection}. Collection has to be defined and a string.`);
    }

    if (error instanceof Error) {
        if (typeof onerror === "function") {
            onerror(error);
            return true;
        }
        throw error;
    }

    return false;
}

/**
 * Handles the OAF GetFeature request by GET.
 * @throws Throws an error if an error occures and no onerror callback is given.
 * @param {string} baseUrl - the request url
 * @param {string} collection - the requested collection
 * @param {object} [opts] - the request options
 * @param {Function} [onerror] - callback function for errors
 * @param {Function} [maxIterations=10000] - max iterations for the request loop
 * @returns {Promise<Object[]|string|undefined>} Promise of GeoJSON features
 */
export async function getFeatures (baseUrl, collection, opts = {}, onerror = undefined, maxIterations = 10000) {
    if (errorHandler(baseUrl, collection, onerror)) {
        return undefined;
    }

    let i = 0,
        offset = 0,
        initNumReturned,
        currentNumReturned;
    const features = [], // the resulting features
        url = `${baseUrl}/collections/${collection}/items`,
        options = {
            ...opts,
            limit: opts.limit, // (optional) caution: some services set maxLimit
            crs: opts.crs, // (optional) CRS the data should be returned in
            "bbox-crs": opts.bboxCrs || opts["bbox-crs"], // (optional) CRS the bbox is provided in
            bbox: Array.isArray(opts.bbox) ? opts.bbox.slice(0, 4).join(",") : opts.bbox, // (optional) bbox as string or number[]
            f: "json"
        };

    /**
     * loop for not paginated OAF services in order to get all features, if maxLimit is set serverside
     * @todo read pagination if exists, from masterportalapi src/layer/oaf/getNextLinkFromFeatureCollection
     */
    while (initNumReturned === currentNumReturned) {
        // get the current feature collection with limit and offset set
        const currentFeatureCollection = await axios.get(url, {
            headers: {
                Accept: "application/geo+json"
            },
            params: {
                ...options,
                offset
            }
        })
            .then(res => res.data)
            .catch(axiosError => handleAxiosErrorModule.handleAxiosError(axiosError, "api/oaf/getFeature", onerror));

        if (currentFeatureCollection?.features?.length) {
            // push the features to the results list
            features.push(...currentFeatureCollection.features);

            /**
             * set the current number of returned features
             * break the loop if the number is smaller than on the initial call
             * indicating the end of the collection has been reached
             */
            currentNumReturned = currentFeatureCollection.numberReturned;
            if (i === 0) {
                initNumReturned = currentFeatureCollection.numberReturned;
            }

            // set the offset according to the number of returned features
            offset += currentNumReturned;
        }
        else {
            // break if no features were returned
            break;
        }
        i++;

        // break if the max iterations have been reached
        if (i >= maxIterations || !currentFeatureCollection?.features) {
            break;
        }
    }

    // return a feature collection with all features
    return {
        type: "FeatureCollection",
        features
    };
}

export default {
    getFeatures
};
