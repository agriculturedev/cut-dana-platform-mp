import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Feature from "ol/Feature.js";
import modifyInteraction from "@masterportal/masterportalapi/src/maps/interactions/modifyInteraction";
import {pointerMove} from "ol/events/condition.js";
import {Select} from "ol/interaction.js";
import selectInteraction from "@masterportal/masterportalapi/src/maps/interactions/selectInteraction";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector";

import DrawEditComponent from "../../../components/DrawEdit.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/draw/components/DrawEdit.vue", () => {
    let addInteractionSpy,
        createModifyInteractionSpy,
        createSelectInteractionSpy,
        layer,
        removeInteractionSpy,
        removeSelectedFeatureSpy,
        store,
        wrapper;

    beforeEach(() => {
        addInteractionSpy = sinon.spy();
        createModifyInteractionSpy = sinon.spy(modifyInteraction, "createModifyInteraction");
        createSelectInteractionSpy = sinon.spy(selectInteraction, "createSelectInteraction");
        layer = new VectorLayer({source: new VectorSource()});
        removeSelectedFeatureSpy = sinon.spy(selectInteraction, "removeSelectedFeature");
        removeInteractionSpy = sinon.spy();


        store = createStore({
            modules: {
                Maps: {
                    namespaced: true,
                    actions: {
                        addInteraction: addInteractionSpy,
                        removeInteraction: removeInteractionSpy
                    },
                    getters: {
                        projection: () => "EPSG:4326"
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the drawEdits, if undoFeatures or redoFeatures length > 0", async () => {
        wrapper = shallowMount(DrawEditComponent, {
            propsData: {
                layer
            },
            global: {
                plugins: [store]
            }
        });

        wrapper.setData({undoFeatures: ["feature"]});
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#draw-edit-deleteAll").exists()).to.be.true;
        expect(wrapper.find("#draw-edit-deleteAll").attributes().aria).to.equals("common:shared.modules.draw.drawEdit.deleteAll");

        expect(wrapper.find("#draw-edit-delete").exists()).to.be.true;
        expect(wrapper.find("#draw-edit-delete").attributes().aria).to.equals("common:shared.modules.draw.drawEdit.delete");

        expect(wrapper.find("#draw-edit-edit").exists()).to.be.true;
        expect(wrapper.find("#draw-edit-edit").attributes().aria).to.equals("common:shared.modules.draw.drawEdit.edit");

        expect(wrapper.find("#draw-edit-undo").exists()).to.be.true;
        expect(wrapper.find("#draw-edit-undo").attributes().aria).to.equals("common:shared.modules.draw.drawEdit.undo");

        expect(wrapper.find("#draw-edit-redo").exists()).to.be.true;
        expect(wrapper.find("#draw-edit-redo").attributes().aria).to.equals("common:shared.modules.draw.drawEdit.redo");
    });

    describe("regulateDelete", () => {
        it("should create select interactons for deleteting features", () => {
            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateDelete();

            expect(createSelectInteractionSpy.calledTwice).to.be.true;
            expect(createSelectInteractionSpy.firstCall.args[0]).to.deep.equals(layer);
            expect(createSelectInteractionSpy.secondCall.args[0]).to.deep.equals(layer);
            expect(createSelectInteractionSpy.secondCall.args[1]).to.deep.equals(pointerMove);

            expect(removeSelectedFeatureSpy.calledOnce).to.be.true;
            expect(removeSelectedFeatureSpy.firstCall.args[0]).to.deep.equals(wrapper.vm.currentSelectInteractions[0]);
            expect(removeSelectedFeatureSpy.firstCall.args[1]).to.deep.equals(wrapper.vm.source);

            expect(addInteractionSpy.calledTwice).to.be.true;
            expect(addInteractionSpy.firstCall.args[1]).to.deep.equals(wrapper.vm.currentSelectInteractions[0]);
            expect(addInteractionSpy.secondCall.args[1]).to.deep.equals(wrapper.vm.currentSelectInteractions[1]);
        });
    });

    describe("createSelectInteractions", () => {
        it("should create two select interactons for deleteting features", () => {
            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            const currentSelectInteractions = wrapper.vm.createSelectInteractions(layer);

            expect(currentSelectInteractions.length).to.equals(2);
            expect(currentSelectInteractions[0] instanceof Select).to.be.true;
            expect(currentSelectInteractions[1] instanceof Select).to.be.true;
        });
    });

    describe("regulateDeleteAll", () => {
        it("should clear vector source", async () => {
            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateDeleteAll();

            expect(wrapper.vm.mode).to.equals("");
            expect(wrapper.vm.source.getFeatures()).to.deep.equals([]);
        });
    });

    describe("regulateModify", () => {
        it("should create modify interaction", async () => {
            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateModify();

            expect(createModifyInteractionSpy.calledOnce).to.be.true;
            expect(createModifyInteractionSpy.firstCall.args[0]).to.deep.equals(wrapper.vm.source);

            expect(removeInteractionSpy.calledOnce).to.be.true;
            expect(removeInteractionSpy.firstCall.args[1]).to.be.null;

            expect(addInteractionSpy.calledOnce).to.be.true;
            expect(addInteractionSpy.firstCall.args[1]).to.deep.equals(wrapper.vm.currentModifyInteraction);
        });
    });

    describe("regulateUndo and regulateRedo", () => {
        let undoRedoFeaturesSpy;

        beforeEach(() => {
            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            undoRedoFeaturesSpy = sinon.spy(wrapper.vm, "undoRedoFeatures");
        });

        it("should start undoRedoFeatures with 'undo'", async () => {
            wrapper.vm.regulateUndo();

            expect(undoRedoFeaturesSpy.calledOnce).to.be.true;
            expect(undoRedoFeaturesSpy.firstCall.args[0]).to.deep.equals(wrapper.vm.undoFeatures);
            expect(undoRedoFeaturesSpy.firstCall.args[1]).to.equals("undo");
        });

        it("should start undoRedoFeatures with 'redo'", async () => {
            wrapper.vm.regulateRedo();

            expect(undoRedoFeaturesSpy.calledOnce).to.be.true;
            expect(undoRedoFeaturesSpy.firstCall.args[0]).to.deep.equals(wrapper.vm.redoFeatures);
            expect(undoRedoFeaturesSpy.firstCall.args[1]).to.equals("redo");
        });
    });

    describe("undoRedoFeatures", () => {
        let feature1,
            feature2,
            undoRedoDeleteAllSpy;

        beforeEach(() => {
            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            undoRedoDeleteAllSpy = sinon.spy(wrapper.vm, "undoRedoDeleteAll");

            feature1 = new Feature();
            feature2 = new Feature();
        });

        it("should remove the last feature from source, if feature mode is 'draw'", async () => {
            const features = [
                    {
                        feature: feature1,
                        mode: "draw"
                    },
                    {
                        feature: feature2,
                        mode: "draw"
                    }
                ],
                mode = "undo";

            wrapper.vm.source.addFeatures([feature1, feature2]);
            wrapper.vm.undoRedoFeatures(features, mode);

            expect(wrapper.vm.source.getFeatures().length).to.equals(1);
            expect(wrapper.vm.source.getFeatures()[0]).to.deep.equals(feature1);
        });

        it("should add the last feature from source, if feature mode is 'delete'", async () => {
            const features = [
                    {
                        feature: feature1,
                        mode: "delete"
                    },
                    {
                        feature: feature2,
                        mode: "delete"
                    }
                ],
                mode = "redo";

            wrapper.vm.source.addFeatures([feature1]);
            wrapper.vm.undoRedoFeatures(features, mode);

            expect(wrapper.vm.source.getFeatures().length).to.equals(2);
            expect(wrapper.vm.source.getFeatures()[0]).to.deep.equals(feature1);
            expect(wrapper.vm.source.getFeatures()[1]).to.deep.equals(feature2);
        });

        it("should start undoRedoDeleteAllSpy, if the last feature is an array", () => {
            const features = [
                    [
                        feature1,
                        feature2
                    ]
                ],
                mode = "redo";

            wrapper.vm.undoRedoFeatures(features, mode);

            expect(undoRedoDeleteAllSpy.calledOnce).to.be.true;
            expect(undoRedoDeleteAllSpy.firstCall.args[0]).to.equals(mode);
            expect(undoRedoDeleteAllSpy.firstCall.args[1]).to.deep.equals(features);
            expect(undoRedoDeleteAllSpy.firstCall.args[2]).to.deep.equals(wrapper.vm.source);
        });
    });

    describe("isDeleteAllMode", () => {
        beforeEach(() => {
            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });
        });

        it("should return true, if feature is an array", () => {
            const feature = ["feature1", "feature2"];

            expect(wrapper.vm.isDeleteAllMode(feature)).to.be.true;
        });

        it("should return false, if feature is not an array", () => {
            const feature = "feature1";

            expect(wrapper.vm.isDeleteAllMode(feature)).to.be.false;
        });
    });

    describe("undoRedoDeleteAll", () => {
        let feature1,
            feature2;

        beforeEach(() => {
            feature1 = new Feature();
            feature2 = new Feature();
        });

        it("should add all features to vector source, if mode === undo", () => {
            const mode = "undo",
                features = [
                    [
                        feature1,
                        feature2
                    ]
                ];

            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.undoRedoDeleteAll(mode, features, wrapper.vm.source);

            expect(wrapper.vm.source.getFeatures().length).to.equals(2);
            expect(wrapper.vm.source.getFeatures()[0]).to.deep.equals(feature1);
            expect(wrapper.vm.source.getFeatures()[1]).to.deep.equals(feature2);
            expect(wrapper.vm.redoFeatures.length).to.equals(1);
            expect(wrapper.vm.redoFeatures[0]).to.deep.equals([feature1, feature2]);
            expect(wrapper.vm.mode).to.equals("");
        });

        it("should remove all features from vector source, if mode === redo", async () => {
            const mode = "redo",
                features = [
                    [
                        feature1,
                        feature2
                    ]
                ];

            layer.getSource().addFeatures([feature1, feature2]);

            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.undoRedoDeleteAll(mode, features, wrapper.vm.source);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.source.getFeatures().length).to.equals(0);
            expect(wrapper.vm.undoFeatures.length).to.equals(1);
            expect(wrapper.vm.undoFeatures[0]).to.deep.equals([feature1, feature2]);
            expect(wrapper.vm.mode).to.equals("");
        });
    });

    describe("shiftUndoRedoFeatures", () => {
        it("should move feature from undoFeatures to redoFeatures, if mode === undo", () => {
            const feature = new Feature(),
                featureMode = "draw";

            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.shiftUndoRedoFeatures(feature, featureMode, "undo");

            expect(wrapper.vm.mode).to.equals("");
            expect(wrapper.vm.undoFeatures).to.deep.equals([]);
            expect(wrapper.vm.redoFeatures).to.deep.equals([
                {
                    feature: feature,
                    mode: featureMode
                }
            ]);
        });

        it("should move feature from redoFeatures to undoFeatures, if mode === redo", () => {
            const feature = new Feature(),
                featureMode = "draw";

            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.shiftUndoRedoFeatures(feature, featureMode, "redo");

            expect(wrapper.vm.mode).to.equals("");
            expect(wrapper.vm.redoFeatures).to.deep.equals([]);
            expect(wrapper.vm.undoFeatures).to.deep.equals([
                {
                    feature: feature,
                    mode: featureMode
                }
            ]);
        });

        it("should add feature to undoFeatures and clear redofeatures, if mode === ''", () => {
            const feature = new Feature(),
                featureMode = "draw";

            wrapper = shallowMount(DrawEditComponent, {
                propsData: {
                    layer
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.shiftUndoRedoFeatures(feature, featureMode, "redo");

            expect(wrapper.vm.mode).to.equals("");
            expect(wrapper.vm.redoFeatures).to.deep.equals([]);
            expect(wrapper.vm.undoFeatures).to.deep.equals([
                {
                    feature: feature,
                    mode: featureMode
                }
            ]);
        });
    });
});
