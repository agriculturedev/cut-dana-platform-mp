<script>
export default {
    name: "ColorPicker",
    data () {
        return {
            selectedColor: "#f50000"
        };
    }
};
</script>

<template>
    <label>
        <input
            v-model="selectedColor"
            type="color"
            class="color-picker"
            @input="$emit('colorChanged', $event.target.value)"
        >
        {{ selectedColor }}
    </label>
</template>

<style scoped>
    label {
        display: flex;
        align-items: center;
    }

    .color-picker {
        margin-right: 10px;
        width: 30px;
        height: 30px;
        padding: 0;
        border: none;
        background: transparent;
}
</style>


