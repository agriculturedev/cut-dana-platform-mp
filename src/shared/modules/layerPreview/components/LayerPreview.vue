<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import {buffer} from "ol/extent";
import {wms, wmts} from "@masterportal/masterportalapi";
import WMTS, {optionsFromCapabilities} from "ol/source/WMTS";
import proj4 from "proj4";
import {Point} from "ol/geom";
import {Tooltip} from "bootstrap";
import axios from "axios";

export default {
    name: "LayerPreview",
    props: {
        /** id of the layer to create a preview for */
        layerId: {
            type: String,
            required: true
        },
        /** center coordinates for the preview */
        center: {
            type: [Array, String],
            default: null
        },
        /** zoomLevel for the preview */
        zoomLevel: {
            type: Number,
            default: null
        },
        /** radius of the extent, default is 1000 metres */
        radius: {
            type: Number,
            default: 1000
        },
        /** if true, preview is checkable */
        checkable: {
            type: Boolean,
            default: false
        },
        /** if true, preview is checked */
        checked: {
            type: Boolean,
            default: false
        },
        /** custom css-class to overwrite style, NOTICE: maybe '!important' must be used */
        customClass: {
            type: String,
            default: ""
        },
        /** If true, preview is highlighted by a thick border if layer is currently visible. */
        currentlyVisible: {
            type: Boolean,
            default: false
        }
    },
    emits: ["previewClicked"],
    data () {
        return {
            supportedLayerTyps: ["WMS", "WMTS", "VectorTile", "GROUP"],
            // if smaller some WMS layers load no content in image, e.g. Geobasiskarten (Schriftplatte), handle size by css
            width: 150,
            height: 150,
            layerName: null
        };
    },
    computed: {
        ...mapGetters(["isMobile", "layerConfigById"]),
        ...mapGetters("Maps", ["initialCenter", "initialZoom"]),
        ...mapGetters("Modules/LayerPreview", ["previewCenter", "previewZoomLevel", "previewUrlByLayerIds"])

    },
    watch: {
        layerId () {
            this.generatePreviewUrlByConfigType();
        }
    },
    mounted () {
        this.generatePreviewUrlByConfigType();
    },
    methods: {
        ...mapActions("Modules/LayerPreview", [
            "initialize"
        ]),
        ...mapMutations("Modules/LayerPreview", [
            "addPreviewUrl"
        ]),

        /**
         * Calculates the extent by zoomlevel/resolution, center and radius from props.
         * @returns {ol.extent.buffer} the extent
         */
        calculateExtent () {
            const resolution = mapCollection.getMapView("2D").getResolutions()[this.previewZoomLevel(this.layerId)],
                radius = typeof this.radius === "number" ? this.radius : 1000;

            return buffer(
                new Point(this.previewCenter(this.layerId)).getExtent(),
                radius * Math.sqrt(resolution)
            );
        },

        /**
         * Load url as blob and saves it as objectURL.
         * @param {String} url to load
         * @returns {void}
         */
        load (url) {
            axios.get(url, {responseType: "blob"})
                .then(response => {
                    if (response.status === 200) {
                        const imgUrl = URL.createObjectURL(response.data);

                        this.addPreviewUrl({id: this.layerId, previewUrl: imgUrl});
                    }
                    else {
                        console.warn("Cannot load preview for id " + this.layerId + ", response status is ", response.status);
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        },

        /**
         * Sets the previewUrl from layerConfigs params.
         * @param {Object} layerConfig config of the WMS layer
         * @returns {void}
         */
        buildWMSUrl (layerConfig) {
            let layerConfigUrl,
                params,
                url;

            if (layerConfig.preview?.src && layerConfig.preview?.src !== "") {
                url = layerConfig.preview.src;
            }
            else {
                if (layerConfig.typ === "GROUP") {
                    layerConfigUrl = layerConfig.children[0].url;
                    params = wms.makeParams(layerConfig.children[0]);
                }
                else {
                    layerConfigUrl = layerConfig.url;
                    params = wms.makeParams(layerConfig);
                }
                url = `${layerConfigUrl}?SERVICE=WMS&REQUEST=GetMap&WIDTH=${this.width}&HEIGHT=${this.height}`;
                params.CRS = layerConfig.crs ? layerConfig.crs : mapCollection.getMapView("2D").getProjection().getCode();
                params.SRS = params.CRS;
                params.BBOX = this.calculateExtent();
                params.STYLES = "";

                Object.entries(params).forEach(([key, value]) => {
                    if (key !== "WIDTH" && key !== "HEIGHT") {
                        url += `&${key}=${encodeURIComponent(value)}`;
                    }
                });
            }

            this.load(url);
        },

        /**
         * Sets the previewUrl from layerConfigs capabilities.
         * @param {Object} layerConfig config of the WMTS layer
         * @returns {void}
         */
        buildWMTSUrl (layerConfig) {
            wmts.getWMTSCapabilities(layerConfig.capabilitiesUrl).then((capabilities) => {
                this.createWMTSPreviewUrlFromCapabilities(layerConfig, capabilities);
            }).catch(error => {
                console.warn("Error occured during creation of url for preview of wmts-layer", layerConfig, error);
            });
        },

        /**
         * Creates the url for this WMTS layer-config from the WMTS capabilities and sets it to previewUrl.
         * @param {Object} layerConfig config of the WMTS layer
         * @param {Object} capabilities capabilities  of the WMTS layer
         * @returns {void}
         */
        createWMTSPreviewUrlFromCapabilities (layerConfig, capabilities) {
            const capabilitiesOptions = {
                    layer: layerConfig.layers
                },
                mapView = mapCollection.getMapView("2D");
            let previewUrl = null,
                options = null,
                tileZ = null,
                tileCoord = null,
                wmsWithOptions = null,
                tile = null,
                transformedCoords = null;

            if (layerConfig.tileMatrixSet) {
                capabilitiesOptions.matrixSet = layerConfig.tileMatrixSet;
            }
            else {
                capabilitiesOptions.projection = "EPSG:3857";
            }
            options = optionsFromCapabilities(capabilities, capabilitiesOptions);
            transformedCoords = proj4(proj4(mapView.getProjection().getCode()), proj4(options.projection?.getCode() ? options.projection?.getCode() : "EPSG:3857"), this.previewCenter(this.layerId));
            tileZ = options?.tileGrid.getZForResolution(mapView.getResolutions()[this.previewZoomLevel(this.layerId)]);
            tileCoord = options?.tileGrid.getTileCoordForCoordAndZ(transformedCoords, tileZ);

            wmsWithOptions = new WMTS(options);
            tile = wmsWithOptions.getTile(tileCoord[0], tileCoord[1], tileCoord[2]);
            tile.load();
            previewUrl = tile.getImage().src;
            this.load(previewUrl);
        },

        /**
         * Sets the previewUrl from layerConfigs preview.src.
         * @param {Object} layerConfig config of the VectorTile layer
         * @returns {void}
         */
        buildVectorTileUrl (layerConfig) {
            this.addPreviewUrl({id: layerConfig.id, previewUrl: layerConfig.preview?.src});
        },

        /**
         * Listener for click on preview.
         * @returns {void}
         */
        clicked () {
            this.$emit("previewClicked");
            Tooltip.getInstance(this.$el)?.hide();
        },

        /*
         * Generates the previewUrl depending on layerConfig type.
         * @returns {void}
         */
        generatePreviewUrlByConfigType () {
            const layerConfig = this.layerConfigById(this.layerId);

            if (layerConfig && this.supportedLayerTyps.includes(layerConfig.typ)) {
                this.initialize({id: this.layerId, center: this.center, zoomLevel: this.zoomLevel});
                this.layerName = layerConfig.name;
                if (!this.previewUrlByLayerIds[this.layerId]) {
                    if (layerConfig.typ === "WMS" || layerConfig.typ === "GROUP") {
                        this.buildWMSUrl(layerConfig);
                    }
                    else if (layerConfig.typ === "WMTS") {
                        this.buildWMTSUrl(layerConfig);
                    }
                    else if (layerConfig.typ === "VectorTile") {
                        this.buildVectorTileUrl(layerConfig);
                    }
                }
            }
            else {
                console.warn("Layer for preview cannot be found:", this.layerId);
            }
        },

        /**
         * Return the preview url for the current layer.
         * @returns {String} the preview url for the current layer
         */
        getPreviewUrl () {
            return this.previewUrlByLayerIds[this.layerId];
        }
    }

};
</script>

<template>
    <div
        v-if="getPreviewUrl() !== undefined"
        role="button"
        tabindex="0"
        :class="[
            customClass,
            'layerPreview'
        ]"
        :data-bs-toggle="!isMobile ? 'tooltip' : null"
        :title="layerName"
        @click="clicked()"
        @keydown.enter="clicked()"
    >
        <div class="wrapperImg">
            <img
                :class="[
                    customClass,
                    'previewImg'
                ]"
                :src="getPreviewUrl()"
                alt="previewImg"
            >
        </div>

        <div
            v-if="checkable"
            :class="[
                customClass,
                'checkable',
                {
                    'bi-check-lg': checked,
                }
            ]"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.layerPreview{
    position: relative;
    width: 50px;
    height: 50px;
}
.previewImg {
    width: 50px;
    height: 50px;
    display: block;
    -webkit-user-select: none;
    user-select: none;
    background-color: hsl(0, 0%, 90%);
    transition: background-color 300ms;
    border-radius: 50%;
}
.bi-check-circle::before {
    display: block;
}
.bi-circle::before {
    display: block;
}
.wrapperImg{
   position: absolute;
}
.checkable{
    position: absolute;
    width: 50px;
    height: 50px;
    line-height: 50px;
    font-size: 3rem;
    color: rgba(66, 66, 66, 0.8);
    text-align: center;
    -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.8);
    border: 2px solid rgba(66, 66, 66, 0.3);
    border-radius: 50%;
}
.checkable:hover, .checkable:focus,  .checkable:active{
    border: 2px solid rgba(66, 66, 66, 0.8);
}

@media (max-width: 767px) {
    .checkable{
        font-size: 2.5rem;
        text-align: center;
}
}

</style>
