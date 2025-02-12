<script>
import LegendSingleLayer from "../../legend/components/LegendSingleLayer.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import {isWebLink} from "../../../shared/js/utils/urlHelper";
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import LayerInfoContactButton from "../../layerTree/components/LayerInfoContactButton.vue";

/**
 * The Layer Information that gives the user information, links and the legend for a layer
 * @module modules/layerInformation/components/LayerInformation
 * @vue-data {String} activeTab - The active tab.
 * @vue-computed {Boolean} showAdditionalMetaData - Shows if additional meta data should be displayed.
 * @vue-computed {Boolean} showCustomMetaData - Shows if custom meta data should be displayed.
 * @vue-computed {Boolean} showPublication - Shows if publication should be displayed.
 * @vue-computed {Boolean} showPeriodicity - Shows if periodicity should be displayed.
 * @vue-computed {Boolean} showDownloadLinks - Shows if download lonks should be displayed.
 * @vue-computed {Boolean} showUrl - Shows if url should be displayed.
 * @vue-computed {Boolean} showAttachFile - Shows if file type needs to be attached for download.
 * @vue-computed {String} layerUrl - The layer URL.
 * @vue-computed {String} legendURL - The legend URL.
 * @vue-computed {String} contact - Contact information from pointOfContact if given otherwise from publisher from meta data information.
 * @vue-computed {Boolean} menuIndicator - Returns the menu the LayerInfo module is in.
 * @vue-computed {String} layerName - Name of the layer.
 */
export default {
    name: "LayerInformation",
    components: {
        LegendSingleLayer,
        AccordionItem,
        LayerInfoContactButton
    },
    data () {
        return {
            activeTab: "layerinfo-legend"
        };
    },
    computed: {
        ...mapGetters(["configJs"]),
        ...mapGetters("Modules/LayerInformation", [
            "abstractText",
            "customText",
            "datePublication",
            "dateRevision",
            "downloadLinks",
            "layerInfo",
            "legendAvailable",
            "metaURLs",
            "noMetadataLoaded",
            "periodicityKey",
            "showUrlGlobal",
            "pointOfContact",
            "publisher"
        ]),
        ...mapGetters("Modules/Legend", [
            "layerInfoLegend"
        ]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu"
        ]),
        showAdditionalMetaData () {
            return this.layerInfo.metaURL !== null && typeof this.abstractText !== "undefined" && this.abstractText !== this.noMetadataLoaded;
        },
        showCustomMetaData () {
            return this.customText;
        },
        showPublication () {
            return typeof this.datePublication !== "undefined" && this.datePublication !== null && this.datePublication !== "";
        },
        showRevision () {
            return typeof this.dateRevision !== "undefined" && this.dateRevision !== null && this.dateRevision !== "";
        },
        showPeriodicity () {
            return this.periodicityKey !== "" && this.periodicityKey !== null && this.periodicityKey !== undefined;
        },
        showDownloadLinks () {
            return this.downloadLinks !== null;
        },
        showUrl () {
            return (this.layerInfo.url && this.layerInfo.typ !== "SensorThings" && this.showUrlGlobal === true) || (this.layerInfo.url && this.layerInfo.typ !== "SensorThings" && this.showUrlGlobal === undefined && this.layerInfo.urlIsVisible !== false);
        },
        showAttachFile () {
            return this.downloadLinks && this.downloadLinks.length > 1;
        },
        layerUrl () {
            return Array.isArray(this.layerInfo.url) ? this.layerInfo.url.map((url, i) => ({url, typ: this.layerInfo.typ?.[i]})).map(this.getGetCapabilitiesUrl) : this.getGetCapabilitiesUrl({url: this.layerInfo.url, typ: this.layerInfo.typ});
        },
        legendURL  () {
            return this.layerInfo.legendURL;
        },
        layerTyp  () {
            return this.layerInfo.typ !== "GROUP" ? `${this.layerInfo.typ}-${this.$t("common:modules.layerInformation.addressSuffix")}` : this.$t("common:modules.layerInformation.addressSuffixes");
        },
        contact () {
            return this.pointOfContact || this.publisher || null;
        },
        menuIndicator () {
            return this.mainMenu.currentComponent === "layerInformation"
                ? "mainMenu"
                : "secondaryMenu";
        },
        layerName () {
            return this.menuIndicator === "mainMenu"
                ? this.mainMenu.navigation.currentComponent.props.name
                : this.secondaryMenu.navigation.currentComponent.props.name;
        }
    },

    created () {
        this.setConfigParams(this.configJs);
    },

    mounted () {
        if (this.configJs?.metaDataCatalogueId) {
            this.setMetaDataCatalogueId(this.configJs.metaDataCatalogueId);
        }
        this.createLegendForLayerInfo(this.layerInfo.id);
        if (!this.legendAvailable) {
            this.activeTab = "LayerInfoDataDownload";
        }
    },

    unmounted () {
        this.setLayerInfoLegend({});
    },

    methods: {
        ...mapActions("Modules/LayerInformation", ["setConfigParams"]),
        ...mapActions("Modules/Legend", ["createLegendForLayerInfo"]),
        ...mapMutations("Modules/LayerInformation", ["setMetaDataCatalogueId"]),
        ...mapMutations("Modules/Legend", ["setLayerInfoLegend"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),
        isWebLink,

        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab (tab) {
            return this.activeTab === tab ? true : null;
        },
        /**
         * set the current tab id after clicking.
         * @param {Object[]} evt the target of current click event
         * @returns {void}
         */
        setActiveTab (evt) {
            if (evt && evt.target && evt.target.hash) {
                this.activeTab = evt.target.hash.substring(1);
            }
        },
        /**
         * returns the classnames for the tab
         * @param {String} tab name of the tab depending on property activeTab
         * @returns {String} classNames of the tab
         */
        getTabPaneClasses (tab) {
            return {active: this.isActiveTab(tab), show: this.isActiveTab(tab), "tab-pane": true, fade: true};
        },
        /**
         * generates a GetCapabilities URL from a given service base address and type
         * @param {Object} param payload
         * @param {String} param.url service base URL
         * @param {String} param.typ service type (e.g., WMS)
         * @returns {String} GetCapabilities URL
         */
        getGetCapabilitiesUrl ({url, typ}) {
            const urlObject = new URL(url, location.href);

            if (typ !== "OAF") {
                urlObject.searchParams.set("SERVICE", typ);
                urlObject.searchParams.set("REQUEST", "GetCapabilities");
            }
            return urlObject.href;
        }
    }
};
</script>

<template lang="html">
    <div
        id="modules-layer-information"
    >
        <div
            class="mb-2 abstract"
            v-html="abstractText"
        />
        <br>
        <AccordionItem
            v-if="contact"
            id="layer-info-contact"
            :title="$t('common:modules.layerInformation.pointOfContact')"
            :is-open="false"
            :font-size="'font-size-base'"
            :coloured-header="false"
        >
            <p>
                {{ contact.name }}
            </p>
            <p
                v-for="(positionName) in contact.positionName"
                :key="positionName"
            >
                {{ positionName }}
            </p>
            <p>
                {{ contact.street + "  " + contact.postalCode }}
            </p>
            <p>
                {{ contact.city }}
            </p>
            <a
                :href="'mailto:' + contact.email"
            >
                {{ contact.email }}
            </a>
        </AccordionItem>
        <LayerInfoContactButton
            :layer-name="layerName"
            previous-component="layerInformation"
        />
        <div v-if="showAdditionalMetaData">
            <p
                v-for="url in metaURLs"
                :key="url"
                class="float-end"
            >
                <a
                    :href="url"
                    target="_blank"
                >
                    {{ $t("common:modules.layerInformation.additionalMetadata") }}
                </a>
            </p>
        </div>
        <br>
        <br>
        <p v-if="showPublication">
            {{ $t("common:modules.layerInformation.publicationCreation") }}: {{ datePublication }}
        </p>
        <p v-if="showRevision">
            {{ $t("common:modules.layerInformation.lastModified") }}: {{ dateRevision }}
        </p>
        <p v-if="showPeriodicity">
            {{ $t("common:modules.layerInformation.periodicityTitle") }}: {{ $t(periodicityKey) }}
        </p>
        <template
            v-if="showCustomMetaData"
        >
            <div
                v-for="(key, value) in customText"
                :key="key"
            >
                <p
                    v-if="isWebLink(key)"
                    class="mb-0"
                >
                    {{ value + ": " }}
                    <a
                        :href="value"
                        target="_blank"
                    >{{ key }}</a>
                </p>
                <p
                    v-else
                    class="mb-0"
                >
                    {{ value + ": " + key }}
                </p>
            </div>
        </template>
        <hr>
        <nav role="navigation">
            <ul class="nav nav-tabs">
                <li
                    v-if="legendAvailable"
                    value="layerinfo-legend"
                    class="nav-item"
                >
                    <a
                        href="#layerinfo-legend"
                        class="nav-link"
                        :class="{active: isActiveTab('layerinfo-legend') }"
                        @click="setActiveTab"
                    >{{ $t("common:modules.layerInformation.legend") }}
                    </a>
                </li>
                <li
                    v-if="showDownloadLinks"
                    value="LayerInfoDataDownload"
                    class="nav-item"
                >
                    <a
                        href="#LayerInfoDataDownload"
                        class="nav-link"
                        :class="{active: isActiveTab('LayerInfoDataDownload') }"
                        @click="setActiveTab"
                    >{{ $t("common:modules.layerInformation.downloadDataset") }}
                    </a>
                </li>
                <li
                    v-if="showUrl"
                    value="url"
                    class="nav-item"
                >
                    <a
                        href="#url"
                        class="nav-link"
                        :class="{active: isActiveTab('url') }"
                        @click="setActiveTab"
                    >{{ layerTyp }}
                    </a>
                </li>
            </ul>
        </nav>

        <div class="tab-content">
            <div
                v-if="legendAvailable"
                id="layerinfo-legend"
                :class="getTabPaneClasses('layerinfo-legend')"
                :show="isActiveTab('layerinfo-legend')"
            >
                <LegendSingleLayer
                    v-if="legendURL !== 'ignore'"
                    :legend-obj="layerInfoLegend"
                />
            </div>
            <div
                id="LayerInfoDataDownload"
                class="row"
                :class="getTabPaneClasses('LayerInfoDataDownload')"
                :show="isActiveTab('LayerInfoDataDownload')"
                :type="String('LayerInfoDataDownload')"
            >
                <div class="col-lg-7">
                    <ul
                        v-if="showDownloadLinks"
                        class="pt-5"
                    >
                        <li
                            v-for="downloadLink in downloadLinks"
                            :key="downloadLink.linkName"
                        >
                            <a
                                :href="downloadLink.link"
                                target="_blank"
                            >
                                {{ $t(downloadLink.linkName) }}
                            </a>
                        </li>
                    </ul>
                </div>
                <div
                    v-if="(showAttachFile)"
                    class="col-lg-5 pt-5"
                >
                    <span class="bold">{{ $t(("common:modules.layerInformation.attachFileMessage")) }}</span>
                </div>
            </div>
            <div
                v-if="showUrl"
                id="url"
                :show="isActiveTab('url')"
                :class="getTabPaneClasses('url')"
                :type="String('url')"
            >
                <div
                    v-if="Array.isArray(layerInfo.url)"
                    class="pt-5"
                >
                    <ul
                        v-for="(layerInfoUrl, i) in layerInfo.url"
                        :key="layerInfoUrl"
                    >
                        {{ layerInfo.layerNames[i] }}
                        <li>
                            <a
                                :href="layerUrl"
                                target="_blank"
                            >
                                {{ layerInfoUrl }}
                            </a>
                        </li>
                    </ul>
                </div>
                <div
                    v-else
                    class="pt-5"
                >
                    <ul>
                        <li>
                            <a
                                :href="layerUrl"
                                target="_blank"
                            >
                                {{ layerInfo.url }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    hr {
        margin: 15px 0 10px 0;
    }

    .abstract {
        max-height: 40vH;
        overflow-y: auto;
    }

    .abstract > p {
        font-size: $font-size-base;
    }

    .layerInformation {
        position: absolute;
        overflow: unset;
        top: 20px;
        right: 60px;
        max-width:600px;
        width: 45vw;
        margin: 0 10px 30px 10px;
        z-index: 1010;
        background-color: $white;
        box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.176);
        border: 1px solid $light_grey;

        @include media-breakpoint-down(sm) {
            inset: 12px auto auto 0;
            max-width:750px;
            width: 95vw;
            max-height: 80vh;
        }
    }

    .header {
        padding: 10px 10px 5px 10px;
        border-bottom: 1px solid $light_grey;
        cursor: move;
    }
    .bi-x-lg {
        &:hover {
            opacity: 0.7;
            cursor: pointer;
        }
    }

    .nav-tabs {
        display: flex;
        flex-wrap: nowrap;
        >li {
            font-size: $font-size-base;
            >a {
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
    }
    .tab-content {
        .tab-pane {
            >ul {
                >li {
                    >a {
                        font-size: $font-size-base;
                        text-overflow: ellipsis;
                        display: inline-block;
                        max-width: 95%;
                        overflow: hidden;
                    }
                }
            }
        }
        #layerinfo-legend {
            max-width: 95%;
            overflow: auto;
        }
    }

    .mb-2 {
        margin-bottom: 2rem;
    }

    .dropdown-toggle {
        width: 100%;
    }

    .dropdown-menu {
        width: 100%;
        a.active {
            background-color: $accent_active;
            color: white;
        }
        a:hover {
            background-color: $accent_hover;
        }
    }

    .pt-5 {
        padding-top: 5px;
    }

</style>
