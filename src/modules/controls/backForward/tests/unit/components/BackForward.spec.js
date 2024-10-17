import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import BackForward from "../../../components/BackForward.vue";
import BackForwardModule from "../../../store/indexBackForward";
import {expect} from "chai";

config.global.mocks.$t = key => key;

describe("src/modules/controls/backForward/components/BackForward.vue", () => {
    let store,
        memorize,
        zoom,
        center,
        counter;


    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            on: (signal, mem) => {
                memorize = mem;
            },
            un: () => { /* doesn't matter for test*/ },
            getView: () => {
                return {
                    getCenter: () => [counter++, counter++],
                    getZoom: () => counter++,
                    setCenter: c => {
                        center = c;
                    },
                    setZoom: z => {
                        zoom = z;
                    }
                };
            }
        };

        memorize = null;
        zoom = null;
        center = null;
        counter = 0;
        store = createStore({
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        BackForward: BackForwardModule
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => "2D"
                    }
                }
            }
        });
        mapCollection.clear();
        mapCollection.addMap(map, "2D");
    });

    it("renders the forward/backward buttons", () => {
        const wrapper = mount(BackForward, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#back-forward-buttons").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(2);
    });

    it("has initially inactive buttons", () => {
        const wrapper = mount(BackForward, {
                global: {
                    plugins: [store]
                }}),
            buttons = wrapper.findAll("button");

        expect(buttons.at(0).attributes().disabled).to.equal("");
        expect(buttons.at(1).attributes().disabled).to.equal("");
    });

    it("has active back and forward buttons on matching state", async () => {
        const wrapper = mount(BackForward, {
                global: {
                    plugins: [store]
                }}),
            buttons = wrapper.findAll("button");

        // memorize 0th and 1st state
        memorize();
        memorize();
        await wrapper.vm.$nextTick();

        // no future state, but past state available
        expect(buttons.at(0).attributes().disabled).to.equal("");
        expect(buttons.at(1).attributes().disabled).to.be.undefined;

        // click back button
        buttons.at(1).trigger("click");
        await wrapper.vm.$nextTick();

        // no previous state, but future state available
        expect(buttons.at(0).attributes().disabled).to.be.undefined;
        expect(buttons.at(1).attributes().disabled).to.equal("");
        expect(zoom).to.equal(2);
        expect(center).to.eql([0, 1]);

        // click forward button
        buttons.at(0).trigger("click");
        await wrapper.vm.$nextTick();
        expect(buttons.at(0).attributes().disabled).to.equal("");
        expect(buttons.at(1).attributes().disabled).to.be.undefined;
        expect(zoom).to.equal(5);
        expect(center).to.eql([3, 4]);
    });
});
