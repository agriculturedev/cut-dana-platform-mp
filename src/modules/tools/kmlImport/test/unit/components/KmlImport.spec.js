import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import KmlImportComponent from "../../../components/KmlImport.vue";
import KmlImport from "../../../store/indexKmlImport";
import {expect} from "chai";
import sinon from "sinon";
import rawSources from "../../ressources/rawSources.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import DOMParser from "xmldom";
import VueI18Next from "@panter/vue-i18next";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("KmlImport.vue", () => {
    const mockMapGetters = {
           // ...
        },
        mockMapActions = {
            // setResolutionByIndex: sinon.stub()
        },
        mockMapMutations = {
            // setScale: sinon.stub()
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            kmlimport:
                            {
                                //"name": "translate#common:menu.tools.kmlImport",
                                "glyphicon": "glyphicon-resize-full",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };
    let store;


    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        KmlImport
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.dispatch("Tools/KmlImport/setActive", true);
    });

    it("renders the kmlImport", () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue});

        expect(wrapper.find("#kml-import").exists()).to.be.true;
    });

    it("do not render the kmlImport tool if not active", () => {
        store.dispatch("Tools/KmlImport/setActive", false);
        const wrapper = shallowMount(KmlImportComponent, {store, localVue});

        expect(wrapper.find("#kml-import").exists()).to.be.false;
    });

    it("import method is initially set to \"auto\"", () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue});

        expect(wrapper.vm.selectedFiletype).to.equal("auto");
    });

    /*
    it("Kml file should add some features to the current draw layer", async () => {
        const
            wrapper = shallowMount(KmlImportComponent, {store, localVue}),
            source = new VectorSource(),
            layer = new VectorLayer({
                name: name,
                source: source,
                alwaysOnTop: true
            });
            
        let resultObj;
        
        resultObj = store.dispatch("Tools/KmlImport/importKML", {raw: rawSources[0], layer, filename: "test.kml"});
        await wrapper.vm.$nextTick();
    });
    */

    /*
    it("has initially selected current scale", async () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue}),
            options = wrapper.findAll("option");

        // now the map sets it scale and the KmlImport watches for it and sets it currentScale
        store.commit("Tools/KmlImport/setCurrentScale", scales[1]);
        await wrapper.vm.$nextTick();
        // the option should be selected
        expect(options.at(1).attributes().selected).to.equals("true");
    });

    it("select another scale changes scale in map", async () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue}),
            options = wrapper.findAll("option");

        options.at(1).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(1).attributes().selected).to.equals("true");
        expect(options.at(0).attributes().selected).to.be.undefined;
        expect(options.at(2).attributes().selected).to.be.undefined;
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledOnce).to.equal(true);

        options.at(2).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(2).attributes().selected).to.equals("true");
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledTwice).to.equal(true);
    });

    it("has initially selected current scale", async () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue}),
            options = wrapper.findAll("option");

        // now the map sets it scale and the KmlImport watches for it and sets it currentScale
        store.commit("Tools/KmlImport/setCurrentScale", scales[1]);
        await wrapper.vm.$nextTick();
        // the option should be selected
        expect(options.at(1).attributes().selected).to.equals("true");
    });

    it("method selectionChanged shall change currentScale", async () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue}),
            event = {
                target: {
                    value: scales[1],
                    selectedIndex: 1
                }
            };

        wrapper.vm.selectionChanged(event);
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.KmlImport.currentScale).to.equals(scales[1]);
    });

    it("method close sets active to false", async () => {
        const wrapper = shallowMount(KmlImportComponent, {store, localVue});

        wrapper.vm.close();
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.KmlImport.active).to.be.false;
        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });
    */


});
