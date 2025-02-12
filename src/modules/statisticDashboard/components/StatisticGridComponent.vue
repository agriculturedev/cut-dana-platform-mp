<script>
import {mapMutations} from "vuex";
export default {
    name: "StatisticGridComponent",
    props: {
        dates: {
            type: Array,
            required: false,
            default: undefined
        },
        titles: {
            type: Array,
            required: false,
            default: undefined
        },
        chartsCount: {
            type: Number,
            required: false,
            default: undefined
        }
    },
    methods: {
        ...mapMutations("Modules/StatisticDashboard", ["setChosenStatisticName"])
    }
};
</script>

<template>
    <div>
        <div
            v-if="Array.isArray(dates)"
            class="flex-container"
        >
            <div
                v-for="(data, idx) in dates"
                :key="idx"
                class="flex-item text-center"
                role="button"
                tabindex="0"
                @click="setChosenStatisticName(titles[idx - 1])"
                @keydown="setChosenStatisticName(titles[idx - 1])"
            >
                <div
                    v-if="titles"
                    class="title m-2 fs-6"
                >
                    {{ titles[idx] }}
                </div>
                <slot
                    name="tableContainers"
                    :data="data"
                />
            </div>
        </div>
        <div
            v-else-if="typeof chartsCount === 'number'"
            class="flex-container"
        >
            <div
                v-for="idx in chartsCount"
                :key="idx"
                class="flex-item"
                role="button"
                tabindex="0"
                @click="setChosenStatisticName(titles[idx - 1])"
                @keydown="setChosenStatisticName(titles[idx - 1])"
            >
                <slot
                    name="chartContainers"
                    :chart-id="idx"
                    class="chartContainers"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.flex-container {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, 310px);
    justify-content: center;
    max-width: 100vw;
    margin-top: 30px;
    .title {
        font-family: $font_family_accent;
    }
}

.flex-item {
    max-width: 300px;
    min-height: 300px;
    overflow: hidden;
    margin-right: 10px;
    border-radius: 5px;
    &:hover {
        box-shadow: $box-shadow;
        cursor: pointer;
    }
}

.flex-container .mx-5 {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    margin-right: 0px !important;
    margin-left: 0px !important;
}

.flex-container .my-5 {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    margin-left: 0px !important;
    margin-left: 0px !important;
}
</style>
