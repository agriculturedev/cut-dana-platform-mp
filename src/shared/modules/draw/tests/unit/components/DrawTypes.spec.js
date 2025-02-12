import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import drawInteraction from "@masterportal/masterportalapi/src/maps/interactions/drawInteraction";
import {expect} from "chai";
import sinon from "sinon";
import VectorSource from "ol/source/Vector";

import DrawTypesComponent from "../../../components/DrawTypes.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/draw/components/DrawTypes.vue", () => {
    let addInteractionSpy,
        createDrawInteractionSpy,
        currentLayout,
        drawCircleSpy,
        removeInteractionSpy,
        selectedInteraction,
        setSelectedDrawType,
        setSelectedDrawTypeMain,
        source,
        store,
        wrapper;

    beforeEach(() => {
        addInteractionSpy = sinon.spy();
        createDrawInteractionSpy = sinon.spy(drawInteraction, "createDrawInteraction");
        currentLayout = {
            fillColor: [55, 126, 184],
            fillTransparency: 0,
            strokeColor: [0, 0, 0],
            strokeWidth: 1
        };
        drawCircleSpy = sinon.spy(drawInteraction, "drawCircle");
        removeInteractionSpy = sinon.spy();
        selectedInteraction = "draw";
        setSelectedDrawType = sinon.spy();
        setSelectedDrawTypeMain = sinon.spy();
        source = new VectorSource();


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

    it("renders the drawTypes", () => {
        wrapper = shallowMount(DrawTypesComponent, {
            propsData: {
                currentLayout,
                setSelectedDrawType,
                source
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#draw-pen").exists()).to.be.true;
        expect(wrapper.find("#draw-pen").attributes().aria).to.equals("common:shared.modules.draw.drawTypes.pen");

        expect(wrapper.find("#draw-geometries").exists()).to.be.true;
        expect(wrapper.find("#draw-geometries").attributes().aria).to.equals("common:shared.modules.draw.drawTypes.geometries");

        expect(wrapper.find("#draw-symbols").exists()).to.be.true;
        expect(wrapper.find("#draw-symbols").attributes().aria).to.equals("common:shared.modules.draw.drawTypes.symbols");
    });

    describe("startDrawingInitial", () => {
        it("should start drawing initial, if selectedDrawTypeMain === 'pen' and selectedDrawType === 'pen'", () => {
            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    selectedDrawType: "pen",
                    selectedDrawTypeMain: "pen",
                    selectedInteraction,
                    setSelectedDrawType,
                    setSelectedDrawTypeMain,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            const regulateDrawInteractionSpy = sinon.spy(wrapper.vm, "regulateDrawInteraction");

            wrapper.vm.startDrawingInitial();

            expect(regulateDrawInteractionSpy.calledOnce).to.be.true;
            expect(regulateDrawInteractionSpy.firstCall.args[0]).to.equals("pen");
        });

        it("should start drawing initial, if selectedDrawTypeMain === '' and selectedDrawType === 'circle'", async () => {
            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    selectedDrawType: "circle",
                    selectedDrawTypeMain: "",
                    selectedInteraction,
                    setSelectedDrawType,
                    setSelectedDrawTypeMain,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            const regulateInteractionSpy = sinon.spy(wrapper.vm, "regulateInteraction");

            expect(setSelectedDrawType.calledOnce).to.be.true;
            expect(setSelectedDrawType.firstCall.args[0]).to.equals("");

            await wrapper.vm.$nextTick();

            expect(regulateInteractionSpy.calledOnce).to.be.true;
            expect(regulateInteractionSpy.firstCall.args[0]).to.equals("circle");
        });
    });

    describe("selectedInteraction", () => {
        beforeEach(() => {
            selectedInteraction = "delete";
        });

        it("should set selectedDrawType and selectedDrawTypeMain to empty string, if selectedInteraction is not 'draw'", () => {
            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    selectedInteraction,
                    setSelectedDrawType,
                    setSelectedDrawTypeMain,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.selectedInteraction.call(wrapper.vm, selectedInteraction);

            expect(setSelectedDrawType.calledOnce).to.be.true;
            expect(setSelectedDrawType.firstCall.args[0]).to.equals("");
            expect(setSelectedDrawTypeMain.calledOnce).to.be.true;
            expect(setSelectedDrawTypeMain.firstCall.args[0]).to.equals("");
        });
    });

    describe("regulateInteraction", () => {
        it("should remove current interaction and add new interaction", () => {
            const drawType = "pen";

            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    setSelectedDrawType,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateInteraction(drawType);

            expect(removeInteractionSpy.calledOnce).to.be.true;
            expect(addInteractionSpy.calledOnce).to.be.true;
        });
    });

    describe("regulateInteraction", () => {
        it("should remove current interaction and don't add interaction, if drawType is missing", () => {
            const drawType = "abc";

            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    setSelectedDrawType,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateInteraction(drawType);

            expect(removeInteractionSpy.calledOnce).to.be.true;
            expect(addInteractionSpy.notCalled).to.be.true;
        });
    });

    describe("regulateDrawInteraction", () => {
        it("should create 'box' draw interaction and add interaction ", () => {
            const drawType = "box";

            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    setSelectedDrawType,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateDrawInteraction(drawType);

            expect(createDrawInteractionSpy.calledOnce).to.be.true;
            expect(createDrawInteractionSpy.firstCall.args[0]).to.equals(drawType);
            expect(createDrawInteractionSpy.firstCall.args[1]).to.deep.equals(source);
            expect(addInteractionSpy.calledOnce).to.be.true;
        });

        it("should create 'circle' draw interaction and add interaction ", () => {
            const drawType = "circle";

            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    setSelectedDrawType,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateDrawInteraction(drawType);

            expect(createDrawInteractionSpy.calledOnce).to.be.true;
            expect(createDrawInteractionSpy.firstCall.args[0]).to.equals(drawType);
            expect(createDrawInteractionSpy.firstCall.args[1]).to.deep.equals(source);
            expect(drawCircleSpy.calledOnce).to.be.true;
            expect(drawCircleSpy.firstCall.args[0]).to.deep.equals(wrapper.vm.currentDrawInteraction);
            expect(drawCircleSpy.firstCall.args[1]).to.equals(drawType);
            expect(drawCircleSpy.firstCall.args[2]).to.equals("EPSG:4326");
            expect(drawCircleSpy.firstCall.args[3]).to.deep.equals(source);
            expect(drawCircleSpy.firstCall.args[4]).to.deep.equals({
                innerRadius: 0,
                interactive: true,
                outerRadius: 0,
                unit: "m"
            });
            expect(addInteractionSpy.calledOnce).to.be.true;
        });

        it("should emit start-drawing events", async () => {
            const drawType = "circle";

            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    setSelectedDrawType,
                    source,
                    shouldEmitEvents: true
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateInteraction(drawType);

            expect(wrapper.emitted("stop-drawing")).to.be.ok;
            expect(wrapper.emitted("start-drawing")).to.be.ok;
        });
    });

    describe("regulateStaticCircleInteraction", () => {
        it("should start drawCircle", () => {
            const drawType = "circle";

            wrapper = shallowMount(DrawTypesComponent, {
                propsData: {
                    currentLayout,
                    setSelectedDrawType,
                    source
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.regulateStaticCircleInteraction(drawType);

            expect(drawCircleSpy.calledOnce).to.be.true;
            expect(drawCircleSpy.firstCall.args[0]).to.deep.equals(wrapper.vm.currentDrawInteraction);
            expect(drawCircleSpy.firstCall.args[1]).to.equals(drawType);
            expect(drawCircleSpy.firstCall.args[2]).to.equals("EPSG:4326");
            expect(drawCircleSpy.firstCall.args[3]).to.deep.equals(source);
            expect(drawCircleSpy.firstCall.args[4]).to.deep.equals({
                innerRadius: 0,
                interactive: true,
                outerRadius: 0,
                unit: "m"
            });
        });
    });
});
