import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import FileUpload from "../../../components/FileUpload.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/FileUpload.vue", () => {

    let interactionSpy;

    beforeEach(() => {
        interactionSpy = sinon.spy();
    });

    afterEach(sinon.restore);

    it("should render a drop area and input", () => {
        const id = "awesome-upload",
            keydown = interactionSpy,
            change = interactionSpy,
            drop = interactionSpy,
            wrapper = mount(FileUpload, {
                props: {id, keydown, change, drop}
            }),
            area = wrapper.find(".drop-area"),
            input = wrapper.find("input");

        expect(area.exists()).to.be.true;
        expect(input.exists()).to.be.true;
        expect(input.attributes("type")).to.equal("file");
    });

    it("should render a drop area and trigger a change event", () => {
        const id = "awesome-upload",
            keydown = interactionSpy,
            change = interactionSpy,
            drop = interactionSpy,
            wrapper = mount(FileUpload, {
                props: {id, keydown, change, drop}
            }),
            area = wrapper.find(".drop-area"),
            input = wrapper.find("input");

        expect(area.exists()).to.be.true;
        expect(input.exists()).to.be.true;

        input.trigger("change");

        expect(interactionSpy.calledOnce).to.be.true;
    });

});
