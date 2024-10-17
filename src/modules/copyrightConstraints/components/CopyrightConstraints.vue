<script>
import getCswRecordById from "../../../shared/js/api/getCswRecordById";
import {mapGetters} from "vuex";

/**
 * Tool to show access and use constraints for all visible layer
 * and if no constraints where given then shows point of contact information for this layer
 * @module modules/copyrightConstraints/components/CopyrightConstraints
 * @vue-data {Array} constraints - The constraints for each layer.
 * @vue-data {Boolean} ready - Default false, true when all information was fetched.
 */
export default {
    name: "CopyrightConstraints",
    data () {
        return {
            constraints: [],
            ready: false
        };
    },
    computed: {
        ...mapGetters("Modules/CopyrightConstraints", [
            "cswUrl"
        ]),
        ...mapGetters(["visibleLayerConfigs"]),
        getConstraints: function () {
            return this.constraints;
        }
    },
    watch: {
        visibleLayerConfigs: {
            handler () {
                this.getCswConstraints();
            },
            deep: true
        }
    },
    mounted () {
        this.getCswConstraints();
        this.ready = true;
    },
    methods: {
        /**
         * gets the meta data for a layer
         * @param {String} id meta data id of the layer
         * @returns {Promise} meta data as Promise
         */
        getMetaData (id) {
            return new Promise((resolve) => {
                const metadata = getCswRecordById.getRecordById(
                    this.cswUrl,
                    id
                );

                resolve(metadata);
            });
        },
        /**
         * gets the constrains for each visible layer and put them into this.constrains
         * @returns {void}
         */
        getCswConstraints () {
            const visibleLayerList = this.getVisibleLayer();

            this.constraints = [];
            visibleLayerList.forEach((element) => {
                this.getMetaData(element).then((metadata) => {
                    if (!this.constraints.map((x) => x.md_id).includes(element)) {
                        this.constraints.push({
                            md_id: element,
                            title: metadata?.getTitle(),
                            accessConstraints: metadata?.getConstraints()?.access,
                            useConstraints: metadata?.getConstraints(true)?.use,
                            pointOfContact: metadata?.getContact()
                        });
                    }
                }).catch(() => console.warn("CSW Schnittstelle ist nicht erreichbar"));
            });
        },

        /**
         * gets the visible layers and detects the meta data ids for these layers
         * @returns {Array} layers list of meta data ids
         */
        getVisibleLayer () {
            const layers = [];

            this.visibleLayerConfigs?.forEach(layer => {
                if (layer.datasets) {
                    if (layer.datasets[0]?.md_id && !layers.includes(layer.datasets[0]?.md_id)) {
                        layers.push(layer.datasets[0]?.md_id);
                    }
                }
            });
            return layers;
        }
    }
};
</script>

<template lang="html">
    <div
        id="copyrightConstraints"
        class="infoText"
    >
        <div v-if="ready">
            <p>{{ $t("common:modules.copyrightConstraints.info") }}</p>
            <div
                v-if="getConstraints.length > 0"
                :key="getConstraints.length"
            >
                <ul class="copyrightConstraints_layerList">
                    <li
                        v-for="(constraintsPerLayer, index) in getConstraints"
                        :key="index"
                    >
                        {{ constraintsPerLayer.title }}
                        <div v-if="constraintsPerLayer.accessConstraints">
                            <ul class="copyrightConstraints_constraintsList">
                                <li
                                    v-if="constraintsPerLayer.accessConstraints"
                                    class="copyright-details"
                                    v-html="constraintsPerLayer.accessConstraints.trim()"
                                />
                                <li
                                    v-for="(useConstraint, useIndex) in constraintsPerLayer.useConstraints"
                                    :key="useIndex"
                                    class="copyright-details"
                                    v-html="useConstraint.trim()"
                                />
                            </ul>
                        </div>
                        <div v-else>
                            <div><i>{{ $t("common:modules.copyrightConstraints.notSpecified") }}</i></div>
                            <ul class="copyrightConstraints_pointOfContact">
                                <li v-if="constraintsPerLayer.pointOfContact?.name">
                                    <div class="organisation">
                                        {{ $t("common:modules.copyrightConstraints.contactOrganisation") }}: {{ constraintsPerLayer.pointOfContact?.name }}
                                    </div>
                                </li>
                                <li v-if="Array.isArray(constraintsPerLayer.pointOfContact?.positionName)">
                                    <div class="name">
                                        {{ $t("common:modules.copyrightConstraints.contactName") }}:
                                        <span
                                            v-for="(positionName, positionNameIndex) in constraintsPerLayer.pointOfContact?.positionName"
                                            :key="positionNameIndex"
                                        >
                                            {{ positionNameIndex > 0 ? ", " + positionName.trim() : positionName.trim() }}
                                        </span>
                                    </div>
                                </li>
                                <li v-else-if="constraintsPerLayer.pointOfContact?.positionName && constraintsPerLayer.pointOfContact?.positionName?.length === 1">
                                    <div class="name">
                                        {{ $t("common:modules.copyrightConstraints.contactName") }}: {{ constraintsPerLayer.pointOfContact?.positionName }}
                                    </div>
                                </li>
                                <li v-if="constraintsPerLayer.pointOfContact?.phone">
                                    <div class="">
                                        {{ $t("common:modules.copyrightConstraints.contactPhone") }}:
                                        {{ constraintsPerLayer.pointOfContact?.phone }}
                                    </div>
                                </li>
                                <li v-if="constraintsPerLayer.pointOfContact?.email">
                                    <div class="email">
                                        {{ $t("common:modules.copyrightConstraints.contactEmail") }}:
                                        <a
                                            class="eMailLink"
                                            :href="'mailto:' + constraintsPerLayer.pointOfContact?.email"
                                        > {{ constraintsPerLayer.pointOfContact?.email }}</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else>
            {{ $t("common:modules.copyrightConstraints.wait") }}...
        </div>
    </div>
</template>

<style scoped>
    .infoText {
        max-width: 95ch;
        word-break: break-word;
    }

    .copyright-details {
        white-space: pre-line;
    }
</style>
