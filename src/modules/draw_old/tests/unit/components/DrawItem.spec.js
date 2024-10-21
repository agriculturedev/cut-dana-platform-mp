import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import DrawItemComponent from "../../../components/DrawItem.vue";
import Draw_old from "../../../store/indexDraw";
import {expect} from "chai";
import sinon from "sinon";
import main from "../../../js/main";

config.global.mocks.$t = key => key;
config.global.mocks.$i18n = {
    i18next: {
        exists: sinon.stub(),
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

describe("src/modules/draw/components/DrawItem.vue", () => {
    let store,
        wrapper,
        componentData;

    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            getLayers: () => {
                return {
                    getArray: () => []
                };
            }
        };

        main.getApp().config.globalProperties.$layer = {
            visible: true,
            getVisible: () => main.getApp().config.globalProperties.$layer.visible,
            setVisible: value => {
                main.getApp().config.globalProperties.$layer.visible = value;
            },
            getSource: () => {
                return {
                    getFeatures: () => []
                };
            }
        };

        store = createStore({
            modules: {
                Maps: {
                    namespaced: true,
                    actions: {
                        addLayer: sinon.stub(),
                        checkLayer: sinon.stub(),
                        addInteraction: sinon.stub()
                    },
                    getters: {
                        mode: () => "2D"
                    }
                },
                Modules: {
                    namespaced: true,
                    modules: {
                        Draw_old
                    }
                }
            }
        });
        componentData = () => {
            return {
                mapElement: {style: {cursor: "pointer"}},
                constants: {},
                drawing: true
            };
        };
        store.dispatch("Modules/Draw_old/startInteractions");

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }

        wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData, attachTo: elem});
        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#tool-draw-drawType").element).to.equal(document.activeElement);
    });
    it("should hide layer and disable controls", async () => {
        wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
        expect(wrapper.find("#tool-draw-drawLayerVisible").exists()).to.be.true;

        expect(wrapper.vm.drawLayerVisible).to.be.true;
        expect(wrapper.vm.layer.getVisible()).to.be.true;
        expect(wrapper.find("#tool-draw-drawType").element.disabled).to.be.false;
        expect(wrapper.find("#tool-draw-undoInteraction").element.disabled).to.be.false;
        expect(wrapper.find("#tool-draw-redoInteraction").element.disabled).to.be.false;
        expect(wrapper.find("#tool-draw-deleteInteraction").element.disabled).to.be.false;
        expect(wrapper.find("#tool-draw-deleteAllInteraction").element.disabled).to.be.false;

        wrapper.find("#tool-draw-drawLayerVisible").trigger("click").then(() => {
            expect(wrapper.vm.drawLayerVisible).to.be.false;
            expect(wrapper.vm.layer.getVisible()).to.be.false;
            expect(wrapper.find("#tool-draw-drawType").element.disabled).to.be.true;
            expect(wrapper.find("#tool-draw-drawInteraction").element.disabled).to.be.true;
            expect(wrapper.find("#tool-draw-undoInteraction").element.disabled).to.be.true;
            expect(wrapper.find("#tool-draw-redoInteraction").element.disabled).to.be.true;
            expect(wrapper.find("#tool-draw-editInteraction").element.disabled).to.be.true;
            expect(wrapper.find("#tool-draw-deleteInteraction").element.disabled).to.be.true;
            expect(wrapper.find("#tool-draw-deleteAllInteraction").element.disabled).to.be.true;
        });

    });

    describe("addSymbolsByLayerModels", () => {
        it("should do nothing if anything but an array is given", () => {
            const iconListLength = Draw_old.state.iconList.length;

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});

            wrapper.vm.addSymbolsByLayerModels(undefined);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);

            wrapper.vm.addSymbolsByLayerModels(null);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);

            wrapper.vm.addSymbolsByLayerModels(1234);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);

            wrapper.vm.addSymbolsByLayerModels("string");
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);

            wrapper.vm.addSymbolsByLayerModels(true);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);

            wrapper.vm.addSymbolsByLayerModels(false);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);

            wrapper.vm.addSymbolsByLayerModels({});
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should do nothing if layer models are no objects", () => {
            const iconListLength = Draw_old.state.iconList.length;

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels([undefined, null, 1234, "string", true, false, []]);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should do nothing if layer models have no get function", () => {
            const iconListLength = Draw_old.state.iconList.length;

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels([{}, {something: 1}]);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should do nothing if legend of layer models are no array", () => {
            const iconListLength = Draw_old.state.iconList.length,
                layerModels = [
                    {
                        get: () => false
                    }
                ];

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels(layerModels);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should do nothing if legend infos have no style object", () => {
            const iconListLength = Draw_old.state.iconList.length,
                layerModels = [
                    {
                        get: () => [undefined, null, 1234, "string", true, false, [], {}]
                    }
                ];

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels(layerModels);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should do nothing if legend infos have no imageScale that are numbers", () => {
            const iconListLength = Draw_old.state.iconList.length,
                layerModels = [
                    {
                        get: () => [
                            {
                                styleObject: {
                                    get: what => {
                                        if (what === "imageScale") {
                                            return false;
                                        }
                                        else if (what === "imagePath") {
                                            return "imagePath/";
                                        }
                                        else if (what === "imageName") {
                                            return "imageName";
                                        }
                                        return false;
                                    }
                                }
                            }
                        ]
                    }
                ];

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels(layerModels);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should do nothing if legend infos have no imagePath that are strings", () => {
            const iconListLength = Draw_old.state.iconList.length,
                layerModels = [
                    {
                        get: () => [
                            {
                                styleObject: {
                                    get: what => {
                                        if (what === "imageScale") {
                                            return 1;
                                        }
                                        else if (what === "imagePath") {
                                            return false;
                                        }
                                        else if (what === "imageName") {
                                            return "imageName";
                                        }
                                        return false;
                                    }
                                }
                            }
                        ]
                    }
                ];

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels(layerModels);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should do nothing if legend infos have no imageName that is a string and not empty", () => {
            const iconListLength = Draw_old.state.iconList.length,
                layerModels = [
                    {
                        get: () => [
                            {
                                styleObject: {
                                    get: what => {
                                        if (what === "imageScale") {
                                            return 1;
                                        }
                                        else if (what === "imagePath") {
                                            return "imagePath/";
                                        }
                                        else if (what === "imageName") {
                                            return "";
                                        }
                                        return false;
                                    }
                                }
                            }
                        ]
                    }
                ];

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels(layerModels);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
        it("should add the expected symbol", () => {
            const iconListLength = Draw_old.state.iconList.length,
                layerModels = [
                    {
                        get: () => [
                            {
                                styleObject: {
                                    get: what => {
                                        if (what === "imageScale") {
                                            return 1;
                                        }
                                        else if (what === "imagePath") {
                                            return "imagePath/";
                                        }
                                        else if (what === "imageName") {
                                            return "imageName";
                                        }
                                        return false;
                                    }
                                }
                            }
                        ]
                    }
                ];

            wrapper = shallowMount(DrawItemComponent, {global: {plugins: [store]}, data: componentData});
            wrapper.vm.addSymbolsByLayerModels(layerModels);
            expect(Draw_old.state.iconList.length).to.equal(iconListLength);
        });
    });
});
