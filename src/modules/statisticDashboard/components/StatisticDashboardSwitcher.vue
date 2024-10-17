<script>
export default {
    name: "StatisticDashboardSwitcher",
    props: {
        buttons: {
            type: Array,
            required: true
        },
        group: {
            type: String,
            required: true
        },
        preCheckedValue: {
            type: String,
            required: false,
            default: undefined
        }
    },
    emits: ["showView"],
    data () {
        return {
            precheckedIndex: 0
        };
    },
    watch: {
        preCheckedValue (newVal) {
            this.precheckedIndex = this.getPrecheckedIndex(this.buttons, newVal);
        }
    },
    mounted () {
        this.precheckedIndex = this.getPrecheckedIndex(this.buttons, this.preCheckedValue);
    },
    methods: {
        /**
         * Gets the prechecked index
         * @param {Object[]} buttons - the buttons object in array
         * @param {String} precheckedValue - the prechecked value
         * @returns {Number} the prechecked index
         */
        getPrecheckedIndex (buttons, precheckedValue) {
            if (!Array.isArray(buttons) || typeof precheckedValue !== "string") {
                return 0;
            }

            const index = buttons.findIndex((button) => button?.name === precheckedValue);

            return index !== -1 ? index : 0;
        }
    }
};

</script>

<template>
    <div class="switchButtons mt-0">
        <div
            class="btn-group btn-group-sm"
            role="group"
            aria-label="First group"
        >
            <div
                v-for="(data, idx) in buttons"
                :key="idx"
                class="button-wrapper"
            >
                <input
                    :id="`btnradio${idx}${data.name}`"
                    type="radio"
                    class="btn-check"
                    :name="group"
                    autocomplete="off"
                    :checked="idx === precheckedIndex"
                >
                <label
                    class="btn btn-sm text-nowrap px-3 py-2"
                    :for="`btnradio${idx}${data.name}`"
                    role="button"
                    tabindex="0"
                    @click="$emit('showView', data.name)"
                    @keydown="$emit('showView', data.name)"
                >
                    <i
                        v-if="data.icon"
                        :class="`${data.icon} pe-2`"
                    />{{ data.name }}
                </label>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.btn {
    border-radius: 0px;
    background-color: $light_grey;
    color: $light_grey_inactive_contrast;
}

.btn-check:checked + .btn {
    background: $secondary;
    color: $white;
    border-color: $secondary;
}

.btn:hover {
    background: $primary;
    border-color: $primary;
}

.button-wrapper:first-child {
    .btn {
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
    }
}
.button-wrapper:last-child {
    .btn {
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
    }
}
</style>
