import {expect} from "chai";
import Feature from "ol/Feature";
import View from "ol/View";
import sinon from "sinon";
import getters from "../../../store/gettersGetFeatureInfo";

describe("src/modules/getFeatureInfo/store/gettersGetFeatureInfo.js", () => {

    describe("gfiFeaturesAtPixel", () => {
        it("gfiFeaturesAtPixel returns an array", () => {
            const gfiFeaturesAtPixel = getters.gfiFeaturesAtPixel(),
                map = {
                    id: "ol",
                    mode: "2D",
                    view: new View(),
                    forEachFeatureAtPixel: sinon.spy(),
                    getLayers: () => {
                        return {
                            getArray: () => []
                        };
                    }
                };

            mapCollection.clear();
            mapCollection.addMap(map, "2D");
            expect(gfiFeaturesAtPixel([40, 50], null, "2D")).be.an("array");
        });
    });

    describe("gfiFeaturesReverse", () => {
        it("returns the Features in reverse order", () => {
            const feature1 = new Feature({visible: true, typ: "WMS"}),
                feature2 = new Feature({visible: true, typ: "WFS"}),
                feature3 = new Feature({visible: true, typ: "WCS"}),
                state = {
                    gfiFeatures: [feature1, feature2, feature3]
                };

            expect(getters.gfiFeaturesReverse(state)).to.eql([feature3, feature2, feature1]);
        });
    });

    describe("urlParams", () => {
        it("returns the urlParams", () => {
            const state = {
                    currentFeature: {
                        getLayerId: () => "1"
                    },
                    clickCoordinates: [100, 200],
                    gfiFeatures: [{id: "feature_1"}],
                    initialMenuSide: "mainMenu",
                    showMarker: true,
                    type: "getFeatureInfo",
                    visible: true
                },
                urlParamsState = getters.urlParams(state);

            expect(urlParamsState).to.be.an("object");
            expect(urlParamsState.type).to.be.equals("getFeatureInfo");
            expect(urlParamsState.clickCoordinates).to.be.deep.equals([100, 200]);
            expect(urlParamsState.initialMenuSide).to.be.equals("mainMenu");
            expect(urlParamsState.showMarker).to.be.true;
            expect(urlParamsState.visible).to.be.true;
            expect(urlParamsState.layerId).to.be.equals("1");
            expect(urlParamsState.currentFeature).to.null;
            expect(urlParamsState.gfiFeatures).to.be.deep.equals([]);
        });
    });
});
