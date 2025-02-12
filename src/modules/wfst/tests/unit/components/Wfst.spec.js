import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import WfsTransaction from "../../../components/WfsTransaction.vue";
import WfstModule from "../../../store/indexWfst";
import prepareFeaturePropertiesModule from "../../../js/prepareFeatureProperties";

config.global.mocks.$t = key => key;


describe("src/modules/modules/wfst/components/WfsTransaction.vue", () => {
    const layerIds = ["wfstOne", "wfstTwo"];
    let store,
        wrapper,
        allLayerConfigs,
        exampleLayerOne,
        exampleLayerTwo;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        exampleLayerOne = {
            get: key => exampleLayerOne[key],
            featureNS: "http://www.deegree.org/app",
            featurePrefix: "app",
            featureType: "wfstOne",
            gfiAttributes: "showAll",
            style: sinon.fake(),
            isSelected: false,
            name: "Wfs-T one",
            url: "some.generic.url",
            version: "1.1.0",
            id: "wfstOne"
        };
        exampleLayerTwo = {
            get: key => exampleLayerTwo[key],
            featureNS: "http://www.deegree.org/app",
            featurePrefix: "app",
            featureType: "wfstTwo",
            gfiAttributes: "showAll",
            style: sinon.fake(),
            isSelected: false,
            name: "Wfs-T two",
            url: "some.generic.url",
            version: "1.1.0",
            id: "wfstTwo"
        };
        allLayerConfigs = [exampleLayerOne, exampleLayerTwo];
        sinon.stub(prepareFeaturePropertiesModule, "prepareFeatureProperties").resolves([
            {
                label: "stringAtt",
                key: "stringAtt",
                value: null,
                type: "string",
                required: false
            },
            {
                label: "numAtt",
                key: "numAtt",
                value: null,
                type: "integer",
                required: false
            },
            {
                label: "shortAtt",
                key: "shortAtt",
                value: null,
                type: "short",
                required: false
            },
            {
                label: "floatAtt",
                key: "floatAtt",
                value: null,
                type: "float",
                required: false
            },
            {
                label: "boolAtt",
                key: "boolAtt",
                value: null,
                type: "boolean",
                required: false
            },
            {
                label: "dateAtt",
                key: "dateAtt",
                value: null,
                type: "date",
                required: false
            }
        ]);
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Wfst: WfstModule
                    }
                }
            },
            getters: {
                allLayerConfigs: () => {
                    return allLayerConfigs;
                }
            }
        });
    });
    afterEach(() => {
        sinon.restore();
    });

    // form -> form-Element mit input-Elementen und dazugehörigen label als auch div-Element mit 2 SimpleButton
    it("renders a container for the whole tool", () => {
        wrapper = shallowMount(WfsTransaction, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#tool-wfs-transaction-container").exists()).to.be.true;
    });
    it("renders a container for the layer selection including a select element and its label", () => {
        store.commit("Modules/Wfst/setLayerIds", layerIds);

        wrapper = shallowMount(WfsTransaction, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".layer-select-container").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-layer-select-input").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-layer-select-label").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-layer-select-label").text()).to.equal("common:modules.wfst.layerSelectLabel");
    });
    it("renders a container including the failure message that no layer has been selected in the layer tree", async () => {
        exampleLayerOne.visibility = false;
        allLayerConfigs = [];
        store.commit("Modules/Wfst/setLayerIds", layerIds);
        wrapper = shallowMount(WfsTransaction, {
            global: {
                plugins: [store]
            }
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".tool-wfs-transaction-layer-failure").exists()).to.be.true;
        expect(wrapper.find(".tool-wfs-transaction-layer-failure").text()).to.equal("modules.wfst.error.allLayersNotSelected");
    });
    it("renders a container including the failure message that the current layer has not been selected in the layer tree", async () => {
        exampleLayerOne.visibility = false;
        exampleLayerTwo.visibility = true;
        allLayerConfigs = [];
        store.commit("Modules/Wfst/setLayerIds", layerIds);
        store.commit("Modules/Wfst/setLayerInformation", [{...exampleLayerOne, visibility: false}, exampleLayerTwo]);
        store.commit("Modules/Wfst/setFeatureProperties");


        wrapper = shallowMount(WfsTransaction, {
            global: {
                plugins: [store]
            }
        });
        wrapper.vm.setCurrentLayerIndex = 0;

        wrapper.vm.setLayerIds = [{...exampleLayerOne, visibility: false}, exampleLayerTwo];
        wrapper.vm.setLayerInformation = [{...exampleLayerOne, visibility: false}, exampleLayerTwo];
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".tool-wfs-transaction-layer-failure").exists()).to.be.true;
        expect(wrapper.find(".tool-wfs-transaction-layer-failure").text()).to.equal("modules.wfst.error.allLayersNotSelected");
    });
    it("renders a form which includes a label and an input element for every gfi attribute of the layer", async () => {
        exampleLayerOne.visibility = true;
        store.commit("Modules/Wfst/setLineButton", [{
            layerId: exampleLayerOne.id,
            available: true
        }]);
        store.commit("Modules/Wfst/setSelectedInteraction", "insert");
        store.commit("Modules/Wfst/setLayerIds", layerIds);
        store.commit("Modules/Wfst/setLayerInformation", [exampleLayerOne, exampleLayerTwo]);
        wrapper = shallowMount(WfsTransaction, {
            global: {
                plugins: [store]
            }});
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-wfs-transaction-form").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-form-input-stringAtt").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-form-input-stringAtt").attributes().type).to.equal("text");
        expect(wrapper.find("#tool-wfs-transaction-form-input-numAtt").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-form-input-numAtt").attributes().type).to.equal("number");
        expect(wrapper.find("#tool-wfs-transaction-form-input-shortAtt").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-form-input-shortAtt").attributes().type).to.equal("number");
        expect(wrapper.find("#tool-wfs-transaction-form-input-floatAtt").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-form-input-floatAtt").attributes().type).to.equal("number");
        expect(wrapper.find("#tool-wfs-transaction-form-input-boolAtt").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-form-input-boolAtt").attributes().type).to.equal("checkbox");
        expect(wrapper.find("#tool-wfs-transaction-form-input-dateAtt").exists()).to.be.true;
        expect(wrapper.find("#tool-wfs-transaction-form-input-dateAtt").attributes().type).to.equal("date");
        expect(wrapper.find(".tool-wfs-transaction-form-buttons").exists()).to.be.true;
    });
});
