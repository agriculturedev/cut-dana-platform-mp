<script>
import {mapGetters} from "vuex";
import WfsSearchField from "./WfsSearchField.vue";

export default {
    name: "WfsSearchLiteral",
    components: {
        WfsSearchField
    },
    props: {
        literal: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Modules/WfsSearch", [
            "currentInstance"
        ]),
        suggestions () {
            return this.currentInstance?.suggestions;
        }
    }
};
</script>

<template>
    <WfsSearchField
        v-if="literal.field"
        :key="`module-wfsSearch-clause-literal-field-${literal.field.id}-${literal.field.fieldName}`"
        :dropdown-input-uses-id="literal.field.usesId === true ? true : null"
        :field-id="literal.field.id"
        :suggestions-config="suggestions"
        v-bind="literal.field"
    />
    <div v-else-if="literal.clause">
        <div
            v-for="(lit, i) of literal.clause.literals"
            :key="'module-wfsSearch-clause-literal' + i"
        >
            <WfsSearchLiteral
                :literal="lit"
            />
        </div>
    </div>
</template>

<style scoped>

</style>
