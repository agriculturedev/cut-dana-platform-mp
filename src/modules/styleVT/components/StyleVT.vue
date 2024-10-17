<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

/**
 * StyleVT
 * @module modules/StyleVT
 */
export default {
    name: "StyleVT",
    computed: {
        ...mapGetters(["visibleLayerConfigs"]),
        ...mapGetters("Modules/StyleVT", [
            "layerModel",
            "selectedLayerId",
            "selectedStyle",
            "vectorTileLayerList"
        ])
    },
    watch: {
        visibleLayerConfigs: {
            handler () {
                this.refreshVectorTileLayerList();
            },
            deep: true
        }
    },
    mounted () {
        this.startLayerProcess();
        this.setFocusToFirstControl();
    },
    unmounted () {
        this.resetModule();
    },
    methods: {
        ...mapMutations("Modules/StyleVT", [
            "setLayerModelById"
        ]),
        ...mapActions("Modules/StyleVT", [
            "refreshVectorTileLayerList",
            "resetModule",
            "startLayerProcess",
            "updateStyle"
        ]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["module-styleVT-selectedLayerField"]) {
                    this.$refs["module-styleVT-selectedLayerField"].focus();
                }
            });
        }
    }
};
</script>

<template>
    <div id="modules-style-vt">
        <p
            v-if="vectorTileLayerList.length === 0"
            id="module-styleVT-noStyleableLayers"
        >
            {{ $t("common:modules.styleVT.noStyleableLayers") }}
        </p>
        <div v-else>
            <p>{{ $t("common:modules.styleVT.introText") }}</p>
            <form
                id="module-styleVT-styleableLayersAvailable"
                class="form-horizontal"
                role="form"
            >
                <div class="form-group form-group-sm col-md-12">
                    <label
                        for="module-styleVT-selectedLayerField"
                        class="range-label mb-1"
                    >
                        {{ $t("common:modules.styleVT.theme") }}
                    </label>
                    <select
                        id="module-styleVT-selectedLayerField"
                        ref="module-styleVT-selectedLayerField"
                        class="form-select form-select-sm"
                        @change="setLayerModelById($event.target.value)"
                    >
                        <option
                            class="float-start"
                            value=""
                            selected
                        >
                            {{ $t("common:modules.styleVT.chooseTheme") }}
                        </option>
                        <option
                            v-for="vectorTileLayer in vectorTileLayerList"
                            :key="vectorTileLayer.id"
                            class="float-start"
                            :value="vectorTileLayer.id"
                            :selected="selectedLayerId(vectorTileLayer.id)"
                        >
                            {{ vectorTileLayer.name }}
                        </option>
                    </select>
                </div>
                <div
                    v-if="layerModel"
                    class="form-group form-group-sm col-md-12"
                >
                    <label
                        for="module-styleVT-selectedStyleField"
                        class="style-label"
                    >
                        {{ $t("common:modules.styleVT.style") }}
                    </label>
                    <select
                        id="module-styleVT-selectedStyleField"
                        class="form-select form-select-sm"
                        @change="updateStyle($event.target.value)"
                    >
                        <option
                            v-for="vtStyle in layerModel.get('vtStyles')"
                            :key="vtStyle.id"
                            class="float-start"
                            :value="vtStyle.id"
                            :selected="selectedStyle(vtStyle.id)"
                        >
                            {{ vtStyle.name }}
                        </option>
                    </select>
                </div>
            </form>
        </div>
    </div>
</template>
