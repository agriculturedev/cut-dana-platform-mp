<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import VectorLayer from "ol/layer/Vector.js";
import layerCollection from "../../../core/layers/js/layerCollection";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../shared/js/utils/isPhoneNumber.js";
import beautifyKey from "../../../shared/js/utils/beautifyKey";
import {isWebLink} from "../../../shared/js/utils/urlHelper";
import {isEmailAddress} from "../../../shared/js/utils/isEmailAddress";
import toBold from "../../../shared/js/utils/toBold";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";

/**
 * Feature Lister
 * @module modules/FeatureLister
 * @vue-data {String} defaultTabClass - The CSS-Class for the tab.
 * @vue-data {String} activeTabClass - The CSS-Class "active".
 * @vue-data {String} visibleVectorLayers - All visible vector layers.
 * @vue-data {String} supportedLayerTypes - "WFS", "OAF", "GeoJSON"
 * @vue-computed {String} themeTabClasses - The class for the current theme-tab.
 * @vue-computed {String} listTabClasses - The class for the current list-tab.
 * @vue-computed {String} detailsTabClasses - The class for the current details-tab.
 */
export default {
    name: "FeatureLister",
    components: {
        FlatButton
    },
    data () {
        return {
            defaultTabClass: "",
            activeTabClass: "active",
            disabledTabClass: "disabled",
            visibleVectorLayers: [],
            supportedLayerTypes: ["WFS", "OAF", "GeoJSON"]
        };
    },
    computed: {
        ...mapGetters("Modules/FeatureLister", [
            "maxFeatures",
            "layer",
            "layerListView",
            "featureCount",
            "shownFeatures",
            "featureListView",
            "featureDetailView",
            "selectedFeatureIndex",
            "featureProperties",
            "featureDetails",
            "headers"
        ]),
        themeTabClasses: function () {
            return this.layerListView ? this.activeTabClass : this.defaultTabClass;
        },
        listTabClasses: function () {
            if (this.featureListView) {
                this.sortItems();
                return this.activeTabClass;
            }
            if (this.featureDetailView) {
                return this.defaultTabClass;
            }
            return this.disabledTabClass;
        },
        detailsTabClasses: function () {
            if (this.featureDetailView) {
                return this.activeTabClass;
            }
            if (this.selectedFeatureIndex !== null) {
                return this.defaultTabClass;
            }
            return this.disabledTabClass;
        }
    },
    mounted () {
        this.$nextTick(() => {
            layerCollection.getOlLayers().forEach(async layer => {
                if (layer instanceof VectorLayer && this.supportedLayerTypes.includes(layer.get("typ"))) {
                    this.visibleVectorLayers.push(
                        {
                            name: layer.get("name"),
                            id: layer.get("id")
                        }
                    );
                }
            });
        });
    },
    unmounted () {
        this.resetToThemeChooser();
        this.removeHighlightFeature();
    },
    methods: {
        ...mapActions("Modules/FeatureLister", [
            "switchBackToList",
            "switchToList",
            "clickOnFeature",
            "hoverOverFeature",
            "switchToThemes",
            "switchToDetails",
            "showMore"
        ]),
        ...mapActions("Maps", ["removeHighlightFeature"]),
        ...mapMutations("Modules/FeatureLister", [
            "resetToThemeChooser"
        ]),
        beautifyKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        toBold,
        removeVerticalBar (value) {
            return value.replaceAll("|", "<br>");
        },
        /**
         * Sorts the table items according to the clicked table header.
         * @returns {void}
         */
        async sortItems () {
            const tableHeaders = await document.getElementsByClassName("feature-lister-list-table-th");

            try {
                if (tableHeaders?.length) {
                    for (const th_elem of tableHeaders) {
                        let asc = true;
                        const index = Array.from(th_elem.parentNode.children).indexOf(th_elem);

                        th_elem.addEventListener("click", () => {
                            const arr = [...th_elem.closest("table").querySelectorAll("tbody tr")].slice(1);

                            arr.sort((a, b) => {
                                let a_val = "",
                                    b_val = "";

                                if (a.children[index] !== undefined && b.children[index] !== undefined) {
                                    a_val = a.children[index].innerText;
                                    b_val = b.children[index].innerText;
                                }
                                return asc ? a_val.localeCompare(b_val) : b_val.localeCompare(a_val);
                            });
                            arr.forEach(elem => {
                                th_elem.closest("table").querySelector("tbody").appendChild(elem);
                            });
                            asc = !asc;
                        });
                    }
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }
};
</script>

<template lang="html">
    <div id="feature-lister">
        <ul class="nav nav-tabs">
            <li
                id="module-feature-lister-themeChooser"
                role="presentation"
                class="nav-item"
            >
                <a
                    href="#"
                    class="nav-link"
                    :class="themeTabClasses"
                    @click.prevent="switchToThemes()"
                >{{ $t("common:modules.featureLister.chooseTheme") }}</a>
            </li>
            <li
                id="module-feature-lister-list"
                role="presentation"
                class="nav-item"
            >
                <a
                    href="#"
                    class="nav-link"
                    :class="listTabClasses"
                    @click.prevent="switchBackToList()"
                >{{ $t("common:modules.featureLister.list") }}</a>
            </li>
            <li
                id="module-feature-lister-details"
                role="presentation"
                class="nav-item"
            >
                <a
                    href="#"
                    class="nav-link"
                    :class="detailsTabClasses"
                    @click.prevent="switchToDetails()"
                >{{ $t("common:modules.featureLister.details") }}</a>
            </li>
        </ul>
        <div
            v-if="layerListView"
            id="feature-lister-themes"
            class="feature-lister-themes panel panel-default"
        >
            <div
                id="feature-lister-themes-header"
                class="panel-heading"
            >
                {{ $t("common:modules.featureLister.visibleVectorLayers") }}
            </div>
            <ul
                v-for="layer in visibleVectorLayers"
                id="feature-lister-themes-ul"
                :key="'module-feature-lister-' + layer.id"
                class="nav flex-column"
            >
                <li
                    :id="'feature-lister-layer-' + layer.id"
                    class="nav-item"
                    role="presentation"
                >
                    <a
                        href="#"
                        class="nav-link"
                        @click.prevent="switchToList(layer)"
                    >{{ layer.name }}</a>
                </li>
            </ul>
        </div>
        <template v-if="featureListView">
            <div
                id="feature-lister-list-header"
                class="panel-heading"
            >
                <span>{{ layer.name }}</span>
            </div>
            <div
                id="feature-lister-list"
                class="panel panel-default feature-lister-list"
            >
                <div
                    class="table-responsive feature-lister-list-table-container"
                >
                    <table
                        id="feature-lister-list-table"
                        class="table  table-hover table-condensed table-bordered"
                    >
                        <tbody>
                            <tr class="feature-lister-list-table-tr">
                                <th
                                    v-for="(header, index) in headers"
                                    :key="'module-feature-lister-' + index"
                                    class="feature-lister-list-table-th"
                                >
                                    <span class="bi-sort-alpha-down" />
                                    {{ header.value }}
                                </th>
                            </tr>
                            <tr
                                v-for="(feature, index) in featureProperties"
                                :id="'module-feature-lister-feature-' + index"
                                :key="'module-feature-lister-' + index"
                                class="feature-lister-list-table-tr"
                                @click="clickOnFeature(index)"
                                @mouseover="hoverOverFeature(index)"
                                @focus="hoverOverFeature(index)"
                            >
                                <template v-if="index < shownFeatures">
                                    <td
                                        v-for="(property, i) in feature"
                                        :key="'module-feature-lister-' + i"
                                        class="feature-lister-list-table-td"
                                    >
                                        {{ property }}
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div
                    class="panel-footer feature-lister-list-footer"
                >
                    <FlatButton
                        id="module-feature-lister-show-more"
                        aria-label="$t('commonmodules.featureLister.more')"
                        type="button"
                        :text="$t('common:modules.featureLister.more')"
                        :icon="'bi-plus'"
                        :disabled="featureCount <= maxFeatures || shownFeatures === featureCount"
                        :interaction="() => showMore()"
                    />
                    <p
                        class="navbar-text feature-lister-list-message"
                    >
                        {{ $t("common:modules.featureLister.key", {shownFeatures, featureCount}) }}
                    </p>
                </div>
            </div>
        </template>
        <template v-if="featureDetailView">
            <div
                id="feature-lister-details-header"
                class="panel-heading"
            >
                <span> {{ $t("common:modules.featureLister.detailsOfSelected") }} </span>
            </div>
            <div
                id="feature-lister-details"
                class="panel panel-default feature-lister-details"
            >
                <ul
                    v-for="(feature, key) in featureDetails"
                    :key="'module-feature-lister-' + key"
                    class="list-group feature-lister-details-ul"
                >
                    <li class="list-group-item feature-lister-details-li">
                        <strong>
                            {{ beautifyKey(feature[0]) }}
                        </strong>
                    </li>
                    <li class="list-group-item feature-lister-details-li">
                        <p v-if="isWebLink(feature[1])">
                            <a
                                :href="feature[1]"
                                target="_blank"
                            >{{ feature[1] }}</a>
                        </p>
                        <p v-else-if="isPhoneNumber(feature[1])">
                            <a :href="getPhoneNumberAsWebLink(feature[1])">{{ feature[1] }}</a>
                        </p>
                        <p v-else-if="isEmailAddress(feature[1])">
                            <a :href="`mailto:${feature[1]}`">{{ feature[1] }}</a>
                        </p>
                        <p
                            v-else-if="typeof feature[1] === 'string' && feature[1].includes(';')"
                        >
                            <span v-html="toBold(feature[1], key)" />
                        </p>
                        <p
                            v-else-if="typeof feature[1] === 'string' && feature[1].includes('|')"
                        >
                            <span v-html="removeVerticalBar(feature[1])" />
                        </p>
                        <p
                            v-else-if="typeof feature[1] === 'string' && feature[1].includes('<br>')"
                        >
                            <span v-html="feature[1]" />
                        </p>
                        <p v-else>
                            {{ feature[1] }}
                        </p>
                    </li>
                </ul>
            </div>
        </template>
    </div>
</template>


<style lang="scss" scoped>
    @import "~variables";

#featureLister {
    width: fit-content;
    max-width: 90%;
}
.feature-lister-list-table-th {
    cursor: pointer;
    >span {
        float: left;
        width: 15px;
        color: $dark_grey;
    }
    >.feature-lister-list-table-th-sorted {
        color: $black;
    }
}
.feature-lister-list-table-container {
    border-left: 1px solid $light_grey !important;
    border-right: 1px solid $light_grey !important;
}
#feature-lister-list-table {
    overflow: auto;
}
.feature-lister-list-button {
    position: relative;
    right: 0;
}
.feature-lister-list-message {
    float: left;
    text-align: center;
    align-items: center;
}
.feature-lister-details-ul {
    max-height: 400px;
    overflow: auto;
    cursor: auto;
}
.feature-lister-list-table-td {
    height: 15px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.feature-lister-list-table-tr {
    cursor: pointer;
}
.feature-lister-details {
    display: block;
    margin-bottom: 0;
    max-height: 100%;
    overflow: auto;
}
.feature-lister-list {
    margin-bottom: 0;
    display: contents;
    overflow: auto;
}
.feature-lister-themes {
    width: 100%;
}
.panel-heading {
    background: $light_grey;
    color: $dark_grey;
    cursor: default;
    border-left: 1px solid $dark_grey;
    border-right: 1px solid $dark_grey;
    padding: 10px 15px;
    border-bottom: 1px solid transparent;
}
#feature-lister-themes-ul {
    .nav-item:hover {
        background-color: $light_grey;
    }
}

</style>
