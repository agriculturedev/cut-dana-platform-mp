<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import layerFactory from "../../../core/layers/js/layerFactory";
import sortBy from "../../../shared/js/utils/sortBy";
import LayerCheckBox from "../../layerTree/components/LayerCheckBox.vue";
import SearchBar from "../../searchBar/components/SearchBar.vue";
import LayerSelectionTreeNode from "./LayerSelectionTreeNode.vue";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";

/**
 * Layer Selection
 * @module modules/LayerSelection
 * @vue-data {Number} currentComponentSide - The layer id for the select all checkbox.
 * @vue-data {Number} selectAllConfId - The layer id for the select all checkbox.
 * @vue-data {Array} selectAllConfigs - The layer configurations for select all checkbox.
 */
export default {
    name: "LayerSelection",
    components: {
        LayerCheckBox,
        SearchBar,
        LayerSelectionTreeNode,
        IconButton
    },
    data () {
        return {
            selectAllConfId: -1,
            selectAllConfigs: [],
            activeCategory: null
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", ["addLayerButtonSearchActive", "currentSide", "showAllResults", "showInTree"]),
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters(["activeOrFirstCategory", "allCategories", "portalConfig"]),
        ...mapGetters("Modules/LayerSelection", ["visible", "subjectDataLayerConfs", "baselayerConfs", "lastFolderNames", "layerInfoVisible", "highlightLayerId"]),
        categorySwitcher () {
            return this.portalConfig?.tree?.categories;
        },
        /**
         * @return {string|null|false} False: to hide the headline; null: using i18n text; none empty string to show that one
         */
        categoryBackgroundsHeaderText () {
            if (this.portalConfig?.tree?.hideBackgroundsHeader === true) {
                return false;
            }

            if (this.portalConfig?.tree?.backgroundsHeaderText
                && typeof this.portalConfig.tree.backgroundsHeaderText === "string"
                && this.portalConfig.tree.backgroundsHeaderText > ""
            ) {
                return this.portalConfig.tree.backgroundsHeaderText;
            }

            return null;
        },
        /**
         *  @return {string|null|false} False: to hide the headline; null: using i18n text; none empty string to show that one
         */
        datalayerHeaderText () {
            if (this.portalConfig?.tree?.hideDatalayerHeader === true) {
                return false;
            }

            if (this.portalConfig?.tree?.datalayerHeaderText
                && typeof this.portalConfig.tree.datalayerHeaderText === "string"
                && this.portalConfig.tree.datalayerHeaderText > ""
            ) {
                return this.portalConfig.tree.datalayerHeaderText;
            }

            return null;
        }
    },
    unmounted () {
        if (!this.layerInfoVisible) {
            this.reset();
        }
        this.setHighlightLayerId(null);
    },
    created () {
        this.activeCategory = this.activeOrFirstCategory?.key;
        this.provideSelectAllProps();
        this.setLayerInfoVisible(false);
    },
    methods: {
        ...mapActions(["changeCategory"]),
        ...mapActions("Modules/LayerSelection", ["navigateBack", "navigateForward", "reset"]),
        ...mapMutations("Modules/LayerSelection", ["setLayerInfoVisible", "setHighlightLayerId"]),

        /**
         * Sorts the configs by type: first folder, then layer.
         * @param {Array} configs list of layer and folder configs
         * @returns {Array} the sorted configs
         */
        sort (configs) {
            return sortBy(configs, (conf) => conf.type !== "folder");
        },
        /**
         * Navigates backwards in folder-menu.
         * @param {Number} level level to go back to
         * @returns {void}
         */
        navigateStepsBack (level) {
            const end = this.lastFolderNames.length - level - 1;

            for (let index = 0; index < end; index++) {
                this.navigateBack();
            }
            this.$nextTick(() => {
                this.selectAllConfId = -1;
                this.selectAllConfigs = [];
                this.provideSelectAllProps();
            });
        },
        /**
         * Listener for click on folder.
         * @param {String} lastFolderName name to show in menu to navigate back to
         * @param {Array} subjectDataLayerConfs configs to show
         * @returns {void}
         */
        folderClicked (lastFolderName, subjectDataLayerConfs) {
            this.navigateForward({lastFolderName, subjectDataLayerConfs: this.sort(subjectDataLayerConfs)});
            this.$nextTick(() => {
                this.selectAllConfId = -1;
                this.selectAllConfigs = [];
                this.provideSelectAllProps();
            });
        },
        /**
         * Returns true, if configuration shall be controlled by SelectAllCheckBox.
         * @param {Object} conf layer or folder configuration
         * @returns {Boolean} true, if configuration shall be controlled by SelectAllCheckBox
         */
        isControlledBySelectAll (conf) {
            return conf.type === "layer" && (this.mode === "2D" ? !layerFactory.getLayerTypes3d().includes(conf.typ?.toUpperCase()) : true);
        },
        /**
         * Provides data for SelectAllCheckBox props.
         * @returns {void}
         */
        provideSelectAllProps () {
            this.subjectDataLayerConfs.forEach(conf => {
                if (this.isControlledBySelectAll(conf) && this.selectAllConfId === -1) {
                    this.selectAllConfigs = this.subjectDataLayerConfs.filter(config => this.isControlledBySelectAll(config));
                    this.selectAllConfId = conf.id;
                }
            });
        },
        /**
         * Changes category after selection.
         * @param {String} value key of the category
         * @returns {void}
         */
        categorySelected (value) {
            if (typeof value === "string") {
                const category = this.allCategories.find(aCategory => aCategory.key === value);

                this.allCategories.forEach(aCategory => {
                    aCategory.active = false;
                });
                category.active = true;
                this.changeCategory(category);
            }
        },
        /**
         * Filters baselayers for mode '2D' or '3D'.
         * @returns {Array} list of filtered baselayers
         */
        filterBaseLayer () {
            if (this.mode === "3D") {
                return this.baselayerConfs.filter(conf => !layerFactory.getLayerTypesNotVisibleIn3d().includes(conf.typ?.toUpperCase()));
            }
            return this.baselayerConfs;
        }
    }
};
</script>

<template>
    <div
        v-if="visible"
        :id="'layer-selection'"
        class="w-100 layer-selection"
        aria-label=""
    >
        <SearchBar
            v-if="addLayerButtonSearchActive === true || showInTree === true"
        />
        <div class="layer-selection-navigation d-flex">
            <div
                v-if="showAllResults === false"
                class="layer-selection-navigation"
            >
                <h5
                    v-if="(filterBaseLayer().length > 0 && categoryBackgroundsHeaderText !== false)"
                    class="layer-selection-subheadline"
                >
                    {{ categoryBackgroundsHeaderText ?? $t("common:modules.layerSelection.backgrounds") }}
                </h5>
                <div class="d-flex justify-content-start layer-selection-navigation-baselayer">
                    <template
                        v-for="(bgConf, index) in filterBaseLayer()"
                        :key="index"
                    >
                        <div class="col baselayer">
                            <LayerCheckBox
                                :conf="bgConf"
                                :is-layer-tree="false"
                            />
                        </div>
                    </template>
                </div>
                <hr
                    v-if="filterBaseLayer().length > 0"
                    class="m-2"
                >

                <div class="align-items-left justify-content-center layer-selection-navigation-dataLayer">
                    <div class="layer-selection-category-head">
                        <h5
                            v-if="lastFolderNames.length === 1 && datalayerHeaderText !== false"
                            class="layer-selection-subheadline"
                        >
                            {{ datalayerHeaderText ?? $t("common:modules.layerSelection.datalayer") }}
                        </h5>

                        <div
                            v-if="activeOrFirstCategory && categorySwitcher && lastFolderNames.length === 1"
                            class="btn d-flex mb-auto layer-selection-category-div-btn"
                        >
                            <IconButton
                                id="layer-selection-category-btn"
                                :class-array="['btn-light']"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseCategory"
                                :icon="'bi bi-filter-left'"
                                :aria="`${$t('common:modules.layerTree.categories')}: ${$t('common:modules.layerTree.iconSubMenu')}`"
                            />
                        </div>
                    </div>

                    <div
                        v-if="activeOrFirstCategory && categorySwitcher && lastFolderNames.length === 1"
                        id="collapseCategory"
                        class="collapse"
                    >
                        <div class="layer-selection-category-list">
                            <h6>{{ $t('common:modules.layerTree.categoriesListHead') }}</h6>
                            <div
                                v-for="category in allCategories"
                                :key="category.key"
                                class="grid-item"
                            >
                                <span class="subItem">
                                    <input
                                        :id="'collapse-category-sub-menu-' + category.key"
                                        type="radio"
                                        name="category"
                                        :value="category.key"
                                        class="form-check-input"
                                        :checked="activeCategory === category.key? true : false"
                                        @click="categorySelected($event.target.value)"
                                        @keydown.enter="categorySelected($event.target.value)"
                                    >
                                </span>
                                <span class="subItem">
                                    <label
                                        :for="'collapse-category-sub-menu-' + category.key"
                                    > {{ $t(category.name) }}
                                    </label>
                                </span>
                            </div>
                        </div>
                    </div>

                    <nav
                        v-if="lastFolderNames.length > 1"
                        aria-label="breadcrumb"
                        class="position-sticky top-0 bg-white py-3"
                    >
                        <ol
                            class="breadcrumb mb-0"
                        >
                            <li
                                v-for="(lastFolderName, index) in lastFolderNames"
                                :key="index"
                                :class="['breadcrumb-item', index === (lastFolderNames.length -1) ? 'active': '']"
                            >
                                <a
                                    v-if="index < (lastFolderNames.length -1)"
                                    class="mp-menu-navigation"
                                    href="#"
                                    @click="navigateStepsBack(index)"
                                    @keypress="navigateStepsBack(index)"
                                >
                                    <h6 class="mp-menu-navigation-link bold">{{ lastFolderName === "root" ? $t("common:modules.layerSelection.datalayer") : lastFolderName }}</h6>
                                </a>
                                <h6
                                    v-else
                                    class="mp-menu-navigation-link bold no-link"
                                >
                                    {{ lastFolderName }}
                                </h6>
                            </li>
                        </ol>
                    </nav>
                    <template
                        v-for="(conf, idx) in subjectDataLayerConfs"
                        :key="idx"
                    >
                        <LayerSelectionTreeNode
                            :conf="conf"
                            :show-select-all-check-box="selectAllConfId === conf.id"
                            :select-all-configs="selectAllConfigs"
                            @show-node="folderClicked"
                        />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.breadcrumb-item + .breadcrumb-item::before{
    font-weight: bold;
    line-height: 1.2rem;
}

.layer-selection {
    background-color: $menu-background-color;
    left: 0px;
    height: calc(100% - 50px);
    padding-top: 0;
    @media (max-height: 670px) {
        height: calc(100% - 85px);
    }
}

.layer-selection-category-head {
    display: flex;
}

.layer-selection-category-div-btn {
    position: relative;
    bottom: 0.8rem;
    margin-left: auto;
    height: 3rem;
    cursor: inherit;
}

.layer-selection-category-list {
    margin: 0 0 0.5rem 2rem;

    > h6 {
        margin-bottom: 1rem;
    }
    > .grid-item {
        margin: 0.8rem 0 0 0;
        text-align: left;

        > .subItem {
            margin: 0 0.4rem 0 0;
            vertical-align: text-bottom;
        }
    }
}

.layer-selection-navigation {
    height: 90%;
    flex-direction: column;
}

.layer-selection-navigation-baselayer {
    overflow-x: auto;
}
@include media-breakpoint-down(md) {
    .layer-selection-navigation-baselayer {
        max-height: 120px;
    }
}
.layer-selection-navigation-dataLayer {
    @include media-breakpoint-down(md) {
        max-height: calc(100% - 120px);
    }
}

.layer-selection-subheadline {
    margin: 0px 0 15px 0;
}

.mp-menu-navigation{
    color: $black;
    display: flex;
}
.mp-menu-navigation-link{
    display: flex;
}

@include media-breakpoint-up(sm)  {
    .layer-selection-navigation-baselayer {
        overflow-x: auto;
    }
}
.baselayer {
    min-width: 35%;
}
</style>
