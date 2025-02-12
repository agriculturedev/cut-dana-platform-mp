import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import StatisticDashboardSwitcher from "../../../components/StatisticDashboardSwitcher.vue";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardSwitcher.vue", () => {
    const buttons = [{
            name: "Button1",
            icon: "bi bi-table"
        },
        {
            name: "Button2"
        }],
        precheckedValue = "Button2";

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup",
                    precheckedValue
                }
            });

            expect(wrapper.exists()).to.be.true;
        });
        it("should render buttongroup", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup",
                    precheckedValue
                }
            });

            expect(wrapper.find(".btn-group").exists()).to.be.true;
        });
        it("should render two buttons if two button names were given", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup",
                    precheckedValue
                }
            });

            expect(wrapper.findAll(".btn")).lengthOf(2);
        });
        it("should render icon if icon class was given", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup",
                    precheckedValue
                }
            });

            expect(wrapper.find(".bi-table").exists()).to.be.true;
        });
        it("should set the button 2 as prechecked button", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup",
                    precheckedValue
                }
            });

            expect(wrapper.find("#btnradio1Button2").element.checked).to.be.false;
        });
    });
    describe("User Interaction", () => {
        it("should emit 'showView' if the user click on first button", async () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                    propsData: {
                        buttons,
                        group: "buttongroup",
                        precheckedValue
                    }
                }),
                button1 = wrapper.findAll(".btn").at(0);

            await button1.trigger("click");
            expect(wrapper.emitted().showView).to.deep.equal([["Button1"]]);
        });
    });
    describe("Methods", () => {
        describe("getPrecheckedIndex", () => {
            it("should return 0 if the parameters are in the wrong format", async () => {
                const wrapper = shallowMount(StatisticDashboardSwitcher, {
                    propsData: {
                        buttons,
                        group: "buttongroup",
                        precheckedValue
                    }
                });

                expect(wrapper.vm.getPrecheckedIndex(null, "button")).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex(0, "button")).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex(false, "button")).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex({}, "button")).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex("test", "button")).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex(undefined, "button")).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex([{name: "button1"}, {name: "button2"}], 0)).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex([{name: "button1"}, {name: "button2"}], null)).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex([{name: "button1"}, {name: "button2"}], false)).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex([{name: "button1"}, {name: "button2"}], [])).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex([{name: "button1"}, {name: "button2"}], {})).to.equal(0);
                expect(wrapper.vm.getPrecheckedIndex([{name: "button1"}, {name: "button2"}], undefined)).to.equal(0);

            });
            it("should return 0 if there are no prechecked value found", async () => {
                const wrapper = shallowMount(StatisticDashboardSwitcher, {
                        propsData: {
                            buttons,
                            group: "buttongroup",
                            precheckedValue
                        }
                    }),
                    paraButtons = [{name: "button1"}, {name: "button2"}],
                    paraPrecheckedValue = "button3";

                expect(wrapper.vm.getPrecheckedIndex(paraButtons, paraPrecheckedValue)).to.equal(0);

            });
            it("should return the right index if the prechecked value is found", async () => {
                const wrapper = shallowMount(StatisticDashboardSwitcher, {
                        propsData: {
                            buttons,
                            group: "buttongroup",
                            precheckedValue
                        }
                    }),
                    paraButtons = [{name: "button1"}, {name: "button2"}],
                    paraPrecheckedValue = "button2";

                expect(wrapper.vm.getPrecheckedIndex(paraButtons, paraPrecheckedValue)).to.equal(1);

            });
        });
    });
});
