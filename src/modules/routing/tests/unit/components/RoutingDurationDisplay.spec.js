import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import RoutingDurationDisplayComponent from "../../../components/RoutingDurationDisplay.vue";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import getters from "../../../store/gettersRouting";
import mutationsDirections from "../../../store/directions/mutationsDirections";
import actionsDirections from "../../../store/directions/actionsDirections";
import gettersDirections from "../../../store/directions/gettersDirections";
import stateDirections from "../../../store/directions/stateDirections";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/RoutingDurationDisplay.vue", () => {
    let store,
        wrapper,
        props;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing:
                        {
                            namespaced: true,
                            modules: {
                                Directions: {
                                    namespaced: true,
                                    state: stateDirections,
                                    mutations: mutationsDirections,
                                    actions: actionsDirections,
                                    getters: gettersDirections
                                }
                            },
                            mutations,
                            actions,
                            getters
                        }
                    }
                }
            }
        });

        props = {
            duration: 1
        };
    });

    it("renders RoutingDurationDisplayComponent", () => {
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("span").exists()).to.be.true;
    });

    it("renders duration < 60 as '1 min'", () => {
        props.duration = 1;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("span").text()).equal("< 1 min");
    });

    it("renders duration < 3600 as minutes", () => {
        props.duration = 3599;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("span").text()).equal("59 min");
    });

    it("renders duration >= 3600 as hours", () => {
        props.duration = 3600;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("span").text()).equal("1 h");
    });

    it("renders duration >= 3600 as hours with remaining minutes", () => {
        props.duration = 3660;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find(".minutesminushours").text()).equal("1 min");
    });
});
