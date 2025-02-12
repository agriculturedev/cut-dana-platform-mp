<script>
import {mapActions, mapGetters} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";

/**
 * Start control that let's you start a different module.
 * @module modules/controls/StartModule
 */
export default {
    name: "StartModule",
    components: {
        ControlIcon
    },
    computed: {
        ...mapGetters("Controls/StartModule", [
            "configuredModuleStates",
            "mainMenu",
            "secondaryMenu"
        ])
    },
    created () {
        this.setConfiguredModuleStates({menuModels: this.mainMenu, menuSide: "mainMenu"});
        this.setConfiguredModuleStates({menuModels: this.secondaryMenu, menuSide: "secondaryMenu"});
    },
    methods: {
        ...mapActions("Controls/StartModule", ["setConfiguredModuleStates", "onClick"])
    }
};
</script>

<template>
    <div id="start-module-button">
        <template
            v-for="configuredModule in configuredModuleStates"
            :key="'control-module-' + configuredModule.state.type"
        >
            <ControlIcon
                :icon-name="configuredModule.state.icon"
                class="control"
                :title="$t(configuredModule.state.name)"
                :disabled="false"
                :on-click="() => onClick({moduleState: configuredModule.state, menuSide: configuredModule.menuSide})"
            />
        </template>
    </div>
</template>
