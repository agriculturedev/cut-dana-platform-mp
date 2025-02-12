<script>
import {mapGetters, mapActions} from "vuex";
import {WMSCapabilities} from "ol/format.js";
import {intersects} from "ol/extent";
import crs from "@masterportal/masterportalapi/src/crs";
import axios from "axios";
import {treeSubjectsKey} from "../../../shared/js/utils/constants";

/**
 * Adds WMS
 * @module modules/AddWMS
 * @vue-data {Number} uniqueId - Current unique id.
 * @vue-data {Boolean} invalidUrl - Shows if Url is invalid.
 * @vue-data {String} wmsUrl - Current wms url.
 * @vue-data {String} version - Current version.
 */
export default {
    name: "AddWMS",
    data () {
        return {
            uniqueId: 100,
            invalidUrl: false,
            wmsUrl: "",
            version: ""
        };
    },
    computed: {
        ...mapGetters(["mapViewSettings"]),
        ...mapGetters("Maps", ["projection", "mode"])
    },
    mounted () {
        this.setFocusToFirstControl();
    },
    methods: {
        ...mapActions(["addLayerToLayerConfig"]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs.wmsUrl) {
                    this.$refs.wmsUrl.focus();
                }
            });
        },
        /**
         * Send via Enter key.
         * @param {Event} event - Key event.
         * @returns {void}
         */
        keydown: function (event) {
            const code = event.keyCode;

            if (code === 13) {
                this.importLayers();
            }
        },

        /**
         * Creates the url with the given params and checks if it is valid
         * @param {String} serviceUrl inserted url by user
         * @returns {String} the url.href
        */
        getUrl: function (serviceUrl) {
            let url;

            this.invalidUrl = false;
            try {
                url = new URL(serviceUrl);
            }
            catch (e) {
                this.invalidUrl = true;
                this.displayErrorMessage();
            }
            if (url.href.includes("http:")) {
                this.addSingleAlert({
                    content: this.$t("common:modules.addWMS.errorHttpsMessage"),
                    category: "error",
                    title: this.$t("common:modules.addWMS.errorTitle")});
            }
            else {
                url.searchParams.set("request", "GetCapabilities");
                url.searchParams.set("service", "WMS");
            }
            return url.href;
        },
        /**
         * Importing the external wms layers
         * @returns {void}
         */
        importLayers: function () {
            const serviceUrl = this.$el.querySelector("#wmsUrl").value.trim(),
                url = this.getUrl(serviceUrl);

            if (this.invalidUrl === true || url.includes("http:") || url.length === 0) {
                return;
            }

            axios({
                timeout: 4000,
                url: url
            })
                .then(response => response.data)
                .then((data) => {
                    try {
                        const parser = new WMSCapabilities(),
                            capability = parser.read(data),
                            version = capability?.version,
                            checkVersion = this.isVersionEnabled(version),
                            currentExtent = this.mapViewSettings?.extent;
                        let checkExtent = this.getIfInExtent(capability, currentExtent),
                            finalCapability = capability;

                        if (!checkVersion) {
                            const reversedData = this.getReversedData(data);

                            finalCapability = parser.read(reversedData);
                            checkExtent = this.getIfInExtent(finalCapability, currentExtent);
                        }

                        if (!checkExtent) {
                            this.addSingleAlert({
                                content: this.$t("common:modules.addWMS.ifInExtent"),
                                category: "error",
                                title: this.$t("common:modules.addWMS.errorTitle")
                            });
                            return;
                        }

                        this.version = version;
                        this.wmsUrl = url;

                        finalCapability.Capability.Layer.Layer.forEach(layer => {
                            this.parseLayer(layer, 1);
                        });
                    }
                    catch (e) {
                        this.displayErrorMessage();
                    }
                }, () => {
                    this.displayErrorMessage();
                });
        },

        /**
         * Send via Enter key.
         * @param {Event} e - Key event.
         * @returns {void}
         */
        inputUrl: function (e) {
            const code = e.keyCode;

            this.invalidUrl = false;
            if (code === 13) {
                this.importLayers();
            }
        },

        /**
         * Display error message for wms which have misspelling or no CORS-Header.
         * @returns {void}
         */
        displayErrorMessage: function () {
            this.addSingleAlert({
                content: this.$t("common:modules.addWMS.errorMessage"),
                category: "error",
                title: this.$t("common:modules.addWMS.errorTitle")
            });
        },

        /**
         * Creates a new layer and adds it to layerConfigs.
         * @info recursive function
         * @param {Object} object the layer object to add
         * @param {Number} level the depth of the recursion
         * @return {void}
         */
        parseLayer: function (object, level) {
            if (Object.prototype.hasOwnProperty.call(object, "Layer")) {
                object.Layer.forEach(layer => {
                    this.parseLayer(layer, level + 1);
                });
            }
            else {
                const datasets = [];
                let layerObject = {};

                if (object?.MetadataURL?.[0].OnlineResource) {
                    datasets.push({
                        customMetadata: true,
                        csw_url: object.MetadataURL[0].OnlineResource,
                        attributes: {}
                    });
                }
                layerObject = {
                    id: this.getParsedTitle(object.Title),
                    name: object.Title,
                    typ: "WMS",
                    layers: [object.Name],
                    url: this.wmsUrl,
                    version: this.version,
                    visibility: true,
                    type: "layer",
                    showInLayerTree: true,
                    maxScale: object?.MaxScaleDenominator?.toString(),
                    minScale: object?.MinScaleDenominator?.toString(),
                    legendURL: object?.Style?.[0].LegendURL?.[0].OnlineResource?.toString(),
                    datasets
                };

                this.addLayerToLayerConfig({layerConfig: layerObject, parentKey: treeSubjectsKey}).then((addedLayer) => {
                    if (addedLayer) {
                        this.addSingleAlert({
                            content: this.$t("common:modules.addWMS.completeMessage"),
                            category: "success",
                            title: this.$t("common:modules.addWMS.alertTitleSuccess")});
                        this.$refs.wmsUrl.value = "";
                    }
                    else {
                        this.addSingleAlert({
                            content: this.$t("common:modules.addWMS.alreadyAdded"),
                            category: "warning",
                            title: this.$t("common:modules.addWMS.errorTitle")});
                        this.$refs.wmsUrl.value = "";
                    }
                });

            }
        },

        /**
         * Getter if the version is enabled and above 1.3.0
         * @param {String} version the version of current external wms layer
         * @returns {Boolean} true or false
         */
        isVersionEnabled: function (version) {
            if (typeof version !== "string") {
                return false;
            }

            const parsedVersion = version.split(".");

            if (parseInt(parsedVersion[0], 10) < 1) {
                return false;
            }
            else if (parsedVersion.length >= 2 && parseInt(parsedVersion[0], 10) === 1 && parseInt(parsedVersion[1], 10) < 3) {
                return false;
            }

            return true;
        },

        /**
         * Getter if the imported wms layer in the extent of current map
         * @param {Object} capability the response of the imported wms layer in parsed format
         * @param {Number[]} currentExtent the extent of current map view
         * @returns {Boolean} true or false
         */
        getIfInExtent: function (capability, currentExtent) {
            const layer = capability?.Capability?.Layer?.BoundingBox?.filter(bbox => {
                    return bbox?.crs && bbox?.crs.includes("EPSG") && crs.getProjection(bbox?.crs) !== undefined && Array.isArray(bbox?.extent) && bbox?.extent.length === 4;
                }),
                layerEPSG4326Projection = layer.find((element) => element.crs === "EPSG:4326");
            let layerExtent;

            // If there is no extent defined or the extent is not right defined, it will import the external wms layer(s).
            if (!Array.isArray(currentExtent) || currentExtent.length !== 4) {
                return true;
            }

            if (Array.isArray(layer) && layer.length) {
                let firstLayerExtent = [],
                    secondLayerExtent = [];

                layer.forEach(singleLayer => {
                    if (singleLayer.crs === this.projection.getCode()) {
                        firstLayerExtent = [singleLayer.extent[0], singleLayer.extent[1]];
                        secondLayerExtent = [singleLayer.extent[2], singleLayer.extent[3]];
                    }
                });

                if (layerEPSG4326Projection && !firstLayerExtent.length && !secondLayerExtent.length) {
                    firstLayerExtent = crs.transform(layer[0].crs, this.projection.getCode(), [layerEPSG4326Projection.extent[1], layerEPSG4326Projection.extent[0]]);
                    secondLayerExtent = crs.transform(layer[0].crs, this.projection.getCode(), [layerEPSG4326Projection.extent[3], layerEPSG4326Projection.extent[2]]);
                }
                else if (!firstLayerExtent.length && !secondLayerExtent.length) {
                    firstLayerExtent = crs.transform(layer[0].crs, this.projection.getCode(), [layer[0].extent[0], layer[0].extent[1]]);
                    secondLayerExtent = crs.transform(layer[0].crs, this.projection.getCode(), [layer[0].extent[2], layer[0].extent[3]]);
                }

                layerExtent = [firstLayerExtent[0], firstLayerExtent[1], secondLayerExtent[0], secondLayerExtent[1]];

                return intersects(currentExtent, layerExtent);
            }

            return true;
        },

        /**
         * Getter for reversed data of old wms version
         * @param {Object} data the response of the imported wms layer
         * @returns {xml} reversedData - The reversed data of the response of the imported wms layer
         */
        getReversedData: function (data) {
            let reversedData = new XMLSerializer().serializeToString(data);

            reversedData = reversedData.replace(/<SRS>/g, "<CRS>").replace(/<\/SRS>/g, "</CRS>").replace(/SRS=/g, "CRS=");
            reversedData = new DOMParser().parseFromString(reversedData, "text/xml");

            return reversedData;
        },

        /**
         * Getter for parsed title without space and slash
         * It will be used as id later in template
         * @param {String} title - the title of current layer
         * @returns {String} parsedTitle - The parsed title
         */
        getParsedTitle: function (title) {
            return String(title).replace(/\s+/g, "-").replace(/\//g, "-").replace(/[():]/g, "-");
        }
    }
};
</script>

<template>
    <div
        id="addWMS"
        class="row"
    >
        <div>
            <input
                id="wmsUrl"
                ref="wmsUrl"
                aria-label="WMS-Url"
                type="text"
                class="form-control wmsUrlsChanged"
                :placeholder="$t('common:modules.addWMS.placeholder')"
                @keydown.enter="inputUrl"
            >
            <button
                id="addWMSButton"
                type="button"
                class="btn btn-primary"
                @click="importLayers"
            >
                <span
                    class=""
                    aria-hidden="true"
                >{{ $t('common:modules.addWMS.textLoadLayer') }}</span>
                <span
                    class="bootstrap-icon"
                    aria-hidden="true"
                >
                    <i class="bi-check-lg" />
                </span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    .WMS_example_text {
        margin-top: 10px;
        color: $light_grey;
    }
    #addWMSButton {
        margin-top: 15px;
        width: 50%;
    }
    .addwms_error {
        font-size: $font-size-lg;
        color: $light_red;
        margin-bottom: 10px;
    }
</style>
