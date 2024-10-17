import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import AccordionItem from "../../../components/AccordionItem.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/accordion/components/AccordionItem.vue", () => {

    const title = "My Title",
        iconString = "bi-list";

    it("should render an accordion", async () => {
        const wrapper = mount(AccordionItem, {
                props: {id: "id", title, icon: iconString}
            }),
            accordion = wrapper.find(".accordion");

        expect(accordion.exists()).to.be.true;
    });
    it("should render a title", async () => {
        const wrapper = mount(AccordionItem, {
            props: {id: "id", title, icon: iconString}
        });

        expect(wrapper.find(".accordion-button").text()).to.be.equal("My Title");
    });
    it("should render an icon", async () => {
        const wrapper = mount(AccordionItem, {
            props: {id: "id", title, icon: iconString}
        });

        expect(wrapper.find(".bi-list").exists()).to.be.true;
    });
    it("should be opened initially if isOpen is true", async () => {
        const wrapper = mount(AccordionItem, {
            props: {id: "id", title, icon: iconString, isOpen: true}
        });

        expect(wrapper.find(".show").exists()).to.be.true;
    });
    it("should be initially closed if isOpen is not set", async () => {
        const wrapper = mount(AccordionItem, {
            props: {id: "id", title, icon: iconString}
        });

        expect(wrapper.find(".show").exists()).to.be.false;
    });
});
