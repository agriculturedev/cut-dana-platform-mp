<script>
export default {
    name: "AccordionItem",
    props: {
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        icon: {
            type: [Boolean, String],
            required: false,
            default: false
        },
        isOpen: {
            type: Boolean,
            required: false,
            default: false
        },
        fontSize: {
            type: String,
            required: false,
            default: "font-size-big"
        },
        colouredHeader: {
            type: Boolean,
            required: false,
            default: null
        }
    }
};
</script>

<template>
    <div
        :id="`accordion-container-${id}`"
        class="accordion accordion-bg accordion-flush"
        :class="[!colouredHeader? 'border-0' : 'pt-2']"
    >
        <div
            class="accordion-item border-0"
        >
            <div
                v-if="title"
                :id="`flush-heading-${id}`"
                class="accordion-header ms-0"
            >
                <button
                    :class="['accordion-button', fontSize, !isOpen? 'collapsed' : '', !colouredHeader? 'ps-0' : 'rounded']"
                    type="button"
                    :coloured="colouredHeader"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#flush-collapse-${id}`"
                    aria-expanded="true"
                    :aria-controls="`#flush-collapse-${id}`"
                >
                    <i
                        v-if="icon"
                        :class="`${icon} mt-1 me-3`"
                    />
                    {{ title }}
                </button>
            </div>
            <div
                :id="`flush-collapse-${id}`"
                :class="`accordion-collapse collapse ${isOpen ? 'show' : ''}`"
                :aria-labelledby="`flush-heading-${id}`"
                :data-bs-parent="`#accordion-container-${id}`"
            >
                <div
                    class="accordion-body"
                    :class="['accordion-body', !colouredHeader? 'pt-0' : 'pb-2']"
                >
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

    .accordion {
        --bs-border-color: $white;
        --bs-accordion-active-bg: $white;
        --bs-accordion-btn-focus-box-shadow: none;
        .font-size-big {
            font-size: $font_size_big;
        }
        .font-size-base {
            font-size: $font-size-base;
        }

   [coloured=true] {
        background-color: $light_blue;
   }

   }
</style>
