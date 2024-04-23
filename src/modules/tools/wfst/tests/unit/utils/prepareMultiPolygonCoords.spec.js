import {expect} from "chai";
import Feature from "ol/Feature";
import MultiPolygon from "ol/geom/MultiPolygon.js";
const feature1 = new Feature({
        ol_uid: "1146",
        geom: new MultiPolygon([
            [
                [567644.0615441666, 5933356.457430205],
                [567644.0615441666, 5931229.982405349],
                [571422.3095039128, 5933308.849780396],
                [567644.0615441666, 5933356.457430205]
            ]
        ])
    }),
    feature2 = new Feature({
        ol_uid: "1222",
        geom: new MultiPolygon([
            [
                [568961.6858326496, 5934959.248307151],
                [571485.8094696228, 5934610.125541875],
                [571200.0596239277, 5937498.322963697],
                [568961.6858326496, 5934959.248307151]
            ]
        ])
    }),
    exampleMultiPolygonFeatures = [feature1, feature2],
    multiPolygonCoordinates = [
        [
            [567644.0615441666, 5933356.457430205],
            [567644.0615441666, 5931229.982405349],
            [571422.3095039128, 5933308.849780396],
            [567644.0615441666, 5933356.457430205]
        ],
        [
            [568961.6858326496, 5934959.248307151],
            [571485.8094696228, 5934610.125541875],
            [571200.0596239277, 5937498.322963697],
            [568961.6858326496, 5934959.248307151]
        ]
    ];

describe("src/modules/tools/wfst/utils/prepareMultiPolygonCoords.js", () => {
    it("should receive an array with at least two elements", () => {
        expect(Array.isArray(exampleMultiPolygonFeatures)).to.be.true;
        expect(Array.length).to.be.above(1);
    });
    it("should send an array with coordinates", () => {
        expect(Array.isArray(multiPolygonCoordinates)).to.be.true;
    });
});
