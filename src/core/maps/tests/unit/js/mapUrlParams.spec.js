import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";
import View from "ol/View";

import highlightFeaturesByAttribute from "../../../js/highlightFeaturesByAttribute";
import mapUrlParams from "../../../js/mapUrlParams";
import store from "../../../../../app-store";

describe("src/core/maps/js/mapUrlParams.js", () => {
    let dispatchCalls = {},
        error,
        map,
        origGetters,
        styleListLoaded;

    before(() => {
        origGetters = store.getters;
    });

    beforeEach(() => {
        styleListLoaded = true;
        dispatchCalls = {};

        sinon.stub(console, "error").callsFake(error);

        store.dispatch = (arg1, arg2) => {
            dispatchCalls[arg1] = arg2 !== undefined ? arg2 : "called";
        };
        store.getters = {
            styleListLoaded: sinon.stub().returns(styleListLoaded)
        };

        mapCollection.clear();
        map = new Map({
            view: new View()
        });

        mapCollection.addMap(map, "2D");
    });

    afterEach(() => {
        sinon.restore();
        store.getters = origGetters;
    });

    describe("setMapAttributes", () =>{
        it("should set map attributes for 2D Map", () => {
            const params = {
                MAPS: "{\"center\":[571278.4429867676,5938534.397334521],\"mode\":\"2D\",\"zoom\":7}"
            };

            mapUrlParams.setMapAttributes(params);

            expect(Object.keys(dispatchCalls).length).to.equals(3);
            expect(dispatchCalls["Maps/setCamera"]).to.deep.equals({
                altitude: undefined,
                heading: NaN,
                tilt: undefined
            });
            expect(dispatchCalls["Maps/changeMapMode"]).to.equals("2D");
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: [571278.4429867676, 5938534.397334521],
                zoom: 7,
                rotation: undefined
            });
        });

        it("should set map attributes for 3D map", () => {
            const params = {
                MAPS: "{\"center\":[571278.4429867676,5938534.397334521],\"mode\":\"3D\",\"zoom\":7,\"altitude\":127,\"heading\":1.2502079000000208,\"tilt\":45}"
            };

            mapUrlParams.setMapAttributes(params);

            expect(Object.keys(dispatchCalls).length).to.equals(3);
            expect(dispatchCalls["Maps/setCamera"]).to.deep.equals({
                altitude: 127,
                heading: -1.2502079000000208,
                tilt: 45
            });
            expect(dispatchCalls["Maps/changeMapMode"]).to.equals("3D");
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: [571278.4429867676, 5938534.397334521],
                zoom: 7,
                rotation: undefined
            });
        });
    });

    describe("featureViaUrl", () => {
        it("should add a feature to map via url params", () => {
            const params = {
                FEATUREVIAURL: "[{\"layerId\":\"42\",\"features\":[{\"coordinates\":[10,53.5],\"label\":\"TestPunkt\"}]}]"

            };

            mapUrlParams.featureViaUrl(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/featureViaUrl"]).to.deep.equals([
                {
                    layerId: "42",
                    features: [
                        {
                            coordinates: [10, 53.5],
                            label: "TestPunkt"
                        }
                    ]

                }
            ]);
        });
    });

    describe("highlightFeature", () => {
        it("should highlight a feature with HIGHLIGHTFEATURE", () => {
            const params = {
                HIGHLIGHTFEATURE: "1711,DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2"
            };

            mapUrlParams.highlightFeature(params);

            expect(Object.keys(dispatchCalls).length).to.equals(2);
            expect(dispatchCalls["Maps/highlightFeature"]).to.deep.equals({
                layerIdAndFeatureId: ["1711", "DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2"],
                type: "viaLayerIdAndFeatureId"
            });
            expect(dispatchCalls["Maps/zoomToFilteredFeatures"]).to.deep.equals({
                ids: ["DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2"],
                layerId: "1711",
                zoomOptions: {duration: 0}
            });
        });
        it("should highlight a feature with MAP/HIGHLIGHTFEATURE", () => {
            const params = {
                "MAP/HIGHLIGHTFEATURE": "1711,DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2"
            };

            mapUrlParams.highlightFeature(params);

            expect(Object.keys(dispatchCalls).length).to.equals(2);
            expect(dispatchCalls["Maps/highlightFeature"]).to.deep.equals({
                layerIdAndFeatureId: ["1711", "DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2"],
                type: "viaLayerIdAndFeatureId"
            });
            expect(dispatchCalls["Maps/zoomToFilteredFeatures"]).to.deep.equals({
                ids: ["DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_2"],
                layerId: "1711",
                zoomOptions: {duration: 0}
            });
        });
        it("should highlight a list of features with HIGHLIGHTFEATURE", () => {
            const params = {
                HIGHLIGHTFEATURE: "1711,DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_6,DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_18,DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_29"
            };

            mapUrlParams.highlightFeature(params);

            expect(Object.keys(dispatchCalls).length).to.equals(2);
            expect(dispatchCalls["Maps/highlightFeature"]).to.deep.equals({
                layerIdAndFeatureId: ["1711", "DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_29"],
                type: "viaLayerIdAndFeatureId"
            });
            expect(dispatchCalls["Maps/zoomToFilteredFeatures"]).to.deep.equals({
                ids: ["DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_6", "DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_18", "DE.HH.UP_GESUNDHEIT_KRANKENHAEUSER_29"],
                layerId: "1711",
                zoomOptions: {duration: 0}
            });
        });
    });

    describe("highlightFeaturesByAttributes", () => {
        let highlightFeaturesByAttributeStub;

        beforeEach(() => {
            highlightFeaturesByAttributeStub = sinon.stub(highlightFeaturesByAttribute, "highlightFeaturesByAttribute");
        });

        it("should highlight a feature with HIGHLIGHTFEATURESBYATTRIBUTE", () => {
            const params = {
                ATTRIBUTENAME: "bezirk",
                ATTRIBUTEQUERY: "IsLike",
                ATTRIBUTEVALUE: "Altona",
                HIGHLIGHTFEATURESBYATTRIBUTE: "123",
                WFSID: "8712"
            };

            mapUrlParams.highlightFeaturesByAttributes(params);

            expect(highlightFeaturesByAttributeStub.calledOnce).to.be.true;
            expect(highlightFeaturesByAttributeStub.firstCall.args[0]).to.equals(store.dispatch);
            expect(highlightFeaturesByAttributeStub.firstCall.args[1]).to.equals(store.getters);
            expect(highlightFeaturesByAttributeStub.firstCall.args[2]).to.equals("8712");
            expect(highlightFeaturesByAttributeStub.firstCall.args[3]).to.equals("bezirk");
            expect(highlightFeaturesByAttributeStub.firstCall.args[4]).to.equals("Altona");
            expect(highlightFeaturesByAttributeStub.firstCall.args[5]).to.equals("IsLike");
        });

        it("should highlight a feature with API/HIGHLIGHTFEATURESBYATTRIBUTE", () => {
            const params = {
                ATTRIBUTENAME: "bezirk",
                ATTRIBUTEQUERY: "IsLike",
                ATTRIBUTEVALUE: "Altona",
                "API/HIGHLIGHTFEATURESBYATTRIBUTE": "123",
                WFSID: "8712"
            };

            mapUrlParams.highlightFeaturesByAttributes(params);

            expect(highlightFeaturesByAttributeStub.calledOnce).to.be.true;
            expect(highlightFeaturesByAttributeStub.firstCall.args[0]).to.equals(store.dispatch);
            expect(highlightFeaturesByAttributeStub.firstCall.args[1]).to.equals(store.getters);
            expect(highlightFeaturesByAttributeStub.firstCall.args[2]).to.equals("8712");
            expect(highlightFeaturesByAttributeStub.firstCall.args[3]).to.equals("bezirk");
            expect(highlightFeaturesByAttributeStub.firstCall.args[4]).to.equals("Altona");
            expect(highlightFeaturesByAttributeStub.firstCall.args[5]).to.equals("IsLike");
        });
    });

    describe("processProjection", () => {
        beforeEach(() => {
            sinon.stub(crs, "transformToMapProjection").returns([1, 2]);
        });

        it("should set projected center coordinate with PROJECTION and CENTER", () => {
            const params = {
                PROJECTION: "EPSG:31467",
                CENTER: [3565836, 5945355]
            };

            mapUrlParams.processProjection(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: [1, 2],
                zoom: undefined,
                rotation: undefined
            });
        });

        it("should set projected center coordinate with MAP/PROJECTION and MAP/CENTER", () => {
            const params = {
                "MAP/PROJECTION": "EPSG:31467",
                "MAP/CENTER": [3565836, 5945355]
            };

            mapUrlParams.processProjection(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: [1, 2],
                zoom: undefined,
                rotation: undefined
            });
        });

        it("should set marker to projected coordinates with PROJECTION and MARKER", () => {
            const params = {
                PROJECTION: "EPSG:31467",
                MARKER: [3565836, 5945355]
            };

            mapUrlParams.processProjection(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/placingPointMarker"]).to.deep.equals([1, 2]);
        });

        it("should set marker to projected coordinates with MAP/PROJECTION and MAPMARKER", () => {
            const params = {
                "MAP/PROJECTION": "EPSG:31467",
                MAPMARKER: [3565836, 5945355]
            };

            mapUrlParams.processProjection(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/placingPointMarker"]).to.deep.equals([1, 2]);
        });

        it("should set marker to projected coordinates with MAP/PROJECTION and MAPMARKER", () => {
            const params = {
                "MAP/PROJECTION": "EPSG:31467",
                MAPMARKER: [3565836, 5945355]
            };

            mapUrlParams.processProjection(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/placingPointMarker"]).to.deep.equals([1, 2]);
        });

        it("should zoom to an extent with params PROJECTION and ZOOMTOEXTENT", () => {
            const params = {
                PROJECTION: "EPSG:4326",
                ZOOMTOEXTENT: "10.0822,53.6458,10.1781,53.8003"
            };

            mapUrlParams.processProjection(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToProjExtent"]).to.deep.equals({
                extent: ["10.0822", "53.6458", "10.1781", "53.8003"],
                options: {duration: 0},
                projection: "EPSG:4326"
            });
        });

        it("should zoom to an extent with params MAP/PROJECTION and MAP/ZOOMTOEXTENT", () => {
            const params = {
                "MAP/PROJECTION": "EPSG:4326",
                "MAP/ZOOMTOEXTENT": "10.0822,53.6458,10.1781,53.8003"
            };

            mapUrlParams.processProjection(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToProjExtent"]).to.deep.equals({
                extent: ["10.0822", "53.6458", "10.1781", "53.8003"],
                options: {duration: 0},
                projection: "EPSG:4326"
            });
        });
    });

    describe("setMapMarker", () => {
        it("should set coordinates to mapMarker with MARKER", () => {
            const params = {
                MARKER: "565874,5934140"
            };

            mapUrlParams.setMapMarker(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/placingPointMarker"]).to.deep.equals([565874, 5934140]);
        });

        it("should set coordinates to mapMarker with MAPMARKER", () => {
            const params = {
                MAPMARKER: "[565874, 5934140]"
            };

            mapUrlParams.setMapMarker(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/placingPointMarker"]).to.deep.equals([565874, 5934140]);
        });
    });

    describe("setCamera", () => {
        it("should set camera params for 3D map", () => {
            const params = {
                ALTITUDE: "127",
                HEADING: "1.2502079000000208",
                TILT: "45"
            };

            mapUrlParams.setCamera(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/setCamera"]).to.deep.equals({
                altitude: "127",
                heading: -1.2502079000000208,
                tilt: "45"
            });
        });
    });

    describe("setMode", () => {
        it("should set MAP (mode) to 3D", () => {
            const params = {
                MAP: "3d"
            };

            mapUrlParams.setMode(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/changeMapMode"]).to.equals("3D");
        });

        it("should set MAPMODE to 3D", () => {
            const params = {
                MAPMODE: "3d"
            };

            mapUrlParams.setMode(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/changeMapMode"]).to.equals("3D");
        });

        it("should set MAP/MODE to 2D", () => {
            const params = {
                "MAP/MAPMODE": "2d"
            };

            mapUrlParams.setMode(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/changeMapMode"]).to.equals("2D");
        });
    });

    describe("zoomToCoordinates", () => {
        it("set ZOOMLEVEL and CENTER to map view", () => {
            const params = {
                CENTER: "553925,5931898",
                ZOOMLEVEL: 0
            };

            mapUrlParams.zoomToCoordinates(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: ["553925", "5931898"],
                zoom: 0,
                rotation: undefined
            });
        });

        it("set MAP/ZOOMLEVEL and MAP/CENTER to map view", () => {
            const params = {
                "MAP/CENTER": "553925,5931898",
                "MAP/ZOOMLEVEL": 0
            };

            mapUrlParams.zoomToCoordinates(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: ["553925", "5931898"],
                zoom: 0,
                rotation: undefined
            });
        });

        it("set MAP/CENTER as array to map view", () => {
            const params = {
                "MAP/CENTER": "[553925,5931898]"
            };

            mapUrlParams.zoomToCoordinates(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: [553925, 5931898],
                zoom: undefined,
                rotation: undefined
            });
        });

        it("set CENTER as array to map view", () => {
            const params = {
                CENTER: "[553925,5931898]"
            };

            mapUrlParams.zoomToCoordinates(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToCoordinates"]).to.deep.equals({
                center: [553925, 5931898],
                zoom: undefined,
                rotation: undefined
            });
        });
    });

    describe("zoomToFeatures", () => {
        it("should zoom to features with param ZOOMTOGEOMETRY", () => {
            const params = {
                ZOOMTOGEOMETRY: "bergedorf"
            };

            mapUrlParams.zoomToFeatures(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToFeatures"]).to.deep.equals({
                ZOOMTOFEATUREID: undefined,
                ZOOMTOGEOMETRY: "bergedorf"
            });
        });

        it("should zoom to features with param BEZIRK", () => {
            const params = {
                BEZIRK: "bergedorf"
            };

            mapUrlParams.zoomToFeatures(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToFeatures"]).to.deep.equals({
                ZOOMTOFEATUREID: undefined,
                ZOOMTOGEOMETRY: "bergedorf"
            });
        });

        it("should zoom to features with param MAP/ZOOMTOGEOMETRY", () => {
            const params = {
                "MAP/ZOOMTOGEOMETRY": "bergedorf"
            };

            mapUrlParams.zoomToFeatures(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToFeatures"]).to.deep.equals({
                ZOOMTOFEATUREID: undefined,
                ZOOMTOGEOMETRY: "bergedorf"
            });
        });

        it("should zoom to feature id with param ZOOMTOFEATUREID", () => {
            const params = {
                ZOOMTOFEATUREID: "18,26"
            };

            mapUrlParams.zoomToFeatures(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToFeatures"]).to.deep.equals({
                ZOOMTOFEATUREID: "18,26",
                ZOOMTOGEOMETRY: undefined
            });
        });

        it("should zoom to feature id with param FEATUREID", () => {
            const params = {
                FEATUREID: "18,26"
            };

            mapUrlParams.zoomToFeatures(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToFeatures"]).to.deep.equals({
                ZOOMTOFEATUREID: "18,26",
                ZOOMTOGEOMETRY: undefined
            });
        });

        it("should zoom to feature id with param MAP/ZOOMTOFEATUREID", () => {
            const params = {
                "MAP/ZOOMTOFEATUREID": "18,26"
            };

            mapUrlParams.zoomToFeatures(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToFeatures"]).to.deep.equals({
                ZOOMTOFEATUREID: "18,26",
                ZOOMTOGEOMETRY: undefined
            });
        });
    });

    describe("zoomToProjExtent", () => {
        beforeEach(() => {
            store.getters = {
                "Maps/projectionCode": "EPSG:25832"
            };
        });

        it("should zoomt o an extent with params PROJECTION and ZOOMTOEXTENT", () => {
            const params = {
                PROJECTION: "EPSG:4326",
                ZOOMTOEXTENT: "10.0822,53.6458,10.1781,53.8003"
            };

            mapUrlParams.zoomToProjExtent(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToProjExtent"]).to.deep.equals({
                extent: ["10.0822", "53.6458", "10.1781", "53.8003"],
                options: {duration: 0},
                projection: "EPSG:4326"
            });
        });

        it("should zoom to an extent with params MAP/PROJECTION and MAP/ZOOMTOEXTENT", () => {
            const params = {
                "MAP/PROJECTION": "EPSG:4326",
                "MAP/ZOOMTOEXTENT": "10.0822,53.6458,10.1781,53.8003"
            };

            mapUrlParams.zoomToProjExtent(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToProjExtent"]).to.deep.equals({
                extent: ["10.0822", "53.6458", "10.1781", "53.8003"],
                options: {duration: 0},
                projection: "EPSG:4326"
            });
        });

        it("should zoom to an extent with param ZOOMTOEXTENT", () => {
            const params = {
                ZOOMTOEXTENT: "510000,5850000,625000,6000000"
            };

            mapUrlParams.zoomToProjExtent(params);

            expect(Object.keys(dispatchCalls).length).to.equals(1);
            expect(dispatchCalls["Maps/zoomToProjExtent"]).to.deep.equals({
                extent: ["510000", "5850000", "625000", "6000000"],
                options: {duration: 0},
                projection: "EPSG:25832"
            });
        });
    });
});
