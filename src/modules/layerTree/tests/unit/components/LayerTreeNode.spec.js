import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import {treeBaselayersKey, treeSubjectsKey} from "../../../../../shared/js/utils/constants";
import LayerTreeNode from "../../../components/LayerTreeNode.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/LayerTreeNode.vue", () => {
    let store,
        wrapper,
        mapMode,
        layerBG_1,
        layerBG_2,
        layers2D,
        layers3D,
        layer2D_1,
        layer2D_2,
        layer2D_3,
        layer3D,
        subjectDataLayers,
        layersWithFolder,
        layersBG,
        addLayerButton,
        treeType,
        removeLayerSpy,
        setRemoveOnSpillSpy;

    beforeEach(() => {
        mapMode = "2D";
        removeLayerSpy = sinon.spy();
        setRemoveOnSpillSpy = sinon.spy();
        addLayerButton = {
            active: false
        };
        treeType = "";
        layer2D_1 = {
            id: "1",
            name: "layer2D_1",
            typ: "WMS",
            type: "layer",
            visibility: false,
            showInLayerTree: true
        };
        layer2D_2 = {
            id: "2",
            name: "layer2D_2",
            typ: "WFS",
            type: "layer",
            visibility: false,
            showInLayerTree: true
        };
        layer2D_3 = {
            id: "2D_3",
            name: "layer2D_3",
            typ: "WFS",
            type: "layer",
            visibility: false,
            showInLayerTree: true
        };
        layer3D = {
            id: "3",
            name: "layer3D",
            typ: "Terrain3D",
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
            showInLayerTree: true,
            isNeverVisibleInTree: true
        };
        layers2D = [
            layer2D_1,
            layer2D_2
        ];
        layers3D = [
            layer3D
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
                        elements: [layer2D_1, layer2D_2,
                            {
                                name: "Titel Ebene 3",
                                type: "folder",
                                elements: [layer2D_3]
                            }]
                    }
                ]
            }];
        subjectDataLayers = layers2D;
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        LayerTreeNode,
                        LayerInformation: {
                            namespaced: true,
                            getters: {
                                icon: sinon.stub(),
                                pointOfContact: () => "ABC Kontakt",
                                publisher: () => ""
                            }
                        },
                        LayerTree: {
                            namespaced: true,
                            getters: {
                                delay: () => 500,
                                delayOnTouchOnly: () => true,
                                removeOnSpill: () => true,
                                touchStartThreshold: () => 3
                            },
                            actions: {
                                removeLayer: removeLayerSpy
                            },
                            mutations: {
                                setRemoveOnSpill: setRemoveOnSpillSpy
                            }
                        },
                        LayerSelection: {
                            namespaced: true,
                            getters: {
                                highlightLayerId: sinon.stub()
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
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => mapMode
                    }
                }
            },
            getters: {
                isModuleAvailable: () => () => true,
                allLayerConfigs: () => layersBG.concat(subjectDataLayers),
                layerConfig: () => {
                    return {
                        [treeSubjectsKey]: {
                            elements: subjectDataLayers
                        },
                        [treeBaselayersKey]: {
                            elements: layersBG
                        }
                    };
                },
                layerConfigsByAttributes: () => () => [],
                portalConfig: () => {
                    return {
                        tree: {
                            type: treeType,
                            addLayerButton: addLayerButton
                        }
                    };
                },
                showLayerAddButton: () => addLayerButton.active,
                showFolderPath: () => true
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });


    it("renders a simple layer", () => {
        wrapper = mount(LayerTreeNode, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".no-list").exists()).to.be.true;
        expect(wrapper.findAll("layer-tree-node-stub").length).to.be.equals(0);
        expect(wrapper.find(".dragArea").exists()).to.be.true;
        expect(wrapper.find("ul").exists()).to.be.true;
        expect(wrapper.findAll("li").length).to.be.equals(4);
        expect(wrapper.vm.getLayerArray(layer2D_1)).to.be.deep.equals([]);
        expect(wrapper.vm.getLayerArray(layer2D_2)).to.be.deep.equals([]);
        expect(wrapper.vm.getLayerArray(layerBG_1)).to.be.deep.equals([]);
        expect(wrapper.vm.getLayerArray(layerBG_2)).to.be.deep.equals([]);
        expect(wrapper.find("#layer-tree-layer-" + layer2D_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layer2D_2.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_2.id).exists()).to.be.false;
    });
    it("renders the LayerTree with 2D layers in folder structure", () => {
        subjectDataLayers = layersWithFolder;
        wrapper = mount(LayerTreeNode, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".no-list").exists()).to.be.true;
        expect(wrapper.find(".dragArea").exists()).to.be.true;
        expect(wrapper.find("ul").exists()).to.be.true;
        expect(wrapper.findAll("li").length).to.be.equals(3);
        expect(wrapper.find("li:nth-child(1) > div").exists()).to.be.true;
        expect(wrapper.find("li:nth-child(2) > div").exists()).to.be.false;
        // folder is only a li-tag with no children:
        expect(wrapper.find("li:nth-child(3) > div").exists()).to.be.false;
        expect(wrapper.vm.isLayerShowInLayerTree(layerBG_1)).to.be.true;
        expect(wrapper.vm.isLayerShowInLayerTree(layerBG_2)).to.be.false;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_2.id).exists()).to.be.false;
        expect(setRemoveOnSpillSpy.calledOnce).to.be.true;
    });

    it("renders the LayerTree with 3D layers", () => {
        mapMode = "3D";
        subjectDataLayers = layers2D.concat(layers3D);
        wrapper = mount(LayerTreeNode, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".no-list").exists()).to.be.true;
        expect(wrapper.find(".dragArea").exists()).to.be.true;
        expect(wrapper.find("ul").exists()).to.be.true;
        expect(wrapper.findAll("li").length).to.be.equals(5);
        expect(wrapper.vm.isLayerShowInLayerTree(layer2D_1)).to.be.true;
        expect(wrapper.vm.isLayerShowInLayerTree(layer2D_2)).to.be.true;
        expect(wrapper.vm.isLayerShowInLayerTree(layer3D)).to.be.true;
        expect(wrapper.vm.isLayerShowInLayerTree(layerBG_1)).to.be.true;
        expect(wrapper.vm.isLayerShowInLayerTree(layerBG_2)).to.be.false;
        expect(wrapper.find("#layer-tree-layer-" + layer2D_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layer2D_2.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layer3D.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_1.id).exists()).to.be.true;
        expect(wrapper.find("#layer-tree-layer-" + layerBG_2.id).exists()).to.be.false;
        expect(setRemoveOnSpillSpy.calledOnce).to.be.true;
    });
    describe("methods", () => {
        it("removeLayerOnSpill - calls removeLayer if showLayerAddButton is true", () => {
            wrapper = mount(LayerTreeNode, {
                global: {
                    plugins: [store]
                }
            });
            wrapper.vm.removeLayerOnSpill({oldIndex: 1});
            expect(removeLayerSpy.notCalled).to.be.true;
        });
        it("removeLayerOnSpill - calls not removeLayer if showLayerAddButton is false", () => {
            addLayerButton.active = true;
            wrapper = mount(LayerTreeNode, {
                global: {
                    plugins: [store]
                }
            });
            wrapper.vm.removeLayerOnSpill({oldIndex: 1});
            expect(removeLayerSpy.calledOnce).to.be.true;
            expect(setRemoveOnSpillSpy.notCalled).to.be.true;
        });
    });
});
