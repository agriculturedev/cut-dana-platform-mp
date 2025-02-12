<script>
import {toRaw} from "vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import changeCase from "../../../shared/js/utils/changeCase";
import visibilityChecker from "../../../shared/js/utils/visibilityChecker";

/**
 * Control layout component that places controls on the map.
 * @module modules/ControlBar
 * @vue-data {Object} categorizedControls - Object of configured controls.
 */
export default {
    name: "ControlBar",
    components: {
        // is filled in method initializeControls
    },
    data () {
        return {
            categorizedControls: {
                initialVisible: [],
                expandable: []
            }
        };
    },
    computed: {
        ...mapGetters(["controlsConfig", "deviceMode", "uiStyle", "portalConfig"]),
        ...mapGetters("Controls", ["activatedExpandable", "addonControls", "componentMap"]),
        ...mapGetters("Maps", ["mode"])
    },
    watch: {
        /**
         * Watch the controlsConfig and update the categorizedControls.
         * @param {Object} controlsConfig Controls as configured in config.json.
         * @returns {void}
         */
        controlsConfig (controlsConfig) {
            this.categorizedControls.initialVisible = [];
            this.categorizedControls.expandable = [];

            this.initializeControls(controlsConfig);
        }
    },
    mounted () {
        this.initializeControls(this.controlsConfig);
    },
    methods: {
        ...mapActions("Controls", ["mergeControlState", "moveStartModuleControls"]),
        ...mapMutations("Controls", ["setActivatedExpandable"]),

        /**
         * Initialize the controls. Registers all controls at this component.
         * @param {Object} controlsConfig Controls as configured in config.json.
         * @returns {void}
         */
        initializeControls (controlsConfig) {
            Object.entries(this.componentMap).forEach(([key, component]) => {
                this.$options.components[key] = component;
            });
            Object.entries(toRaw(this.addonControls)).forEach(([key, component]) => {
                this.$options.components[key] = component;
            });
            if (!this.isSimpleStyle()) {
                this.prepareControls(controlsConfig);

                if (controlsConfig?.expandable) {
                    this.prepareControls(controlsConfig.expandable, true);
                }
            }
        },

        /**
         * Checks if uiStyle is "SIMPLE":
         * @returns {Boolean} Is ui style simple
         */
        isSimpleStyle () {
            return this.uiStyle === "SIMPLE";
        },

        /**
         * Prepares the configured tools to be the right component form.
         * @param {Object} controlsConfig Controls as configured in config.json.
         * @param {Boolean} [expandable=true] Indicates whether controls are extensible
         * @returns {void}
         */
        prepareControls (controlsConfig, expandable = false) {
            Object.keys(controlsConfig).forEach(controlKey => {
                if (this.componentMap[changeCase.upperFirst(controlKey)] || this.addonControls[changeCase.upperFirst(controlKey)]) {
                    const controlValues = controlsConfig[controlKey];

                    if (controlValues === true) {
                        this.fillCategorizedControls(controlKey, expandable);
                    }
                    else if (typeof controlValues === "object" && controlKey !== "expandable") {
                        this.mergeControlState({controlKey, controlValues});
                        this.fillCategorizedControls(controlKey, expandable);
                    }
                }
            });
        },

        /**
         * Fills the attribute categorizedControls with controls.
         * @param {String} controlKey The key of the control.
         * @param {Boolean} expandable Indicates whether controls are extensible
         * @returns {void}
         */
        fillCategorizedControls (controlKey, expandable) {
            const control = {
                componentKey: changeCase.upperFirst(controlKey),
                key: controlKey
            };

            if (expandable && this.checkIsVisible(controlKey)) {
                this.categorizedControls.expandable.push(control);
            }
            else {
                this.categorizedControls.initialVisible.push(control);
            }
        },

        /**
         * Checks if the control is to be applied in the map- and device mode.
         * @param {String} key The key of the control.
         * @returns {Boolean} The control is shown.
         */
        checkIsVisible (key) {
            const supportedMapModes = this.$store.getters[`Controls/${changeCase.upperFirst(key)}/supportedMapModes`],
                supportedDevices = this.$store.getters[`Controls/${changeCase.upperFirst(key)}/supportedDevices`],
                supportedTreeTypes = this.$store.getters[`Controls/${changeCase.upperFirst(key)}/supportedTreeTypes`];

            return visibilityChecker.isModuleVisible(this.mode, this.deviceMode, this.portalConfig?.tree?.type, supportedMapModes, supportedDevices, supportedTreeTypes);
        }
    }
};
</script>

<template>
    <div
        class="btn-group-vertical my-5 btn-group-controls shadow"
        role="group"
    >
        <div
            v-for="(control, index) in categorizedControls.initialVisible"
            :key="index"
        >
            <component
                :is="control.componentKey"
                v-if="checkIsVisible(control.key)"
            />
        </div>
        <div v-if="categorizedControls.expandable.length >= 1">
            <hr>
            <div
                class="btn-group-vertical"
                role="group"
            >
                <div v-if="activatedExpandable">
                    <div
                        v-for="(control, index) in categorizedControls.expandable"
                        :key="index"
                    >
                        <component
                            :is="control.componentKey"
                            v-if="checkIsVisible(control.key)"
                            :key="control.key"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    class="btn control-icon-controls bootstrap-icon my-1 control-button-controls btn-light"
                    @click="setActivatedExpandable(!activatedExpandable)"
                >
                    <i class="bi-three-dots" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .btn-group-controls {
        display: none;
        background-color: $white;
        border: solid $white 1px;
        border-radius: 25px;
        position: absolute;
        bottom: 0;
    }

    .control-button-controls {
        display: block;
        text-align: center;
        top: auto;

        font-size: calc(#{$icon_length} - 0.35 * #{$icon_length});
        height: $icon_length;
        width: $icon_length;
    }


    @include media-breakpoint-up(sm) {
        .btn-group-controls {
            display: block;
        }
    }

    @include media-breakpoint-down(sm) {
        .btn-group-controls {
            display: block;
            bottom: 10rem;
            top: unset;
            right: 2rem;
        }
    }

</style>
