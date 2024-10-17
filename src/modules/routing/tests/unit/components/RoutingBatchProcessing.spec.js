import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount, mount} from "@vue/test-utils";
import RoutingBatchProcessingComponent from "../../../components/RoutingBatchProcessing.vue";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/RoutingBatchProcessing.vue", () => {
    let store,
        wrapper,
        props;

    beforeEach(() => {
        store = createStore({
            namespaced: true
        });

        props = {
            settings: {},
            progress: 0,
            isProcessing: false,
            structureText: "",
            exampleText: ""
        };
    });

    it("renders RoutingBatchProcessingComponent", () => {
        wrapper = shallowMount(RoutingBatchProcessingComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("#routing-batch-processing").exists()).to.be.true;
    });

    it("renders processing", () => {
        props.isProcessing = true;
        props.progress = 10.00;
        wrapper = shallowMount(RoutingBatchProcessingComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find("#routing-batch-processing-isprocessing").exists()).to.be.true;
        expect(wrapper.find("progress").element.value).to.equal(10);
        expect(wrapper.find("#routing-batch-processing-isprocessing-progresstext").element.innerHTML).to.equal("10 %");
    });

    it("renders emits cancelProcess while processing", async () => {
        props.isProcessing = true;
        props.progress = 10.00;
        wrapper = mount(RoutingBatchProcessingComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });

        const button = wrapper.find(".bi-x");

        button.trigger("keydown.enter");
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().cancelProcess.length).equal(1);
    });
});
