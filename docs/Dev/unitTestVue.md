# Unit Tests in Vue

For an example test suite, see *masterportal/src/modules/tools/scaleSwitcher/tests*. Tests can be started in the Masterportal's root folder by either calling `npm run test:vue` (one-time run) or `npm run test:vue:watch` (updates on file changes).

## How to write tests

### Test file location

Test files are to be saved with the file extension `.spec.js`. All test files are to be placed next to the component and store being tested in a separate `tests/unit` folder. For illustration, the following example was constructed using the `ScaleSwitcher` component.

```
src
|-- modules
|   |-- tools
|   |   |-- scaleSwitcher
|   |   |   |-- components
|   |   |	|   |-- ScaleSwitcher.vue
|   |   |   |   |-- ...
|   |   |	|-- store
|   |   |   |   |-- actionsScaleSwitcher.js
|   |   |   |   |-- gettersScaleSwitcher.js
|   |   |   |   |-- indexScaleSwitcher.js
|   |   |   |   |-- mutationsScaleSwitcher.js
|   |   |   |   |-- stateScaleSwitcher.js
|   |   |   |
|   |   |	|-- tests
|   |   |	|   |-- end2end
|   |   |   |	|   |-- ScaleSwitcher.e2e.js
|   |   |	|   |-- unit
|   |   |   |	|   |-- components
|   |   |   |   |	|   |-- ScaleSwitcher.spec.js
|   |   |   |	|   |-- store
|   |   |   |   |	|   |-- actionsScaleSwitcher.spec.js
|   |   |   |   |	|   |-- gettersScaleSwitcher.spec.js
|   |   |   |   |	|   |-- mutationsScaleSwitcher.spec.js
```

## File structure

The following sub-chapters contain example test files that may be used as guideline.

### Component test

```js
// modules/tools/scaleSwitcher/components/ScaleSwitcher.vue
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import {createStore} from "vuex";

import ScaleSwitcherComponent from "../../../components/ScaleSwitcher.vue";

config.global.mocks.$t = key => key;

describe("src/modules/scaleSwitcher/components/ScaleSwitcher.vue", () => {
    const scales = ["1000", "5000", "10000"];
    let store,
        wrapper;

    beforeEach(() => {
        mapCollection.clear();

        store = createStore({
            modules: {
                Maps: {
                    namespaced: true,
                    getters: {
                        scale: sinon.stub()
                    },
                    mutations: {
                        setScale: sinon.stub()
                    },
                    state: {
                        scale: scales[0]
                    },
                    actions: {}
                }
            }
        });

        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                    center: [565874, 5934140],
                    zoom: 2,
                    options: [
                        {resolution: 0.2645831904584105, scale: 1000, zoomLevel: 8},
                        {resolution: 1.3229159522920524, scale: 5000, zoomLevel: 6},
                        {resolution: 26.458319045841044, scale: 10000, zoomLevel: 1}
                    ],
                    resolution: 15.874991427504629,
                    resolutions: [66.14579761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105, 0.13229159522920522],
                    get: () => [
                        {
                            scale: "1000"
                        },
                        {
                            scale: "5000"
                        },
                        {
                            scale: "10000"
                        }
                    ],
                    getResolutions: () => [
                        1.1111,
                        2.2222
                    ],
                    setResolution: () => sinon.stub()
                };
            }
        };

        mapCollection.addMap(map, "2D");
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the scaleSwitcher", () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#scale-switcher").exists()).to.be.true;
    });

    it("has initially set all scales to select", () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {
            global: {
                plugins: [store]
            }});
        const options = wrapper.findAll("option");

        expect(options.length).to.equal(scales.length);
        scales.forEach((scale, index) => {
            expect(scale).to.equal(options.at(index).attributes().value);
        });
    });

    it("has initially selected scale", async () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {
            global: {
                plugins: [store]
            }});
        const select = wrapper.find("select");

        expect(select.element.value).to.equals("1000");
    });

    it("renders the correct value when select is changed", async () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {
            global: {
                plugins: [store]
            }});
        const select = wrapper.find("select"),
            options = wrapper.findAll("option");

        select.setValue(options.at(1).element.value);
        await wrapper.vm.$nextTick();
        expect(wrapper.find("select").element.value).to.equals("5000");
        select.setValue(options.at(2).element.value);
        await wrapper.vm.$nextTick();
        expect(wrapper.find("select").element.value).to.equals("10000");
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = shallowMount(ScaleSwitcherComponent, {
            attachTo: elem,
            global: {
                plugins: [store]
            }});
        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#scale-switcher-select").element).to.equal(document.activeElement);
    });
});
```

### Store/getters test

```js
// modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js
import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";

const {
    icon,
    name,
    type,
    hasMouseMapInteractions,
    supportedDevices,
    supportedMapModes
} = getters;

describe("src/modules/scaleSwitcher/store/gettersScaleSwitcher.js", () => {
    describe("ScaleSwitcher getters", () => {
        it("returns the icon from state", () => {
            expect(icon(stateScaleSwitcher)).to.equals("bi-arrows-angle-contract");
        });
        it("returns the name from state", () => {
            expect(name(stateScaleSwitcher)).to.be.equals("common:modules.scaleSwitcher.name");
        });
        it("returns the supportedDevices default value from state", () => {
            expect(supportedDevices(stateScaleSwitcher)).to.be.deep.equals(["Desktop", "Mobile", "Table"]);
        });
        it("returns the supportedMapModes default value from state", () => {
            expect(supportedMapModes(stateScaleSwitcher)).to.be.deep.equals(["2D", "3D"]);
        });
        it("returns the type from state", () => {
            expect(type(stateScaleSwitcher)).to.equals("scaleSwitcher");
        });
    });

    describe("testing default values", () => {
        it("returns the hasMouseMapInteractions default value from state", () => {
            expect(hasMouseMapInteractions(stateScaleSwitcher)).to.be.false;
        });
    });
});
```

## About the libraries

### Mocha

`describe` is used to declare a section. In the example, the outer `describe` is used to describe the module being tested. Nested `describe`s are used to name the function currently under test.

You may use `describe.only` to run only a specific test section, or `describe.skip` to temporarily comment out tests during development.

```js
describe(name, callback)
```

With `it`, the single test cases are encapsulated. For the first parameter, provide a descriptive text that outlines a property the method under test should have.

For the second parameter, provide a callback function that checks whether this described property actually holds. Use `expect` (see below) for checks.

The suffixes `.skip` and `.only` work the same way as described for `describe`.

```js
it(testCaseDescription, callback)
```

The function `before` is used for test preparations for multiple `it` cases and is executed *once* within the surrounding `describe`.

The function `beforeEach` is used for test preparations per `it` case and is therefore executed `once` per `it` in the surrounding `describe`.

The functions `after` and `afterEach` work comparably after test execution.

For more documentation regarding Mocha, please read the [Mocha documentation pages](https://mochajs.org/).

### Chai

Each `it` case should contain a call to the `expect` function.

`expect` can be used to check one or multiple properties of an object.

```js
expect(model.testMe()).to.be.true;

expect(model.testMe()).to.deep.equal({name: "Jon Snow"});
```

For more documentation regarding Chai, please read the [Chai API reference](https://chaijs.com/api/bdd/).

## Best practices

A test should fail for a *single reason*. That is, per `it` only a single `expect` should be used, if possible.

Test cases should be *simple*. Two small quick tests are preferred to one complex construct covering multiple cases.

When testing, ponder which *edge cases* should be considered. That is, test with unusual values, e.g. extremely high or low values, or seemingly nonsensical inputs like `undefined` or the empty string.

Test positively and negatively. That is, do not only ensure that the expected result is returned, but also validate no undesired side effects are produced.

## Further reading

* [Vue test utils](https://vue-test-utils.vuejs.org/)
* [Vue testing handbook](https://lmiller1990.github.io/vue-testing-handbook/)
* [Vue.js testing guide](https://vuejs.org/v2/guide/unit-testing.html#ad)
* [VueX testing](https://vuex.vuejs.org/guide/testing.html)
