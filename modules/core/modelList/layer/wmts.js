import Layer from "./model";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import TileLayer from "ol/layer/Tile";
import {DEVICE_PIXEL_RATIO} from "ol/has";
import {get as getProjection} from "ol/proj";
import {getWidth} from "ol/extent";

const WMTSLayer = Layer.extend(/** @lends WMTSLayer.prototype */{
    defaults: _.extend({}, Layer.prototype.defaults, {
        infoFormat: "text/xml",
        supported: ["2D", "3D"],
        showSettings: true
    }),

    /**
     * @class WMTSLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String} infoFormat="text/xml Format of provided information."
     * @property {String[]} supported=["2D", "3D"] Supported map modes.
     * @property {Boolean} showSettings=true Flag if settings selectable.
     * @listens Layer#RadioRequestVectorLayerGetFeatures
     */
    initialize: function () {
        this.checkForScale(Radio.request("MapView", "getOptions"));

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }
    },

    /**
     * Creates the LayerSource for this WMTSLayer.
     *
     * @returns {void}
     */
    createLayerSource: function () {
        const projection = getProjection(this.get("coordinateSystem")),
            extent = projection.getExtent(),
            style = this.get("style"),
            format = this.get("format"),
            gutter = this.get("gutter") ? this.get("gutter") : "0",
            wrapX = this.get("wrapX") ? this.get("wrapX") : false,
            urls = this.get("urls"),
            size = getWidth(extent) / parseInt(this.get("tileSize"), 10),
            resLength = parseInt(this.get("resLength"), 10),
            resolutions = new Array(resLength),
            matrixIds = new Array(resLength);

        this.generateArrays(resolutions, matrixIds, resLength, size);

        this.setLayerSource(new WMTS({
            projection: projection,
            attributions: this.get("olAttribution"),
            tileGrid: new WMTSTileGrid({
                origin: this.get("origin"),
                resolutions: resolutions,
                matrixIds: matrixIds
            }),
            tilePixelRatio: DEVICE_PIXEL_RATIO,
            urls: urls,
            matrixSet: this.get("tileMatrixSet"),
            tileSize: this.get("tileSize"),
            gutter: gutter,
            layer: this.get("layer"),
            format: format,
            style: style,
            version: this.get("version"),
            transparent: this.get("transparent").toString(),
            wrapX: wrapX,
            requestEncoding: this.get("requestEncoding")
        }));
    },

    /**
     * Generates resolutions and matrixIds arrays for the WMTS LayerSource.
     *
     * @param {Array} resolutions The resolutions array for the LayerSource.
     * @param {Array} matrixIds The matrixIds array for the LayerSource.
     * @param {Number} length The length of the given arrays.
     * @param {Number} size The tileSize depending on the extent.
     * @returns {void}
     */
    generateArrays: function (resolutions, matrixIds, length, size) {
        for (let i = 0; i < length; ++i) {
            resolutions[i] = size / Math.pow(2, i);
            matrixIds[i] = i;
        }
    },

    /**
     * Creates the WMTSLayer.
     *
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new TileLayer({
            id: this.get("id"),
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            legendURL: this.get("legendURL"),
            routable: this.get("routable"),
            infoFormat: this.get("infoFormat")
        }));
    },

    /**
     * If no legendURL is set an Error is written on the console.
     *
     * @returns {void}
     */
    createLegendURL: function () {
        if (this.get("legendURL") === "" || this.get("legendURL") === undefined) {
            console.error("WMTS: No legendURL is specified for the layer!");
        }
    },

    /**
     * Registers the LayerLoad-Events.
     * These are dispatched to core/map, which then either adds or removes a Loading Layer.
     *
     * @returns {void}
     */
    registerLoadingListeners: function () {
        this.get("layerSource").on("tileloadend", function () {
            this.set("loadingParts", this.get("loadingsParts") - 1);
        });

        this.get("layerSource").on("tileloadstart", function () {
            const tmp = this.get("loadingParts") ? this.get("loadingParts") : 0;

            this.set("loadingParts", tmp + 1);
        });

        this.get("layerSource").on("change:loadingParts", function (val) {
            if (val.oldValue > 0 && this.get("loadingParts") === 0) {
                this.dispatchEvent("wmtsloadend");
                this.unset("loadingParts", {silent: true});
            }
            else if (val.oldValue === undefined && this.get("loadingParts") === 1) {
                this.dispatchEvent("wmtsloadstart");
            }
        });
    },

    /**
     * Reigsters the LayerLoad-Event for Errors.
     *
     * @returns {void}
     */
    registerErrorListener: function () {
        this.registerTileloadError();
    },

    /**
     * If the WMTS-Layer has an extent defined, then this is returned.
     * Else, the extent of the projection is returned.
     *
     * @returns {Array} - The extent of the Layer.
     */
    getExtent: function () {
        const projection = getProjection(this.get("coordinateSystem"));

        if (this.has("extent")) {
            return this.get("extent");
        }

        return projection.getExtent();
    },

    /**
     * Sets the infoFormat to the given Parameter.
     *
     * @param {*} infoFormat - The value for the infoFormat to be set.
     * @returns {void}
     */
    setInfoFormat: function (infoFormat) {
        this.set("infoFormat", infoFormat);
    },

    /**
     * Returns the WMTS-Layer.
     *
     * @returns {Object} - The WMTS-Layer
     */
    getLayer: function () {
        return this.get("layer");
    }
});

export default WMTSLayer;
