import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import SpinnerItem from "../../components/SpinnerItem.vue";

config.global.mocks.$t = key => key;

describe("src/shared/components/SpinnerItem.vue", () => {

    it("should render a spinner", async () => {
        const wrapper = mount(SpinnerItem, {}),
            spinner = wrapper.find(".spinner-border");

        expect(spinner.exists()).to.be.true;
        expect(spinner.attributes("role")).to.equal("status");
    });
});
