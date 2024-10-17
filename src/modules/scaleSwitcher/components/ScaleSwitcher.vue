<script>
/**
 * Module to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 * @module modules/scaleSwitcher/components/ScaleSwitcher
 * @vue-data {Array} scales - The available scales.
 * @vue-computed {Number} scale - The current scale that is set in the drop down.
 */
export default {
    name: "ScaleSwitcher",
    data () {
        return {
            scales: []
        };
    },
    computed: {
        scale: {
            get () {
                return this.$store.state.Maps.scale;
            },
            set (value) {
                this.$store.commit("Maps/setScale", value);
            }
        }
    },
    /**
     * Lifecycle hook: sets map scales to the scales attribute.
     * @returns {void}
     */
    created () {
        this.scales = mapCollection.getMapView("2D").get("options").map(option => option.scale);
    },
    /**
     * Lifecycle hook: sets focus to first control element.
     * @returns {void}
     */
    mounted () {
        this.setFocusToFirstControl();
    },
    methods: {

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["scale-switcher-select"]) {
                    this.$refs["scale-switcher-select"].focus();
                }
            });
        },

        /**
         * Sets the choosen resolution to the map view.
         * @param {Number} index The selection index.
         * @returns {void}
         */
        setResolutionByIndex (index) {
            const view = mapCollection.getMapView("2D");

            view.setResolution(view.getResolutions()[index]);
        }
    }
};
</script>

<template lang="html">
    <div
        id="scale-switcher"
        class="form-floating"
    >
        <select
            id="scale-switcher-select"
            ref="scale-switcher-select"
            v-model="scale"
            class="form-select"
            @change="setResolutionByIndex($event.target.selectedIndex)"
        >
            <option
                v-for="(scaleValue, i) in scales"
                :key="i"
                :value="scaleValue"
            >
                1 : {{ scaleValue }}
            </option>
        </select>
        <label for="scale-switcher-select">
            {{ $t("common:modules.scaleSwitcher.label") }}
        </label>
    </div>
</template>
