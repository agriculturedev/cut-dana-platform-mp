import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import LightButton from "../../../components/LightButton.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/LightButton.vue", () => {
    let interactionSpy;

    beforeEach(() => {
        interactionSpy = sinon.spy();
    });

    afterEach(sinon.restore);

    it("should render a button with an icon and trigger the given interaction on click", () => {
        const iconString = "bi-list",
            text = "My List",
            wrapper = mount(LightButton, {
                propsData: {text, interaction: interactionSpy, icon: iconString}
            }),
            button = wrapper.find("button"),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "btn-light", "d-flex", "align-items-center", "btn-description", "mp-btn-light"]);
        expect(button.attributes("type")).to.equal("button");
        expect(button.text()).to.equal(text);
        expect(icon.exists()).to.be.true;
        expect(icon.classes()).to.contain(iconString);
        expect(icon.attributes("role")).to.equal("img");

        button.trigger("click");

        expect(interactionSpy.calledOnce).to.be.true;
    });
    it("should render a button without an icon if not configured and trigger the given interaction on click", () => {
        const text = "My List",
            wrapper = mount(LightButton, {
                propsData: {text, interaction: interactionSpy}
            }),
            button = wrapper.find("button"),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "btn-light", "d-flex", "align-items-center", "btn-description", "mp-btn-light"]);
        expect(button.attributes("type")).to.equal("button");
        expect(button.text()).to.equal(text);
        expect(icon.exists()).to.be.false;

        button.trigger("click");

        expect(interactionSpy.calledOnce).to.be.true;
    });

    it("should render a button with description", () => {
        const text = "My List",
            iconString = "bi-list",
            descriptionString = "Hier könnte Ihre Werbung stehen",
            wrapper = mount(LightButton, {
                propsData: {text, interaction: interactionSpy, icon: iconString, description: descriptionString}
            }),
            button = wrapper.find("button"),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "btn-light", "d-flex", "align-items-center", "btn-description", "mp-btn-light"]);
        expect(button.attributes("type")).to.equal("button");
        expect(icon.exists()).to.be.true;
    });

    it("should render a button with html entities", () => {
        const text = "My List &amp; My Advertising",
            wrapper = mount(LightButton, {
                propsData: {text, interaction: interactionSpy}
            }),
            button = wrapper.find("button"),
            icon = button.find("i");

        expect(button.exists()).to.be.true;
        expect(button.classes()).to.eql(["btn", "btn-light", "d-flex", "align-items-center", "btn-description", "mp-btn-light"]);
        expect(button.attributes("type")).to.equal("button");
        expect(button.text()).to.equal("My List & My Advertising");
        expect(icon.exists()).to.be.false;
    });
});
