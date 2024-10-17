<script>
import {mapGetters} from "vuex";

/**
 * Legend Single Layer
 * @module modules/LegendSingleLayer
 * @vue-prop {Object} legendObj - The Legend.
 */

export default {
    name: "LegendSingleLayer",
    props: {
        legendObj: {
            type: Object && undefined,
            required: true
        }
    },
    computed: {
        ...mapGetters("Modules/Legend", ["sldVersion"])
    }
};
</script>

<template>
    <div
        class="layer-legend show"
    >
        <template
            v-if="legendObj && Object.keys(legendObj).length > 0"
        >
            <div
                v-for="(legendPart, index) in legendObj.legend"
                :key="index"
                class="mt-2 layer-legend-container"
            >
                <!-- String -->
                <template
                    v-if="typeof legendPart === 'string'"
                >
                    <!--Legend as Image-->
                    <img
                        v-if="!legendPart.endsWith('.pdf') && !legendPart.endsWith('</svg>')"
                        :alt="legendPart.name ? legendPart.name : legendObj.name"
                        :src="legendPart + (legendPart.toUpperCase().includes('GETLEGENDGRAPHIC') && sldVersion ? '&sld_version=' + sldVersion : '')"
                    >
                    <!--Legend as SVG-->
                    <div
                        v-if="legendPart.endsWith('</svg>')"
                    >
                        {{ legendPart }}
                    </div>
                    <!--Legend PDF as Link-->
                    <a
                        v-if="legendPart.endsWith('.pdf')"
                        :href="legendPart"
                        target="_blank"
                        :title="legendPart"
                    >
                        {{ $t("common:modules.legend.linkToPdf") }}
                    </a>
                </template>

                <!-- Object -->
                <template
                    v-if="typeof legendPart === 'object'"
                >
                    <div
                        v-if="Array.isArray(legendPart.graphic)"
                        class="images-row"
                    >
                        <!--Legend as Image or SVG -->
                        <img
                            :alt="legendPart.name ? legendPart.name : legendObj.name"
                            :src="legendPart.graphic[1]"
                            :style="{
                                width: legendPart.iconSize[0] + 'px',
                                height: legendPart.iconSize[1] + 'px',
                                margin: legendPart.iconSizeDifferenz + 'px'
                            }"
                            class="first-image"
                        >
                        <img
                            :alt="legendPart.name ? legendPart.name : legendObj.name"
                            :src="Array.isArray(legendPart.graphic) ? legendPart.graphic[0] : legendPart.graphic"
                            class="second-image"
                        >
                        <span
                            class="ms-4 image-name"
                        >
                            {{ $t(legendPart.name) }}
                        </span>
                    </div>
                    <div v-else>
                        <!--Legend as Image or SVG -->
                        <img
                            v-if="!legendPart.graphic.endsWith('.pdf')"
                            :alt="legendPart.name ? legendPart.name : legendObj.name"
                            :src="legendPart.graphic"
                            class="left"
                        >
                        <!--Legend PDF as Link-->
                        <a
                            v-if="legendPart.graphic.endsWith('.pdf')"
                            :href="legendPart.graphic"
                            target="_blank"
                            :title="legendPart.graphic"
                        >
                            {{ $t("common:modules.legend.linkToPdf") }}
                        </a>
                        <span
                            class="ms-4"
                        >
                            {{ $t(legendPart.name) }}
                        </span>
                    </div>
                </template>
            </div>
        </template>
        <template
            v-else
        >
            <p class="mt-3">
                {{ $t("common:modules.legend.noLegendForLayerInfo") }}
            </p>
        </template>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .first-image {
        grid-column: 1;
        grid-row: 1;
        z-index: 1;
    }
    .second-image {
        grid-column: 1;
        grid-row: 1;
    }
    .image-name {
        grid-column: 2;
        grid-row: 1;
        display: flex;
        align-items: center;
    }
    .images-row{
        display: inline-grid;
    }
</style>
