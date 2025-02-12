# Creating a new ScaleSwitcher tool

This is a step-by-step instruction for creating a new tool based on [Vue](https://vuejs.org/) and [Vuex](https://vuex.vuejs.org/).

## Example requirement

A tool to control the map scale is needed. Scales are to be chosen from a drop-down menu. The map must react on selections by setting the appropriate zoom level. The tool is also supposed to react on scale changes from other sources (e.g. the zoom buttons) and update the drop-down menu accordingly.

## Creating a new tool

Switch to the folder `src/modules` and create a new folder. The folder name should indicate the nature of the tool - e.g. `scaleSwitcher`. Create folders `components` and `store` in that folder, and the required files as shown in the example file tree below.

>💡 Hint: Testing is not part of this guide, but essential to merge a pull request. See our [testing documentation](../unitTestVue.md) for more information.

```
src
|
|-- modules
|   |
|   |-- scaleSwitcher
|   |   |-- components
|   |   |   |-- ScaleSwitcher.vue
|   |   |   |-- ...
|   |	|-- store
|   |   |   |-- actionsScaleSwitcher.js
|   |   |   |-- gettersScaleSwitcher.js
|   |   |   |-- indexScaleSwitcher.js
|   |   |   |-- mutationsScaleSwitcher.js
|   |   |   |-- stateScaleSwitcher.js
|   |   |
|   |	|-- tests
|   |	|   |-- unit
|   |   |	|   |-- components
|   |   |   |	|   |-- ScaleSwitcher.spec.js
|   |   |	|   |-- store
|   |   |   |	|   |-- gettersScaleSwitcher.spec.js
```

## Creating the ScaleSwitcher.vue

Open `modules/scaleSwitcher/components/ScaleSwitcher.vue` and create the Vue component as a [single file component](https://vuejs.org/guide/scaling-up/sfc.html).

```vue
<script>

/**
 * Module to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 * @module modules/ScaleSwitcher
 * @vue-data {Array} scales - The available scales.
 * @vue-computed {Number} scale - The current scale that is set in the drop down.
 */
export default {
    name: "ScaleSwitcher"
};
</script>

<template lang="html">
</template>

<style lang="scss">
</style>
```

## Register the *ScaleSwitcher* component

Open `src\modules\modules-store\gettersModules.js`, import the *ScaleSwitcher* and add it to the component map. This initializes the component and loads the *ScaleSwitcher* configuration from the `config.json`, making it available in its state. The paths `configJson.Portalconfig.mainMenu.sections.scaleSwitcher` and `configJson.Portalconfig.secondaryMenu.sections.scaleSwitcher` will be searched for *ScaleSwitcher* configuration. See the [config.json documentation](../../User/Portal-Config/config.json.md).

**Example gettersModules.js**
```js
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
// ... import more tools

const getters = {
    componentMap: () => {
        const coreModules = {
            scaleSwitcher: ScaleSwitcher
            // ... more tools
    },
        moduleCollection = {...coreModules, ...moduleCollection};
        return moduleCollection;
    }
};

export default getters;

```

## Defining state

[Vuex state](https://vuex.vuejs.org/guide/state.html) is defined in the `modules/scaleSwitcher/store/stateScaleSwitcher.js` file.
All of these properties in the state are mandatory.

```js
/**
 * The ScaleSwitcher State
 * @module  modules/scaleSwitcher/store/stateScaleSwitcher
 * @property {String} [description="common:modules.scaleSwitcher.description"] The description that should be shown in the button in the menu.
 * @property {Boolean} [hasMouseMapInteractions=false] If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} [icon="bi-arrows-angle-contract"] Icon next to title (config-param)
 * @property {String} [name="common:modules.scaleSwitcher.name"] Displayed as title (config-param)
 * @property {String[]} [supportedDevices=["Desktop", "Mobile", "Table"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 * @property {String} [type= "scaleSwitcher"] The type of the module.
 *
 */
const state = {
    hasMouseMapInteractions: false,
    description: "common:modules.scaleSwitcher.description",
    icon: "bi-arrows-angle-contract",
    name: "common:modules.scaleSwitcher.name",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "scaleSwitcher"
};

export default state;
```

## Defining getters

Add [VueX getters](https://vuex.vuejs.org/guide/getters.html) to the `modules/scaleSwitcher/store/gettersScaleSwitcher.js`. For simple getters that only retrieve state, the generator function `generateSimpleGetters` is used.

```js
import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import scaleSwitcherState from "./stateScaleSwitcher";

const getters = {
    ...generateSimpleGetters(scaleSwitcherState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
```

## Defining state mutations

Add [Vuex mutations](https://vuex.vuejs.org/guide/mutations.html) to the `modules/scaleSwitcher/store/mutationsScaleSwitcher.js`. For simple mutations that only write state, the generator function `generateSimpleMutations` is used.

```js
import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateScaleSwitcher from "./stateScaleSwitcher";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateScaleSwitcher)

    // NOTE overwrite mutations here if you need a special behaviour in a mutation
};

export default mutations;
```

## Defining actions

[Vuex actions](https://vuex.vuejs.org/guide/actions.html) can be added to the `modules/scaleSwitcher/store/actionsScaleSwitcher.js`. The *ScaleSwitcher* does not need any actions. It will be activated globally when needed.

```js
const actions = {
    // NOTE write actions here if you need them
};

export default actions;
```

### Setting up the store/index file

Open the file `modules/scaleSwitcher/store/indexScaleSwitcher.js`. Default export the previously created state, getters, mutations, and actions as an object. This represents a Vuex store, and is pluggable to another Vuex store as a module.

>💡 The `namespaced: true` has to be set by convention. This prevents naming conflicts stores with modules.

```js
import actions from "./actionsScaleSwitcher";
import mutations from "./mutationsScaleSwitcher";
import getters from "./gettersScaleSwitcher";
import state from "./stateScaleSwitcher";


export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};

```

## Add the Vuex module to the global store

Open `src\modules\modules-store\indexModules.js`, import `src/modules/scaleSwitcher/store/indexScaleSwitcher.js`, and register it to the Vuex tool store as a *module*.

**Example indexModules.js**
```js
import getters from "./gettersModules";

import ScaleSwitcher from "../scaleSwitcher/store/indexScaleSwitcher";
// ... import more tools

export default {
    namespaced: true,
    getters,
    modules: {
        // modules must be copied, else tests fail in watch mode
        ScaleSwitcher: {...ScaleSwitcher}
        // ... other modules
    }
};

```

## Use getters as computed properties in the ScaleSwitcher.vue

We can access the current scale of the map via a self-made computed property. Build a setter for `scale`. Using `scale`, the current *Map* scale can be retrieved, and `scales` represents all available *Map* scales. Fill them in the createdHook, meaning when the component is created, it fills the scales array with the available scales.

```js
    ...
    data () {
        return {
            scales: []
        };
    },
    computed: {
        scale: {
            get () {
                return this.$store.state.Maps.scale;
            },
            set (value) {
                this.$store.commit("Maps/setScale", value);
            }
        }
    },
    /**
     * Lifecycle hook: sets map scales to the scales attribute.
     * @returns {void}
     */
    created () {
        this.scales = mapCollection.getMapView("2D").get("options").map(option => option.scale);
    },
    ...
```

## Set the focus on the first Item
In Order to operate the tool successfully via keyboard, we need to ensure that the focus is set to the first available control. Therefore we need a mounted lifecycle Hook. After the component is mounted, it will set the focus on the first element. Add the matching function as well to the methods:


```js

    ...
    /**
     * Lifecycle hook: sets focus to first control element.
     * @returns {void}
     */
    mounted () {
        this.setFocusToFirstControl();
    },
    methods: {

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["scale-switcher-select"]) {
                    this.$refs["scale-switcher-select"].focus();
                }
            });
        },
    }
    ...
```

## Writing the ScaleSwitcher.vue template

In `modules/scaleSwitcher/components/ScaleSwitcher.vue`, the template is yet to be defined. The *ScaleSwitchers* HTML is generated from this.

- The outer div needs a unique `id`.

```html
<template lang="html">
    <div
        id="scale-switcher"
        class="form-floating"
    >
        <select
            id="scale-switcher-select"
            ref="scale-switcher-select"
            v-model="scale"
            class="form-select"
        >
            <option
                v-for="(scaleValue, i) in scales"
                :key="i"
                :value="scaleValue"
            >
                1 : {{ scaleValue }}
            </option>
        </select>
        <label for="scale-switcher-select">
            {{ $t("common:modules.scaleSwitcher.label") }}
        </label>
    </div>
</template>
```

## Defining *scss* styling rules

Within the `modules/scaleSwitcher/components/ScaleSwitcher.vue*`, styles can be added to the `style` tag. Note that the `css/variables.scss` offers a set of predefined colors and values for usage in all components. In this case, the select component is also styled globally. If you need more components such as input fields or buttons, take a look at our shared components: `src\shared\modules`

```scss
<style lang="scss" scoped>
    @import "~variables";

    // no extra styles needed in this case.
</style>
```

## Reacting to scale changes

Within the `modules/scaleSwitcher/components/ScaleSwitcher.vue` template, add a change listener to the `select` element calling the `setResolutionByIndex` method.

```html
<select
    id="scale-switcher-select"
    ref="scale-switcher-select"
    v-model="scale"
    class="form-select"
    @change="setResolutionByIndex($event.target.selectedIndex)"
>
```

We can set the resolution via the global mapCollection. It contains the current map view.
Calling it will set the map's resolution to a new value.

```js
import {mapGetters, mapActions, mapMutations} from "vuex";

    ...
    methods: {
        ...
        /**
         * Sets the choosen resolution to the map view.
         * @param {Number} index The selection index.
         * @returns {void}
         */
        setResolutionByIndex (index) {
            const view = mapCollection.getMapView("2D");

            view.setResolution(view.getResolutions()[index]);
        }
    }
    ...
```

## Internationalization

Labels should be available in multiple languages. For this, create localization keys in the translation files `locales_3_0_0/[de/en]/common.json`. Read the [internationalization documentation](../../User/Misc/languages.md) for more details.

```js
"modules": {
    "tools": {
        "scaleSwitcher": {
            "label": "Scales"
        },
        ... // further translations
```

The value can be accessed directly in the template by using the globally available `$t` function.

```html
<label
    for="scale-switcher-select"
    class="col-md-5 col-form-label"
>
    {{ $t("common:modules.scaleSwitcher.label") }}
</label>
```

## config.json tool configuration

To make the tool usable within a portal, it has to be configured in the portal's `config.json`.

```json
{
    "secondaryMenu": {
      "expanded": false,
      "sections": [
        [
          {
            "type": "scaleSwitcher",
            "showDescription": true,
            "description": "Stelle den Maßstab um, ganz ohne zu scrollen."
          }
        ]
      ]
    }
}
```

The tool's name translation has to be added to the `locales_3_0_0/[de/en]/common.json` files.

```json
{
    "common": {
        "menu": {
            "tools": {
                "scaleSwitcher": "Switch scale"
            }
        }
    }
}
```
