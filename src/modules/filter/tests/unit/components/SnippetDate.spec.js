import {config, shallowMount} from "@vue/test-utils";
import SnippetDate from "../../../components/SnippetDate.vue";
import {expect} from "chai";

config.global.mocks.$t = key => key;

describe("src/modules/generalFilter/components/SnippetDate.vue", () => {
    describe("constructor", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetDate, {});

            expect(wrapper.vm.api).to.be.null;
            expect(wrapper.vm.info).to.be.false;
            expect(wrapper.vm.format).to.equal("YYYY-MM-DD");
            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.minValue).to.be.undefined;
            expect(wrapper.vm.maxValue).to.be.undefined;
            expect(wrapper.vm.operator).to.be.undefined;
            expect(wrapper.vm.prechecked).to.be.undefined;
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.visible).to.be.true;
        });
        it("should render correctly with default values", () => {
            const wrapper = shallowMount(SnippetDate, {});

            expect(wrapper.find("div").classes("snippetDateContainer")).to.be.true;
        });
        it("should render correctly with prechecked as set value", async () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    prechecked: "24_2021_12"
                }
            });

            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();
            expect(wrapper.find(".snippetDate").element.value).to.be.equal("2021-12-24");
        });
        it("should render hidden if visible is false", () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    visible: false
                }
            });

            expect(wrapper.find(".snippetDateContainer").element.style._values.display).to.be.equal("none");
        });
        it("should render but also be disabled", () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    disabled: true
                }
            });

            expect(wrapper.find(".snippetDate").exists()).to.be.true;
            expect(wrapper.vm.disabled).to.be.true;
        });
        it("should render with a title if the title is a string", () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    title: "foobar"
                }
            });

            expect(wrapper.find(".snippetDateLabel").text()).to.be.equal("foobar");
        });
        it("should render without a title if title is a boolean and false", () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    title: false
                }
            });

            expect(wrapper.find(".snippetDateLabel").exists()).to.be.false;
        });
        it("should set both minimumValue and maximumValue from properties if given", async () => {
            const wrapper = await shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    minValue: "24_2021_12",
                    maxValue: "24_2022_12"
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.minimumValue).to.equal("2021-12-24");
            expect(wrapper.vm.maximumValue).to.equal("2022-12-24");
            expect(wrapper.vm.value).to.equal("");
        });
        it("should set both minimumValue and maximumValue from properties and value from prechecked if given", async () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    minValue: "24_2021_12",
                    maxValue: "24_2022_12",
                    prechecked: "24_2021_07"
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.minimumValue).to.equal("2021-12-24");
            expect(wrapper.vm.maximumValue).to.equal("2022-12-24");
            expect(wrapper.vm.value).to.equal("2021-07-24");
        });
        it("should ask the api for minimumValue or maximumValue if minValue and maxValue are not given", async () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    api: {
                        getMinMax (attrName, onsuccess) {
                            onsuccess({
                                min: "24_2021_12",
                                max: "24_2022_12"
                            });
                        }
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.minimumValue).to.equal("2021-12-24");
            expect(wrapper.vm.maximumValue).to.equal("2022-12-24");
            expect(wrapper.vm.value).to.equal("");
        });
        it("should ask the api for minimumValue if minValue is not given", async () => {
            let lastMinOnly = false,
                lastMaxOnly = false;
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    maxValue: "24_2022_12",
                    api: {
                        getMinMax (attrName, onsuccess, onerror, minOnly, maxOnly) {
                            lastMinOnly = minOnly;
                            lastMaxOnly = maxOnly;
                            onsuccess({
                                min: "24_2021_12"
                            });
                        }
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(lastMinOnly).to.be.true;
            expect(lastMaxOnly).to.be.false;
            expect(wrapper.vm.minimumValue).to.equal("2021-12-24");
            expect(wrapper.vm.maximumValue).to.equal("2022-12-24");
            expect(wrapper.vm.value).to.equal("");
        });
        it("should ask the api for maximumValue if maxValue is not given", async () => {
            let lastMinOnly = false,
                lastMaxOnly = false;
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    minValue: "24_2021_12",
                    api: {
                        getMinMax (attrName, onsuccess, onerror, minOnly, maxOnly) {
                            lastMinOnly = minOnly;
                            lastMaxOnly = maxOnly;
                            onsuccess({
                                max: "24_2022_12"
                            });
                        }
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(lastMinOnly).to.be.false;
            expect(lastMaxOnly).to.be.true;
            expect(wrapper.vm.minimumValue).to.equal("2021-12-24");
            expect(wrapper.vm.maximumValue).to.equal("2022-12-24");
            expect(wrapper.vm.value).to.equal("");
        });
        it("should not emit the current rule on startup, if no prechecked is given", async () => {
            const wrapper = await shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    minValue: "24_2021_12",
                    maxValue: "24_2022_12"
                }
            });

            expect(wrapper.emitted("deleteRule")).to.be.undefined;
        });
        it("should not use the given operator if an invalid operator is given", () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    operator: "operator"
                }
            });

            expect(wrapper.vm.securedOperator).to.not.be.equal("operator");
        });
    });

    describe("emitCurrentRule", () => {
        it("should emit changeRule function with the expected values", () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "EQ",
                    format: "format"
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
                operator: "EQ",
                format: "format",
                value: "value"
            });
        });
    });

    describe("deleteCurrentRule", () => {
        it("should emit deleteRule function with its snippetId", () => {
            const wrapper = shallowMount(SnippetDate, {
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
        it("should reset the snippet to prechecked value if prechecked is set", async () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM",
                    prechecked: "24_2021_12"
                }
            });
            let called = false;

            await wrapper.vm.resetSnippet(() => {
                called = true;
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.value).to.equal("2021-12-24");
            expect(called).to.be.true;
        });
        it("should reset the snippet value and call the given onsuccess handler", async () => {
            const wrapper = shallowMount(SnippetDate, {
                propsData: {
                    format: "DD_YYYY_MM"
                }
            });
            let called = false;

            wrapper.vm.inRangeValue = "2021-12-24";
            expect(wrapper.vm.value).to.equal("2021-12-24");
            await wrapper.vm.resetSnippet(() => {
                called = true;
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.value).to.equal("");
            expect(called).to.be.true;
        });
    });
});
