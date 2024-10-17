<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersLanguage";

/**
 * Language Item
 * @module modules/LanguageItem
 * @vue-data {Boolean} showWindow - Shows if the window is visible.
 */
export default {
    name: "LanguageItem",
    data () {
        return {
            showWindow: false
        };
    },
    computed: {
        ...mapGetters("Modules/Language", Object.keys(getters))
    },
    created: function () {
        this.setCurrentLocale(i18next.language);
    },
    methods: {
        ...mapMutations("Modules/Language", ["setCurrentLocale"]),
        /**
         * changes the language according user selection and sets current language in state
         * @param {String} language language code e. g. "en"
         * @returns {void}
         */
        translate (language) {
            i18next.changeLanguage(language, () => {
                this.setCurrentLocale(language);
            });
        }
    }
};
</script>

<template lang="html">
    <div>
        <div
            v-for="(language, key) of $i18next.options.getLanguages()"
            :key="key"
            class="form-check"
        >
            <input
                :id="'languageRadio-'+key"
                type="radio"
                name="mode"
                class="form-check-input"
                :checked="$i18next.language === key? true : false"
                @click="translate(key)"
                @keydown.enter="translate(key)"
            >
            <label
                :for="'languageRadio-'+key"
            > {{ language }}
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .form-check {
            margin-bottom: 1rem;
        }
    label {
        cursor: pointer;
    }
</style>
