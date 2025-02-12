<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import {Tooltip} from "bootstrap";
import Alerting from "./modules/alerting/components/AlertingItem.vue";
import BaselayerSwitcher from "./modules/baselayerSwitcher/components/BaselayerSwitcher.vue";
import ControlBar from "./modules/controls/components/ControlBar.vue";
import initializeLayers from "./core/layers/js/layerProcessor";
import {initializeMaps} from "./core/maps/js/maps";
import {initializeUrlParams, startProcessUrlParams} from "./core/urlParams/js/urlParams";
import isMobile from "./shared/js/utils/isMobile";
import mapCollection from "./core/maps/js/mapCollection";
import MenuContainer from "./modules/menu/components/MenuContainer.vue";
import MenuToggleButton from "./modules/menu/components/MenuToggleButton.vue";
import addonsPlugin from "./plugins/addons";

export default {
    name: "App",
    components: {
        Alerting,
        BaselayerSwitcher,
        ControlBar,
        MenuContainer,
        MenuToggleButton
    },
    data () {
        return {
            addonsLoaded: false
        };
    },
    computed: {
        ...mapGetters([
            "allConfigsLoaded",
            "configJs",
            "deviceMode",
            "mapViewSettings",
            "uiStyle",
            "visibleLayerConfigs"
        ]),
        ...mapGetters("Menu", [
            "mainExpanded",
            "mainMenu",
            "secondaryExpanded",
            "secondaryMenu"
        ]),
        ...mapGetters("Modules", [
            "componentMap"
        ])
    },
    watch: {
        async allConfigsLoaded (value) {
            if (value) {
                await addonsPlugin.loadAddons(Config.addons);
                this.addonsLoaded = true;
                this.extendLayers();
                this.initializeVectorStyle();
                initializeMaps(this.mapViewSettings, this.configJs);
                initializeLayers(this.visibleLayerConfigs);
                startProcessUrlParams();
                this.initializeOther();
            }
        }
    },
    created () {
        this.setGlobalVariables();
        initializeUrlParams();
        this.loadConfigsToTheVuexState();
        this.checkVueObservation();
        this.regulateDeviceMode();
        new Tooltip(document.body, {
            selector: "[data-bs-toggle='tooltip']"
        });
    },
    unmounted () {
        window.removeEventListener("resize", this.onResize());
    },
    methods: {
        ...mapMutations([
            "setDeviceMode"
        ]),
        ...mapActions([
            "extendLayers",
            "initializeOther",
            "initializeVectorStyle",
            "loadConfigJs",
            "loadConfigJson",
            "loadRestServicesJson",
            "loadServicesJson"
        ]),

        /**
         * Sets global variables.
         * Note: Should be as few as possible.
         * @returns {void}
         */
        setGlobalVariables () {
            global.mapCollection = mapCollection;
            global.moduleCollection = {};
        },

        /**
         * Load configs to the vuex state.
         * @returns {void}
         */
        loadConfigsToTheVuexState () {
            this.loadConfigJs(Config);
            this.loadServicesJson();
            this.loadConfigJson();
            this.loadRestServicesJson();
        },

        /**
        * Logs an error, if map3D is observed by vue. Only in mode 'development'.
        * NOTICE: this only works when 3D is enabled once!
        *
        * If the map3D is observed, and more information is needed:
        * Log of the observables in vue:
        * node_modules\vue\dist\vue.runtime.esm.js
        * function defineReactive$$1
        * line 1012: console.log(obj, key, val);
        * @returns {void}
        */
        checkVueObservation () {
            /* eslint-disable n/no-process-env */
            if (process.env.NODE_ENV === "development") {
                setInterval(() => {
                    const map3d = mapCollection.getMap("3D");

                    if (map3d?.__ob__) {
                        console.error("map3d is observed by vue:", map3d, " This leads to extreme performance problems, and the cause must be eliminated. This can have several causes: the map3D is in vuex-state or is available via getter. Layers are in the state or in the getters and reference the map3D.");
                    }
                }, 5000);
            }
        },

        /**
         * Regulates the device mode with an window event listener
         * A distinction is made between mobile and desktop.
         * @returns {void}
         */
        regulateDeviceMode () {
            const desktop = "Desktop",
                mobile = "Mobile";

            this.setDeviceMode(isMobile() ? mobile : desktop);
            window.addEventListener("resize", this.onResize(mobile, desktop));
        },

        /**
         * Sets the device mode after resize and 250 ms.
         * @param {String} mobile string for mobile
         * @param {String} desktop string for desktop
         * @returns {void}
         */
        onResize (mobile, desktop) {
            this.debounce(() => {
                const nextIsMobile = isMobile();

                if (nextIsMobile && this.deviceMode !== mobile) {
                    this.setDeviceMode("Mobile");
                }
                else if (!nextIsMobile && this.deviceMode !== desktop) {
                    this.setDeviceMode(desktop);
                }
            }, 250);
        },
        /**
         * Debounce function
         * @param {Function} callback The callback form debounce function.
         * @param {Number} wait Wait before the callback function is called.
         * @returns {Function} Calls the given callback after the given time.
         */
        debounce (callback, wait) {
            let timeout;

            return (...args) => {
                const that = this;

                clearTimeout(timeout);
                timeout = setTimeout(() => callback.apply(that, args), wait);
            };
        }
    }
};
</script>

<template>
    <div
        id="masterportal-container"
        class="masterportal-container"
    >
        <div v-if="allConfigsLoaded && addonsLoaded">
            <Alerting />
        </div>
        <MenuContainer
            v-if="allConfigsLoaded && addonsLoaded && mainMenu && uiStyle !== 'SIMPLE'"
            side="mainMenu"
        />
        <MenuToggleButton
            v-if="allConfigsLoaded && addonsLoaded && mainMenu && uiStyle !== 'SIMPLE'"
            side="mainMenu"
        />
        <div
            v-if="allConfigsLoaded && addonsLoaded"
            class="elements-positioned-over-map"
        >
            <component :is="componentMap.mouseHover" />
            <ControlBar class="controls" />
            <component :is="componentMap.wmsTime" />
            <BaselayerSwitcher />
            <component :is="componentMap.layerPills" />
            <component :is="componentMap.portalFooter" />
        </div>
        <MenuToggleButton
            v-if="allConfigsLoaded && addonsLoaded && secondaryMenu && uiStyle !== 'SIMPLE'"
            side="secondaryMenu"
        />
        <MenuContainer
            v-if="allConfigsLoaded && addonsLoaded && secondaryMenu && uiStyle !== 'SIMPLE'"
            side="secondaryMenu"
        />
        <div
            id="map-wrapper"
            class="mp-map"
            tabindex="0"
        >
            <div
                id="map"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.masterportal-container {
    display: flex;
    flex-direction: row;
    position: relative;
    height: 100%;
    width: 100%;
    font-family: $font_family_default;
    font-size: $font-size-base;

    .mp-map {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: absolute;

        #map {
            position: relative;
            height: 100%;
            width: 100%;
        }
    }
}

@include media-breakpoint-up(sm)  {
    .masterportal-container {
        overflow: hidden;
    }
}
.elements-positioned-over-map {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: 1;
    pointer-events: none;
    width: 100%;
    height: 100%;

    .controls {
        flex-grow: 1;
    }
}
</style>

<style lang="scss">
// fix warning: Specifying overflow: visible on img, video and canvas tags may cause them to produce visual content outside of the element bounds.
// See https://github.com/WICG/shared-element-transitions/blob/main/debugging_overflow_on_images.md .
.ol-viewport {
    > div > canvas {
        overflow: clip;
        overflow-clip-margin: content-box;
    }
}

.ol-layer {
    canvas {
        overflow: clip;
        overflow-clip-margin: content-box;
    }
}
</style>
