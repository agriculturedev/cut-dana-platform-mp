import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import ControlIcon from "../../../components/ControlIcon.vue";

config.global.mocks.$t = key => key;

describe("src/modules/controls/components/ControlIcon.vue", () => {
    let propsData;

    before(() => {
        propsData = {
            iconName: "iconName",
            disabled: false,
            title: "title",
            onClick: () => sinon.stub(),
            inline: true
        };
    });

    it("renders the ControlIcon button", () => {
        const wrapper = mount(ControlIcon, {propsData});

        expect(wrapper.find("button").exists()).to.be.true;
        expect(wrapper.find("i").exists()).to.be.true;
    });
});
