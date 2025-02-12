<script>
import {Pointer} from "ol/interaction.js";
import crs from "@masterportal/masterportalapi/src/crs";
import {mapGetters, mapActions, mapMutations} from "vuex";
import mutations from "../store/mutationsCoordToolkit";
import NavTab from "../../../shared/modules/tabs/components/NavTab.vue";
import InputText from "../../../shared/modules/inputs/components/InputText.vue";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import {Toast} from "bootstrap";
import initProjections from "../../../shared/js/utils/initProjections";

/**
 * Toolkit to access coordinates on the map or search for coordinates.
 * @module modules/coordToolkit/components/CoordToolkit
 * @vue-data {Object} eventHandler - The Cesium Event Handler.
 */
export default {
    name: "CoordToolkit",
    components: {
        NavTab,
        InputText,
        FlatButton
    },
    data () {
        return {
            eventHandler: null
        };
    },
    computed: {
        ...mapGetters("Modules/CoordToolkit", [
            "active",
            "coordinatesEasting",
            "coordinatesEastingExample",
            "coordInfo",
            "coordinatesNorthing",
            "coordinatesNorthingExample",
            "currentProjection",
            "delimiter",
            "eastingNoCoord",
            "eastingNoMatch",
            "getEastingError",
            "getLabel",
            "getNorthingError",
            "height",
            "heightLayer",
            "heightLayerId",
            "heightLayerInfo",
            "mode",
            "northingNoCoord",
            "northingNoMatch",
            "projections",
            "selectPointerMove",
            "showCopyButtons"
        ]),
        ...mapGetters("Maps", {
            projection: "projection",
            clickCoordinate: "clickCoordinate",
            mapMode: "mode"
        }),
        ...mapGetters(["isMobile", "namedProjections", "uiStyle"]),
        eastingNoCoordMessage: function () {
            if (this.currentProjection.projName !== "longlat") {
                return this.$t("common:modules.coordToolkit.errorMsg.noCoord", {valueKey: this.$t(this.getLabel("eastingLabel"))});
            }
            return this.$t("common:modules.coordToolkit.errorMsg.hdmsNoCoord", {valueKey: this.$t(this.getLabel("eastingLabel"))});
        },
        northingNoCoordMessage: function () {
            if (this.currentProjection.projName !== "longlat") {
                return this.$t("common:modules.coordToolkit.errorMsg.noCoord", {valueKey: this.$t(this.getLabel("northingLabel"))});
            }
            return this.$t("common:modules.coordToolkit.errorMsg.hdmsNoCoord", {valueKey: this.$t(this.getLabel("northingLabel"))});
        },
        northingNoMatchMessage: function () {
            if (this.currentProjection.projName !== "longlat") {
                return this.$t("common:modules.coordToolkit.errorMsg.noMatch", {valueKey: this.$t(this.getLabel("northingLabel"))});
            }
            return this.$t("common:modules.coordToolkit.errorMsg.hdmsNoMatch", {valueKey: this.$t(this.getLabel("northingLabel"))});
        },
        eastingNoMatchMessage: function () {
            if (this.currentProjection.projName !== "longlat") {
                return this.$t("common:modules.coordToolkit.errorMsg.noMatch", {valueKey: this.$t(this.getLabel("eastingLabel"))});
            }
            return this.$t("common:modules.coordToolkit.errorMsg.hdmsNoMatch", {valueKey: this.$t(this.getLabel("eastingLabel"))});
        }
    },
    watch: {
        /**
         * Allows switching between 2D and 3D when the tool is open.
         * @returns {void}
         */
        mapMode () {
            this.setSupplyCoordInactive();
            this.removeInputActions();
            this.setSupplyCoordActive();
        },
        /**
         * Watches for changes of clicked coordinates.
         * @returns {void}
         */
        clickCoordinate: {
            handler () {
                if (this.mode !== "search") {
                    this.positionClicked();
                }
            },
            deep: true
        }
    },
    unmounted () {
        this.removeMarker();
        this.resetErrorMessages("all");
        this.resetValues();
        this.setSupplyCoordInactive();
        this.removeInputActions();
        this.unregisterListener({
            type: "click",
            listener: "Modules/CoordToolkit/positionClicked",
            listenerType: "dispatch",
            root: true
        });
    },
    mounted () {
        this.initProjectionsInCoordToolkit(crs, this.projections, this.namedProjections, this.currentProjection);
        this.setExample();
        this.setMode("supply");
        this.setSupplyCoordActive();
        this.setFocusToFirstControl();
        if (this.isMobile === true) {
            this.registerListener({
                type: "click",
                listener: "Modules/CoordToolkit/positionClicked",
                listenerType: "dispatch",
                root: true
            });
        }
        /**
         * Do this in next tick, only then heightLayerId is in state
         */
        this.$nextTick(() => {
            if (this.heightLayerId !== null) {
                this.initHeightLayer();
            }
        });
    },
    methods: {
        ...mapMutations("Modules/CoordToolkit", Object.keys(mutations)),
        ...mapActions("Modules/CoordToolkit", [
            "checkPosition",
            "changedPosition",
            "setFirstSearchPosition",
            "positionClicked",
            "removeMarker",
            "searchCoordinate",
            "validateInput",
            "newProjectionSelected",
            "initHeightLayer"
        ]),
        ...mapActions("Maps", ["addInteraction", "registerListener", "removeInteraction", "unregisterListener"]),
        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs.coordSystemField) {
                    this.$refs.coordSystemField.focus();
                }
            });
        },
        /**
         * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
         * @returns {void}
         */
        initProjectionsInCoordToolkit () {
            const projectionsObj = initProjections(crs, this.projections, this.namedProjections, this.currentProjection);

            if (projectionsObj?.currentProjection) {
                this.setCurrentProjection(projectionsObj.currentProjection);
            }

            if (projectionsObj?.projections) {
                this.setProjections(projectionsObj.projections);
            }
        },
        /**
         * Removes pointer-move-handler and interaction from map.
         * @returns {void}
         */
        setSupplyCoordInactive () {
            if (this.selectPointerMove !== null) {
                this.setUpdatePosition(true);
                this.removeInteraction(this.selectPointerMove);
                this.setSelectPointerMove(null);
            }
            if (this.mapMode === "3D" && this.eventHandler && typeof this.eventHandler.removeInputAction === "function") {
                this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
        },
        /**
         * Adds pointer-move-handler and interaction to map.
         * @returns {void}
         */
        setSupplyCoordActive () {
            if (this.selectPointerMove === null) {
                this.setMapProjection(this.projection);
                this.createInteraction();
                this.setPositionMapProjection(this.clickCoordinate);
                this.changedPosition();
            }
        },
        /**
         * Called if selection of projection changed. Sets the current projection to state and changes the position.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            if (event.target.value) {
                this.newProjectionSelected(event.target.value);
                if (this.mode === "search") {
                    this.validateInput(this.coordinatesEasting);
                    this.validateInput(this.coordinatesNorthing);
                }
            }
        },
        /**
         * Adds interaction pointermove to map.
         * @returns {void}
         */
        createInteraction () {
            if (this.mapMode === "2D") {
                const pointerMove = new Pointer(
                    {
                        handleMoveEvent: function () {
                            this.checkPosition();
                        }.bind(this)
                    },
                    this
                );

                this.setSelectPointerMove(pointerMove);
                this.addInteraction(pointerMove);
            }
            else if (this.mapMode === "3D") {
                this.eventHandler = new Cesium.ScreenSpaceEventHandler(mapCollection.getMap("3D").getCesiumScene().canvas);
                this.eventHandler.setInputAction(this.positionClicked, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.eventHandler.setInputAction(this.checkPosition, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
        },
        removeInputActions () {
            if (this.eventHandler) {
                this.eventHandler.destroy();
            }
        },
        /**
         * Returns true, if given checkboxId is equals curent mode in state.
         * @param {String} checkboxId "supply" or "search"
         * @returns {Boolean} true, if given checkboxId is equals curent mode in state
         */
        isEnabled (checkboxId) {
            return this.mode === checkboxId;
        },
        /**
         * Toggles the mode "supply" or "search".
         * @param {String} newMode "supply" or "search"
         * @returns {void}
         */
        changeMode (newMode) {
            if (newMode === "search") {
                this.setMode(newMode);
                this.setSupplyCoordInactive();
                this.setFirstSearchPosition();
            }
            else {
                this.setMode(newMode);
                this.resetErrorMessages("all");
                this.setSupplyCoordActive();
            }
        },
        /**
         * If curent mode is "search" input is validated.
         * @param {Object} value value of input
         * @param {Object} coordinatesValue value of the field
         * @returns {void}
         */
        onInputEvent (value, coordinatesValue) {
            if (this.mode === "search") {
                coordinatesValue.value = value;
                this.validateInput(coordinatesValue);
            }
        },
        /**
         * Returns the className for the easting input field. Special Handling because fields positions are transformed.
         * @returns {String} the className for the easting input field
         */
        getClassForEasting () {
            const eastingError = this.eastingNoCoord || this.eastingNoMatch,
                northingError = this.northingNoCoord || this.northingNoMatch;
            let clazz = "";

            if (this.currentProjection.projName === "longlat") {
                if (!northingError && !eastingError) {
                    clazz = "eastingToBottomNoError";
                }
                else if (eastingError && !northingError) {
                    clazz = "eastingToBottomNoError";
                }
                else if (!eastingError && northingError) {
                    clazz = "eastingToBottomOneError";
                }
                else {
                    clazz = "eastingToBottomTwoErrors";
                }
            }
            return clazz;
        },
        /**
         * Returns the className for the northing input field. Special Handling because fields positions are transformed.
         * @returns {String} the className for the northing input field
         */
        getClassForNorthing () {
            const eastingError = this.eastingNoCoord || this.eastingNoMatch,
                northingError = this.northingNoCoord || this.northingNoMatch;
            let clazz = "";

            if (this.currentProjection.projName === "longlat") {

                if (!northingError && !eastingError) {
                    clazz = "northingToTopNoError";
                }
                else if (!northingError && eastingError) {
                    clazz = "northingToTopEastingError";
                }
                else if (northingError && !eastingError) {
                    clazz = "northingToTopNoError";
                }
                else if (this.eastingNoCoord) {
                    clazz = "northingToTopTwoErrorsEastNoValue";
                }
                else {
                    clazz = "northingToTopTwoErrors";
                }
            }
            return clazz;
        },
        /**
         * Returns true, if uiStyle is not SIMPLE or TABLE.
         * @returns {Boolean} true, if is default style
         */
        isDefaultStyle () {
            return this.uiStyle !== "SIMPLE" && this.uiStyle !== "TABLE";
        },
        /**
         * Returns true, if heightLayerInfo is configured.
         * @returns {Boolean} true, if is configured
         */
        isHeightLayerInfo () {
            return typeof this.heightLayerInfo === "string";
        },
        /**
         * Returns true, if coordInfo is configured.
         * @returns {Boolean} true, if is configured
         */
        isCoordInfo () {
            return this.coordInfo !== null;
        },
        /**
         * Copies the coordinates to clipboard, delimited by limiter from state.
         * @param {Array} ids of the input-fields to get the coordinate values from
         * @returns {void}
         */
        copyCoords (ids) {
            let values = [];

            ids.forEach(id => {
                const el = this.$refs[id];

                if (el) {
                    values.push(el.value);
                }
            });
            if (this.currentProjection.projName === "longlat") {
                // reverted, because longlat-fields are swapped
                values = values.reverse();
            }

            if (Array.isArray(values)) {
                let toCopy = "";

                values.forEach(coord => {
                    toCopy += coord;
                    toCopy += this.delimiter;
                });
                if (toCopy.length > 0) {
                    toCopy = toCopy.substring(0, toCopy.length - 1);
                }
                navigator.clipboard.writeText(toCopy);
                const toast = new Toast(this.$refs.copyCoordsToast);

                toast.show();
            }
            else {
                console.warn("Cannot copy coordinates to clipboard, coordinates:", values);
            }
        },
        /**
         * Returns true, if current projection is selected.
         * @param {Object} projection the projection
         * @returns {Boolean|null} true, if current projection is selected, else null
         */
        isCurrentProjectionSelected (projection) {
            if (projection.id === this.currentProjection.id) {
                return true;
            }
            return null;
        }
    }
};
</script>

<template lang="html">
    <div id="coord-toolkit">
        <form
            class="form-horizontal"
            role="form"
        >
            <ul
                id="layer-slider-tabs"
                class="nav nav-tabs nav-justified"
                role="tablist"
            >
                <NavTab
                    :id="'supply-coord-tab'"
                    :active="true"
                    :target="'#supply-coord-pane'"
                    :label="'common:modules.coordToolkit.supply'"
                    :interaction="() => changeMode('supply')"
                />
                <NavTab
                    :id="'search-by-coord-tab'"
                    :active="false"
                    :target="'#search-by-coord-pane'"
                    :label="'common:modules.coordToolkit.search'"
                    :interaction="() => changeMode('search')"
                />
            </ul>
            <p
                v-if="isCoordInfo()"
                class="font-bold mb-3 mt-3"
            >
                {{ $t("common:modules.coordToolkit.postionCoordinates") }}
            </p>
            <div
                v-if="isEnabled('supply') && !isMobile && showCopyButtons"
                class="d-flex justify-content-between mb-3"
            >
                {{ $t("common:modules.coordToolkit.coordsPair") + ":   " + coordinatesEasting.value + ", " + coordinatesNorthing.value }}
                <button
                    id="copyCoordsPairBtn"
                    type="button"
                    class="btn btn-outline-default copy px-3"
                    :title="$t(`common:modules.coordToolkit.copyCoordsBtn`)"
                    @click="copyCoords(['coordinatesEastingField', 'coordinatesNorthingField'])"
                >
                    <span
                        class="bootstrap-icon"
                        aria-hidden="true"
                    >
                        <i class="bi-files" />
                    </span>
                </button>
            </div>
            <div :class="getClassForEasting()">
                <InputText
                    :id="'coordinatesEastingField'"
                    ref="coordinatesEastingField"
                    :value="coordinatesEasting.value"
                    :label="$t(getLabel('eastingLabel'))"
                    :placeholder="isEnabled('search') ? $t('common:modules.coordToolkit.exampleAcronym') + coordinatesEastingExample : ''"
                    :input="(value) => onInputEvent(value, coordinatesEasting)"
                    :readonly="isEnabled('supply')"
                    :class-obj="{ inputError: getEastingError }"
                >
                    <div
                        v-if="isEnabled('supply') && !isMobile && showCopyButtons"
                        class="copyBtn"
                    >
                        <button
                            id="copyEastingBtn"
                            type="button"
                            class="btn btn-outline-default inside px-3"
                            :title="$t(`common:modules.coordToolkit.copyCoordBtn`, {value: $t(getLabel('eastingLabel'))})"
                            @click="copyCoords(['coordinatesEastingField'])"
                        >
                            <span
                                class="bootstrap-icon"
                                aria-hidden="true"
                            >
                                <i class="bi-files" />
                            </span>
                        </button>
                    </div>
                </InputText>
                <transition name="fade">
                    <p
                        v-if="eastingNoCoord"
                        class="error-text mb-3"
                    >
                        {{ eastingNoCoordMessage }}
                    </p>
                </transition>
                <transition name="fade">
                    <p
                        v-if="eastingNoMatch"
                        class="error-text mb-3"
                    >
                        {{ eastingNoMatchMessage }}
                        {{ $t("common:modules.coordToolkit.errorMsg.example") + coordinatesEastingExample }}
                    </p>
                </transition>
            </div>
            <div :class="getClassForNorthing()">
                <InputText
                    :id="'coordinatesNorthingField'"
                    ref="coordinatesNorthingField"
                    :label="$t(getLabel('northingLabel'))"
                    :placeholder="isEnabled('search') ? $t('common:modules.coordToolkit.exampleAcronym') + coordinatesNorthingExample : ''"
                    :value="coordinatesNorthing.value"
                    :input="(value) => onInputEvent(value, coordinatesNorthing)"
                    :readonly="isEnabled('supply')"
                    :class-obj="{ inputError: getNorthingError }"
                >
                    <div
                        v-if="isEnabled('supply') && !isMobile && showCopyButtons"
                        class="copyBtn"
                    >
                        <button
                            id="copyNorthingBtn"
                            type="button"
                            class="btn btn-outline-default inside px-3"
                            :title="$t(`common:modules.coordToolkit.copyCoordBtn`, {value: $t(getLabel('northingLabel'))})"
                            @click="copyCoords(['coordinatesNorthingField'])"
                        >
                            <span
                                class="bootstrap-icon"
                                aria-hidden="true"
                            >
                                <i class="bi-files" />
                            </span>
                        </button>
                    </div>
                </InputText>
                <p
                    v-if="northingNoCoord"
                    class="error-text"
                >
                    {{ northingNoCoordMessage }}
                </p>
                <p
                    v-if="northingNoMatch"
                    class="error-text"
                >
                    {{ northingNoMatchMessage }}
                    <br>
                    {{ $t("common:modules.coordToolkit.errorMsg.example") + coordinatesNorthingExample }}
                </p>
            </div>
            <div class="form-floating mb-3">
                <select
                    id="coordSystemField"
                    ref="coordSystemField"
                    class="form-select"
                    @change="selectionChanged($event)"
                >
                    <option
                        v-for="(projection, i) in projections"
                        :key="i"
                        :value="projection.id"
                        :SELECTED="isCurrentProjectionSelected(projection)"
                    >
                        {{ projection.title ? projection.title : projection.name }}
                    </option>
                </select>
                <label
                    for="coordSystemField"
                >{{ $t("common:modules.coordToolkit.coordSystemField") }}</label>
            </div>
            <p
                v-if="isEnabled('supply') && isCoordInfo()"
                class="font-bold mb-3"
            >
                {{ $t("common:modules.coordToolkit.heightLabel") }}
            </p>
            <div v-if="isEnabled('supply') && (heightLayer !== null || mapMode === '3D')">
                <InputText
                    :id="'coordinatesHeightLabel'"
                    :label="$t('common:modules.coordToolkit.heightLabel')"
                    :value="$t(height)"
                    :readonly="true"
                    :placeholder="$t('common:modules.coordToolkit.heightLabel')"
                />
            </div>
            <div
                v-if="isEnabled('search')"
            >
                <div class="d-flex justify-content-center mb-3">
                    <FlatButton
                        :id="'searchByCoordBtn'"
                        :text="$t('common:modules.coordToolkit.searchBtn')"
                        :icon="'bi-search'"
                        :interaction="() => searchCoordinate(coordinatesEasting, coordinatesNorthing)"
                        :disabled="getEastingError || getNorthingError || !coordinatesEasting.value || !coordinatesNorthing.value"
                    />
                </div>
            </div>
            <div
                v-if="isDefaultStyle()"
            >
                <div
                    id="accordionFlushCoord"
                    class="accordion accordion-flush"
                >
                    <div class="accordion-item">
                        <h2
                            id="flush-heading-coord"
                            class="accordion-header"
                        >
                            <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapse-coord"
                                aria-expanded="false"
                                aria-controls="collapse-coord"
                            >
                                <i class="bi-info-circle-fill me-2" />
                                {{ $t("common:modules.coordToolkit.info") }}
                            </button>
                        </h2>
                        <div
                            id="collapse-coord"
                            class="accordion-collapse collapse"
                            aria-labelledby="flush-headingOne"
                            data-bs-parent="#accordionFlushExample"
                        >
                            <div class="accordion-body">
                                <span v-if="isEnabled('supply') && (heightLayer !== null || mapMode === '3D') && isHeightLayerInfo()">
                                    <span v-if="heightLayer !== null && mapMode === '2D'">
                                        {{ heightLayerInfo }}
                                        <br>
                                    </span>
                                    <hr>
                                </span>
                                {{ $t("common:modules.coordToolkit.influenceFactors") }}
                                <div
                                    v-if="isCoordInfo()"
                                >
                                    <hr>
                                    <p class="mb-2">
                                        {{ coordInfo?.title + ":" }}
                                    </p>
                                    <li
                                        v-for="explanation in coordInfo?.explanations"
                                        :key="explanation"
                                    >
                                        {{ explanation }}
                                    </li>
                                    <br>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
            <div
                ref="copyCoordsToast"
                class="toast align-items-center"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div class="d-flex">
                    <div class="toast-body">
                        {{ $t("common:modules.coordToolkit.coordsCopied") }}
                    </div>
                    <button
                        type="button"
                        class="btn-close me-2 m-auto"
                        data-bs-dismiss="toast"
                        aria-label="Close"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

    @include media-breakpoint-down(md) {
        .checkbox-container .form-inline {
            font-size: $font-size-base;
        }
    }
    .radio-container{
        display: flex;
        justify-content: space-around;
        label{
            margin-left: 5px;
        }
        input{
            margin-left: 10px;
        }
    }
    .enabled {
        font-weight: bold;
    }
    .error-text {
        font-size: 85%;
        color: $light_red;
    }
    .hint {
        text-align:center;
        color: $black;
        transition: color 0.35s;
        i {
            color: #198754;
            font-size: $font_size_huge;
        }
    }
    .form-control[readonly] {
        background-color: $light-grey;
    }
    .inside {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        border: none;
        box-shadow: none;
        color: $black;
    }
    .copy {
        border: none;
        box-shadow: none;
        color: $black;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>

