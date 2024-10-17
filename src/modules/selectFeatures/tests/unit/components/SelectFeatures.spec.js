import {createStore} from "vuex";
import VectorLayer from "ol/layer/Vector.js";
import {config, shallowMount} from "@vue/test-utils";
import SelectFeaturesComponent from "../../../components/SelectFeatures.vue";
import SelectFeaturesModule from "../../../store/indexSelectFeatures";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/selectFeatures/components/SelectFeatures.vue", () => {
    const mockMapActions = {
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub()
        },
        mockSelectedFeaturesWithRenderInformation = [
            {
                item: null,
                properties: [
                    ["Name", "Max-Brauer-Schule"],
                    ["Schulform", "Grundschule"],
                    ["Schulstandort", "Hauptstandort"],
                    ["Scherpunktschule Inklusion", ""]
                ]
            }
        ];

    let store, map, layer1, layer2;

    beforeEach(() => {
        layer1 = new VectorLayer();
        layer2 = new VectorLayer();
        map = {
            id: "ol",
            mode: "2D",
            getLayers: () => {
                return {
                    getArray: () => [layer1, layer2]
                };
            }
        };
        store = createStore({
            modules: {
                Maps: {
                    namespaced: true,
                    actions: mockMapActions
                },
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        SelectFeatures: SelectFeaturesModule
                    }
                }
            },
            getters: {
                uiStyle: () => true,
                treeType: () => undefined,
                isMobile: () => false
            }
        });
        mapCollection.clear();
        mapCollection.addMap(map, "2D");
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the SelectFeatures tool if mounted", () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {global: {
            plugins: [store]
        }});

        expect(wrapper.find("#selectFeatures").exists()).to.be.true;
        expect(wrapper.find(".selectFeaturesDefaultMessage").exists()).to.be.true;
    });

    it("renders the SelectFeatures-Table if it has data", async () => {
        await store.commit("Modules/SelectFeatures/setSelectedFeaturesWithRenderInformation", mockSelectedFeaturesWithRenderInformation);
        const wrapper = shallowMount(SelectFeaturesComponent, {global: {
            plugins: [store]
        }});

        expect(wrapper.find(".select-features-tables").exists()).to.be.true;
        expect(wrapper.find(".featureName").exists()).to.be.true;
        expect(wrapper.find(".featureValue").exists()).to.be.true;
        expect(wrapper.find(".select-features-zoom-link").exists()).to.be.true;
    });

    it("selectFeatures functions return correct results", async () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {global: {
            plugins: [store]
        }});

        expect(wrapper.vm.beautifyKey("very_important_field")).to.equal("Very Important Field");
        expect(wrapper.vm.beautifyValue("very|important|field")).to.equal("very<br/>important<br/>field");
        expect(wrapper.vm.isValidValue("NULL")).to.equal(false);
        expect(wrapper.vm.isValidValue(1)).to.equal(false);
        expect(wrapper.vm.isValidValue("Wert")).to.equal(true);
    });
});
