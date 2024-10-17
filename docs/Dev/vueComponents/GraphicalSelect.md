# The GraphicalSelect Component #
Creates a dropdown to select an area in a map by square, circle or polygon.
Source folder: src\shared\modules\graphicalSelect

Component may be used like this:

```
<script>

import GraphicalSelect from "src/shared/modules/graphicalSelect/components/GraphicalSelect.vue";

// [...]

export default {
    name: "MyComponent",
    components: {
        GraphicalSelect
    },
    methods: {
        /**
         * Resets the GraphicalSelect.
         * @returns {void}
         */
        resetView: function () {
            this.$refs.graphicalSelection.resetView();
        },
    }
};
</script>

<template>
    <div>
        <GraphicalSelect
            ref="graphicalSelection"
            :label="howToChooseTiles"
        />
    </div>
</template>

<style lang="scss">
@import "~variables";

#tooltip-overlay {
    position: relative;
    background: $accent_active;
    color: $white;
    max-width: 200px;
    padding: 4px 8px;
}

#circle-overlay {
    position: relative;
    top: -20px;
    background: $accent_active;
    color: $white;
    max-width: 70px;
    padding: 4px 8px;
}
</style>

```

## Properties of Component ##
|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|selectElement|no|String|"Dropdown"|The used template element for graphical selection.|
|selectedOption|no|String|"Box"|Preselected draw modus.|
|focusOnCreation|no|Boolean||True if focus should be set to this component when it is created.|
|label|yes|String|""|The label of the select.|
|description|no|String|""|The description over the select element.|

## Actions ##
GraphicalSelect provides following actions:
updateDrawInteractionListener, featureToGeoJson, showTooltipOverlay, toggleOverlay, createDomOverlay
