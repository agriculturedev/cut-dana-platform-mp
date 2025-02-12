import {expect} from "chai";
import sinon from "sinon";
import mutations from "../../../store/mutationsFeatureLister";
import layerCollection from "../../../../../core/layers/js/layerCollection";

describe("src/modules/featureLister/store/mutationsFeatureLister", () => {
    let state, features, layer;

    beforeEach(() => {
        features = [{name: "erstesFeature", getId: () => "123"}, {name: "zweitesFeature", getId: () => "456"}, {name: "drittesFeature", getId: () => "789"}];
        layer = {
            name: "ersterLayer",
            id: "1",
            getLayerSource: () => {
                return {
                    getFeatures: () => features
                };
            },
            getLayer: () => {
                return {
                    values_: []
                };
            }
        };
        state = {
            layer,
            setGfiFeaturesOfLayer: null,
            nestedFeatures: false,
            selectedFeatureIndex: null,
            layerListView: true,
            featureListView: false,
            featureDetailView: false
        };
        sinon.stub(layerCollection, "getLayerById").returns(layer);
    });

    afterEach(sinon.restore);

    describe("setGfiFeaturesOfLayer", () => {
        it("sets the gfiFeatures of a layer to state - no clustering", () => {
            mutations.setGfiFeaturesOfLayer(state);
            expect(state.gfiFeaturesOfLayer.length).to.be.equals(3);
            expect(state.nestedFeatures).to.be.false;
            for (let i = 0; i < state.gfiFeaturesOfLayer.length; i++) {
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getAttributesToShow");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getDocument");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getFeatures");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getGfiUrl");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getId");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getLayerId");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getMimeType");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getOlFeature");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getProperties");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getTheme");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getTitle");
            }
        });
        it("sets the gfiFeatures of a layer to state - with clustering", () => {
            const clusteredFeatures = [
                    {name: "cluster1",
                        getId: () => "5.1"},
                    {name: "cluster2",
                        getId: () => "5.2"}
                ],
                clustered = {
                    values_: {
                        features: clusteredFeatures
                    }
                };

            features.push(clustered);

            mutations.setGfiFeaturesOfLayer(state);
            expect(state.gfiFeaturesOfLayer.length).to.be.equals(5);
            expect(state.nestedFeatures).to.be.true;
            for (let i = 0; i < state.gfiFeaturesOfLayer.length; i++) {
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getAttributesToShow");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getDocument");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getFeatures");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getGfiUrl");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getId");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getLayerId");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getMimeType");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getOlFeature");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getProperties");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getTheme");
                expect(state.gfiFeaturesOfLayer[i]).to.have.property("getTitle");
            }
        });
    });

    describe("resetToThemeChooser", () => {
        it("resets the state to display the themeChooser tab", () => {
            state.selectedFeatureIndex = 1;
            state.layerListView = false;
            state.featureListView = true;

            mutations.resetToThemeChooser(state);
            expect(state.selectedFeatureIndex).to.eql(null);
            expect(state.layer).to.eql(null);
            expect(state.layerListView).to.eql(true);
            expect(state.featureListView).to.eql(false);
            expect(state.featureDetailView).to.eql(false);
        });
    });
});
