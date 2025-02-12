import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import calculateExtent from "../../../shared/js/utils/calculateExtent";
import createStyledFeatures from "../js/zoomToCreateStyledFeatures";
import featureProvider from "../js/zoomToGetAndFilterFeatures";

/**
 * Zoom to a feature, with url param.
 */
export default {
    zoomToFeatures ({dispatch, rootGetters}, param) {
        const config = rootGetters.zoomTo;
        let addFeatures = true,
            allowedValues,
            featurePromises = "",
            layerId,
            property,
            styleId;

        if (!config) {
            return false;
        }

        featurePromises = config.map(conf => {
            const {id} = conf;
            let urlValues = param[id.toUpperCase()];

            if (!urlValues) {
                return new Promise(resolve => resolve([]));
            }
            else if (id === "zoomToFeatureId") {
                urlValues = (Array.isArray(urlValues) ? urlValues : urlValues.split(",")).map(value => String(value));
                styleId = conf.styleId;
            }
            else if (id === "zoomToGeometry") {
                urlValues = urlValues.split(",").map(value => value.toUpperCase().trim());
                allowedValues = conf.allowedValues.map(value => String(value));
                // zoom to bezirk by urlParameter ?zoomtogeometry=1, means zoom to 1. entry in allowedValues
                if (urlValues.length === 1 && allowedValues !== undefined && !allowedValues.includes(urlValues[0]) && parseInt(urlValues[0], 10) < allowedValues.length && parseInt(urlValues[0], 10) > 0) {
                    urlValues[0] = allowedValues[parseInt(urlValues[0], 10) - 1];
                }
            }

            layerId = conf.layerId;
            property = conf.property;

            if (Object.prototype.hasOwnProperty.call(conf, "addFeatures")) {
                addFeatures = config.addFeatures;
            }

            return featureProvider.getAndFilterFeatures(layerId, property, urlValues)
                .then(featureCollection => {
                    let filteredFeatures = featureCollection;

                    if (allowedValues !== undefined) {
                        filteredFeatures = filteredFeatures.filter(feature => allowedValues.includes(feature.get(property).toUpperCase().trim()));
                    }
                    if (styleId) {
                        filteredFeatures = createStyledFeatures(filteredFeatures, styleId);
                    }
                    if (addFeatures && filteredFeatures.length > 0) {
                        dispatch("Maps/addLayer", new VectorLayer({
                            source: new VectorSource({features: filteredFeatures})
                        }), {root: true});
                    }

                    return new Promise(resolve => resolve(filteredFeatures));
                });
        });

        return Promise.allSettled(featurePromises)
            .then(results => {
                const features = results
                    .map(result => {
                        if (result.status === "fulfilled") {
                            return result.value;
                        }
                        dispatch("Alerting/addSingleAlert", result.reason, {root: true});
                        return [];
                    })
                    .flat(1);

                if (features.length > 0) {
                    return dispatch("Maps/zoomToExtent", {extent: calculateExtent(features)}, {root: true});
                }
                return console.warn("zoomTo: No features were found for the given layer.");
            })
            .catch(error => {
                console.error("zoomTo: An error occurred while trying to fetch features from one of the given services.", error);
            });
    }
};
