import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import ElevatedButton from "../../../components/ElevatedButton.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/ElevatedButton.vue", () => {
    let interactionSpy;

    beforeEach(() => {
        interactionSpy = sinon.spy();
    });

    afterEach(sinon.restore);

    it("should render a button with an icon and trigger the given interaction on click", () => {
        const iconString = "bi-list",
            text = "My super nice elevated Button",
            wrapper = mount(ElevatedButton, {
                props: {text, interaction: interactionSpy, icon: iconString}
            }),
            button = wrapper.find("button"),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "btn-primary", "d-flex", "align-items-center", "shadow"]);
        expect(button.attributes("type")).to.equal("button");
        expect(button.text()).to.equal(text);
        expect(icon.exists()).to.be.true;
        expect(icon.classes()).to.eql([iconString]);
        expect(icon.attributes("role")).to.equal("img");

        button.trigger("click");

        expect(interactionSpy.calledOnce).to.be.true;
    });
});
