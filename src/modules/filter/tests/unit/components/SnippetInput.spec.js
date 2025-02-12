import {config, shallowMount} from "@vue/test-utils";
import SnippetInput from "../../../components/SnippetInput.vue";
import {expect} from "chai";

config.global.mocks.$t = key => key;

describe("src/modules/filter/components/SnippetInput.vue", () => {
    describe("constructor", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetInput, {});

            expect(wrapper.vm.info).to.be.false;
            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.operator).to.be.undefined;
            expect(wrapper.vm.prechecked).to.equal("");
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.visible).to.be.true;
        });
        it("should render correctly with default values", () => {
            const wrapper = shallowMount(SnippetInput, {});

            expect(wrapper.find("input").classes("snippetInput")).to.be.true;
        });
        it("should render hidden if visible is false", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    visible: false
                }
            });

            expect(wrapper.find(".snippetInputContainer").element.style._values.display).to.be.equal("none");
        });
        it("should render but also be disabled", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    disabled: true
                }
            });

            expect(wrapper.find(".snippetInput").exists()).to.be.true;
            expect(wrapper.vm.disabled).to.be.true;
            expect(wrapper.find(".snippetInput").element.disabled).to.be.true;
        });
        it("should render snippet with placeholder", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    placeholder: "this is a placeholder"
                }
            });

            expect(wrapper.find(".snippetInput").attributes("placeholder")).to.be.equal("this is a placeholder");
        });
        it("should render with a title if the title is a string", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    title: "foobar"
                }
            });

            expect(wrapper.find(".snippetInputLabel").text()).to.be.equal("foobar");
        });
        it("should render without a title if title is a boolean and false", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    title: false
                }
            });

            expect(wrapper.find(".snippetInputLabel").exists()).to.be.false;
        });
        it("should not render the info button if info is a boolean and false", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    info: false
                }
            });

            expect(wrapper.find(".info-icon").exists()).to.be.false;
        });
        it("should not use the given operator if an invalid operator is given", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    operator: "operator"
                }
            });

            expect(wrapper.vm.securedOperator).to.not.be.equal("operator");
        });
    });

    describe("emitCurrentRule", () => {
        it("should emit changeRule function with the expected values", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "IN"
                }
            });

            wrapper.vm.emitCurrentRule("value", "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operatorForAttrName: "AND",
                operator: "IN",
                value: "value"
            });
        });
    });

    describe("deleteCurrentRule", () => {
        it("should emit deleteRule function with its snippetId", () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    snippetId: 1234
                }
            });

            wrapper.vm.deleteCurrentRule();
            expect(wrapper.emitted("deleteRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("deleteRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("deleteRule")[0][0]).to.equal(1234);
        });
    });

    describe("resetSnippet", () => {
        it("should reset the snippet value and call the given onsuccess handler", async () => {
            const wrapper = shallowMount(SnippetInput, {
                propsData: {
                    prechecked: "value"
                }
            });
            let called = false;

            expect(wrapper.vm.value).to.equal("value");
            await wrapper.vm.resetSnippet(() => {
                called = true;
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.value).to.equal("");
            expect(called).to.be.true;
        });
    });
});
