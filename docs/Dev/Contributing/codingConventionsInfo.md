# Coding Conventions Details

Explanations, details and examples are given for some rules from the [coding conventions](./codingConventions.md).

---

### Section A
---

#### A.4.3

These two examples illustrate how to write JSDoc comment blocks.

```js
/**
* This function does some things that are explained right here.
* @returns {Void}
*/
functionWithoutParamsAndNoReturn: function () {
    ...
}
```

```js
/**
* This function does some things that are explained right here.
* @param {String} param1 InputString.
* @returns {String} ConcatenatedString
*/
functionWithParamsAndReturn: function (param1) {
    return param1 + "foobar";
}
```

---

#### A.5.1

Example for testable and untestable functions.

```js
function testableFunction (uebergabeParameter) {
    let rueckgabeParameter = "Hello " + uebergabeParameter;

    return rueckgabeParameter
}

const arr = [];
function untestableFunction (param) {
    setTimeout(() => {
        arr.push(param);
    }, 1000);
}
```

---

#### A.5.2

For more information on unit tests in Vue, refer to [the Vue unit test documentation](../unitTestVue.md).

Tests employ the libraries **[Chai](https://www.chaijs.com/)** and **[Mocha](https://mochajs.org/)**.

---

#### A.6.2 - User Documentation

Extend the `.md` file documentation by following these rules.

It is recommended to preview the generated documentation by launching the mkdocs preview server.

If you set up the development environment like described in [setupDev.md](./setupDev.md#python-dependencies), you can start the preview server with the following commands:

=== "Windows"
    ```bash
    call .venv/Scripts/activate.bat #(1)!
    mkdocs serve --dirtyreload  #(2)!
    ```

    1. Activates the Python virtual environment in which mkdocs is installed.
    2. Add `--dirtyreload` if you are primarily working on a single page. This will only reload the changed page instead of the whole documentation.
    For working on the whole documentation, remove this flag as **it may cause errors with navigation and links.**


=== "Linux and Mac"
    ```bash
    source .venv/bin/activate #(1)!
    mkdocs serve --dirtyreload #(2)!
    ```

    1. Activates the Python virtual environment in which mkdocs is installed.
    1. Add `--dirtyreload` if you are primarily working on a single page. This will only reload the changed page instead of the whole documentation.
    For working on the whole documentation, remove this flag as **it may cause errors with navigation and links.**

* For new configuration parameters that do not directly influence the Masterportal UI and displayed layers, or on changes to such existing parameters, extend the file **[config.js.md](../../User/Portal-Config/config.js.md)**.
* For new configuration parameters regarding the Masterportal UI, or on changes to such existing parameters, extend the **[config.json.md](../../User/Portal-Config/config.json.md)**.
* The following parameters are mandatory for documenting configuration parameters:
```markdown
| Name | Required | Type | Default | Description | Expert |
|------|----------|------|---------|-------------|--------|
```
The row `Expert` is only required in **[config.json.md](../../User/Portal-Config/config.json.md)**.
* Each parameter in a `.md` file ends on a horizontal separation line produced by e.g. `***` or `---`.
* The heading to be used depends on the parameter nesting. The top level starts with `#`, the next level with `##`, and so on. Please mind that Markdown only supports up to six chapter levels.
* Configuration parameters describing an object containing further parameters are modelled in separate chapters and are each linked and described.
* For complex configuration parameters, an example configuration is required.
* Also extend the files **[services.json.md](../../User/Global-Config/services.json.md)**, **[rest-services.json.md](../../User/Global-Config/rest-services.json.md)**, and **[style.json.md](../../User/Global-Config/style.json.md)**, if you add or change parameters to these global configuration files.

For a more formal definition of the **[config.json.md](../../User/Portal-Config/config.json.md)** requirements, see [Masterportal configuration parser](https://bitbucket.org/geowerkstatt-hamburg/mpconfigparser/src/master/README.md).

```markdown title="Example of heading nesting in .json files. The heading level is modeled with the amount of #"
# config.json
// This is the top level page heading / title
Some general description content here...

## portalConfig
// Table of Contents Level 1
Actual page content...

### portalConfig.map
// Table of Contents Level 2 / Nested below "portalConfig"
Content about the map settings...
```

```markdown title="Parameters are nested when describing an object themselves"
## portalConfig

| Name     | Verpflichtend | Typ                               | Default | Beschreibung      | Expert |
|----------|---------------|-----------------------------------|---------|-------------------|--------|
| controls | nein          | [controls](#portalconfigcontrols) |         | Description text. | false  |

***

### portalConfig.controls
// This setting of the "portalConfig" section is nested in a different heading level
```

```json title="Example of a complex configuration"
"osm": {
    "minChars": 3,
    "serviceId": "10",
    "limit": 60,
    "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
    "classes": "place,highway,building,shop,historic,leisure,city,county"
}
```

---

#### A.6.4

On changing, refactoring, or deleting a parameter:

* Note "Deprecated in [next major release]" within the parameter's documentation.
* Mark the old parameter's code as deprecated by adding "@deprecated in [next major release]" within the JSDoc comment.

For example, the following annotations mark the parameter "Baumtyp" within the `config.json` and code as deprecated:

```md
| Name    | Verpflichtend | Typ                                | Default | Beschreibung                                 | Expert |
|---------|---------------|------------------------------------|---------|----------------------------------------------|--------|
| Baumtyp | nein          | enum["light", "default", "custom"] | "light" | Deprecated in x.0.0. Use "treeType" instead. | false  |
```

```js
/**
 * this.updateTreeType
 * @deprecated in x.0.0
 */
attributes = this.updateTreeType(attributes, response);
...
/**
 * Update the preparsed treeType from attributes to be downward compatible.
 * @param {Object} attributes Preparased portalconfig attributes.
 * @param {Object} response  Config from config.json.
 * @returns {Object} - Attributes with mapped treeType
 * @deprecated in x.0.0. Remove whole function and call!
 */
updateTreeType: function (attributes, response) {
    if (response.Portalconfig.treeType !== undefined) {
        attributes.treeType = response.Portalconfig.treeType;
    }
    else if (response.Portalconfig.Baumtyp !== undefined) {
        attributes.treeType = response.Portalconfig.Baumtyp;
        console.warn("Attribute 'Baumtyp' is deprecated. Please use 'treeType' instead.");
    }
    else {
        attributes.treeType = "light";
    }
    return attributes;
},
```

---

#### A.7.1

The library [i18next](https://www.i18next.com/) is used for internationalization.

---

#### A.8.3

For more information of versions, read the [versioning documentation](./versioning.md).

For each pull request, add an entry to the chapter "Unreleased" of the CHANGELOG.md file. Avoid technical jargon. The changelog is supposed to be readable by both users and developers.

---

### Section B (optional)

#### B.3.1

```js
// code example for generating simple getters
import state from "./state";
import {generateSimpleMutations} from "~generators";

const mutations = {
    ...generateSimpleMutations(state),
```

----

#### B.4.2

* [mapState documentation](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper)
* [mapGetters documentation](https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper)
* [mapMutations documentation](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components)
* [mapActions documentation](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components)

---

#### B.5.4

```html
<style lang="scss" scoped>
    @import "~variables";
</style>
```

---

#### B.6

An example simply displaying "My First Alert Message":

```js
import store from "masterportal/src/app-store/index";
store.dispatch("Alerting/addSingleAlert", "My First Alert Message.");
```

On phrasing, please use the following examples as a guideline.

|Positive example|Negative example|
|-|-|
|Further information on this topic could not be loaded.|CSW request failed|
|Please enter your password|You forgot to enter your password|
