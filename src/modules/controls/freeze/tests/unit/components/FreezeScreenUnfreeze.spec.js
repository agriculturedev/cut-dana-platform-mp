import {config, mount} from "@vue/test-utils";
import {expect} from "chai";


import FreezeScreenUnfreeze from "../../../components/FreezeScreenUnfreeze.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/freeze/components/FreezeScreenUnfreeze.vue", () => {
    it("renders the freeze-screen-unfreeze", () => {
        const wrapper = mount(FreezeScreenUnfreeze);

        expect(wrapper.find("#freeze-screen-unfreeze").exists()).to.be.true;
        expect(wrapper.findAll("p")).to.have.length(1);
    });

    it("should emit hideFreezeWin after click on p", async () => {
        const wrapper = mount(FreezeScreenUnfreeze);

        await wrapper.find("#freeze-screen-unfreeze > p").trigger("click");

        expect(wrapper.emitted("hideFreezeWin").length).to.equals(1);
    });
});
