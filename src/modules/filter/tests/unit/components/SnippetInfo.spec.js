import {config, shallowMount} from "@vue/test-utils";
import SnippetInfo from "../../../components/SnippetInfo.vue";
import {expect} from "chai";

config.global.mocks.$t = key => key;

describe("src/modules/filter/components/SnippetInfo.vue", () => {
    it("should render correctly", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: "Information",
                translationKey: "snippetInput"
            }
        });

        expect(wrapper.find(".info-icon").exists()).to.be.true;
        expect(wrapper.find(".bottom").exists()).to.be.true;
        expect(wrapper.find(".info-text").exists()).to.be.true;
    });
    it("should not render elements", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: false,
                translationKey: "snippetInput"
            }
        });

        expect(wrapper.find(".info-icon").exists()).to.be.false;
        expect(wrapper.find(".bottom").exists()).to.be.false;
        expect(wrapper.find(".info-text").exists()).to.be.false;
    });
    it("should show info if info-button is clicked", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: "Information",
                translationKey: "snippetInput"
            }
        });

        expect(wrapper.vm.showInfo).to.be.false;
        wrapper.vm.toggleInfo();
        expect(wrapper.vm.showInfo).to.be.true;
        expect(wrapper.find(".bottom").exists()).to.be.true;
        expect(wrapper.find(".info-text span").text()).to.be.equal("Information");
    });
    it("should render info-icon correctly with translation key", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: true,
                translationKey: "snippetInput"
            }
        });

        expect(wrapper.find(".info-icon").exists()).to.be.true;
        expect(wrapper.find(".bottom").exists()).to.be.true;
        expect(wrapper.find(".info-text span").text()).to.be.equal("common:modules.filter.info.snippetInput");
    });
});
