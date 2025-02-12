<script>
/**
 * The entity attribute component.
 * @module modules/modeler3D/components/ui/EntityAttribute
 * @vue-prop {String} title - The title of the attribute.
 * @vue-prop {String} label - The label of the attribute.
 * @vue-prop {String[]} widthClasses - The width classes of the attribute.
 * @vue-prop {String} value - The value of the attribute.
 * @vue-prop {Boolean} [buttons=true] - If the buttons should be rendered.
 * @vue-prop {Boolean} [keepHeight=false] - Defines in combination with 'buttons' prop whether the class 'position-input' is added to the input element.
 * @vue-prop {Boolean} [disabled=false] - If the input should be disabled.
 * @vue-prop {Boolean} [formGroup=true] - If true, the css classes 'form-group' and 'form-group-sm' are added to the root element of the component.
 * @vue-prop {String} [type='text'] - The type of the input element.
 */
export default {
    name: "EntityAttribute",
    props: {
        title: {
            type: String,
            default: "",
            required: false
        },
        label: {
            type: String,
            required: true
        },
        widthClasses: {
            type: Array,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        buttons: {
            type: Boolean,
            default: true,
            required: false
        },
        keepHeight: {
            type: Boolean,
            default: false,
            required: false
        },
        disabled: {
            type: Boolean,
            default: false,
            required: false
        },
        formGroup: {
            type: Boolean,
            default: true,
            required: false
        },
        type: {
            type: String,
            default: "text",
            required: false
        }
    },
    emits: ["change", "input", "increment", "increment-shift", "decrement", "decrement-shift"]
};
</script>

<template>
    <div
        :id="title"
        :class="[{'form-group form-group-sm': formGroup}, 'col', 'col-md']"
    >
        <label
            :class="widthClasses[0] + ' col-form-label'"
            :for="title + '-field'"
            :style="type === 'color' ? 'pointer-events: none' : ''"
        >
            {{ label }}
        </label>
        <div :class="[widthClasses[1], {'position-control': buttons}]">
            <input
                :id="title + '-field'"
                class="form-control form-control-sm"
                :class="{'position-input': buttons || keepHeight}"
                :type="type"
                :disabled="disabled"
                :value="value"
                @change="$emit('change')"
                @input="$emit('input', $event.target.value)"
            >
            <div
                v-if="buttons"
                :id="title + '-buttons'"
            >
                <button
                    class="btn btn-primary btn-sm btn-pos"
                    :title="$t(`common:modules.modeler3D.entity.captions.incrementTooltip`)"
                    @click.exact="$emit('increment')"
                    @click.shift="$emit('increment-shift')"
                >
                    <i class="bi bi-arrow-up" />
                </button>
                <button
                    class="btn btn-primary btn-sm btn-pos"
                    :title="$t(`common:modules.modeler3D.entity.captions.incrementTooltip`)"
                    @click.exact="$emit('decrement')"
                    @click.shift="$emit('decrement-shift')"
                >
                    <i class="bi bi-arrow-down" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";

    .btn-pos {
        padding: 0.25em;
    }

    .position-control {
        display: flex;
        gap: 0.25em;
    }

    .position-input {
        height: 3.8em;
        min-width: 6em;
    }

</style>
