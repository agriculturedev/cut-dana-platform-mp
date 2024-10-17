import {createStore} from "vuex";
import {config, mount, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import {treeBaselayersKey, treeSubjectsKey} from "../../../../../shared/js/utils/constants";
import getNestedValues from "../../../../../shared/js/utils/getNestedValues";
import LayerTreeComponent from "../../../components/LayerTree.vue";
import LayerTree from "../../../store/indexLayerTree";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/LayerTree.vue", () => {
    let store,
        wrapper,
        mapMode,
        layerBG_1,
        layerBG_2,
        layers2D,
        layer_1,
        layer_2,
        layer_3,
        subjectDataLayers,
        layersWithFolder,
        layersBG,
        addLayerButton,
        treeType;

    beforeEach(() => {
        mapMode = "2D";
        treeType = "";
        addLayerButton = {
            active: false
        };
        layer_1 = {
            id: "1",
            name: "layer_1",
            typ: "WMS",
            type: "layer",
            visibility: false,
            showInLayerTree: true
        };
        layer_2 = {
            id: "2",
            name: "layer_2",
            typ: "WFS",
            type: "layer",
            visibility: false,
            showInLayerTree: true
        };
        layer_3 = {
            id: "2D_3",
            name: "layer_3",
            typ: "WFS",
            type: "layer",
            visibility: false,
            showInLayerTree: true
        };
        layerBG_1 = {
            id: "11",
            name: "layerBG_1",
            typ: "WMS",
            type: "layer",
            visibility: true,
            showInLayerTree: true
        };
        layerBG_2 = {
            id: "12",
            name: "layerBG_2",
            typ: "WFS",
            type: "layer",
            visibility: false,
            showInLayerTree: true
        };
        layers2D = [
            layer_1,
            layer_2
        ];
        layersBG = [
            layerBG_1,
            layerBG_2
        ];
        layersWithFolder = [
            {
                name: "Titel Ebene 1",
                type: "folder",
                elements: [
                    {
                        name: "Titel Ebene 2",
                        type: "folder",
                        elements: [layer_1, layer_2,
                            {
                                name: "Titel Ebene 3",
                                type: "folder",
                                elements: [layer_3]
                            }]
                    }
                ]
            }];
        subjectDataLayers = layers2D;
        store = createStore({
            modules: {
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => mapMode
                    }
                },
                Menu: {
                    namespaced: true,
                    actions: {
                        changeCurrentComponent: sinon.stub(),
                        setMenuBackAndActivateItem: sinon.stub()
                    },
                    modules: {
                        Navigation: {
                            namespaced: true,
                            getters: {
                                entries: sinon.stub(),
                                isModuleActiveInMenu: sinon.stub()
                            }
                        }
                    }
                },
                Modules: {
                    namespaced: true,
                    modules: {
                        LayerTree,
                        LayerInformation: {
                            namespaced: true,
                            getters: {
                                icon: sinon.stub(),
                                pointOfContact: () => "ABC Kontakt",
                                publisher: () => ""
                            }
                        },
                        LayerSelection: {
                            namespaced: true,
                            getters: {
                                name: () => sinon.stub(),
                                type: () => sinon.stub(),
                                highlightLayerId: () => sinon.stub()
                            },
                            mutations: {
                                setBaselayerConfs: sinon.stub(),
                                setSubjectDataLayerConfs: sinon.stub(),
                                setVisible: sinon.stub()
                            },
                            actions: {
                                navigateForward: sinon.stub()
                            }
                        },
                        Contact: {
                            namespaced: true,
                            getters: {
                                name: () => "Contactname",
                                type: () => "contact"
                            }
                        }
                    }
                }
            },
            getters: {
                isModuleAvailable: () => () => true,
                allLayerConfigsStructured: () => () =>{
                    return layersBG.concat(subjectDataLayers);
                },
                allLayerConfigs: () =>{
                    return layersBG.concat(subjectDataLayers);
                },
                portalConfig: () => {
                    return {
                        tree: {
                            type: treeType,
                            addLayerButton: addLayerButton
                        }
                    };
                },
                layerConfigsByAttributes: () => () => {
                    const layerConfigs = {
                            [treeSubjectsKey]: {
                                elements: subjectDataLayers
                            },
                            [treeBaselayersKey]: {
                                elements: layersBG
                            }
                        },
                        allConfigs = getNestedValues(layerConfigs, "elements", true).flat(Infinity);

                    return allConfigs.filter(conf => conf.showInLayerTree === true);
                },
                showLayerAddButton: () => addLayerButton.active,
                showFolderPath: () => true
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("no layer button - renders the LayerTree without layers", () => {
        subjectDataLayers = [];
        layersBG = [];
        wrapper = shallowMount(LayerTreeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-tree").exists()).to.be.true;
        expect(wrapper.findAll("layer-tree-node-stub").length).to.be.equals(1);
        expect(wrapper.find("#add-layer-btn").exists()).to.be.false;
    });

    it("with layer button - renders the LayerTree without layers", () => {
        subjectDataLayers = [];
        layersBG = [];
        addLayerButton = {
            active: true
        };
        wrapper = shallowMount(LayerTreeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-tree").exists()).to.be.true;
        expect(wrapper.findAll("layer-tree-node-stub").length).to.be.equals(1);
        expect(wrapper.find("#add-layer-btn").exists()).to.be.true;
    });

    it("no layer button - renders the LayerTree with 2D layers as children - check layers", () => {
        wrapper = mount(LayerTreeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-tree").exists()).to.be.true;
        expect(wrapper.findAll(".layer-tree-layer-checkbox").length).to.be.equals(4);
        expect(wrapper.find("#layer-tree-layer-" + layer_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layer_2.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_2.id).exists()).to.be.true;
    });

    it("no layer button - renders the LayerTree with 2D layers in folder structure - check layers", () => {
        subjectDataLayers = layersWithFolder;
        wrapper = mount(LayerTreeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#layer-tree").exists()).to.be.true;
        expect(wrapper.findAll("li").length).to.be.equals(3);
        expect(wrapper.find("li:nth-child(1) > div").exists()).to.be.true;
        expect(wrapper.find("li:nth-child(2) > div").exists()).to.be.true;
        // folder is only a li-tag with no children:
        expect(wrapper.find("li:nth-child(3) > div").exists()).to.be.false;
        // 2 bg-layer
        expect(wrapper.findAll(".layer-tree-layer-checkbox").length).to.be.equals(2);
        expect(wrapper.find("#layer-tree-layer-" + layerBG_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_2.id).exists()).to.be.true;
    });

    it("click on add layer button shall call showLayerSelection", async () => {
        const spy = sinon.spy(LayerTreeComponent.methods, "showLayerSelection");
        let button = null;

        addLayerButton = {
            active: true
        };
        wrapper = mount(LayerTreeComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#layer-tree").exists()).to.be.true;
        expect(wrapper.findAll("#add-layer-btn").length).to.be.equals(1);

        button = wrapper.find("#add-layer-btn");
        button.trigger("click");
        await wrapper.vm.$nextTick();
        expect(spy.calledOnce).to.be.true;
    });

    it("with layer button - shows the default title", () => {
        subjectDataLayers = [];
        layersBG = [];
        addLayerButton = {
            active: true
        };
        wrapper = shallowMount(LayerTreeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#add-layer-btn").attributes().text).to.be.equals("common:modules.layerTree.addLayer");
    });

    it("with layer button - shows the configurable title", () => {
        subjectDataLayers = [];
        layersBG = [];
        addLayerButton = {
            active: true,
            "buttonTitle": "test"
        };
        wrapper = shallowMount(LayerTreeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#add-layer-btn").attributes().text).to.be.equals("test");
    });
});
