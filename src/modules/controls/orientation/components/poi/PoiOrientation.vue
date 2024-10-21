<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import mutations from "../../store/mutationsOrientation";
import {extractEventCoordinates} from "../../../../../shared/js/utils/extractEventCoordinates";
import svgFactory from "../../../../../shared/js/utils/svgFactory";

/**
 * Orientation control that allowsthe user to locate themselves on the map.
 * @module modules/controls/PoiOrientation
 * @vue-prop {Boolean | Array} poiDistances - The point of interest distances.
 * @vue-prop {Function} getFeaturesInCircle - Function to get Features within distance.
 * @vue-event {String} hide - Emits hide to hide the modal.
 */
export default {
    name: "PoiOrientation",
    props: {
        poiDistances: {
            type: [Boolean, Array],
            required: false,
            default: () => []
        },

        getFeaturesInCircle: {
            type: Function,
            required: true
        }
    },
    emits: ["hide"],
    data () {
        return {
            poiFeatures: [],
            imgPathByFeature: {}
        };
    },
    computed: {
        ...mapGetters("Controls/Orientation", ["activeCategory", "position"]),
        ...mapGetters(["visibleLayerConfigs"])
    },
    watch: {
        visibleLayerConfigs: {
            handler (newLayerConfigs, oldLayerConfigs) {
                newLayerConfigs.forEach(newConfig => {
                    if (!oldLayerConfigs.find(config => config.id === newConfig.id)) {
                        this.$nextTick(() => {
                            this.areLayerFeaturesLoaded(newConfig.id).then(() => {
                                this.getFeatures(newLayerConfigs);
                            });
                        });
                    }
                });
                oldLayerConfigs?.forEach(oldConfig => {
                    if (!newLayerConfigs.find(config => config.id === oldConfig.id)) {
                        this.getFeatures(newLayerConfigs);
                    }
                });
            },
            deep: true
        }
    },
    mounted () {
        this.show();
        this.getFeatures(this.visibleLayerConfigs);
        this.initActiveCategory();
        this.$nextTick(() => {
            if (this.$refs["close-icon"]) {
                this.$refs["close-icon"].focus();
            }
        });
    },
    methods: {
        ...mapMutations("Controls/Orientation", Object.keys(mutations)),
        ...mapActions("Maps", ["areLayerFeaturesLoaded", "zoomToExtent", "unregisterListener"]),

        /**
         * Callback when close icon has been clicked.
         * @param {Event} event the dom event
         * @returns {void}
         */
        closeIconTriggered (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.hidePoi();
            }
        },

        /**
         * Show the modal.
         * @returns {void}
         */
        show () {
            const el = document.querySelector(".modal"),
                backdrop = document.querySelector(".modal-backdrop");

            if (el) {
                el.style.display = "block";
                el.classList.add("show");
                el.classList.remove("fade");
                backdrop.style.display = "block";
                backdrop.classList.add("show");
                backdrop.classList.remove("fade");
            }
        },

        /**
         * Hides the modal.
         * @returns {void}
         */
        hidePoi () {
            this.$emit("hide");
            this.poiFeatures = [];
            document.querySelector("#geolocatePOI").classList.remove("toggleButtonPressed");
        },

        /**
         * Getting the features within the distances
         * @param {Array} layerConfigs visible layer configs
         * @returns {void}
         */
        getFeatures (layerConfigs) {
            const poiDistances = this.poiDistances,
                poiFeatures = [],
                centerPosition = this.position;
            let featInCircle = [];

            poiDistances.forEach(distance => {
                featInCircle = this.getFeaturesInCircle(layerConfigs, distance, centerPosition);
                featInCircle.sort((featureA, featureB) => featureA.dist2Pos - featureB.dist2Pos);
                poiFeatures.push({
                    category: distance,
                    features: featInCircle
                });
            });

            poiFeatures.forEach(category => {
                category.features.forEach(feat => {
                    this.fillImagePath(feat);
                    feat.nearbyTitleText = this.getFeatureTitle(feat);
                });
            });

            this.poiFeatures = poiFeatures;
        },

        /**
         * Initial the active category
         * @returns {void}
         */
        initActiveCategory () {
            let poi,
                first;


            if (typeof this.activeCategory !== "number") {
                poi = this.poiFeatures;
                first = poi.find(function (dist) {
                    return dist.features.length > 0;
                });

                this.setActiveCategory(first ? first.category : poi[0].category);
            }
        },

        /**
         * Getting the feature title
         * @param  {ol/Feature} feature the vector feature
         * @return {String[]} the nearbyTitle Text
         */
        getFeatureTitle (feature) {
            if (!Array.isArray(feature.nearbyTitleText) || !feature.nearbyTitleText.length) {
                if (feature.get("name")) {
                    return [feature.get("name")];
                }
                else if (feature.layerName) {
                    return [feature.layerName];
                }
            }

            return feature.nearbyTitleText;

        },

        /**
         * Zooming to the feature point
         * @param {Event} evt click event
         * @returns {void}
         */
        zoomFeature (evt) {
            const id = evt.currentTarget.id,
                poiFeatures = this.poiFeatures,
                activeCategory = this.activeCategory,
                selectedPoiFeatures = poiFeatures.find(poi => {
                    return poi.category === activeCategory;
                }),
                feature = selectedPoiFeatures.features.find(feat => {
                    return feat.getId() === id;
                }),
                extent = feature.getGeometry().getExtent(),
                coordinate = extractEventCoordinates(extent),
                resolutions = mapCollection.getMapView("2D").getResolutions(),
                index = resolutions.indexOf(0.2645831904584105) === -1 ? resolutions.length : resolutions.indexOf(0.2645831904584105);

            this.zoomToExtent({extent: coordinate, options: {maxZoom: index}});
            this.$store.dispatch("Maps/removePointMarker");
            this.$emit("hide");
            this.setPoiMode("currentPosition");
            this.setCurrentPositionEnabled(true);
            document.querySelector("#geolocatePOI").classList.remove("toggleButtonPressed");
        },

        /**
         * Changing default category
         * @param {Event} evt click event
         * @return {String} SVG
         */
        changedCategory (evt) {
            const currentTabId = evt.target.getAttribute("aria-controls");

            this.setActiveCategory(parseFloat(currentTabId));
        },

        /**
         * Getting the image path from feature and stores it in 'imgPathByFeature'.
         * @param  {ol/feature} feat Feature
         * @return {void}
         */
        fillImagePath (feat) {
            const styleObject = styleList.returnStyleObject(feat.styleId);

            this.imgPathByFeature[feat.getId()] = "";
            if (styleObject) {
                const featureStyleObject = createStyle.getGeometryStyle(feat, styleObject.rules, false, Config.wfsImgPath),
                    featureStyle = createStyle.createStyle(styleObject, feat, false, Config.wfsImgPath);

                if (featureStyleObject.attributes?.type === "icon") {
                    this.imgPathByFeature[feat.getId()] = featureStyle.getImage()?.getSrc() ? featureStyle.getImage()?.getSrc() : "";
                }

                else {
                    createStyle.returnLegendByStyleId(feat.styleId).then(layerLegends => {
                        layerLegends.legendInformation.forEach(legendInfo => {
                            if (legendInfo.geometryType === "Point" && legendInfo.styleObject.attributes.type === "circle" && legendInfo.label === feat.legendValue) {
                                this.imgPathByFeature[feat.getId()] = svgFactory.createCircle(legendInfo.styleObject);
                            }
                            else if (legendInfo.geometryType === "LineString" && legendInfo.label === feat.legendValue) {
                                this.imgPathByFeature[feat.getId()] = svgFactory.createLine(legendInfo.styleObject);
                            }
                            else if (legendInfo.geometryType === "Polygon" && legendInfo.label === feat.legendValue) {
                                this.imgPathByFeature[feat.getId()] = svgFactory.createPolygon(legendInfo.styleObject);
                            }
                        });
                    });
                }
            }
        }
    }
};
</script>

<template>
    <button
        id="surrounding_vectorfeatures"
        class="modal fade in poi"
        @keydown.esc="hidePoi"
    >
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">
                        {{ $t("common:modules.controls.orientation.titleGeolocatePOI") }}
                    </h4>
                    <span
                        ref="close-icon"
                        class="bootstrap-icon"
                        tabindex="0"
                        aria-hidden="true"
                        data-bs-dismiss="modal"
                        :title="$t('button.close')"
                        @click="closeIconTriggered($event)"
                        @keydown="closeIconTriggered($event)"
                    >
                        <i class="bi-x-lg" />
                    </span>
                </div>
                <div>
                    <ul
                        class="nav nav-pills"
                        role="tablist"
                    >
                        <li
                            v-for="(feature, index) in poiFeatures"
                            :key="index"
                            class="nav-item"
                        >
                            <button
                                class="nav-link"
                                :class="feature.category === activeCategory ? 'active' : ''"
                                :href="feature.category"
                                :aria-controls="feature.category"
                                data-bs-toggle="pill"
                                @click="changedCategory"
                                @keydown.enter="changedCategory"
                            >
                                {{ feature.category + 'm' }}
                                <span
                                    class="badge"
                                    :aria-controls="feature.category"
                                >{{ feature.features.length }}</span>
                            </button>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div
                            v-for="(feature, index) in poiFeatures"
                            :id="feature.category"
                            :key="'list' + index"
                            role="tabpanel"
                            :class="['tab-pane fade show', feature.category === activeCategory ? 'active' : '']"
                        >
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <tbody>
                                        <tr
                                            v-for="(feat, i) in feature.features"
                                            :id="feat.getId()"
                                            :key="'feat' + i"
                                            @click="zoomFeature"
                                        >
                                            <td v-if="imgPathByFeature[feat.getId()].indexOf('</svg>') !== -1">
                                                <span v-html="imgPathByFeature[feat.getId()]" />
                                            </td>
                                            <td v-else-if="imgPathByFeature[feat.getId()].length > 0">
                                                <img
                                                    :src="imgPathByFeature[feat.getId()]"
                                                    :alt="$t('common:modules.controls.orientation.imgAlt')"
                                                >
                                            </td>
                                            <td>
                                                <p
                                                    v-for="(featNearbyTitleText, iNearby) in feat.nearbyTitleText"
                                                    :key="'featNearbyTitleText' + iNearby"
                                                >
                                                    <strong>{{ featNearbyTitleText }}</strong>
                                                </p>
                                                <p>{{ feat.dist2Pos + " " + $t('common:modules.controls.orientation.distanceUnit') }}</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button
            class="modal-backdrop fade show"
            @click="hidePoi"
        />
        <!--
            The previous element does not require a key interaction. It is not focusable,
            has no semantic meaning, and other methods exist for keyboard users to leave
            the backdropped modal dialog.
        -->
    </button>
</template>

<style lang="scss" scoped>
    @import "~variables";

    #surrounding_vectorfeatures {
        background-color: transparent;
    }
    .modal-backdrop{
        pointer-events: all;
        cursor: default;
    }
    .modal-backdrop:focus {
       background-color: lighten($dark_grey, 5%);
    }
    .poi {
        color: $dark_grey;
        font-size: $font_size_big;
        .modal-header {
            padding: 0;
            border-bottom: 0;
        }
        .modal-title {
            padding: 8px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .bi-x-lg {
            font-size: $font_size_icon_lg;
            float: right;
            padding: 12px;
            cursor: pointer;
        }
        .modal-dialog {
            z-index: 1051;
        }
        .tab-content{
            max-height: 78vH;
            overflow: auto;
            tbody {
                >tr {
                    >td {
                        &:nth-child(odd) {
                            width: 50px;
                            height: 50px;
                        }
                        &:nth-child(even) {
                            vertical-align: middle;
                        }
                        img {
                            max-width: 50px;
                        }
                    }
                }
            }
            tr {
                cursor: pointer;
            }
        }
    }
</style>
