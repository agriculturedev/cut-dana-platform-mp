<script>

/**
* Snippet Tag
* @module modules/SnippetTag
* @vue-prop {Boolean} isResetAll - Shows if reset all should be activated.
* @vue-prop {Number} snippetId - The snippet id.
* @vue-prop {String} value - Shows if the checkbox is disabled.
* @vue-event {String} deleteAllRules - Emits delete all rules.
* @vue-event {Number} deleteRule - Emits rule to delete by id.
* @vue-event {String} resetAllSnippets - Emits reset.
* @vue-event {Number} resetSnippet - Emits reset snippet vy id.
*/
export default {
    name: "SnippetTag",
    props: {
        isResetAll: {
            type: Boolean,
            required: false,
            default: false
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        value: {
            type: String,
            required: false,
            default: ""
        }
    },
    emits: ["deleteAllRules", "deleteRule", "resetAllSnippets", "resetSnippet"],
    methods: {
        /**
         * Triggers the functions to reset the snippet and change the rules.
         * @returns {void}
         */
        removeTag () {
            if (this.isResetAll) {
                this.$emit("resetAllSnippets", () => {
                    this.$emit("deleteAllRules");
                });
            }
            else {
                this.$emit("resetSnippet", this.snippetId, () => {
                    this.$emit("deleteRule", this.snippetId);
                });
            }
        }
    }
};
</script>

<template>
    <div
        class="snippetTagContainer"
    >
        <button
            type="button"
            class="btn-tags"
            title="löschen"
            @click="removeTag()"
            @keydown.enter="removeTag()"
        >
            <span class="snippetTagValue float-lg-start">{{ value }}</span>
            <span class="bi bi-x-lg float-end" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";
    .snippetTagContainer {
        margin: 0 0 2px 2px;
        float: left;
    }
    .snippetTagContainer button {
        padding: 5px 6px;
        font-size: $font-size-base;
        color: $white;
        background-color: rgba(0, 0, 0, 0.5);
        border: none;
    }
    .snippetTagContainer button:hover {
        opacity: 1;
        background-color: $light_blue;
        color: $light_grey;
        cursor: pointer;
    }
    .snippetTagContainer .snippetTagLabel {
        font-size: $font-size-sm;
    }
    .snippetTagContainer .snippetTagValue {
        padding-right: 5px;
    }
    .bi-x-lg:hover {
        color: $light_red;
    }
</style>
