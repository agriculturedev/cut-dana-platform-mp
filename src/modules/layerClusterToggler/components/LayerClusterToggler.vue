<script>
import {mapActions, mapGetters} from "vuex";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";

/**
 * Layer Cluster Toggler
 * @module modules/LayerClusterToggler
 * @vue-data {String} storePath - The path to the store.
 * @vue-data {Boolean} isToggled - Shows if the layer cluster is toggled.
 */
export default {
    name: "LayerClusterToggler",
    components: {
        FlatButton
    },
    data () {
        return {
            storePath: this.$store.state.Modules.LayerClusterToggler,
            isToggled: true
        };
    },
    computed: {
        ...mapGetters("Modules/LayerClusterToggler", ["icon", "layerNames"])
    },
    methods: {
        ...mapActions("Modules/LayerClusterToggler", ["toggleLayerVisibility"])
    }
};
</script>

<template lang="html">
    <div
        id="layer-cluster-toggler"
    >
        <div
            id="layer-cluster-toggler-text"
            class="mb-4"
        >
            <p class="mb-2">
                {{ $t("common:modules.layerClusterToggler.info") }}
            </p>
            <ul>
                <li
                    v-for="(layerName, index) in layerNames"
                    :key="index"
                >
                    {{ layerName }}
                </li>
            </ul>
        </div>
        <div
            id="layer-cluster-toggler-button"
            class="d-flex justify-content-center"
        >
            <FlatButton
                :aria-label="$t('common:modules.layerClusterToggler.toggle')"
                :interaction="() => toggleLayerVisibility()"
                :text="$t('common:modules.layerClusterToggler.toggle')"
                :icon="icon"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    p {
        color: $black;
        font-size: $font-size-base
    }
</style>
