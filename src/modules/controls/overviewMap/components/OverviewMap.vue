<script>
import {OverviewMap} from "ol/control.js";
import {mapGetters, mapMutations} from "vuex";
import utils from "./utils";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import uiStyle from "../../../../utils/uiStyle";
import isObject from "../../../../utils/isObject";

/**
 * Overview control that shows a mini-map to support a user's
 * sense of orientation within the map.
 *
 * TODO Currently using radio to detect 3D mode. Should eventually
 * listen to the vuex map module as soon as modes are modeled
 * there.
 * @listens Map#RadioTriggerMapChange
 */
export default {
    name: "OverviewMap",
    components: {
        ControlIcon
    },
    props: {
        /** resolution of mini-map view */
        startResolution: {
            type: Number,
            required: false,
            default: null
        },
        /** id of layer to show in mini-map */
        layerId: {
            type: String,
            required: false,
            default: null
        },
        /** whether the mini-map is visible initially */
        isInitOpen: {
            type: Boolean,
            default: true
        },
        renderIn3d: {
            type: Boolean,
            default: false
        }
    },
    data: function () {
        return {
            open: this.isInitOpen,
            overviewMap: null,
            visibleInMapMode: null // set in .created
        };
    },
    computed: {
        ...mapGetters(["uiStyle"]),
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters("controls/overviewMap", ["overviewLayer"]),

        component () {
            return uiStyle.getUiStyle() === "TABLE" ? TableStyleControl : ControlIcon;
        },
        localeSuffix () {
            return uiStyle.getUiStyle() === "TABLE" ? "Table" : "Control";
        }
    },
    watch: {
        /**
         * Checks the mapMode for 2D or 3D.
         * @param {Boolean} value mode of the map
         * @param {Boolean} oldValue old mode of the map
         * @returns {void}
         */
        mode (value, oldValue) {
            if (oldValue === "3D" && value === "2D" && this.renderIn3d) {
                const {baseLayer, baseView} = this.prepareOverViewMap(this.layerId || this.baselayer);

                this.createOverViewMap(baseLayer, baseView);
            }
            this.visibleInMapMode = value !== "3D" || this.renderIn3d;
        },

        /**
         * Watch for changes on the layer state of the overviewMap.
         * @param {ol/Layer} layer The ol layer.
         * @returns {void}
         */
        overviewLayer (layer) {
            const {baseLayer, baseView} = this.prepareOverViewMap(this.layerId || this.baselayer);

            this.createOverViewMap(baseLayer, baseView, layer);
        }
    },
    created () {
        this.checkModeVisibility();
    },
    mounted () {
        const {baseLayer, baseView} = this.prepareOverViewMap(this.layerId || this.baselayer);

        this.createOverViewMap(baseLayer, baseView);
    },
    methods: {
        ...mapMutations("controls/overviewMap", ["setZoomLevel"]),
        /**
         * Prepares the layer for the overviewMap.
         * @param {Number|String} layerId The layer id for the overviewMap.
         * @param {ol/Layer} additionalLayer A layer which should be displayed on top of the base overview layer.
         * @returns {Object} the prepared baseLayer and baseView.
         */
        prepareOverViewMap (layerId, additionalLayer) {
            if (typeof layerId !== "number" && typeof layerId !== "string") {
                return {};
            }
            const baseLayer = utils.getOverviewMapLayer(layerId),
                map = this.mode === "3D" ? mapCollection.getMap(this.mode).getOlMap() : mapCollection.getMap(this.mode),
                baseView = utils.getOverviewMapView(map, this.resolution);

            // try to display overviewMap layer in all available resolutions
            baseLayer.setMaxResolution(baseView.getMaxResolution());
            baseLayer.setMinResolution(baseView.getMinResolution());
            if (additionalLayer) {
                additionalLayer.setMaxResolution(baseView.getMaxResolution());
                additionalLayer.setMinResolution(baseView.getMinResolution());
            }

            return {
                baseLayer,
                baseView
            };
        },
        /**
         * Creates an overview map and removes existing one.
         * @param {ol/Layer} baseLayer The base layer for the overview map.
         * @param {ol/View} baseView The view of the base layer.
         * @param {ol/Layer} additionalLayer A layer which should be displayed on top of the base overview layer.
         * @returns {void}
         */
        createOverViewMap (baseLayer, baseView, additionalLayer) {
            if (!isObject(baseLayer) || !isObject(baseView)) {
                return;
            }

            if (this.overviewMap) {
                mapCollection.getMap("2D").removeControl(this.overviewMap);
            }

            this.overviewMap = new OverviewMap({
                layers: additionalLayer ? [baseLayer, additionalLayer] : [baseLayer],
                view: baseView,
                collapsible: true,
                collapsed: false,
                // OverviewMap can only be produced in "mounted" when "target" is available already
                target: "overviewmap-wrapper"
            });

            // if initially open, add control now that available
            if (this.open && this.overviewMap !== null) {
                mapCollection.getMap("2D").addControl(this.overviewMap);
                if (document.getElementsByClassName("ol-overviewmap-box")[0]) {
                    document.getElementsByClassName("ol-overviewmap-box")[0].style.display = additionalLayer ? "none" : "";
                }
            }
        },
        /**
         * Toggles the visibility of the mini-map.
         * @returns {void}
         */
        toggleOverviewMapFlyout () {
            this.open = !this.open;
            if (this.overviewMap !== null) {
                mapCollection.getMap("2D")[`${this.open ? "add" : "remove"}Control`](this.overviewMap);
            }
        },
        /**
         * Sets visibility flag depending on map mode; OverviewMap is not available in 3D mode.
         * @returns {void}
         */
        checkModeVisibility () {
            this.visibleInMapMode = this.mode !== "3D" || this.renderIn3d;
        }
    }
};
</script>

<template>
    <div
        v-if="visibleInMapMode"
        id="overviewmap-wrapper"
    >
        <component
            :is="component"
            :class="['overviewmap-button', (open && uiStyle !== 'TABLE') ? 'space-above' : '']"
            :title="$t(`common:modules.controls.overviewMap.${open ? 'hide' : 'show'}Overview${localeSuffix}`)"
            icon-name="globe"
            :on-click="toggleOverviewMapFlyout"
        />
    </div>
    <div
        v-else
        :class="{hideButton: 'overviewmap-button'}"
    />
</template>

<style lang="scss" scoped>
    /* .ol-overviewmap has fixed height in openlayers css;
     * measured this value for 12px space between control contents */
    .space-above {
        margin-top: 136px;
    }
</style>

<style lang="scss">
    /* ⚠️ unscoped css, extend with care;
     * control (.ol-overviewmap) is out of scope;
     * overriding with global rule that avoids leaks
     * by using local id #overviewmap-wrapper */

    @import "~variables";
    $box-shadow: 0 6px 12px $shadow;

    #overviewmap-wrapper {
        position: relative;

        .ol-overviewmap {
            left: auto;
            right: 100%;
            box-shadow: $box-shadow;
            border: 0;

            .ol-overviewmap-box {
                border: 2px solid $light_grey;
            }

            .ol-overviewmap-map {
                box-shadow: $box-shadow;
                width: 200px;
            }
        }
    }
    .hideButton {
        display: none;
    }
</style>
