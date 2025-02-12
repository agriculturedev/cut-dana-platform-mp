<script>
import {mapActions, mapGetters} from "vuex";

/**
 * Mouse Hover
 * @module modules/MouseHover
 */
export default {
    name: "MouseHover",
    computed: {
        ...mapGetters("Modules/MouseHover", [
            "configPaths",
            "infoBox",
            "infoText",
            "pleaseZoom",
            "type"
        ])
    },
    mounted () {
        this.initializeModule({configPaths: this.configPaths, type: this.type});
        this.initialize();
    },
    methods: {
        ...mapActions("Modules/MouseHover", ["initialize"]),
        ...mapActions(["initializeModule"])
    }
};
</script>

<template>
    <div
        id="mousehover-overlay"
    >
        <div
            v-if="infoBox"
            class="mouseHover"
        >
            <div>
                <div
                    v-for="(info, x) in infoBox"
                    :key="x"
                >
                    <span
                        v-for="(text, i) in info"
                        :key="i"
                    >
                        <p
                            v-if="i === 0"
                            class="title"
                            v-html="text"
                        />
                        <p
                            v-else
                            v-html="text"
                        />
                    </span>
                    <br v-if="x !== infoBox.length - 1 || pleaseZoom">
                </div><span
                    v-if="pleaseZoom"
                    class="info"
                >
                    <p>{{ $t(infoText) }}</p>
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
@import "~mixins";

.mouseHover {
    font-size: $font-size-base;
    text-align: left;
    max-width: inherit;
    padding: 0.5rem;
    background-color: $white;
    color: $dark-grey;
    white-space: nowrap;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);

    .title {
        font-size: $font-size-base;
        font-family: $font_family_accent;
    }
    .info {
        font-size: $font_size_sm;
        font-style: italic;
    }
}
</style>
