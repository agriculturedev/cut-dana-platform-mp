<script>
import ProgressBar from "./ProgressBar.vue";

/**
* Snippet Button for Filter
* @module modules/SnippetButton
* @vue-data {Number} delay - The amount for the delay.
* @vue-data {Boolean} showProgress - Shows if progess should be visible.
* @vue-data {Number} progressBarKey - The progess bar key.
*/
export default {
    name: "SnippetButton",
    components: {
        ProgressBar
    },
    data () {
        return {
            delay: 100,
            showProgress: false,
            progressBarKey: 0
        };
    },
    methods: {
        runFilter () {
            this.showProgress = true;
            this.progressBarKey += 1;
        }
    }
};
</script>

<template>
    <div>
        <div>
            <input
                type="button"
                :value="$t('common:modules.filter.button.confirm')"
                @click="runFilter"
            >
        </div>
        <div
            v-if="showProgress"
        >
            <br>
            <ProgressBar
                :key="progressBarKey"
                :delay="delay"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
</style>
