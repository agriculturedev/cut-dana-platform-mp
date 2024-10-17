import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import InputText from "../../../components/InputText.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/InputText.vue", () => {

    afterEach(sinon.restore);

    it("should render an input field", () => {
        const id = "input-awesome",
            label = "My super nice Input",
            placeholder = "world's best placeholder",
            wrapper = mount(InputText, {
                props: {id, label, placeholder}
            }),
            input = wrapper.find("input");

        expect(input.exists()).to.be.true;
        expect(input.classes()).to.eql(["form-control"]);
        expect(input.attributes("placeholder")).to.equal(placeholder);
    });

    it("should render an input field with a type", () => {
        const id = "input-awesome",
            label = "My super nice Input",
            placeholder = "world's best placeholder",
            type = "mail",
            wrapper = mount(InputText, {
                props: {id, label, placeholder, type}
            }),
            input = wrapper.find("input");

        expect(input.exists()).to.be.true;
        expect(input.classes()).to.eql(["form-control"]);
        expect(input.attributes("placeholder")).to.equal(placeholder);
        expect(input.attributes("type")).to.equal(type);
    });
    it("should render an input field and make it readonly", () => {
        const id = "input-awesome",
            label = "My super nice Input",
            placeholder = "world's best placeholder",
            readonly = true,
            wrapper = mount(InputText, {
                props: {id, label, readonly, placeholder}
            }),
            input = wrapper.find("input");

        expect(input.exists()).to.be.true;
        expect(input.classes()).to.eql(["form-control"]);
        expect(input.attributes("readonly")).to.to.equal("");
    });
});
