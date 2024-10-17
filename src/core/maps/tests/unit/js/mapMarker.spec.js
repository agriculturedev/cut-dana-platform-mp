import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {expect} from "chai";
import Feature from "ol/Feature.js";
import Map from "ol/Map";
import Point from "ol/geom/Point.js";
import sinon from "sinon";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

import mapMarker from "../../../js/mapMarker";

describe("src/core/js/maps/mapMarker.js", () => {
    let layerPoint,
        layerPolygon,
        map2d;

    beforeEach(() => {
        sinon.stub(styleList, "returnStyleObject");
        sinon.stub(createStyle, "createStyle");

        mapCollection.clear();
        map2d = new Map({
            id: "ol",
            mode: "2D"
        });

        layerPoint = new VectorLayer({
            id: "marker_point_layer",
            name: "markerPoint",
            source: new VectorSource()
        });
        layerPolygon = new VectorLayer({
            id: "marker_polygon_layer",
            name: "markerPolygon",
            source: new VectorSource()
        });

        layerPoint.set("styleId", "defaultMapMarkerPoint");
        layerPolygon.set("styleId", "defaultMapMarkerPolygon");

        map2d.addLayer(layerPoint);
        map2d.addLayer(layerPolygon);

        mapCollection.addMap(map2d, "2D");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createMapMarker", () => {
        it("creates a point map marker", () => {
            const geometryType = "POINT",
                styleId = "123",
                layer = mapMarker.createMapMarker(geometryType, styleId);

            expect(layer instanceof VectorLayer).to.be.true;
            expect(layer.get("altitudeMode")).to.equals("absolute");
            expect(layer.get("alwaysOnTop")).to.be.true;
            expect(layer.get("id")).to.equals("marker_point_layer");
            expect(layer.get("name")).to.equals("markerPoint");
            expect(layer.get("styleId")).to.equals(styleId);
            expect(layer.get("visible")).to.be.true;
        });

        it("creates a polygon map marker", () => {
            const geometryType = "POLYGON",
                styleId = "123",
                layer = mapMarker.createMapMarker(geometryType, styleId);

            expect(layer instanceof VectorLayer).to.be.true;
            expect(layer.get("altitudeMode")).to.equals("relativeToGround");
            expect(layer.get("alwaysOnTop")).to.be.true;
            expect(layer.get("id")).to.equals("marker_polygon_layer");
            expect(layer.get("name")).to.equals("markerPolygon");
            expect(layer.get("styleId")).to.equals(styleId);
            expect(layer.get("visible")).to.be.true;
        });
    });

    describe("addFeatureToMapMarkerLayer", () => {
        it("adds a feature to the point map marker", () => {
            const layerId = "marker_point_layer",
                feature = new Feature({
                    geometry: new Point([10, 10])
                });
            let layerFeatures = "";

            mapMarker.addFeatureToMapMarkerLayer(layerId, feature);
            layerFeatures = mapMarker.getMapmarkerLayerById(layerId)?.getSource().getFeatures();

            expect(layerFeatures).to.be.an("array");
            expect(layerFeatures.length).to.equals(1);
        });
    });

    describe("removeMapMarker", () => {
        it("removes all features from marker layer", () => {
            const layerId = "marker_point_layer";

            mapMarker.removeMapMarker(layerId);

            expect(mapMarker.getMapmarkerLayerById(layerId)?.getSource().getFeatures()).to.be.an("array").that.is.empty;
        });
    });
});
