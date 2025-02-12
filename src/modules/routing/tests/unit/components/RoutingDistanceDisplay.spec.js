import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import RoutingDistanceDisplayComponent from "../../../components/RoutingDistanceDisplay.vue";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import thousandsSeparator from "../../../../../shared/js/utils/thousandsSeparator";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/RoutingDistanceDisplay.vue", () => {
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
                        Routing: {
                            namespaced: true,
                            mutations: mutations,
                            actions: actions
                        }
                    }
                }
            }
        });

        props = {
            distance: 1
        };
    });

    it("renders RoutingDistanceDisplayComponent", () => {
        wrapper = shallowMount(RoutingDistanceDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("span").exists()).to.be.true;
    });

    it("renders distance in m", () => {
        props.distance = 999;
        wrapper = shallowMount(RoutingDistanceDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("span").text()).equal("999 m");
    });

    it("renders distance in km", () => {
        props.distance = 1234;
        wrapper = shallowMount(RoutingDistanceDisplayComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        const expectedResult = thousandsSeparator(1.2);

        expect(wrapper.find("span").text()).equal(`${expectedResult} km`);
    });
});
