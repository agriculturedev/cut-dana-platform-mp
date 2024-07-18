import {expect} from "chai";
import sinon from "sinon";
import placingAdditionalPolygonMarker from "../../multipleHighlighting";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import store from "../../../app-store";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import Collection from "ol/Collection";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";
import stateAlerting from "../../../modules/alerting/store/stateAlerting";

describe("src/utils/multipleHighlighting.js", () => {
    let styleListStub, createStyleStub, mapOL, feature;

    before(() => {
        mapCollection.clear();
        mapOL = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.spy(),
            removeInteraction: sinon.spy(),
            addLayer: () => sinon.spy(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000],
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            },
            getLayers: () => {
                return new Collection();
            }
        };

        mapCollection.addMap(mapOL, "2D");
    });

    beforeEach(() => {
        styleListStub = sinon.stub(styleList, "returnStyleObject").returns({
            styleId: "defaultAdditionalMapMarkerPolygon",
            rules: [
                {
                    "style": {
                        "polygonStrokeColor": [
                            255,
                            255,
                            0,
                            1
                        ],
                        "polygonStrokeWidth": 4,
                        "polygonFillColor": [
                            255,
                            255,
                            0,
                            0.3
                        ],
                        "polygonStrokeDash": [
                            8
                        ]
                    }
                }
            ]
        });
        createStyleStub = sinon.stub(createStyle, "createStyle");
        sinon.stub(store, "commit");
        sinon.stub(store, "dispatch");
        sinon.stub(store, "getters");
        sinon.stub(store, "state").value({
            Maps: {
                layers: []
            },
            MapMarker: {
                pointStyleId: "defaultMapMarkerPoint",
                polygonStyleId: "defaultMapMarkerPolygon",
                additionalPolygonStyleId: "defaultAdditionalMapMarkerPolygon",
                markerPoint: new VectorLayer({
                    id: "marker_point_layer",
                    name: "markerPoint",
                    source: new VectorSource(),
                    visible: false,
                    style: new Style(),
                    alwaysOnTop: true,
                    altitudeMode: "absolute"
                }),
                markerPolygon: new VectorLayer({
                    id: "marker_polygon_layer",
                    name: "markerPolygon",
                    source: new VectorSource(),
                    visible: false,
                    style: new Style(),
                    alwaysOnTop: true,
                    altitudeMode: "relativeToGround"
                }),
                coordinates: []
            },
            Alerting: {
                ...stateAlerting
            }
        });

        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getModelsByAttributes") {
                    ret = [store.getters["MapMarker/markerPolygon"]];
                }
            });
            return ret;
        });

        feature = new Feature({
            geometry: new Polygon([
                [
                    [
                        [
                            564370.724,
                            5934671.653,
                            0
                        ],
                        [
                            564506.191,
                            5934485.386,
                            0
                        ],
                        [
                            564265.949,
                            5934044.06,
                            0
                        ],
                        [
                            564088.148,
                            5934167.886,
                            0
                        ],
                        [
                            564370.724,
                            5934671.653,
                            0
                        ]
                    ]
                ]
            ])
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should create a style when features are provided", () => {
        placingAdditionalPolygonMarker([feature], true);

        expect(styleListStub.calledOnce).to.be.true;
        expect(createStyleStub.calledOnce).to.be.true;
    });

    it("should not create a style when no features are provided", () => {
        placingAdditionalPolygonMarker([], true);

        expect(styleListStub.calledOnce).to.be.true;
        expect(createStyleStub.called).to.be.false;
    });
});
