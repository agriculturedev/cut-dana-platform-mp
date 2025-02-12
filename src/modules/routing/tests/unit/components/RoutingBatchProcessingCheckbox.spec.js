import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import RoutingBatchProcessingCheckboxComponent from "../../../components/RoutingBatchProcessingCheckbox.vue";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/RoutingBatchProcessingCheckbox.vue", () => {
    let store,
        wrapper,
        props;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
            }
        });

        props = {
            batchProcessing: {
                active: false
            }
        };
    });

    it("renders RoutingBatchProcessingCheckboxComponent", () => {
        wrapper = shallowMount(RoutingBatchProcessingCheckboxComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("#routing-batch-processing-checkbox").exists()).to.be.true;
        expect(wrapper.find("input").element.checked).to.be.false;
    });

    it("changes checked input", () => {
        props.batchProcessing.active = true;
        wrapper = shallowMount(RoutingBatchProcessingCheckboxComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("input").element.checked).to.be.true;
    });


    it("emits input on change", async () => {
        wrapper = shallowMount(RoutingBatchProcessingCheckboxComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        const input = wrapper.find("input");

        input.element.checked = true;
        input.trigger("input");
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().input.length).equal(1);
        expect(wrapper.emitted().input[0]).deep.to.equal([true]);
    });
});
