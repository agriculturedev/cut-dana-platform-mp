import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import IconButton from "../../../components/IconButton.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/IconButton.vue", () => {
    let interactionSpy;

    beforeEach(() => {
        interactionSpy = sinon.spy();
    });

    afterEach(sinon.restore);

    it("should render a button with only an icon and trigger the given interaction on click", () => {
        const iconString = "bi-list",
            wrapper = mount(IconButton, {
                propsData: {interaction: interactionSpy, icon: iconString, aria: "Bla bla"}
            }),
            button = wrapper.find("button"),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "d-flex", "align-items-center", "justify-items-center", "mb-auto"]);
        expect(button.attributes("type")).to.equal("button");
        expect(icon.exists()).to.be.true;
        expect(icon.classes()).to.eql([iconString]);
        expect(icon.attributes("role")).to.equal("img");

        button.trigger("click");

        expect(interactionSpy.calledOnce).to.be.true;
    });
});
