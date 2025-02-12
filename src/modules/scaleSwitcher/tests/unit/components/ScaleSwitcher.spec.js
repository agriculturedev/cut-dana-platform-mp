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
