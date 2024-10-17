<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import SwitchInput from "../../../../shared/modules/checkboxes/components/SwitchInput.vue";
/**
 * The component to display the drawn entities as list.
 * @module modules/modeler3D/components/ui/EntityList
 * @vue-data {String} isHovering - Contains the string for the icon that is displayed.
 * @vue-prop {Array} objects - The entity object
 * @vue-prop {Boolean|String} objectsLabel - label of the object
 * @vue-prop {Boolean} entity - If the object is a drawn entity or not.
 * @vue-prop {Boolean} geometry - If the object is a geometry or not.
 * @vue-prop {Boolean} enableCheckboxes - If the checkboxes are enabled or not.
 */
export default {
    name: "EntityList",
    components: {
        SwitchInput
    },
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
        }
    },
    emits: ["zoom-to", "change-visibility", "export-geojson"],
    data () {
        return {
            isHovering: ""
        };
    },
    computed: {
        ...mapGetters("Modules/Modeler3D", ["currentModelId"])
    },
    methods: {
        ...mapActions("Modules/Modeler3D", ["deleteEntity"]),
        ...mapMutations("Modules/Modeler3D", ["setCurrentModelId"]),

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
                :class="{active: object.id === currentModelId}"
            >
                <button
                    type="button"
                    data-toggle="button"
                    class="listButton list-group-item list-group-item-action"
                    :class="{active: object.id === currentModelId}"
                    @click="enableCheckboxes ? hasActiveClass($event, object.id) : ''"
                >
                    <SwitchInput
                        v-if="enableCheckboxes"
                        :id="object.id.toString()"
                        :aria="object.id.toString()"
                        :value="object.id"
                        :checked="object.id === currentModelId"
                        class="checkbox-selected-entity"
                        label=""
                        @change="$event.target.checked ? setCurrentModelId(object.id) : setCurrentModelId(null)"
                    />
                    <input
                        v-if="entity && object.edit"
                        :id="`input-${object.id}`"
                        v-model="object.name"
                        class="input-name editable"
                        label=""
                        placeholder=""
                        @input="$emit('update-object-name', {index, value: object.name })"
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
                </button>
                <div class="buttons">
                    <i
                        v-if="entity"
                        id="list-zoomTo"
                        class="inline-button bi"
                        :class="{ 'bi-geo-alt-fill': isHovering === `${index}-geo`, 'bi-geo-alt': isHovering !== `${index}-geo`}"
                        :title="$t(`common:modules.modeler3D.entity.captions.zoomTo`, {name: object.name})"
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
                        :title="$t(`common:modules.modeler3D.entity.captions.visibilityTitle`, {name: object.name})"
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
                        :title="$t(`common:modules.modeler3D.entity.captions.visibilityTitle`, {name: object.name})"
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
                        :title="$t(`common:modules.modeler3D.entity.captions.deletionTitle`, {name: object.name})"
                        role="button"
                        tabindex="0"
                        @click="deleteEntity(object.id)"
                        @keydown.enter="deleteEntity(object.id)"
                        @mouseover="isHovering = `${index}-del`"
                        @mouseout="isHovering = false"
                        @focusin="isHovering = `${index}-del`"
                        @focusout="isHovering = false"
                    />
                </div>
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
                        :title="$t(`common:modules.modeler3D.draw.captions.exportTitle`)"
                        @click="$emit('export-geojson')"
                        @keydown.enter="$emit('export-geojson')"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-download" />
                        </span>
                        {{ $t("modules.modeler3D.draw.captions.export") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
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

    .model-list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: $light_blue;
        border-top: none;
        border-right: none;
        border-bottom: 1px solid rgba(100, 100, 100, 0.5);
        border-left: none;
    }

    .model-list:first-of-type {
        border-top: 1px solid rgba(100, 100, 100, 0.5);
    }

    .listButton {
        display: flex;
        align-items: center;
        height: 2 rem;
        background-color: $light_blue;
}

    .list-group-item.active, .model-list.active {
        background-color: $secondary;
        color: $white;
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
        margin-right: 0.7em;
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
        background-color: $dark_blue;
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
</style>
