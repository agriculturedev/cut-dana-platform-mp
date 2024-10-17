<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";

/**
 * Action button to display at each search result and to execute configured actions.
 * @module modules/ActionButton
 * @vue-prop {String} actionName - name of the action to call on click on button
 * @vue-prop {Object} actionArgs - to call the action with
 */
export default {
    name: "ActionButton",
    components: {
        IconButton
    },
    props: {
        actionName: {
            type: String,
            required: true
        },
        actionArgs: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters(["isModuleAvailable"]),
        ...mapGetters("Modules/SearchBar", ["showAllResults", "iconsByActions", "searchInputValue"])
    },
    methods: {
        ...mapActions("Modules/SearchBar", [
            "activateAction"
        ]),
        ...mapMutations("Modules/SearchBar", ["setSearchResultsActive", "setCurrentActionEvent", "setCurrentSearchInputValue"]),
        /**
         * Checks for special actions, if an icon for the action shall be displayed.
         * Action 'startRouting': checks if routing module is available.
         * @returns {Boolean} true, if an icon for the action shall be displayed
         */
        displayAction () {
            if (this.actionName === "startRouting") {
                return this.isModuleAvailable("routing");
            }
            return true;
        },
        /**
         * Calls the event of this button.
         * @returns {void}
         */
        callAction () {
            this.setCurrentActionEvent(this.actionName);
            this.setCurrentSearchInputValue(this.searchInput);
            this.activateAction({actionName: this.actionName, actionArgs: this.actionArgs});

        }
    }
};
</script>

<template lang="html">
    <IconButton
        v-if="displayAction()"
        :aria="$t('common:modules.searchBar.actions.'+actionName)"
        :class-array="['btn-light']"
        :icon="iconsByActions[actionName]"
        :interaction="callAction"
        class="ms-2"
    />
</template>

<style lang="scss" scoped>
</style>
