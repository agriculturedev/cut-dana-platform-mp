import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import layerFactory from "../../../../../core/layers/js/layerFactory";
import SelectAllCheckBox from "../../../components/SelectAllCheckBox.vue";
import layerCollection from "../../../../../core/layers/js/layerCollection";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/SelectAllCheckBox.vue", () => {
    let store,
        wrapper,
        layer,
        propsData,
        changeVisibilitySpy;

    before(function () {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        layer = {
            id: "1",
            name: "layer",
            typ: "WMS",
            visibility: false,
            showInLayerTree: true
        };
        propsData = {
            confs: [layer]
        };

        changeVisibilitySpy = sinon.spy();
        sinon.stub(layerFactory, "getLayerTypes3d").returns(["TERRAIN3D"]);
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        SelectAllCheckBox,
                        LayerSelection: {
                            namespaced: true,
                            getters: {
                                encompassingBoundingBox: () => [0, 0, 0, 0]
                            },
                            mutations: {
                                setEncompassingBoundingBox: () => sinon.spy()
                            },
                            actions: {
                                changeVisibility: changeVisibilitySpy
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: {
                        zoomToExtent: sinon.spy()
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders a select all checkbox", () => {
        wrapper = shallowMount(SelectAllCheckBox, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#select-all-layers-" + layer.id).exists()).to.be.true;
    });

    it("renders select all checkbox - unchecked", () => {
        wrapper = shallowMount(SelectAllCheckBox, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#select-all-layers-" + layer.id).exists()).to.be.true;
        expect(wrapper.findAll(".layer-tree-select-all").length).to.be.equals(1);
        expect(wrapper.find("#select-all-checkbox-" + layer.id).exists()).to.be.true;
        expect(wrapper.findAll(".bi-square").length).to.be.equals(1);
        expect(wrapper.findAll(".bi-check-square").length).to.be.equals(0);
        expect(wrapper.find(".layer-tree-layer-label").text()).to.equal("modules.layerSelection.selectAll");
    });

    it("renders select all checkbox - checked", () => {
        layer.visibility = true;
        wrapper = shallowMount(SelectAllCheckBox, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#select-all-layers-" + layer.id).exists()).to.be.true;
        expect(wrapper.findAll(".layer-tree-select-all").length).to.be.equals(1);
        expect(wrapper.find("#select-all-checkbox-" + layer.id).exists()).to.be.true;
        expect(wrapper.findAll(".bi-square").length).to.be.equals(0);
        expect(wrapper.findAll(".bi-check-square").length).to.be.equals(1);
        expect(wrapper.find(".layer-tree-layer-label").text()).to.equal("modules.layerSelection.deselectAll");
    });

    it("click on checkbox shall call changeVisibility with true", async () => {
        let checkbox = null;

        wrapper = shallowMount(SelectAllCheckBox, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#select-all-layers-" + layer.id).exists()).to.be.true;
        expect(wrapper.findAll("#select-all-checkbox-" + layer.id).length).to.be.equals(1);
        expect(wrapper.findAll(".bi-square").length).to.be.equals(1);

        checkbox = wrapper.find("#select-all-checkbox-" + layer.id);
        checkbox.trigger("click");
        await wrapper.vm.$nextTick();
        expect(changeVisibilitySpy.calledOnce).to.be.true;
        expect(changeVisibilitySpy.firstCall.args[1]).to.be.deep.equals({layerId: layer.id, value: true});
    });

    it("click on checkbox shall call changeVisibility with false", async () => {
        let checkbox = null;

        layer.visibility = true;

        wrapper = shallowMount(SelectAllCheckBox, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find("#select-all-layers-" + layer.id).exists()).to.be.true;
        expect(wrapper.findAll("#select-all-checkbox-" + layer.id).length).to.be.equals(1);
        expect(wrapper.findAll(".bi-check-square").length).to.be.equals(1);

        checkbox = wrapper.find("#select-all-checkbox-" + layer.id);
        checkbox.trigger("click");
        await wrapper.vm.$nextTick();
        expect(changeVisibilitySpy.calledOnce).to.be.true;
        expect(changeVisibilitySpy.firstCall.args[1]).to.be.deep.equals({layerId: layer.id, value: false});
    });

    describe("Methods", () => {
        it("method calculateEncompassingBoundingBox shall set the boundingbox and call zoomToExtent", () => {
            const setEncompassingBoundingBox = sinon.spy(SelectAllCheckBox.methods, "setEncompassingBoundingBox"),
                zoomToExtent = sinon.spy(SelectAllCheckBox.methods, "zoomToExtent"),
                conf = {
                    id: "2",
                    attributes: {
                        boundingBox: [[0, 1], [2, 3]]
                    }
                };

            sinon.stub(layerCollection, "getLayerById").returns(conf);
            propsData = {
                confs: [layer, {id: "2"}]
            };
            wrapper = shallowMount(SelectAllCheckBox, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            wrapper.vm.calculateEncompassingBoundingBox(conf);

            expect(setEncompassingBoundingBox.calledOnce).to.be.true;
            expect(setEncompassingBoundingBox.calledWith([0, 0, 2, 3])).to.be.true;
            expect(zoomToExtent.calledOnce).to.be.true;
        });

        it("method ids shall return the expected string", () => {
            let ids = null;

            propsData = {
                confs: [layer, {id: "2"}]
            };
            wrapper = shallowMount(SelectAllCheckBox, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            ids = wrapper.vm.ids();

            expect(ids).to.be.deep.equals("1-2");
        });
        it("method getLabelText shall return text for not checked boxes", () => {
            let text = null;

            sinon.stub(SelectAllCheckBox.methods, "isChecked").returns(false);
            propsData = {
                confs: [layer, {id: "2"}]
            };
            wrapper = shallowMount(SelectAllCheckBox, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            text = wrapper.vm.getLabelText();

            expect(text).to.be.equals("modules.layerSelection.selectAll");
        });
        it("method getLabelText shall return text for checked boxes", () => {
            let text = null;

            sinon.stub(SelectAllCheckBox.methods, "isChecked").returns(true);
            propsData = {
                confs: [layer, {id: "2"}]
            };
            wrapper = shallowMount(SelectAllCheckBox, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            text = wrapper.vm.getLabelText();

            expect(text).to.be.equals("modules.layerSelection.deselectAll");
        });
    });
});
