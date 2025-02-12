<script>
import {mapGetters} from "vuex";
import axios from "axios";

/**
 * This module can display HTML from config.json or an external file.
 * @module modules/CustomMenuElement
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 * @vue-data {String} htmlContentFromPath - The hmtl string for configurations.
 * @vue-computed {String} htmlContent - The html string for the content.
 * @vue-computed {String} pathToContent - The path for the content.
 */
export default {
    name: "CustomMenuElement",
    props: {
        /** Defines in which menu the component is being rendered */
        side: {
            type: String,
            default: "mainMenu",
            validator: value => value === "mainMenu" || value === "secondaryMenu"
        }
    },
    data: () => {
        return {
            htmlContentFromPath: null
        };
    },
    computed: {
        ...mapGetters("Menu", ["currentComponent"]),
        htmlContent () {
            return this.currentComponent(this.side).props.htmlContent;
        },
        pathToContent () {
            return this.currentComponent(this.side).props.pathToContent;
        }
    },
    methods: {
        /**
         * Validates the value of htmlContent.
         * @returns {Boolean} true, if it is valid
         */
        validateHTMLContent () {
            let valid = false;

            if (this.htmlContent !== undefined && this.htmlContent.length > 3) {
                valid = true;
            }
            return valid;
        },
        /**
         * Validates value of pathToContent and if it is valid the file is read.
         * @returns {Boolean} true, if it is valid
         */
        validateHTMLFromPath () {
            let valid = false;

            if (this.pathToContent !== undefined && this.pathToContent.length > 3) {
                valid = true;
                this.readHTMLFromPath();
            }
            return valid;
        },
        /**
         * Reads content of file configured by pathToContent.
         * @returns {void}
         */
        readHTMLFromPath () {
            axios.get(this.pathToContent, {responseType: "document"}).then(response => {
                const data = response.data;

                if (data.body) {
                    this.htmlContentFromPath = data.body.innerHTML;
                }
                else {
                    this.htmlContentFromPath = data;
                }
            })
                .catch(error => {
                    console.error("Failed to load content for CustomMenuElement with pathToContent", this.pathToContent, error);
                });
        }

    }
};
</script>

<template lang="html">
    <div class="custom-menu-element">
        <div
            v-if="validateHTMLContent()"
            v-html="htmlContent"
        />
        <div
            v-else-if="validateHTMLFromPath()"
            v-html="htmlContentFromPath"
        />
    </div>
</template>
