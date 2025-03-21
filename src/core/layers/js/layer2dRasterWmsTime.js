import Layer2dRaster from "./layer2dRaster";
import WMSLayer from "./layer2dRasterWms";
import layerCollection from "./layerCollection";
import store from "../../../app-store";
import handleAxiosResponse from "../../../shared/js/utils/handleAxiosResponse";
import detectIso8601Precision from "../../../shared/js/utils/detectIso8601Precision";

import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * Creates a 2d raster layer of type WMSTime.
 * @name Layer2dRasterWmsTime
 * @constructs
 * @extends Layer2dRaster
 * @param {Object} attrs Attributes of the layer.
 * @returns {void}
 */
export default function Layer2dRasterWmsTimeLayer (attrs) {

    const defaults = {
        keyboardMovement: 5,
        time: true
    };

    // call the super-layer
    WMSLayer.call(this, Object.assign(defaults, attrs));
}

// Link prototypes and add prototype methods, means WMSTimeLayer uses all methods and properties of WMSLayer
Layer2dRasterWmsTimeLayer.prototype = Object.create(WMSLayer.prototype);

/**
 * Creates an array with ascending values from min to max separated by resolution.
 * @param {String} min Minimum value.
 * @param {String} max Maximum value.
 * @param {Object} increment Distance between each value inside the array.
 * @returns {Object} Steps and step increments.
 */
Layer2dRasterWmsTimeLayer.prototype.createTimeRange = function (min, max, increment) {
    let start = dayjs.utc(min);
    const increments = Object.entries(increment),
        end = dayjs.utc(max),
        timeRange = [],
        format = detectIso8601Precision(min),
        suffix = min.endsWith("Z") ? "Z" : "";

    while (start.valueOf() <= end.valueOf()) {
        timeRange.push(start.format(format) + suffix);
        /* eslint-disable no-loop-func */
        increments.forEach(([units, difference]) => {
            start = start.add(Number(difference), units);
        });
        /* eslint-enable no-loop-func */
    }
    return timeRange;
};

/**
 * @param {String[]} timeRange valid points in time for WMS-T
 * @param {String?} extentDefault default specified by service
 * @param {String?} configuredDefault default specified by config (preferred usage)
 * @returns {String} default to use
 */
Layer2dRasterWmsTimeLayer.prototype.determineDefault = function (timeRange, extentDefault, configuredDefault) {
    if (configuredDefault && configuredDefault !== "current") {
        if (timeRange.includes(configuredDefault)) {
            return configuredDefault;
        }

        console.error(
            `Configured WMS-T default ${configuredDefault} is not within timeRange:`,
            timeRange,
            "Falling back to WMS-T default value."
        );
    }

    if (configuredDefault === "current" || extentDefault === "current") {
        const now = dayjs(),
            firstGreater = timeRange.find(
                timestamp => dayjs(timestamp).diff(now) >= 0
            );

        return firstGreater || timeRange[timeRange.length - 1];
    }

    return extentDefault || timeRange[0];
};

/**
 * Extracts the values from the time dimensional extent.
 * There are four different cases how the values may be present (as described in the [WMS Specification at Table C.1]{@link http://cite.opengeospatial.org/OGCTestData/wms/1.1.1/spec/wms1.1.1.html#dims.declaring}).
 * They can be determined based on the characters "," and '/'.
 *
 * - CASE 1: Single Value; neither ',' nor '/' are present. The returned Array will have only this value, the step will be 1.
 * - CASE 2: List of multiple values; ',' is present, '/' isn't. The returned array will have exactly these values. The step is dependent on the minimal distances found inside this array.
 * - CASE 3: Interval defined by its lower and upper bounds and its resolution; '/' is present, ',' isn't. The returned Array will cover all values between the lower and upper bounds with a distance of the resolution.
 *         The step is retrieved from the resolution.
 * - Case 4: List of multiple intervals; ',' and '/' are present. For every interval the process described in CASE 3 will be performed.
 *
 * @param {Object} extent Time dimensional extent retrieved from the service.
 * @returns {Object} An object containing the range of possible time values.
 */
Layer2dRasterWmsTimeLayer.prototype.extractExtentValues = function (extent) {
    let step;
    const extentValue = extent.value,
        timeRange = extentValue
            .replaceAll(" ", "")
            .split(",")
            .map(entry => entry.split("/"))
            .map(entry => {
                // CASE 1 & 2
                if (entry.length === 1) {
                    return entry;
                }
                // CASE 3 & 4
                const [min, max, resolution] = entry,
                    increment = this.getIncrementsFromResolution(resolution),
                    singleTimeRange = this.createTimeRange(min, max, increment);

                if (!step || this.incrementIsSmaller(step, increment)) {
                    step = increment;
                }
                return singleTimeRange;
            })
            .flat(1)
            .sort((first, second) => first > second);

    return {
        timeRange: [...new Set(timeRange)], // dedupe
        step
    };
};

/**
 * Finds the Element with the given name inside the given HTMLCollection.
 * @param {HTMLCollection} element HTMLCollection to be found.
 * @param {String} nodeName Name of the Element to be searched for.
 * @returns {HTMLCollection} If found, the HTMLCollection with given name, otherwise undefined.
 */
Layer2dRasterWmsTimeLayer.prototype.findNode = function (element, nodeName) {
    return [...element.children].find(el => el.nodeName === nodeName);
};

/**
 * @param {String} resolution in WMS-T format, e.g. "P1900YT5M"; see specification
 * @returns {Object} map of increments for start date
 */
Layer2dRasterWmsTimeLayer.prototype.getIncrementsFromResolution = function (resolution) {
    const increments = {},
        shorthandsLeft = {
            Y: "year",
            M: "month",
            D: "day"
        },
        shorthandsRight = {
            H: "hour",
            M: "minute",
            S: "second"
        },
        [leftHand, rightHand] = resolution.split("T");

    [...leftHand.matchAll(/(\d+)[^0-9]/g)].forEach(([hit, increment]) => {
        increments[shorthandsLeft[hit.slice(-1)]] = increment;
    });

    if (rightHand) {
        [...rightHand.matchAll(/(\d+)[^0-9]/g)].forEach(([hit, increment]) => {
            increments[shorthandsRight[hit.slice(-1)]] = increment;
        });
    }
    return increments;
};

/**
 * Gets raw level attributes from parent extended by an attribute TIME.
 * @param {Object} attrs Params of the raw layer.
 * @returns {Object} The raw layer attributes with TIME.
 */
Layer2dRasterWmsTimeLayer.prototype.getRawLayerAttributes = function (attrs) {
    return Object.assign({TIME: this.prepareTime(attrs)}, WMSLayer.prototype.getRawLayerAttributes.call(this, attrs));
};

/**
 * Compares WMS-T resolution increments.
 * @param {Object} step increment to compare to
 * @param {Object} increment increment to consider
 * @returns {Boolean} whether increment is smaller
 */
Layer2dRasterWmsTimeLayer.prototype.incrementIsSmaller = function (step, increment) {
    const compareStrings = [step, increment].map(
        ({years, months, days, minutes, hours, seconds}) => "P" +
            (years || "").padStart(4, "0") + "Y" +
            (months || "").padStart(2, "0") + "M" +
            (days || "").padStart(2, "0") + "D" +
            "T" +
            (minutes || "").padStart(2, "0") + "H" +
            (hours || "").padStart(2, "0") + "M" +
            (seconds || "").padStart(2, "0") + "S"
    );

    return compareStrings[0] > compareStrings[1];
};

/**
 * Creates the capabilities url.
 * @param {String} wmsTimeUrl The url of wms time.
 * @param {String} version The version of wms time.
 * @param {String} layers The layers of wms time.
 * @returns {String} the created url
 */
Layer2dRasterWmsTimeLayer.prototype.createCapabilitiesUrl = function (wmsTimeUrl, version, layers) {
    const url = new URL(wmsTimeUrl);

    url.searchParams.set("service", "WMS");
    url.searchParams.set("version", version);
    url.searchParams.set("layers", layers);
    url.searchParams.set("request", "GetCapabilities");
    return url;
};

/**
 * Requests the GetCapabilities document and parses the result.
 * @param {String} url The url of wms time.
 * @param {String} version The version of wms time.
 * @param {String} layers The layers of wms time.
 * @returns {Promise} A promise which will resolve the parsed GetCapabilities object.
 */
Layer2dRasterWmsTimeLayer.prototype.requestCapabilities = function (url, version, layers) {
    return axios.get(this.createCapabilitiesUrl(url, version, layers))
        .then(response => handleAxiosResponse(response, "WMS, createLayerSource, requestCapabilities"));
};

/**
 * Retrieves the attributes from the given HTMLCollection and adds the key value pairs to an object.
 * Also retrieves its value.
 * @param {HTMLCollection} node The Collection of values for the time node.
 * @returns {Object} An Object containing the attributes of the time node as well as its value.
 */
Layer2dRasterWmsTimeLayer.prototype.retrieveAttributeValues = function (node) {
    return [...node.attributes]
        .reduce((acc, att) => ({...acc, [att.name]: att.value}), {value: node.innerHTML});
};

/**
 * Prepares the parameters for the WMS-T.
 * This includes creating the range of possible time values, the minimum step between these as well as the initial value set.
 * @param {Object} attrs Attributes of the layer.
 * @throws {Error} Will throw an Error if the given layer is not a valid time layer.
 * @returns {Promise<number>} If the functions resolves, the initial value for the time dimension is returned.
 */
Layer2dRasterWmsTimeLayer.prototype.prepareTime = function (attrs) {
    const time = typeof attrs.time === "object" ? attrs.time : {};

    if (!time.dimensionName) {
        time.dimensionName = "time";
    }

    if (!time.extentName) {
        time.extentName = "time";
    }

    // @deprecated
    if (typeof time.default === "number") {
        console.warn(
            `WMS-T has '"default": ${time.default}' configured as number.
            Using number is deprecated, this field is now a string.
            Please use '"default": "${time.default}"' instead.`
        );
        time.default = String(time.default);
    }

    return this.requestCapabilities(attrs.url, attrs.version, attrs.layers)
        .then(xmlCapabilities => {
            const {dimension, extent} = this.retrieveTimeData(xmlCapabilities, attrs.layers, time);

            if (!dimension || !extent) {
                throw Error(i18next.t("common:modules.core.modelList.layer.wms.invalidTimeLayer", {id: this.id}));
            }
            else if (dimension.units !== "ISO8601") {
                throw Error(`WMS-T layer ${this.id} specifies time dimension in unit ${dimension.units}. Only ISO8601 is supported.`);
            }
            else {
                const {step, timeRange} = this.extractExtentValues(extent),
                    defaultValue = this.determineDefault(timeRange, extent.default, time.default),
                    timeData = {defaultValue, step, timeRange};

                attrs.time = {...time, ...timeData};
                timeData.layerId = attrs.id;
                store.commit("Modules/WmsTime/addTimeSliderObject", {keyboardMovement: attrs.keyboardMovement, ...timeData});

                return defaultValue;
            }
        })
        .catch(error => {
            this.removeLayer(attrs.id);
            // remove layer from project completely
            layerCollection.removeLayerById(attrs.id);

            console.error(i18next.t("common:modules.core.modelList.layer.wms.errorTimeLayer", {error, id: attrs.id}));
        });
};

/**
 * If two WMS-T are shown: Remove the layerSwiper; depending if the original layer was closed, update the layer with a new time value.
 * @param {String} layerId The layer id.
 * @returns {void}
 */
Layer2dRasterWmsTimeLayer.prototype.removeLayer = function (layerId) {
    // If the swiper is active, two WMS-T are currently active
    if (store.getters["Modules/WmsTime/layerSwiper"].active) {
        if (!layerId.endsWith(store.getters["Modules/WmsTime/layerAppendix"])) {
            this.setIsSelected(true);
        }
        store.dispatch("Modules/WmsTime/toggleSwiper", layerId);
    }
    else {
        store.commit("Modules/WmsTime/setTimeSliderActive", {active: false, currentLayerId: ""});
    }
};

/**
 * Retrieves wmsTime-related entries from GetCapabilities layer specification.
 * @param {String} xmlCapabilities GetCapabilities XML response
 * @param {String} layerName name of layer to use
 * @param {Object} timeSpecification may contain "dimensionName" and "extentName"
 * @returns {Object} dimension and extent of layer
 */
Layer2dRasterWmsTimeLayer.prototype.retrieveTimeData = function (xmlCapabilities, layerName, timeSpecification) {
    const {dimensionName, extentName} = timeSpecification,
        xmlDocument = new DOMParser().parseFromString(xmlCapabilities, "text/xml"),
        layerNode = [
            ...xmlDocument.querySelectorAll("Layer > Name")
        ].filter(node => node.textContent === layerName)[0].parentNode,
        xmlDimension = layerNode.querySelector(`Dimension[name="${dimensionName}"]`),
        xmlExtent = layerNode.querySelector(`Extent[name="${extentName}"]`),
        dimension = xmlDimension ? this.retrieveAttributeValues(xmlDimension) : null,
        extent = xmlExtent ? this.retrieveAttributeValues(xmlExtent) : null;

    return {dimension, extent};
};

/**
 * Setter for isVisibleInMap and setter for layer.setVisible
 * @param {Boolean} newValue Flag if layer is visible in map
 * @returns {void}
 */
Layer2dRasterWmsTimeLayer.prototype.setIsVisibleInMap = function (newValue) {
    store.commit("Modules/WmsTime/setVisibility", newValue);
    Layer2dRaster.prototype.setIsVisibleInMap.call(this, newValue);
};

/**
 * Updates the time parameter of the WMS-T if the id of the layer is correct.
 * @param {String} id Unique Id of the layer to update.
 * @param {String} newValue New TIME value of the WMS-T.
 * @returns {void}
 */
Layer2dRasterWmsTimeLayer.prototype.updateTime = function (id, newValue) {
    if (id === this.get("id")) {
        this.getLayerSource().updateParams({"TIME": newValue});
    }
};
