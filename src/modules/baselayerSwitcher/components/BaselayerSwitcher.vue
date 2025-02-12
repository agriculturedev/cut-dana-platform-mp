<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import LayerPreview from "../../../shared/modules/layerPreview/components/LayerPreview.vue";

export default {
    name: "BaselayerSwitcher",
    components: {
        LayerPreview
    },
    computed: {
        ...mapGetters([
            "isMobile",
            "visibleBaselayerConfigs",
            "allBaselayerConfigs",
            "layerConfigsByAttributes"
        ]),
        ...mapGetters("Modules/BaselayerSwitcher", [
            "active",
            "activatedExpandable",
            "baselayerIds",
            "configPaths",
            "singleBaseLayer",
            "topBaselayerId",
            "type"
        ])
    },
    watch: {
        visibleBaselayerConfigs: {
            handler (newVal) {
                const baselayerConfigIds = Object.values(this.allBaselayerConfigs).map(layer => layer.id),
                    zIndex = [];
                let maxZIndex = null,
                    topLayer = null;

                newVal.forEach((val) => {
                    zIndex.push(val.zIndex);
                });

                maxZIndex = Math.max(...zIndex);
                topLayer = newVal.filter(layer =>layer.zIndex === maxZIndex);

                if (topLayer[0]?.id !== undefined) {
                    const baselayerIds = [];

                    baselayerConfigIds.forEach((layerId) => {
                        if (layerId !== topLayer[0].id) {
                            baselayerIds.push(layerId);
                        }
                    });
                    this.setTopBaselayerId(topLayer[0].id);
                    this.setBaselayerIds(baselayerIds);
                }
                else {
                    this.setTopBaselayerId(null);
                    this.setBaselayerIds(baselayerConfigIds);
                }
                this.setActivatedExpandable(false);
            },
            deep: true
        }
    },
    created () {
        this.initializeModule({configPaths: this.configPaths, type: this.type});
        const baselayerConfigIds = [],
            baselayers = this.layerConfigsByAttributes({
                baselayer: true,
                showInLayerTree: true
            });

        if (baselayers.length > 1) {
            const zIndex = [];
            let max = null,
                layerWithMaxZIndex = null;

            baselayers.forEach((layer) => {
                zIndex.push(layer.zIndex);
            });

            max = Math.max(...zIndex);
            layerWithMaxZIndex = baselayers.filter(layer => layer.zIndex === max);

            if (layerWithMaxZIndex[0]?.id) {
                this.setTopBaselayerId(layerWithMaxZIndex[0]?.id);
            }
        }
        else if (baselayers.length === 0) {
            this.setTopBaselayerId(null);
        }
        else {
            this.setTopBaselayerId(baselayers[0]?.id);
        }

        Object.values(this.allBaselayerConfigs).forEach(layer => {
            if (layer.id !== this.topBaselayerId) {
                baselayerConfigIds.push(layer.id);
            }
        });
        this.setBaselayerIds(baselayerConfigIds);

        document.addEventListener("click", event => {
            const baselayerSwitcher = document.getElementById("baselayer-switcher"),
                isClickInside = baselayerSwitcher ? baselayerSwitcher.contains(event.target) : false;

            if (!isClickInside) {
                this.setActivatedExpandable(false);
            }
        });
    },
    methods: {
        ...mapMutations("Modules/BaselayerSwitcher", [
            "setActivatedExpandable",
            "setBaselayerIds",
            "setTopBaselayerId"
        ]),
        ...mapMutations(["setBaselayerVisibility"]),
        ...mapActions(["initializeModule"]),
        ...mapActions("Modules/BaselayerSwitcher", ["updateLayerVisibilityAndZIndex"]),


        switchActiveBaselayer (layerId) {
            this.updateLayerVisibilityAndZIndex(layerId);

            const selectableBackroundLayerIds = this.baselayerIds,
                index = selectableBackroundLayerIds.map(id => {
                    return id;
                }).indexOf(layerId);

            selectableBackroundLayerIds.splice(index, 1);
            if (this.topBaselayerId !== null) {
                selectableBackroundLayerIds.push(this.topBaselayerId);
                if (this.singleBaseLayer) {
                    this.layerConfigsByAttributes({
                        id: this.topBaselayerId
                    }).forEach(layer => {
                        layer.visibility = false;
                    });
                }
            }
            this.setBaselayerIds(selectableBackroundLayerIds);

            this.setTopBaselayerId(layerId);
            this.setActivatedExpandable(false);
        }
    }
};

</script>

<template>
    <div
        v-if="baselayerIds.length > 0 && active"
        id="baselayer-switcher"
        class="btn-group-vertical my-5 btn-group-background-switcher shadow"
        role="group"
    >
        <ul>
            <li
                v-for="(layerId) in baselayerIds"
                :key="layerId"
            >
                <button
                    v-if="activatedExpandable === true"
                    id="bs-expanded"
                    class="btn btn-light preview"
                    @click="switchActiveBaselayer(layerId)"
                >
                    <LayerPreview
                        :id="'layer-tree-layer-preview-' + layerId"
                        :layer-id="layerId"
                    />
                </button>
            </li>
            <button
                v-if="topBaselayerId === null"
                id="bs-placeholder"
                class="btn btn-light preview top placeholder-button"
                @click="setActivatedExpandable(!activatedExpandable)"
            >
                <i class="bi-map" />
            </button>
            <button
                v-else
                id="bs-topBaselayer"
                class="btn btn-light preview top"
                @click="setActivatedExpandable(!activatedExpandable)"
            >
                <LayerPreview
                    :id="'layer-tree-layer-preview-' + topBaselayerId"
                    :layer-id="topBaselayerId"
                />
            </button>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    #baselayer-switcher {
        pointer-events: all;
        max-height: 80vh;
        overflow: scroll;
         /* Hide scrollbar for IE, Edge and Firefox */
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    /* Hide scrollbar for Chrome, Safari and Opera */
    #baselayer-switcher::-webkit-scrollbar {
        display: none;
    }
    .btn-group-background-switcher {
        background-color: $white;
        border: solid $white 1px;
        border-radius: 35px;
        position: absolute;
        bottom: 0;
        align-self: start;

        @media (max-width: 767px) {
            left: 20px;
        }
    }

    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    .preview {
        padding: 0px;
        margin: 5px;
        min-width: 52px;
        min-height: 52px;
        border: 2px solid rgba(66, 66, 66, 0.3);
    }

    .preview:hover, .preview:focus{
        border: 2px solid rgba(66, 66, 66, 0.8);
    }

    .placeholder-button {
        color: $black;
        padding-top: 6px;
        font-size: 30px;
    }

    .top {
        border: 2px solid rgba(66, 66, 66, 0.8);
    }

    .top:hover, .top:focus {
        border: 2px solid rgba(66, 66, 66, 0.8);
    }

</style>
