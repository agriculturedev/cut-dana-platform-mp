<script>
import dayjs from "dayjs";
import {mapGetters} from "vuex";
import sortBy from "../../../shared/js/utils/sortBy";

/**
 * Shows the news as history.
 * @module modules/NewsView
 */
export default {
    name: "NewsView",
    components: {},
    computed: {
        ...mapGetters("Modules/News", ["news"])
    },
    methods: {
        /**
         * Formats the dates of the news and creates a timeframe string.
         * @param {Object} news to get the dates from
         * @returns {String} the formatted timeframe
         */
        getDate (news) {
            let formattedDate = "";

            if (typeof news.displayFrom === "string") {
                formattedDate = dayjs(news.displayFrom).format("DD.MM.YYYY");

                if (typeof news.displayUntil === "string") {
                    formattedDate += " - ";
                    formattedDate += dayjs(news.displayUntil).format("DD.MM.YYYY");
                }
            }
            return formattedDate;
        },
        /**
         * Sorts the news descending by date in 'displayFrom'.
         * @param {Array} news the news to show
         * @returns {Array} sorted news
         */
        sortByDate (news) {
            return sortBy(news, "displayFrom").reverse();
        }
    }
};
</script>

<template lang="html">
    <div id="news-view">
        <template
            v-for="(aNews, index) in sortByDate(news)"
            :key="index"
        >
            <div
                :id="'news_date_'+ index"
                class="small-text ps-2"
            >
                {{ getDate(aNews) }}
            </div>
            <div
                v-if="aNews.category && aNews.category.trim().length > 0"
                :id="'news_category_'+ index"
                class="bold p-2"
            >
                {{ aNews.category }}
            </div>
            <div
                :id="'news_content_'+ index"
                class="small-text p-2 mb-5"
                v-html="aNews.content"
            />
        </template>
        <div />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.title{
    font-size: $font_size_lg;
}
.small-text {
    font-size: $font-size-sm;
}
</style>
