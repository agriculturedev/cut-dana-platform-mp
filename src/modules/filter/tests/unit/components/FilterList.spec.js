import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import FilterList from "../../../components/FilterList.vue";
import IconButton from "../../../../../shared/modules/buttons/components/IconButton.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/filter/components/FilterList.vue", () => {
    let wrapper,
        store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                }
            }
        });
        wrapper = shallowMount(FilterList, {
            propsData: {
                filters: [{filterId: 0, title: "i am a filter"}],
                multiLayerSelector: false
            },
            global: {
                plugins: [store]
            }
        });
    });

    it("should render filters", () => {
        expect(wrapper.findAll(".panel-default")).to.have.length(1);
    });

    it("should render filter title disabled true if multiLayerSelector is false", async () => {
        await wrapper.setProps({
            selectedLayers: [{
                filterId: 0
            }]
        });
        expect(wrapper.find(".disabled").exists()).to.be.true;
    });
    it("should render filter title not disabled if multiLayerSelector is true", async () => {
        await wrapper.setProps({
            multiLayerSelector: true,
            selectedLayers: [0]
        });
        expect(wrapper.find(".disabled").exists()).to.be.false;
    });

    it("should render short description if filter is closed", async () => {
        await wrapper.setProps({
            selectedLayers: [{
                filterId: 1
            }],
            filters: [{
                shortDescription: "Short Description",
                filterId: 0
            }]
        });
        expect(wrapper.find(".layerInfoText").exists()).to.be.true;
        expect(wrapper.find(".layerInfoText").text()).to.equal("Short Description");
    });
    it("should not render short description if filter is open", async () => {
        await wrapper.setProps({
            selectedLayers: [{
                filterId: 0
            }],
            filters: [{
                filterId: 0
            }]
        });
        expect(await wrapper.find(".layerInfoText").exists()).to.be.false;
    });

    it("should render an icon button if initialStartupReset is true on the filter", async () => {
        wrapper.vm.hasUnfixedRules = () => true;
        await wrapper.setProps({
            selectedLayers: [{
                filterId: 0
            }],
            filters: [{
                filterId: 0,
                initialStartupReset: true
            }]
        });
        expect(wrapper.findComponent(IconButton).exists()).to.be.true;
    });
    it("should not render an icon button if initialStartupReset is false on the filter", async () => {
        wrapper.vm.hasUnfixedRules = () => true;
        await wrapper.setProps({
            selectedLayers: [{
                filterId: 0
            }],
            filters: [{
                filterId: 0,
                initialStartupReset: false
            }]
        });
        expect(wrapper.findComponent(IconButton).exists()).to.be.false;
    });

    describe("updateSelectedLayers", () => {
        it("should not change selected layers if passed argument is not an id", () => {
            const expected = [];

            wrapper.vm.updateSelectedLayers(null);
            wrapper.vm.updateSelectedLayers(undefined);
            wrapper.vm.updateSelectedLayers([]);
            wrapper.vm.updateSelectedLayers("1234");
            wrapper.vm.updateSelectedLayers({});
            wrapper.vm.updateSelectedLayers(false);
            wrapper.vm.updateSelectedLayers(true);

            expect(wrapper.vm.selectedLayers).to.deep.equal(expected);

        });

        it("should update selected layers", () => {
            const filterId = 1234;

            wrapper.vm.updateSelectedLayers(filterId);
            expect(wrapper.emitted()).to.have.property("selectedAccordions");
        });
    });
    describe("scrollToView", () => {
        it("should emit if aynthing but a number is given", () => {
            wrapper.vm.scrollToView([]);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView({});
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView("string");
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(true);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(false);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(undefined);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(null);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
        });
        it("should emit if a number is given", async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.scrollToView(0);
            expect(wrapper.emitted()).to.have.property("resetJumpToId");
        });
    });
});
