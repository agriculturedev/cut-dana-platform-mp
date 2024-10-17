import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import FlatButton from "../../../components/FlatButton.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/FlatButton.vue", () => {
    let interactionSpy,
        wrapper,
        button,
        icon;

    const text = "My super nice Button",
        iconString = "bi-list",
        spinnerClass = ".spinner-border";


    beforeEach(() => {
        interactionSpy = sinon.spy();
    });

    afterEach(sinon.restore);

    it("should render a button with an icon and trigger the given interaction on click", () => {
        wrapper = mount(FlatButton, {
            props: {text, interaction: interactionSpy, icon: iconString}
        });
        button = wrapper.find("button");
        icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["flat-button", "btn", "btn-secondary", "d-flex", "align-items-center", "mb-3"]);
        expect(button.attributes("type")).to.equal("button");
        expect(button.text()).to.equal(text);
        expect(icon.exists()).to.be.true;
        expect(icon.classes()).to.eql([iconString]);
        expect(icon.attributes("role")).to.equal("img");

        button.trigger("click");

        expect(interactionSpy.calledOnce).to.be.true;
    });
    it("should render a spinner and no icon if spinnerTrigger is true", () => {
        wrapper = mount(FlatButton, {
            props: {text, interaction: interactionSpy, icon: iconString, spinnerTrigger: true}
        });
        button = wrapper.find("button");
        icon = button.find("i");
        expect(icon.exists()).to.be.false;
        expect(wrapper.find(spinnerClass).exists()).to.be.true;
    });
});
