import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import SliderItem from "../components/SliderItem.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/SliderItem.vue", () => {
    let interactionSpy;

    beforeEach(() => {
        interactionSpy = sinon.spy();
    });

    afterEach(sinon.restore);

    it("should render a slider and trigger the given interaction on change", async () => {
        const wrapper = mount(SliderItem, {
                propsData: {
                    aria: "Aria-Label hier einfügen",
                    interaction: interactionSpy
                }
            }),
            input = wrapper.find("input");

        expect(input.exists()).to.be.true;
        expect(input.attributes("aria-label")).to.equal("Aria-Label hier einfügen");
        expect(input.attributes("type")).to.equal("range");
        expect(input.attributes("class")).to.equal("slider my-2 me-2");

        input.trigger("input");
        await wrapper.vm.$nextTick();
        expect(interactionSpy.calledOnce).to.be.true;
    });

    it("renders a slider with props that aren't required", () => {
        const wrapper = mount(SliderItem, {
                propsData: {
                    aria: "Aria-Label hier einfügen",
                    id: "shared-slider",
                    label: "Slider-Label",
                    list: "datalist-id",
                    min: 0,
                    max: 100,
                    step: 1,
                    value: 40,
                    disabled: false
                }
            }),
            input = wrapper.find("input"),
            label = wrapper.find("label");

        expect(input.exists()).to.be.true;
        expect(input.attributes("aria-label")).to.equal("Aria-Label hier einfügen");
        expect(input.attributes("id")).to.equal("shared-slider");
        expect(label.exists()).to.be.true;
        expect(label.text()).to.equal("Slider-Label");
        expect(input.attributes("list")).to.equal("datalist-id");
        expect(input.attributes("min")).to.equal("0");
        expect(input.attributes("max")).to.equal("100");
        expect(input.attributes("step")).to.equal("1");
        expect(input.element.value).to.equal("40");
        expect(input.element.disabled).to.equal(false);
    });

    it("renders a slider that is disable", () => {
        const wrapper = mount(SliderItem, {
                propsData: {
                    aria: "Aria-Label hier einfügen",
                    disabled: true
                }
            }),
            input = wrapper.find("input");

        expect(input.exists()).to.be.true;
        expect(input.element.disabled).to.equal(true);
    });
});
