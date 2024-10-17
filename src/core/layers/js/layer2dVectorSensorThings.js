import {buffer, containsExtent} from "ol/extent";
import Cluster from "ol/source/Cluster";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style.js";
import {unByKey} from "ol/Observable";
import crs from "@masterportal/masterportalapi/src/crs";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {GeoJSON} from "ol/format";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import dayjsTimezone from "dayjs/plugin/timezone";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Layer2dVector from "./layer2dVector";
import changeTimeZone from "../../../shared/js/utils/changeTimeZone";
import {uniqueId} from "../../../shared/js/utils/uniqueId.js";
import isObject from "../../../shared/js/utils/isObject";
import {SensorThingsHttp} from "../../../shared/js/api/sensorThingsHttp";
import {SensorThingsMqtt} from "../../../shared/js/api/sensorThingsMqtt";
import store from "../../../app-store";

dayjs.extend(dayjsTimezone);
dayjs.extend(localizedFormat);

/**
 * Creates a 2d vector sensorThings (SensorThings API) layer.
 * @name Layer2dVectorSensorThings
 * @constructs
 * @extends Layer2dVector
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVectorSensorThings (attributes) {
    const defaultAttributes = {
        epsg: "EPSG:4326",
        showSettings: true,
        sourceUpdated: false,
        subscriptionTopics: {},
        mqttClient: null,
        timezone: "Europe/Berlin",
        utc: "+1",
        version: "1.1",
        showNoDataValue: true,
        noDataValue: "no data",
        loadThingsOnlyInCurrentExtent: false,
        isSubscribed: false,
        mqttRh: 2,
        mqttQos: 2,
        mqttOptions: {},
        moveLayerRevisible: false,
        datastreamAttributes: [
            "@iot.id",
            "@iot.selfLink",
            "Observations",
            "description",
            "name",
            "observationType",
            "observedArea",
            "phenomenonTime",
            "properties",
            "resultTime",
            "unitOfMeasurement"
        ],
        thingAttributes: [
            "@iot.id",
            "@iot.selfLink",
            "Locations",
            "description",
            "name",
            "properties"
        ]
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    this.styleRule = [];
    Layer2dVector.call(this, this.attributes);
    this.initializeSensorThings();

    this.intervallRequest = null;
    this.keepUpdating = false;
    this.moveLayerRevisible = "";
    this.subscribedDataStreamIds = {};
    this.showHistoricalFeatures = true;
    this.locationUpdating = {};
    this.eventKeys = {};
    this.lastScale = null;

    this.registerInteractionMapResolutionListeners(this.get("scaleStyleByZoom"));
    require("dayjs/locale/de.js");
    dayjs.locale("de");
    this.registerInteractionMapScaleListeners();
    this.prepareFeaturesFor3D(this.layer?.getSource().getFeatures());
}

Layer2dVectorSensorThings.prototype = Object.create(Layer2dVector.prototype);

/**
 * Creates a layer of type SensorThings-API.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes),
        layerParams = this.getLayerParams(attributes),
        options = this.getOptions(attributes);

    this.setLayer(this.createVectorLayer(rawLayerAttributes, {layerParams, options}));
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dVectorSensorThings.prototype.getRawLayerAttributes = function (attributes) {
    return {
        clusterDistance: attributes.clusterDistance,
        id: attributes.id,
        url: attributes.url,
        version: attributes.version
    };
};

/**
 * Gets additional options.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The options.
 */
Layer2dVectorSensorThings.prototype.getOptions = function (attributes) {
    const options = {
        clusterGeometryFunction: this.clusterGeometryFunction,
        featuresFilter: (features) => this.featuresFilter(attributes, features),
        onLoadingError: this.onLoadingError
    };

    return options;
};

/**
 * Creates a complete ol/Layer from rawLayer.
 * @param {Object} rawLayer layer specification as in services.json
 * @param {Object} [optionalParams] optional params
 * @param {Object} [optionalParams.layerParams] additional layer params
 * @param {Object} [optionalParams.options] additional options
 * @returns {ol/Layer} layer that can be added to map
 */
Layer2dVectorSensorThings.prototype.createVectorLayer = function (rawLayer = {}, {layerParams = {}, options = {}} = {}) {
    const source = new VectorSource(),
        layer = new VectorLayer(Object.assign({
            source: rawLayer.clusterDistance ? new Cluster({
                source,
                distance: rawLayer.clusterDistance,
                geometryFunction: options.clusterGeometryFunction
            }) : source,
            id: rawLayer.id
        }, layerParams));

    if (rawLayer.style) {
        layer.setStyle(rawLayer.style);
    }

    return layer;
};

/**
 * Sets values to the ol layer.
 * @param {Object} values The new values.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.updateLayerValues = function (values) {
    const state = this.getStateOfSTALayer(values.visibility, this.get("isSubscribed"));

    this.getLayer()?.setOpacity((100 - values.transparency) / 100);
    this.getLayer()?.setVisible(values.visibility);
    this.getLayer()?.setZIndex(values.zIndex);

    if (state === true) {
        this.startSubscription(this.getLayerSource().getFeatures());
    }
    else if (state === false) {
        this.stopSubscription();
    }
};

/**
 * Creates the legend.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.createLegend = async function () {
    const styleObject = styleList.returnStyleObject(this.attributes.styleId);
    let legend = this.inspectLegendUrl();

    if (!Array.isArray(legend)) {
        if (styleObject && legend === true) {
            const legendInfos = await createStyle.returnLegendByStyleId(styleObject.styleId);

            legend = legendInfos.legendInformation;
        }
        else if (typeof legend === "string") {
            legend = [legend];
        }
    }

    return legend;
};

/**
 * Initializes the style and sets it at this. If styleId is set, this is done after vector styles are loaded.
 * @param {Object} attrs attributes of the raw layer
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.initStyle = function (attrs) {
    if (store.getters.styleListLoaded) {
        this.createStyle(attrs);
    }
    else {
        store.watch((state, getters) => getters.styleListLoaded, value => {
            if (value) {
                this.createStyle(attrs);
            }
        });
    }
};

/**
 * Creates the style function and sets it at layer.
 * @param {Object} attrs  attributes of the raw layer
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.createStyle = function (attrs) {
    const styleObject = styleList.returnStyleObject(attrs?.styleId);
    let styleFunction = null;

    if (typeof styleObject !== "undefined") {
        this.styleRule = styleObject.rules ? styleObject.rules : null;
        styleFunction = function (feature, resolution) {
            const feat = typeof feature !== "undefined" ? feature : this,
                isClusterFeature = typeof feat.get("features") === "function" || typeof feat.get("features") === "object" && Boolean(feat.get("features").length > 1),
                style = createStyle.createStyle(styleObject, feat, isClusterFeature, Config.wfsImgPath),
                styleElement = Array.isArray(style) ? style[0] : style,
                mapView = mapCollection.getMapView("2D"),
                zoomLevel = mapView.getZoomForResolution(resolution) + 1,
                zoomLevelCount = mapView.getResolutions().length;

            if (styleElement?.getImage() !== null && attrs.scaleStyleByZoom) {
                styleElement.getImage().setScale(styleElement.getImage().getScale() * zoomLevel / zoomLevelCount);
            }
            return style;
        };
        this.setStyle(styleFunction);
    }
    else {
        this.setStyle(null);
        console.warn(i18next.t("common:core.layers.errorHandling.wrongStyleId", {styleId: attrs?.styleId}));
    }
};

/**
 * Creates features and initializes connections.
 * @returns {void}
 * */
Layer2dVectorSensorThings.prototype.initializeSensorThings = function () {
    try {
        this.createMqttConnectionToSensorThings(this.get("url"), this.get("mqttOptions"), this.get("timezone"), this.get("showNoDataValue"), this.get("noDataValue"));
    }
    catch (err) {
        console.error("Connecting to mqtt-broker failed. Won't receive live updates. Reason:", err);
    }
    this.toggleSubscriptionsOnMapChanges();

    store.watch((_, getters) => getters.visibleSubjectDataLayerConfigs, layerConfigs => {
        this.toggleSubscriptionsOnMapChanges(layerConfigs);
    }, {deep: true});

    if (store.getters["Maps/scale"] > this.get("maxScaleForHistoricalFeatures")) {
        this.showHistoricalFeatures = false;
    }
};

/**
 * Creates the connection to a given MQTT-Broker.
 * @param {String} url The url to connect with.
 * @param {Object} mqttOptions The configured mqtt options.
 * @param {String} timezone The timezone of Sensors.
 * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not.
 * @param {String} noDataValue The value to use for "nodata".
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.createMqttConnectionToSensorThings = function (url, mqttOptions, timezone, showNoDataValue, noDataValue) {
    if (typeof url !== "string" || !url) {
        return;
    }

    const mqttHost = this.getMqttHostFromUrl(url, error => {
            console.error(error);
        }),
        options = Object.assign({
            browserBufferSize: 65536,
            host: mqttHost,
            rhPath: url,
            context: this,
            path: "/mqtt",
            protocol: "wss",
            mqttVersion: "3.1.1"
        }, mqttOptions);

    this.mqttClient = new SensorThingsMqtt(options);

    this.mqttClient.on("message", (topic, observation) => {
        const datastreamId = this.getDatastreamIdFromMqttTopic(topic),
            layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
            features = typeof layerSource.getFeatures === "function" && Array.isArray(layerSource.getFeatures()) ? layerSource.getFeatures() : [],
            feature = this.getFeatureByDatastreamId(features, datastreamId),
            phenomenonTime = this.getLocalTimeFormat(observation.phenomenonTime, timezone);
        let clonedFeature = null;

        this.updateObservationForDatastreams(feature, datastreamId, observation);
        if (this.get("observeLocation") && isObject(feature)) {
            clonedFeature = feature.clone();
        }
        this.updateFeatureProperties(feature, datastreamId, observation.result, phenomenonTime, showNoDataValue, noDataValue);
        if (this.get("observeLocation") && isObject(feature) && isObject(observation?.location) && this.subscribedDataStreamIds[datastreamId]?.subscribed) {
            if (typeof feature?.get !== "function") {
                return;
            }
            this.updateFeatureLocation(feature, observation, () => {
                this.locationUpdating[feature.get("dataStreamId")] = false;
            });
            if (this.showHistoricalFeatures && Array.isArray(feature.get("historicalFeatureIds")) && feature.get("historicalFeatureIds").length) {
                this.updateHistoricalFeatures(feature, clonedFeature, layerSource);
            }
        }
    });
};

/**
 * Update the historical features for given feature and add onto the map.
 * @param {ol/Feature} feature The feature to update historical features for
 * @param {ol/Feature} clonedFeature The cloned feature to use for old location
 * @param {ol/Layer/Source} layerSource The layer source
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.updateHistoricalFeatures = function (feature, clonedFeature, layerSource) {
    if (typeof feature?.get !== "function" || !Array.isArray(feature.get("historicalFeatureIds")) || typeof clonedFeature?.set !== "function") {
        return;
    }
    const removedFeature = feature.get("historicalFeatureIds").pop();

    if (typeof removedFeature !== "undefined") {
        layerSource.removeFeature(layerSource.getFeatureById(removedFeature));
    }
    clonedFeature.set("dataStreamId", undefined);
    clonedFeature.setId(uniqueId("historicalFeature-"));
    feature.get("historicalFeatureIds").unshift(clonedFeature.getId());
    layerSource.addFeature(clonedFeature);
    feature.get("historicalFeatureIds").forEach((id, index) => {
        const scale = this.getScale(
            index,
            feature.get("historicalFeatureIds").length,
            this.get("scaleStyleByZoom"),
            mapCollection.getMapView("2D").getZoom() + 1,
            mapCollection.getMapView("2D").getResolutions().length);

        if (!isObject(layerSource.getFeatureById(id))) {
            return;
        }
        layerSource.getFeatureById(id).set("originScale", this.getScale(index, feature.get("historicalFeatureIds").length));
        this.setStyleOfHistoricalFeature(layerSource.getFeatureById(id), scale, this.styleRule);
    });
};

/**
 * Extracts the host name from the given url
 * @param {String} url the url to find the host name in
 * @param {Function} onError the function to call errors with
 * @returns {String} the extracted host name
 */
Layer2dVectorSensorThings.prototype.getMqttHostFromUrl = function (url, onError) {
    if (typeof url !== "string") {
        if (typeof onError === "function") {
            onError(new Error("getMqttHostFromUrl: the given url is not a string."));
        }
        return "";
    }
    const mqttHost = url.split("/")[2];

    if (typeof mqttHost !== "string") {
        if (typeof onError === "function") {
            onError(new Error("getMqttHostFromUrl: the given url does not include the host name."));
        }
        return "";
    }

    return mqttHost;
};

/**
 * Extracts the datastream id from the given topic.
 * @param {String} topic the topic to extract datastream id from.
 * @returns {String} the found datastream id.
 */
Layer2dVectorSensorThings.prototype.getDatastreamIdFromMqttTopic = function (topic) {
    if (typeof topic !== "string") {
        return "";
    }
    const datastreamIdx = topic.indexOf("Datastreams(");

    if (datastreamIdx === -1) {
        return "";
    }
    return topic.substring(datastreamIdx + 12, topic.indexOf(")", datastreamIdx + 12));
};

/**
 * Getter for feature by a given id.
 * @param {ol/Feature[]} features the features to search through
 * @param {String} id the id to lookup the feature for
 * @returns {ol/Feature} the ol feature with the given id
 */
Layer2dVectorSensorThings.prototype.getFeatureByDatastreamId = function (features, id) {
    if (!Array.isArray(features) || typeof id !== "string") {
        return null;
    }
    const len = features.length;

    for (let i = 0; i < len; i++) {
        if (
            typeof features[i]?.get !== "function"
            || typeof features[i].get("dataStreamId") !== "string"
            || !features[i].get("dataStreamId").split(" | ").includes(id)
        ) {
            continue;
        }
        return features[i];
    }
    return null;
};


/**
 * Initial loading of sensor data
 * @param {Function} onsuccess a function to call on success
 * @param {Boolean} updateOnly set to true to avoid clearing the source
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.initializeConnection = function (onsuccess, updateOnly = false) {
    const url = this.get("url"),
        version = this.get("version"),
        urlParams = this.get("urlParameter"),
        currentExtent = {
            extent: store.getters["Maps/extent"],
            sourceProjection: mapCollection.getMapView("2D").getProjection().getCode(),
            targetProjection: this.get("epsg")
        },
        intersect = typeof this.get("intersect") === "boolean" ? this.get("intersect") : true,
        mapProjection = mapCollection.getMapView("2D").getProjection(),
        epsg = this.get("epsg"),
        gfiTheme = this.get("gfiTheme"),
        utc = this.get("utc"),
        datastreamIds = this.getDatastreamIdsInCurrentExtent(this.getLayerSource().getFeatures(), store.getters["Maps/extent"]);

    this.callSensorThingsAPI(url, version, urlParams, currentExtent, intersect, sensorData => {
        const filteredSensorData = !updateOnly ? sensorData : sensorData.filter(data => !datastreamIds.includes(data?.properties?.dataStreamId)),
            features = this.createFeaturesFromSensorData(filteredSensorData, mapProjection, epsg, gfiTheme, utc),
            layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
            oldHistoricalFeatures = layerSource.getFeatures().filter(f => typeof f.get("dataStreamId") === "undefined"),
            copyFeatures = {};

        if (this.get("loadThingsOnlyInCurrentExtent")) {
            oldHistoricalFeatures.forEach(oldFeature => {
                copyFeatures[oldFeature.getId()] = oldFeature.clone();
            });
        }

        if (!updateOnly) {
            layerSource.clear();
        }

        if (Array.isArray(features) && features.length) {
            if (isObject(features[0]) && typeof features[0].getGeometry === "function" && (features[0].getGeometry().getType() === "Point" || features[0].getGeometry().getType() === "MultiPoint")) {
                this.prepareFeaturesFor3D(features);
            }
            layerSource.addFeatures(features);
        }

        features.forEach(feature => {
            if (typeof feature?.get === "function" && Array.isArray(feature.get("historicalFeatureIds"))) {
                feature.unset("historicalFeatureIds");
            }
        });

        if (typeof onsuccess === "function") {
            onsuccess(features);
        }

        if (typeof this.get("historicalLocations") === "number" && this.showHistoricalFeatures) {
            if (this.get("loadThingsOnlyInCurrentExtent") && Object.entries(copyFeatures).length) {
                features.forEach(feature => {
                    const dataStreamIdFeature = feature.get("dataStreamId");

                    if (this.subscribedDataStreamIds[dataStreamIdFeature]?.subscribed && Array.isArray(this.subscribedDataStreamIds[dataStreamIdFeature].historicalFeatureIds)) {
                        feature.set("subscribed", true);
                        feature.set("historicalFeatureIds", this.subscribedDataStreamIds[dataStreamIdFeature].historicalFeatureIds);
                    }
                });
                Object.entries(copyFeatures).forEach(([id, feature]) => {
                    feature.setId(id);
                    layerSource.addFeature(feature);
                });
            }
        }
        if (this.get("observeLocation") && this.get("loadThingsOnlyInCurrentExtent")) {
            this.getHistoricalLocationsOfFeatures();
        }
        layerSource.dispatchEvent({
            type: "featuresloadend",
            features: layerSource.getFeatures()
        });
    }, error => {
        console.warn(error);
        if (typeof this.options?.onLoadingError === "function") {
            this.options.onLoadingError(error);
        }
    });
};

/**
 * Calls the SensorThings-API via http.
 * @param {String} url The url to service
 * @param {String} version The version from service
 * @param {Object} urlParams The url parameters
 * @param {Object} currentExtent the extent coordinates
 * @param {Boolean} intersect true if it intersects, false if not
 * @param {Function} onsuccess a callback function (result) with the result to call on success and result: all things with attributes and location
 * @param {Function} onerror a callback function (err) to pass errors with
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.callSensorThingsAPI = function (url, version, urlParams, currentExtent, intersect, onsuccess, onerror) {
    const requestUrl = this.buildSensorThingsUrl(url, version, urlParams),
        http = new SensorThingsHttp({
            rootNode: urlParams?.root
        });

    if (!this.get("loadThingsOnlyInCurrentExtent")) {
        http.get(requestUrl, result => {
            if (typeof onsuccess === "function") {
                onsuccess(this.getAllThings(result, urlParams, url, version));
            }
        }, null, null, onerror);
    }
    else {
        http.getInExtent(requestUrl, currentExtent, intersect, result => {
            if (typeof onsuccess === "function") {
                onsuccess(this.getAllThings(result, urlParams, url, version));
            }
        }, null, null, onerror);
    }
};

/**
 * Builds the SensorThings url.
 * @param {String} url the url to the service
 * @param {String} version the version from the service
 * @param {Object} urlParams the url parameters
 * @returns {String} url to request the sensorThings with
 */
Layer2dVectorSensorThings.prototype.buildSensorThingsUrl = function (url, version, urlParams) {
    const root = urlParams?.root || "Things",
        versionAsString = typeof version === "number" ? version.toFixed(1) : version;
    let query = "";

    if (isObject(urlParams)) {
        for (const key in urlParams) {
            if (key === "root") {
                continue;
            }
            else if (query !== "") {
                query += "&";
            }

            if (Array.isArray(urlParams[key])) {
                if (urlParams[key].length) {
                    query += "$" + key + "=" + urlParams[key].join(",");
                }
            }
            else {
                query += "$" + key + "=" + urlParams[key];
            }
        }
    }

    return `${url}/v${versionAsString}/${root}?${query}`;
};

/**
 * Prepares and Returns all things
 * @param {Object[]} sensordata response of called sensorAPI
 * @param {Object} urlParams The url parameters
 * @param {String} url The url to service
 * @param {String} version The version from service
 * @returns {Object[]} all prepared things
 */
Layer2dVectorSensorThings.prototype.getAllThings = function (sensordata, urlParams, url, version) {
    let allThings;

    if (urlParams?.root === "Datastreams") {
        allThings = this.changeSensordataRootToThings(sensordata, this.get("datastreamAttributes"), this.get("thingAttributes"));
        allThings = this.unifyThingsByIds(allThings);
    }
    else {
        allThings = this.flattenArray(sensordata);
    }

    allThings = this.createPropertiesOfDatastreams(allThings, this.get("showNoDataValue"), this.get("noDataValue"), this.get("utc"), this.get("timezone"));
    allThings = this.aggregatePropertiesOfThings(allThings, url, version);

    return allThings;
};

/**
 * Changes the root in the sensordata from datastream to thing.
 * @param {Object[]} sensordata the sensordata with datastream as root.
 * @param {String[]} datastreamAttributes The datastream attributes.
 * @param {String[]} thingAttributes The thing attributes.
 * @returns {Object[]} The sensordata with things as root.
 */
Layer2dVectorSensorThings.prototype.changeSensordataRootToThings = function (sensordata, datastreamAttributes, thingAttributes) {
    if (!Array.isArray(sensordata)) {
        return [];
    }
    const result = [],
        datastreamAttributesAssociation = this.createAssociationObject(datastreamAttributes),
        thingAttributesAssociation = this.createAssociationObject(thingAttributes);

    sensordata.forEach(stream => {
        if (!isObject(stream?.Thing)) {
            return;
        }
        const datastreamNewAttributes = {},
            thing = {
                Datastreams: [datastreamNewAttributes]
            };

        Object.keys(stream).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(datastreamAttributesAssociation, key)) {
                datastreamNewAttributes[key] = stream[key];
            }
        });
        Object.keys(stream.Thing).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(thingAttributesAssociation, key)) {
                thing[key] = stream.Thing[key];
            }
        });

        result.push(thing);
    });

    return result;
};

/**
 * Converts elements of an array to keys in an object with value to be true.
 * @param {String[]} array Array with value to convert to an object.
 * @returns {Object} The object with value of the given array as keys.
 */
Layer2dVectorSensorThings.prototype.createAssociationObject = function (array) {
    if (!Array.isArray(array)) {
        return {};
    }
    const associationObject = {};

    array.forEach(key => {
        associationObject[key] = true;
    });

    return associationObject;
};

/**
 * Merge datastreams based on the id of the thing if the ids exist multiple times.
 * @param {Object[]} allThings The sensordata with things as root.
 * @returns {Object[]} The sensordata with merged things as root.
 */
Layer2dVectorSensorThings.prototype.unifyThingsByIds = function (allThings) {
    if (!Array.isArray(allThings)) {
        return [];
    }
    const allThingsAssoc = {};

    allThings.forEach(thing => {
        if (!isObject(thing)) {
            return;
        }
        else if (!isObject(allThingsAssoc[thing["@iot.id"]])) {
            allThingsAssoc[thing["@iot.id"]] = thing;
            return;
        }
        allThingsAssoc[thing["@iot.id"]].Datastreams = allThingsAssoc[thing["@iot.id"]].Datastreams.concat(thing.Datastreams);
    });

    return Object.values(allThingsAssoc);
};

/**
 * Creates a new array with concatenated sub array elements.
 * @info this is equivalent to Array.flat() - except no addition for testing is needed for this one - Array.flat() is a problem for tests and IE11 - so in sta.js we use the this.flattenArray(arr) function - one flat() was left in sta.js, this is solved now
 * @param {*} arr the array to flatten sub arrays or anything else
 * @returns {*} the flattened array if an array was given, the untouched input otherwise
 */
Layer2dVectorSensorThings.prototype.flattenArray = function (arr) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    let result = [];

    arr.forEach(value => {
        if (Array.isArray(value)) {
            result = result.concat(value);
        }
        else {
            result.push(value);
        }
    });

    return result;
};

/**
 * Iterates over things and creates attributes for each observed property.
 * @param {Object[]} allThings All things.
 * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
 * @param {String} noDataValue the value to use for "nodata"
 * @param {String} utc utc="+1" UTC-Timezone to calculate correct time.
 * @param {String} timezone name of the sensors origin timezone.
 * @returns {Object[]} All things with the newest observation for each dataStream.
 */
Layer2dVectorSensorThings.prototype.createPropertiesOfDatastreams = function (allThings, showNoDataValue, noDataValue, utc, timezone) {
    if (!Array.isArray(allThings)) {
        return [];
    }

    allThings.forEach(thing => {
        if (!isObject(thing) || !Array.isArray(thing.Datastreams)) {
            return;
        }
        else if (!isObject(thing.properties)) {
            thing.properties = {};
        }

        thing.properties.dataStreamId = [];
        thing.properties.dataStreamName = [];
        thing.properties.dataStreamValue = [];
        thing.properties.dataPhenomenonTime = [];

        this.createPropertiesOfDatastreamsHelper(thing.Datastreams, thing.properties, showNoDataValue, noDataValue, utc, timezone);

        thing.properties.dataStreamId = thing.properties.dataStreamId.join(" | ");
        thing.properties.dataStreamValue = thing.properties.dataStreamValue.join(" | ");
        thing.properties.dataStreamName = thing.properties.dataStreamName.join(" | ");
        thing.properties.dataPhenomenonTime = thing.properties.dataPhenomenonTime.join(" | ");
    });

    return allThings;
};

/**
 * Iterates over the dataStreams and creates the attributes for each datastream:
 * "dataStream_[dataStreamId]_[dataStreamName]" and
 * "dataStream_[dataStreamId]_[dataStreamName]_phenomenonTime".
 * @param {Object[]} dataStreams the dataStreams of the thing.
 * @param {Object} properties the properties of the thing.
 * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
 * @param {String} noDataValue the value to use for "nodata"
 * @param {String} utc utc="+1" UTC-Timezone to calculate correct time.
 * @param {String} timezone name of the sensors origin timezone.
 * @returns {Boolean} true on success, false if something went wrong.
 */
Layer2dVectorSensorThings.prototype.createPropertiesOfDatastreamsHelper = function (dataStreams, properties, showNoDataValue, noDataValue, utc, timezone) {
    if (!Array.isArray(dataStreams) || !isObject(properties)) {
        return false;
    }

    dataStreams.forEach(dataStream => {
        if (!isObject(dataStream)) {
            return;
        }
        const dataStreamId = String(dataStream["@iot.id"]),
            dataStreamName = dataStream.name,
            dataStreamValue = Array.isArray(dataStream.Observations) ? dataStream.Observations[0]?.result : "",
            dataStreamUnit = dataStream.unitOfMeasurement?.name,
            key = "dataStream_" + dataStreamId + "_" + dataStreamName;
        let phenomenonTime = Array.isArray(dataStream.Observations) ? dataStream.Observations[0]?.phenomenonTime : "";

        this.moveDatastreamPropertiesToThing(properties, dataStream.properties);
        phenomenonTime = changeTimeZone(phenomenonTime?.split("/")[0], utc);

        properties.dataStreamId.push(dataStreamId);
        properties.dataStreamName.push(dataStreamName);

        if (dataStreamValue !== "") {
            properties[key] = dataStreamValue;
            properties[key + "_phenomenonTime"] = this.getLocalTimeFormat(phenomenonTime, timezone);
            properties.dataStreamValue.push(dataStreamValue);
            properties.dataPhenomenonTime.push(phenomenonTime);
        }
        else if (showNoDataValue) {
            properties[key] = noDataValue;
            properties[key + "_phenomenonTime"] = noDataValue;
            properties.dataStreamValue.push(noDataValue);
        }
        if (typeof dataStreamUnit !== "undefined" && typeof this.get("rotationUnit") !== "undefined" && dataStreamUnit === this.get("rotationUnit")) {
            properties.rotation = {
                isDegree: true,
                value: typeof dataStreamValue !== "undefined" ? dataStreamValue : 0
            };
        }
    });

    return true;
};

/**
 * Adds data from datastream to the thing with pipe separator.
 * @param {Object} thingProperties The properties from the thing.
 * @param {Object} dataStreamProperties The properties from the dataStream.
 * @returns {Boolean} returns true on success and false if anything went wrong.
 */
Layer2dVectorSensorThings.prototype.moveDatastreamPropertiesToThing = function (thingProperties, dataStreamProperties) {
    if (!isObject(thingProperties) || !isObject(dataStreamProperties)) {
        return false;
    }
    Object.entries(dataStreamProperties).forEach(([key, value]) => {
        if (typeof thingProperties[key] !== "undefined") {
            thingProperties[key] = thingProperties[key] + " | " + value;
        }
        else {
            thingProperties[key] = value;
        }
    });

    return true;
};

/**
 * Returns date and time in clients local format converting utc time to sensors origin timezone.
 * @param {String} phenomenonTime phenomenonTime given by sensor
 * @param {String} timezone name of the sensors origin timezone
 * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 * @see https://day.js.org/docs/en/timezone/timezone
 * @returns {String} A date string based on phenomenonTime and timezone in clients local format or an empty string if an unknown phenomenonTime is given.
 */
Layer2dVectorSensorThings.prototype.getLocalTimeFormat = function (phenomenonTime, timezone) {
    const utcTime = this.getFirstPhenomenonTime(phenomenonTime);

    if (utcTime) {
        return dayjs(utcTime).tz(timezone).format("LLL");
    }
    return "";
};

/**
 * Some sensors deliver a time interval like "2020-04-02T14:00:01.000Z/2020-04-02T14:15:00.000Z".
 * Other sensors deliver a single time like "2020-04-02T14:00:01.000Z".
 * This function returns the first time given in string. Delimiter is always "/".
 * @param {String} phenomenonTime The phenomenonTime given by sensor
 * @returns {String} The first phenomenonTime
 */
Layer2dVectorSensorThings.prototype.getFirstPhenomenonTime = function (phenomenonTime) {
    if (typeof phenomenonTime !== "string") {
        return undefined;
    }
    else if (phenomenonTime.split("/").length !== 2) {
        return phenomenonTime;
    }

    return phenomenonTime.split("/")[0];
};

/**
 * Aggregates the properties of the things.
 * @param {Object[]} allThings all things
 * @param {String} url The url to service
 * @param {String} version The version from service
 * @returns {Object[]} aggregated things
 */
Layer2dVectorSensorThings.prototype.aggregatePropertiesOfThings = function (allThings, url, version) {
    if (!Array.isArray(allThings)) {
        return [];
    }
    const result = [];

    allThings.forEach(thing => {
        const aggregatedThing = {};

        if (Array.isArray(thing)) {
            this.aggregatePropertiesOfThingAsArray(thing, aggregatedThing);
        }
        else {
            this.aggregatePropertiesOfOneThing(thing, aggregatedThing);
        }
        if (!isObject(aggregatedThing.properties)) {
            aggregatedThing.properties = {};
        }
        aggregatedThing.properties.requestUrl = url;
        aggregatedThing.properties.versionUrl = version;

        result.push(aggregatedThing);
    });

    return result;
};

/**
 * Aggregates the properties of an array of things.
 * @param {Object[]} arrayOfThings the array of things
 * @param {Object} result the thing to add aggregated properties to
 * @returns {Boolean} returns true on success and false if something went wrong
 */
Layer2dVectorSensorThings.prototype.aggregatePropertiesOfThingAsArray = function (arrayOfThings, result) {
    if (!Array.isArray(arrayOfThings) || !isObject(result)) {
        return false;
    }
    let keys = [],
        props = {},
        datastreams = [];

    result.location = this.getThingsGeometry(arrayOfThings[0], 0);

    arrayOfThings.forEach(thing => {
        if (!isObject(thing) || !isObject(thing.properties)) {
            return;
        }
        keys.push(Object.keys(thing.properties));
        props = Object.assign(props, thing.properties);
        if (thing?.Datastreams) {
            datastreams = datastreams.concat(thing.Datastreams);
        }
    });

    keys = [...new Set(this.flattenArray(keys))];
    keys.push("name");
    keys.push("description");
    keys.push("@iot.id");

    result.properties = Object.assign({}, props, this.aggregateProperties(arrayOfThings, keys));
    if (datastreams.length > 0) {
        result.properties.Datastreams = datastreams;
    }

    return true;
};

/**
 * Searches the thing for its geometry location.
 * For some reason there are two different object pathes to check.
 * @param {Object} thing the aggregated thing
 * @param {Number} index the index of the location in array Locations
 * @returns {Object} the geometry object or null if none was found
 */
Layer2dVectorSensorThings.prototype.getThingsGeometry = function (thing, index) {
    const locations = thing?.Locations || thing?.Thing?.Locations,
        location = locations && Object.prototype.hasOwnProperty.call(locations, index) && locations[index]?.location ? locations[index].location : null;

    if (location?.geometry && location.geometry?.type) {
        return location.geometry;
    }
    else if (location?.type) {
        return location;
    }

    return null;
};

/**
 * Aggregates the properties of the given keys and joins them by " | ".
 * @param {Object[]} things Array of things to aggregate
 * @param {String[]} keys Keys to aggregate
 * @returns {Object} the aggregated properties
 */
Layer2dVectorSensorThings.prototype.aggregateProperties = function (things, keys) {
    const result = {};

    keys.forEach(key => {
        const value = [];

        things.forEach(thing => {
            if (key === "name" || key === "description" || key === "@iot.id") {
                value.push(thing[key]);
            }
            else {
                value.push(thing.properties[key]);
            }
        });
        result[key] = value.join(" | ");
    });

    return result;
};

/**
 * Aggregates the properties of one thing.
 * @param {Object} thing the thing to aggregate properties from
 * @param {Object} result the thing to add aggregated properties to
 * @returns {Boolean} returns true on success and false if something went wrong.
 */
Layer2dVectorSensorThings.prototype.aggregatePropertiesOfOneThing = function (thing, result) {
    if (!isObject(thing) || !isObject(result)) {
        return false;
    }
    result.location = this.getThingsGeometry(thing, 0);
    result.properties = thing.properties;

    if (!isObject(result.properties)) {
        result.properties = {};
    }
    result.properties.name = thing.name;
    result.properties.description = thing.description;
    result.properties["@iot.id"] = thing["@iot.id"];

    if (thing?.Datastreams) {
        result.properties.Datastreams = thing.Datastreams;
    }

    return true;
};

/**
 * Creates features from given sensor data
 * @param {Object[]} sensorData sensor with location and properties
 * @param {ol/proj/Projection} mapProjection projection of the map
 * @param {String} epsg the epsg of sensortype
 * @param {String|Object} gfiTheme The name of the gfiTheme or an object of gfiTheme
 * @param {String} utc="+1" UTC-Timezone to calculate correct time.
 * @param {Boolean} isHistorical if it is historical data
 * @returns {ol/Feature[]} feature to draw
 */
Layer2dVectorSensorThings.prototype.createFeaturesFromSensorData = function (sensorData, mapProjection, epsg, gfiTheme, utc, isHistorical = false) {
    if (!Array.isArray(sensorData) || typeof epsg === "undefined") {
        return [];
    }
    const features = [];

    sensorData.forEach((data, index) => {
        if (!data?.location) {
            return;
        }
        let feature = this.createFeatureByLocation(
            data.location,
            mapProjection,
            epsg,
            error => {
                console.warn(error);
            }
        );

        feature.setId(index);
        feature.setProperties(data.properties, true);

        if (isObject(gfiTheme)) {
            feature.set("gfiParams", gfiTheme?.params, true);
        }
        feature.set("utc", utc, true);
        if (isHistorical) {
            feature.set("scale", this.getScale(index - 1, sensorData.length - 1, this.get("scaleStyleByZoom"), mapCollection.getMapView("2D").getZoom() + 1, mapCollection.getMapView("2D").getResolutions().length));
            feature.set("originScale", this.getScale(index - 1, sensorData.length - 1));
        }
        feature = this.aggregateDataStreamValue(feature);
        feature = this.aggregateDataStreamPhenomenonTime(feature);
        features.push(feature);
    });

    return features.filter(subFeature => typeof subFeature.getGeometry() !== "undefined");
};

/**
 * Tries to parse object to ol/format/GeoJson
 * @param {Object} data the object to parse
 * @param {ol/proj/Projection} featureProjection projection of the map
 * @param {String} dataProjection projection of the thing
 * @param {Function} onerror a function(error) to be called on error
 * @returns {ol/Feature} the ol feature
 */
Layer2dVectorSensorThings.prototype.createFeatureByLocation = function (data, featureProjection, dataProjection, onerror) {
    const geojsonReader = new GeoJSON({
        featureProjection,
        dataProjection
    });

    try {
        return geojsonReader.readFeature(data);
    }
    catch (err) {
        if (typeof onerror === "function") {
            onerror(new Error("createFeatureByLocation: JSON structure in sensor thing location can't be parsed."));
        }
    }
    return null;
};

/**
 * Aggregates the value and adds them as property "dataStreamValues".
 * @param {ol/Feature} feature The ol feature.
 * @returns {ol/Feature} The feature with new attribute "dataStreamValues".
 */
Layer2dVectorSensorThings.prototype.aggregateDataStreamValue = function (feature) {
    const modifiedFeature = feature,
        dataStreamValues = [];

    if (feature && feature.get("dataStreamId")) {
        feature.get("dataStreamId").split(" | ").forEach((id, i) => {
            const dataStreamName = feature.get("dataStreamName").split(" | ")[i];

            if (this.get("showNoDataValue") && !feature.get("dataStream_" + id + "_" + dataStreamName) === "") {
                dataStreamValues.push(this.get("noDataValue"));
            }
            else if (feature.get("dataStream_" + id + "_" + dataStreamName)) {
                dataStreamValues.push(feature.get("dataStream_" + id + "_" + dataStreamName));
            }
        });
        if (dataStreamValues.length > 0) {
            modifiedFeature.set("dataStreamValue", dataStreamValues.join(" | "), true);
        }
    }
    return modifiedFeature;
};

/**
 * Aggregates the phenomenonTimes and adds them as property "dataStreamPhenomenonTime".
 * @param {ol/Feature} feature The ol feature.
 * @returns {ol/Feature} The feature with new attribute "dataStreamPhenomenonTime".
 */
Layer2dVectorSensorThings.prototype.aggregateDataStreamPhenomenonTime = function (feature) {
    const modifiedFeature = feature,
        dataStreamPhenomenonTimes = [];

    if (feature && feature.get("dataStreamId")) {
        feature.get("dataStreamId").split(" | ").forEach((id, i) => {
            const dataStreamName = feature.get("dataStreamName").split(" | ")[i];

            if (this.get("showNoDataValue") && !feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime")) {
                dataStreamPhenomenonTimes.push(this.get("noDataValue"));
            }
            else if (feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime")) {
                dataStreamPhenomenonTimes.push(feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime"));
            }
        });
        modifiedFeature.set("dataStreamPhenomenonTime", dataStreamPhenomenonTimes.join(" | "), true);
    }
    return modifiedFeature;
};

/**
 * Starts or stops subscription according to its conditions.
 * Because of usage of several listeners it's necessary to create a "isSubscribed" flag to prevent multiple executions.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.toggleSubscriptionsOnMapChanges = function () {
    const state = this.getStateOfSTALayer(this.getLayer().getVisible(), this.get("isSubscribed"));

    if (state === true) {
        this.startSubscription(this.getLayer().getSource().getFeatures());
        if (this.get("observeLocation") && this.moveLayerRevisible === false) {
            this.moveLayerRevisible = state;
        }
    }
    else if (state === false) {
        this.stopSubscription();
    }
};

/**
 * Stops mqtt subscriptions based on the layers state.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.stopSubscription = function () {
    const subscriptionTopics = this.get("subscriptionTopics"),
        version = this.get("version"),
        mqttClient = this.mqttClient;

    this.set("isSubscribed", false);
    store.dispatch("Maps/unregisterListener", {type: "moveend", listener: this.updateSubscription.bind(this)});
    this.unsubscribeFromSensorThings([], subscriptionTopics, version, mqttClient);
    clearInterval(this.intervallRequest);
    this.keepUpdating = false;
};

/**
 * Starts the interval for continous updating the features in the current extent.
 * @param {Number} timeout The timeout in milliseconds.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.startIntervalUpdate = function (timeout) {
    if (!this.keepUpdating || typeof timeout !== "number") {
        return;
    }
    if (this.intervallRequest !== null) {
        clearInterval(this.intervallRequest);
    }
    this.intervallRequest = setTimeout(() => {
        const datastreamIds = this.getDatastreamIdsInCurrentExtent(this.getLayerSource().getFeatures(), store.getters["Maps/extent"]),
            subscriptionTopics = this.get("subscriptionTopics"),
            version = this.get("version"),
            mqttClient = this.mqttClient,
            rh = this.get("mqttRh"),
            qos = this.get("mqttQos");

        this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, mqttClient);
        this.initializeConnection(async features => {
            await this.subscribeToSensorThings(
                this.getDatastreamIdsInCurrentExtent(features, store.getters["Maps/extent"]),
                subscriptionTopics,
                version,
                mqttClient,
                {rh, qos}
            );
        }, true);
        this.startIntervalUpdate(timeout);
    }, timeout);
};

/**
 * Returns the state of the layer based on visibility and isSubscribed.
 * @param {Boolean} visibility If value model is visible or not.
 * @param {Boolean} isSubscribed To prevent multiple executions.
 * @returns {Boolean} true if layer should be subscribed, false if not
 */
Layer2dVectorSensorThings.prototype.getStateOfSTALayer = function (visibility, isSubscribed) {
    if (visibility && !isSubscribed) {
        return true;
    }
    else if (!visibility && isSubscribed) {
        return false;
    }
    return undefined;
};

/**
 * Starts mqtt subscriptions based on the layers state.
 * @param {ol/Feature[]} features all features of the Layer
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.startSubscription = function (features) {
    this.set("isSubscribed", true);
    if (!this.get("loadThingsOnlyInCurrentExtent") && Array.isArray(features) && !features.length) {
        this.initializeConnection(function () {
            this.updateSubscription();
            store.dispatch("Maps/registerListener", {type: "moveend", listener: this.updateSubscription.bind(this)});
            this.keepUpdating = true;
            if (this.get("enableContinuousRequest")) {
                this.startIntervalUpdate(typeof this.get("factor") === "number" ? this.get("factor") * 1000 : undefined);
            }
        }.bind(this));
    }
    else {
        this.updateSubscription();
        store.dispatch("Maps/registerListener", {type: "moveend", listener: this.updateSubscription.bind(this)});
        this.keepUpdating = true;
        if (this.get("enableContinuousRequest")) {
            this.startIntervalUpdate(typeof this.get("factor") === "number" ? this.get("factor") * 1000 : undefined);
        }
    }
};

/**
 * Starts the interval for continous updating the features in the current extent.
 * @param {Number} timeout The timeout in milliseconds.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.startIntervalUpdate = function (timeout) {
    if (!this.keepUpdating || typeof timeout !== "number") {
        return;
    }
    if (this.intervallRequest !== null) {
        clearInterval(this.intervallRequest);
    }
    this.intervallRequest = setTimeout(() => {
        const datastreamIds = this.getDatastreamIdsInCurrentExtent(this.getLayerSource().getFeatures(), store.getters["Maps/extent"]),
            subscriptionTopics = this.get("subscriptionTopics"),
            version = this.get("version"),
            mqttClient = this.mqttClient,
            rh = this.get("mqttRh"),
            qos = this.get("mqttQos");

        this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, mqttClient);
        this.initializeConnection(features => {
            this.subscribeToSensorThings(
                this.getDatastreamIdsInCurrentExtent(features, store.getters["Maps/extent"]),
                subscriptionTopics,
                version,
                mqttClient,
                {rh, qos}
            );
        }, true);
        this.startIntervalUpdate(timeout);
    }, timeout);
};

/**
 * Refreshes all subscriptions by ending all established subscriptions and creating new ones.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.updateSubscription = async function () {
    const datastreamIds = this.getDatastreamIdsInCurrentExtent(this.getLayer().getSource().getFeatures(), store.getters["Maps/extent"]),
        subscriptionTopics = this.get("subscriptionTopics"),
        version = this.get("version"),
        mqttClient = this.mqttClient,
        rh = this.get("mqttRh"),
        qos = this.get("mqttQos");

    if (!this.get("loadThingsOnlyInCurrentExtent") && !this.moveLayerRevisible) {
        this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, mqttClient);
        await this.subscribeToSensorThings(datastreamIds, subscriptionTopics, version, mqttClient, {rh, qos});
        if (typeof this.get("historicalLocations") === "number") {
            this.getHistoricalLocationsOfFeatures();
        }
    }
    else {
        this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, mqttClient);
        this.initializeConnection(async () => {
            await this.subscribeToSensorThings(
                this.getDatastreamIdsInCurrentExtent(this.getLayer().getSource().getFeatures(), store.getters["Maps/extent"]),
                subscriptionTopics,
                version,
                mqttClient,
                {rh, qos}
            );
        });
    }
    this.moveLayerRevisible = false;
};

/**
 * Getter for datastream ids of features in current extent.
 * @param {ol/Feature[]} features the features of this layer
 * @param {ol/extent} currentExtent the current browser extent
 * @returns {String[]} an array containing all datastream ids from this layer in the current extent
 */
Layer2dVectorSensorThings.prototype.getDatastreamIdsInCurrentExtent = function (features, currentExtent) {
    const featuresInExtent = this.getFeaturesInExtent(features, currentExtent);

    return this.getDatastreamIds(featuresInExtent);
};

/**
 * Returns features in enlarged extent (enlarged by a fixed percentage to make sure moving features close to the extent can move into the mapview).
 * @param {ol/Feature[]} features all features
 * @param {ol/extent} currentExtent the current browser extent coordinates
 * @returns {ol/Feature[]} the features in the given extent
 */
Layer2dVectorSensorThings.prototype.getFeaturesInExtent = function (features, currentExtent) {
    const featuresInExtent = [];
    let enlargedExtent = currentExtent;

    if (typeof this.get("maxSpeedKmh") !== "undefined") {
        enlargedExtent = this.enlargeExtentForMovableFeatures(currentExtent, this.get("maxSpeedKmh"), this.get("factor"));
    }
    else {
        enlargedExtent = this.enlargeExtent(currentExtent, 0.05);
    }

    features.forEach(feature => {
        if (containsExtent(enlargedExtent, feature.getGeometry().getExtent())) {
            featuresInExtent.push(feature);
        }
    });
    return featuresInExtent;
};

/**
 * Enlarges the given extent by the given factor.
 * @param {ol/extent} extent extent to enlarge
 * @param {Number} factor factor to enlarge extent
 * @returns {ol/extent} the enlarged extent
 */
Layer2dVectorSensorThings.prototype.enlargeExtent = function (extent, factor) {
    const bufferAmount = (extent[2] - extent[0]) * factor;

    return buffer(extent, bufferAmount);
};

/**
 * Enlarges the given extent depending on the max. speed of the features and an additional factor.
 * @param {ol/extent} extent - The current map extent.
 * @param {Number} maxSpeed - The max. speed of the features in km/h.
 * @param {Number} [factor=10] - An optional factor to enlarge the extent.
 * @returns {ol/extent|Boolean} The enlarged extent or false if something failed.
 */
Layer2dVectorSensorThings.prototype.enlargeExtentForMovableFeatures = function (extent, maxSpeed, factor = 10) {
    let defaultFactor = factor;

    if (!Array.isArray(extent) || extent.length !== 4) {
        console.error("sta.enlargeExtentForMovableFeatures: The first parameter must be an array with the length of 4, but got " + typeof extent);
        return false;
    }
    if (typeof maxSpeed !== "number") {
        console.error("sta.enlargeExtentForMovableFeatures: The second parameter must be a number, but got " + typeof maxSpeed);
        return false;
    }
    if (typeof factor !== "number") {
        console.error("sta.enlargeExtentForMovableFeatures: The third parameter must be a number, but got " + typeof factor + ". Use the default 10 instead.");
        defaultFactor = 10;
    }
    const minPerSec = maxSpeed / 3600 * 1000,
        bufferAmount = minPerSec * defaultFactor;

    return buffer(extent, bufferAmount);
};

/**
 * Getter for datastream ids for this layer - using dataStreamId property with expected pipe delimitors.
 * @param {ol/Feature[]} features features with datastream ids or features with features (see clustering) with datastreamids
 * @returns {String[]} an array containing all datastream ids from this layer
 */
Layer2dVectorSensorThings.prototype.getDatastreamIds = function (features) {
    if (!Array.isArray(features)) {
        return [];
    }
    const dataStreamIdsArray = [];

    features.forEach(feature => {
        if (typeof feature?.get === "function" && Array.isArray(feature.get("features"))) {
            feature.get("features").forEach(subfeature => {
                this.getDatastreamIdsHelper(subfeature, dataStreamIdsArray);
            });
        }
        else {
            this.getDatastreamIdsHelper(feature, dataStreamIdsArray);
        }
    });

    return dataStreamIdsArray;
};

/**
 * Helper function for getDatastreamIds: Pushes the datastream ids into the given array.
 * @param {ol/Feature} feature the feature containing datastream ids
 * @param {String[]} dataStreamIdsArray the array to push the datastream ids into
 * @returns {Boolean} true if the function ran successfull, false if not
 */
Layer2dVectorSensorThings.prototype.getDatastreamIdsHelper = function (feature, dataStreamIdsArray) {
    if (typeof feature?.get !== "function" || typeof feature.get("dataStreamId") !== "string" || !Array.isArray(dataStreamIdsArray)) {
        return false;
    }

    feature.get("dataStreamId").split(" | ").forEach(id => {
        dataStreamIdsArray.push(id);
    });

    return true;
};

/**
 * Unsubscribes from the mqtt client with topics subscribed in the past.
 * @param {String[]} datastreamIdsNotToUnsubscribe an array of datastreamIds as whitelist not to unsubscribe from
 * @param {Object} subscriptionTopics an object of subscribed ids as keys and true/false als value
 * @param {String} version the STA version to use in topic
 * @param {Object} mqttClient the mqtt client to use
 * @returns {Boolean} returns true on success and false if something went wrong
 */
Layer2dVectorSensorThings.prototype.unsubscribeFromSensorThings = function (datastreamIdsNotToUnsubscribe, subscriptionTopics, version, mqttClient) {
    if (!Array.isArray(datastreamIdsNotToUnsubscribe) || !isObject(subscriptionTopics) || !isObject(mqttClient)) {
        return false;
    }
    const datastreamIdsAssoc = {};

    datastreamIdsNotToUnsubscribe.forEach(datastreamId => {
        datastreamIdsAssoc[datastreamId] = true;
    });

    Object.entries(subscriptionTopics).forEach(([id, isTopicSubscribed]) => {
        if (isTopicSubscribed === true && !Object.prototype.hasOwnProperty.call(datastreamIdsAssoc, id)) {
            mqttClient.unsubscribe("v" + version + "/Datastreams(" + id + ")/Observations");
            if (this.get("observeLocation")) {
                mqttClient.unsubscribe("v" + version + "/Datastreams(" + id + ")/Thing/Locations");
                if (typeof this.get("historicalLocations") === "number" && this.showHistoricalFeatures) {
                    this.resetHistoricalLocations(id);
                }
                const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
                    feature = this.getFeatureByDatastreamId(layerSource.getFeatures(), id);

                if (typeof feature?.set === "function") {
                    feature.set("subscribed", false);
                }
                this.subscribedDataStreamIds[id] = false;
            }
            subscriptionTopics[id] = false;
        }
    });

    return true;
};

/**
 * Subscribes to the mqtt client for the given dataStreamIds.
 * @param {String[]} dataStreamIds an array of dataStreamIds to unsubscribe from
 * @param {Object} subscriptionTopics an object of subscribed ids as keys and true/false als value
 * @param {String} version the STA version to use in topic
 * @param {Object} mqttClient the mqtt client to use
 * @param {Object} mqttSubscribeOptions an object with key rh and qos to subscribe with
 * @returns {Boolean} returns true on success and false if something went wrong
 */
Layer2dVectorSensorThings.prototype.subscribeToSensorThings = async function (dataStreamIds, subscriptionTopics, version, mqttClient, mqttSubscribeOptions = {}) {
    if (!Array.isArray(dataStreamIds) || !isObject(subscriptionTopics) || !isObject(mqttClient)) {
        return false;
    }
    const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
        newSubscriptionTopics = subscriptionTopics;

    for (let i = 0; i < dataStreamIds.length; i++) {
        const id = dataStreamIds[i];

        if (id && !subscriptionTopics[id]) {
            await mqttClient.subscribe("v" + version + "/Datastreams(" + id + ")/Observations", mqttSubscribeOptions);
            if (this.get("observeLocation")) {
                await mqttClient.subscribe("v" + version + "/Datastreams(" + id + ")/Thing/Locations", mqttSubscribeOptions, () => {
                    if (this.get("loadThingsOnlyInCurrentExtent")) {
                        return;
                    }
                    this.fetchHistoricalLocationsByDatastreamId(
                        layerSource.getFeatures(),
                        id,
                        parseInt(this.get("historicalLocations"), 10),
                        this.get("url"),
                        {orderby: "time+desc", expand: "Locations"},
                        this.get("version"),
                        () => {
                            this.locationUpdating[id] = false;
                        }
                    );
                });
            }
            newSubscriptionTopics[id] = true;
            const feature = this.getFeatureByDatastreamId(layerSource.getFeatures(), id);

            if (!isObject(feature)) {
                continue;
            }
            feature.set("subscribed", true, true);
            this.subscribedDataStreamIds[id] = {
                subscribed: true
            };
        }
    }

    return true;
};

/**
 * Updates the datastreams of the given feature with received time and result of the observation.
 * @param {ol/Feature} feature feature to be updated
 * @param {String} dataStreamId the datastream id
 * @param {Object} observation the observation to update the old observation with
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.updateObservationForDatastreams = function (feature, dataStreamId, observation) {
    if (typeof feature?.get !== "function" || !Array.isArray(feature.get("Datastreams"))) {
        return;
    }

    feature.get("Datastreams").forEach(datastream => {
        if (typeof datastream["@iot.id"] !== "undefined" && String(datastream["@iot.id"]) === String(dataStreamId)) {
            datastream.Observations = [observation];
        }
    });
};

/**
* Updates the location of a feature.
* @param {ol/Feature} feature feature to be updated
* @param {Object} observation the observation to update the old coordinates with
* @param {Function} onsuccess function which is called when coordinates updated once
* @returns {void}
*/
Layer2dVectorSensorThings.prototype.updateFeatureLocation = function (feature, observation, onsuccess) {
    if (typeof feature?.getGeometry !== "function" || !Array.isArray(observation?.location?.geometry?.coordinates) || !observation.location.geometry.coordinates.length) {
        return;
    }
    const mapProjection = this.get("crs"),
        coordinates = this.get("epsg") !== mapProjection ? crs.transform(this.get("epsg"), mapProjection, observation.location.geometry.coordinates) : observation.location.geometry.coordinates;

    if (typeof onsuccess === "function") {
        this.locationUpdating[feature.get("dataStreamId")] = true;
        this.eventKeys[feature.get("dataStreamId")] = feature.getGeometry().once("change", () => {
            onsuccess();
        });
    }
    feature.getGeometry().setCoordinates(coordinates);
};

/**
 * Updates feature properties.
 * @param {ol/Feature} feature feature to be updated
 * @param {String} dataStreamId the datastream id
 * @param {String} result the new state
 * @param {String} phenomenonTime the new phenomenonTime
 * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
 * @param {String} noDataValue the value to use for "nodata"
 * @returns {Boolean} true on success, false if something went wrong
 */
Layer2dVectorSensorThings.prototype.updateFeatureProperties = function (feature, dataStreamId, result, phenomenonTime, showNoDataValue, noDataValue) {
    if (
        typeof feature?.get !== "function"
        || typeof feature?.set !== "function"
        || typeof feature.get("dataStreamId") !== "string"
        || typeof feature.get("dataStreamName") !== "string"
    ) {
        return false;
    }
    const dataStreamIdIdx = feature.get("dataStreamId").split(" | ").indexOf(String(dataStreamId)),
        dataStreamNameArray = feature.get("dataStreamName").split(" | "),
        dataStreamName = Object.prototype.hasOwnProperty.call(dataStreamNameArray, dataStreamIdIdx) ? dataStreamNameArray[dataStreamIdIdx] : "",
        preparedResult = result === "" && showNoDataValue ? noDataValue : result;

    feature.set("dataStream_" + dataStreamId + "_" + dataStreamName, preparedResult, true);
    feature.set("dataStream_" + dataStreamId + "_" + dataStreamName + "_phenomenonTime", phenomenonTime, true);
    feature.set("dataStreamValue", this.replaceValueInPipedProperty(feature, "dataStreamValue", dataStreamId, preparedResult));
    feature.set("dataStreamPhenomenonTime", this.replaceValueInPipedProperty(feature, "dataStreamPhenomenonTime", dataStreamId, phenomenonTime));

    if (typeof feature.get("rotation") !== "undefined" && typeof preparedResult !== "undefined") {
        feature.set("rotation", {
            isDegree: true,
            value: preparedResult
        });
    }

    return true;
};

/**
 * Register interaction with map view. Listens to change of scale and call removeHistoricalFeatures,
 * if actual scale is less than configured maxScaleForHistoricalFeatures
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.registerInteractionMapScaleListeners = function () {
    store.watch((state, getters) => getters["Maps/scale"], scale => {
        if (scale > this.get("maxScaleForHistoricalFeatures")) {
            this.showHistoricalFeatures = false;
            this.removeHistoricalFeatures();
            this.lastScale = scale;
            return;
        }
        this.showHistoricalFeatures = true;
        if (scale <= this.get("maxScaleForHistoricalFeatures") && this.lastScale >= this.get("maxScaleForHistoricalFeatures")) {
            this.getHistoricalLocationsOfFeatures();
            this.lastScale = scale;
        }
    });
};

/**
 * Removes the historical Features
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.removeHistoricalFeatures = function () {
    const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
        allFeatures = layerSource.getFeatures(),
        featuresWithHistoricalIds = allFeatures.filter(feature => typeof feature.get("dataStreamId") !== "undefined" && Array.isArray(feature.get("historicalFeatureIds")));

    featuresWithHistoricalIds.forEach(feature => {
        if (typeof feature?.get === "function") {
            feature.get("historicalFeatureIds").forEach(featureId => layerSource.removeFeature(layerSource.getFeatureById(featureId)));
            feature.unset("historicalFeatureIds");
        }
    });
};


/**
 * Replaces a value of a piped property using dataStreamId to locate the right position in the piped property.
 * @param {ol/Feature} feature the feature with properties
 * @param {String} property the property to be updated
 * @param {String} dataStreamId the datastream id
 * @param {String} value the new value
 * @returns {String} the updated property
 */
Layer2dVectorSensorThings.prototype.replaceValueInPipedProperty = function (feature, property, dataStreamId, value) {
    if (
        typeof feature?.get !== "function"
        || typeof feature.get("dataStreamId") !== "string"
        || typeof feature.get(property) !== "string"
        || typeof property !== "string"
        || typeof dataStreamId !== "string"
        || typeof value !== "string"
    ) {
        return "";
    }
    const dataStreamIds = feature.get("dataStreamId").split(" | "),
        dataStreamProperty = feature.get(property).split(" | ");

    this.replaceValueInArrayByReference(dataStreamProperty, dataStreamIds, dataStreamId, value);

    return dataStreamProperty.join(" | ");
};

/**
 * Replaces a value in the given array by the position of an id in an array with referenced ids.
 * @param {String[]} result the result to change the value at the position where reference is found in referenceArray
 * @param {String[]} referenceArray the array to find the position in result to replace the value with
 * @param {String} reference the value to find the position in referenceArray
 * @param {String} value the value to replace the value in result found at position with
 * @returns {Boolean} true if the function ran successfull, false if not
 */
Layer2dVectorSensorThings.prototype.replaceValueInArrayByReference = function (result, referenceArray, reference, value) {
    if (!Array.isArray(result) || !Array.isArray(referenceArray)) {
        return false;
    }
    const len = referenceArray.length;

    for (let i = 0; i < len; i++) {
        if (reference === referenceArray[i]) {
            result[i] = value;
        }
    }
    return true;
};

/**
 * Fetches historical locations and return it to callback function.
 * Only for the current extent to minimize the traffic.
 * @param {String} url The base url.
 * @param {Object} urlParams The url parameter.
 * @param {String} version The version.
 * @param {Function} onsuccess The callback function to return the data.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.fetchHistoricalLocations = function (url, urlParams, version, onsuccess) {
    if (typeof url !== "string" || typeof version !== "string" || !isObject(urlParams)) {
        return;
    }

    const requestUrl = this.buildSensorThingsUrl(url, version, urlParams),
        http = new SensorThingsHttp({
            rootNode: urlParams?.root
        });

    http.getInExtent(requestUrl, {
        extent: store.getters["Maps/extent"],
        sourceProjection: store.getters["Maps/projection"].getCode(),
        targetProjection: this.get("epsg")
    }, true, result => {
        if (typeof onsuccess === "function") {
            onsuccess(result);
        }
    }, null, null, error => {
        console.warn(error);
    });
};

/**
 * Calls the sta api to get historical locations.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.getHistoricalLocationsOfFeatures = function () {
    const allFeatures = (this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource()).getFeatures(),
        featuresWithoutHistoricalIds = allFeatures.filter(feature => typeof feature.get("dataStreamId") !== "undefined" && !Array.isArray(feature.get("historicalFeatureIds"))),
        datastreamIds = this.getDatastreamIdsInCurrentExtent(featuresWithoutHistoricalIds, store.getters["Maps/extent"]),
        url = this.get("url"),
        urlParam = {
            orderby: "time+desc",
            expand: "Locations"
        },
        version = this.get("version"),
        amount = parseInt(this.get("historicalLocations"), 10);

    datastreamIds.forEach(datastreamId => {
        this.fetchHistoricalLocationsByDatastreamId(allFeatures, datastreamId, amount, url, urlParam, version);
    });
};

/**
 * Fetches the historical locations by given datastream id.
 * @param {ol/Feature[]} allFeatures All features on the map
 * @param {Number} datastreamId Datastream id to to fetch for
 * @param {Number} amount The amount of locations to fetch
 * @param {String} url The base url
 * @param {Object} urlParam Url params i.e.: {orderby: "time+desc"}
 * @param {String} version The version
 * @param {Function} onsuccess The function to call on success
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.fetchHistoricalLocationsByDatastreamId = function (allFeatures, datastreamId, amount, url, urlParam, version, onsuccess) {
    if (!Array.isArray(allFeatures) || typeof datastreamId === "undefined" || isNaN(amount) || typeof url !== "string" || !isObject(urlParam) || typeof version !== "string") {
        return;
    }
    const feature = this.getFeatureByDatastreamId(allFeatures, datastreamId);

    urlParam.root = `Datastreams(${datastreamId})/Thing/HistoricalLocations`;
    urlParam.top = amount + 1;
    if (this.subscribedDataStreamIds[datastreamId]?.subscribed && feature.get("historicalFeatureIds")) {
        return;
    }
    this.fetchHistoricalLocations(url, urlParam, version, historicalSensorData => {
        this.resetHistoricalLocations(datastreamId);
        if (this.locationUpdating[datastreamId]) {
            this.parseSensorDataToFeature(feature, historicalSensorData, urlParam, url, version);
            return;
        }
        if (!Array.isArray(historicalSensorData) || !Array.isArray(historicalSensorData[0]?.Locations) || !historicalSensorData[0].Locations.length) {
            return;
        }
        this.updateFeatureLocation(feature, historicalSensorData[0].Locations[0], () => {
            this.parseSensorDataToFeature(feature, historicalSensorData, urlParam, url, version);
            unByKey(this.eventKeys[datastreamId]);
            if (typeof onsuccess === "function") {
                onsuccess();
            }
            this.locationUpdating[feature.get("dataStreamId")] = false;
        });
    });
};

/**
 * Parses the given sensor data to features and adds their ids to the given feature.
 * @param {ol/Feature} feature The feature.
 * @param {Object[]} sensorData The sensor data to create features for.
 * @param {Object} urlParam The url param object.
 * @param {String} url The base url.
 * @param {String} version The version.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.parseSensorDataToFeature = function (feature, sensorData, urlParam, url, version) {
    if (typeof feature?.get !== "function" || Array.isArray(feature.get("historicalFeatureIds"))) {
        return;
    }

    const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
        mapProjection = store.getters["Maps/projection"].getCode(),
        epsg = this.get("epsg"),
        gfiTheme = this.get("gfiTheme"),
        utc = this.get("utc"),
        things = this.getAllThings(sensorData, urlParam, url, version),
        historicalFeatures = this.createFeaturesFromSensorData(things, mapProjection, epsg, gfiTheme, utc, true),
        historicalFeatureIds = [];

    historicalFeatures.shift();
    historicalFeatures.forEach(hFeature => {
        historicalFeatureIds.push(hFeature.getId());
        this.setStyleOfHistoricalFeature(hFeature, hFeature.get("scale"), this.styleRule);
    });
    layerSource.addFeatures(historicalFeatures);
    feature.set("historicalFeatureIds", historicalFeatureIds);
    if (isObject(this.subscribedDataStreamIds[feature.get("dataStreamId")])) {
        Object.assign(this.subscribedDataStreamIds[feature.get("dataStreamId")], {historicalFeatureIds});
    }
};

/**
 * Resets the historical locations of the feature which is found by the given datastream id.
 * @param {Number} datastreamId The datastream id to get the feature for.
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.resetHistoricalLocations = function (datastreamId) {
    const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
        feature = layerSource.getFeatures().filter(layerFeature => typeof layerFeature?.get === "function" && layerFeature.get("dataStreamId") === datastreamId)[0];

    if (typeof feature?.get === "function" && Array.isArray(feature.get("historicalFeatureIds"))) {
        feature.get("historicalFeatureIds").forEach(featureId => layerSource.removeFeature(layerSource.getFeatureById(featureId)));
        feature.unset("historicalFeatureIds");
    }
};

/**
 * Gets the individual scale of the feature according to the index of historical feature and amount of historical features.
 * The first historical fature has a scale 0.8 and the last one has a scale 0.2.
 * @param {Number} index The index of the historical feature
 * @param {Number} amount The amount of the historical features
 * @param {Boolean} scaleStyleByZoom - Flag for the style to be dependent on the zoom level.
 * @param {Number} [zoomLevel=1] - The current zoom level.
 * @param {Number} [zoomLevelCount=1] - The number of zoom levels.
 * @returns {Number} scale
 */
Layer2dVectorSensorThings.prototype.getScale = function (index, amount, scaleStyleByZoom = false, zoomLevel = 1, zoomLevelCount = 1) {
    if (scaleStyleByZoom) {
        return (0.7 - 0.5 * index / amount) * zoomLevel / zoomLevelCount;
    }
    return 0.7 - 0.5 * index / amount;
};
/**
 * Sets the style of historical feature
 * @param {ol/Feature} feature The feature.
 * @param {Number} scale the icon scale in style
 * @param {Object[]} styleRule the style rule of the sta features
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.setStyleOfHistoricalFeature = function (feature, scale, styleRule) {
    if (!Array.isArray(styleRule) || !styleRule.length || !styleRule[0].style) {
        console.error("The style rule has wrong type, must be an array with at least one entry with prop style!", styleRule);
        return;
    }
    feature.setStyle(() => this.getStyleOfHistoricalFeature(styleRule[0].style, scale));
};

/**
 * Parses and gets the style of historical feature.
 * @param {Object} style The style object of current feature.
 * @param {Number} scale the icon scale in style
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.getStyleOfHistoricalFeature = function (style, scale) {
    let circleRadius,
        circleFillColor,
        circleStrokeColor,
        circleStrokeWidth;

    if (style.type === "regularShape") {
        circleRadius = style.rsRadius;
        circleFillColor = style.rsFillColor;
        circleStrokeColor = style.rsStrokeColor;
        circleStrokeWidth = style.rsStrokeWidth;
    }
    else {
        circleRadius = style.circleRadius ? style.circleRadius : 10;
        circleFillColor = style.circleFillColor ? style.circleFillColor : [0, 153, 255, 1];
        circleStrokeColor = style.circleStrokeColor ? style.circleStrokeColor : [0, 0, 0, 1];
        circleStrokeWidth = style.circleStrokeWidth ? style.circleStrokeWidth : 2;
    }

    return new Style({
        image: new CircleStyle({
            radius: circleRadius,
            fill: new Fill({
                color: circleFillColor
            }),
            stroke: new Stroke({
                color: circleStrokeColor,
                width: circleStrokeWidth
            }),
            scale: scale
        })
    });
};

/**
 * Sets the scale of style for historical feature dynamically according to the zoom level
 * @param {ol/Feature[]} features the historical features
 * @param {Number} zoomLevel the current zoom level
 * @param {Number} zoomLevelCount the count of zoom level
 * @param {Boolean} observeLocation if the location is observed
 * @param {Boolean} scaleStyleByZoom if the scale of style is reset by zoom
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.setDynamicalScaleOfHistoricalFeatures = function (features, zoomLevel, zoomLevelCount, observeLocation, scaleStyleByZoom) {
    if (!observeLocation || !scaleStyleByZoom || typeof zoomLevel !== "number" || zoomLevelCount < 1) {
        return;
    }
    features.forEach(feature => {
        if (feature.getStyle()) {
            const style = feature.getStyle()(feature);

            if (typeof style.getImage === "function" && style.getImage() !== null) {
                style.getImage().setScale(feature.get("originScale") * zoomLevel / zoomLevelCount);
                feature.setStyle(() => style);
            }
        }
    });
};

/**
 * Register interaction of resolution in map view.
 * @param {Boolean} scaleStyleByZoom if the scale of style is reset by zoom
 * @returns {void}
 */
Layer2dVectorSensorThings.prototype.registerInteractionMapResolutionListeners = function (scaleStyleByZoom) {
    if (!scaleStyleByZoom) {
        return;
    }
    store.watch((state, getters) => getters["Maps/resolution"], resolution => {
        const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource().getSource() : this.getLayerSource(),
            allFeatures = layerSource.getFeatures(),
            historicalFeatures = allFeatures.filter(feature => typeof feature.get("dataStreamId") === "undefined" && typeof feature.get("originScale") !== "undefined"),
            zoomLevel = mapCollection.getMapView("2D").getZoomForResolution(resolution) + 1,
            zoomLevelCount = mapCollection.getMapView("2D").getResolutions().length;

        this.setDynamicalScaleOfHistoricalFeatures(historicalFeatures, zoomLevel, zoomLevelCount, this.get("observeLocation"), scaleStyleByZoom);
    });
};

