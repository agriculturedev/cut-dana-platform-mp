import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import FeatureListerComponent from "../../../components/FeatureLister.vue";
import FeatureLister from "../../../store/indexFeatureLister";
import layerCollection from "../../../../../core/layers/js/layerCollection";
import getGfiFeatureModule from "../../../../../shared/js/utils/getGfiFeaturesByTileFeature";

config.global.mocks.$t = key => key;

describe("src/modules/featureLister/components/FeatureLister.vue", () => {
    const mockMapGetters = {
        getVisibleOlLayerList: () => [{name: "ersterLayer", id: "123", features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}, {name: "zweiterLayer", id: "456", features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}, {name: "dritterLayer", id: "789", features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}]
    };
    let store,
        wrapper,
        rootGetters,
        removeHighlightFeatureSpy,
        features,
        layer;

    beforeEach(() => {
        FeatureLister.actions.switchTabTo = sinon.spy(FeatureLister.actions.switchTabTo);
        FeatureLister.actions.addMouseEvents = sinon.spy(FeatureLister.actions.addMouseEvents);
        FeatureLister.mutations.resetToThemeChooser = sinon.spy(FeatureLister.mutations.resetToThemeChooser);
        FeatureLister.getters.headers = () => [{key: "name", value: "Name"}];
        removeHighlightFeatureSpy = sinon.spy();
        features = [{values_: {features: [{
            getId: () => "1"
        },
        {
            getId: () => "2"
        }
        ]}}];
        layer = {
            name: "ersterLayer",
            id: "123",
            features: features,
            geometryType: "Point"
        };

        sinon.stub(layerCollection, "getLayerById").returns(
            {
                getLayerSource: () => {
                    return {
                        getFeatures: () => {
                            return features;
                        }
                    };
                },
                getLayer: () => {
                    return {
                        values_: []
                    };
                }
            }
        );
        sinon.stub(getGfiFeatureModule, "getGfiFeature").returns(
            {getAttributesToShow: () => [{key: "name", value: "Name"}], getProperties: () => [{key: "name", value: "Name"}]}
        );

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        FeatureLister
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters,
                    actions: {
                        removeHighlightFeature: removeHighlightFeatureSpy
                    }
                }
            }
        });
    });

    afterEach(sinon.restore);

    it("renders list of visible vector layers", () => {
        store.commit("Modules/FeatureLister/setLayerListView", true);
        wrapper = shallowMount(FeatureListerComponent, {global: {plugins: [store]}});

        expect(wrapper.find("#feature-lister-themes").exists()).to.be.true;
        expect(store.state.Modules.FeatureLister.featureDetailView).to.be.false;
        expect(store.state.Modules.FeatureLister.featureListView).to.be.false;
        expect(store.state.Modules.FeatureLister.layerListView).to.be.true;
        wrapper.unmount();
        expect(removeHighlightFeatureSpy.calledOnce).to.be.true;
        expect(FeatureLister.mutations.resetToThemeChooser.calledOnce).to.be.true;
    });

    it("calls expected functions on unmount", () => {
        store.commit("Modules/FeatureLister/setLayerListView", true);
        wrapper = shallowMount(FeatureListerComponent, {global: {plugins: [store]}});

        expect(wrapper.find("#feature-lister-themes").exists()).to.be.true;
        wrapper.unmount();
        expect(removeHighlightFeatureSpy.calledOnce).to.be.true;
        expect(FeatureLister.mutations.resetToThemeChooser.calledOnce).to.be.true;
    });

    it("renders list of 2 features", () => {
        store.dispatch("Modules/FeatureLister/switchToList", {rootGetters}, layer);
        wrapper = shallowMount(FeatureListerComponent, {global: {plugins: [store]}});

        expect(wrapper.find("#feature-lister-list").exists()).to.be.true;
        expect(wrapper.find("#module-feature-lister-feature-0").exists()).to.be.true;
        expect(wrapper.find("#module-feature-lister-feature-1").exists()).to.be.true;
        expect(store.state.Modules.FeatureLister.featureDetailView).to.be.false;
        expect(store.state.Modules.FeatureLister.featureListView).to.be.true;
        expect(store.state.Modules.FeatureLister.layerListView).to.be.false;
    });
    it("renders details of selected feature", async () => {
        store.commit("Modules/FeatureLister/setSelectedFeatureIndex", 0);
        store.dispatch("Modules/FeatureLister/switchToList", {rootGetters}, layer);
        store.dispatch("Modules/FeatureLister/switchToDetails");
        wrapper = shallowMount(FeatureListerComponent, {global: {plugins: [store]}});
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#feature-lister-details").exists()).to.be.true;
        expect(store.state.Modules.FeatureLister.featureDetailView).to.be.true;
        expect(store.state.Modules.FeatureLister.featureListView).to.be.false;
        expect(store.state.Modules.FeatureLister.layerListView).to.be.false;
    });
});
