<script>
/**
 * Routing Batch Processing Checkbox
 * @module modules/RoutingBatchProcessingCheckbox
 * @vue-prop {Object} batchProcessing - The batch processing status.
 * @vue-event {Boolean} input - Emits checked value on changed input.
 */
export default {
    name: "RoutingBatchProcessingCheckbox",
    props: {
        batchProcessing: {
            type: Object,
            required: true
        }
    },
    emits: ["input"]
};
</script>

<template>
    <label
        id="routing-batch-processing-checkbox"
        class="pointer mb-0 d-flex"
    >
        <input
            :checked="batchProcessing.active"
            class="mt-0 d-flex flex-column align-self-center"
            type="checkbox"
            @input="$emit('input', $event.target.checked)"
        >
        <span class="ms-2">
            {{ $t('common:modules.routing.batchProcessing.header') }}
        </span>
    </label>
</template>
