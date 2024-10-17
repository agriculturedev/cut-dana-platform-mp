import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsFeatureLister";
import layerCollection from "../../../../../core/layers/js/layerCollection";
import createLayerAddToTreeModule from "../../../../../shared/js/utils/createLayerAddToTree";

describe("src/modules/featureLister/store/actionsFeatureLister", () => {
    let commit, dispatch, rootGetters;
    const highlightVectorRulesPolygon = {
            "fill": {
                "color": [255, 0, 255, 0.9]
            },
            "stroke": {
                "width": 4,
                "color": [0, 0, 204, 0.9]
            },
            "zoomLevel": 5
        },
        highlightVectorRulesPointLine = {
            "stroke": {
                "width": 8,
                "color": [255, 0, 255, 0.9]
            },
            "image": {
                "scale": 2
            },
            "zoomLevel": 5
        };

    document.body.innerHTML =
        "<div id=\"parent\">" +
        "   <div id=\"featureLister\">" +
        "       <p id=\"tool-feature-lister-list\" >Liste der Feature</p>" +
        "   </div>" +
        "   <ul class=\"feature-lister-navtabs\">" +
        "       <li id=\"tool-feature-lister-themeChooser\" >Liste der Layer</li>" +
        "       <li id=\"tool-feature-lister-list\" >Liste der Feature</li>" +
        "       <li id=\"tool-feature-lister-details\" >Detailansicht</li>" +
        "   </ul>" +
        "</div>";

    beforeEach(() => {
        const state = {
            geometry: {getType: () => {
                "Point";
            }},
            source: {getFeatures: () => [{name: "feature", id: "1", getId: () => "1", getGeometry: () => state.geometry}]}
        };

        commit = sinon.spy();
        dispatch = sinon.spy();
        sinon.stub(layerCollection, "getOlLayers").returns(
            [
                {name: "ersterLayer", values_: {id: "123"}, getSource: () => state.source, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "zweiterLayer", values_: {id: "456"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "dritterLayer", values_: {id: "789"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}
            ]
        );
    });
    afterEach(sinon.restore);

    describe("clickOnFeature", () => {
        it("handles the click event when clicking in a point-feature in the feature list view", () => {
            const featureIndex = 1,
                geometry = {
                    getType: () => "Point",
                    getCoordinates: () => [1, 2]
                },
                state = {
                    shownFeatures: 20,
                    features: [{erstesFeature: "first", getGeometry: () => "Point"}, {zweitesFeature: "second", getGeometry: () => geometry}, {drittesFeature: "third"}],
                    layer: {
                        id: "layerId",
                        geometryType: "Point",
                        features: [{erstesFeature: "first"}, {zweitesFeature: "second"}, {drittesFeature: "third"}]
                    },
                    highlightVectorRulesPointLine
                },
                getters = {
                    selectedFeature: () => state.features[1],
                    getGeometryType: "Point"
                },
                createLayerAddToTreeStub = sinon.spy(createLayerAddToTreeModule, "createLayerAddToTree");

            rootGetters = {treeHighlightedFeatures: {active: true}};

            actions.clickOnFeature({state, commit, dispatch, getters, rootGetters}, featureIndex);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectedFeatureIndex");
            expect(commit.firstCall.args[1]).to.eql(featureIndex);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.eql("switchToDetails");
            expect(dispatch.secondCall.args[0]).to.eql("Maps/zoomToCoordinates");
            expect(dispatch.secondCall.args[1]).to.deep.eql({center: [1, 2]});
            expect(dispatch.thirdCall.args[0]).to.eql("Maps/setZoom");
            expect(dispatch.thirdCall.args[1]).to.deep.eql(5);
            expect(createLayerAddToTreeStub.calledOnce).to.be.true;
            expect(createLayerAddToTreeStub.firstCall.args[0]).to.be.deep.equals(state.layer.id);
            expect(createLayerAddToTreeStub.firstCall.args[1]).to.be.deep.equals([state.features[1]]);
        });
        it("handles the click event when clicking in a polygon-feature in the feature list view, treeHighlightedFeatures not active", () => {
            const featureIndex = 1,
                geometry = {
                    getType: () => "Polygon",
                    getExtent: () => [1, 2, 3, 4]
                },
                state = {
                    shownFeatures: 20,
                    features: [{erstesFeature: "first", getGeometry: () => "Point"}, {zweitesFeature: "second", getGeometry: () => geometry}, {drittesFeature: "third"}],
                    layer: {
                        id: "layerId",
                        geometryType: "Polygon",
                        features: [{erstesFeature: "first"}, {zweitesFeature: "second"}, {drittesFeature: "third"}]
                    },
                    highlightVectorRulesPolygon
                },
                getters = {
                    selectedFeature: () => state.features[1],
                    getGeometryType: "Polygon"
                },
                createLayerAddToTreeStub = sinon.spy(createLayerAddToTreeModule, "createLayerAddToTree");

            rootGetters = {treeHighlightedFeatures: {active: false}};

            actions.clickOnFeature({state, commit, dispatch, getters, rootGetters}, featureIndex);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectedFeatureIndex");
            expect(commit.firstCall.args[1]).to.eql(featureIndex);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.eql("switchToDetails");
            expect(dispatch.secondCall.args[0]).to.eql("Maps/zoomToCoordinates");
            expect(dispatch.secondCall.args[1]).to.deep.eql({center: [2, 3]});
            expect(dispatch.thirdCall.args[0]).to.eql("Maps/setZoom");
            expect(dispatch.thirdCall.args[1]).to.deep.eql(5);
            expect(createLayerAddToTreeStub.notCalled).to.be.true;
        });
    });

    describe("hoverOverFeature", () => {
        const features = [{erstesFeature: "first", getId: () => "1"}, {zweitesFeature: "second", getId: () => "2"}, {drittesFeature: "third", getId: () => "3"}],
            state = {
                shownFeatures: 2
            };
        let getters = {
            selectedFeature: () => features[1]
        };

        it("handles the hover event when hovering over a feature in the feature list view", () => {
            actions.hoverOverFeature({state, dispatch, getters}, 1);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("highlightFeature");
            expect(dispatch.firstCall.args[1]).to.deep.equal(features[1]);
        });
        it("handles the hover event when hovering over a nested feature in the feature list view", () => {
            getters = {
                selectedFeature: () => features[2]
            };
            actions.hoverOverFeature({state, dispatch, getters}, 2);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("highlightFeature");
            expect(dispatch.firstCall.args[1]).to.deep.equal(features[2]);
        });
    });

    describe("highlightFeature", () => {
        let geometryType = "Point",
            feature, state, getters;

        beforeEach(() => {
            feature = {
                getGeometry: () => {
                    return {
                        getType: () => geometryType

                    };
                },
                getId: () => "featureID"
            };
            state = {
                layer: {
                    name: "ersterLayer",
                    id: "123",
                    styleId: "123",
                    geometryType: geometryType
                },
                highlightVectorRulesPolygon,
                highlightVectorRulesPointLine
            };
            getters = {
                getGeometryType: geometryType
            };
            rootGetters = {
                layerConfigById: sinon.stub().returns({styleId: "123"})
            };
        });

        it("highlights a point feature depending on its geometryType", () => {
            actions.highlightFeature({state, dispatch, getters, rootGetters}, feature);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
            expect(dispatch.secondCall.args[1].type).to.equal("increase");
            expect(dispatch.secondCall.args[1].type).to.equal("increase");
            expect(dispatch.secondCall.args[1].styleId).to.equal("123");
        });
        it("highlights a MultiPoint feature depending on its geometryType", () => {
            geometryType = "MultiPoint";
            actions.highlightFeature({state, dispatch, getters, rootGetters}, feature);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
            expect(dispatch.secondCall.args[1].styleId).to.equal("123");
        });
        it("highlights a polygon feature depending on its geometryType", () => {
            geometryType = "Polygon";
            actions.highlightFeature({state, dispatch, getters, rootGetters}, feature);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
            expect(dispatch.secondCall.args[1].type).to.equal("highlightPolygon");
            expect(dispatch.secondCall.args[1].styleId).to.equal("123");
        });
        it("highlights a line feature depending on its geometryType", () => {
            geometryType = "LineString";
            actions.highlightFeature({state, dispatch, getters, rootGetters}, feature);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
            expect(dispatch.secondCall.args[1].type).to.equal("highlightLine");
            expect(dispatch.secondCall.args[1].styleId).to.equal("123");
        });
    });

    describe("switchToList", () => {
        const layer = {name: "ersterLayer", id: "123", features: [{values_: {features: [1, 2]}}], geometryType: "Point"},
            state = {
                maxFeatures: 10,
                layer: layer,
                gfiFeaturesOfLayer: [{erstesFeature: "first"}, {zweitesFeature: "second"}, {drittesFeature: "third"}]
            };

        it("switches to the feature list view", () => {
            actions.switchToList({state, rootGetters, commit, dispatch}, layer);
            expect(commit.callCount).to.equal(4);
            expect(commit.firstCall.args[0]).to.equal("setLayer");
            expect(commit.firstCall.args[1]).to.equal(layer);
            expect(commit.secondCall.args[0]).to.equal("setGfiFeaturesOfLayer");
            expect(commit.thirdCall.args[0]).to.equal("setFeatureCount");
            expect(commit.getCall(3).args[0]).to.equal("setShownFeatures");
            expect(commit.getCall(3).args[1]).to.equal(3);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("switchBackToList");
        });
    });

    describe("switchBackToList", () => {
        it("switches to back to list", () => {
            const state = {
                layer: {}
            };

            actions.switchBackToList({state, commit});
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLayerListView");
            expect(commit.firstCall.args[1]).to.be.false;
            expect(commit.secondCall.args[0]).to.equal("setFeatureDetailView");
            expect(commit.secondCall.args[1]).to.be.false;
            expect(commit.thirdCall.args[0]).to.equal("setFeatureListView");
            expect(commit.thirdCall.args[1]).to.be.true;
        });
    });


    describe("switchToThemes", () => {
        it("switches to the themes tab", () => {

            actions.switchToThemes({commit});
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("resetToThemeChooser");
        });
    });

    describe("switchToDetails", () => {
        it("switches to the details tab", () => {
            const state = {
                selectedFeatureIndex: 0
            };

            actions.switchToDetails({state, commit});
            expect(commit.firstCall.args[0]).to.equal("setLayerListView");
            expect(commit.firstCall.args[1]).to.equal(false);
            expect(commit.secondCall.args[0]).to.equal("setFeatureListView");
            expect(commit.secondCall.args[1]).to.equal(false);
            expect(commit.thirdCall.args[0]).to.equal("setFeatureDetailView");
            expect(commit.thirdCall.args[1]).to.equal(true);
        });
    });

    describe("showMore", () => {
        const state = {
            shownFeatures: 20,
            featureCount: 100
        };

        it("adds ten more features to the list view if the total featureCount is big enough", () => {
            actions.showMore({state, commit, dispatch});
            expect(commit.firstCall.args[0]).to.equal("setShownFeatures");
            expect(commit.firstCall.args[1]).to.equal(30);
        });
        it("adds as many features as neccessary to meet the total featureCount", () => {
            state.featureCount = 25;

            actions.showMore({state, commit, dispatch});
            expect(commit.firstCall.args[0]).to.equal("setShownFeatures");
            expect(commit.firstCall.args[1]).to.equal(25);
        });
    });

});
