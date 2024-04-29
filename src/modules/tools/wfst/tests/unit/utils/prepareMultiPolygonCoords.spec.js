import {expect} from "chai";
import prepareMultiPolygonCoords from "../../../utils/prepareMultiPolygonCoords";

const exampleMultiPolygonFeatures = [
        {
            ol_uid: "187",
            getGeometry: () => ({
                getCoordinates: () => [[[
                    [568596.561029817, 5935514.67088827],
                    [568469.561098397, 5932198.004618157],
                    [571787.4343067454, 5932229.743051363],
                    [568596.561029817, 5935514.67088827]
                ]]],
                intersectsCoordinate: () => false
            })
        },
        {
            ol_uid: "402",
            getGeometry: () => ({
                getCoordinates: () => [[[
                    [569168.0607212072, 5933800.795495101],
                    [569136.3107383522, 5932801.034849086],
                    [569961.8102925824, 5932959.72701512],
                    [569168.0607212072, 5933800.795495101]
                ]]],
                intersectsCoordinate: () => true
            })
        },
        {
            ol_uid: "323",
            getGeometry: () => ({
                getCoordinates: () => [[[
                    [567596.4365698842, 5932198.004618157],
                    [567596.4365698842, 5929151.115030301],
                    [569501.4355411849, 5929278.0687631285],
                    [567596.4365698842, 5932198.004618157]
                ]]],
                intersectsCoordinate: () => false
            })
        }
    ],
    exampleMultiPolygonCoordinates = [
        [
            [
                [568596.561029817, 5935514.67088827],
                [568469.561098397, 5932198.004618157],
                [571787.4343067454, 5932229.743051363],
                [568596.561029817, 5935514.67088827]
            ],
            [
                [567596.4365698842, 5932198.004618157],
                [567596.4365698842, 5929151.115030301],
                [569501.4355411849, 5929278.0687631285],
                [567596.4365698842, 5932198.004618157]
            ]
        ],
        [
            [
                [567596.4365698842, 5932198.004618157],
                [567596.4365698842, 5929151.115030301],
                [569501.4355411849, 5929278.0687631285],
                [567596.4365698842, 5932198.004618157]
            ]
        ]
    ];

describe("src/modules/tools/wfst/utils/prepareMultiPolygonCoords.js", () => {
    it("should receive an array with at least two elements", () => {
        expect(Array.isArray(exampleMultiPolygonFeatures)).to.be.true;
        expect(exampleMultiPolygonFeatures.length).to.be.above(1);
    });

    it("should create nested array of coordinates of MultiPolygons and their holes", () => {
        const result = prepareMultiPolygonCoords(exampleMultiPolygonFeatures);

        expect(result).to.deep.equal(exampleMultiPolygonCoordinates);
    });

    it("should send an array with coordinates", () => {
        expect(Array.isArray(exampleMultiPolygonCoordinates)).to.be.true;
    });
});
