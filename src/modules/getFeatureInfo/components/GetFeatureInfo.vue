<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

import GetFeatureInfoDetached from "./GetFeatureInfoDetached.vue";
import {mapAttributes} from "@masterportal/masterportalapi/src/lib/attributeMapper";
import omit from "../../../shared/js/utils/omit";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";

/**
 * Get Feature Info
 * @module modules/getFeatureInfo/components/GetFeatureInfo
 * @vue-data {Number} pagerIndex - The current index of the pagination.
 * @vue-data {String} componentKey - The key for re-render child component.
 * @vue-data {String} leftIcon - The icon for button.
 * @vue-data {String} rightIcon - The icon for the Button.
 * @vue-data {Boolean} updatedFeature - if true, feature is updated
 * @vue-computed {String} currentComponentType - The current component type of the menu navigation by side.
 * @vue-computed {String} currentViewType - The current view type.
 * @vue-computed {Object} feature - The feature depending on the pager index.
 */
export default {
    name: "GetFeatureInfo",
    components: {
        GetFeatureInfoDetached,
        IconButton
    },
    data () {
        return {
            // current index of the pagination and so also for the feature in the gfiFeatures
            pagerIndex: 0,
            // key for re-render child(detached) component
            componentKey: false,
            updatedFeature: false,
            // icons for buttons
            leftIcon: "bi-chevron-left",
            rightIcon: "bi-chevron-right"
        };
    },
    computed: {
        ...mapGetters([
            "ignoredKeys",
            "visibleSubjectDataLayerConfigs"
        ]),
        ...mapGetters("Modules/GetFeatureInfo", [
            "configPaths",
            "currentFeature",
            "initialMenuSide",
            "menuSide",
            "name",
            "showMarker",
            "type",
            "visible"
        ]),
        ...mapGetters("Modules/GetFeatureInfo", {
            gfiFeatures: "gfiFeaturesReverse"
        }),
        ...mapGetters("Maps", {
            clickCoordinate: "clickCoordinate",
            mapSize: "size"
        }),
        ...mapGetters("Menu", [
            "currentComponent",
            "currentMouseMapInteractionsComponent",
            "expanded"
        ]),
        ...mapGetters("Maps", {
            mapMode: "mode"
        }),

        /**
         * Returns the current component type of the menu navigation by side.
         * @returns {String} The current component type.
         */
        currentComponentType () {
            return this.currentComponent(this.menuSide)?.type;
        },

        /**
         * Returns the current view type.
         * It only works if the string has the same name as the component (in ./templates).
         * @returns {String} the current view type (Detached or Mobile)
         */
        currentViewType () {
            return "GetFeatureInfoDetached";
        },

        /**
         * Returns the feature depending on the pager index.
         * @returns {?Object} - the current feature
         */
        feature () {
            if (this.gfiFeatures !== null && Array.isArray(this.gfiFeatures) && this.gfiFeatures.length > 0) {
                return this.gfiFeatures[this.pagerIndex];
            }
            return null;
        },

        /**
         * Left pager is drawn.
         * @returns {Boolean} Left pager is drawn.
         */
        leftPager () {
            return this.gfiFeatures.length > 1 && this.pagerIndex > 0;
        },

        /**
         * Right pager is drawn.
         * @returns {Boolean} Right pager is drawn.
         */
        rightPager () {
            return this.gfiFeatures.length > 1 && this.pagerIndex < this.gfiFeatures.length - 1;
        }
    },
    watch: {
        /**
         * Resets component, if visible is false.
         * @param {Boolean} value visible
         * @returns {void}
         */
        visible (value) {
            const menuSides = ["mainMenu", "secondaryMenu"],
                otherSide = menuSides.find((element) => element !== this.initialMenuSide);

            if (!value) {
                this.reset();
            }
            else {
                if (this.currentComponent(this.menuSide).type === "print") {
                    this.setMenuSide(otherSide);
                }

                this.changeCurrentComponent({type: this.type, side: this.menuSide, props: {name: "none"}});
            }
        },
        /**
         * Detects changes in visible layers and closes gfi if layer of current shown feature was removed from map.
         * @returns {void}
         */
        visibleSubjectDataLayerConfigs: {
            handler (newVal, oldVal) {
                if (oldVal.length !== newVal.length && this.feature) {
                    if (newVal.filter(x => !oldVal.includes(x)).length === 0) {
                        const oldValues = oldVal.filter(x => !newVal.includes(x));

                        oldValues.forEach(config => {
                            if (this.feature?.getLayerId() === config.id && config.visibility === false) {
                                if (this.gfiFeatures.length === 1) {
                                    this.reset();
                                }
                                else {
                                    this.pagerIndex = 0;
                                    this.collectGfiFeatures();
                                }
                            }
                        });
                    }
                }
            },
            deep: true
        },
        /**
         * Whenever the map click coordinate changes collectGfiFeatures action will call.
         * @returns {void}
         */
        clickCoordinate: {
            handler (value) {
                if (this.currentMouseMapInteractionsComponent === this.type) {
                    this.pagerIndex = 0;
                    this.setClickCoordinates(value);
                    this.collectGfiFeatures();
                }
            },
            deep: true
        },

        /**
         * Whenever current component type is changed to  "getFeatureInfo", visible is set to false.
         * @param {String} type The current component type.
         * @returns {void}
         */
        currentComponentType (type) {
            if (type !== this.type) {
                this.setVisible(false);
            }
        },

        /**
         * Whenever feature changes, put it into the store
         * @param {?Object} newValue the current feature
         * @returns {void}
         */
        feature (newValue) {
            this.setCurrentFeature(newValue);
        },

        /**
         * Whenever mapSize changes, component key is changed
         * to force re-render detached component (key-changing).
         * @returns {void}
         */
        mapSize: {
            handler () {
                if (this.currentViewType === "GetFeatureInfoDetached") {
                    this.componentKey = !this.componentKey;
                }
            },
            deep: true
        },

        /**
         * Whenever gfiFeatures changes, set this visible and expand menu.
         * Set the updateFeature value to true if feature are given.
         * @param {?Object} newFeatures - the current features
         * @param {?Object} oldFeatures - the recent features
         * @returns {void}
         */
        gfiFeatures: {
            handler (newFeatures, oldFeatures) {
                let featuresChanged = oldFeatures === null;

                if (newFeatures?.length > 0) {
                    if (oldFeatures !== null) {
                        newFeatures.forEach(newFeature => {
                            if (!oldFeatures.find(oldFeat => oldFeat.getId() === newFeature.getId())) {
                                featuresChanged = true;
                            }
                        });
                        oldFeatures.forEach(oldFeature => {
                            if (!newFeatures.find(newFeat => newFeat.getId() === oldFeature.getId())) {
                                featuresChanged = true;
                            }
                        });
                    }

                    if (featuresChanged) {
                        this.setVisible(true);
                        if (!this.expanded(this.menuSide)) {
                            this.toggleMenu(this.menuSide);
                        }
                    }
                    this.setUpdatedFeature(true);
                }
                else if (newFeatures === null) {
                    this.resetMenu(this.menuSide);
                    this.setUpdatedFeature(false);
                }
            },
            deep: true
        }
    },
    mounted () {
        this.initializeModule({configPaths: this.configPaths, type: this.type});
        this.setMenuSide(this.initialMenuSide);
    },
    beforeUpdate () {
        if (this.feature) {
            this.createMappedProperties(this.feature);
        }
    },
    methods: {
        ...mapMutations("Modules/GetFeatureInfo", [
            "setGfiFeatures",
            "setCurrentFeature",
            "setVisible",
            "setMenuSide",
            "setClickCoordinates"
        ]),
        ...mapActions(["initializeModule"]),
        ...mapActions("Modules/GetFeatureInfo", [
            "collectGfiFeatures",
            "removeHighlightColor"
        ]),
        ...mapActions("Menu", [
            "changeCurrentComponent",
            "resetMenu",
            "toggleMenu"
        ]),

        /**
         * Resets means to set the gfiFeatures to null and revert 3D Coloring..
         * This closes the gfi window/modal/popover.
         * @returns {void}
         */
        reset: function () {
            this.pagerIndex = 0;
            this.setGfiFeatures(null);
            if (this.mapMode === "3D") {
                this.removeHighlightColor();
            }
        },

        /**
         * Set updatedFeature value.
         * @param {Boolean} val - false if features have been updated or no features are given
         * @returns {void}
         */
        setUpdatedFeature: function (val = false) {
            this.updatedFeature = val;
        },

        /**
         * Increases the index for the pagination.
         * @returns {void}
         */
        increasePagerIndex: function () {
            if (this.pagerIndex < this.gfiFeatures.length - 1) {
                this.pagerIndex += 1;
            }
        },

        /**
         * Decreases the index for the pagination.
         * @returns {void}
         */
        decreasePagerIndex: function () {
            if (this.pagerIndex > 0) {
                this.pagerIndex -= 1;
            }
        },

        createMappedProperties: function (feature) {
            if (Array.isArray(feature?.getFeatures())) {
                feature.getFeatures().forEach(singleFeature => {
                    this.createMappedProperties(singleFeature);
                });

            }
            else if (feature?.getProperties() && feature?.getProperties() !== null) {
                feature.getMappedProperties = () => this.prepareProperties(feature.getProperties(), feature.getAttributesToShow(), this.ignoredKeys);
            }
        },

        /**
         * Checks which properties should be displayed.
         * If all should be displayed, the ignoredKeys omitted.
         * Otherwise the properties are mapped
         * @param {Object} properties - the feature properties
         * @param {Object} mappingObject - "gfiAttributes" from the layer
         * @param {String[]} ignoredKeys - configured in the config.js
         * @returns {Object} prepared properties - mapped by MappingObject or omitted by ignoredKeys
         */
        prepareProperties: function (properties, mappingObject, ignoredKeys) {

            if (mappingObject === "showAll" && Array.isArray(ignoredKeys) || mappingObject === undefined) {
                return omit(properties, ignoredKeys, true);
            }
            return mapAttributes(properties, mappingObject);
        }
    }
};
</script>

<template>
    <div
        v-if="visible && feature !== null"
        class="gfi"
    >
        <component
            :is="currentViewType"
            v-if="visible && feature !== null"
            :key="componentKey"
            :feature="feature"
            :is-updated="updatedFeature"
            @update-feature-done="setUpdatedFeature(true)"
            @close="reset"
        >
            <!-- Slot Content for pager left -->
            <template
                #pager-left
            >
                <div
                    class="gfi-pager"
                    :class="!leftPager ? 'gfi-pager-left-margin' : ''"
                >
                    <IconButton
                        v-if="leftPager"
                        :aria="$t('common:modules.getFeatureInfo.buttonBack')"
                        :class-array="['pager-left', 'pager', 'btn-primary']"
                        :icon="leftIcon"
                        role="button"
                        :interaction="decreasePagerIndex"
                    />
                </div>
            </template>
            <!-- Slot Content for pager right -->
            <template
                #pager-right
            >
                <div
                    class="gfi-pager"
                    :class="!rightPager ? 'gfi-pager-right-margin' : ''"
                >
                    <IconButton
                        v-if="rightPager"
                        :aria="$t('common:modules.getFeatureInfo.buttonForward')"
                        :class-array="['pager-right', 'pager', 'btn-primary', 'd-flex', 'flex-row-reverse']"
                        :icon="rightIcon"
                        role="button"
                        :interaction="increasePagerIndex"
                    />
                </div>
            </template>
        </component>
    </div>
</template>


<style lang="scss" scoped>
@import "~variables";

    .gfi {
        color: $dark_blue;
        height: 100vh;
        overflow-x: auto
    }

    .gfi-pager {
        background-color: $menu-background-color;
    }

    .gfi-pager-left-margin {
        margin-left: 2.5rem
    }

    .gfi-pager-right-margin {
        margin-right: 2.5rem
    }
</style>
