import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import BufferAnalysisComponent from "../../../components/BufferAnalysis.vue";
import {expect} from "chai";
import sinon from "sinon";
import {createLayerConfigsArray} from "../utils/functions";
import {nextTick} from "vue";

config.global.mocks.$t = key => key;

describe("src/modules/bufferAnalysis/components/BufferAnalysis.vue", () => {
    let store,
        checkIntersectionSpy,
        applyBufferRadiusSpy,
        applyValuesFromSavedUrlBufferSpy,
        loadSelectOptionsSpy,
        initJSTSParserSpy,
        applySelectedSourceLayerSpy,
        wrapper;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            removeLayer: sinon.spy()
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        checkIntersectionSpy = sinon.spy();
        applyBufferRadiusSpy = sinon.spy();
        applyValuesFromSavedUrlBufferSpy = sinon.spy();
        loadSelectOptionsSpy = sinon.spy();
        initJSTSParserSpy = sinon.spy();
        applySelectedSourceLayerSpy = sinon.spy();

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        BufferAnalysis: {
                            namespaced: true,
                            actions: {
                                checkIntersection: checkIntersectionSpy,
                                applyBufferRadius: applyBufferRadiusSpy,
                                applyValuesFromSavedUrlBuffer: applyValuesFromSavedUrlBufferSpy,
                                loadSelectOptions: loadSelectOptionsSpy,
                                initJSTSParser: initJSTSParserSpy,
                                applySelectedSourceLayer: applySelectedSourceLayerSpy
                            },
                            mutations: {
                                setSelectOptions: (state, options) => {
                                    state.selectOptions = options;
                                }
                            },
                            getters: {
                                selectOptions: (state) => state.selectOptions
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    mode: "2D"
                }
            }
        });
    });

    afterEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            addLayer: sinon.spy(),
            removeLayer: sinon.spy()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        sinon.restore();
    });

    it("renders the bufferAnalysis", () => {
        wrapper = shallowMount(BufferAnalysisComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#tool-bufferAnalysis").exists()).to.be.true;
        expect(wrapper.find("#tool-bufferAnalysis").exists()).to.be.true;
    });

    it("has initially set nothing to layer-analysis-select-source and layer-analysis-select-target", () => {
        wrapper = shallowMount(BufferAnalysisComponent, {
            global: {
                plugins: [store]
            }});
        const selectSource = wrapper.find("#tool-bufferAnalysis-selectSourceInput"),
            selectTarget = wrapper.find("#tool-bufferAnalysis-selectTargetInput");

        expect(selectSource.element.value).to.equals("");
        expect(selectTarget.element.value).to.equals("");
    });

    it("has initially set eight available options to select", async () => {
        wrapper = shallowMount(BufferAnalysisComponent, {
            global: {
                plugins: [store]
            }});
        const layers = createLayerConfigsArray(3);
        let options = [];

        await store.commit("Modules/BufferAnalysis/setSelectOptions", layers);
        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equals(8); // 2 * 3 (selectOptions) + 2 (resultType)
    });

    it("sets a value on the range when source is chosen", async () => {
        wrapper = shallowMount(BufferAnalysisComponent, {
            global: {
                plugins: [store]
            }});
        const selectSource = wrapper.find("#tool-bufferAnalysis-selectSourceInput"),
            range = wrapper.find("#tool-bufferAnalysis-radiusTextInput"),
            layers = createLayerConfigsArray(3);


        let sourceOptions = [];

        await store.commit("Modules/BufferAnalysis/setSelectOptions", layers);
        sourceOptions = selectSource.findAll("option");
        await wrapper.vm.$nextTick();

        sourceOptions.at(1).setSelected();
        await wrapper.vm.$nextTick();

        await range.setValue(1000);
        expect(range.element.value).to.equal("1000");

        nextTick(() => {
            expect(applyBufferRadiusSpy.calledOnce).to.equal(true);
        });
    });

    it("sets focus to first input control", () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }

        wrapper = shallowMount(BufferAnalysisComponent, {
            global: {
                plugins: [store]
            }});

        wrapper.vm.setFocusToFirstControl();

        nextTick(() => {
            expect(wrapper.find("#tool-bufferAnalysis-selectSourceInput").element).to.equal(document.activeElement);
        });
    });
});
