<script>
import axios from "axios";
import Cluster from "ol/source/Cluster";
import {mapGetters, mapMutations, mapActions} from "vuex";
import {Vector} from "ol/layer.js";

import isObject from "../../../shared/js/utils/isObject";
import mutations from "../store/mutationsPrint";
import thousandsSeparator from "../../../shared/js/utils/thousandsSeparator";
import layerProvider from "../js/getVisibleLayer";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import InputText from "../../../shared/modules/inputs/components/InputText.vue";
import SwitchInput from "../../../shared/modules/checkboxes/components/SwitchInput.vue";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import BuildSpec from "../js/buildSpec";
import layerCollection from "../../../core/layers/js/layerCollection";
import SpinnerItem from "../../../shared/modules/spinner/components/SpinnerItem.vue";

/**
 * Tool to print a part of the map
 * @module modules/PrintMap
 * @vue-computed {Number} currentScale - The current scale that is set in the drop down.
 * @vue-computed {Number} dpiForPdf - The current dpi that is set in the drop down.
 * @vue-computed {Array} dpiList - The list of available dpis.
 * @vue-computed {Array} shownLayoutList - The list of available layouts.
 * @vue-computed {Array} shownFormatList - The list of available formats.
 * @vue-computed {String} outputTitle - The title for the file.
 */
export default {
    name: "PrintMap",
    components: {FlatButton, InputText, SwitchInput, SpinnerItem},
    data () {
        return {
            subtitle: "",
            textField: "",
            author: ""
        };
    },
    computed: {
        ...mapGetters("Modules/Print", [
            "additionalLayers",
            "autoAdjustScale",
            "capabilitiesFilter",
            "currentFormat",
            "currentLayout",
            "currentLayoutName",
            "currentMapScale",
            "currentScaleUrlParams",
            "defaultCapabilitiesFilter",
            "fileDownloads",
            "filename",
            "formatList",
            "is3d",
            "isGfiAvailable",
            "isGfiSelected",
            "isIncreased3DResolutionSelected",
            "isLegendAvailable",
            "isLegendSelected",
            "isScaleSelectedManually",
            "layoutMapInfo",
            "layoutList",
            "overviewmapLayerId",
            "printMapMarker",
            "printService",
            "printServiceId",
            "scaleList",
            "title",
            "visibleLayerList"
        ]),
        ...mapGetters("Maps", ["mode", "scale"]),
        ...mapGetters("Modules/GetFeatureInfo", ["currentFeature"]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu"
        ]),

        currentScale: {
            get () {
                return this.$store.state.Modules.Print.currentScale;
            },
            set (value) {
                this.setCurrentScale(value);
            }
        },
        dpiForPdf: {
            get () {
                return this.$store.state.Modules.Print.dpiForPdf;
            },
            set (value) {
                this.setDpiForPdf(value);
            }
        },
        dpiList: {
            get () {
                return this.$store.state.Modules.Print.dpiList;
            },
            set (value) {
                this.setDpiList(value);
            }
        },
        shownLayoutList: {
            get () {
                let filterArray = [];

                if (Object.keys(this.capabilitiesFilter).length > 0 &&
                    this.capabilitiesFilter.layouts &&
                    this.capabilitiesFilter.layouts.length > 0) {
                    filterArray = this.capabilitiesFilter.layouts;
                }
                else if (Object.keys(this.defaultCapabilitiesFilter).length > 0 &&
                    this.defaultCapabilitiesFilter.layouts &&
                    this.defaultCapabilitiesFilter.layouts.length > 0) {
                    filterArray = this.defaultCapabilitiesFilter.layouts;
                }
                return this.layoutList.filter(function (el) {
                    let res = filterArray.length === 0;

                    filterArray.forEach(function (layoutFilter) {
                        if (el.name.match(layoutFilter) !== null) {
                            res = true;
                        }
                        return !res;
                    });
                    return res;
                }, this);
            },
            set (value) {
                this.setLayoutList(value);
            }
        },
        shownFormatList: {
            get () {
                let filterArray = [];

                if (Object.keys(this.capabilitiesFilter).length > 0 &&
                    this.capabilitiesFilter.outputFormats &&
                    this.capabilitiesFilter.outputFormats.length > 0) {
                    filterArray = this.capabilitiesFilter.outputFormats;
                }
                else if (Object.keys(this.defaultCapabilitiesFilter).length > 0 &&
                    this.defaultCapabilitiesFilter.outputFormats &&
                    this.defaultCapabilitiesFilter.outputFormats.length > 0) {
                    filterArray = this.defaultCapabilitiesFilter.outputFormats;
                }
                return this.formatList.filter(function (el) {
                    return filterArray.indexOf(el.name) > -1 || filterArray.length === 0;
                }, this);
            },
            set (value) {
                this.setFormatList(value);
            }
        },
        outputTitle: {
            get () {
                return this.filename;
            },
            set (value) {
                this.setFilename(value);
                this.isValid(value);
            }
        }
    },
    watch: {
        scale: function (value) {
            this.setCurrentMapScale(value);
        },
        currentFeature: function (value) {
            if (value === null) {
                this.setIsGfiSelected(false);
            }
        },
        mode: function (value) {
            if (value === "3D") {
                this.setIs3d(true);
                this.togglePostrenderListener();
            }
            else {
                this.setIs3d(false);
            }
        },
        isIncreased3DResolutionSelected: function (value) {
            this.update3DResolutionScale(value);
        }
    },
    created () {
        this.setServiceId(this.printServiceId);
    },
    mounted () {
        if (this.mode === "3D") {
            this.setIs3d(true);
        }
        else {
            this.setIs3d(false);
        }
        this.$nextTick(() => {
            if (this.shownLayoutList.length === 0) {
                this.retrieveCapabilites();
                this.setCurrentMapScale(this.scale);
                this.togglePostrenderListener();
                this.updateCanvasByFeaturesLoadend(this.visibleLayerList);
                this.setIsScaleSelectedManually(false);
                this.setCurrentMapScale(this.scale);
                this.setIsIncreased3DResolutionSelected(false);
            }
        });

        this.setCurrentMapScale(this.scale);
    },
    unmounted () {
        this.setFileDownloads([]);
        this.togglePostrenderListener(false);
        this.shownLayoutList = [];
    },
    methods: {
        ...mapMutations("Modules/Print", Object.keys(mutations)),
        ...mapActions("Modules/Print", [
            "retrieveCapabilites",
            "togglePostrenderListener",
            "createMapFishServiceUrl",
            "startPrint",
            "startPrint3d",
            "getOptimalResolution",
            "updateCanvasLayer",
            "getAttributeInLayoutByName",
            "update3DResolutionScale"
        ]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Waits until the features of Vector layers are loaded and then renders the canvas again.
         * Cluster layer are considered.
         * @param {module:ol/layer/Base~BaseLayer[]} visibleLayerList A list which contains the visible layers.
         * @returns {void}
         */
        updateCanvasByFeaturesLoadend (visibleLayerList) {
            visibleLayerList.forEach(layer => {
                if (layer instanceof Vector) {
                    let layerSource = layer.getSource();

                    if (layer.getSource() instanceof Cluster) {
                        layerSource = layerSource.getSource();
                    }

                    layerSource.once("featuresloadend", () => {
                        if (this.mainMenu.currentComponent === "print" || this.secondaryMenu.currentComponent === "print") {
                            layerProvider.getVisibleLayer(this.printMapMarker);
                            this.updateCanvasLayer();
                            this.togglePostrenderListener();
                        }
                    });
                }
            });
        },

        /**
         * returns the "beautified" scale to be shown in the dropdown box
         * @param {Number} scale the scale to beautify
         * @returns {String} the beautified scale
         */
        returnScale (scale) {
            if (typeof scale !== "number") {
                return "";
            }
            else if (scale < 10000) {
                return String(scale);
            }
            return thousandsSeparator(scale, " ");
        },

        /**
         * if Scale is changed
         * @param {event} event the click event
         * @returns {void}
         */
        async scaleChanged (event) {
            const scale = parseInt(event.target.value, 10),
                resolution = {
                    "scale": scale,
                    "mapSize": mapCollection.getMap("2D").getSize(),
                    "printMapSize": this.layoutMapInfo
                };

            this.setIsScaleSelectedManually(true);
            this.getOptimalResolution(resolution);
            this.updateCanvasLayer();
            await mapCollection.getMap("2D").render();
        },

        /**
         * if Layout is changed
         * @param {String} value the chosen layout
         * @returns {void}
         */
        async layoutChanged (value) {
            this.resetLayoutParameter();
            this.setCurrentLayoutName(value);
            this.setCurrentLayout(this.layoutList.find(layout => layout.name === value));
            if (this.printService !== "plotservice") {
                this.getAttributeInLayoutByName("gfi");
                this.getAttributeInLayoutByName("legend");
            }
            this.updateCanvasLayer();
            await mapCollection.getMap("2D").render();
        },

        /**
        * resets the available attriubtes gfi and legend to the default parameters
        * @returns {void}
        */
        resetLayoutParameter () {
            this.setIsGfiAvailable(false);
            this.setIsLegendAvailable(false);
        },

        /**
         * Starts the print
         * @returns {void}
         */
        print () {
            const currentPrintLength = this.fileDownloads.filter(file => file.finishState === false).length;

            if (currentPrintLength <= 10) {
                const index = this.fileDownloads.length,
                    layoutAttributes = this.getLayoutAttributes(this.currentLayout, ["subtitle", "textField", "author", "overviewMap", "source"]);

                this.addFileDownload({
                    index: index,
                    title: this.title,
                    finishState: false,
                    downloadUrl: null,
                    filename: this.filename,
                    outputFormat: this.outputFormat
                });

                this.setPrintStarted(true);
                if (this.is3d) {
                    this.startPrint3d({
                        index,
                        getResponse: async (url, payload) => {
                            return axios.post(url, payload);
                        },
                        layoutAttributes
                    });
                }
                else {
                    this.startPrint({
                        index,
                        getResponse: async (url, payload) => {
                            return axios.post(url, payload);
                        },
                        layoutAttributes
                    });
                }
            }
            else {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.print.alertMessage")
                });
            }
        },

        /**
         * Downloads the pdf for print.
         * @param {Object} button the clicked button
         * @param {String} downloadUrl The url to the file.
         * @param {String} filename The file name.
         * @returns {void}
         */
        download (button, downloadUrl, filename) {
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (button.classList.contains("btn-primary")) {
                button.classList.remove("btn-primary");
                button.classList.add("btn-secondary");
            }
        },

        /**
         * validates the value of the outputFileTitle input field
         * @param {String} value - input value
         * @returns {void}
         */
        isValid (value) {
            const regex = /^[a-zA-Z\-_]+$/,
                valid = regex.test(value);

            if (!valid) {
                document.getElementById("outputFileTitleWarning").classList.remove("active");
                document.getElementById("outputFileTitle").classList.add("danger");

                document.getElementById("printBtn").disabled = true;
            }
            else {
                document.getElementById("outputFileTitleWarning").classList.add("active");
                document.getElementById("outputFileTitle").classList.remove("danger");
                document.getElementById("printBtn").disabled = false;
            }
        },

        /**
         * Checks if the layout has a certain attribute by its name.
         * @param {Object} layout - The selected layout.
         * @param {String} attributeName - The name of the attribute to be checked.
         * @returns {Boolean} True if it has otherwise false.
         */
        hasLayoutAttribute (layout, attributeName) {
            if (isObject(layout) && typeof attributeName === "string" && this.printService !== "plotservice") {
                return layout.attributes.some(attribute => {
                    return attribute.name === attributeName;
                });
            }
            return false;
        },

        /**
         * Gets the layout attributes by the given names.
         * @param {Object} layout - The selected layout.
         * @param {String[]} nameList - A list of attribute names.
         * @returns {Object} The layout attributes or an empty object.
         */
        getLayoutAttributes (layout, nameList) {
            const layoutAttributes = {};

            if (!isObject(layout) || !Array.isArray(nameList)) {
                return layoutAttributes;
            }
            nameList.forEach(name => {
                if (this.hasLayoutAttribute(layout, name)) {
                    if (name === "overviewMap") {
                        layoutAttributes[name] = {
                            "layers": [BuildSpec.buildTileWms(layerCollection.getLayerById(this.getOverviewmapLayerId()).getLayer(), this.dpiForPdf)]
                        };
                    }
                    else if (name === "source") {
                        layoutAttributes[name] = [];
                        this.visibleLayerList.forEach(layer => {
                            const foundRawLayer = rawLayerList.getLayerWhere({id: layer.get("id")});

                            if (foundRawLayer) {
                                layoutAttributes[name].push(foundRawLayer?.datasets[0].show_doc_url + foundRawLayer.datasets[0].md_id);
                            }
                        });
                        layoutAttributes[name] = layoutAttributes[name].join("\n");
                    }
                    else {
                        layoutAttributes[name] = this[name];
                    }
                }
            });
            return layoutAttributes;
        },

        /**
         * Gets a layer id depending on its layer visibility.
         * @returns {String} The layer id for overviewMap.
         */
        getOverviewmapLayerId () {
            const defaultLayerId = this.visibleLayerList[0].values_.id,
                visibleLayerId = this.visibleLayerList.filter(id => id.values_.id === this.overviewmapLayerId).map(val => val.values_.id).toString();

            if (this.overviewmapLayerId !== undefined && visibleLayerId !== "") {
                return visibleLayerId;
            }
            return defaultLayerId;
        },

        /**
         * Sets the subtitle to data's subtitle.
         * @param {String} subtitle the subtitle diplayed in print under title
         * @returns {void}
         */
        setSubtitle (subtitle) {
            this.subtitle = subtitle;
        },

        /**
         * Sets the author to data's author.
         * @param {String} author the author diplayed in print footer
         * @returns {void}
         */
        setAuthor (author) {
            this.author = author;
        },

        /**
         * Sets the textField to data's textField.
         * @param {String} textField the textField diplayed in print under the map
         * @returns {void}
         */
        setTextField (textField) {
            this.textField = textField;
        }
    }
};
</script>

<template lang="html">
    <div id="modules-print">
        <form
            id="printToolNew"
            class="form-horizontal"
            @submit.prevent="print"
        >
            <div>
                <InputText
                    :id="'docTitle'"
                    :label="$t('common:modules.print.titleLabel')"
                    :placeholder="$t('common:modules.print.titleLabel')"
                    :value="title"
                    :input="setTitle"
                />
            </div>
            <div
                v-if="hasLayoutAttribute(currentLayout, 'subtitle')"
            >
                <InputText
                    :id="subtitle"
                    :label="$t('common:modules.print.subtitleLabel')"
                    :placeholder="$t('common:modules.print.subtitleLabel')"
                    :value="subtitle"
                    :input="setSubtitle"
                    :max-length="'60'"
                />
            </div>
            <div
                v-if="hasLayoutAttribute(currentLayout, 'textField')"
                class="form-floating"
            >
                <div
                    class="form-floating mb-3"
                >
                    <textarea
                        id="textField"
                        type="text"
                        class="form-control"
                        maxLength="550"
                        :placeholder="$t('common:modules.print.textFieldLabel')"
                        @input="event => setTextField(event.target.value)"
                    />
                    <label for="textField">{{ $t("common:modules.print.textFieldLabel") }}</label>
                </div>
            </div>
            <div
                v-if="hasLayoutAttribute(currentLayout, 'author')"
            >
                <InputText
                    :id="author"
                    :label="$t('common:modules.print.authorLabel')"
                    :placeholder="$t('common:modules.print.authorLabel')"
                    :value="author"
                    :input="setAuthor"
                    :max-length="'60'"
                />
            </div>
            <div class="form-floating mb-3">
                <select
                    id="printLayout"
                    class="form-select"
                    :aria-label="$t('common:modules.print.layoutLabel')"
                    @change="layoutChanged($event.target.value)"
                >
                    <option
                        v-for="(layout, i) in shownLayoutList"
                        :key="i"
                        :value="layout.name"
                        :selected="layout.name === currentLayoutName"
                    >
                        {{ layout.name }}
                    </option>
                </select>
                <label for="printLayout">
                    {{ $t("common:modules.print.layoutLabel") }}
                </label>
            </div>
            <div class="form-floating mb-3">
                <select
                    id="printFormat"
                    class="form-select"
                    @change="setCurrentFormat($event.target.value)"
                >
                    <option
                        v-for="(format, i) in shownFormatList"
                        :key="i"
                        :value="format"
                        :selected="format === currentFormat"
                    >
                        {{ format }}
                    </option>
                </select>
                <label for="printFormat">
                    {{ $t("common:modules.print.formatLabel") }}
                </label>
            </div>
            <div
                v-if="dpiList.length > 0 && !is3d"
                class="form-floating mb-3"
            >
                <select
                    id="printDpi"
                    class="form-select"
                    @change="setDpiForPdf($event.target.value)"
                >
                    <option
                        v-for="(dpi, i) in dpiList"
                        :key="i"
                        :value="dpi"
                        :selected="dpi === dpiForPdf"
                    >
                        {{ dpi }}
                    </option>
                </select>
                <label for="printDpi">
                    {{ $t("common:modules.print.dpiLabel") }}
                </label>
            </div>
            <div
                v-if="!is3d"
                class="form-floating scale"
            >
                <select
                    id="printScale"
                    v-model="currentScale"
                    class="form-select"
                    @change="scaleChanged($event)"
                >
                    <option
                        v-for="(scale, i) in scaleList"
                        :key="i"
                        :value="scale"
                        :selected="scale === currentScale"
                    >
                        1 : {{ returnScale(scale) }}
                    </option>
                </select>
                <label for="printScale">
                    {{ $t("common:modules.print.scaleLabel") }}
                </label>
                <div class="row info mb-3 mt-2">
                    <span class="col-1 info-icon d-flex align-items-center">
                        <i class="bi-info-circle" />
                    </span>
                    <div class="col info-text ps-3">
                        {{ $t("common:modules.print.hintInfoScale") }}
                    </div>
                </div>
            </div>
            <div
                v-if="printService === 'plotservice'"
                class="form-group form-group-sm row"
            >
                <InputText
                    :id="'outputFileTitle'"
                    v-model="outputTitle"
                    :label="$t('common:modules.print.outputfileTitleLabel')"
                    :placeholder="$t('common:modules.print.outputfileTitleLabel')"
                />
                <small
                    id="outputFileTitleWarning"
                    class="offset-md-5 col-md-7 active"
                >
                    {{ $t("common:modules.print.validationWarning") }}
                </small>
            </div>
            <div
                v-if="!is3d"
                class="form-check form-switch mb-3 d-flex align-items-center"
            >
                <SwitchInput
                    :id="'autoAdjustScale'"
                    :aria="$t('common:modules.print.autoAdjustScale')"
                    :interaction="($event) => setAutoAdjustScale($event.target.checked)"
                    :label="$t('common:modules.print.autoAdjustScale')"
                    :checked="autoAdjustScale && !isScaleSelectedManually"
                />
            </div>
            <div
                v-for="(additionalLayer, i) in additionalLayers"
                :key="'additionalLayer_'+i"
            >
                <div class="form-check form-switch mb-3 d-flex align-items-center">
                    <SwitchInput
                        :id="'printLayer_'+additionalLayer.id"
                        :aria="additionalLayer.label"
                        :interaction="($event) => $event.target.checked ? setAdditionalLayerActive(additionalLayer.id) : setAdditionalLayerInactive(additionalLayer.id)"
                        :label="additionalLayer.label"
                        :checked="additionalLayer.active"
                    />
                </div>
            </div>
            <div
                v-if="isLegendAvailable"
            >
                <div class="form-check form-switch mb-3 d-flex align-items-center">
                    <SwitchInput
                        :id="'printLegend'"
                        :aria="$t('common:modules.print.withLegendLabel')"
                        :interaction="($event) => setIsLegendSelected($event.target.checked)"
                        :label="$t('common:modules.print.withLegendLabel')"
                        :checked="isLegendSelected"
                    />
                </div>
            </div>
            <div
                v-if="is3d"
            >
                <div class="form-check form-switch mb-3 d-flex align-items-center">
                    <SwitchInput
                        :id="'printBetterQuality'"
                        :aria="$t('common:modules.print.improveResolution')"
                        :interaction="($event) => setIsIncreased3DResolutionSelected($event.target.checked)"
                        :label="$t('common:modules.print.improveResolution')"
                        :checked="isIncreased3DResolutionSelected"
                    />
                </div>
            </div>
            <div
                v-if="isGfiAvailable"
            >
                <div class="form-check form-switch mb-3 d-flex align-items-center">
                    <SwitchInput
                        :id="'printGfi'"
                        :aria="$t('common:modules.print.withInfoLabel')"
                        :interaction="($event) => setIsGfiSelected($event.target.checked)"
                        :label="$t('common:modules.print.withInfoLabel')"
                        :disabled="currentFeature === null"
                        :checked="isGfiSelected"
                    />
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="col-md-12 d-flex justify-content-center">
                    <FlatButton
                        id="printBtn"
                        :aria-label="$t('common:modules.print.printLabel')"
                        :interaction="print"
                        :text="$t('common:modules.print.printLabel')"
                        :icon="'bi-printer'"
                    />
                </div>
            </div>
        </form>
        <div id="modules-print-downloads-container">
            <div
                v-for="file in fileDownloads"
                id="modules-print-download-container"
                :key="file.index"
                class="row"
            >
                <div class="col-3 modules-print-download-title-container">
                    <span
                        v-if="printService === 'plotservice'"
                        class="modules-print-download-title"
                    >
                        {{ file.filename + "." + file.outputFormat }}
                    </span>
                    <span
                        v-else
                        class="modules-print-download-title"
                    >
                        {{ file.title }}
                    </span>
                </div>
                <div class="col-2 modules-print-download-icon-container">
                    <SpinnerItem
                        v-if="!file.finishState"
                    />
                    <div
                        v-else
                        class="bootstrap-icon modules-print-download-icon"
                    >
                        <i class="bi-check-lg" />
                    </div>
                </div>
                <div class="col-7 modules-print-download-button-container">
                    <FlatButton
                        v-if="file.finishState"
                        :aria-label="$t('common:modules.print.downloadFile')"
                        :interaction="($event) => download($event.target, file.downloadUrl, file.filename)"
                        :text="$t('common:modules.print.downloadFile')"
                        :icon="'bi-download'"
                    />
                    <FlatButton
                        v-else
                        :aria-label="$t('common:modules.print.createDownloadFile')"
                        :text="$t('common:modules.print.createDownloadFile')"
                        :icon="'bi-download'"
                        disabled
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .info {
        max-width: fit-content;
        .info-icon {
            font-size: 1.5rem;
        }
        .info-text {
            font-size: $font-size-sm;
        }
    }

    .form-control:focus ~ label {
        color: $secondary;
    }

    #outputFileTitle.danger {
        border-color: red
    }
    #outputFileTitleWarning {
        color: red;
    }
    #outputFileTitleWarning.active {
        display: none;
    }
    #modules-print-downloads-container {
        margin-top: 30px;

        #modules-print-download-container {
            padding-left: 15px;
            margin-top: 10px;

            .modules-print-download-title-container {
                padding: 8px 0 0 0;
            }

            .modules-print-download-icon-container {
                margin: 5px 0 0 0;
            }

            .modules-print-download-icon {
                font-size: $font-size-lg;
                color: darkgreen;
            }
        }
    }
</style>
