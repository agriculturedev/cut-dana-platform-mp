import crs from "@masterportal/masterportalapi/src/crs";

import store from "../../../app-store";
import highlightFeaturesByAttribute from "./highlightFeaturesByAttribute";
import processUrlParams from "../../../shared/js/utils/processUrlParams";

/**
 * Here the urlParams for the maps are processed.
 *
 * Examples:
 * - https://localhost:9001/portal/master/?featureviaurl=[%7B%22layerId%22:%2242%22,%22features%22:[%7B%22coordinates%22:[10,53.5],%22label%22:%22TestPunkt%22%7D]%7D]
 * - https://localhost:9001/portal/master/?highlightfeature=1711,DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2
 * - https://localhost:9001/portal/master/?highlightFeaturesByAttribute=123&wfsId=8712&attributeName=bezirk&attributeValue=Altona&attributeQuery=IsLike
 * - https://localhost:9001/portal/master/?MAPS={%22center%22:[571278.4429867676,5938534.397334521],%22mode%22:%222D%22,%22zoom%22:7}
 * - https://localhost:9001/portal/master/?MAPS={%22center%22:[571278.4429867676,5938534.397334521],%22mode%22:%223D%22,%22zoom%22:7,%22altitude%22:127,%22heading%22:-1.2502079000000208,%22tilt%22:45}
 * - https://localhost:9001/portal/master/?marker=565874,5934140
 * - https://localhost:9001/portal/master/?ZOOMTOFEATUREID=18,26
 * - https://localhost:9001/portal/master/?zoomtogeometry=bergedorf
 *
 * - https://localhost:9001/portal/master/?map=3d&altitude=127&heading=-1.2502079000000208&tilt=45
 * - https://localhost:9001/portal/master/?Map/highlightfeature=1711,DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2
 * - https://localhost:9001/portal/master/?bezirk=bergedorf
 * - https://localhost:9001/portal/master/?center=553925,5931898
 * - https://localhost:9001/portal/master/?center=[553925,5931898]
 * - https://localhost:9001/portal/master/?Map/center=[553925,5931898]
 * - https://localhost:9001/portal/master/?mapMode=3d
 * - https://localhost:9001/portal/master/?MAP/MAPMODE=3d
 * - https://localhost:9001/portal/master/?MAPMARKER=[565874,%205934140]
 * - https://localhost:9001/portal/master/?Map/projection=EPSG:31467&Map/center=[3565836,5945355]
 * - https://localhost:9001/portal/master/?projection=EPSG:31467&marker=3565836,5945355
 * - https://localhost:9001/portal/master/?zoomtogeometry=altona
 * - https://localhost:9001/portal/master/?zoomlevel=0
 * - https://localhost:9001/portal/master/?ZOOMTOEXTENT=10.0822,53.6458,10.1781,53.8003&PROJECTION=EPSG:4326
 * - https://localhost:9001/portal/master/?zoomToExtent=510000,5850000,625000,6000000
 * - https://localhost:9001/portal/master/?MAP/ZOOMTOFEATUREID=18,26
 * - https://localhost:9001/portal/master/?featureid=18,26
 */

const mapUrlParams = {
        FEATUREVIAURL: featureViaUrl,
        HIGHLIGHTFEATURE: highlightFeature,
        HIGHLIGHTFEATURESBYATTRIBUTE: highlightFeaturesByAttributes,
        MAPS: setMapAttributes,
        MARKER: setMapMarker,
        ZOOMTOEXTENT: zoomToProjExtent,
        ZOOMTOFEATUREID: zoomToFeatures,
        ZOOMTOGEOMETRY: zoomToFeatures
    },
    legacyMapUrlParams = {
        ALTITUDE: setCamera,
        "API/HIGHLIGHTFEATURESBYATTRIBUTE": highlightFeaturesByAttributes,
        ATTRIBUTENAME: highlightFeaturesByAttributes,
        ATTRIBUTEQUERY: highlightFeaturesByAttributes,
        ATTRIBUTEVALUE: highlightFeaturesByAttributes,
        BEZIRK: zoomToFeatures,
        CENTER: zoomToCoordinates,
        FEATUREID: zoomToFeatures,
        HEADING: setCamera,
        MAP: setMode,
        MAPMARKER: setMapMarker,
        MAPMODE: setMode,
        "MAP/CENTER": zoomToCoordinates,
        "MAP/HIGHLIGHTFEATURE": highlightFeature,
        "MAP/MAPMODE": setMode,
        "MAP/PROJECTION": processProjection,
        "MAP/ZOOMLEVEL": zoomToCoordinates,
        "MAP/ZOOMTOEXTENT": zoomToProjExtent,
        "MAP/ZOOMTOFEATUREID": zoomToFeatures,
        "MAP/ZOOMTOGEOMETRY": zoomToFeatures,
        PROJECTION: processProjection,
        TILT: setCamera,
        WFSID: highlightFeaturesByAttributes,
        ZOOMLEVEL: zoomToCoordinates
    };

/**
 * Process the map url params.
 * @returns {void}
 */
function processMapUrlParams () {
    processUrlParams(mapUrlParams, legacyMapUrlParams);
}

/**
 * Set the map attributes.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setMapAttributes (params) {
    const mapsParams = Object.fromEntries(
        Object.entries(JSON.parse(params.MAPS)).map(([k, v]) => [k.toUpperCase(), v])
    );

    setCamera(mapsParams);
    setMode(mapsParams);
    zoomToCoordinates(mapsParams);
}

/**
 * Creates a feature via url.
 * @param {Object} params The found params.
 * @returns {void}
 */
function featureViaUrl (params) {
    try {
        store.dispatch("Maps/featureViaUrl", JSON.parse(params.FEATUREVIAURL));
    }
    catch (error) {
        console.warn(i18next.t("common:core.maps.featureViaURL.messages.featureParsing"));
        console.error(error);
    }
}

/**
 * Highlights a feature via layerid and featureid.
 * @param {Object} params The found params.
 * @returns {void}
 */
function highlightFeature (params) {
    const layerId = (params.HIGHLIGHTFEATURE || params["MAP/HIGHLIGHTFEATURE"])?.split(",")[0],
        featureIds = (params.HIGHLIGHTFEATURE || params["MAP/HIGHLIGHTFEATURE"])?.split(",");

    featureIds.shift();
    featureIds.forEach(featureId => {
        store.dispatch("Maps/highlightFeature", {
            layerIdAndFeatureId: [layerId, featureId],
            type: "viaLayerIdAndFeatureId"
        });
    });
    store.dispatch("Maps/zoomToFilteredFeatures", {ids: featureIds, layerId: layerId, zoomOptions: {duration: 0}});
}

/**
 * Highlight Features by Attributes.
 * @param {Object} params The found params.
 * @returns {void}
 */
function highlightFeaturesByAttributes (params) {
    const attributeName = params.ATTRIBUTENAME,
        attributeValue = params.ATTRIBUTEVALUE,
        attributeQuery = params.ATTRIBUTEQUERY,
        wfsId = params.WFSID;

    if (attributeName && attributeValue && wfsId) {
        highlightFeaturesByAttribute.highlightFeaturesByAttribute(
            store.dispatch,
            store.getters,
            wfsId,
            attributeName,
            attributeValue,
            attributeQuery
        );
    }
    else {
        console.warn("Not all required URL parameters given for highlightFeaturesByAttribute.");
    }
}

/**
 * Process the param PROJECTION.
 * PROJECTION is only used in combination with one of the following parameters:
 * - CENTER, "MAP/CENTER"
 * - MARKER, MAPMARKER
 * - ZOOMTOEXTENT,"MAP/ZOOMTOEXTENT"
 * @param {Object} params The found params.
 * @returns {void}
 */
function processProjection (params) {
    if (params.CENTER || params["MAP/CENTER"]) {
        zoomToCoordinates(params);
    }
    if (params.MARKER || params.MAPMARKER) {
        setMapMarker(params);
    }
    if (params.ZOOMTOEXTENT || params["MAP/ZOOMTOEXTENT"]) {
        zoomToProjExtent(params);
    }
}

/**
 * Sets the camera params.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setCamera (params) {
    store.dispatch("Maps/setCamera", {
        altitude: params.ALTITUDE,
        heading: -params.HEADING,
        tilt: params.TILT
    });
}

/**
 * Sets the map marker params.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setMapMarker (params) {
    const projection = params.PROJECTION || params["MAP/PROJECTION"];
    let marker = params.MARKER || params.MAPMARKER;

    if (marker && !Array.isArray(marker)) {
        if (marker.includes("[")) {
            marker = JSON.parse(marker);
        }
        else {
            marker = marker?.split(",");
        }
    }
    marker = marker?.map(coord => parseFloat(coord, 10));

    if (store.getters.styleListLoaded) {
        store.dispatch("Maps/placingPointMarker", projection ? crs.transformToMapProjection(mapCollection.getMap("2D"), projection, marker) : marker);
    }
    else {
        store.watch((state, getters) => getters.styleListLoaded, value => {
            if (value) {
                store.dispatch("Maps/placingPointMarker", projection ? crs.transformToMapProjection(mapCollection.getMap("2D"), projection, marker) : marker);
            }
        });
    }

}

/**
 * Sets the mode params.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setMode (params) {
    store.dispatch("Maps/changeMapMode", (params.MODE || params.MAP || params.MAPMODE || params["MAP/MAPMODE"])?.toUpperCase());
}

/**
 * Sets the view params zoom, center and rotation.
 * @param {Object} params The found params.
 * @returns {void}
 */
function zoomToCoordinates (params) {
    const projection = params.PROJECTION || params["MAP/PROJECTION"];
    let center = params.CENTER || params["MAP/CENTER"];

    if (center && !Array.isArray(center)) {
        if (center.includes("[")) {
            center = JSON.parse(center);
        }
        else {
            center = center?.split(",");
        }
    }

    store.dispatch("Maps/zoomToCoordinates", {
        center: projection ? crs.transformToMapProjection(mapCollection.getMap("2D"), projection, center) : center,
        zoom: params.ZOOM ?? params.ZOOMLEVEL ?? params["MAP/ZOOMLEVEL"],
        rotation: params.ROTATION
    });
}

/**
 * Zoom to features.
 * @param {Object} params The found params.
 * @returns {void}
 */
function zoomToFeatures (params) {
    store.dispatch("Maps/zoomToFeatures", {
        ZOOMTOFEATUREID: params.FEATUREID || params.ZOOMTOFEATUREID || params["MAP/ZOOMTOFEATUREID"],
        ZOOMTOGEOMETRY: params.BEZIRK || params.ZOOMTOGEOMETRY || params["MAP/ZOOMTOGEOMETRY"]
    });
}

/**
 * Zoom on an extent, with coordinates of another projection than the map.
 * @param {Object} params The found params.
 * @returns {void}
 */
function zoomToProjExtent (params) {
    store.dispatch("Maps/zoomToProjExtent", {
        extent: (params.ZOOMTOEXTENT || params["MAP/ZOOMTOEXTENT"])?.split(","),
        options: {duration: 0},
        projection: params.PROJECTION || params["MAP/PROJECTION"] || store.getters["Maps/projectionCode"]
    });
}

export default {
    processMapUrlParams,
    setMapAttributes,
    featureViaUrl,
    highlightFeature,
    highlightFeaturesByAttributes,
    processProjection,
    setMapMarker,
    setCamera,
    setMode,
    zoomToCoordinates,
    zoomToFeatures,
    zoomToProjExtent
};
