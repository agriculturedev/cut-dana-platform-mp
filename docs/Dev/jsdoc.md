# JsDoc

Create the jsdoc with `npm run buildJsDoc` and open file .../jsdoc/index.html.

See files under `src\modules\coordToolkit` as examples for correct jsdoc.

## vue component

The jsdoc should have a module path corresponding to the path in the folder structure: `@module modules/draw/components/DrawModule` and must be located directly above `export default {`.

`@vue-data` to describe data

`@vue-prop` to describe props

`@vue-computed`  to describe computed properties

To provide default values in jsdoc, do it like this:
```js
* @vue-prop {String} [selectedInteraction="draw"] - The selected interaction.
```

All methods must provide jsdoc, it is shown also in created jsdoc-files.

## Example

```js
/**
 * Modules to make drawings.
 * @module modules/draw/components/DrawModule
 * @vue-prop {ol/layer/Vector} layer - The vector layer to get the hight of.
 * @vue-prop {String} [selectedInteraction="draw"] - The selected interaction.
 * @vue-data {ol/layer/Vector} [layer=null] - The vector layer for drawings.
 * @vue-data {ol/source/Vector} [source=new VectorSource()] - The vector source for drawings.
 * @vue-computed {String} message - Error message for missing something.
 */
 export default {
     name: "DrawModule",
```

## store actions, getters, mutations

The jsdoc should have a module path corresponding to the path in the folder structure: ` @module modules/draw/store/actions` and must be located directly above `export default {`.

All functions must provide jsdoc, it is shown also in created jsdoc-files.

## Examples
```js
/**
 * The actions for the draw module.
 * @module modules/draw/store/actions
 */
export default {
```

```js
/**
 * The getters for the draw module.
 * @module modules/draw/store/getters
 */
export default {
```

```js
/**
 * The mutations for the draw module.
 * @module modules/draw/store/mutations
 */
```

## store state

The jsdoc should have a module path corresponding to the path in the folder structure: `@module modules/draw/store/state`.

All properties must provide jsdoc.

## Example
```js
/**
 * State of module draw.
 * @module modules/draw/store/state
 *
 * @property {String[]} [drawTypesMain=["pen", "geometries", "symbols"]] The top level (main) drawing types.
 * @property {String} [icon="bi-pencil"] Icon next to title (config-param)
 * @property {String} [name="common:modules.draw.name"] Displayed as title (config-param)
 * @property {String} [selectedDrawType=""] The selected draw type.
 * @property {String} [selectedDrawTypeMain=""] The selected draw type main.
 * @property {Boolean} [showDescription=""] If true, description will be shown.
 * @property {String[]} [supportedDevices=["Desktop", "Mobile", "Table"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 * @property {String} [type="draw"] The type of the module.
 const state = {
```

## other javascript files

The jsdoc should have a module path corresponding to the path in the folder structure, e.g. : `@module modules/draw/js/interaction`.

All functions must provide jsdoc.

## Example
```js
/**
 * Handling of interactions.
 * @module modules/draw/js/interaction
 */
```
