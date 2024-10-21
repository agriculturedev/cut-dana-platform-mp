<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import mutations from "../store/mutationsOrientation";
import ControlIcon from "../../components/ControlIcon.vue";
import PoiChoice from "./poi/PoiChoice.vue";
import PoiOrientation from "./poi/PoiOrientation.vue";
import Geolocation from "ol/Geolocation.js";
import Overlay from "ol/Overlay.js";
import proj4 from "proj4";
import * as Proj from "ol/proj.js";
import {Circle, LineString} from "ol/geom.js";
import layerCollection from "../../../../core/layers/js/layerCollection";
import isObject from "../../../../shared/js/utils/isObject";

/**
 * Orientation control that allows the user to locate themselves on the map.
 * @module modules/controls/OrientationItem
 * @vue-data {Boolean} firstGeolocation - Shows if it is the first time locating.
 * @vue-data {Object} marker - Overlay with marker.
 * @vue-data {Boolean} tracking - Shows if the tracking is on.
 * @vue-data {Boolean} isGeolocationDenied - Shows if geolocation is denied.
 * @vue-data {Boolean} isGeolocationPossible - Shows if geolocation is possible.
 * @vue-computed {Array} poiDistancesLocal - An array of local distances.
 */
export default {
    name: "OrientationItem",
    components: {
        ControlIcon,
        PoiChoice,
        PoiOrientation
    },
    data () {
        return {
            firstGeolocation: true, // flag to check if it's the first time
            marker: new Overlay({
                positioning: "center-center",
                stopEvent: false
            }),
            tracking: false,
            isGeolocationDenied: false,
            isGeoLocationPossible: false
        };
    },
    computed: {
        ...mapGetters("Controls/Orientation", [
            "geolocation",
            "iconGeolocate",
            "iconGeolocatePOI",
            "onlyFilteredFeatures",
            "poiDistances",
            "poiMode",
            "poiModeCurrentPositionEnabled",
            "showPoi",
            "showPoiChoice",
            "showPoiIcon",
            "zoomMode"
        ]),
        ...mapGetters("Maps", ["projection"]),
        ...mapGetters(["visibleLayerConfigs"]),
        poiDistancesLocal () {
            return this.poiDistances === true ? [500, 1000, 2000] : this.poiDistances;
        }
    },
    watch: {
        tracking () {
            this.trackingChanged();
            this.checkWFS();
        },
        isGeolocationDenied () {
            this.toggleBackground();
            this.checkWFS();
        },
        position () {
            if (!this.poiModeCurrentPositionEnabled && this.showPoiIcon) {
                this.showPoiWindow();
            }
        },
        visibleLayerConfigs: {
            handler () {
                this.checkWFS();
            },
            deep: true
        }
    },
    created () {
        this.setIsGeoLocationPossible();
    },
    mounted () {
        this.addElement();
        this.checkWFS();

    },
    methods: {
        ...mapMutations("Controls/Orientation", Object.keys(mutations)),
        ...mapActions("Maps", ["zoomToCoordinates"]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        setIsGeoLocationPossible () {
            this.isGeoLocationPossible = window.location.protocol === "https:" || ["localhost", "127.0.0.1"].indexOf(window.location.hostname);
        },

        /**
         * add overlay for marker
         * @returns {void}
         */
        addElement: function () {
            this.marker.setElement(document.querySelector("#geolocation_marker"));
        },

        /**
         * Tracking the geo position
         * @returns {void}
         */
        track () {
            let geolocation = null;

            if (this.isGeolocationDenied === false) {
                mapCollection.getMap("2D").addOverlay(this.marker);
                if (this.geolocation === null) {
                    geolocation = new Geolocation({tracking: true, projection: Proj.get("EPSG:4326")});
                    this.setGeolocation(geolocation);
                }
                else {
                    geolocation = this.geolocation;
                    this.positioning();
                }

                geolocation.on("change", this.positioning);
                geolocation.on("error", this.onError);
                this.tracking = true;
            }
            else {
                this.onError();
            }
        },

        /**
         * Untracking the geo position
         * @returns {void}
         */
        untrack () {
            const geolocation = this.geolocation;

            geolocation.setTracking(false); // for FireFox - cannot handle geolocation.un(...)
            geolocation.un("error", this.onError, this);
            if (this.tracking === false || this.firstGeolocation === false) {
                this.removeOverlay();
            }

            this.tracking = false;
            this.setGeolocation(null);
        },

        /**
         * Show error information and untack if there are errors by trcking the position
         * @returns {void}
         */
        onError () {
            this.addSingleAlert({
                category: "error",
                content: `<strong>${this.$t("common:modules.controls.orientation.geolocationDeniedText")}</strong>`
            });
            this.isGeolocationDenied = true;
            if (this.geolocation !== null) {
                this.untrack();
            }
        },

        /**
         * Removing the overlay of marker from map
         * @returns {void}
         */
        removeOverlay () {
            mapCollection.getMap("2D").removeOverlay(this.marker);
        },

        /**
         * To decide show or not to show Poi
         * @returns {void}
         */
        checkWFS () {
            const visibleWFSModels = [];

            this.visibleLayerConfigs?.forEach(layer => {
                if (layer.typ === "WFS") {
                    visibleWFSModels.push(layer);
                }
            });

            if (this.poiDistancesLocal.length > 0) {
                if (!visibleWFSModels.length) {
                    this.setShowPoiIcon(false);
                    this.$store.dispatch("Maps/removePointMarker");
                }
                else {
                    this.setShowPoiIcon(true);
                }
            }
        },

        /**
         * Change the style of button
         * @returns {void}
         */
        trackingChanged () {
            if (this.tracking) {
                document.querySelector("#geolocate").className += " toggleButtonPressed";
            }
            else {
                if (this.geolocation !== null) {
                    this.untrack();
                }
                document.querySelector("#geolocate").classList.remove("toggleButtonPressed");
            }
        },

        /**
         * Getting the current postion or untrack the position
         * @returns {void}
         */
        getOrientation () {
            if (!this.tracking) {
                this.track();
            }
            else if (this.geolocation !== null) {
                this.untrack();
            }
        },

        /**
         * Setting the marker on the position
         * @param {Object} position the position object from openlayer
         * @returns {void}
         */
        positionMarker (position) {
            try {
                this.marker.setPosition(position);
            }
            catch (e) {
                console.error("wasn't able to set marker");
            }
        },

        /**
         * Zoom to the center
         * @param {Object} position the position object from openlayer
         * @returns {void}
         */
        zoomAndCenter (position) {
            this.zoomToCoordinates({center: position, zoom: 6});
        },

        /**
         * Setting the current map on the position
         * @returns {void}
         */
        positioning () {
            const position = this.geolocation.getPosition(),
                firstGeolocation = this.firstGeolocation,
                zoomMode = this.zoomMode,
                centerPosition = proj4(proj4("EPSG:4326"), proj4(this.projection.getCode()), position);

            // setting the center position
            this.setPosition(centerPosition);

            // screen navigation
            if (zoomMode === "once") {
                if (firstGeolocation === true) {
                    this.positionMarker(centerPosition);
                    this.zoomAndCenter(centerPosition);
                    this.firstGeolocation = false;
                }
                else {
                    this.positionMarker(centerPosition);
                }
            }
            else if (zoomMode === "always") {
                this.positionMarker(centerPosition);
                this.zoomAndCenter(centerPosition);
                this.firstGeolocation = false;
            }
            else {
                console.error("The configured zoomMode: " + zoomMode + " does not exist. Please use the params 'once' or 'always'!");
            }

            this.$store.dispatch("Maps/removePointMarker");
        },

        /**
         * with deactivated localization the button is disabled and poi button is hidden
         * @returns {void}
         */
        toggleBackground () {
            const geolocateIcon = document.getElementById("geolocate");

            if (this.isGeolocationDenied) {
                geolocateIcon.style.backgroundColor = "grey";
            }
            else {
                geolocateIcon.style.backgroundColor = "#E10019";
            }
        },

        /**
         * Show Poi window
         * @returns {void}
         */
        getPOI () {
            document.querySelector("#geolocatePOI").className += " toggleButtonPressed";
            this.setShowPoiChoice(true);
        },

        /**
         * Tracking the poi
         * @returns {void}
         */
        trackPOI () {
            let geolocation = null;

            this.removeOverlay();

            if (this.poiModeCurrentPositionEnabled) {
                this.$store.dispatch("Maps/removePointMarker");
                mapCollection.getMap("2D").addOverlay(this.marker);
                if (this.geolocation === null) {
                    geolocation = new Geolocation({tracking: true, projection: Proj.get("EPSG:4326")});
                    this.setGeolocation(geolocation);
                }
                else {
                    geolocation = this.geolocation;
                    this.setPosition(null);
                    this.showPoiWindow();
                }
                geolocation.on("change", this.showPoiWindow);
                geolocation.on("error", this.onPOIError);
            }
        },

        /**
         * Untracking the poi
         * @returns {void}
         */
        untrackPOI () {
            const geolocation = this.geolocation;

            if (this.poiModeCurrentPositionEnabled) {
                geolocation.un("change", this.showPoiWindow);
                geolocation.un("error", this.onPOIError);
            }
            else {
                this.removeOverlay();
            }
            this.setShowPoi(false);
        },

        /**
         * Showing poi window
         * @returns {void}
         */
        showPoiWindow () {
            if (!this.position) {
                const geolocation = this.geolocation,
                    position = geolocation.getPosition(),
                    centerPosition = proj4(proj4("EPSG:4326"), proj4(this.projection.getCode()), position);

                // setting the center position
                this.setPosition(centerPosition);
                this.positioning();
            }
            this.setShowPoi(true);
        },

        /**
         * Showing error message by opening poi window
         * @param {Object} evt error event
         * @returns {void}
         */
        onPOIError () {
            this.addSingleAlert({
                category: "error",
                content: `<strong>${this.$t("common:modules.controls.orientation.trackingDeniedText")}</strong>`
            });

            if (this.geolocation !== null) {
                this.untrack();
            }
        },

        /**
         * getting the vector feature within the distance
         * @param {Array} layerConfigs layer configs to inspect
         * @param  {Number} distance the search range
         * @param  {Array} centerPosition the center position
         * @return {ol/feature} Array of ol.features list
         */
        getVectorFeaturesInCircle (layerConfigs, distance, centerPosition) {
            const circle = new Circle(centerPosition, distance),
                circleExtent = circle.getExtent(),
                visibleWFSLayers = [];

            layerConfigs.forEach(layerConfig => {
                if (layerConfig.typ === "WFS" && layerConfig.visibility) {
                    const layer = layerCollection.getLayerById(layerConfig.id);

                    if (layer) {
                        visibleWFSLayers.push(layer);
                    }
                }
            });
            let featuresAll = [],
                features = [];

            visibleWFSLayers.forEach(layer => {
                let preparedFeatures,
                    filteredFeatures = [];

                if (layer.getLayerSource()) {
                    features = layer.getLayerSource().getFeaturesInExtent(circleExtent);
                    filteredFeatures = features.filter(feat => {
                        return (isObject(feat.getStyle()) && feat.getStyle().getImage() !== null) || (typeof feat.getStyle() === "function" && feat.getStyle()(feat) !== null);
                    });
                    if (this.onlyFilteredFeatures === true) {
                        features = filteredFeatures;
                    }
                    preparedFeatures = features.filter((feat) => {
                        const dist = this.getDistance(feat, centerPosition);

                        return dist <= distance;
                    });

                    preparedFeatures.forEach(function (feat) {
                        Object.assign(feat, {
                            styleId: layer.get("styleId"),
                            layerName: layer.get("name"),
                            nearbyTitleText: this.getNearbyTitleText(feat, layer.get("nearbyTitle")),
                            dist2Pos: this.getDistance(feat, centerPosition)
                        });
                    }, this);
                    featuresAll = this.union(preparedFeatures, featuresAll, function (obj1, obj2) {
                        return obj1 === obj2;
                    });
                }
            }, this);

            return featuresAll;
        },

        /**
         * Computes the union of the passed-in arrays: the list of unique items, in order, that are present in one or more of the arrays.
         * @param  {Array} arr1 the first array
         * @param  {Array} arr2 the second array
         * @param  {Function} equalityFunc to compare objects
         * @returns {Array} the union of the two arrays
         */
        union (arr1, arr2, equalityFunc) {
            const union = arr1.concat(arr2);
            let i = 0,
                j = 0;

            for (i = 0; i < union.length; i++) {
                for (j = i + 1; j < union.length; j++) {
                    if (equalityFunc(union[i], union[j])) {
                        union.splice(j, 1);
                        j--;
                    }
                }
            }
            return union;
        },

        /**
         * Getting the distance from center position
         * @param  {ol/feature} feat Feature
         * @param {Number[]} centerPosition the center position
         * @return {Number} dist the distance
         */
        getDistance (feat, centerPosition) {
            const closestPoint = feat.getGeometry().getClosestPoint(centerPosition),
                line = new LineString([closestPoint, centerPosition]);

            return Math.round(line.getLength());
        },

        /**
         * Getting the attributes for the list of nearby features
         * @param {ol/Feature} feat Feature
         * @param {(String|String[])} nearbyTitle the attribute(s) of features to show in the nearby list
         * @return {String[]} the text of nearbyTitle
         */
        getNearbyTitleText (feat, nearbyTitle) {
            if (typeof nearbyTitle === "string" && feat.get(nearbyTitle) !== undefined) {
                return [feat.get(nearbyTitle)];
            }
            else if (Array.isArray(nearbyTitle)) {
                const nearbyTitleText = [];

                nearbyTitle.forEach(attr => {
                    if (feat.get(attr) !== undefined) {
                        nearbyTitleText.push(feat.get(attr));
                    }
                });

                return nearbyTitleText;
            }
            return [];
        }
    }

};
</script>

<template>
    <div class="orientationButtons">
        <span
            id="geolocation_marker"
            class="geolocation_marker"
        >
            <i class="bi-circle-fill" />
        </span>
        <ControlIcon
            id="geolocate"
            :title="$t('common:modules.controls.orientation.titleGeolocate')"
            :icon-name="iconGeolocate"
            :on-click="getOrientation"
        />
        <ControlIcon
            v-if="showPoiIcon"
            id="geolocatePOI"
            :icon-name="iconGeolocatePOI"
            :title="$t('common:modules.controls.orientation.titleGeolocatePOI')"
            :on-click="getPOI"
        />
        <PoiChoice
            v-if="showPoiChoice"
            id="geolocatePoiChoice"
            @track="trackPOI"
        />
        <PoiOrientation
            v-if="showPoi"
            :poi-distances="poiDistancesLocal"
            :get-features-in-circle="getVectorFeaturesInCircle"
            @hide="untrackPOI"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .orientationButtons {
        >.toggleButtonPressed {
            background-color: $dark_blue;
            color: $white;
        }
    }
    .geolocation_marker {
        color: $dark_blue;
        padding: 1px;
        border-radius: 50%;
        font-size: 1.4rem;
    }
</style>
