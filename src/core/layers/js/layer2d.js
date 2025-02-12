import Cluster from "ol/source/Cluster";
import axios from "axios";

import store from "../../../app-store";
import Layer from "./layer";
import {boundingExtent} from "ol/extent";
import crs from "@masterportal/masterportalapi/src/crs";
import handleAxiosResponse from "../../../shared/js/utils/handleAxiosResponse";

/**
 * Creates a 2d layer.
 * @name Layer2d
 * @abstract
 * @constructs
 * @extends Layer
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2d (attributes) {
    const defaultAttributes = {
        transparency: 0
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer.call(this, this.attributes);

    this.setLayerSource(this.getLayer()?.getSource());
    this.controlAutoRefresh(attributes);
    this.addErrorListener(this.getLayerSource());
}

Layer2d.prototype = Object.create(Layer.prototype);

/**
 * Controls the automatic refresh of the layer source.
 * @param {Object} attributes The attributes of the layer configuration
 * @returns {void}
 */
Layer2d.prototype.controlAutoRefresh = function (attributes) {
    const autoRefresh = attributes?.autoRefresh;

    if (typeof autoRefresh === "number" || typeof autoRefresh === "string") {
        if (attributes.visibility && typeof this.getIntervalAutoRefresh() === "undefined") {
            this.startAutoRefresh(parseInt(autoRefresh, 10));
        }
        else if (!attributes.visibility) {
            this.stopAutoRefresh();
        }
    }
};

/**
 * Creates and starts an interval to refresh the layer.
 * @param {Number} autoRefresh The interval in milliseconds.
 * @returns {void}
 */
Layer2d.prototype.startAutoRefresh = function (autoRefresh) {
    this.setIntervalAutoRefresh(setInterval(() => {
        const layerSource = this.getLayerSource() instanceof Cluster ? this.getLayerSource()?.getSource() : this.getLayerSource();

        layerSource?.refresh();
    }, autoRefresh));
};

/**
 * Clears running auto refresh interval.
 * @returns {void}
 */
Layer2d.prototype.stopAutoRefresh = function () {
    clearInterval(this.getIntervalAutoRefresh());
    this.setIntervalAutoRefresh(undefined);
};

/**
 * Sets values to the ol layer.
 * @param {Object} attributes The new attributes.
 * @returns {void}
 */
Layer2d.prototype.updateLayerValues = function (attributes) {
    this.getLayer()?.setOpacity((100 - attributes.transparency) / 100);
    this.getLayer()?.setVisible(attributes.visibility);
    this.getLayer()?.setZIndex(attributes.zIndex);
    this.controlAutoRefresh(attributes);

    if (attributes.fitCapabilitiesExtent && attributes.visibility && !attributes.encompassingBoundingBox) {
        if (!attributes.capabilitiesUrl) {
            console.warn("Please add a capabilitiesUrl for your layer configuration if you want to use fitCapabilitiesExtent!");

        }
        else {
            this.requestCapabilitiesToFitExtent();
            attributes.encompassingBoundingBox = true;
        }
    }
    else if (attributes.fitCapabilitiesExtent && !attributes.visibility && attributes.encompassingBoundingBox) {
        attributes.encompassingBoundingBox = false;
    }
};

/**
 * Getter for interval auto refresh.
 * @returns {Number} The interval auto refresh.
 */
Layer2d.prototype.getIntervalAutoRefresh = function () {
    return this.intervalAutoRefresh;
};

/**
 * Getter for ol layer source.
 * @returns {ol/source/Source~Source} The ol layer source.
 */
Layer2d.prototype.getLayerSource = function () {
    return this.layerSource;
};

/**
 * Setter for interval auto refresh.
 * @param {Number} value The interval auto refresh.
 * @returns {void}
 */
Layer2d.prototype.setIntervalAutoRefresh = function (value) {
    this.intervalAutoRefresh = value;
};

/**
 * Setter for ol layer source.
 * @param {ol/source/Source~Source} value The ol layer source.
 * @returns {void}
 */
Layer2d.prototype.setLayerSource = function (value) {
    this.layerSource = value;
};

/**
 * Prepares the given features and sets or/and overwrites the coordinates based on the configuration of "altitude" and "altitudeOffset".
 * @param {ol/Feature[]} features The olFeatures.
 * @returns {void}
 */
Layer.prototype.prepareFeaturesFor3D = function (features = []) {
    features.forEach(feature => {
        let geometry = feature.getGeometry();

        if (geometry.getType() === "GeometryCollection") {
            geometry.getGeometries().forEach(geom => this.setAltitudeOnGeometry(geom)
            );
        }
        else {
            geometry = this.setAltitudeOnGeometry(geometry);
        }
        feature.setGeometry(geometry);
    });
};

/**
 * Sets the altitude and AltitudeOffset as z coordinate.
 * @param {ol/geom} geometry Geometry of feature.
 * @returns {ol/geom} - The geometry with newly set coordinates.
 */
Layer.prototype.setAltitudeOnGeometry = function (geometry) {
    const type = geometry.getType(),
        coords = geometry.getCoordinates();

    if (type === "Point") {
        geometry.setCoordinates(this.getPointCoordinatesWithAltitude(coords));
    }
    else if (type === "MultiPoint") {
        geometry.setCoordinates(this.getMultiPointCoordinatesWithAltitude(coords));
    }
    else {
        console.warn("Type: " + type + " is not supported yet for function \"setAltitudeOnGeometry\"!");
    }
    return geometry;
};

/**
 * Sets the altitude on multipoint coordinates.
 * @param {Number[]} coords Coordinates.
 * @returns {Number[]} - newly set cooordinates.
 */
Layer.prototype.getMultiPointCoordinatesWithAltitude = function (coords) {
    return coords.map(coord => this.getPointCoordinatesWithAltitude(coord));
};

/**
 * Sets the altitude on point coordinates.
 * @param {Number[]} coord Coordinates.
 * @returns {Number[]} - newly set cooordinates.
 */
Layer.prototype.getPointCoordinatesWithAltitude = function (coord) {
    const altitude = this.get("altitude"),
        altitudeOffset = this.get("altitudeOffset");

    if (typeof altitude === "number") {
        if (coord.length === 2) {
            coord.push(parseFloat(altitude));
        }
        else if (coord.length === 3) {
            coord[2] = parseFloat(altitude);
        }
    }
    if (typeof altitudeOffset === "number") {
        if (coord.length === 2) {
            coord.push(parseFloat(altitudeOffset));
        }
        else if (coord.length === 3) {
            coord[2] = coord[2] + parseFloat(altitudeOffset);
        }
    }
    return coord;
};

/**
 * Adds listener on 'featuresloaderror', 'tileloaderror' and 'imageloaderror' at layer source.
 * @param {ol/source/Source~Source} layerSource The ol layer source.
 * @returns {void}
 */
Layer2d.prototype.addErrorListener = function (layerSource) {
    layerSource?.on("featuresloaderror", async function () {
        const url = this.attributes.url
        + "&service="
        + this.attributes.typ
        + "&version="
        + this.attributes.version
        + "&request=describeFeatureType";

        await this.errorHandling(await axios.get(url, {withCredentials: true})
            .catch(function (error) {
                return error.toJSON().status;
            }), this.get("name"));
    }.bind(this));
    layerSource?.on("tileloaderror", async function (evt) {
        const url = evt.tile.src_ ? evt.tile.src_ : evt.tile.url_;

        if (url) {
            await this.errorHandling(await axios.get(url, {withCredentials: true})
                .catch(function (error) {
                    return error.toJSON().status;
                }), this.get("name"));
        }
    }.bind(this));
    layerSource?.on("imageloaderror", async function (evt) {
        await this.errorHandling(await axios.get(evt.image.src_, {withCredentials: true})
            .catch(function (error) {
                return typeof error.toJSON === "function" ? error.toJSON().status : 0;
            }), this.get("name"));
    }.bind(this));
};

/**
 * Error handling for secure services when error 403 is thrown .
 * @param {Number} errorCode Error Number of the request
 * @param {String} layerName Name of the layer
 * @returns {void}
 */
Layer2d.prototype.errorHandling = function (errorCode, layerName) {
    let linkMetadata = "",
        alertingContent = "";

    if (this.get("datasets") && this.get("datasets")[0]) {
        linkMetadata = i18next.t("common:core.layers.errorHandling.LinkMetadata",
            {linkMetadata: this.get("datasets")[0].show_doc_url + this.get("datasets")[0].md_id
            });
    }
    if (errorCode === 403) {
        alertingContent = i18next.t("common:core.layers.errorHandling.403",
            {
                layerName: layerName
            })
            + linkMetadata;

        store.dispatch("Alerting/addSingleAlert", {content: alertingContent, multipleAlert: true});
    }
    store.watch((state, getters) => getters["Alerting/showTheModal"], showTheModal => {
        store.dispatch("replaceByIdInLayerConfig", {
            layerConfigs: [{
                id: this.attributes.id,
                layer: {
                    id: this.attributes.id,
                    visibility: showTheModal,
                    showInLayerTree: false
                }
            }]
        }, {root: true});
    });
};


/**
 * Extracts the bounding box from a layer node based on specified extent attributes.
 * @param {Element} layerNode - The layer node from the GetCapabilities response.
 * @returns {Array<Array<number>> | null} - An array representing the transformed bounding box, or null if not found.
 */
Layer2d.prototype.extractBoundingBox = function (layerNode) {
    const isWMS = this.get("typ") === "WMS",
        extentAttribute = isWMS ? "EX_GeographicBoundingBox" : "WGS84BoundingBox",
        boundingBoxNodes = isWMS ? layerNode.querySelectorAll("BoundingBox[CRS=\"EPSG:4326\"]") : [layerNode.querySelector(extentAttribute)],
        map = mapCollection.getMap("2D"),
        mapView = map.getView(),
        targetProjection = mapView.getProjection().getCode(),
        sourceProjection = "EPSG:4326";

    for (const boundingBoxNode of boundingBoxNodes) {
        if (boundingBoxNode) {
            let lowerCorner, upperCorner;

            if (!isWMS) {
                const trimmedText = boundingBoxNode.textContent.trim(),
                    coordinatesArray = trimmedText.split(/\s+/);

                lowerCorner = coordinatesArray.slice(0, 2).map(parseFloat);
                upperCorner = coordinatesArray.slice(2, 4).map(parseFloat);
            }
            else {
                lowerCorner = [parseFloat(boundingBoxNode.getAttribute("miny")), parseFloat(boundingBoxNode.getAttribute("minx"))];
                upperCorner = [parseFloat(boundingBoxNode.getAttribute("maxy")), parseFloat(boundingBoxNode.getAttribute("maxx"))];
            }
            const transformedLowerCorner = crs.transform(sourceProjection, targetProjection, lowerCorner),
                transformedUpperCorner = crs.transform(sourceProjection, targetProjection, upperCorner);

            this.set("boundingBox", [transformedLowerCorner, transformedUpperCorner]);
            return [transformedLowerCorner, transformedUpperCorner];
        }
    }
    return null;
};

/**
 * Requests the GetCapabilities document and parses the result.
 * @returns {Promise} A promise that resolves with the parsed GetCapabilities object or rejects with an error.
 */
Layer2d.prototype.requestCapabilitiesToFitExtent = async function () {
    const capabilitiesUrl = this.get("capabilitiesUrl"),
        layerType = this.get("typ"),
        nameProperty = layerType === "WFS" ? "Title" : "Name",
        layerIdentification = layerType === "WFS" ? "FeatureType" : "Layer",
        specificLayer = layerType === "WFS" ? this.get("featureType") : this.get("layers");

    await axios.get(capabilitiesUrl)
        .then((response) => handleAxiosResponse(response))
        .then((xmlCapabilities) => new DOMParser().parseFromString(xmlCapabilities, "text/xml"))
        .then((xmlDocument) => xmlDocument.querySelectorAll(layerIdentification))
        .then((layerNodes) => layerNodes.forEach(layerNode => {
            const layerNameNode = layerNode.querySelector(nameProperty);

            if (layerNameNode && layerNameNode.textContent.includes(specificLayer)) {
                this.zoomToLayerExtent(layerNode);
            }
        }))
        .catch((error) => {
            console.error("Request failed:", error);
        });
};

/**
 * Zooms the map to the extent of a given layer node. This function extracts the bounding box
 * from the specified layer node and then adjusts the map's view to encompass this bounding box.
 * @param {Element} layerNode - The XML node representing a layer from the GetCapabilities response.
 * @returns {void}
 */
Layer2d.prototype.zoomToLayerExtent = function (layerNode) {
    const boundingBox = this.extractBoundingBox(layerNode),
        extent = boundingBox ? boundingExtent(boundingBox) : null,
        map = mapCollection.getMap("2D"),
        view = map.getView(),
        zoom = extent ? view.getZoomForResolution(view.getResolutionForExtent(extent, map.getSize())) : null;

    if (!boundingBox) {
        return;
    }
    store.dispatch("Maps/zoomToExtent", {extent: extent, options: {maxZoom: zoom}}, {root: true});
};
