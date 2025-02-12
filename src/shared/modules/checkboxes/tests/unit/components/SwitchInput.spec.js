import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import SwitchInput from "../../../components/SwitchInput.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/checkboxes/components/SwitchInput.vue", () => {
    let interactionSpy;

    beforeEach(() => {
        interactionSpy = sinon.spy();
    });

    afterEach(sinon.restore);

    it("should render an input field", () => {
        const id = "perfect-sitch",
            label = "My super nice switch. Switch me!",
            aria = "read me when you need to",
            wrapper = mount(SwitchInput, {
                props: {id, label, aria}
            }),
            input = wrapper.find("input");

        expect(input.exists()).to.be.true;
        expect(input.classes()).to.eql(["form-check-input"]);
        expect(input.attributes("aria-label")).to.equal(aria);
    });

    it("should render a switch and trigger the given interaction on click", async () => {
        const id = "perfect-sitch",
            label = "My super nice switch. Switch me!",
            aria = "read me when you need to",
            wrapper = mount(SwitchInput, {
                props: {interaction: interactionSpy(), id: id, aria: aria, label: label}
            }),
            input = wrapper.find("input");


        expect(input.exists()).to.be.true;

        input.trigger("input");
        await wrapper.vm.$nextTick();
        expect(interactionSpy.calledOnce).to.be.true;
    });
});
