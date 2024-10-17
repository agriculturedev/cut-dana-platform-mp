import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import RoutingSpeedProfileIconComponent from "../../../components/RoutingSpeedProfileIcon.vue";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/RoutingSpeedProfileIcon.vue", () => {
    let store,
        wrapper,
        props;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
            },
            state: {
            }
        });

        props = {
            speedProfileId: "CAR",
            tooltip: "testtooltip"
        };
    });


    it("renders RoutingSpeedProfileIconComponent", () => {
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("svg").exists()).to.be.true;
    });

    it("renders tooltip", () => {
        props.tooltip = "testtooltip";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("title").exists()).to.be.true;
        expect(wrapper.find("title").text()).equal("testtooltip");
    });

    it("renders CAR icon", () => {
        props.speedProfileId = "CAR";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-CAR").exists()).to.be.true;
    });

    it("renders HGV icon", () => {
        props.speedProfileId = "HGV";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-HGV").exists()).to.be.true;
    });

    it("renders CYCLING icon", () => {
        props.speedProfileId = "CYCLING";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-CYCLING").exists()).to.be.true;
    });

    it("renders FOOT icon", () => {
        props.speedProfileId = "FOOT";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-FOOT").exists()).to.be.true;
    });

    it("renders WHEELCHAIR icon", () => {
        props.speedProfileId = "WHEELCHAIR";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-WHEELCHAIR").exists()).to.be.true;
    });
});
