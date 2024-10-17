import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import DrawLayoutComponent from "../../../components/DrawLayout.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/draw/components/DrawLayout.vue", () => {
    let currentLayout,
        setCurrentLayoutSpy,
        wrapper;

    beforeEach(() => {
        currentLayout = {
            fillColor: [55, 126, 184],
            fillTransparency: 0,
            strokeColor: [0, 0, 0],
            strokeWidth: 1
        };
        setCurrentLayoutSpy = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("render", () => {
        it("renders the layout buttons for drawType - pen ", () => {
            wrapper = shallowMount(DrawLayoutComponent, {
                propsData: {
                    currentLayout: currentLayout,
                    selectedDrawType: "pen",
                    setCurrentLayout: setCurrentLayoutSpy
                }
            });

            expect(wrapper.find("#draw-layout-innerCircle-fillColor").exists()).to.be.false;
            expect(wrapper.find("#draw-layout-innerCircle-fillTransparency").exists()).to.be.false;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor > label").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor > label > i").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor > label > input").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth > label").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth > label > i").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth > label > span").exists()).to.be.true;
        });

        it("renders the layout buttons for drawType - circle ", () => {
            wrapper = shallowMount(DrawLayoutComponent, {
                propsData: {
                    currentLayout: currentLayout,
                    selectedDrawType: "circle",
                    setCurrentLayout: setCurrentLayoutSpy
                }
            });

            expect(wrapper.find("#draw-layout-innerCircle-fillColor").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-fillColor > label").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-fillColor > label > i").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-fillColor > label > input").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-fillTransparency").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-fillTransparency > label").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-fillTransparency > label > i").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-fillTransparency > label > span").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor > label").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor > label > i").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeColor > label > input").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth > label").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth > label > i").exists()).to.be.true;
            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth > label > span").exists()).to.be.true;
        });

        it("renders the slider for strokeWidth of drawType - circle ", async () => {
            wrapper = shallowMount(DrawLayoutComponent, {
                propsData: {
                    currentLayout: currentLayout,
                    selectedDrawType: "circle",
                    setCurrentLayout: setCurrentLayoutSpy
                }
            });

            await wrapper.find("#draw-layout-innerCircle-strokeWidth").trigger("click");

            expect(wrapper.find("#draw-layout-innerCircle-strokeWidth").exists()).to.be.true;
            expect(wrapper.find("#slider-stroke-width-innerCircle").exists()).to.be.true;
        });

        it("renders the slider for fillTransparency of drawType - circle ", async () => {
            wrapper = shallowMount(DrawLayoutComponent, {
                propsData: {
                    currentLayout: currentLayout,
                    selectedDrawType: "circle",
                    setCurrentLayout: setCurrentLayoutSpy
                }
            });

            await wrapper.find("#draw-layout-innerCircle-fillTransparency").trigger("click");

            expect(wrapper.find("#draw-layout-innerCircle-fillTransparency").exists()).to.be.true;
            expect(wrapper.find("#slider-fill-transparency-innerCircle").exists()).to.be.true;
        });
    });

    describe("setActiveLayoutKey", () => {
        it("should set activeLayoutKey to fillColor", () => {
            const layoutKey = "fillColor";

            wrapper = shallowMount(DrawLayoutComponent, {
                propsData: {
                    currentLayout: currentLayout,
                    selectedDrawType: "circle",
                    setCurrentLayout: setCurrentLayoutSpy
                }
            });

            wrapper.vm.setActiveLayoutKey(layoutKey);
            expect(wrapper.vm.activeLayoutKey).to.equals(layoutKey);
        });
    });

    describe("updateCurrentLayout", () => {
        it("should set current layout and emit event", () => {
            const layoutKey = "fillColor",
                value = "#ff00aa";

            wrapper = shallowMount(DrawLayoutComponent, {
                propsData: {
                    currentLayout: currentLayout,
                    selectedDrawType: "circle",
                    setCurrentLayout: setCurrentLayoutSpy
                }
            });

            wrapper.vm.updateCurrentLayout(layoutKey, value);

            expect(setCurrentLayoutSpy.calledOnce).to.be.true;
            expect(setCurrentLayoutSpy.firstCall.args[0]).to.deep.equals({
                fillColor: [255, 0, 170],
                fillTransparency: 0,
                strokeColor: [0, 0, 0],
                strokeWidth: 1
            });
            expect(wrapper.emitted()["update-current-layout"]).to.exist;
            expect(wrapper.emitted()["update-current-layout"][0]).to.deep.equals([{
                fillColor: [255, 0, 170],
                fillTransparency: 0,
                strokeColor: [0, 0, 0],
                strokeWidth: 1
            }]);
        });
    });
});
