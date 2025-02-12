import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardDifference from "../../../components/StatisticDashboardDifference.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import Multiselect from "vue-multiselect";
import StatisticSwitcher from "../../../components/StatisticDashboardSwitcher.vue";
import {rawLayerList} from "@masterportal/masterportalapi";
import getOAFFeature from "../../../../../shared/js/api/oaf/getOAFFeature";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardDifference.vue", () => {
    const propsData = {
        referenceData: {
            "date": [
                {label: "2000", value: "2000"},
                {label: "2001", value: "2001"},
                {label: "2002", value: "2002"}
            ],
            "region": [
                {label: "Wandsbek", value: "Wandsbek"},
                {label: "Hamburg", value: "Hamburg"},
                {label: "Deutschland", value: "Deutschland"}
            ]
        }
    };

    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: indexStatisticDashboard
                    }
                }
            }
        });
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("The title should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("h4").exists()).to.be.true;
        });

        it("should find switcher component", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findComponent(StatisticSwitcher).exists()).to.be.true;
        });

        it("The component multiselect should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findComponent(Multiselect).exists()).to.be.true;
        });
    });

    describe("Methods", () => {
        describe("updateSelectedReferenceData", () => {
            it("should set the selectedReferenceData to the emit object for date", () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                        propsData: propsData,
                        global: {
                            plugins: [store]
                        }
                    }),
                    expected = {
                        type: "date",
                        value: {
                            label: "1999",
                            value: "1999-01-01"
                        }
                    },
                    setSelectedReferenceDataStub = sinon.stub(wrapper.vm, "setSelectedReferenceData");

                wrapper.vm.selectedDate = {label: "1999", value: "1999-01-01"};
                wrapper.vm.updateSelectedReferenceData("date");

                expect(setSelectedReferenceDataStub.calledWith(expected)).to.be.true;
                expect(wrapper.vm.selectedRegion).to.be.an("string").that.is.empty;

                sinon.restore();
            });
            it("should set the selectedReferenceData to undefined for date if no vale for selectedDate is set", () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                        propsData: propsData,
                        global: {
                            plugins: [store]
                        }
                    }),
                    setSelectedReferenceDataStub = sinon.stub(wrapper.vm, "setSelectedReferenceData");

                wrapper.vm.selectedDate = undefined;
                wrapper.vm.updateSelectedReferenceData("date");

                expect(setSelectedReferenceDataStub.calledWith(undefined)).to.be.true;
                expect(wrapper.vm.selectedRegion).to.be.an("string").that.is.empty;

                sinon.restore();
            });
            it("should set the selectedReferenceData to the emit object for region", () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                        propsData: propsData,
                        global: {
                            plugins: [store]
                        }
                    }),
                    expected = {
                        type: "region",
                        value: "Hamburg"
                    },
                    setSelectedReferenceDataStub = sinon.stub(wrapper.vm, "setSelectedReferenceData");

                wrapper.vm.selectedRegion = "Hamburg";
                wrapper.vm.updateSelectedReferenceData("region");

                expect(setSelectedReferenceDataStub.calledWith(expected)).to.be.true;
                expect(wrapper.vm.selectedDate).to.be.an("string").that.is.empty;

                sinon.restore();
            });
            it("should set the selectedReferenceData to undefined for region", () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                        propsData: propsData,
                        global: {
                            plugins: [store]
                        }
                    }),
                    setSelectedReferenceDataStub = sinon.stub(wrapper.vm, "setSelectedReferenceData");

                wrapper.vm.selectedRegion = undefined;
                wrapper.vm.updateSelectedReferenceData("region");

                expect(setSelectedReferenceDataStub.calledWith(undefined)).to.be.true;
                expect(wrapper.vm.selectedDate).to.be.an("string").that.is.empty;

                sinon.restore();
            });
            it("should set the selectedReferenceData", async () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                        propsData: propsData,
                        global: {
                            plugins: [store]
                        }
                    }),
                    setSelectedReferenceDataStub = sinon.stub(wrapper.vm, "setSelectedReferenceData");

                wrapper.vm.selectedRegion = "Hamburg";
                wrapper.vm.updateSelectedReferenceData("region");
                expect(setSelectedReferenceDataStub.called).to.be.true;

                sinon.restore();
            });
        });
        describe("getRegionsOptionsForLastChild", () => {
            it("should return an empty arry if flattenedRegions is empty", async () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

                expect(await wrapper.vm.getRegionsOptionsForLastChild([])).to.be.an("array").that.is.empty;
            });
            it("should return the values of the last child if they are already present", async () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

                sinon.stub(rawLayerList, "getLayerWhere");
                await wrapper.vm.$nextTick();
                expect(await wrapper.vm.getRegionsOptionsForLastChild([{values: ["foo"]}])).to.deep.equal(["foo"]);
            });
            it("should return an empty array if no layer is found", async () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

                sinon.stub(rawLayerList, "getLayerWhere").returns(undefined);
                await wrapper.vm.$nextTick();
                expect(await wrapper.vm.getRegionsOptionsForLastChild([{}])).to.be.an("array").that.is.empty;
            });
            it("should return an empty array if no unique object for the last child is given", async () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

                sinon.stub(rawLayerList, "getLayerWhere").returns({});
                sinon.stub(getOAFFeature, "getUniqueValuesByScheme").resolves({});
                await wrapper.vm.$nextTick();
                expect(await wrapper.vm.getRegionsOptionsForLastChild([{}, {attrName: "foo"}])).to.be.an("array").that.is.empty;
            });
            it("should return the unique values for the last child", async () => {
                const wrapper = shallowMount(StatisticDashboardDifference, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

                sinon.stub(rawLayerList, "getLayerWhere").returns({});
                sinon.stub(getOAFFeature, "getUniqueValuesByScheme").resolves({foo: {bar: true, fob: true}});
                await wrapper.vm.$nextTick();
                expect(await wrapper.vm.getRegionsOptionsForLastChild([{}, {attrName: "foo"}])).to.deep.equal(["bar", "fob"]);
            });
        });
    });
});
