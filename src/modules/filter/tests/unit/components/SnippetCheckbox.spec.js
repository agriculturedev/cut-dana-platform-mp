import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import SnippetCheckbox from "../../../components/SnippetCheckbox.vue";
import {expect} from "chai";
import Filter from "../../../store/indexFilter";
import {nextTick} from "vue";

config.global.mocks.$t = key => key;

describe("src/modules/filter/components/SnippetCheckbox.vue", () => {
    describe("constructor", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetCheckbox, {});

            expect(wrapper.vm.info).to.be.false;
            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.operator).to.be.undefined;
            expect(wrapper.vm.prechecked).to.be.false;
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.value).to.deep.equal([true, false]);
            expect(wrapper.vm.visible).to.be.true;
        });
        it("should render correctly with default values", () => {
            const wrapper = shallowMount(SnippetCheckbox, {});

            expect(wrapper.find("input").classes("snippetCheckbox")).to.be.true;
        });
        it("should render hidden if visible is false", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    visible: false
                }
            });

            expect(wrapper.find(".snippetCheckboxContainer").element.style._values.display).to.be.equal("none");
        });
        it("should render with checked box if prechecked is true", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    prechecked: true
                }
            });

            expect(wrapper.find(".snippetCheckbox").element.checked).to.be.equal(true);
        });
        it("should render but also be disabled", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    disabled: true
                }
            });

            expect(wrapper.find(".snippetCheckbox").exists()).to.be.true;
            expect(wrapper.vm.disabled).to.be.true;
            expect(wrapper.find(".snippetCheckbox").element.disabled).to.be.true;
        });
        it("should render with a title if the title is a string", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    title: "foobar"
                }
            });

            expect(wrapper.find(".snippetCheckboxLabel").text()).to.be.equal("foobar");
        });
        it("should render without a title if title is a boolean and false", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    title: false
                }
            });

            expect(wrapper.find(".snippetCheckboxLabel").exists()).to.be.false;
        });
        it("should not render the info button if info is a boolean and false", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    info: false
                }
            });

            expect(wrapper.find(".info-icon").exists()).to.be.false;
        });
        it("should not use the given operator if an invalid operator is given", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    operator: "operator"
                }
            });

            expect(wrapper.vm.securedOperator).to.not.be.equal("operator");
        });
    });

    describe("emitCurrentRule", () => {
        it("should emit changeRule function with the expected values if parameter is true", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "EQ"
                }
            });

            wrapper.vm.emitCurrentRule(true, "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operatorForAttrName: "AND",
                operator: "EQ",
                value: true,
                tagTitle: "attrName"
            });
        });
        it("should emit changeRule function with the expected values if parameter is not the second element of value", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operatorForAttrName: "AND",
                    operator: "EQ",
                    value: ["yes", "no"]
                }
            });

            wrapper.vm.emitCurrentRule("yes", "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operatorForAttrName: "AND",
                operator: "EQ",
                value: "yes",
                tagTitle: "attrName"
            });
        });
    });

    describe("deleteCurrentRule", () => {
        it("should emit deleteRule function with its snippetId", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
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
            const store = createStore({
                    modules: {
                        Modules: {
                            namespaced: true,
                            modules: {
                                namespaced: true,
                                Filter
                            }
                        }
                    }
                }),
                wrapper = shallowMount(SnippetCheckbox, {
                    propsData: {
                        prechecked: true
                    },
                    global: {
                        plugins: [store]
                    }
                });
            let called = false;

            expect(wrapper.vm.checked).to.equal(true);
            await wrapper.vm.resetSnippet(() => {
                called = true;
            });

            expect(wrapper.vm.checked).to.equal(false);
            nextTick(()=> {
                expect(called).to.be.true;
            });
        });
    });
});
