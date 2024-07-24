<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

export default {
    name: "EntityList",
    props: {
        objects: {
            type: Array,
            required: true
        },
        objectsLabel: {
            type: [Boolean, String],
            required: false,
            default: false
        },
        entity: {
            type: Boolean,
            default: false,
            required: false
        },
        geometry: {
            type: Boolean,
            default: false,
            required: false
        },
        enableCheckboxes: {
            type: Boolean,
            default: true,
            required: false
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data () {
        return {
            isHovering: ""
        };
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", ["currentModelId"])
    },
    methods: {
        ...mapActions("Tools/Modeler3D", ["confirmDeletion"]),
        ...mapMutations("Tools/Modeler3D", ["setCurrentModelId"]),

        setFocusToInput (id) {
            this.$nextTick(() => {
                const input = document.getElementById(`input-${id}`);

                input.focus();
            });
        },
        /**
         * Check if 'active' CSS class exists.
         * @param {Event} evt - The button event.
         * @param {Number} id - The current object id.
         * @returns {void}
        */
        hasActiveClass (evt, id) {
            if (evt.target.classList.contains("active")) {
                this.setCurrentModelId(null);
            }
            else {
                this.setCurrentModelId(id);
            }
        }

    }
};
</script>

<template>
    <div class="objectList">
        <label
            v-if="objectsLabel !== false"
            class="objectListLabel"
            for="objects"
        >
            {{ objectsLabel }}
        </label>
        <div class="objects-list list-group list-group-flush">
            <div
                v-for="(object, index) in objects"
                :key="index"
                class="model-list"
            >
                <button
                    type="button"
                    data-toggle="button"
                    class="listButton list-group-item list-group-item-action"
                    :class="{active: object.id === currentModelId}"
                    :disabled="disabled"
                    @click="enableCheckboxes ? hasActiveClass($event, object.id) : ''"
                >
                    <input
                        v-if="enableCheckboxes"
                        type="checkbox"
                        :aria-label="object.id"
                        :value="object.id"
                        :checked="object.id === currentModelId"
                        class="checkbox-selected-entity"
                        @change="$event.target.checked ? setCurrentModelId(object.id) : setCurrentModelId(null)"
                    >
                    <input
                        v-if="entity && object.edit"
                        :id="`input-${object.id}`"
                        v-model="object.name"
                        class="input-name editable"
                        @blur="object.edit = false"
                        @keyup.enter="object.edit = false"
                    >
                    <span
                        v-else-if="entity && !object.edit"
                        role="button"
                        class="span-name editable"
                        tabindex="-1"
                        @click="object.edit = true; setFocusToInput(object.id)"
                        @keyup.enter="object.edit = true"
                    >
                        {{ object.name }}
                    </span>
                    <span
                        v-else
                        class="input-name"
                    >
                        {{ object.name }}
                    </span>
                    <div class="buttons">
                        <i
                            v-if="entity"
                            id="list-zoomTo"
                            class="inline-button bi"
                            :class="{ 'bi-geo-alt-fill': isHovering === `${index}-geo`, 'bi-geo-alt': isHovering !== `${index}-geo`}"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.zoomTo`, {name: object.name})"
                            role="button"
                            tabindex="0"
                            @click="$emit('zoom-to', object.id)"
                            @keydown.enter="$emit('zoom-to', object.id)"
                            @mouseover="isHovering = `${index}-geo`"
                            @mouseout="isHovering = false"
                            @focusin="isHovering = `${index}-geo`"
                            @focusout="isHovering = false"
                        />
                        <i
                            v-if="object.show"
                            id="list-show"
                            class="inline-button bi"
                            :class="{ 'bi-eye-slash-fill': isHovering === `${index}-hide`, 'bi-eye': isHovering !== `${index}-hide`}"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.visibilityTitle`, {name: object.name})"
                            role="button"
                            tabindex="0"
                            @click="$emit('change-visibility', object)"
                            @keydown.enter="$emit('change-visibility', object)"
                            @mouseover="isHovering = `${index}-hide`"
                            @mouseout="isHovering = false"
                            @focusin="isHovering = `${index}-hide`"
                            @focusout="isHovering = false"
                        />
                        <i
                            v-else
                            id="list-hide"
                            class="inline-button bi"
                            :class="{ 'bi-eye-fill': isHovering === `${index}-show`, 'bi-eye-slash': isHovering !== `${index}-show`}"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.visibilityTitle`, {name: object.name})"
                            role="button"
                            tabindex="0"
                            @click="$emit('change-visibility', object)"
                            @keydown.enter="$emit('change-visibility', object)"
                            @mouseover="isHovering = `${index}-show`"
                            @mouseout="isHovering = false"
                            @focusin="isHovering = `${index}-show`"
                            @focusout="isHovering = false"
                        />
                        <i
                            v-if="entity"
                            id="list-delete"
                            class="inline-button bi"
                            :class="{ 'bi-trash3-fill': isHovering === `${index}-del`, 'bi-trash3': isHovering !== `${index}-del`}"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.deletionTitle`, {name: object.name})"
                            role="button"
                            tabindex="0"
                            @click="confirmDeletion(object.id)"
                            @keydown.enter="confirmDeletion(object.id)"
                            @mouseover="isHovering = `${index}-del`"
                            @mouseout="isHovering = false"
                            @focusin="isHovering = `${index}-del`"
                            @focusout="isHovering = false"
                        />
                    </div>
                </button>
            </div>
        </div>
        <div
            v-if="geometry"
            class="container buttons pt-4"
        >
            <div class="row">
                <div class="col-md-12 d-flex justify-content-end">
                    <button
                        id="tool-modeler3D-export-button"
                        class="primary-button-wrapper"
                        :class="disabled ? 'disabled' : ''"
                        :title="$t(`common:modules.tools.modeler3D.draw.captions.exportTitle`)"
                        @click="$emit('export-geojson')"
                        @keydown.enter="$emit('export-geojson')"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-download" />
                        </span>
                        {{ $t("modules.tools.modeler3D.draw.captions.export") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .objectListLabel {
        font-weight: bold;
    }

    .objects-list {
        font-size: $font_size_big;
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    .listButton {
        display: flex;
        align-items: center;
        height: 2 rem;
        background-color: $secondary_focus_contrast;
        border-top:   1px solid $secondary_active_drop;
        border-right:  none;
        border-bottom: 1px solid $secondary_active_drop;
        border-left:   none;
}

    .list-group-item.active {
        background-color: #D6E3FF;
        color: $black;
        border: none;
    }

    .input-name {
        width: 95%;
        white-space: nowrap;
    }

    .span-name {
        max-width: 50%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .editable {
        cursor: text;

        &:hover {
            border-bottom: 1px solid #8098b1;
            outline: 0;
        }
    }

    .buttons {
        margin-left: auto;
        padding-left: 0.5em;
        display: flex;
        gap: 0.3em;
        justify-content: end;
    }

    .inline-button {
        cursor: pointer;
        display: inline-block;
        &:focus {
            transform: translateY(-2px);
        }
        &:hover {
            transform: translateY(-2px);
        }
        &:active {
            transform: scale(0.98);
        }
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 0.2rem 0.7rem;
        cursor: pointer;
        font-size: 0.8rem;
        position: relative;
        top: -0.6rem;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }
    .checkbox-selected-entity {
        margin-right: 0.5rem;
    }

    .disabled {
        filter: opacity(0.5);
        pointer-events: none;
    }
</style>
