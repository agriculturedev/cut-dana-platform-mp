<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";

/**
 * Represents an info button for a layer in the layertree.
 * @module modules/layerTree/components/LayerComponentIconInfo
 * @vue-prop {Object} layerConf - The current layer configuration.
 * @vue-prop {Boolean} isLayerTree - Shows if icon is shown in layer tree.
 */
export default {
    name: "LayerComponentIconInfo",
    components: {IconButton},
    props: {
        /** current layer configuration */
        layerConf: {
            type: Object,
            required: true
        },
        /** true, if icon is shown in LayerTree, else icon is shown in LayerSelection */
        isLayerTree: {
            type: Boolean,
            required: true
        }
    },
    computed: {
        ...mapGetters("Modules/LayerInformation", ["icon"])
    },
    methods: {
        ...mapActions("Modules/LayerInformation", ["startLayerInformation"]),
        ...mapMutations("Modules/LayerSelection", ["setLayerInfoVisible"]),

        showLayerInformation () {
            this.startLayerInformation(this.layerConf);
            if (!this.isLayerTree) {
                this.setLayerInfoVisible(true);
            }
        }
    }
};
</script>

<template lang="html">
    <div
        :id="'layer-component-icon-info-' + layerConf.id"
    >
        <IconButton
            :id="'layer-component-icon-info-button-' + layerConf.id"
            :class-array="['btn-light']"
            :aria="$t('common:modules.layerTree.infosAndLegend')"
            :icon="icon"
            :interaction="() => showLayerInformation()"
        />
    </div>
</template>

