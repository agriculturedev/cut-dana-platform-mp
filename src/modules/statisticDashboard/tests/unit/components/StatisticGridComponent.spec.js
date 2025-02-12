import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticGridComponent from "../../../components/StatisticGridComponent.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticGridComponent.vue", () => {

    const propsData = {
        dates: [
            {
                headers: ["Raumeinheit", "2023", "2022"],
                items: [
                    ["Harburg", 1234, 1234],
                    ["Ludwigslust Parchim", 23456, 1234],
                    ["Lübeck", 23475, 1234],
                    ["Niedersachsen", 34844, 1234]
                ]
            },
            {
                headers: ["Raumeinheit", "2023", "2022"],
                items: [
                    ["Harburg", 1234, 1234],
                    ["Ludwigslust Parchim", 23456, 1234],
                    ["Lübeck", 23475, 1234],
                    ["Niedersachsen", 34844, 1234]
                ]
            }
        ]
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
        it("The component should exist", () => {
            const wrapper = shallowMount(StatisticGridComponent, {
                propsData: propsData,
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".flex-container").exists()).to.be.true;
            expect(wrapper.find(".flex-item").exists()).to.be.true;
        });

        it("should find two titles", () => {
            const wrapper = shallowMount(StatisticGridComponent, {
                propsData: {
                    dates: propsData.dates,
                    titles: ["Titel eins", "Titel zwei"]
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findAll(".title").length).to.be.equal(2);
        });
    });
});
