<script>
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import {mapActions, mapMutations} from "vuex";

/**
 * Represents an sub menu button for a layer in the layertree.
 * @module modules/layerTree/components/LayerComponentIconSubMenu
 * @vue-prop {Object} layerConf - The current layer configuration.
 */
export default {
    name: "LayerComponentIconSubMenu",
    components: {IconButton},
    props: {
        /** current layer configuration */
        layerConf: {
            type: Object,
            required: true
        }
    },
    mounted () {
        const subMenuButton = document.getElementById("collapse-sub-menu-" + this.layerConf.id.split(".").join("_"));

        if (subMenuButton) {
            subMenuButton.addEventListener("show.bs.collapse", () => {
            // call required functions to load meta data and get contact info from the meta data to be used in the contact button
                this.setLayerInfo(this.layerConf);
                this.setMetadataURL(this.mdid);
                this.additionalSingleLayerInfo();
            });
        }
    },
    methods: {
        ...mapActions("Modules/LayerInformation", ["setMetadataURL", "additionalSingleLayerInfo"]),
        ...mapMutations("Modules/LayerInformation", ["setLayerInfo"])
    }
};
</script>

<template lang="html">
    <div
        :id="'layer-component-icon-sub-menu-' + layerConf.id"
        class="layer-component-icon-sub-menu"
    >
        <IconButton
            :id="'layer-component-icon-sub-menu-button-' + layerConf.id"
            :class-array="['btn-light']"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapse-sub-menu-' + layerConf.id.split('.').join('_')"
            :icon="'bi-sliders'"
            :aria="$t('common:modules.layerTree.iconSubMenu')"
        />
    </div>
</template>

